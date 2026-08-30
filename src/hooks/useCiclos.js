import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Ciclos consumiendo useDatos
const useCiclos = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Ciclos');

  // Se obtienen todos los ciclos formativos registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo ciclo formativo
  const crear = useCallback(async (nuevoCiclo) => {
    return await insertar(nuevoCiclo);
  }, [insertar]);

  // Se actualizan los datos de un ciclo formativo existente
  const modificar = useCallback(async (idCiclo, datosActualizados) => {
    return await actualizar('id_ciclo', idCiclo, datosActualizados);
  }, [actualizar]);

  // Se elimina un ciclo formativo por su identificador
  const borrar = useCallback(async (idCiclo) => {
    return await eliminar('id_ciclo', idCiclo);
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

export default useCiclos;
