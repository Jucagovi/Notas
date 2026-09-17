import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla imparte consumiendo useDatos
const useImparte = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('imparte');

  // Se obtienen todas las asignaciones docentes y matrículas registradas
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva asignación en la tabla imparte
  const crear = useCallback(async (nuevaAsignacion) => {
    return await insertar(nuevaAsignacion);
  }, [insertar]);

  // Se actualizan los datos de una asignación existente
  const modificar = useCallback(async (idImparte, datosActualizados) => {
    return await actualizar('id_imparte', idImparte, datosActualizados);
  }, [actualizar]);

  // Se elimina una asignación por su identificador único
  const borrar = useCallback(async (idImparte) => {
    return await eliminar('id_imparte', idImparte);
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

export default useImparte;
