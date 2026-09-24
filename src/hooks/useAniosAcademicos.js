import { useState, useEffect, useMemo, useCallback } from 'react';
import useDatos from './useDatos.js';
import { extraerAnioInicioCurso } from '../utils/fechas.js';

/**
 * Custom Hook para la obtención y formateo de los Años Académicos disponibles.
 *
 * Responsabilidad Única: Consultar la tabla Cursos en Supabase a través de useDatos,
 * extraer los años académicos únicos, formatearlos con su denominación completa (ej. 2026/2027)
 * y gestionar la selección activa del año escolar.
 */
const useAniosAcademicos = () => {
  // Consulta de la tabla Cursos mediante el hook genérico useDatos.
  const {
    datos: cursos,
    cargando,
    error,
    obtenerDatos
  } = useDatos('Cursos');

  // Estado local para almacenar el año numérico de inicio seleccionado (ej. 2026).
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);

  // Carga inicial de los cursos al montar el hook.
  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // Se calculan los años académicos únicos con formato completo visual YYYY/YYYY+1 (ej. 2026 -> "2026/2027").
  const anios = useMemo(() => {
    const aniosRegistrados = new Set();
    const lista = [];

    (cursos || []).forEach((curso) => {
      const anioInicio = extraerAnioInicioCurso(curso);
      if (anioInicio && !aniosRegistrados.has(anioInicio)) {
        aniosRegistrados.add(anioInicio);
        lista.push({
          label: `${anioInicio}/${anioInicio + 1}`,
          value: anioInicio
        });
      }
    });

    // Ordenación descendente por año de inicio (los años más recientes aparecen primero).
    lista.sort((a, b) => b.value - a.value);

    // En caso de que no existan cursos registrados, se provee el año escolar actual como respaldo.
    if (lista.length === 0) {
      const hoy = new Date();
      const anioBase = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
      lista.push(
        { label: `${anioBase}/${anioBase + 1}`, value: anioBase },
        { label: `${anioBase + 1}/${anioBase + 2}`, value: anioBase + 1 }
      );
    }

    return lista;
  }, [cursos]);

  // Se autoselecciona el primer año académico disponible si no hay ninguno seleccionado.
  useEffect(() => {
    if (!anioSeleccionado && anios.length > 0) {
      setAnioSeleccionado(anios[0].value);
    } else if (anioSeleccionado && anios.length > 0 && !anios.some((a) => a.value === anioSeleccionado)) {
      setAnioSeleccionado(anios[0].value);
    }
  }, [anios, anioSeleccionado]);

  // Función para forzar la recarga de cursos desde Supabase.
  const recargar = useCallback(async () => {
    return await obtenerDatos();
  }, [obtenerDatos]);

  return {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando,
    error,
    recargar
  };
};

export default useAniosAcademicos;
