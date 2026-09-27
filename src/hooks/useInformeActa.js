import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import { obtenerOrdenEvaluacion } from './useEvaluaciones.js';
import {
  calcularNotaTrimestralNormalizada,
  calcularNotaFinalGlobal
} from '../utils/calculoNotas.js';

/**
 * Función de utilidad pura para transformar los datos crudos relacionales en una estructura plana
 * optimizada para la visualización del DataTable del acta por trimestres (Caso de uso 12.2).
 *
 * Estructura esperada de salida para cada discente:
 * [{ id_discente, nombre, apellidos, nombreCompleto, nia, correo, notas: { [id_evaluacion]: nota } }]
 *
 * Algoritmo de Normalización (Punto 3 del caso de uso 05 y 12.2):
 * 1. Rescatar los pesos de los RA asignados a esa evaluación (ra_evaluacion y ra_curso).
 * 2. Sumar los pesos de los RA implicados.
 * 3. Multiplicar la nota obtenida en las actividades (Versiones) vinculadas a cada RA por su peso,
 *    sumar los resultados y dividir entre la suma total de los pesos (reescalado al 100%).
 *
 * @param {Object} datosCrudos - Conjunto de entidades relacionales obtenidas de Supabase.
 * @returns {Object} Objeto con discentes transformados y evaluaciones ordenadas.
 */
export const transformarDatosActa = (datosCrudos = {}) => {
  const {
    matriculas = [],
    discentes = [],
    evaluaciones = [],
    ra = [],
    raCurso = [],
    raEvaluacion = [],
    ce = [],
    ceCurso = [],
    versiones = [],
    trabajan = [],
    evaluan = []
  } = datosCrudos;

  // 1. Se identifican los identificadores de discentes matriculados en la clase
  const idsDiscentesMatriculados = new Set(
    matriculas.map((m) => m.id_discente).filter(Boolean)
  );

  const listaDiscentesValidos = discentes.filter((d) =>
    idsDiscentesMatriculados.has(d.id_discente)
  );

  if (listaDiscentesValidos.length === 0) {
    return { discentes: [], evaluaciones: [] };
  }

  // 2. Se ordenan las evaluaciones conforme al orden normativo reglamentario
  const evaluacionesOrdenadas = [...evaluaciones].sort(
    (a, b) => obtenerOrdenEvaluacion(a.nombre) - obtenerOrdenEvaluacion(b.nombre)
  );

  // 3. Estructuración de mapas de consulta rápida para ponderaciones y relaciones curriculares
  // Mapa de pesos oficiales de RA para el curso escolar
  const mapaPesosRA = new Map();
  (raCurso || []).forEach((rc) => {
    mapaPesosRA.set(rc.id_ra, Number(rc.peso) || 0);
  });

  // Lista consolidada de RAs con su ponderación asignada
  const rasConPeso = (ra || []).map((r) => ({
    id_ra: r.id_ra,
    numero: r.numero,
    nombre: r.nombre,
    descripcion: r.descripcion,
    peso: mapaPesosRA.has(r.id_ra)
      ? mapaPesosRA.get(r.id_ra)
      : Math.round(100 / (ra.length || 1))
  }));

  // Mapa de pesos oficiales de CE para el curso escolar
  const mapaPesosCE = new Map();
  (ceCurso || []).forEach((cc) => {
    mapaPesosCE.set(cc.id_ce, Number(cc.peso) || 0);
  });

  // Agrupación de Criterios de Evaluación por Resultado de Aprendizaje
  const mapaCesPorRa = new Map();
  (ce || []).forEach((c) => {
    if (!mapaCesPorRa.has(c.id_ra)) {
      mapaCesPorRa.set(c.id_ra, []);
    }
    mapaCesPorRa.get(c.id_ra).push(c);
  });

  // Agrupación de coberturas de actividades (trabajan) por criterio de evaluación
  const mapaTrabajanPorCe = new Map();
  (trabajan || []).forEach((t) => {
    if (!mapaTrabajanPorCe.has(t.id_ce)) {
      mapaTrabajanPorCe.set(t.id_ce, []);
    }
    mapaTrabajanPorCe.get(t.id_ce).push(t);
  });

  // Mapa de calificaciones de alumnos en evaluan indexado por clave compuesta: id_discente_id_version
  const mapaCalificaciones = new Map();
  (evaluan || []).forEach((ev) => {
    if (ev.id_discente && ev.id_version && ev.nota !== null && ev.nota !== undefined) {
      mapaCalificaciones.set(`${ev.id_discente}_${ev.id_version}`, Number(ev.nota));
    }
  });

  // Mapa de asignaciones de Resultados de Aprendizaje a cada Evaluación en ra_evaluacion
  const mapaRasPorEvaluacion = new Map();
  (raEvaluacion || []).forEach((re) => {
    if (!mapaRasPorEvaluacion.has(re.id_evaluacion)) {
      mapaRasPorEvaluacion.set(re.id_evaluacion, new Set());
    }
    mapaRasPorEvaluacion.get(re.id_evaluacion).add(re.id_ra);
  });

  // Agrupación de versiones asignadas directamente a una evaluación en la tabla Versiones
  const mapaVersionesPorEvaluacion = new Map();
  (versiones || []).forEach((v) => {
    if (v.id_evaluacion) {
      if (!mapaVersionesPorEvaluacion.has(v.id_evaluacion)) {
        mapaVersionesPorEvaluacion.set(v.id_evaluacion, []);
      }
      mapaVersionesPorEvaluacion.get(v.id_evaluacion).push(v);
    }
  });

  // 4. Cálculo de la calificación de cada discente para cada RA del módulo
  // Se obtiene la matriz base de notas por RA de cada alumno para su posterior ponderación
  const mapaNotasRaPorDiscente = new Map();

  listaDiscentesValidos.forEach((alumno) => {
    const notasRaAlumno = {};

    rasConPeso.forEach((r) => {
      const criteriosDelRa = mapaCesPorRa.get(r.id_ra) || [];
      let sumaNotasCe = 0;
      let sumaPesosCe = 0;
      let cantidadCriteriosEvaluados = 0;

      criteriosDelRa.forEach((criterio) => {
        const pesoCe =
          mapaPesosCE.get(criterio.id_ce) || (100 / (criteriosDelRa.length || 1));
        const actividadesCe = mapaTrabajanPorCe.get(criterio.id_ce) || [];

        let sumaAportesCe = 0;
        let coberturaEvaluadaCe = 0;

        actividadesCe.forEach((t) => {
          const claveNota = `${alumno.id_discente}_${t.id_version}`;
          if (mapaCalificaciones.has(claveNota)) {
            const notaActividad = mapaCalificaciones.get(claveNota);
            const porcentaje = Number(t.porcentaje) || 0;
            sumaAportesCe += notaActividad * (porcentaje / 100);
            coberturaEvaluadaCe += porcentaje;
          }
        });

        if (coberturaEvaluadaCe > 0) {
          const notaFinalCe = Math.min(100, Math.round(sumaAportesCe));
          sumaNotasCe += notaFinalCe * pesoCe;
          sumaPesosCe += pesoCe;
          cantidadCriteriosEvaluados++;
        }
      });

      let notaRa = null;
      if (sumaPesosCe > 0 && cantidadCriteriosEvaluados > 0) {
        notaRa = Math.min(100, Math.max(0, Math.round(sumaNotasCe / sumaPesosCe)));
      }

      notasRaAlumno[r.id_ra] = notaRa;
    });

    mapaNotasRaPorDiscente.set(alumno.id_discente, notasRaAlumno);
  });

  // 5. Cálculo y pivote de las calificaciones finales de cada discente por evaluación
  const discentesTransformados = listaDiscentesValidos.map((alumno) => {
    const notasRaAlumno = mapaNotasRaPorDiscente.get(alumno.id_discente) || {};
    const notasEvaluaciones = {};

    evaluacionesOrdenadas.forEach((evaluacion) => {
      const idEv = evaluacion.id_evaluacion;
      const nombreEv = (evaluacion.nombre || '').toLowerCase();
      const orden = obtenerOrdenEvaluacion(evaluacion.nombre);

      let notaFinalEvaluacion = null;

      // Se obtienen los RA asignados a esta evaluación en ra_evaluacion
      const setRasAsignados = mapaRasPorEvaluacion.get(idEv);
      const hayRasAsignados = setRasAsignados && setRasAsignados.size > 0;

      if (hayRasAsignados) {
        // Modalidad A: cálculo normalizado basado estrictamente en los RA de la evaluación
        const pesosRaEvaluacion = rasConPeso
          .filter((r) => setRasAsignados.has(r.id_ra))
          .map((r) => ({ id_ra: r.id_ra, peso: r.peso }));

        notaFinalEvaluacion = calcularNotaTrimestralNormalizada(
          notasRaAlumno,
          pesosRaEvaluacion
        );
      } else if (orden === 4 || nombreEv.includes('final') || nombreEv.includes('ordinari')) {
        // Modalidad B: Evaluación Final Ordinaria global sobre todos los RA del módulo
        const pesosTodosRas = rasConPeso.map((r) => ({ id_ra: r.id_ra, peso: r.peso }));
        notaFinalEvaluacion = calcularNotaFinalGlobal(notasRaAlumno, pesosTodosRas);

        // Si faltan RAs por evaluar pero hay calificaciones disponibles, se reescala provisionalmente
        if (notaFinalEvaluacion === null) {
          notaFinalEvaluacion = calcularNotaTrimestralNormalizada(
            notasRaAlumno,
            pesosTodosRas
          );
        }
      } else {
        // Modalidad C: si no existen registros en ra_evaluacion, se examinan las versiones vinculadas
        const versionesDeEv = mapaVersionesPorEvaluacion.get(idEv) || [];

        if (versionesDeEv.length > 0) {
          // Se identifican los RAs involucrados a través de las actividades vinculadas
          const idsRasInvolucrados = new Set();
          versionesDeEv.forEach((v) => {
            (trabajan || []).forEach((t) => {
              if (t.id_version === v.id_version) {
                const ceObj = (ce || []).find((c) => c.id_ce === t.id_ce);
                if (ceObj && ceObj.id_ra) {
                  idsRasInvolucrados.add(ceObj.id_ra);
                }
              }
            });
          });

          if (idsRasInvolucrados.size > 0) {
            const pesosRaDetectados = rasConPeso
              .filter((r) => idsRasInvolucrados.has(r.id_ra))
              .map((r) => ({ id_ra: r.id_ra, peso: r.peso }));

            notaFinalEvaluacion = calcularNotaTrimestralNormalizada(
              notasRaAlumno,
              pesosRaDetectados
            );
          } else {
            // Ponderación directa por el campo peso_evaluacion de las versiones
            let sumaNotasVersiones = 0;
            let sumaPesosVersiones = 0;

            versionesDeEv.forEach((v) => {
              const claveNota = `${alumno.id_discente}_${v.id_version}`;
              if (mapaCalificaciones.has(claveNota)) {
                const notaActividad = mapaCalificaciones.get(claveNota);
                const peso = Number(v.peso_evaluacion) || 1;
                sumaNotasVersiones += notaActividad * peso;
                sumaPesosVersiones += peso;
              }
            });

            if (sumaPesosVersiones > 0) {
              notaFinalEvaluacion = Math.min(
                100,
                Math.max(0, Math.round(sumaNotasVersiones / sumaPesosVersiones))
              );
            }
          }
        }
      }

      // Se asigna la calificación calculada (número entero entre 0 y 100 o null)
      notasEvaluaciones[idEv] =
        notaFinalEvaluacion !== null && !isNaN(notaFinalEvaluacion)
          ? notaFinalEvaluacion
          : null;
    });

    const apellidos = alumno.apellidos || '';
    const nombre = alumno.nombre || '';
    const nombreCompleto = apellidos
      ? `${apellidos}, ${nombre}`.trim()
      : (nombre || 'Sin nombre');

    const discentePlano = {
      id_discente: alumno.id_discente,
      nombre,
      apellidos,
      nombreCompleto,
      nia: alumno.NIA || alumno.nia || '',
      correo: alumno.correo || '',
      imagen: alumno.imagen || null,
      activo: alumno.activo !== false,
      notas: notasEvaluaciones
    };

    // Se agregan claves directas con el id_evaluacion para agilizar la ordenación en el DataTable
    evaluacionesOrdenadas.forEach((ev) => {
      discentePlano[ev.id_evaluacion] = notasEvaluaciones[ev.id_evaluacion];
    });

    return discentePlano;
  });

  // Se ordenan los discentes alfabéticamente por apellidos y nombre
  discentesTransformados.sort((a, b) =>
    (a.apellidos || '').localeCompare(b.apellidos || '', 'es') ||
    (a.nombre || '').localeCompare(b.nombre || '', 'es')
  );

  return {
    discentes: discentesTransformados,
    evaluaciones: evaluacionesOrdenadas
  };
};

/**
 * useInformeActa - Custom Hook para la consulta y cálculo del Acta Oficial por Trimestres (Caso de Uso 12.2).
 *
 * Responsabilidad Única: Orquestar la obtención de datos relacionales requeridos mediante el hook genérico useDatos,
 * ejecutar el cruce relacional entre las entidades de la clase y transformar la información para su renderizado
 * directo en el DataTable y utilidades de exportación.
 *
 * @param {string|null} [idCurso=null] - Identificador del curso académico activo.
 * @param {string|null} [idModulo=null] - Identificador del módulo profesional activo.
 */
export const useInformeActa = (idCurso = null, idModulo = null) => {
  // Instancias del hook useDatos para acceder a las tablas maestras y de relaciones
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerEvaluaciones } = useDatos('Evaluaciones');
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerRaCurso } = useDatos('ra_curso');
  const { obtenerDatos: obtenerRaEvaluacion } = useDatos('ra_evaluacion');
  const { obtenerDatos: obtenerCE } = useDatos('CE');
  const { obtenerDatos: obtenerCeCurso } = useDatos('ce_curso');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerTrabajan } = useDatos('trabajan');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');

  // Estados locales para los discentes procesados, evaluaciones, carga y errores
  const [discentes, setDiscentes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Realiza el cruce relacional íntegro de las entidades de la base de datos para la clase solicitada.
   *
   * @param {string} idCursoActivo - Identificador del curso académico.
   * @param {string} idModuloActivo - Identificador del módulo formativo.
   * @returns {Promise<Object>} Conjunto de datos relacionales crudos.
   */
  const obtenerDatosActa = useCallback(
    async (idCursoActivo, idModuloActivo) => {
      if (!idCursoActivo || !idModuloActivo) {
        return {
          matriculas: [],
          discentes: [],
          evaluaciones: [],
          ra: [],
          raCurso: [],
          raEvaluacion: [],
          ce: [],
          ceCurso: [],
          versiones: [],
          trabajan: [],
          evaluan: []
        };
      }

      // 1. Se consultan las matrículas en imparte para acotar a los alumnos del grupo
      const matriculas = await obtenerImparte(
        'id_discente, id_curso, id_modulo',
        (q) => q.eq('id_curso', idCursoActivo).eq('id_modulo', idModuloActivo)
      );

      const idsDiscentes = [
        ...new Set((matriculas || []).map((m) => m.id_discente).filter(Boolean))
      ];

      if (idsDiscentes.length === 0) {
        return {
          matriculas: [],
          discentes: [],
          evaluaciones: [],
          ra: [],
          raCurso: [],
          raEvaluacion: [],
          ce: [],
          ceCurso: [],
          versiones: [],
          trabajan: [],
          evaluan: []
        };
      }

      // 2. Se consultan concurrentemente las tablas maestras vinculadas a la clase
      const [
        datosDiscentes,
        datosEvaluaciones,
        datosRA,
        datosVersiones
      ] = await Promise.all([
        obtenerDiscentes(
          'id_discente, nombre, apellidos, NIA, correo, imagen, activo',
          (q) => q.in('id_discente', idsDiscentes)
        ),
        obtenerEvaluaciones(
          'id_evaluacion, nombre, fecha_ini, fecha_fin, descripcion, id_curso, id_modulo',
          (q) => q.eq('id_curso', idCursoActivo).eq('id_modulo', idModuloActivo)
        ),
        obtenerRA(
          'id_ra, numero, nombre, descripcion, id_modulo',
          (q) => q.eq('id_modulo', idModuloActivo).order('numero', { ascending: true })
        ),
        obtenerVersiones(
          'id_version, enunciado, numero, id_practica, id_curso, id_evaluacion, peso_evaluacion',
          (q) => q.eq('id_curso', idCursoActivo)
        )
      ]);

      const idsRA = (datosRA || []).map((r) => r.id_ra);
      const idsEvaluaciones = (datosEvaluaciones || []).map((e) => e.id_evaluacion);
      const idsVersiones = (datosVersiones || []).map((v) => v.id_version);

      // 3. Se consultan las ponderaciones curriculares y relaciones intermedias
      const [
        datosRaCurso,
        datosRaEvaluacion,
        datosCE
      ] = await Promise.all([
        idsRA.length > 0
          ? obtenerRaCurso(
              'id_ra_curso, id_ra, id_curso, peso',
              (q) => q.eq('id_curso', idCursoActivo).in('id_ra', idsRA)
            )
          : [],
        idsEvaluaciones.length > 0
          ? obtenerRaEvaluacion(
              'id_ra_evaluacion, id_ra, id_evaluacion',
              (q) => q.in('id_evaluacion', idsEvaluaciones)
            )
          : [],
        idsRA.length > 0
          ? obtenerCE(
              'id_ce, numero, nombre, descripcion, id_ra',
              (q) => q.in('id_ra', idsRA).order('numero', { ascending: true })
            )
          : []
      ]);

      const idsCE = (datosCE || []).map((c) => c.id_ce);

      // 4. Se obtienen las ponderaciones de CE, coberturas de trabajan y calificaciones registradas
      const [
        datosCeCurso,
        datosTrabajan,
        datosEvaluan
      ] = await Promise.all([
        idsCE.length > 0
          ? obtenerCeCurso(
              'id_ce_curso, id_ce, id_curso, peso',
              (q) => q.eq('id_curso', idCursoActivo).in('id_ce', idsCE)
            )
          : [],
        idsCE.length > 0 && idsVersiones.length > 0
          ? obtenerTrabajan(
              'id_trabajan, id_ce, id_version, porcentaje',
              (q) => q.in('id_ce', idsCE).in('id_version', idsVersiones)
            )
          : [],
        idsVersiones.length > 0 && idsDiscentes.length > 0
          ? obtenerEvaluan(
              'id_evaluan, nota, id_version, id_evaluacion, id_discente',
              (q) => q.in('id_version', idsVersiones).in('id_discente', idsDiscentes)
            )
          : []
      ]);

      return {
        matriculas: matriculas || [],
        discentes: datosDiscentes || [],
        evaluaciones: datosEvaluaciones || [],
        ra: datosRA || [],
        raCurso: datosRaCurso || [],
        raEvaluacion: datosRaEvaluacion || [],
        ce: datosCE || [],
        ceCurso: datosCeCurso || [],
        versiones: datosVersiones || [],
        trabajan: datosTrabajan || [],
        evaluan: datosEvaluan || []
      };
    },
    [
      obtenerImparte,
      obtenerDiscentes,
      obtenerEvaluaciones,
      obtenerRA,
      obtenerRaCurso,
      obtenerRaEvaluacion,
      obtenerCE,
      obtenerCeCurso,
      obtenerVersiones,
      obtenerTrabajan,
      obtenerEvaluan
    ]
  );

  /**
   * Carga y procesa el acta completa de la clase activa.
   */
  const cargarActa = useCallback(
    async (idCursoActivo = idCurso, idModuloActivo = idModulo) => {
      if (!idCursoActivo || !idModuloActivo) {
        setDiscentes([]);
        setEvaluaciones([]);
        setCargando(false);
        setError(null);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        const datosCrudos = await obtenerDatosActa(idCursoActivo, idModuloActivo);
        const { discentes: listaDiscentes, evaluaciones: listaEvaluaciones } =
          transformarDatosActa(datosCrudos);

        setDiscentes(listaDiscentes);
        setEvaluaciones(listaEvaluaciones);
      } catch (err) {
        console.error('Error al generar el acta de evaluación por trimestres:', err);
        setError('No se han podido calcular las calificaciones del acta.');
        setDiscentes([]);
        setEvaluaciones([]);
      } finally {
        setCargando(false);
      }
    },
    [idCurso, idModulo, obtenerDatosActa]
  );

  // Recarga reactiva ante cambios en la selección de clase
  useEffect(() => {
    cargarActa(idCurso, idModulo);
  }, [idCurso, idModulo, cargarActa]);

  return {
    discentes,
    evaluaciones,
    cargando,
    error,
    obtenerDatosActa,
    transformarDatosActa,
    recargar: () => cargarActa(idCurso, idModulo)
  };
};

export default useInformeActa;
