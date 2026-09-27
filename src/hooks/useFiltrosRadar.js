import { useState, useEffect, useCallback, useMemo } from 'react';
import useAniosAcademicos from './useAniosAcademicos.js';
import useClases from './useClases.js';
import useDiscentes from './useDiscentes.js';
import useDatos from './useDatos.js';

/**
 * useFiltrosRadar - Custom Hook para gestionar los filtros en cascada del radar (Año Académico -> Clase -> Discente).
 *
 * Responsabilidad Única: Orquestar la selección contextual de tres niveles requerida en el caso de uso 12.5.
 * El selector de Año Académico preselecciona el año más reciente por defecto.
 * El selector de Clase espera la acción del usuario y lista las clases ordenadas del registro más reciente al más antiguo.
 * El selector de Discente filtra inmediatamente el alumnado matriculado en la clase seleccionada (a través de imparte).
 */
export const useFiltrosRadar = () => {
  // 1. Catálogo de Años Académicos disponibles (autoselecciona el más reciente por defecto)
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Catálogo de Clases filtradas por el año académico activo
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // 3. Catálogo general de discentes registrados en el sistema
  const {
    datos: todosDiscentes,
    cargando: cargandoDiscentes,
    recargar: recargarDiscentes
  } = useDiscentes();

  // 4. Servicio de matrículas (imparte) para filtrar alumnos por clase
  const {
    datos: imparteData,
    cargando: cargandoImparte,
    obtenerDatos: obtenerImparte
  } = useDatos('imparte');

  // Estados locales para la selección del usuario (esperan su acción explícita)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [discenteSeleccionadoId, setDiscenteSeleccionadoId] = useState(null);

  // Carga inicial y reactiva de la tabla de matrículas imparte
  useEffect(() => {
    obtenerImparte('id_imparte, id_curso, id_modulo, id_discente');
  }, [obtenerImparte]);

  // Ordenación estricta de las clases del registro más reciente al más antiguo
  const clasesOrdenadas = useMemo(() => {
    if (!clases || clases.length === 0) return [];
    return [...clases].sort((a, b) => {
      const anioA = a.anioInicio || 0;
      const anioB = b.anioInicio || 0;
      if (anioB !== anioA) return anioB - anioA;

      const fCreacionA = a.cursoObj?.created_at ? new Date(a.cursoObj.created_at).getTime() : 0;
      const fCreacionB = b.cursoObj?.created_at ? new Date(b.cursoObj.created_at).getTime() : 0;
      if (fCreacionB !== fCreacionA) return fCreacionB - fCreacionA;

      return (a.cursoNombre || '').localeCompare(b.cursoNombre || '', 'es');
    });
  }, [clases]);

  // Se extraen los datos de la clase seleccionada actualmente de forma tolerante a string u objeto
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clasesOrdenadas) return null;
    const idBuscado =
      typeof claseSeleccionadaId === 'object'
        ? claseSeleccionadaId.id || claseSeleccionadaId.value
        : claseSeleccionadaId;

    return (
      clasesOrdenadas.find((c) => c.id === idBuscado || c.id_curso === idBuscado) || null
    );
  }, [clasesOrdenadas, claseSeleccionadaId]);

  // Extracción robusta de los identificadores id_curso e id_modulo
  const idCursoActivo = useMemo(() => {
    if (claseActiva?.id_curso) return claseActiva.id_curso;
    if (typeof claseSeleccionadaId === 'string' && claseSeleccionadaId.includes('_')) {
      return claseSeleccionadaId.split('_')[0];
    }
    return null;
  }, [claseActiva, claseSeleccionadaId]);

  const idModuloActivo = useMemo(() => {
    if (claseActiva?.id_modulo) return claseActiva.id_modulo;
    if (typeof claseSeleccionadaId === 'string' && claseSeleccionadaId.includes('_')) {
      return claseSeleccionadaId.split('_')[1];
    }
    return null;
  }, [claseActiva, claseSeleccionadaId]);

  // Consulta puntual adicional de matrículas cuando se define la clase activa
  useEffect(() => {
    if (idCursoActivo) {
      obtenerImparte(
        'id_imparte, id_curso, id_modulo, id_discente',
        (q) => q.eq('id_curso', idCursoActivo)
      );
    }
  }, [idCursoActivo, obtenerImparte]);

  // Filtrado reactivo en memoria de los discentes correspondientes a la clase seleccionada
  const discentesDisponibles = useMemo(() => {
    if (!claseSeleccionadaId || !idCursoActivo) {
      return [];
    }

    if (!todosDiscentes || todosDiscentes.length === 0) {
      return [];
    }

    const registros = imparteData || [];

    // 1. Filtrar matrículas que coincidan exactamente en curso y módulo
    let matriculados = registros
      .filter(
        (rel) =>
          rel.id_curso === idCursoActivo &&
          (idModuloActivo ? rel.id_modulo === idModuloActivo : true)
      )
      .map((rel) => rel.id_discente)
      .filter(Boolean);

    // 2. Si no hay registros con el módulo, buscar discentes matriculados en el curso
    if (matriculados.length === 0) {
      matriculados = registros
        .filter((rel) => rel.id_curso === idCursoActivo)
        .map((rel) => rel.id_discente)
        .filter(Boolean);
    }

    const idsMatriculados = new Set(matriculados);

    // 3. Obtener los discentes correspondientes
    let listaResultado = [];
    if (idsMatriculados.size > 0) {
      listaResultado = todosDiscentes.filter((d) => idsMatriculados.has(d.id_discente));
    } else {
      // Si la clase no tiene matrículas en imparte todavía, se presentan los alumnos activos
      listaResultado = todosDiscentes.filter((d) => d.activo !== false);
    }

    // Normalizar objeto y ordenar alfabéticamente por apellidos y nombre
    return listaResultado
      .map((d) => ({
        id_discente: d.id_discente,
        nombre: d.nombre || '',
        apellidos: d.apellidos || '',
        NIA: d.NIA || d.nia || '',
        correo: d.correo || '',
        imagen: d.imagen || null,
        activo: d.activo !== false
      }))
      .sort((a, b) =>
        (a.apellidos || '').localeCompare(b.apellidos || '', 'es') ||
        (a.nombre || '').localeCompare(b.nombre || '', 'es')
      );
  }, [claseSeleccionadaId, idCursoActivo, idModuloActivo, todosDiscentes, imparteData]);

  // Manejador del cambio de Año Académico: reinicia clase y discente
  const manejarCambioAnio = useCallback((nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
    setDiscenteSeleccionadoId(null);
  }, [setAnioSeleccionado]);

  // Manejador del cambio de Clase: extrae el ID y reinicia discente
  const manejarCambioClase = useCallback((nuevoValor) => {
    const id =
      nuevoValor && typeof nuevoValor === 'object' && 'value' in nuevoValor
        ? nuevoValor.value
        : nuevoValor && typeof nuevoValor === 'object' && 'id' in nuevoValor
        ? nuevoValor.id
        : nuevoValor;

    setClaseSeleccionadaId(id);
    setDiscenteSeleccionadoId(null);
  }, []);

  // Manejador del cambio de Discente
  const manejarCambioDiscente = useCallback((nuevoValor) => {
    const id =
      nuevoValor && typeof nuevoValor === 'object' && 'value' in nuevoValor
        ? nuevoValor.value
        : nuevoValor && typeof nuevoValor === 'object' && 'id_discente' in nuevoValor
        ? nuevoValor.id_discente
        : nuevoValor;

    setDiscenteSeleccionadoId(id);
  }, []);

  // Limpieza reactiva si el discente seleccionado deja de pertenecer a la clase
  useEffect(() => {
    if (discenteSeleccionadoId && discentesDisponibles.length > 0) {
      const existe = discentesDisponibles.some((d) => d.id_discente === discenteSeleccionadoId);
      if (!existe) {
        setDiscenteSeleccionadoId(null);
      }
    } else if (!claseSeleccionadaId) {
      setDiscenteSeleccionadoId(null);
    }
  }, [claseSeleccionadaId, discentesDisponibles, discenteSeleccionadoId]);

  // Discente actualmente seleccionado
  const discenteActivo = useMemo(() => {
    return (
      (discentesDisponibles || []).find((d) => d.id_discente === discenteSeleccionadoId) ||
      (todosDiscentes || []).find((d) => d.id_discente === discenteSeleccionadoId) ||
      null
    );
  }, [discentesDisponibles, todosDiscentes, discenteSeleccionadoId]);

  // Recarga global de los filtros
  const recargarTodo = useCallback(async () => {
    await Promise.all([
      recargarAnios(),
      recargarClases(),
      recargarDiscentes(),
      obtenerImparte('id_imparte, id_curso, id_modulo, id_discente')
    ]);
  }, [recargarAnios, recargarClases, recargarDiscentes, obtenerImparte]);

  const cargando = cargandoAnios || cargandoClases || cargandoDiscentes || cargandoImparte;

  return {
    anios,
    anioSeleccionado,
    setAnioSeleccionado: manejarCambioAnio,
    clases: clasesOrdenadas,
    claseSeleccionadaId,
    setClaseSeleccionadaId: manejarCambioClase,
    claseActiva,
    idCursoActivo,
    idModuloActivo,
    discentes: discentesDisponibles,
    discenteSeleccionadoId,
    setDiscenteSeleccionadoId: manejarCambioDiscente,
    discenteActivo,
    cargando,
    recargar: recargarTodo
  };
};

export default useFiltrosRadar;
