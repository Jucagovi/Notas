import { useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Fábrica para generar Custom Hooks estandarizados de tablas consumiendo useDatos.
export const crearHookTabla = (nombreTabla, clavePrimaria, ordenPredeterminado = null) => {
  return (autoCargar = true) => {
    const {
      datos,
      cargando,
      error,
      obtenerDatos,
      insertar,
      actualizar,
      eliminar,
      setDatos
    } = useDatos(nombreTabla);

    // Consulta los datos aplicando ordenamiento si está definido.
    const recargar = useCallback(async () => {
      if (ordenPredeterminado && typeof ordenPredeterminado === 'object') {
        const { columna, ascendente = true } = ordenPredeterminado;
        return await obtenerDatos('*', (consulta) =>
          consulta.order(columna, { ascending: ascendente })
        );
      }
      return await obtenerDatos();
    }, [obtenerDatos]);

    useEffect(() => {
      if (autoCargar) {
        recargar();
      }
    }, [autoCargar, recargar]);

    // Inserción de un nuevo registro en la tabla.
    const crear = useCallback(
      async (nuevoRegistro) => {
        return await insertar(nuevoRegistro);
      },
      [insertar]
    );

    // Actualización de un registro por su clave primaria.
    const editar = useCallback(
      async (id, valoresActualizados) => {
        return await actualizar(clavePrimaria, id, valoresActualizados);
      },
      [actualizar]
    );

    // Eliminación de un registro por su clave primaria.
    const borrar = useCallback(
      async (id) => {
        return await eliminar(clavePrimaria, id);
      },
      [eliminar]
    );

    return {
      datos,
      cargando,
      error,
      recargar,
      crear,
      actualizar: editar,
      eliminar: borrar,
      setDatos
    };
  };
};

export default crearHookTabla;
