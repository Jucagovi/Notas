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
   * Si la clase es flexibilizada, combina las sesiones de ambos módulos en Horarios.
   */
  const generarPropuesta = useCallback(
    async ({
      idCurso,
      idModulo,
      idModuloFlexible = null,
      temporizaciones = [],
      anioSeleccionado = null
    }) => {
      if (!idCurso || !idModulo || !temporizaciones || temporizaciones.length === 0) {
        return null;
      }

      setCargando(true);
      setError(null);

      try {
        // Se determina si existe un módulo flexibilizado asociado al curso actual.
        let flexibleId = idModuloFlexible;
        if (!flexibleId) {
          const cursosPrevios = await obtenerCursos('*', (q) => q.eq('id_curso', idCurso));
          const cursoEncontrado = (cursosPrevios || []).find((c) => c.id_curso === idCurso);
          flexibleId = cursoEncontrado?.id_modulo_flexible || null;
        }

        // Modificador condicional para consultar los horarios lectivos unificados de ambos módulos.
        const filtroHorarios = (q) => {
          if (flexibleId) {
            return q.or(`id_modulo.eq.${idModulo},id_modulo.eq.${flexibleId}`);
          }
          return q.eq('id_modulo', idModulo);
        };

        // 1. Consulta paralela de las fuentes de datos necesarias.
        const [
          rasModulo,
          pesosRaCurso,
          relacionesDesarrollan,
          eventosCalendario,
          horariosClase,
          datosCursos
        ] = await Promise.all([
          obtenerRA('*', (q) => q.eq('id_modulo', idModulo).order('numero', { ascending: true })),
          obtenerRaCurso('*', (q) => q.eq('id_curso', idCurso)),
          obtenerDesarrollan('*'),
          obtenerEventos('*'),
          obtenerHorarios('*', filtroHorarios),
          obtenerCursos('*', (q) => q.eq('id_curso', idCurso))
        ]);

        const cursoActual = (datosCursos || []).find((c) => c.id_curso === idCurso) || null;
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

        // 4. Determinación de los días de la semana con clase según Horarios.
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

        // 5. Cálculo del listado completo de fechas lectivas del curso.
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
        const numRAs = listaRAs.length;

        // Mapa de datos informativos de cada RA
        const mapaInfoRA = new Map();
        listaRAs.forEach((ra) => {
          mapaInfoRA.set(ra.id_ra, ra);
        });

        // Mapa de peso oficial de cada RA (obtenido de ra_curso o equitativo si no está definido)
        const mapaPesosRA = new Map();
        listaRAs.forEach((ra) => {
          const registroPeso = (pesosRaCurso || []).find((p) => p.id_ra === ra.id_ra);
          const pesoDefinido = Number(registroPeso?.peso);
          mapaPesosRA.set(
            ra.id_ra,
            !isNaN(pesoDefinido) && pesoDefinido > 0 ? pesoDefinido : numRAs > 0 ? 100 / numRAs : 10
          );
        });

        // Contabilización de cuántas UTs desarrollan cada RA (para fallback equitativo)
        const mapaConteoUtPorRa = new Map();
        (relacionesDesarrollan || []).forEach((rel) => {
          if (mapaPesosRA.has(rel.id_ra)) {
            mapaConteoUtPorRa.set(rel.id_ra, (mapaConteoUtPorRa.get(rel.id_ra) || 0) + 1);
          }
        });

        // Asignación de peso bruto a cada UT según los RAs que desarrolla y sus porcentajes explícitos
        const pesosBrutosUT = new Map();
        let totalUtsConRAs = 0;

        unidadesOrdenadas.forEach((temp) => {
          const idUt = temp.id_ut;
          const rasDeEstaUt = (relacionesDesarrollan || []).filter((rel) => rel.id_ut === idUt);

          let pesoAcumulado = 0;
          if (rasDeEstaUt.length > 0) {
            totalUtsConRAs += 1;
            rasDeEstaUt.forEach((rel) => {
              const pesoTotalRa = mapaPesosRA.get(rel.id_ra) || 0;
              const pctEspecifico = Number(rel.porcentaje);

              if (!isNaN(pctEspecifico) && pctEspecifico > 0) {
                // Ponderación explícita según el porcentaje que la UT cubre de este RA
                pesoAcumulado += pesoTotalRa * (pctEspecifico / 100);
              } else {
                // Fallback: prorrateo equitativo entre las UTs que lo desarrollan
                const cantidadUts = mapaConteoUtPorRa.get(rel.id_ra) || 1;
                pesoAcumulado += pesoTotalRa / cantidadUts;
              }
            });
          }

          // Si una UT no tiene RAs asociados todavía en desarrollan, se le otorga un peso mínimo base.
          if (pesoAcumulado <= 0) {
            pesoAcumulado = numRAs > 0 ? 100 / unidadesOrdenadas.length : 10;
          }

          pesosBrutosUT.set(idUt, pesoAcumulado);
        });

        // Normalización matemática para que la suma total sea exactamente 100%
        const sumaBruta = Array.from(pesosBrutosUT.values()).reduce((acc, v) => acc + v, 0);
        const porcentajesFinales = new Map();
        let sumaPorcentajes = 0;

        unidadesOrdenadas.forEach((temp) => {
          const bruto = pesosBrutosUT.get(temp.id_ut) || 1;
          const pct = Math.max(1, Math.round((bruto / sumaBruta) * 100));
          porcentajesFinales.set(temp.id_ut, pct);
          sumaPorcentajes += pct;
        });

        // Ajuste fino del porcentaje para cuadrar exactamente en 100
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

        // 8. Asignación de rangos de fechas y colores a cada Unidad de Trabajo.
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

          const utMeta = {
            id_temporizacion: temp.id_temporizacion,
            id_ut: temp.id_ut,
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
