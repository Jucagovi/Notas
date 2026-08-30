import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla evaluan consumiendo useDatos
const useEvaluan = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('evaluan');

  // Se obtienen todas las calificaciones y asignaciones registradas en evaluan
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva calificación o vinculación en evaluan
  const crear = useCallback(async (nuevoRegistro) => {
    return await insertar(nuevoRegistro);
  }, [insertar]);

  // Se actualiza un registro existente en evaluan
  const modificar = useCallback(async (idEvaluan, datosActualizados) => {
    return await actualizar('id_evaluan', idEvaluan, datosActualizados);
  }, [actualizar]);

  // Se elimina un registro de evaluan por su identificador
  const borrar = useCallback(async (idEvaluan) => {
    return await eliminar('id_evaluan', idEvaluan);
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

export default useEvaluan;
