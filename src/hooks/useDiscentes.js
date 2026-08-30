import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Discentes consumiendo useDatos
const useDiscentes = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Discentes');

  // Se obtienen todos los discentes registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo discente
  const crear = useCallback(async (nuevoDiscente) => {
    return await insertar(nuevoDiscente);
  }, [insertar]);

  // Se actualizan los datos de un discente existente
  const modificar = useCallback(async (idDiscente, datosActualizados) => {
    return await actualizar('id_discente', idDiscente, datosActualizados);
  }, [actualizar]);

  // Se elimina un discente por su identificador
  const borrar = useCallback(async (idDiscente) => {
    return await eliminar('id_discente', idDiscente);
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

export default useDiscentes;
