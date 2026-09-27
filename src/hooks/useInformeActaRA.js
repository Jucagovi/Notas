import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';

/**
 * useInformeActaRA - Custom Hook para la obtención y cálculo del Acta de Evaluación por RA.
 *
 * Responsabilidad Única: Orquestar la obtención de los Resultados de Aprendizaje de un módulo,
 * las ponderaciones curriculares del curso (ra_curso y ce_curso) y las calificaciones obtenidas
 * por los discentes en las actividades evaluadas, calculando las notas de Evaluación Continua
 * y Evaluación Final Ordinaria.
 *
 * Delega la carga computacional intentando ejecutar la función RPC `calcular_acta_ra` en Supabase;
 * en caso de que dicha función no se encuentre desplegada en el servidor, realiza el cálculo
 * local íntegro utilizando el hook genérico useDatos.
 *
 * @param {string|null} idCurso - Identificador de la clase o curso escolar.
 * @param {string|null} idModulo - Identificador del módulo formativo.
 */
const useInformeActaRA = (idCurso = null, idModulo = null) => {
  // Instancias del hook useDatos para acceder a las tablas maestras y de relaciones
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerRaCurso } = useDatos('ra_curso');
  const { obtenerDatos: obtenerCE } = useDatos('CE');
  const { obtenerDatos: obtenerCeCurso } = useDatos('ce_curso');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerTrabajan } = useDatos('trabajan');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');

  // Estados locales para la lista procesada de discentes, RAs, estado de carga y errores
  const [discentes, setDiscentes] = useState([]);
  const [ras, setRas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Procesa las calificaciones de los discentes aplicando la lógica de negocio para
   * Evaluación Continua (reescalado de RAs completos) y Evaluación Final (ponderación global al 100%).
   *
   * @param {Array<Object>} listaDiscentes - Lista de discentes con su mapa de calificaciones por RA.
   * @param {Array<Object>} listaRas - Lista de Resultados de Aprendizaje con sus pesos en el curso.
   * @returns {Array<Object>} Lista de discentes enriquecida con notaContinua y notaFinal.
   */
  const consolidarCalificaciones = useCallback((listaDiscentes, listaRas) => {
    const mapaPesosRa = new Map();
    let sumaPesosCurriculo = 0;

    listaRas.forEach((r) => {
      const peso = Number(r.peso) || 0;
      mapaPesosRa.set(r.id_ra, peso);
      sumaPesosCurriculo += peso;
    });

    // Si los pesos no suman 100 o no están configurados, se asume 100 como base estándar
    const divisorCurriculo = sumaPesosCurriculo > 0 ? sumaPesosCurriculo : 100;

    return listaDiscentes.map((d) => {
      let sumaPonderadaContinua = 0;
      let sumaPesosContinua = 0;
      let sumaPonderadaFinal = 0;
      let rasCompletados = 0;

      const notasRA = {};

      listaRas.forEach((r) => {
        const calif = d.calificaciones_ra ? d.calificaciones_ra[r.id_ra] : null;
        const nota = calif && calif.nota !== null && calif.nota !== undefined ? Number(calif.nota) : null;
        const completo = Boolean(calif && calif.completo);

        notasRA[r.id_ra] = {
          id_ra: r.id_ra,
          numero: r.numero,
          nota,
          completo
        };

        const pesoRA = mapaPesosRa.get(r.id_ra) || 0;

        // Modo Evaluación Continua: solo se computan los RAs completados en su totalidad
        if (completo && nota !== null) {
          sumaPonderadaContinua += nota * pesoRA;
          sumaPesosContinua += pesoRA;
          rasCompletados++;
        }

        // Modo Evaluación Final: se pondera cada RA; lo no evaluado computa como cero
        if (nota !== null) {
          sumaPonderadaFinal += nota * pesoRA;
        }
      });

      // Cálculo de nota de Evaluación Continua reescalando temporalmente al 100%
      const notaContinua =
        sumaPesosContinua > 0
          ? Math.min(100, Math.max(0, Math.round(sumaPonderadaContinua / sumaPesosContinua)))
          : null;

      // Cálculo de nota de Evaluación Final Ordinaria sobre el currículo total
      const notaFinal =
        listaRas.length > 0
          ? Math.min(100, Math.max(0, Math.round(sumaPonderadaFinal / divisorCurriculo)))
          : null;

      const nombreLimpio = d.nombre || '';
      const apellidosLimpios = d.apellidos || '';
      const nombreCompleto = apellidosLimpios
        ? `${apellidosLimpios}, ${nombreLimpio}`
        : nombreLimpio;

      return {
        ...d,
        nombreCompleto,
        notasRA,
        notaContinua,
        notaFinal,
        rasCompletados,
        totalRAs: listaRas.length
      };
    });
  }, []);

  /**
   * Cálculo fallback ejecutado en el cliente en caso de que la función RPC no exista en Supabase.
   */
  const calcularActaEnCliente = useCallback(
    async (idCursoActivo, idModuloActivo) => {
      // 1. Se obtienen los discentes matriculados en la clase a través de imparte
      const matriculas = await obtenerImparte(
        'id_discente, id_curso, id_modulo',
        (q) => q.eq('id_curso', idCursoActivo).eq('id_modulo', idModuloActivo)
      );

      const idsDiscentes = [
        ...new Set((matriculas || []).map((m) => m.id_discente).filter(Boolean))
      ];

      if (idsDiscentes.length === 0) {
        setDiscentes([]);
        setRas([]);
        return { discentes: [], ras: [] };
      }

      // 2. Se obtienen los datos personales de los discentes
      const datosDiscentes = await obtenerDiscentes(
        'id_discente, nombre, apellidos, NIA, correo, imagen, activo',
        (q) => q.in('id_discente', idsDiscentes)
      );

      // 3. Se obtienen los Resultados de Aprendizaje del módulo
      const datosRA = await obtenerRA(
        'id_ra, numero, nombre, descripcion, id_modulo',
        (q) => q.eq('id_modulo', idModuloActivo).order('numero', { ascending: true })
      );

      if (!datosRA || datosRA.length === 0) {
        setDiscentes([]);
        setRas([]);
        return { discentes: [], ras: [] };
      }

      const idsRA = datosRA.map((r) => r.id_ra);

      // 4. Se obtienen las ponderaciones de los RA para el curso
      const datosRaCurso = await obtenerRaCurso(
        'id_ra_curso, id_ra, id_curso, peso',
        (q) => q.eq('id_curso', idCursoActivo).in('id_ra', idsRA)
      );

      const mapaPesosRA = new Map();
      (datosRaCurso || []).forEach((rc) => {
        mapaPesosRA.set(rc.id_ra, Number(rc.peso) || 0);
      });

      const listaRasFinal = datosRA.map((r) => ({
        ...r,
        peso: mapaPesosRA.get(r.id_ra) || 0
      }));

      // 5. Se obtienen los Criterios de Evaluación asociados a los RA
      const datosCE = await obtenerCE(
        'id_ce, numero, nombre, descripcion, id_ra',
        (q) => q.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      const idsCE = (datosCE || []).map((c) => c.id_ce);

      // 6. Se obtienen las ponderaciones de los CE para este curso
      let datosCeCurso = [];
      if (idsCE.length > 0) {
        datosCeCurso = await obtenerCeCurso(
          'id_ce_curso, id_ce, id_curso, peso',
          (q) => q.eq('id_curso', idCursoActivo).in('id_ce', idsCE)
        );
      }

      const mapaPesosCE = new Map();
      (datosCeCurso || []).forEach((cc) => {
        mapaPesosCE.set(cc.id_ce, Number(cc.peso) || 0);
      });

      // 7. Se obtienen las versiones de actividades asignadas a este curso
      const datosVersiones = await obtenerVersiones(
        'id_version, enunciado, numero, id_practica, id_curso, id_evaluacion',
        (q) => q.eq('id_curso', idCursoActivo)
      );

      const idsVersiones = (datosVersiones || []).map((v) => v.id_version);

      // 8. Se obtienen las relaciones de cobertura en trabajan
      let datosTrabajan = [];
      if (idsCE.length > 0 && idsVersiones.length > 0) {
        datosTrabajan = await obtenerTrabajan(
          'id_trabajan, id_ce, id_version, porcentaje',
          (q) => q.in('id_ce', idsCE).in('id_version', idsVersiones)
        );
      }

      // 9. Se obtienen las calificaciones de los discentes en evaluan
      let datosEvaluan = [];
      if (idsVersiones.length > 0 && idsDiscentes.length > 0) {
        datosEvaluan = await obtenerEvaluan(
          'id_evaluan, nota, id_version, id_discente',
          (q) => q.in('id_version', idsVersiones).in('id_discente', idsDiscentes)
        );
      }

      // Se estructura un mapa de calificaciones { `${id_discente}_${id_version}`: nota }
      const mapaNotasAlumno = new Map();
      (datosEvaluan || []).forEach((ev) => {
        if (ev.nota !== null && ev.nota !== undefined) {
          mapaNotasAlumno.set(`${ev.id_discente}_${ev.id_version}`, Number(ev.nota));
        }
      });

      // Se agrupan los Criterios por cada Resultado de Aprendizaje
      const mapaCesPorRa = new Map();
      (datosCE || []).forEach((ce) => {
        if (!mapaCesPorRa.has(ce.id_ra)) {
          mapaCesPorRa.set(ce.id_ra, []);
        }
        mapaCesPorRa.get(ce.id_ra).push(ce);
      });

      // Se agrupan las coberturas de trabajan por id_ce
      const mapaTrabajanPorCe = new Map();
      (datosTrabajan || []).forEach((t) => {
        if (!mapaTrabajanPorCe.has(t.id_ce)) {
          mapaTrabajanPorCe.set(t.id_ce, []);
        }
        mapaTrabajanPorCe.get(t.id_ce).push(t);
      });

      // 10. Se calcula para cada discente la calificación de cada CE y de cada RA
      const discentesProcesados = (datosDiscentes || []).map((alumno) => {
        const calificacionesRa = {};

        listaRasFinal.forEach((ra) => {
          const criteriosDelRa = mapaCesPorRa.get(ra.id_ra) || [];
          let sumaNotasCe = 0;
          let sumaPesosCe = 0;
          let cantidadCriteriosEvaluados = 0;
          let todosCriteriosCompletos = criteriosDelRa.length > 0;

          criteriosDelRa.forEach((ce) => {
            const pesoCe = mapaPesosCE.get(ce.id_ce) || (100 / (criteriosDelRa.length || 1));
            const actividadesCe = mapaTrabajanPorCe.get(ce.id_ce) || [];

            let sumaAportesCe = 0;
            let coberturaEvaluadaCe = 0;

            actividadesCe.forEach((t) => {
              const claveNota = `${alumno.id_discente}_${t.id_version}`;
              if (mapaNotasAlumno.has(claveNota)) {
                const notaActividad = mapaNotasAlumno.get(claveNota);
                const porcentaje = Number(t.porcentaje) || 0;
                sumaAportesCe += notaActividad * (porcentaje / 100);
                coberturaEvaluadaCe += porcentaje;
              }
            });

            const ceTieneNota = coberturaEvaluadaCe > 0;
            if (ceTieneNota) {
              const notaFinalCe = Math.min(100, Math.round(sumaAportesCe));
              sumaNotasCe += notaFinalCe * pesoCe;
              sumaPesosCe += pesoCe;
              cantidadCriteriosEvaluados++;
            }

            // Un CE se considera completo si la cobertura evaluada alcanza al menos el 100%
            const ceCompleto = coberturaEvaluadaCe >= 100;
            if (!ceCompleto) {
              todosCriteriosCompletos = false;
            }
          });

          // Cálculo de la nota del RA
          let notaRa = null;
          if (sumaPesosCe > 0 && cantidadCriteriosEvaluados > 0) {
            notaRa = Math.min(100, Math.max(0, Math.round(sumaNotasCe / sumaPesosCe)));
          }

          calificacionesRa[ra.id_ra] = {
            id_ra: ra.id_ra,
            nota: notaRa,
            completo: Boolean(todosCriteriosCompletos && criteriosDelRa.length > 0)
          };
        });

        return {
          id_discente: alumno.id_discente,
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          nia: alumno.NIA || alumno.nia,
          correo: alumno.correo,
          imagen: alumno.imagen,
          activo: alumno.activo,
          calificaciones_ra: calificacionesRa
        };
      });

      // Se ordenan alfabéticamente por apellidos y nombre
      discentesProcesados.sort((a, b) =>
        (a.apellidos || '').localeCompare(b.apellidos || '', 'es') ||
        (a.nombre || '').localeCompare(b.nombre || '', 'es')
      );

      const discentesFinales = consolidarCalificaciones(discentesProcesados, listaRasFinal);

      setRas(listaRasFinal);
      setDiscentes(discentesFinales);
      return { discentes: discentesFinales, ras: listaRasFinal };
    },
    [
      obtenerImparte,
      obtenerDiscentes,
      obtenerRA,
      obtenerRaCurso,
      obtenerCE,
      obtenerCeCurso,
      obtenerVersiones,
      obtenerTrabajan,
      obtenerEvaluan,
      consolidarCalificaciones
    ]
  );

  /**
   * Carga principal del acta de evaluación. Intenta ejecutar la función RPC en Supabase
   * y conmuta al cálculo en cliente si la función no se encuentra en el servidor.
   */
  const cargarActa = useCallback(
    async (idCursoActivo = idCurso, idModuloActivo = idModulo) => {
      if (!idCursoActivo || !idModuloActivo) {
        setDiscentes([]);
        setRas([]);
        setCargando(false);
        setError(null);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        // 1. Intento de ejecución mediante la función RPC delegada en Supabase
        const { data: dataRpc, error: errorRpc } = await supabase.rpc('calcular_acta_ra', {
          p_id_curso: idCursoActivo,
          p_id_modulo: idModuloActivo
        });

        // Si la llamada RPC fue exitosa y devolvió datos válidos
        if (!errorRpc && dataRpc && (dataRpc.discentes || dataRpc.ras)) {
          const listaRas = dataRpc.ras || [];
          const listaDiscentes = dataRpc.discentes || [];

          // Se ordenan alfabéticamente por apellidos y nombre
          listaDiscentes.sort((a, b) =>
            (a.apellidos || '').localeCompare(b.apellidos || '', 'es') ||
            (a.nombre || '').localeCompare(b.nombre || '', 'es')
          );

          const consolidados = consolidarCalificaciones(listaDiscentes, listaRas);
          setRas(listaRas);
          setDiscentes(consolidados);
          return;
        }

        // Si la función RPC no existe en la base de datos (código PGRST202 o similar),
        // se recurre de forma transparente al cálculo en frontend
        await calcularActaEnCliente(idCursoActivo, idModuloActivo);
      } catch (err) {
        console.error('Error al calcular el acta de evaluación por RA:', err);
        // Respaldo de contingencia ante cualquier excepción
        try {
          await calcularActaEnCliente(idCursoActivo, idModuloActivo);
        } catch (falloLocal) {
          console.error('Error en el cálculo alternativo en cliente:', falloLocal);
          setError('No se pudieron obtener las calificaciones de la clase.');
          setDiscentes([]);
          setRas([]);
        }
      } finally {
        setCargando(false);
      }
    },
    [idCurso, idModulo, consolidarCalificaciones, calcularActaEnCliente]
  );

  // Recarga automática al cambiar el curso o módulo activo
  useEffect(() => {
    cargarActa(idCurso, idModulo);
  }, [idCurso, idModulo, cargarActa]);

  return {
    discentes,
    ras,
    cargando,
    error,
    recargar: () => cargarActa(idCurso, idModulo)
  };
};

export default useInformeActaRA;
