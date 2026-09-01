import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para la gestión de la tabla ce_curso consumiendo useDatos
const useCECurso = (cargarAlMontar = true) => {
  const {
    datos,
    cargando,
    error,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos('ce_curso');

  // Se obtienen todas las vinculaciones de pesos de CE por curso registradas
  const recargar = useCallback(async () => {
    return await obtenerDatos('*');
  }, [obtenerDatos]);

  // Se ejecuta la carga inicial de datos si se indica
  useEffect(() => {
    if (cargarAlMontar) {
      recargar();
    }
  }, [cargarAlMontar, recargar]);

  // Se inserta una nueva vinculación de peso de CE por curso
  const crear = useCallback(async (nuevoRegistro) => {
    return await insertar(nuevoRegistro);
  }, [insertar]);

  // Se actualizan los datos de una vinculación existente
  const modificar = useCallback(async (idCeCurso, datosActualizados) => {
    return await actualizar('id_ce_curso', idCeCurso, datosActualizados);
  }, [actualizar]);

  // Se elimina una vinculación por su identificador
  const borrar = useCallback(async (idCeCurso) => {
    return await eliminar('id_ce_curso', idCeCurso);
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

export default useCECurso;
