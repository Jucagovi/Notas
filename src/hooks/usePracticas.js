import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Practicas consumiendo useDatos
const usePracticas = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Practicas');

  // Se obtienen todas las prácticas registradas
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva práctica
  const crear = useCallback(async (nuevaPractica) => {
    return await insertar(nuevaPractica);
  }, [insertar]);

  // Se actualizan los datos de una práctica existente
  const modificar = useCallback(async (idPractica, datosActualizados) => {
    return await actualizar('id_practica', idPractica, datosActualizados);
  }, [actualizar]);

  // Se elimina una práctica por su identificador
  const borrar = useCallback(async (idPractica) => {
    return await eliminar('id_practica', idPractica);
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

export default usePracticas;
