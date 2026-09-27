import { useState, useCallback } from 'react';
import useDatos from './useDatos.js';
import useGlobalToast from './useGlobalToast.js';
import { extraerAnioInicioCurso } from '../utils/fechas.js';

/**
 * useFichaDiscente - Custom Hook para la gestión integral (360º) del historial del discente.
 *
 * Responsabilidad Única: Orquestar las consultas multi-tabla entre Discentes, Cursos,
 * imparte, Modulos, Evaluaciones, Versiones y evaluan para construir el expediente
 * académico organizado por Años Académicos y Clases matriculadas, permitiendo la edición en línea.
 */
const useFichaDiscente = () => {
  // Servicios de acceso a datos para cada entidad requerida
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerCursos } = useDatos('Cursos');
  const { obtenerDatos: obtenerModulos } = useDatos('Modulos');
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerEvaluaciones } = useDatos('Evaluaciones');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const {
    obtenerDatos: obtenerEvaluan,
    insertar: insertarEvaluan,
    actualizar: actualizarEvaluan,
    eliminar: eliminarEvaluan
  } = useDatos('evaluan');

  // Sistema global de notificaciones Toast
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Estados locales para el expediente del estudiante
  const [discente, setDiscente] = useState(null);
  const [aniosAcademicos, setAniosAcademicos] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [clasesMatriculadas, setClasesMatriculadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene y estructura el expediente académico del discente filtrado por el año escolar indicado.
   * Construye las pestañas de clases matriculadas para ese año académico con sus evaluaciones y notas.
   *
   * @param {string} idDiscente - Identificador único del alumno.
   * @param {number|string|null} [anioParam=null] - Año de inicio lectivo (ej. 2026 para 2026/2027).
   * @returns {Promise<Object|null>} Expediente académico procesado o null en caso de error.
   */
  const obtenerHistorialDiscente = useCallback(
    async (idDiscente, anioParam = null) => {
      if (!idDiscente) {
        setDiscente(null);
        setClasesMatriculadas([]);
        return null;
      }

      setCargando(true);
      setError(null);

      try {
        // 1. Se obtienen los datos personales del discente
        const datosDiscente = await obtenerDiscentes('*', (q) =>
          q.eq('id_discente', idDiscente).limit(1)
        );

        if (!datosDiscente || datosDiscente.length === 0) {
          throw new Error('No se ha encontrado el discente solicitado.');
        }

        const discenteActivo = datosDiscente[0];
        setDiscente(discenteActivo);

        // 2. Se recupera el catálogo completo de cursos académicos
        const todosLosCursos = await obtenerCursos('*', (q) =>
          q.order('anyo', { ascending: false })
        );

        // 3. Se extraen los años académicos únicos de la tabla Cursos formateados como YYYY/YYYY+1
        const mapaAnios = new Map();
        (todosLosCursos || []).forEach((c) => {
          const anioInicio = extraerAnioInicioCurso(c);
          if (anioInicio && !mapaAnios.has(anioInicio)) {
            mapaAnios.set(anioInicio, {
              value: anioInicio,
              label: `${anioInicio}/${anioInicio + 1}`
            });
          }
        });

        // Ordenación cronológica descendente de los años académicos
        let listaAnios = Array.from(mapaAnios.values()).sort(
          (a, b) => b.value - a.value
        );

        // En caso de ausencia de registros, se provee el año actual como respaldo
        if (listaAnios.length === 0) {
          const hoy = new Date();
          const base = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
          listaAnios = [
            { value: base, label: `${base}/${base + 1}` },
            { value: base + 1, label: `${base + 1}/${base + 2}` }
          ];
        }
        setAniosAcademicos(listaAnios);

        // 4. Se consultan todas las matrículas históricas del discente en la tabla imparte
        const todasMatriculasDiscente = await obtenerImparte(
          'id_imparte, id_curso, id_modulo, notas',
          (q) => q.eq('id_discente', idDiscente)
        );

        // Se identifican los años académicos en los que el alumno cuenta con matrícula
        const idsCursosMatriculados = [
          ...new Set(
            (todasMatriculasDiscente || [])
              .map((m) => m.id_curso)
              .filter(Boolean)
          )
        ];

        const cursosConMatricula = (todosLosCursos || []).filter((c) =>
          idsCursosMatriculados.includes(c.id_curso)
        );

        const aniosConMatricula = [
          ...new Set(
            cursosConMatricula
              .map((c) => extraerAnioInicioCurso(c))
              .filter(Boolean)
          )
        ].sort((a, b) => b - a);

        // 5. Se determina el año académico efectivo a mostrar
        let anioEfectivo = anioParam ? Number(anioParam) : null;
        if (!anioEfectivo) {
          if (aniosConMatricula.length > 0) {
            anioEfectivo = aniosConMatricula[0];
          } else {
            anioEfectivo = listaAnios[0]?.value || new Date().getFullYear();
          }
        }
        setAnioSeleccionado(anioEfectivo);

        // 6. Se filtran los cursos de ese año académico específico
        const cursosDelAnio = (todosLosCursos || []).filter(
          (c) => extraerAnioInicioCurso(c) === anioEfectivo
        );
        const idsCursosDelAnio = cursosDelAnio.map((c) => c.id_curso);
        const mapaCursos = new Map(cursosDelAnio.map((c) => [c.id_curso, c]));

        // 7. Se obtienen las matrículas del alumno en las clases del año seleccionado
        const matriculasDelAnio = (todasMatriculasDiscente || []).filter((m) =>
          idsCursosDelAnio.includes(m.id_curso)
        );

        if (matriculasDelAnio.length === 0) {
          setClasesMatriculadas([]);
          return {
            discente: discenteActivo,
            anioSeleccionado: anioEfectivo,
            clases: []
          };
        }

        const idsModulosDelAnio = [
          ...new Set(matriculasDelAnio.map((m) => m.id_modulo).filter(Boolean))
        ];

        // 8. Se obtienen los datos de los módulos formativos matriculados
        const listaModulos = await obtenerModulos('*', (q) =>
          q.in('id_modulo', idsModulosDelAnio).order('nombre', { ascending: true })
        );
        const mapaModulos = new Map(listaModulos.map((m) => [m.id_modulo, m]));

        // 9. Se obtienen las evaluaciones asociadas a estos cursos y módulos
        const evaluacionesDelAnio = await obtenerEvaluaciones('*', (q) =>
          q
            .in('id_curso', idsCursosDelAnio)
            .in('id_modulo', idsModulosDelAnio)
            .order('fecha_ini', { ascending: true })
        );
        const mapaEvaluaciones = new Map();
        (evaluacionesDelAnio || []).forEach((ev) => {
          mapaEvaluaciones.set(ev.id_evaluacion, ev);
        });

        // 10. Se obtienen las actividades (Versiones) vinculadas a los cursos y módulos del año
        const versionesDelAnio = await obtenerVersiones(
          'id_version, numero, enunciado, peso_evaluacion, id_curso, id_practica, id_evaluacion, id_ut, Practicas!inner(id_practica, nombre, descripcion, id_modulo), Evaluaciones(id_evaluacion, nombre, fecha_ini, fecha_fin)',
          (q) =>
            q
              .in('id_curso', idsCursosDelAnio)
              .in('Practicas.id_modulo', idsModulosDelAnio)
              .order('numero', { ascending: true })
        );

        // 11. Se recuperan las calificaciones del alumno en evaluan
        const calificacionesAlumno = await obtenerEvaluan(
          'id_evaluan, nota, id_version, id_evaluacion, id_discente',
          (q) => q.eq('id_discente', idDiscente)
        );
        const mapaCalificaciones = new Map();
        (calificacionesAlumno || []).forEach((cal) => {
          mapaCalificaciones.set(cal.id_version, cal);
        });

        // 12. Se construye el listado de clases matriculadas para el año escolar
        // Cada matrícula (id_curso, id_modulo) representa una clase
        const clasesProcesadas = [];
        const clasesRegistradas = new Set();

        matriculasDelAnio.forEach((mat) => {
          const claveClase = `${mat.id_curso}_${mat.id_modulo}`;
          if (clasesRegistradas.has(claveClase)) return;
          clasesRegistradas.add(claveClase);

          const cursoObj = mapaCursos.get(mat.id_curso);
          const moduloObj = mapaModulos.get(mat.id_modulo);
          if (!cursoObj || !moduloObj) return;

          // Versiones pertenecientes a esta clase (curso y módulo específicos)
          const versionesClase = (versionesDelAnio || []).filter(
            (v) =>
              v.id_curso === mat.id_curso &&
              v.Practicas?.id_modulo === mat.id_modulo
          );

          // Enriquecimiento de actividades con calificaciones
          const actividadesClase = versionesClase.map((v) => {
            const evaluacionObj = v.id_evaluacion
              ? mapaEvaluaciones.get(v.id_evaluacion) || v.Evaluaciones
              : null;
            const regNota = mapaCalificaciones.get(v.id_version);
            const notaValida =
              regNota &&
              regNota.nota !== null &&
              regNota.nota !== undefined &&
              !isNaN(Number(regNota.nota))
                ? Number(regNota.nota)
                : null;

            return {
              id_version: v.id_version,
              id_practica: v.id_practica,
              nombre_practica: v.Practicas?.nombre || 'Actividad práctica',
              numero_version: v.numero || 'v1.0',
              enunciado: v.enunciado || v.Practicas?.descripcion || '',
              peso_evaluacion:
                v.peso_evaluacion !== null && v.peso_evaluacion !== undefined
                  ? Number(v.peso_evaluacion)
                  : null,
              id_evaluacion: v.id_evaluacion || 'sin_evaluacion',
              nombre_evaluacion:
                evaluacionObj?.nombre || 'Sin evaluación asignada',
              fecha_evaluacion:
                evaluacionObj?.fecha_ini || evaluacionObj?.fecha_fin || null,
              nota: notaValida,
              id_evaluan: regNota ? regNota.id_evaluan : null,
              id_discente: idDiscente
            };
          });

          // Ordenación de actividades por evaluación para garantizar el agrupamiento en tabla
          actividadesClase.sort((a, b) => {
            const compEval = (a.nombre_evaluacion || '').localeCompare(
              b.nombre_evaluacion || '',
              'es'
            );
            if (compEval !== 0) return compEval;
            return (a.nombre_practica || '').localeCompare(
              b.nombre_practica || '',
              'es'
            );
          });

          // Estadísticas y métricas de la clase
          const calificadas = actividadesClase.filter((a) => a.nota !== null);
          const totalCalificadas = calificadas.length;
          const sumaNotas = calificadas.reduce((acc, curr) => acc + curr.nota, 0);
          const notaMedia =
            totalCalificadas > 0 ? Math.round(sumaNotas / totalCalificadas) : null;

          const distribucion = {
            suspensos: calificadas.filter((a) => a.nota < 50).length,
            suficientes: calificadas.filter(
              (a) => a.nota >= 50 && a.nota < 60
            ).length,
            bien: calificadas.filter((a) => a.nota >= 60 && a.nota < 70).length,
            notables: calificadas.filter(
              (a) => a.nota >= 70 && a.nota < 90
            ).length,
            sobresalientes: calificadas.filter((a) => a.nota >= 90).length
          };

          // Título de la pestaña
          const tituloPestanya = `${moduloObj.siglas ? `${moduloObj.siglas}: ` : ''}${moduloObj.nombre}${
            cursosDelAnio.length > 1 ? ` (${cursoObj.nombre})` : ''
          }`;

          clasesProcesadas.push({
            id_clase: claveClase,
            id_curso: mat.id_curso,
            id_modulo: mat.id_modulo,
            cursoNombre: cursoObj.nombre,
            moduloNombre: moduloObj.nombre,
            moduloSiglas: moduloObj.siglas,
            tituloPestanya,
            actividades: actividadesClase,
            estadisticas: {
              totalActividades: actividadesClase.length,
              calificadas: totalCalificadas,
              notaMedia,
              distribucion
            }
          });
        });

        // Ordenación alfabética de las clases por módulo y curso
        clasesProcesadas.sort((a, b) =>
          a.moduloNombre.localeCompare(b.moduloNombre, 'es') ||
          a.cursoNombre.localeCompare(b.cursoNombre, 'es')
        );

        setClasesMatriculadas(clasesProcesadas);

        return {
          discente: discenteActivo,
          anioSeleccionado: anioEfectivo,
          clases: clasesProcesadas
        };
      } catch (err) {
        console.error('Error al obtener el historial del discente:', err);
        const mensajeError =
          err.message || 'Error al cargar el historial del estudiante.';
        setError(mensajeError);
        mostrarError(mensajeError);
        return null;
      } finally {
        setCargando(false);
      }
    },
    [
      obtenerDiscentes,
      obtenerCursos,
      obtenerImparte,
      obtenerModulos,
      obtenerEvaluaciones,
      obtenerVersiones,
      obtenerEvaluan,
      mostrarError
    ]
  );

  /**
   * Actualiza o inserta (upsert) la calificación de una versión en evaluan mediante edición en línea.
   * Notifica mediante Toast global y actualiza el estado local de forma reactiva.
   *
   * @param {string} idVersion - Identificador de la versión evaluada.
   * @param {string|null} idEvaluacion - Identificador de la evaluación correspondiente.
   * @param {string} idDiscente - Identificador del alumno calificado.
   * @param {number|string|null} nota - Valor numérico entre 0 y 100, o null para eliminar nota.
   * @returns {Promise<{ ok: boolean, data?: Object, error?: Object }>} Resultado de la operación.
   */
  const actualizarNotaFicha = useCallback(
    async (idVersion, idEvaluacion, idDiscente, nota) => {
      if (!idVersion || !idDiscente) {
        const msg = 'Faltan parámetros obligatorios para guardar la calificación.';
        mostrarError(msg);
        return { ok: false, error: { message: msg } };
      }

      setGuardando(true);

      try {
        const idEvaluacionEfectivo =
          idEvaluacion && idEvaluacion !== 'sin_evaluacion'
            ? idEvaluacion
            : null;

        const registrosPrevios = await obtenerEvaluan(
          'id_evaluan, nota, id_evaluacion, id_discente, id_version',
          (q) => q.eq('id_version', idVersion).eq('id_discente', idDiscente)
        );

        const registroExistente =
          registrosPrevios && registrosPrevios.length > 0
            ? registrosPrevios[0]
            : null;

        // 1. Caso de eliminación o reseteo de nota
        if (nota === null || nota === undefined || String(nota).trim() === '') {
          if (registroExistente) {
            await eliminarEvaluan('id_evaluan', registroExistente.id_evaluan);
          }

          // Se actualiza el estado local reflejando el valor pendiente
          setClasesMatriculadas((prevClases) =>
            prevClases.map((clase) => {
              const actividadesActualizadas = clase.actividades.map((act) => {
                if (act.id_version === idVersion) {
                  return { ...act, nota: null, id_evaluan: null };
                }
                return act;
              });

              const cal = actividadesActualizadas.filter((a) => a.nota !== null);
              const totalCal = cal.length;
              const suma = cal.reduce((acc, curr) => acc + curr.nota, 0);
              const media = totalCal > 0 ? Math.round(suma / totalCal) : null;

              return {
                ...clase,
                actividades: actividadesActualizadas,
                estadisticas: {
                  totalActividades: actividadesActualizadas.length,
                  calificadas: totalCal,
                  notaMedia: media,
                  distribucion: {
                    suspensos: cal.filter((a) => a.nota < 50).length,
                    suficientes: cal.filter(
                      (a) => a.nota >= 50 && a.nota < 60
                    ).length,
                    bien: cal.filter((a) => a.nota >= 60 && a.nota < 70).length,
                    notables: cal.filter(
                      (a) => a.nota >= 70 && a.nota < 90
                    ).length,
                    sobresalientes: cal.filter((a) => a.nota >= 90).length
                  }
                }
              };
            })
          );

          mostrarExito('Calificación eliminada correctamente.');
          return { ok: true, data: null };
        }

        // 2. Validación numérica estricta entre 0 y 100 sin decimales
        const notaNumerica = Math.round(Number(nota));
        if (isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 100) {
          const mensajeInvalido =
            'La calificación debe ser un número entero comprendido entre 0 y 100.';
          mostrarError(mensajeInvalido);
          return { ok: false, error: { message: mensajeInvalido } };
        }

        let registroFinal = null;

        if (registroExistente) {
          const respuestaActualizar = await actualizarEvaluan(
            'id_evaluan',
            registroExistente.id_evaluan,
            {
              nota: notaNumerica,
              id_evaluacion: idEvaluacionEfectivo
            }
          );
          registroFinal = Array.isArray(respuestaActualizar)
            ? respuestaActualizar[0]
            : respuestaActualizar;
        } else {
          const respuestaInsertar = await insertarEvaluan({
            id_version: idVersion,
            id_evaluacion: idEvaluacionEfectivo,
            id_discente: idDiscente,
            nota: notaNumerica
          });
          registroFinal = Array.isArray(respuestaInsertar)
            ? respuestaInsertar[0]
            : respuestaInsertar;
        }

        const idEvaluanFinal =
          registroFinal?.id_evaluan ||
          registroExistente?.id_evaluan ||
          Date.now().toString();

        // 3. Se actualiza el estado local en memoria recalculando las estadísticas
        setClasesMatriculadas((prevClases) =>
          prevClases.map((clase) => {
            const actividadesActualizadas = clase.actividades.map((act) => {
              if (act.id_version === idVersion) {
                return {
                  ...act,
                  nota: notaNumerica,
                  id_evaluan: idEvaluanFinal,
                  id_evaluacion: idEvaluacionEfectivo
                };
              }
              return act;
            });

            const cal = actividadesActualizadas.filter((a) => a.nota !== null);
            const totalCal = cal.length;
            const suma = cal.reduce((acc, curr) => acc + curr.nota, 0);
            const media = totalCal > 0 ? Math.round(suma / totalCal) : null;

            return {
              ...clase,
              actividades: actividadesActualizadas,
              estadisticas: {
                totalActividades: actividadesActualizadas.length,
                calificadas: totalCal,
                notaMedia: media,
                distribucion: {
                  suspensos: cal.filter((a) => a.nota < 50).length,
                  suficientes: cal.filter(
                    (a) => a.nota >= 50 && a.nota < 60
                  ).length,
                  bien: cal.filter((a) => a.nota >= 60 && a.nota < 70).length,
                  notables: cal.filter((a) => a.nota >= 70 && a.nota < 90).length,
                  sobresalientes: cal.filter((a) => a.nota >= 90).length
                }
              }
            };
          })
        );

        mostrarExito('Calificación guardada correctamente.');
        return { ok: true, data: registroFinal };
      } catch (err) {
        console.error('Error al actualizar nota de la ficha:', err);
        const mensajeFallo =
          err.message || 'Error al persistir la calificación en la base de datos.';
        mostrarError(mensajeFallo);
        return { ok: false, error: err };
      } finally {
        setGuardando(false);
      }
    },
    [
      obtenerEvaluan,
      actualizarEvaluan,
      insertarEvaluan,
      eliminarEvaluan,
      mostrarExito,
      mostrarError
    ]
  );

  return {
    discente,
    aniosAcademicos,
    anioSeleccionado,
    setAnioSeleccionado,
    clasesMatriculadas,
    historialModulos: clasesMatriculadas,
    cargando,
    guardando,
    error,
    obtenerHistorialDiscente,
    actualizarNotaFicha
  };
};

export default useFichaDiscente;
