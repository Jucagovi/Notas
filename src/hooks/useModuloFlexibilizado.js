import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useModuloFlexibilizado - Custom Hook para la consulta y gestión del módulo flexibilizado vinculado a un curso.
 *
 * Responsabilidad Única: Consultar la información del módulo secundario asociado a un curso flexibilizado
 * y sus horarios correspondientes mediante el hook genérico useDatos.
 *
 * @param {string|null} idModuloFlexible - Identificador del módulo secundario flexibilizado.
 */
export const useModuloFlexibilizado = (idModuloFlexible = null) => {
  const [moduloSecundario, setModuloSecundario] = useState(null);
  const [horariosSecundario, setHorariosSecundario] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const { obtenerDatos: obtenerModulos } = useDatos('Modulos');
  const { obtenerDatos: obtenerHorarios } = useDatos('Horarios');

  const cargarDatos = useCallback(async () => {
    if (!idModuloFlexible) {
      setModuloSecundario(null);
      setHorariosSecundario([]);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // Se consultan los datos descriptivos del módulo secundario y sus asignaciones horarias.
      const [modulosEncontrados, horariosEncontrados] = await Promise.all([
        obtenerModulos('*', (q) => q.eq('id_modulo', idModuloFlexible)),
        obtenerHorarios('*', (q) => q.eq('id_modulo', idModuloFlexible))
      ]);

      const datosModulo = (modulosEncontrados || [])[0] || null;
      setModuloSecundario(datosModulo);
      setHorariosSecundario(horariosEncontrados || []);
    } catch (err) {
      console.error('Error al cargar la información del módulo flexibilizado:', err);
      setError(err?.message || 'Error al cargar módulo flexibilizado.');
    } finally {
      setCargando(false);
    }
  }, [idModuloFlexible, obtenerModulos, obtenerHorarios]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    moduloSecundario,
    horariosSecundario,
    esFlexibilizado: Boolean(idModuloFlexible && moduloSecundario),
    cargando,
    error,
    recargar: cargarDatos
  };
};

export default useModuloFlexibilizado;
