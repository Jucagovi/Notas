import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursos from './useCursos.js';
import useModulos from './useModulos.js';
import useDatos from './useDatos.js';

/**
 * useFiltrosCobertura - Custom Hook para gestionar los filtros contextuales dependientes (Curso -> Módulo).
 *
 * Responsabilidad Única: Cargar las entidades maestras Cursos y Módulos, identificar las relaciones
 * existentes a través de imparte, Evaluaciones y Horarios, y gestionar el estado dependiente de selección
 * garantizando que al cambiar de curso se actualicen coherentemente los módulos ofrecidos.
 *
 * @returns {Object} Colecciones de opciones, identificadores seleccionados, setters y funciones de recarga.
 */
const useFiltrosCobertura = () => {
  // Carga de entidades maestras a través de sus respectivos hooks estandarizados
  const {
    datos: cursos,
    cargando: cargandoCursos,
    error: errorCursos,
    recargar: recargarCursos
  } = useCursos();

  const {
    datos: modulos,
    cargando: cargandoModulos,
    error: errorModulos,
    recargar: recargarModulos
  } = useModulos();

  // Consultas auxiliares a las tablas relacionales para identificar módulos activos por curso
  const {
    datos: imparte,
    cargando: cargandoImparte,
    obtenerDatos: obtenerImparte
  } = useDatos('imparte');

  const {
    datos: evaluaciones,
    cargando: cargandoEvaluaciones,
    obtenerDatos: obtenerEvaluaciones
  } = useDatos('Evaluaciones');

  const {
    datos: horarios,
    cargando: cargandoHorarios,
    obtenerDatos: obtenerHorarios
  } = useDatos('Horarios');

  // Estados locales para la selección activa del usuario
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Recarga consolidada de las relaciones entre cursos y módulos
  const recargarRelaciones = useCallback(async () => {
    await Promise.all([
      obtenerImparte('id_curso, id_modulo'),
      obtenerEvaluaciones('id_curso, id_modulo'),
      obtenerHorarios('id_curso, id_modulo')
    ]);
  }, [obtenerImparte, obtenerEvaluaciones, obtenerHorarios]);

  useEffect(() => {
    recargarRelaciones();
  }, [recargarRelaciones]);

  // Selección automática del primer curso disponible si no hay ninguno seleccionado
  useEffect(() => {
    if (!cursoSeleccionadoId && cursos && cursos.length > 0) {
      setCursoSeleccionadoId(cursos[0].id_curso);
    }
  }, [cursos, cursoSeleccionadoId]);

  // Mapa asociativo para encontrar rápidamente qué módulos están vinculados a cada curso
  const mapaModulosPorCurso = useMemo(() => {
    const mapa = new Map();

    const registrarRelacion = (idCurso, idModulo) => {
      if (!idCurso || !idModulo) return;
      if (!mapa.has(idCurso)) {
        mapa.set(idCurso, new Set());
      }
      mapa.get(idCurso).add(idModulo);
    };

    (imparte || []).forEach((rel) => registrarRelacion(rel.id_curso, rel.id_modulo));
    (evaluaciones || []).forEach((rel) => registrarRelacion(rel.id_curso, rel.id_modulo));
    (horarios || []).forEach((rel) => registrarRelacion(rel.id_curso, rel.id_modulo));

    return mapa;
  }, [imparte, evaluaciones, horarios]);

  // Lista de módulos filtrada según el curso seleccionado
  const modulosDisponibles = useMemo(() => {
    if (!modulos || modulos.length === 0) return [];
    if (!cursoSeleccionadoId) return [];

    const conjuntoIds = mapaModulosPorCurso.get(cursoSeleccionadoId);

    // Si existen módulos vinculados en las relaciones para este curso, se restringe la lista a ellos
    if (conjuntoIds && conjuntoIds.size > 0) {
      return modulos.filter((m) => conjuntoIds.has(m.id_modulo));
    }

    // En caso de que el curso no posea relaciones aún, se proporcionan todos los módulos como alternativa
    return modulos;
  }, [modulos, cursoSeleccionadoId, mapaModulosPorCurso]);

  // Si el módulo seleccionado no existe dentro de los disponibles para el curso actual, se limpia la selección
  useEffect(() => {
    if (moduloSeleccionadoId && modulosDisponibles.length > 0) {
      const existe = modulosDisponibles.some((m) => m.id_modulo === moduloSeleccionadoId);
      if (!existe) {
        setModuloSeleccionadoId(null);
      }
    } else if (modulosDisponibles.length === 0) {
      setModuloSeleccionadoId(null);
    }
  }, [modulosDisponibles, moduloSeleccionadoId]);

  // Autoselección del primer módulo si solo existe uno para el curso
  useEffect(() => {
    if (cursoSeleccionadoId && !moduloSeleccionadoId && modulosDisponibles.length === 1) {
      setModuloSeleccionadoId(modulosDisponibles[0].id_modulo);
    }
  }, [cursoSeleccionadoId, moduloSeleccionadoId, modulosDisponibles]);

  // Manejador del cambio de curso que resetea coherentemente el módulo seleccionado
  const manejarCambioCurso = useCallback((nuevoIdCurso) => {
    setCursoSeleccionadoId(nuevoIdCurso);
    setModuloSeleccionadoId(null);
  }, []);

  // Entidades activas completas para consumo en la vista
  const cursoActivo = useMemo(() => {
    return (cursos || []).find((c) => c.id_curso === cursoSeleccionadoId) || null;
  }, [cursos, cursoSeleccionadoId]);

  const moduloActivo = useMemo(() => {
    return (modulos || []).find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  }, [modulos, moduloSeleccionadoId]);

  // Recarga global de todos los filtros y relaciones
  const recargarTodo = useCallback(async () => {
    await Promise.all([
      recargarCursos(),
      recargarModulos(),
      recargarRelaciones()
    ]);
  }, [recargarCursos, recargarModulos, recargarRelaciones]);

  const cargando = cargandoCursos || cargandoModulos || cargandoImparte || cargandoEvaluaciones || cargandoHorarios;

  return {
    cursos: cursos || [],
    modulos: modulosDisponibles,
    todosLosModulos: modulos || [],
    cursoSeleccionadoId,
    setCursoSeleccionadoId: manejarCambioCurso,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    cursoActivo,
    moduloActivo,
    cargando,
    error: errorCursos || errorModulos,
    recargar: recargarTodo
  };
};

export default useFiltrosCobertura;
