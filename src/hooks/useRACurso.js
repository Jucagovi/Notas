import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla ra_curso consumiendo useDatos
const useRACurso = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('ra_curso');

  // Se obtienen todas las vinculaciones de pesos de RA por curso registradas
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva vinculación de peso de RA por curso
  const crear = useCallback(async (nuevoRegistro) => {
    return await insertar(nuevoRegistro);
  }, [insertar]);

  // Se actualizan los datos de una vinculación existente
  const modificar = useCallback(async (idRaCurso, datosActualizados) => {
    return await actualizar('id_ra_curso', idRaCurso, datosActualizados);
  }, [actualizar]);

  // Se elimina una vinculación por su identificador
  const borrar = useCallback(async (idRaCurso) => {
    return await eliminar('id_ra_curso', idRaCurso);
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

export default useRACurso;
