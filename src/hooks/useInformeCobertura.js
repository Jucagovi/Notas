import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useInformeCobertura - Custom Hook para la auditoría de cobertura curricular de Criterios de Evaluación (CE).
 *
 * Responsabilidad Única: Orquestar la obtención de los Resultados de Aprendizaje (RA) de un módulo,
 * sus Criterios de Evaluación (CE), las actividades programadas (Versiones) para el curso escolar
 * y los porcentajes asignados en la tabla trabajan, calculando la cobertura acumulada por CE y por RA,
 * y estructurando los datos tanto en jerarquía (para Acordeón de tarjetas) como en formato plano (para tabla).
 *
 * @param {string|null} idCurso - Identificador del curso académico seleccionado.
 * @param {string|null} idModulo - Identificador del módulo formativo seleccionado.
 * @returns {Object} Objeto con filas procesadas, árbol jerárquico de RAs, métricas de auditoría, estados de carga y función de recarga.
 */
const useInformeCobertura = (idCurso = null, idModulo = null) => {
  // Instancias aisladas del hook useDatos para acceder a las tablas requeridas
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerCE } = useDatos('CE');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerTrabajan } = useDatos('trabajan');
  const { obtenerDatos: obtenerPracticas } = useDatos('Practicas');

  // Estados locales para los datos estructurados, jerarquía de RAs, métricas analíticas, carga y posibles errores
  const [datos, setDatos] = useState([]);
  const [ras, setRas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [metricas, setMetricas] = useState({
    totalCE: 0,
    totalCubiertos: 0,
    totalSinCubrir: 0,
    totalDesbalanceados: 0,
    porcentajeGlobal: 0
  });

  /**
   * Carga y procesa toda la información curricular cruzando las entidades correspondientes.
   */
  const cargarDatos = useCallback(async () => {
    // Si no se han especificado ambos parámetros, se restablece el estado y no se consulta la base de datos
    if (!idCurso || !idModulo) {
      setDatos([]);
      setRas([]);
      setMetricas({
        totalCE: 0,
        totalCubiertos: 0,
        totalSinCubrir: 0,
        totalDesbalanceados: 0,
        porcentajeGlobal: 0
      });
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // 1. Se obtienen los Resultados de Aprendizaje correspondientes al módulo formativo
      const listaRA = await obtenerRA('*', (consulta) =>
        consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
      );

      if (!listaRA || listaRA.length === 0) {
        setDatos([]);
        setRas([]);
        setMetricas({
          totalCE: 0,
          totalCubiertos: 0,
          totalSinCubrir: 0,
          totalDesbalanceados: 0,
          porcentajeGlobal: 0
        });
        setCargando(false);
        return;
      }

      const idsRA = listaRA.map((r) => r.id_ra);

      // 2. Se obtienen los Criterios de Evaluación vinculados a los RA recuperados
      const listaCE = await obtenerCE('*', (consulta) =>
        consulta.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      if (!listaCE || listaCE.length === 0) {
        setDatos([]);
        setRas([]);
        setMetricas({
          totalCE: 0,
          totalCubiertos: 0,
          totalSinCubrir: 0,
          totalDesbalanceados: 0,
          porcentajeGlobal: 0
        });
        setCargando(false);
        return;
      }

      // 3. Se obtienen las prácticas del módulo para resolver sus denominaciones
      const listaPracticas = await obtenerPracticas('*', (consulta) =>
        consulta.eq('id_modulo', idModulo)
      );
      const mapaPracticas = new Map((listaPracticas || []).map((p) => [p.id_practica, p]));

      // 4. Se obtienen las versiones instanciadas para el curso académico activo
      const listaVersiones = await obtenerVersiones(
        'id_version, enunciado, numero, id_practica, id_curso, Practicas(id_practica, nombre, id_modulo)',
        (consulta) => consulta.eq('id_curso', idCurso)
      );

      // Se construye un mapa asociativo de versiones con su nombre descriptivo
      const mapaVersiones = new Map();
      (listaVersiones || []).forEach((v) => {
        const practica = v.Practicas || mapaPracticas.get(v.id_practica) || null;
        const nombrePractica = practica?.nombre || 'Práctica';
        const nombreActividad = v.numero
          ? `${nombrePractica} (v${v.numero})`
          : (v.enunciado?.trim() || nombrePractica);

        mapaVersiones.set(v.id_version, {
          id_version: v.id_version,
          nombre: nombreActividad,
          enunciado: v.enunciado || '',
          numero: v.numero || null,
          nombrePractica,
          id_modulo: practica?.id_modulo || null
        });
      });

      // 5. Se consultan las asignaciones en la tabla trabajan para los CE del módulo y versiones del curso
      const idsCE = listaCE.map((c) => c.id_ce);
      const idsVersiones = Array.from(mapaVersiones.keys());

      let listaTrabajan = [];
      if (idsCE.length > 0 && idsVersiones.length > 0) {
        listaTrabajan = await obtenerTrabajan(
          'id_trabajan, porcentaje, id_ce, id_version',
          (consulta) => consulta.in('id_ce', idsCE).in('id_version', idsVersiones)
        );
      }

      // Se agrupan las actividades vinculadas a cada Criterio de Evaluación
      const mapaTrabajanPorCe = new Map();
      (listaTrabajan || []).forEach((t) => {
        if (!mapaTrabajanPorCe.has(t.id_ce)) {
          mapaTrabajanPorCe.set(t.id_ce, []);
        }
        const infoVersion = mapaVersiones.get(t.id_version);
        if (infoVersion) {
          mapaTrabajanPorCe.get(t.id_ce).push({
            id_version: t.id_version,
            nombre: infoVersion.nombre,
            enunciado: infoVersion.enunciado,
            numero: infoVersion.numero,
            nombrePractica: infoVersion.nombrePractica,
            porcentaje: Number(t.porcentaje) || 0
          });
        }
      });

      // 6. Procesamiento en cliente: generación de estructura plana y jerárquica con formato nombre + descripción
      const filasProcesadas = [];
      const rasJerarquicos = [];

      listaRA.forEach((ra) => {
        // Formato visual normalizado nombre + descripción para el Resultado de Aprendizaje
        const prefijoRA = !ra.nombre?.toLowerCase().startsWith('ra') ? `RA${ra.numero}` : '';
        const etiquetaRa = [prefijoRA, ra.nombre, ra.descripcion]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const criteriosDelRa = listaCE.filter((c) => c.id_ra === ra.id_ra);
        const criteriosProcesados = [];

        criteriosDelRa.forEach((ce) => {
          const actividadesAsociadas = mapaTrabajanPorCe.get(ce.id_ce) || [];

          // Se calcula la suma acumulada de los porcentajes asignados a este criterio
          const porcentajeTotal = actividadesAsociadas.reduce(
            (acumulado, act) => acumulado + act.porcentaje,
            0
          );

          // Se conforma la lista textual de actividades separadas por comas
          const actividadesTexto = actividadesAsociadas.length > 0
            ? actividadesAsociadas.map((act) => `${act.nombre} (${act.porcentaje}%)`).join(', ')
            : 'Sin actividades asociadas';

          // Se determina la clasificación cualitativa del estado de auditoría
          let estado = 'desbalanceado';
          if (porcentajeTotal === 100) {
            estado = 'exito';
          } else if (porcentajeTotal === 0) {
            estado = 'sin_cubrir';
          }

          // Formato visual normalizado nombre + descripción para el Criterio de Evaluación
          const prefijoCE = !ce.nombre?.toLowerCase().startsWith('ce') ? `CE${ce.numero}` : '';
          const etiquetaCe = [prefijoCE, ce.nombre, ce.descripcion]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          const ceObjeto = {
            id: ce.id_ce,
            id_ce: ce.id_ce,
            ceNumero: ce.numero,
            ceNombre: ce.nombre,
            ceDescripcion: ce.descripcion || '',
            ceEtiqueta: etiquetaCe,
            // Datos del Resultado de Aprendizaje para agrupación
            id_ra: ra.id_ra,
            raNumero: ra.numero,
            raNombre: ra.nombre,
            raDescripcion: ra.descripcion || '',
            raEtiqueta: etiquetaRa,
            // Actividades vinculadas y cálculos de cobertura
            actividades: actividadesAsociadas,
            actividadesTexto,
            porcentajeTotal,
            estado
          };

          filasProcesadas.push(ceObjeto);
          criteriosProcesados.push(ceObjeto);
        });

        // Cálculo de indicadores analíticos del Resultado de Aprendizaje
        const totalCeRa = criteriosProcesados.length;
        const criteriosCubiertosRa = criteriosProcesados.filter((c) => c.porcentajeTotal === 100).length;
        const criteriosSinCubrirRa = criteriosProcesados.filter((c) => c.porcentajeTotal === 0).length;
        const sumaPorcentajesRa = criteriosProcesados.reduce((acc, c) => acc + c.porcentajeTotal, 0);
        const promedioPorcentajeRa = totalCeRa > 0 ? Math.round(sumaPorcentajesRa / totalCeRa) : 0;

        const esCompletoRa = totalCeRa > 0 && criteriosCubiertosRa === totalCeRa;
        const esSinCubrirRa = totalCeRa > 0 && criteriosSinCubrirRa === totalCeRa;

        let estadoRa = 'desbalanceado';
        if (esCompletoRa) {
          estadoRa = 'exito';
        } else if (esSinCubrirRa) {
          estadoRa = 'sin_cubrir';
        }

        rasJerarquicos.push({
          id_ra: ra.id_ra,
          numero: ra.numero,
          nombre: ra.nombre,
          descripcion: ra.descripcion || '',
          etiquetaVisual: etiquetaRa,
          criterios: criteriosProcesados,
          totalCE: totalCeRa,
          criteriosCubiertos: criteriosCubiertosRa,
          criteriosSinCubrir: criteriosSinCubrirRa,
          promedioPorcentaje: promedioPorcentajeRa,
          esCompleto: esCompletoRa,
          esSinCubrir: esSinCubrirRa,
          estado: estadoRa
        });
      });

      // 7. Cálculo analítico de métricas globales de auditoría para el módulo y curso
      const totalCE = filasProcesadas.length;
      const totalCubiertos = filasProcesadas.filter((f) => f.porcentajeTotal === 100).length;
      const totalSinCubrir = filasProcesadas.filter((f) => f.porcentajeTotal === 0).length;
      const totalDesbalanceados = filasProcesadas.filter(
        (f) => f.porcentajeTotal > 0 && f.porcentajeTotal !== 100
      ).length;
      const porcentajeGlobal = totalCE > 0 ? Math.round((totalCubiertos / totalCE) * 100) : 0;

      setDatos(filasProcesadas);
      setRas(rasJerarquicos);
      setMetricas({
        totalCE,
        totalCubiertos,
        totalSinCubrir,
        totalDesbalanceados,
        porcentajeGlobal
      });
    } catch (err) {
      console.error('Error al generar el informe de cobertura de CE:', err);
      setError(err.message || 'Error al calcular la auditoría de cobertura curricular.');
      setDatos([]);
      setRas([]);
    } finally {
      setCargando(false);
    }
  }, [idCurso, idModulo, obtenerRA, obtenerCE, obtenerVersiones, obtenerTrabajan, obtenerPracticas]);

  // Se recarga automáticamente la información al variar el curso o módulo activo
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    datos,
    ras,
    metricas,
    cargando,
    error,
    recargar: cargarDatos
  };
};

export default useInformeCobertura;
