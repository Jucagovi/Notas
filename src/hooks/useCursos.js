import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Cursos consumiendo useDatos
const useCursos = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Cursos');

  // Se obtienen todos los cursos académicos registrados
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta un nuevo curso académico
  const crear = useCallback(async (nuevoCurso) => {
    return await insertar(nuevoCurso);
  }, [insertar]);

  // Se actualizan los datos de un curso académico existente
  const modificar = useCallback(async (idCurso, datosActualizados) => {
    return await actualizar('id_curso', idCurso, datosActualizados);
  }, [actualizar]);

  // Se elimina un curso académico por su identificador
  const borrar = useCallback(async (idCurso) => {
    return await eliminar('id_curso', idCurso);
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

export default useCursos;
