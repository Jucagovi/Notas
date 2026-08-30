import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla CE (Criterios de Evaluación) consumiendo useDatos
const useCE = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('CE');

  // Se obtienen todos los criterios de evaluación registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo criterio de evaluación
  const crear = useCallback(async (nuevoCE) => {
    return await insertar(nuevoCE);
  }, [insertar]);

  // Se actualizan los datos de un criterio de evaluación existente
  const modificar = useCallback(async (idCE, datosActualizados) => {
    return await actualizar('id_ce', idCE, datosActualizados);
  }, [actualizar]);

  // Se elimina un criterio de evaluación por su identificador
  const borrar = useCallback(async (idCE) => {
    return await eliminar('id_ce', idCE);
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

export default useCE;
