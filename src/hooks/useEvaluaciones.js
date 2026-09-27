import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';
import { calcularResumenCurricular } from '../utils/resumenCurricular.js';

/**
 * Determina el orden normativo de las 5 evaluaciones reglamentarias:
 * 1: Primera
 * 2: Segunda
 * 3: Tercera
 * 4: Final / Ordinaria
 * 5: Extraordinaria
 *
 * @param {string} nombre - Denominación de la evaluación.
 * @returns {number} - Posición de ordenación reglamentaria (1 a 5).
 */
export const obtenerOrdenEvaluacion = (nombre) => {
  if (!nombre) return 99;
  const texto = String(nombre).trim().toLowerCase();

  if (texto.includes('primer') || texto.startsWith('1')) return 1;
  if (texto.includes('segund') || texto.startsWith('2')) return 2;
  if (texto.includes('tercer') || texto.startsWith('3')) return 3;
  if (texto.includes('extraordinari')) return 5;
  if (texto.includes('final') || texto.includes('ordinari')) return 4;

  return 99;
};

/**
 * Custom Hook para la gestión de Evaluaciones y Bandeja de Pendientes (Caso de Uso 05).
 *
 * Responsabilidad Única: Orquestar el listado de las 5 evaluaciones normativas de un curso,
 * alimentar la bandeja de prácticas huérfanas pendientes y gestionar la asignación/desasignación
 * directa de actividades actualizando las tablas Versiones y evalua de forma reactiva.
 *
 * @param {string|boolean|null} [idCursoOAutoCargar=true] - Identificador de curso o flag de autocarga.
 */
const useEvaluaciones = (idCursoOAutoCargar = true) => {
  const idCurso = typeof idCursoOAutoCargar === 'string' ? idCursoOAutoCargar : null;
  const autoCargar = typeof idCursoOAutoCargar === 'boolean' ? idCursoOAutoCargar : true;

  // Hooks base de datos aislados para cada tabla.
  const hookEvaluaciones = useDatos('Evaluaciones');
  const hookVersiones = useDatos('Versiones');
  const hookPracticas = useDatos('Practicas');
  const hookCE = useDatos('CE');
  const hookRA = useDatos('RA');
  const hookTrabajan = useDatos('trabajan');

  // Estados locales para relaciones intermedias y sincronización.
  const [registrosEvalua, setRegistrosEvalua] = useState([]);
  const [cargandoAuxiliar, setCargandoAuxiliar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  // 1. Carga principal de datos según el curso seleccionado.
  const recargar = useCallback(async () => {
    if (!autoCargar && !idCurso) return;

    setCargandoAuxiliar(true);
    setErrorLocal(null);

    try {
      if (idCurso) {
        await Promise.all([
          hookEvaluaciones.obtenerDatos('*', (q) => q.eq('id_curso', idCurso)),
          hookVersiones.obtenerDatos('*', (q) => q.eq('id_curso', idCurso)),
          hookPracticas.obtenerDatos('*'),
          hookCE.obtenerDatos('*'),
          hookRA.obtenerDatos('*'),
          hookTrabajan.obtenerDatos('*')
        ]);
      } else {
        await hookEvaluaciones.obtenerDatos('*');
      }

      // Consulta de la tabla intermedia evalua si existe en el backend.
      try {
        const { data: datosEvalua, error: errEvalua } = await supabase
          .from('evalua')
          .select('*');

        if (!errEvalua && Array.isArray(datosEvalua)) {
          setRegistrosEvalua(datosEvalua);
        } else {
          setRegistrosEvalua([]);
        }
      } catch {
        setRegistrosEvalua([]);
      }
    } catch (err) {
      console.error('Error al cargar datos en useEvaluaciones:', err);
      setErrorLocal(err.message || 'Error al obtener datos');
    } finally {
      setCargandoAuxiliar(false);
    }
  }, [
    idCurso,
    autoCargar,
    hookEvaluaciones.obtenerDatos,
    hookVersiones.obtenerDatos,
    hookPracticas.obtenerDatos,
    hookCE.obtenerDatos,
    hookRA.obtenerDatos,
    hookTrabajan.obtenerDatos
  ]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // 2. Enriquecimiento del catálogo de Versiones del curso con metadatos de prácticas.
  const versionesCurso = useMemo(() => {
    const listaVersiones = hookVersiones.datos || [];
    const listaPracticas = hookPracticas.datos || [];
    const mapaPracticas = new Map(listaPracticas.map((p) => [p.id_practica, p]));

    return listaVersiones.map((v) => {
      const practica = mapaPracticas.get(v.id_practica);
      const nombrePractica = practica?.nombre || 'Práctica sin título';
      const numeroVersion = v.numero ? `v${v.numero}` : 'v1.0';

      return {
        ...v,
        nombrePractica,
        numeroVersion,
        etiquetaCompleta: `${nombrePractica} (${numeroVersion})`,
        descripcionPractica: practica?.descripcion || ''
      };
    });
  }, [hookVersiones.datos, hookPracticas.datos]);

  // Mapa de asignaciones version -> evaluacion desde evalua o Versiones.id_evaluacion.
  const mapaVersionEvaluacion = useMemo(() => {
    const mapa = new Map();

    (registrosEvalua || []).forEach((rel) => {
      if (rel.id_version && rel.id_evaluacion) {
        mapa.set(rel.id_version, rel.id_evaluacion);
      }
    });

    (hookVersiones.datos || []).forEach((v) => {
      if (v.id_version && v.id_evaluacion && !mapa.has(v.id_version)) {
        mapa.set(v.id_version, v.id_evaluacion);
      }
    });

    return mapa;
  }, [registrosEvalua, hookVersiones.datos]);

  // 3. Bandeja de Pendientes (Prácticas Huérfanas que NO están asignadas a ninguna evaluación).
  const versionesHuerfanas = useMemo(() => {
    return versionesCurso.filter((v) => !mapaVersionEvaluacion.has(v.id_version));
  }, [versionesCurso, mapaVersionEvaluacion]);

  // 4. Lista de evaluaciones estructurada con métricas y estrictamente ordenada.
  // Orden obligatorio: Primera (1), Segunda (2), Tercera (3), Final/Ordinaria (4) y Extraordinaria (5).
  const evaluacionesConMetricas = useMemo(() => {
    const lista = hookEvaluaciones.datos || [];
    const todosCE = hookCE.datos || [];
    const todosRA = hookRA.datos || [];
    const listaTrabajan = hookTrabajan.datos || [];

    const resultado = lista.map((ev) => {
      const versionesAsignadas = versionesCurso.filter(
        (v) => mapaVersionEvaluacion.get(v.id_version) === ev.id_evaluacion
      );

      const resumen = calcularResumenCurricular(
        versionesAsignadas,
        todosCE,
        todosRA,
        listaTrabajan
      );

      return {
        ...ev,
        ordenReglamentario: obtenerOrdenEvaluacion(ev.nombre),
        versionesAsignadas,
        totalActividades: versionesAsignadas.length,
        coberturasRA: resumen.coberturasRA,
        textoResumenCurricular: resumen.textoResumen
      };
    });

    resultado.sort((a, b) => a.ordenReglamentario - b.ordenReglamentario);
    return resultado;
  }, [
    hookEvaluaciones.datos,
    versionesCurso,
    mapaVersionEvaluacion,
    hookCE.datos,
    hookRA.datos,
    hookTrabajan.datos
  ]);

  // 5. Asignación directa e inmediata de una práctica a una evaluación seleccionada.
  const asignarPracticaAEvaluacion = useCallback(
    async (idVersion, idEvaluacion) => {
      if (!idVersion || !idEvaluacion) return false;
      setGuardando(true);
      setErrorLocal(null);

      try {
        // Actualización directa en la tabla Versiones.
        await hookVersiones.actualizar('id_version', idVersion, {
          id_evaluacion: idEvaluacion
        });

        // Actualización en la tabla intermedia evalua si existe.
        try {
          await supabase.from('evalua').delete().eq('id_version', idVersion);
          await supabase.from('evalua').insert({
            id_evaluacion: idEvaluacion,
            id_version: idVersion
          });
          setRegistrosEvalua((prev) => [
            ...prev.filter((r) => r.id_version !== idVersion),
            { id_evaluacion: idEvaluacion, id_version: idVersion }
          ]);
        } catch (errEvalua) {
          console.warn('Operación en evalua omitida si la tabla no está creada:', errEvalua);
        }

        // Refresco de catálogos en segundo plano.
        if (idCurso) {
          hookVersiones.obtenerDatos('*', (q) => q.eq('id_curso', idCurso));
        }
        return true;
      } catch (err) {
        console.error('Error al asignar práctica a evaluación:', err);
        setErrorLocal(err.message || 'Error al asignar práctica');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [idCurso, hookVersiones]
  );

  // 6. Desasignación de una práctica de una evaluación (vuelve a la bandeja de pendientes).
  const desasignarPracticaDeEvaluacion = useCallback(
    async (idVersion) => {
      if (!idVersion) return false;
      setGuardando(true);
      setErrorLocal(null);

      try {
        // Se desvincula en la tabla Versiones (id_evaluacion = null).
        await hookVersiones.actualizar('id_version', idVersion, {
          id_evaluacion: null
        });

        // Se retira de la tabla intermedia evalua.
        try {
          await supabase.from('evalua').delete().eq('id_version', idVersion);
          setRegistrosEvalua((prev) => prev.filter((r) => r.id_version !== idVersion));
        } catch (errEvalua) {
          console.warn('Operación en evalua omitida si la tabla no está creada:', errEvalua);
        }

        // Refresco de catálogos en segundo plano.
        if (idCurso) {
          hookVersiones.obtenerDatos('*', (q) => q.eq('id_curso', idCurso));
        }
        return true;
      } catch (err) {
        console.error('Error al desasignar práctica de evaluación:', err);
        setErrorLocal(err.message || 'Error al desasignar práctica');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [idCurso, hookVersiones]
  );

  const cargando =
    cargandoAuxiliar ||
    hookEvaluaciones.cargando ||
    hookVersiones.cargando ||
    hookPracticas.cargando;

  return {
    evaluaciones: evaluacionesConMetricas,
    datos: evaluacionesConMetricas, // Alias para compatibilidad regresiva
    versionesCurso,
    versionesHuerfanas,
    asignarPracticaAEvaluacion,
    desasignarPracticaDeEvaluacion,
    todosRA: hookRA.datos || [],
    todosCE: hookCE.datos || [],
    listaTrabajan: hookTrabajan.datos || [],
    cargando,
    guardando,
    error: errorLocal || hookEvaluaciones.error,
    recargar,
    obtenerDatos: hookEvaluaciones.obtenerDatos,
    insertar: hookEvaluaciones.insertar,
    actualizar: hookEvaluaciones.actualizar,
    eliminar: hookEvaluaciones.eliminar
  };
};

export default useEvaluaciones;
