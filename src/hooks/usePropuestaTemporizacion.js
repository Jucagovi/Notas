import { useState, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import {
  parsearFechaISO,
  formatearFechaISO,
  extraerAnioInicioCurso
} from '../utils/fechas.js';

// Paleta cromática accesible para diferenciar visualmente cada Unidad de Trabajo en el calendario.
export const PALETA_COLORES_UT = [
  { fondo: '#2563EB', texto: '#ffffff', nombre: 'Azul' },
  { fondo: '#059669', texto: '#ffffff', nombre: 'Esmeralda' },
  { fondo: '#D97706', texto: '#ffffff', nombre: 'Ámbar' },
  { fondo: '#7C3AED', texto: '#ffffff', nombre: 'Violeta' },
  { fondo: '#DB2777', texto: '#ffffff', nombre: 'Rosa' },
  { fondo: '#0891B2', texto: '#ffffff', nombre: 'Cian' },
  { fondo: '#EA580C', texto: '#ffffff', nombre: 'Naranja' },
  { fondo: '#0D9488', texto: '#ffffff', nombre: 'Teal' },
  { fondo: '#4F46E5', texto: '#ffffff', nombre: 'Índigo' },
  { fondo: '#65A30D', texto: '#ffffff', nombre: 'Lima' },
  { fondo: '#C026D3', texto: '#ffffff', nombre: 'Fucsia' },
  { fondo: '#0284C7', texto: '#ffffff', nombre: 'Azul Cielo' },
  { fondo: '#CA8A04', texto: '#ffffff', nombre: 'Dorado' },
  { fondo: '#9333EA', texto: '#ffffff', nombre: 'Púrpura' },
  { fondo: '#16A34A', texto: '#ffffff', nombre: 'Verde' },
  { fondo: '#475569', texto: '#ffffff', nombre: 'Pizarra' }
];

/**
 * usePropuestaTemporizacion - Custom Hook para calcular la temporización estimada por ponderación de RA.
 *
 * Responsabilidad Única: Consultar las tablas curriculares (RA, ra_curso, desarrollan),
 * el calendario escolar y el horario lectivo para distribuir proporcionalmente los días
 * lectivos entre las Unidades de Trabajo según el peso de los RA asociados.
 */
export const usePropuestaTemporizacion = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [propuesta, setPropuesta] = useState(null);

  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerRaCurso } = useDatos('ra_curso');
  const { obtenerDatos: obtenerDesarrollan } = useDatos('desarrollan');
  const { obtenerDatos: obtenerEventos } = useDatos('Calendario_Eventos');
  const { obtenerDatos: obtenerHorarios } = useDatos('Horarios');
  const { obtenerDatos: obtenerCursos } = useDatos('Cursos');

  /**
   * Genera la propuesta de fechas estimadas para las unidades de trabajo dadas.
  /**
   * Genera la propuesta de fechas estimadas para las unidades de trabajo dadas.
   * Si la clase es flexibilizada, combina las sesiones de ambos módulos en Horarios y cuenta todas las horas semanales.
   */
  const generarPropuesta = useCallback(
    async ({
      idCurso,
      idModulo,
      idModuloFlexible = null,
      idCursoSecundario = null,
      temporizaciones = [],
      anioSeleccionado = null
    }) => {
      if (!idCurso || !idModulo || !temporizaciones || temporizaciones.length === 0) {
        return null;
      }

      setCargando(true);
      setError(null);

      try {
        // Se determina si existe un módulo flexibilizado consultando la tabla Cursos en la columna "id_modulo_flexible".
        const cursosPrevios = await obtenerCursos('*', (q) => q.eq('id_curso', idCurso));
        const cursoEncontrado = (cursosPrevios || []).find((c) => c.id_curso === idCurso);
        const flexibleId = cursoEncontrado?.id_modulo_flexible || idModuloFlexible || null;
        let idCursoSec = idCursoSecundario;

        const idsModulos = [idModulo];
        if (flexibleId && !idsModulos.includes(flexibleId)) {
          idsModulos.push(flexibleId);
        }
        (temporizaciones || []).forEach((t) => {
          const modId = t.id_modulo || t.unidad_trabajo?.id_modulo;
          if (modId && !idsModulos.includes(modId)) {
            idsModulos.push(modId);
          }
        });

        // Modificador condicional para consultar los horarios lectivos unificados de ambos módulos.
        const filtroHorarios = (q) => {
          if (idsModulos.length > 1) {
            return q.or(idsModulos.map((m) => `id_modulo.eq.${m}`).join(','));
          }
          return q.eq('id_modulo', idModulo);
        };

        const idsCursos = [idCurso];
        if (idCursoSec && idCursoSec !== idCurso) {
          idsCursos.push(idCursoSec);
        }

        // 1. Consulta paralela de las fuentes de datos necesarias.
        const [
          rasModulo,
          pesosRaCurso,
          relacionesDesarrollan,
          eventosCalendario,
          horariosClase,
          datosCursos
        ] = await Promise.all([
          obtenerRA('*', (q) => q.in('id_modulo', idsModulos).order('numero', { ascending: true })),
          obtenerRaCurso('*', (q) => q.in('id_curso', idsCursos)),
          obtenerDesarrollan('*'),
          obtenerEventos('*'),
          obtenerHorarios('*', filtroHorarios),
          obtenerCursos('*', (q) => q.in('id_curso', idsCursos))
        ]);

        const cursoActual = (datosCursos || []).find((c) => c.id_curso === idCurso) || (datosCursos || [])[0] || null;
        const anioInicio = anioSeleccionado ? Number(anioSeleccionado) : extraerAnioInicioCurso(cursoActual);

        // 2. Determinación de las fechas límites oficiales del período escolar.
        let fechaInicioPeriodo = cursoActual?.fecha_inicio
          ? parsearFechaISO(cursoActual.fecha_inicio)
          : new Date(anioInicio, 8, 15); // Por defecto: 15 de septiembre.

        let fechaFinPeriodo = cursoActual?.fecha_fin
          ? parsearFechaISO(cursoActual.fecha_fin)
          : new Date(anioInicio + 1, 5, 22); // Por defecto: 22 de junio.

        if (!fechaInicioPeriodo || isNaN(fechaInicioPeriodo.getTime())) {
          fechaInicioPeriodo = new Date(anioInicio, 8, 15);
        }
        if (!fechaFinPeriodo || isNaN(fechaFinPeriodo.getTime())) {
          fechaFinPeriodo = new Date(anioInicio + 1, 5, 22);
        }

        // 3. Creación del conjunto de días festivos y no lectivos.
        const conjuntoNoLectivos = new Set();
        (eventosCalendario || []).forEach((ev) => {
          if (ev.es_lectivo === false && ev.fecha_inicio) {
            const ini = parsearFechaISO(ev.fecha_inicio);
            const fin = ev.fecha_fin ? parsearFechaISO(ev.fecha_fin) : ini;
            if (ini && fin && !isNaN(ini.getTime()) && !isNaN(fin.getTime())) {
              const iter = new Date(ini);
              while (iter <= fin) {
                conjuntoNoLectivos.add(formatearFechaISO(iter));
                iter.setDate(iter.getDate() + 1);
              }
            }
          }
        });

        // 4. Determinación de los días de la semana con clase según Horarios y cómputo de horas semanales.
        const horariosModuloA = (horariosClase || []).filter((h) => h.id_modulo === idModulo);
        const horariosModuloB = flexibleId
          ? (horariosClase || []).filter((h) => h.id_modulo === flexibleId)
          : [];

        const horasSemanaA = horariosModuloA.length;
        const horasSemanaB = horariosModuloB.length;
        const totalHorasSemana = horasSemanaA + horasSemanaB;

        const diasSemanaConClase = new Set();
        (horariosClase || []).forEach((h) => {
          if (h.dia_semana) {
            diasSemanaConClase.add(Number(h.dia_semana));
          }
        });

        // Si no existen horarios registrados específicamente, se asumen de lunes a viernes (1 a 5).
        if (diasSemanaConClase.size === 0) {
          [1, 2, 3, 4, 5].forEach((d) => diasSemanaConClase.add(d));
        }

        // 5. Cálculo del listado completo de fechas lectivas del curso unificando los días de ambos módulos.
        const diasClase = [];
        const iterFecha = new Date(fechaInicioPeriodo);

        while (iterFecha <= fechaFinPeriodo) {
          const jsDay = iterFecha.getDay(); // 0 = Domingo, 1 = Lunes... 6 = Sábado
          const diaSemana = jsDay === 0 ? 7 : jsDay;
          const fechaISO = formatearFechaISO(iterFecha);

          // Se excluyen sábados y domingos
          if (diaSemana !== 6 && diaSemana !== 7) {
            // Se excluyen días marcados como no lectivos en el calendario
            if (!conjuntoNoLectivos.has(fechaISO)) {
              // Se verifica si el horario contempla docencia este día de la semana
              if (diasSemanaConClase.has(diaSemana)) {
                diasClase.push({
                  fechaISO,
                  date: new Date(iterFecha)
                });
              }
            }
          }

          iterFecha.setDate(iterFecha.getDate() + 1);
        }

        const totalDiasLectivos = diasClase.length;
        if (totalDiasLectivos === 0) {
          throw new Error('No se han detectado días lectivos en el calendario escolar para el rango del curso.');
        }

        // 6. Ponderación de pesos por Unidad de Trabajo según los Resultados de Aprendizaje.
        const unidadesOrdenadas = [...temporizaciones].sort((a, b) => a.orden - b.orden);
        const listaRAs = rasModulo || [];

        // Mapa de datos informativos de cada RA
        const mapaInfoRA = new Map();
        listaRAs.forEach((ra) => {
          mapaInfoRA.set(ra.id_ra, ra);
        });

        // Mapa de peso oficial de cada RA (obtenido de ra_curso o equitativo si no está definido)
        const mapaPesosRA = new Map();
        idsModulos.forEach((modId) => {
          const rasDelMod = listaRAs.filter((r) => r.id_modulo === modId);
          const numRAsMod = rasDelMod.length;
          rasDelMod.forEach((ra) => {
            const registroPeso = (pesosRaCurso || []).find((p) => p.id_ra === ra.id_ra);
            const pesoDefinido = Number(registroPeso?.peso);
            mapaPesosRA.set(
              ra.id_ra,
              !isNaN(pesoDefinido) && pesoDefinido > 0 ? pesoDefinido : numRAsMod > 0 ? 100 / numRAsMod : 10
            );
          });
        });

        // Contabilización de cuántas UTs desarrollan cada RA
        const mapaConteoUtPorRa = new Map();
        (relacionesDesarrollan || []).forEach((rel) => {
          if (mapaPesosRA.has(rel.id_ra)) {
            mapaConteoUtPorRa.set(rel.id_ra, (mapaConteoUtPorRa.get(rel.id_ra) || 0) + 1);
          }
        });

        // Separación de unidades por módulo para cálculo proporcional de horas
        const utsModuloA = unidadesOrdenadas.filter(
          (t) => (t.id_modulo || t.unidad_trabajo?.id_modulo) === idModulo
        );
        const utsModuloB = flexibleId
          ? unidadesOrdenadas.filter(
              (t) => (t.id_modulo || t.unidad_trabajo?.id_modulo) === flexibleId
            )
          : [];

        const esDobleModulo = flexibleId && utsModuloA.length > 0 && utsModuloB.length > 0;

        // Proporción de la carga horaria global entre los dos módulos según sus horas semanales en Horarios
        let proporcionA = 1;
        let proporcionB = 0;
        if (esDobleModulo) {
          if (horasSemanaA > 0 && horasSemanaB > 0) {
            proporcionA = horasSemanaA / totalHorasSemana;
            proporcionB = horasSemanaB / totalHorasSemana;
          } else {
            // Reparto equitativo al 50% si no constan horarios específicos aún
            proporcionA = 0.5;
            proporcionB = 0.5;
          }
        }

        // Asignación de peso bruto y cálculo porcentual relativo a cada UT
        const pesosBrutosUT = new Map();
        let totalUtsConRAs = 0;

        const calcularPesosModulo = (listaUts, modId, propModulo) => {
          if (!listaUts || listaUts.length === 0) return;
          const rasDelMod = listaRAs.filter((r) => r.id_modulo === modId);
          const numRAsMod = rasDelMod.length;

          listaUts.forEach((temp) => {
            const idUt = temp.id_ut;
            const rasDeEstaUt = (relacionesDesarrollan || []).filter((rel) => rel.id_ut === idUt);

            let pesoAcumulado = 0;
            if (rasDeEstaUt.length > 0) {
              totalUtsConRAs += 1;
              rasDeEstaUt.forEach((rel) => {
                const pesoTotalRa = mapaPesosRA.get(rel.id_ra) || 0;
                const pctEspecifico = Number(rel.porcentaje);

                if (!isNaN(pctEspecifico) && pctEspecifico > 0) {
                  pesoAcumulado += pesoTotalRa * (pctEspecifico / 100);
                } else {
                  const cantidadUts = mapaConteoUtPorRa.get(rel.id_ra) || 1;
                  pesoAcumulado += pesoTotalRa / cantidadUts;
                }
              });
            }

            if (pesoAcumulado <= 0) {
              pesoAcumulado = numRAsMod > 0 ? 100 / listaUts.length : 10;
            }

            pesosBrutosUT.set(idUt, pesoAcumulado);
          });
        };

        if (esDobleModulo) {
          calcularPesosModulo(utsModuloA, idModulo, proporcionA);
          calcularPesosModulo(utsModuloB, flexibleId, proporcionB);
        } else {
          calcularPesosModulo(unidadesOrdenadas, idModulo, 1);
        }

        // Normalización matemática respetando la bolsa horaria semanal de cada módulo
        const porcentajesFinales = new Map();

        const normalizarModulo = (listaUts, propModulo) => {
          if (!listaUts || listaUts.length === 0) return;
          const sumaBrutaModulo = listaUts.reduce(
            (acc, temp) => acc + (pesosBrutosUT.get(temp.id_ut) || 1),
            0
          );

          listaUts.forEach((temp) => {
            const bruto = pesosBrutosUT.get(temp.id_ut) || 1;
            const pct = Math.max(1, Math.round((bruto / sumaBrutaModulo) * (propModulo * 100)));
            porcentajesFinales.set(temp.id_ut, pct);
          });
        };

        if (esDobleModulo) {
          normalizarModulo(utsModuloA, proporcionA);
          normalizarModulo(utsModuloB, proporcionB);
        } else {
          normalizarModulo(unidadesOrdenadas, 1);
        }

        // Ajuste fino del porcentaje para cuadrar exactamente en 100%
        let sumaPorcentajes = 0;
        unidadesOrdenadas.forEach((temp) => {
          sumaPorcentajes += porcentajesFinales.get(temp.id_ut) || 1;
        });

        const diferenciaPorcentaje = 100 - sumaPorcentajes;
        if (diferenciaPorcentaje !== 0 && unidadesOrdenadas.length > 0) {
          const ultimaUt = unidadesOrdenadas[unidadesOrdenadas.length - 1];
          const valorPrevio = porcentajesFinales.get(ultimaUt.id_ut) || 1;
          porcentajesFinales.set(ultimaUt.id_ut, Math.max(1, valorPrevio + diferenciaPorcentaje));
        }

        // 7. Reparto secuencial de los días lectivos entre las UTs.
        const diasPorUt = new Map();
        let diasAsignadosTotal = 0;

        unidadesOrdenadas.forEach((temp) => {
          const pct = porcentajesFinales.get(temp.id_ut) || 1;
          const numDias = Math.max(1, Math.round(totalDiasLectivos * (pct / 100)));
          diasPorUt.set(temp.id_ut, numDias);
          diasAsignadosTotal += numDias;
        });

        // Ajuste en el número de días para cuadrar con el total exacto de días lectivos
        const diferenciaDias = totalDiasLectivos - diasAsignadosTotal;
        if (diferenciaDias !== 0 && unidadesOrdenadas.length > 0) {
          const ultimaUt = unidadesOrdenadas[unidadesOrdenadas.length - 1];
          const diasPrevios = diasPorUt.get(ultimaUt.id_ut) || 1;
          diasPorUt.set(ultimaUt.id_ut, Math.max(1, diasPrevios + diferenciaDias));
        }

        // 8. Asignación de rangos de fechas y colores a cada Unidad de Trabajo en secuencia lectiva.
        let indiceDiaActual = 0;
        const unidadesPropuestas = [];
        const mapaFechaUt = new Map();

        unidadesOrdenadas.forEach((temp, idx) => {
          const numDias = diasPorUt.get(temp.id_ut) || 1;
          const indiceFin = Math.min(indiceDiaActual + numDias - 1, totalDiasLectivos - 1);

          const fechaIniPrevista = diasClase[indiceDiaActual].fechaISO;
          const fechaFinPrevista = diasClase[indiceFin].fechaISO;

          const color = PALETA_COLORES_UT[idx % PALETA_COLORES_UT.length];
          const diasDeEstaUt = diasClase.slice(indiceDiaActual, indiceFin + 1);

          const rasDeEstaUt = (relacionesDesarrollan || []).filter((rel) => rel.id_ut === temp.id_ut);
          const rasDesarrollados = rasDeEstaUt.map((rel) => {
            const infoRa = mapaInfoRA.get(rel.id_ra);
            return {
              id_ra: rel.id_ra,
              numero: infoRa?.numero,
              nombre: infoRa?.nombre,
              porcentaje: rel.porcentaje !== null && rel.porcentaje !== undefined ? Number(rel.porcentaje) : 100,
              pesoRa: mapaPesosRA.get(rel.id_ra) || 0
            };
          });

          const moduloSiglas = temp.moduloSiglas || temp.unidad_trabajo?.moduloSiglas || '';
          const moduloNombre = temp.moduloNombre || temp.unidad_trabajo?.moduloNombre || '';
          const esModuloSecundario = Boolean(temp.esModuloSecundario || temp.unidad_trabajo?.esModuloSecundario);

          const utMeta = {
            id_temporizacion: temp.id_temporizacion,
            id_ut: temp.id_ut,
            id_modulo: temp.id_modulo || temp.unidad_trabajo?.id_modulo,
            moduloSiglas,
            moduloNombre,
            esModuloSecundario,
            orden: temp.orden,
            unidad_trabajo: temp.unidad_trabajo,
            porcentaje: porcentajesFinales.get(temp.id_ut) || 0,
            numDias,
            fecha_ini_prevista: fechaIniPrevista,
            fecha_fin_prevista: fechaFinPrevista,
            color,
            diasISO: diasDeEstaUt.map((d) => d.fechaISO),
            rasDesarrollados
          };

          unidadesPropuestas.push(utMeta);

          // Indexación de cada fecha lectiva para consulta ágil en la cuadrícula de meses
          diasDeEstaUt.forEach((d) => {
            mapaFechaUt.set(d.fechaISO, {
              id_ut: temp.id_ut,
              orden: temp.orden,
              numero: temp.unidad_trabajo?.numero || temp.orden,
              nombre: temp.unidad_trabajo?.nombre || 'Unidad de Trabajo',
              moduloSiglas,
              moduloNombre,
              color,
              fecha_ini_prevista: fechaIniPrevista,
              fecha_fin_prevista: fechaFinPrevista
            });
          });

          indiceDiaActual = indiceFin + 1;
        });

        const resultado = {
          anioInicio,
          fechaInicioPeriodo: formatearFechaISO(fechaInicioPeriodo),
          fechaFinPeriodo: formatearFechaISO(fechaFinPeriodo),
          totalDiasLectivos,
          horasSemanaA,
          horasSemanaB,
          totalHorasSemana,
          esFlexibilizado: Boolean(flexibleId),
          unidadesPropuestas,
          mapaFechaUt,
          conjuntoNoLectivos,
          diasClase,
          hayVinculosDesarrollan: totalUtsConRAs > 0
        };

        setPropuesta(resultado);
        return resultado;
      } catch (err) {
        console.error('Error al generar la propuesta de temporización:', err);
        const mensaje = err?.message || 'Error al calcular la propuesta de temporización.';
        setError(mensaje);
        return null;
      } finally {
        setCargando(false);
      }
    },
    [obtenerRA, obtenerRaCurso, obtenerDesarrollan, obtenerEventos, obtenerHorarios, obtenerCursos]
  );

  return {
    propuesta,
    cargando,
    error,
    generarPropuesta,
    limpiarPropuesta: () => setPropuesta(null)
  };
};

export default usePropuestaTemporizacion;
