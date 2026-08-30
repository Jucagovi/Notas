import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla RA (Resultados de Aprendizaje) consumiendo useDatos
const useRA = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('RA');

  // Se obtienen todos los resultados de aprendizaje registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo resultado de aprendizaje
  const crear = useCallback(async (nuevoRA) => {
    return await insertar(nuevoRA);
  }, [insertar]);

  // Se actualizan los datos de un resultado de aprendizaje existente
  const modificar = useCallback(async (idRA, datosActualizados) => {
    return await actualizar('id_ra', idRA, datosActualizados);
  }, [actualizar]);

  // Se elimina un resultado de aprendizaje por su identificador
  const borrar = useCallback(async (idRA) => {
    return await eliminar('id_ra', idRA);
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

export default useRA;
