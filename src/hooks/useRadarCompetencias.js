import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';
import { getColorNota } from '../utils/coloresNota.js';

/**
 * useRadarCompetencias - Custom Hook para la obtención del rendimiento competencial por RA (Caso de Uso 12.5).
 *
 * Responsabilidad Única: Orquestar el cálculo de las notas de un discente en los Resultados de Aprendizaje
 * de un módulo formativo.
 *
 * Intenta delegar la carga computacional en la función RPC de Supabase `calcular_notas_ra_discente`.
 * Si dicha función no se encuentra desplegada, ejecuta el cálculo en cliente mediante el hook genérico useDatos
 * cruzando RA, CE, ra_curso, ce_curso, Versiones, trabajan y evaluan.
 *
 * @param {string|null} idDiscente - Identificador del discente.
 * @param {string|null} idModulo - Identificador del módulo formativo.
 * @param {string|null} [idCurso=null] - Identificador opcional del curso académico.
 */
export const useRadarCompetencias = (idDiscente = null, idModulo = null, idCurso = null) => {
  // Instancias de useDatos para el cálculo alternativo en cliente
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerRaCurso } = useDatos('ra_curso');
  const { obtenerDatos: obtenerCE } = useDatos('CE');
  const { obtenerDatos: obtenerCeCurso } = useDatos('ce_curso');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerTrabajan } = useDatos('trabajan');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');

  // Estados locales de resultados, carga y errores
  const [ras, setRas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cálculo fallback en el cliente cuando la función RPC no está disponible.
   */
  const calcularEnCliente = useCallback(
    async (discenteId, moduloId, cursoId) => {
      // Si no se proporcionó el curso, se busca a través de la matrícula en imparte
      let idCursoEfectivo = cursoId;
      if (!idCursoEfectivo) {
        const matriculas = await obtenerImparte(
          'id_curso',
          (q) => q.eq('id_discente', discenteId).eq('id_modulo', moduloId).limit(1)
        );
        idCursoEfectivo = matriculas?.[0]?.id_curso || null;
      }

      // 1. Se obtienen los Resultados de Aprendizaje del módulo
      const datosRA = await obtenerRA(
        'id_ra, numero, nombre, descripcion, id_modulo',
        (q) => q.eq('id_modulo', moduloId).order('numero', { ascending: true })
      );

      if (!datosRA || datosRA.length === 0) {
        return [];
      }

      const idsRA = datosRA.map((r) => r.id_ra);

      // 2. Se obtienen los pesos de los RA en el curso (si existe curso)
      let mapaPesosRA = new Map();
      if (idCursoEfectivo) {
        const datosRaCurso = await obtenerRaCurso(
          'id_ra, peso',
          (q) => q.eq('id_curso', idCursoEfectivo).in('id_ra', idsRA)
        );
        (datosRaCurso || []).forEach((rc) => {
          mapaPesosRA.set(rc.id_ra, Number(rc.peso) || 0);
        });
      }

      // 3. Se obtienen los Criterios de Evaluación de los RAs
      const datosCE = await obtenerCE(
        'id_ce, numero, nombre, descripcion, id_ra',
        (q) => q.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      const idsCE = (datosCE || []).map((c) => c.id_ce);

      // 4. Se obtienen los pesos de los CE en el curso
      let mapaPesosCE = new Map();
      if (idCursoEfectivo && idsCE.length > 0) {
        const datosCeCurso = await obtenerCeCurso(
          'id_ce, peso',
          (q) => q.eq('id_curso', idCursoEfectivo).in('id_ce', idsCE)
        );
        (datosCeCurso || []).forEach((cc) => {
          mapaPesosCE.set(cc.id_ce, Number(cc.peso) || 0);
        });
      }

      // 5. Se consultan las versiones de actividades asignadas al curso
      let datosVersiones = [];
      if (idCursoEfectivo) {
        datosVersiones = await obtenerVersiones(
          'id_version, id_practica, id_curso',
          (q) => q.eq('id_curso', idCursoEfectivo)
        );
      }

      const idsVersiones = (datosVersiones || []).map((v) => v.id_version);

      // 6. Se obtienen las relaciones de cobertura en trabajan
      let datosTrabajan = [];
      if (idsCE.length > 0 && idsVersiones.length > 0) {
        datosTrabajan = await obtenerTrabajan(
          'id_ce, id_version, porcentaje',
          (q) => q.in('id_ce', idsCE).in('id_version', idsVersiones)
        );
      }

      // 7. Se obtienen las calificaciones del alumno en evaluan
      let datosEvaluan = [];
      if (idsVersiones.length > 0) {
        datosEvaluan = await obtenerEvaluan(
          'id_version, nota',
          (q) => q.eq('id_discente', discenteId).in('id_version', idsVersiones)
        );
      }

      const mapaNotas = new Map();
      (datosEvaluan || []).forEach((ev) => {
        if (ev.nota !== null && ev.nota !== undefined) {
          mapaNotas.set(ev.id_version, Number(ev.nota));
        }
      });

      // 8. Se agrupan los Criterios por RA
      const mapaCesPorRa = new Map();
      (datosCE || []).forEach((ce) => {
        if (!mapaCesPorRa.has(ce.id_ra)) {
          mapaCesPorRa.set(ce.id_ra, []);
        }
        mapaCesPorRa.get(ce.id_ra).push(ce);
      });

      // 9. Se agrupan las coberturas por CE
      const mapaTrabajanPorCe = new Map();
      (datosTrabajan || []).forEach((t) => {
        if (!mapaTrabajanPorCe.has(t.id_ce)) {
          mapaTrabajanPorCe.set(t.id_ce, []);
        }
        mapaTrabajanPorCe.get(t.id_ce).push(t);
      });

      // 10. Se procesa cada Resultado de Aprendizaje
      return datosRA.map((ra) => {
        const criterios = mapaCesPorRa.get(ra.id_ra) || [];
        let sumaNotasCe = 0;
        let sumaPesosCe = 0;
        let cantidadCriteriosEvaluados = 0;
        let todosCriteriosCompletos = criterios.length > 0;

        criterios.forEach((ce) => {
          const pesoCe = mapaPesosCE.get(ce.id_ce) || (100 / (criterios.length || 1));
          const actividadesCe = mapaTrabajanPorCe.get(ce.id_ce) || [];

          let sumaAportes = 0;
          let coberturaEvaluada = 0;

          actividadesCe.forEach((t) => {
            if (mapaNotas.has(t.id_version)) {
              const nota = mapaNotas.get(t.id_version);
              const porcentaje = Number(t.porcentaje) || 0;
              sumaAportes += nota * (porcentaje / 100);
              coberturaEvaluada += porcentaje;
            }
          });

          const ceTieneNota = coberturaEvaluada > 0;
          if (ceTieneNota) {
            const notaFinalCe = Math.min(100, Math.round(sumaAportes));
            sumaNotasCe += notaFinalCe * pesoCe;
            sumaPesosCe += pesoCe;
            cantidadCriteriosEvaluados++;
          }

          if (coberturaEvaluada < 100) {
            todosCriteriosCompletos = false;
          }
        });

        let notaRa = null;
        if (sumaPesosCe > 0 && cantidadCriteriosEvaluados > 0) {
          notaRa = Math.min(100, Math.max(0, Math.round(sumaNotasCe / sumaPesosCe)));
        }

        const pesoRa = mapaPesosRA.get(ra.id_ra) || (100 / (datosRA.length || 1));

        return {
          id_ra: ra.id_ra,
          numero: ra.numero,
          codigo: `RA ${ra.numero}`,
          nombre: ra.nombre || `Resultado de Aprendizaje ${ra.numero}`,
          descripcion: ra.descripcion || '',
          peso: Math.round(pesoRa),
          nota: notaRa,
          completo: Boolean(todosCriteriosCompletos && criterios.length > 0)
        };
      });
    },
    [
      obtenerImparte,
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
   * Carga las notas del discente intentando primero el RPC en Supabase y alternando al fallback cliente.
   */
  const cargarNotas = useCallback(
    async (discenteId = idDiscente, moduloId = idModulo, cursoId = idCurso) => {
      if (!discenteId || !moduloId) {
        setRas([]);
        setCargando(false);
        setError(null);
        return [];
      }

      setCargando(true);
      setError(null);

      try {
        // Se intenta invocar la función RPC en Supabase
        const { data: dataRpc, error: errorRpc } = await supabase.rpc('calcular_notas_ra_discente', {
          p_id_discente: discenteId,
          p_id_modulo: moduloId,
          p_id_curso: cursoId || null
        });

        if (!errorRpc && dataRpc && Array.isArray(dataRpc.ras)) {
          const formateados = dataRpc.ras.map((r) => ({
            id_ra: r.id_ra,
            numero: r.numero,
            codigo: `RA ${r.numero}`,
            nombre: r.nombre || `Resultado de Aprendizaje ${r.numero}`,
            descripcion: r.descripcion || '',
            peso: Number(r.peso) || 0,
            nota: r.nota !== null && r.nota !== undefined ? Number(r.nota) : null,
            completo: Boolean(r.completo)
          }));

          setRas(formateados);
          return formateados;
        }

        // Si la función RPC no existe o falla, se ejecuta el cálculo en cliente
        const resultadoCliente = await calcularEnCliente(discenteId, moduloId, cursoId);
        setRas(resultadoCliente);
        return resultadoCliente;
      } catch (err) {
        console.error('Error al calcular notas del radar de competencias:', err);
        setError('No se han podido cargar las competencias del discente.');
        setRas([]);
        return [];
      } finally {
        setCargando(false);
      }
    },
    [idDiscente, idModulo, idCurso, calcularEnCliente]
  );

  // Carga reactiva cuando se actualizan los identificadores
  useEffect(() => {
    cargarNotas(idDiscente, idModulo, idCurso);
  }, [idDiscente, idModulo, idCurso, cargarNotas]);

  // Cálculos estadísticos derivados para paneles de resumen
  const metricas = useMemo(() => {
    if (!ras || ras.length === 0) {
      return {
        promedioCompetencias: null,
        totalRAs: 0,
        rasSuperados: 0,
        rasPendientes: 0,
        rasCompletos: 0,
        porcentajeCompletos: 0
      };
    }

    const conNota = ras.filter((r) => r.nota !== null);
    let sumaPonderada = 0;
    let sumaPesos = 0;

    conNota.forEach((r) => {
      const peso = r.peso > 0 ? r.peso : 1;
      sumaPonderada += r.nota * peso;
      sumaPesos += peso;
    });

    const promedio = sumaPesos > 0 ? Math.round(sumaPonderada / sumaPesos) : null;
    const superados = conNota.filter((r) => r.nota >= 50).length;
    const pendientes = ras.length - superados;
    const completos = ras.filter((r) => r.completo).length;
    const porcentajeCompletos = ras.length > 0 ? Math.round((completos / ras.length) * 100) : 0;

    return {
      promedioCompetencias: promedio,
      totalRAs: ras.length,
      rasSuperados: superados,
      rasPendientes: pendientes,
      rasCompletos: completos,
      porcentajeCompletos
    };
  }, [ras]);

  // Datos estructurados para el componente Chart tipo radar de PrimeReact
  const datosGrafico = useMemo(() => {
    if (!ras || ras.length === 0) {
      return null;
    }

    const etiquetas = ras.map((r) => `RA ${r.numero}`);
    const valores = ras.map((r) => (r.nota !== null ? r.nota : 0));

    // El color de área se adapta a la media competencial del alumno
    const media = metricas.promedioCompetencias !== null ? metricas.promedioCompetencias : 50;
    const colorCromatico = getColorNota(media).hex;

    const coloresPuntos = ras.map((r) => {
      if (r.nota === null) return '#94a3b8';
      return getColorNota(r.nota).hex;
    });

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Calificación de Competencia',
          data: valores,
          backgroundColor: `${colorCromatico}33`,
          borderColor: colorCromatico,
          pointBackgroundColor: coloresPuntos,
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: colorCromatico,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2
        }
      ]
    };
  }, [ras, metricas.promedioCompetencias]);

  return {
    ras,
    datosGrafico,
    metricas,
    cargando,
    error,
    cargarNotas,
    recargar: () => cargarNotas(idDiscente, idModulo, idCurso)
  };
};

export default useRadarCompetencias;
