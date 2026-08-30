import { useState, useEffect, useCallback } from 'react';
import {
  obtenerClases,
  obtenerDiscentesDeClase,
  matricularDiscentesEnClase,
  desmatricularDiscenteDeClase,
  eliminarClase as servicioEliminarClase,
  eliminarCurso as servicioEliminarCurso
} from '../services/cursoSetupService.js';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión integral de Clases existentes, matriculaciones y eliminaciones
const useClases = () => {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Instancia de useDatos para discentes de la tabla Discentes para obtener discentes activos disponibles
  const {
    datos: todosDiscentes,
    obtenerDatos: obtenerTodosDiscentes
  } = useDatos('Discentes');

  // Se recarga la lista consolidada de clases
  const recargarClases = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error: errClases } = await obtenerClases();
      if (errClases) throw new Error(errClases);
      setClases(data || []);
      return data || [];
    } catch (err) {
      console.error('Error al cargar las clases:', err);
      setError(err.message || 'Error al obtener la lista de clases.');
      setClases([]);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await Promise.all([recargarClases(), obtenerTodosDiscentes('*')]);
    };
    inicializar();
  }, [recargarClases, obtenerTodosDiscentes]);

  // Se obtienen los discentes matriculados en una clase
  const consultarDiscentesDeClase = useCallback(async (cursoId, moduloId) => {
    if (!cursoId || !moduloId) return [];
    try {
      const { data, error: errDiscentes } = await obtenerDiscentesDeClase(cursoId, moduloId);
      if (errDiscentes) throw new Error(errDiscentes);
      return data || [];
    } catch (err) {
      console.error('Error al consultar discentes de la clase:', err);
      return [];
    }
  }, []);

  // Se matriculan nuevos discentes en una clase
  const matricular = useCallback(async (cursoId, moduloId, discentesIds) => {
    try {
      const res = await matricularDiscentesEnClase(cursoId, moduloId, discentesIds);
      if (res.error) throw new Error(res.error);
      await recargarClases();
      return { exito: true };
    } catch (err) {
      console.error('Error al matricular discentes:', err);
      return { exito: false, error: err.message };
    }
  }, [recargarClases]);

  // Se desmatricula a un discente de una clase
  const desmatricular = useCallback(async (cursoId, moduloId, discenteId) => {
    try {
      const res = await desmatricularDiscenteDeClase(cursoId, moduloId, discenteId);
      if (!res.exito) throw new Error(res.error);
      await recargarClases();
      return { exito: true };
    } catch (err) {
      console.error('Error al desmatricular discente:', err);
      return { exito: false, error: err.message };
    }
  }, [recargarClases]);

  // Se elimina una clase en cascada
  const borrarClase = useCallback(async (cursoId, moduloId) => {
    try {
      const res = await servicioEliminarClase(cursoId, moduloId);
      if (!res.exito) throw new Error(res.error);
      await recargarClases();
      return { exito: true };
    } catch (err) {
      console.error('Error al eliminar clase:', err);
      return { exito: false, error: err.message };
    }
  }, [recargarClases]);

  // Se elimina un curso completo en cascada
  const borrarCurso = useCallback(async (cursoId) => {
    try {
      const res = await servicioEliminarCurso(cursoId);
      if (!res.exito) throw new Error(res.error);
      await recargarClases();
      return { exito: true };
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      return { exito: false, error: err.message };
    }
  }, [recargarClases]);

  const discentesActivos = (todosDiscentes || []).filter((d) => d.activo !== false);

  return {
    clases,
    cargando,
    error,
    discentesActivos,
    recargarClases,
    consultarDiscentesDeClase,
    matricular,
    desmatricular,
    borrarClase,
    borrarCurso
  };
};

export default useClases;
