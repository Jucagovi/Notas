import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla Evaluaciones consumiendo useDatos
const useEvaluaciones = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('Evaluaciones');

  // Se obtienen todas las evaluaciones registradas
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva evaluación
  const crear = useCallback(async (nuevaEvaluacion) => {
    return await insertar(nuevaEvaluacion);
  }, [insertar]);

  // Se actualizan los datos de una evaluación existente
  const modificar = useCallback(async (idEvaluacion, datosActualizados) => {
    return await actualizar('id_evaluacion', idEvaluacion, datosActualizados);
  }, [actualizar]);

  // Se elimina una evaluación por su identificador
  const borrar = useCallback(async (idEvaluacion) => {
    return await eliminar('id_evaluacion', idEvaluacion);
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

export default useEvaluaciones;
