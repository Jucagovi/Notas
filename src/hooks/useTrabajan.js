import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla trabajan consumiendo useDatos
const useTrabajan = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('trabajan');

  // Se obtienen todas las asignaciones registradas en la tabla trabajan
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva asignación de práctica a criterio de evaluación
  const crear = useCallback(async (nuevaAsignacion) => {
    return await insertar(nuevaAsignacion);
  }, [insertar]);

  // Se actualizan los datos de una asignación existente
  const modificar = useCallback(async (idTrabajan, datosActualizados) => {
    return await actualizar('id_trabajan', idTrabajan, datosActualizados);
  }, [actualizar]);

  // Se elimina una asignación por su identificador
  const borrar = useCallback(async (idTrabajan) => {
    return await eliminar('id_trabajan', idTrabajan);
  }, [eliminar]);

  return {
    datos,
    cargando,
    error,
    recargar,
    crear,
    modificar,
    actualizar: modificar,
    borrar,
    eliminar: borrar,
    setDatos
  };
};

export default useTrabajan;
