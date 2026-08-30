import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Modulos consumiendo useDatos
const useModulos = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Modulos');

  // Se obtienen todos los módulos profesionales registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo módulo profesional
  const crear = useCallback(async (nuevoModulo) => {
    return await insertar(nuevoModulo);
  }, [insertar]);

  // Se actualizan los datos de un módulo profesional existente
  const modificar = useCallback(async (idModulo, datosActualizados) => {
    return await actualizar('id_modulo', idModulo, datosActualizados);
  }, [actualizar]);

  // Se elimina un módulo profesional por su identificador
  const borrar = useCallback(async (idModulo) => {
    return await eliminar('id_modulo', idModulo);
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

export default useModulos;
