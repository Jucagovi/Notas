import { useState, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useInformeDificultad - Custom Hook para el Análisis de Dificultad e Histograma de Frecuencias (Caso de Uso 12.4).
 *
 * Responsabilidad Única: Orquestar las consultas a Supabase mediante useDatos para obtener
 * el catálogo de actividades (Versiones) asociadas a una clase y extraer la distribución
 * numérica de calificaciones de la tabla evaluan para una versión determinada.
 */
export const useInformeDificultad = () => {
  const { obtenerDatos: obtenerVersionesDatos } = useDatos('Versiones');
  const { obtenerDatos: obtenerEvaluanDatos } = useDatos('evaluan');

  const [versiones, setVersiones] = useState([]);
  const [notas, setNotas] = useState([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(false);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene la lista de versiones y actividades pertenecientes al binomio curso y módulo (clase).
   *
   * @param {string} idCurso - Identificador del curso académico.
   * @param {string} idModulo - Identificador del módulo profesional.
   * @returns {Promise<Array<Object>>} Lista enriquecida de actividades disponibles para la clase.
   */
  const obtenerVersionesPorClase = useCallback(
    async (idCurso, idModulo) => {
      if (!idCurso || !idModulo) {
        setVersiones([]);
        return [];
      }

      setCargandoVersiones(true);
      setError(null);

      try {
        // Se consultan las versiones vinculadas al curso y se extraen sus relaciones con prácticas y evaluaciones
        const resultado = await obtenerVersionesDatos(
          'id_version, numero, enunciado, peso_evaluacion, id_curso, id_practica, id_evaluacion, id_ut, Practicas(id_practica, nombre, descripcion, id_tipopractica, id_modulo), Evaluaciones(id_evaluacion, nombre)',
          (consulta) => consulta.eq('id_curso', idCurso).order('numero', { ascending: true })
        );

        // Se filtran las versiones para asegurar la pertenencia al módulo indicado
        const filtradas = (resultado || []).filter((v) => {
          if (v.Practicas?.id_modulo) {
            return v.Practicas.id_modulo === idModulo;
          }
          return true;
        });

        // Se preparan los campos descriptivos sin exponer el enunciado en la tarjeta
        const formateadas = filtradas.map((v) => ({
          id_version: v.id_version,
          id_practica: v.id_practica,
          nombrePractica: v.Practicas?.nombre || 'Práctica sin título',
          numeroVersion: v.numero ? `v${v.numero}` : 'v1.0',
          evaluacionNombre: v.Evaluaciones?.nombre || 'Sin evaluación asignada',
          peso: Number(v.peso_evaluacion) || 0,
          id_curso: v.id_curso,
          id_evaluacion: v.id_evaluacion
        }));

        // Se ordenan alfabéticamente por nombre de práctica y número de versión
        formateadas.sort((a, b) =>
          a.nombrePractica.localeCompare(b.nombrePractica, 'es') ||
          a.numeroVersion.localeCompare(b.numeroVersion, 'es')
        );

        setVersiones(formateadas);
        return formateadas;
      } catch (err) {
        console.error('Error al obtener versiones de la clase:', err);
        setError('No se han podido consultar las actividades de la clase.');
        setVersiones([]);
        return [];
      } finally {
        setCargandoVersiones(false);
      }
    },
    [obtenerVersionesDatos]
  );

  /**
   * Extrae un array con los valores numéricos del campo nota de la tabla evaluan para la versión indicada,
   * excluyendo registros nulos o alumnos sin calificar.
   *
   * @param {string} idVersion - Identificador único de la versión a evaluar.
   * @returns {Promise<Array<number>>} Array con las calificaciones numéricas obtenidas.
   */
  const obtenerDistribucionNotas = useCallback(
    async (idVersion) => {
      if (!idVersion) {
        setNotas([]);
        return [];
      }

      setCargandoNotas(true);
      setError(null);

      try {
        // Se consultan las calificaciones computadas para la versión
        const resultado = await obtenerEvaluanDatos(
          'id_evaluan, nota, id_version, id_discente',
          (consulta) => consulta.eq('id_version', idVersion)
        );

        // Se extraen exclusivamente los valores numéricos válidos en el rango 0-100
        const valoresNumericos = (resultado || [])
          .map((reg) => (reg.nota !== null && reg.nota !== undefined ? Number(reg.nota) : null))
          .filter((val) => val !== null && !isNaN(val));

        setNotas(valoresNumericos);
        return valoresNumericos;
      } catch (err) {
        console.error('Error al obtener distribución de notas:', err);
        setError('No se han podido recuperar las notas de la actividad seleccionada.');
        setNotas([]);
        return [];
      } finally {
        setCargandoNotas(false);
      }
    },
    [obtenerEvaluanDatos]
  );

  /**
   * Limpia los datos de notas y versiones.
   */
  const limpiarDatos = useCallback(() => {
    setVersiones([]);
    setNotas([]);
    setError(null);
  }, []);

  /**
   * Limpia únicamente las notas de la versión seleccionada.
   */
  const limpiarNotas = useCallback(() => {
    setNotas([]);
    setError(null);
  }, []);

  return {
    versiones,
    notas,
    cargandoVersiones,
    cargandoNotas,
    cargando: cargandoVersiones || cargandoNotas,
    error,
    obtenerVersionesPorClase,
    obtenerDistribucionNotas,
    limpiarDatos,
    limpiarNotas
  };
};

export default useInformeDificultad;
