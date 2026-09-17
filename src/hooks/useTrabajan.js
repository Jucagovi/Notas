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

  // Se obtienen todas las vinculaciones de prácticas y criterios de evaluación
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva vinculación de práctica y criterio
  const crear = useCallback(async (nuevaVinculacion) => {
    return await insertar(nuevaVinculacion);
  }, [insertar]);

  // Se actualizan los datos de una vinculación existente
  const modificar = useCallback(async (idTrabajan, datosActualizados) => {
    return await actualizar('id_trabajan', idTrabajan, datosActualizados);
  }, [actualizar]);

  // Se elimina una vinculación por su identificador único
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
