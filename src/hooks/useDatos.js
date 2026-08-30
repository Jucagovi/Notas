import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';

// Hook genérico para aislar el acceso a Supabase y ofrecer herramientas CRUD completas con estado de comunicación
const useDatos = (nombreTabla) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Obtención de todos los registros de la tabla o con selección personalizada de columnas
  const obtenerDatos = useCallback(
    async (columnas = '*') => {
      if (!nombreTabla) return [];
      setCargando(true);
      setError(null);
      try {
        const { data, error: errorConsulta } = await supabase
          .from(nombreTabla)
          .select(columnas);

        if (errorConsulta) throw errorConsulta;
        const resultado = data || [];
        setDatos(resultado);
        return resultado;
      } catch (err) {
        console.error(
          `Error al obtener datos de la tabla ${nombreTabla}:`,
          err
        );
        setError(err.message || 'Error en la consulta');
        setDatos([]);
        return [];
      } finally {
        setCargando(false);
      }
    },
    [nombreTabla]
  );

  // Inserción de un nuevo registro en la tabla
  const insertar = useCallback(
    async (nuevoRegistro) => {
      if (!nombreTabla) return null;
      setCargando(true);
      setError(null);
      try {
        const { data, error: errorInsertar } = await supabase
          .from(nombreTabla)
          .insert(nuevoRegistro)
          .select();

        if (errorInsertar) throw errorInsertar;
        const resultado = data || [];
        setDatos((prev) => [...prev, ...resultado]);
        return resultado;
      } catch (err) {
        console.error(`Error al insertar en la tabla ${nombreTabla}:`, err);
        setError(err.message || 'Error al insertar registro');
        return null;
      } finally {
        setCargando(false);
      }
    },
    [nombreTabla]
  );

  // Actualización de un registro existente por su identificador
  const actualizar = useCallback(
    async (campoId, id, valoresActualizados) => {
      if (!nombreTabla) return null;
      setCargando(true);
      setError(null);
      try {
        const { data, error: errorActualizar } = await supabase
          .from(nombreTabla)
          .update(valoresActualizados)
          .eq(campoId, id)
          .select();

        if (errorActualizar) throw errorActualizar;
        setDatos((prev) =>
          prev.map((item) =>
            item[campoId] === id ? { ...item, ...valoresActualizados } : item
          )
        );
        return data;
      } catch (err) {
        console.error(`Error al actualizar en la tabla ${nombreTabla}:`, err);
        setError(err.message || 'Error al actualizar registro');
        return null;
      } finally {
        setCargando(false);
      }
    },
    [nombreTabla]
  );

  // Eliminación de un registro por su identificador
  const eliminar = useCallback(
    async (campoId, id) => {
      if (!nombreTabla) return false;
      setCargando(true);
      setError(null);
      try {
        const { error: errorEliminar } = await supabase
          .from(nombreTabla)
          .delete()
          .eq(campoId, id);

        if (errorEliminar) throw errorEliminar;
        setDatos((prev) => prev.filter((item) => item[campoId] !== id));
        return true;
      } catch (err) {
        console.error(`Error al eliminar en la tabla ${nombreTabla}:`, err);
        setError(err.message || 'Error al eliminar registro');
        return false;
      } finally {
        setCargando(false);
      }
    },
    [nombreTabla]
  );

  return {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos,
    // Aliases para compatibilidad
    data: datos,
    loading: cargando,
    fetchData: obtenerDatos
  };
};

export default useDatos;
