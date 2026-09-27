import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';

/**
 * useMapaCalor - Custom Hook para la obtención y cálculo de la matriz del Mapa de Calor Curricular.
 *
 * Responsabilidad Única: Orquestar el cálculo matricial de notas cruzando discentes con
 * Resultados de Aprendizaje (RA) para la clase activa.
 * Delega en la función RPC de Supabase `obtener_matriz_calor` y dispone de cálculo alternativo
 * en cliente mediante el hook genérico useDatos.
 *
 * @param {string|null} idCurso - Identificador de la clase o curso escolar.
 * @param {string|null} idModulo - Identificador del módulo formativo.
 */
export const useMapaCalor = (idCurso = null, idModulo = null) => {
  // Instancias de useDatos para el acceso a las tablas relacionales en el cálculo alternativo.
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerRaCurso } = useDatos('ra_curso');
  const { obtenerDatos: obtenerCE } = useDatos('CE');
  const { obtenerDatos: obtenerCeCurso } = useDatos('ce_curso');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerTrabajan } = useDatos('trabajan');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');

  // Estados locales de la matriz procesada, estado de carga y posibles errores.
  const [columnasBrutas, setColumnasBrutas] = useState([]);
  const [filasBrutas, setFilasBrutas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Procesa y enriquece las filas y columnas calculando métricas de análisis horizontal y vertical:
   *   - Alerta Individual (Horizontal): media por discente y detección de riesgo crítico generalizado.
   *   - Alerta Pedagógica (Vertical): media por columna, porcentaje de suspensos y detección de puntos ciegos.
   */
  const { columnas, filas, resumenColumnas, metricasGlobales } = useMemo(() => {
    if (!columnasBrutas || columnasBrutas.length === 0 || !filasBrutas) {
      return {
        columnas: [],
        filas: [],
        resumenColumnas: {},
        metricasGlobales: {
          totalDiscentes: 0,
          totalCriterios: 0,
          mediaGlobal: null,
          puntosCiegosCount: 0,
          discentesEnRiesgoCount: 0
        }
      };
    }

    // 1. Normalización de las columnas con descripciones completas para tooltips.
    const columnasNormalizadas = columnasBrutas.map((col) => {
      const codigo = col.codigo || (col.numero ? `RA${col.numero}` : 'RA');
      const nombreCompleto = col.nombre ? `${codigo}: ${col.nombre}` : codigo;
      return {
        ...col,
        id: String(col.id),
        codigo,
        nombreCompleto,
        descripcion: col.descripcion || ''
      };
    });

    // 2. Procesamiento de filas de discentes (Lectura Horizontal).
    let sumaNotasGlobal = 0;
    let totalNotasGlobal = 0;
    let discentesEnRiesgoCount = 0;

    const filasProcesadas = filasBrutas.map((fila) => {
      const califs = fila.calificaciones || {};
      let sumaNotasDiscente = 0;
      let totalEvaluadosDiscente = 0;
      let suspensosDiscente = 0;

      columnasNormalizadas.forEach((col) => {
        const itemCalif = califs[col.id];
        const nota = itemCalif && itemCalif.nota !== null && itemCalif.nota !== undefined
          ? Number(itemCalif.nota)
          : null;

        if (nota !== null && !Number.isNaN(nota)) {
          sumaNotasDiscente += nota;
          totalEvaluadosDiscente++;
          if (nota < 50) {
            suspensosDiscente++;
          }
          sumaNotasGlobal += nota;
          totalNotasGlobal++;
        }
      });

      const mediaDiscente = totalEvaluadosDiscente > 0
        ? Math.round(sumaNotasDiscente / totalEvaluadosDiscente)
        : null;

      // Un discente se encuentra en riesgo crítico si suspende al menos el 50% de criterios evaluados o media < 50.
      const enRiesgo = totalEvaluadosDiscente > 0 && (
        mediaDiscente < 50 || (suspensosDiscente / totalEvaluadosDiscente) >= 0.5
      );

      if (enRiesgo) {
        discentesEnRiesgoCount++;
      }

      const nombreLimpio = fila.nombre || '';
      const apellidosLimpios = fila.apellidos || '';
      const nombreCompleto = apellidosLimpios
        ? `${apellidosLimpios}, ${nombreLimpio}`
        : (fila.nombre_completo || nombreLimpio);

      return {
        ...fila,
        id: String(fila.id_discente),
        nombreCompleto,
        calificaciones: califs,
        mediaDiscente,
        totalEvaluadosDiscente,
        suspensosDiscente,
        enRiesgo
      };
    });

    // 3. Procesamiento de columnas de criterios (Lectura Vertical / Análisis Pedagógico).
    const resumenCols = {};
    let puntosCiegosCount = 0;

    columnasNormalizadas.forEach((col) => {
      let sumaNotasCol = 0;
      let totalEvaluadosCol = 0;
      let suspensosCol = 0;

      filasProcesadas.forEach((f) => {
        const itemCalif = f.calificaciones?.[col.id];
        const nota = itemCalif && itemCalif.nota !== null && itemCalif.nota !== undefined
          ? Number(itemCalif.nota)
          : null;

        if (nota !== null && !Number.isNaN(nota)) {
          sumaNotasCol += nota;
          totalEvaluadosCol++;
          if (nota < 50) {
            suspensosCol++;
          }
        }
      });

      const mediaCol = totalEvaluadosCol > 0
        ? Math.round(sumaNotasCol / totalEvaluadosCol)
        : null;

      const porcentajeSuspensos = totalEvaluadosCol > 0
        ? Math.round((suspensosCol / totalEvaluadosCol) * 100)
        : 0;

      // Se evidencia un punto ciego pedagógico si la media del grupo es < 50 o suspende más del 50% de discentes.
      const esPuntoCiego = totalEvaluadosCol > 0 && (mediaCol < 50 || porcentajeSuspensos >= 50);

      if (esPuntoCiego) {
        puntosCiegosCount++;
      }

      resumenCols[col.id] = {
        id: col.id,
        codigo: col.codigo,
        media: mediaCol,
        totalEvaluados: totalEvaluadosCol,
        suspensos: suspensosCol,
        porcentajeSuspensos,
        esPuntoCiego
      };
    });

    const mediaGlobal = totalNotasGlobal > 0
      ? Math.round(sumaNotasGlobal / totalNotasGlobal)
      : null;

    return {
      columnas: columnasNormalizadas,
      filas: filasProcesadas,
      resumenColumnas: resumenCols,
      metricasGlobales: {
        totalDiscentes: filasProcesadas.length,
        totalCriterios: columnasNormalizadas.length,
        mediaGlobal,
        puntosCiegosCount,
        discentesEnRiesgoCount
      }
    };
  }, [columnasBrutas, filasBrutas]);

  /**
   * Cálculo fallback íntegro en cliente mediante useDatos en caso de que la función RPC no esté disponible.
   */
  const calcularMatrizEnCliente = useCallback(
    async (idCursoActivo, idModuloActivo) => {
      // 1. Obtención de discentes matriculados en la clase.
      const matriculas = await obtenerImparte(
        'id_discente, id_curso, id_modulo',
        (q) => q.eq('id_curso', idCursoActivo).eq('id_modulo', idModuloActivo)
      );

      const idsDiscentes = [
        ...new Set((matriculas || []).map((m) => m.id_discente).filter(Boolean))
      ];

      if (idsDiscentes.length === 0) {
        setColumnasBrutas([]);
        setFilasBrutas([]);
        return;
      }

      // 2. Consulta de datos de filiación de los discentes.
      const datosDiscentes = await obtenerDiscentes(
        'id_discente, nombre, apellidos, NIA, correo, imagen, activo',
        (q) => q.in('id_discente', idsDiscentes)
      );

      // 3. Consulta de Resultados de Aprendizaje del módulo.
      const datosRA = await obtenerRA(
        'id_ra, numero, nombre, descripcion, id_modulo',
        (q) => q.eq('id_modulo', idModuloActivo).order('numero', { ascending: true })
      );

      if (!datosRA || datosRA.length === 0) {
        setColumnasBrutas([]);
        setFilasBrutas([]);
        return;
      }

      const idsRA = datosRA.map((r) => r.id_ra);

      // 4. Ponderaciones de los RA en el curso.
      const datosRaCurso = await obtenerRaCurso(
        'id_ra, peso',
        (q) => q.eq('id_curso', idCursoActivo).in('id_ra', idsRA)
      );
      const mapaPesosRA = new Map();
      (datosRaCurso || []).forEach((rc) => {
        mapaPesosRA.set(rc.id_ra, Number(rc.peso) || 0);
      });

      // 5. Criterios de Evaluación vinculados a los RA.
      const datosCE = await obtenerCE(
        'id_ce, numero, nombre, descripcion, id_ra',
        (q) => q.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      const idsCE = (datosCE || []).map((c) => c.id_ce);

      // 6. Ponderaciones de los CE en el curso.
      let datosCeCurso = [];
      if (idsCE.length > 0) {
        datosCeCurso = await obtenerCeCurso(
          'id_ce, peso',
          (q) => q.eq('id_curso', idCursoActivo).in('id_ce', idsCE)
        );
      }
      const mapaPesosCE = new Map();
      (datosCeCurso || []).forEach((cc) => {
        mapaPesosCE.set(cc.id_ce, Number(cc.peso) || 0);
      });

      // 7. Versiones de actividades asignadas a la clase.
      const datosVersiones = await obtenerVersiones(
        'id_version, id_practica, id_curso',
        (q) => q.eq('id_curso', idCursoActivo)
      );
      const idsVersiones = (datosVersiones || []).map((v) => v.id_version);

      // 8. Relaciones de cobertura en trabajan.
      let datosTrabajan = [];
      if (idsCE.length > 0 && idsVersiones.length > 0) {
        datosTrabajan = await obtenerTrabajan(
          'id_ce, id_version, porcentaje',
          (q) => q.in('id_ce', idsCE).in('id_version', idsVersiones)
        );
      }

      // 9. Calificaciones en evaluan.
      let datosEvaluan = [];
      if (idsVersiones.length > 0 && idsDiscentes.length > 0) {
        datosEvaluan = await obtenerEvaluan(
          'id_version, id_discente, nota',
          (q) => q.in('id_version', idsVersiones).in('id_discente', idsDiscentes)
        );
      }

      const mapaNotas = new Map();
      (datosEvaluan || []).forEach((ev) => {
        if (ev.nota !== null && ev.nota !== undefined) {
          mapaNotas.set(`${ev.id_discente}_${ev.id_version}`, Number(ev.nota));
        }
      });

      // Se indexan Criterios por RA y relaciones de cobertura por CE.
      const mapaCesPorRa = new Map();
      (datosCE || []).forEach((ce) => {
        if (!mapaCesPorRa.has(ce.id_ra)) {
          mapaCesPorRa.set(ce.id_ra, []);
        }
        mapaCesPorRa.get(ce.id_ra).push(ce);
      });

      const mapaTrabajanPorCe = new Map();
      (datosTrabajan || []).forEach((t) => {
        if (!mapaTrabajanPorCe.has(t.id_ce)) {
          mapaTrabajanPorCe.set(t.id_ce, []);
        }
        mapaTrabajanPorCe.get(t.id_ce).push(t);
      });

      // 10. Construcción de columnas dinámicas para los Resultados de Aprendizaje.
      const listaColumnas = datosRA.map((ra) => ({
        id: ra.id_ra,
        codigo: `RA${ra.numero}`,
        nombre: ra.nombre || '',
        descripcion: ra.descripcion || '',
        numero: ra.numero,
        peso: mapaPesosRA.get(ra.id_ra) || 0
      }));

      // 11. Construcción de filas de discentes y cálculo agregado de notas por RA.
      const listaFilas = (datosDiscentes || []).map((alumno) => {
        const mapaCalificaciones = {};

        datosRA.forEach((ra) => {
          const criteriosDelRa = mapaCesPorRa.get(ra.id_ra) || [];
          let sumaNotasCePonderadas = 0;
          let sumaPesosCe = 0;
          let criteriosEvaluados = 0;
          let todosCriteriosCompletos = criteriosDelRa.length > 0;

          criteriosDelRa.forEach((ce) => {
            const pesoCe = mapaPesosCE.get(ce.id_ce) || (100 / (criteriosDelRa.length || 1));
            const actividadesCe = mapaTrabajanPorCe.get(ce.id_ce) || [];

            let sumaAportesCe = 0;
            let coberturaCe = 0;
            let cantidadNotasCe = 0;

            actividadesCe.forEach((t) => {
              const claveNota = `${alumno.id_discente}_${t.id_version}`;
              if (mapaNotas.has(claveNota)) {
                const notaAct = mapaNotas.get(claveNota);
                const porc = Number(t.porcentaje) || 0;
                sumaAportesCe += notaAct * (porc / 100);
                coberturaCe += porc;
                cantidadNotasCe++;
              }
            });

            if (coberturaCe > 0 && cantidadNotasCe > 0) {
              const notaCe = Math.min(100, Math.round(sumaAportesCe));
              sumaNotasCePonderadas += notaCe * pesoCe;
              sumaPesosCe += pesoCe;
              criteriosEvaluados++;
            }

            if (coberturaCe < 100) {
              todosCriteriosCompletos = false;
            }
          });

          let notaRa = null;
          if (sumaPesosCe > 0 && criteriosEvaluados > 0) {
            notaRa = Math.min(100, Math.max(0, Math.round(sumaNotasCePonderadas / sumaPesosCe)));
          }

          mapaCalificaciones[ra.id_ra] = {
            id: ra.id_ra,
            nota: notaRa,
            completo: Boolean(todosCriteriosCompletos && criteriosDelRa.length > 0)
          };
        });

        const nombreLimpio = alumno.nombre || '';
        const apellidosLimpios = alumno.apellidos || '';
        const nombreCompleto = apellidosLimpios
          ? `${apellidosLimpios}, ${nombreLimpio}`
          : nombreLimpio;

        return {
          id_discente: alumno.id_discente,
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          nombre_completo: nombreCompleto,
          nia: alumno.NIA || alumno.nia,
          correo: alumno.correo,
          imagen: alumno.imagen,
          activo: alumno.activo,
          calificaciones: mapaCalificaciones
        };
      });

      // Ordenación alfabética por apellidos y nombre de los discentes.
      listaFilas.sort((a, b) =>
        (a.apellidos || '').localeCompare(b.apellidos || '', 'es') ||
        (a.nombre || '').localeCompare(b.nombre || '', 'es')
      );

      setColumnasBrutas(listaColumnas);
      setFilasBrutas(listaFilas);
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
      obtenerEvaluan
    ]
  );

  /**
   * Carga y orquestación de la matriz. Invoca prioritariamente la RPC de Supabase y
   * conmuta al cálculo en cliente si la función no se encuentra presente en el servidor.
   */
  const cargarMatriz = useCallback(
    async (idCursoActivo = idCurso, idModuloActivo = idModulo) => {
      if (!idCursoActivo || !idModuloActivo) {
        setColumnasBrutas([]);
        setFilasBrutas([]);
        setCargando(false);
        setError(null);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        // 1. Intento prioritario mediante función RPC delegada en PostgreSQL.
        const { data: dataRpc, error: errorRpc } = await supabase.rpc('obtener_matriz_calor', {
          p_id_curso: idCursoActivo,
          p_id_modulo: idModuloActivo
        });

        if (!errorRpc && dataRpc && (dataRpc.columnas || dataRpc.filas)) {
          setColumnasBrutas(dataRpc.columnas || []);
          setFilasBrutas(dataRpc.filas || []);
          return;
        }

        // 2. Si la función RPC no existe en la base de datos, se ejecuta el cálculo en cliente.
        await calcularMatrizEnCliente(idCursoActivo, idModuloActivo);
      } catch (err) {
        console.error('Error al obtener la matriz del mapa de calor:', err);
        try {
          await calcularMatrizEnCliente(idCursoActivo, idModuloActivo);
        } catch (falloLocal) {
          console.error('Error en el cálculo alternativo en cliente:', falloLocal);
          setError('No se pudo calcular la matriz de calificaciones para la clase seleccionada.');
          setColumnasBrutas([]);
          setFilasBrutas([]);
        }
      } finally {
        setCargando(false);
      }
    },
    [idCurso, idModulo, calcularMatrizEnCliente]
  );

  // Recarga reactiva al variar el curso o módulo activo.
  useEffect(() => {
    cargarMatriz(idCurso, idModulo);
  }, [idCurso, idModulo, cargarMatriz]);

  return {
    columnas,
    filas,
    resumenColumnas,
    metricasGlobales,
    cargando,
    error,
    recargar: () => cargarMatriz(idCurso, idModulo)
  };
};

export default useMapaCalor;
