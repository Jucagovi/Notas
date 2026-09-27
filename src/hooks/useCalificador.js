import { useState, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useCalificador - Custom Hook para la calificación tabular e interactiva de prácticas.
 *
 * Responsabilidad Única: Gestionar la obtención de discentes matriculados en una clase
 * cruzados con las calificaciones registradas en la tabla evaluan, y proporcionar la función
 * de guardado automático (upsert) de notas aislando la persistencia a través de useDatos.
 */
const useCalificador = () => {
  // Desestructuración directa de funciones estables de cada tabla para evitar recreaciones en render
  const {
    obtenerDatos: obtenerEvaluan,
    insertar: insertarEvaluan,
    actualizar: actualizarEvaluan,
    eliminar: eliminarEvaluan
  } = useDatos('evaluan');

  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerPracticas } = useDatos('Practicas');
  const { obtenerDatos: obtenerEvaluaciones } = useDatos('Evaluaciones');

  // Estados locales para la lista de discentes con calificaciones y estados de carga/guardado
  const [discentes, setDiscentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene la lista de versiones de actividades asignadas directamente a una clase (curso y módulo).
   *
   * @param {string} idCurso - Identificador del curso académico o clase.
   * @param {string} idModulo - Identificador del módulo profesional.
   * @returns {Promise<Array<Object>>} Lista de versiones con datos de su práctica y evaluación.
   */
  const obtenerVersionesPorClase = useCallback(
    async (idCurso, idModulo) => {
      if (!idCurso || !idModulo) return [];
      try {
        const resultado = await obtenerVersiones(
          'id_version, numero, enunciado, peso_evaluacion, id_curso, id_practica, id_evaluacion, id_ut, Practicas!inner(id_practica, nombre, descripcion, id_tipopractica, id_modulo), Evaluaciones(id_evaluacion, nombre)',
          (consulta) =>
            consulta
              .eq('id_curso', idCurso)
              .eq('Practicas.id_modulo', idModulo)
              .order('numero', { ascending: true })
        );

        // Se enriquecen los objetos con campos planos para facilitar el renderizado en los selectores
        const formateadas = (resultado || []).map((v) => ({
          ...v,
          id_version: v.id_version,
          nombrePractica: v.Practicas?.nombre || 'Práctica',
          numeroVersion: v.numero || 'v1.0',
          evaluacionNombre: v.Evaluaciones?.nombre || '',
          peso: Number(v.peso_evaluacion) || 0,
          etiqueta: `${v.Practicas?.nombre || 'Práctica'} (${v.numero || 'v1.0'})${
            v.Evaluaciones?.nombre ? ` — ${v.Evaluaciones.nombre}` : ''
          }`
        }));

        // Se ordenan alfabéticamente por nombre de práctica y número de versión
        formateadas.sort((a, b) =>
          a.nombrePractica.localeCompare(b.nombrePractica, 'es') ||
          a.numeroVersion.localeCompare(b.numeroVersion, 'es')
        );

        return formateadas;
      } catch (err) {
        console.error('Error al obtener versiones de la clase:', err);
        return [];
      }
    },
    [obtenerVersiones]
  );

  /**
   * Obtiene la lista de prácticas asociadas a un módulo específico.
   *
   * @param {string} idModulo - Identificador único del módulo profesional.
   * @returns {Promise<Array<Object>>} Lista de prácticas ordenadas alfabéticamente.
   */
  const obtenerPracticasPorModulo = useCallback(
    async (idModulo) => {
      if (!idModulo) return [];
      try {
        const resultado = await obtenerPracticas(
          'id_practica, nombre, descripcion, id_tipopractica, id_modulo, es_activa',
          (q) => q.eq('id_modulo', idModulo).order('nombre', { ascending: true })
        );
        return resultado || [];
      } catch (err) {
        console.error('Error al obtener prácticas del módulo:', err);
        return [];
      }
    },
    [obtenerPracticas]
  );

  /**
   * Obtiene las versiones de una práctica vinculadas a un curso/clase específico.
   *
   * @param {string} idPractica - Identificador de la práctica maestra.
   * @param {string} idCurso - Identificador del curso académico o clase.
   * @returns {Promise<Array<Object>>} Lista de versiones registradas.
   */
  const obtenerVersionesPorPracticaYCurso = useCallback(
    async (idPractica, idCurso) => {
      if (!idPractica || !idCurso) return [];
      try {
        const resultado = await obtenerVersiones(
          'id_version, enunciado, numero, id_practica, id_curso, id_ut, id_evaluacion, peso_evaluacion, Evaluaciones(id_evaluacion, nombre)',
          (q) =>
            q
              .eq('id_practica', idPractica)
              .eq('id_curso', idCurso)
              .order('numero', { ascending: true })
        );
        return resultado || [];
      } catch (err) {
        console.error('Error al obtener versiones de la práctica:', err);
        return [];
      }
    },
    [obtenerVersiones]
  );

  /**
   * Obtiene la lista de discentes matriculados en un curso cruzada con la tabla evaluan.
   * Para cada alumno se recupera su nota previa en la versión o se establece a null (pendiente).
   *
   * @param {string} idVersion - Identificador único de la versión evaluada.
   * @param {string|null} idEvaluacion - Identificador de la evaluación correspondiente.
   * @param {string} idCurso - Identificador del curso académico o clase.
   * @param {string|null} [idModulo=null] - Identificador opcional del módulo para refinar la matrícula.
   * @returns {Promise<Array<Object>>} Lista de discentes con sus respectivas calificaciones.
   */
  const obtenerDiscentesConNotas = useCallback(
    async (idVersion, idEvaluacion, idCurso, idModulo = null) => {
      if (!idVersion || !idCurso) {
        setDiscentes([]);
        return [];
      }

      setCargando(true);
      setError(null);

      try {
        // 1. Se consultan las matrículas de la clase en la tabla imparte
        const filtroImparte = (q) => {
          let query = q.eq('id_curso', idCurso);
          if (idModulo) {
            query = query.eq('id_modulo', idModulo);
          }
          return query;
        };

        const matriculas = await obtenerImparte(
          'id_discente, id_curso, id_modulo',
          filtroImparte
        );

        const idsDiscentes = [
          ...new Set((matriculas || []).map((m) => m.id_discente).filter(Boolean))
        ];

        if (idsDiscentes.length === 0) {
          setDiscentes([]);
          return [];
        }

        // 2. Se obtienen los datos personales de los discentes matriculados
        const listaAlumnos = await obtenerDiscentes(
          'id_discente, nombre, apellidos, NIA, activo, imagen, correo',
          (q) => q.in('id_discente', idsDiscentes)
        );

        // 3. Se obtienen las notas registradas en la tabla evaluan para la versión
        const filtroEvaluan = (q) => {
          let query = q.eq('id_version', idVersion);
          if (idEvaluacion) {
            query = query.eq('id_evaluacion', idEvaluacion);
          }
          return query;
        };

        const calificaciones = await obtenerEvaluan(
          'id_evaluan, nota, id_version, id_evaluacion, id_discente',
          filtroEvaluan
        );

        // Se crea un mapa indexado por id_discente para agilizar la asociación en memoria
        const mapaCalificaciones = new Map();
        (calificaciones || []).forEach((cal) => {
          mapaCalificaciones.set(cal.id_discente, cal);
        });

        // 4. Se consolidan los alumnos asignándoles la nota registrada o null por defecto
        const discentesConsolidados = (listaAlumnos || []).map((alumno) => {
          const cal = mapaCalificaciones.get(alumno.id_discente);
          const notaRegistrada =
            cal && cal.nota !== null && cal.nota !== undefined
              ? Number(cal.nota)
              : null;

          return {
            ...alumno,
            nota: notaRegistrada,
            id_evaluan: cal ? cal.id_evaluan : null,
            id_evaluacion: cal ? cal.id_evaluacion : (idEvaluacion || null),
            id_version: idVersion
          };
        });

        // 5. Se ordenan alfabéticamente por apellidos y nombre
        discentesConsolidados.sort((a, b) => {
          const compApellidos = (a.apellidos || '').localeCompare(b.apellidos || '', 'es');
          if (compApellidos !== 0) return compApellidos;
          return (a.nombre || '').localeCompare(b.nombre || '', 'es');
        });

        setDiscentes(discentesConsolidados);
        return discentesConsolidados;
      } catch (err) {
        console.error('Error al obtener discentes con notas:', err);
        setError('No se han podido cargar los discentes matriculados.');
        setDiscentes([]);
        return [];
      } finally {
        setCargando(false);
      }
    },
    [obtenerImparte, obtenerDiscentes, obtenerEvaluan]
  );

  /**
   * Guarda o actualiza (upsert) la calificación de un discente en la tabla evaluan.
   *
   * @param {string} idVersion - Identificador de la versión calificada.
   * @param {string|null} idEvaluacion - Identificador de la evaluación asociada.
   * @param {string} idDiscente - Identificador del alumno calificado.
   * @param {number|null} nota - Valor numérico entre 0 y 100, o null para desasignar.
   * @returns {Promise<{ data: Object|null, error: Object|null }>} Resultado de la persistencia.
   */
  const guardarNota = useCallback(
    async (idVersion, idEvaluacion, idDiscente, nota) => {
      if (!idVersion || !idDiscente) {
        return { data: null, error: { message: 'Faltan parámetros obligatorios para guardar la nota.' } };
      }

      setGuardando(true);
      setError(null);

      try {
        // 1. Resolución de idEvaluacion si ha sido provista o figura en la versión
        let idEvaluacionEfectivo = idEvaluacion || null;
        if (!idEvaluacionEfectivo) {
          const versiones = await obtenerVersiones('id_version, id_evaluacion', (q) =>
            q.eq('id_version', idVersion).limit(1)
          );
          if (versiones && versiones.length > 0 && versiones[0].id_evaluacion) {
            idEvaluacionEfectivo = versiones[0].id_evaluacion;
          }
        }

        // 2. Comprobación de registro existente en evaluan
        const registrosPrevios = await obtenerEvaluan(
          'id_evaluan, nota, id_evaluacion, id_discente, id_version',
          (q) => q.eq('id_version', idVersion).eq('id_discente', idDiscente)
        );

        const registroExistente = registrosPrevios && registrosPrevios.length > 0 ? registrosPrevios[0] : null;

        // 3. Caso de eliminación o reseteo de nota (si el valor es nulo o vacío)
        if (nota === null || nota === undefined || String(nota).trim() === '') {
          if (registroExistente) {
            await eliminarEvaluan('id_evaluan', registroExistente.id_evaluan);
          }

          // Se actualiza el estado local de discentes reflejando el signo de interrogación
          setDiscentes((prev) =>
            prev.map((d) =>
              d.id_discente === idDiscente
                ? { ...d, nota: null, id_evaluan: null }
                : d
            )
          );

          return { data: null, error: null };
        }

        // 4. Validación numérica estricta entre 0 y 100 sin decimales
        const notaNumerica = Math.round(Number(nota));
        if (isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 100) {
          throw new Error('La calificación debe ser un número entero entre 0 y 100.');
        }

        let registroFinal = null;

        if (registroExistente) {
          // Actualización del registro existente
          const respuestaActualizar = await actualizarEvaluan(
            'id_evaluan',
            registroExistente.id_evaluan,
            {
              nota: notaNumerica,
              id_evaluacion: idEvaluacionEfectivo
            }
          );
          registroFinal = Array.isArray(respuestaActualizar) ? respuestaActualizar[0] : respuestaActualizar;
        } else {
          // Inserción de un nuevo registro en evaluan
          const respuestaInsertar = await insertarEvaluan({
            id_version: idVersion,
            id_evaluacion: idEvaluacionEfectivo,
            id_discente: idDiscente,
            nota: notaNumerica
          });
          registroFinal = Array.isArray(respuestaInsertar) ? respuestaInsertar[0] : respuestaInsertar;
        }

        // 5. Se actualiza el estado local del discente con la nueva calificación y su identificador
        setDiscentes((prev) =>
          prev.map((d) =>
            d.id_discente === idDiscente
              ? {
                  ...d,
                  nota: notaNumerica,
                  id_evaluan: registroFinal?.id_evaluan || registroExistente?.id_evaluan || d.id_evaluan,
                  id_evaluacion: idEvaluacionEfectivo
                }
              : d
          )
        );

        return { data: registroFinal, error: null };
      } catch (err) {
        console.error('Error al guardar la calificación:', err);
        const errObj = { message: err.message || 'Error al persistir la nota en la base de datos.' };
        setError(errObj.message);
        return { data: null, error: errObj };
      } finally {
        setGuardando(false);
      }
    },
    [obtenerVersiones, obtenerEvaluaciones, obtenerEvaluan, actualizarEvaluan, insertarEvaluan, eliminarEvaluan]
  );

  return {
    discentes,
    setDiscentes,
    cargando,
    guardando,
    error,
    obtenerVersionesPorClase,
    obtenerPracticasPorModulo,
    obtenerVersionesPorPracticaYCurso,
    obtenerDiscentesConNotas,
    guardarNota
  };
};

export default useCalificador;
