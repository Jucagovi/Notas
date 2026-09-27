import { useState, useCallback, useMemo } from 'react';
import useAniosAcademicos from './useAniosAcademicos.js';
import useClases from './useClases.js';

/**
 * useFiltrosMapaCalor - Custom Hook para gestionar los filtros del Mapa de Calor Curricular.
 *
 * Responsabilidad Única: Orquestar la selección contextual de Año Académico y Clase
 * (con ordenación estricta de más reciente a más antiguo y preselección del año más reciente).
 */
export const useFiltrosMapaCalor = () => {
  // 1. Catálogo de Años Académicos disponibles (autoselecciona el más reciente por defecto).
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Catálogo de Clases filtradas por el año académico activo.
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Estado local para la selección activa de Clase (espera la acción explícita del docente).
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Ordenación estricta de las clases del registro más reciente al más antiguo.
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

  // Se extrae la entidad de la clase seleccionada actualmente.
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

  // Identificador del curso escolar asociado a la clase.
  const idCursoActivo = useMemo(() => {
    if (claseActiva?.id_curso) return claseActiva.id_curso;
    if (typeof claseSeleccionadaId === 'string' && claseSeleccionadaId.includes('_')) {
      return claseSeleccionadaId.split('_')[0];
    }
    return null;
  }, [claseActiva, claseSeleccionadaId]);

  // Identificador del módulo profesional asociado a la clase.
  const idModuloActivo = useMemo(() => {
    if (claseActiva?.id_modulo) return claseActiva.id_modulo;
    if (typeof claseSeleccionadaId === 'string' && claseSeleccionadaId.includes('_')) {
      return claseSeleccionadaId.split('_')[1];
    }
    return null;
  }, [claseActiva, claseSeleccionadaId]);

  // Manejador del cambio de Año Académico: reinicia la clase seleccionada.
  const manejarCambioAnio = useCallback((nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
  }, [setAnioSeleccionado]);

  // Manejador del cambio de Clase: extrae toleradamente el identificador.
  const manejarCambioClase = useCallback((nuevoValor) => {
    const id =
      nuevoValor && typeof nuevoValor === 'object' && 'value' in nuevoValor
        ? nuevoValor.value
        : nuevoValor && typeof nuevoValor === 'object' && 'id' in nuevoValor
        ? nuevoValor.id
        : nuevoValor;

    setClaseSeleccionadaId(id);
  }, []);

  // Recarga consolidada de catálogos dependientes.
  const recargar = useCallback(async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
  }, [recargarAnios, recargarClases]);

  const cargando = cargandoAnios || cargandoClases;

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
    cargando,
    recargar
  };
};

export default useFiltrosMapaCalor;
