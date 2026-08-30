import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import useCursosContexto from "./useCursosContexto.js";
import useModulosContexto from "./useModulosContexto.js";
import useEvaluacionesContexto from "./useEvaluacionesContexto.js";
import useToast from "./useToast.js";
import {
  obtenerEvaluacionesConDetalle,
  obtenerModulosPorCurso,
} from "../services/evaluacionService.js";
import {
  obtenerPracticasEvaluacion,
  getDiscentesPorPractica,
  guardarNotaPractica,
  guardarNotasLote,
} from "../services/calificacionService.js";

// Hook personalizado para la gestión integral del módulo de calificación de prácticas
const useCalificar = () => {
  const location = useLocation();
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Datos provenientes de los contextos globales
  const { datos: todosCursosContexto } = useCursosContexto();
  const { datos: todosModulosContexto } = useModulosContexto();
  const { datos: todasEvaluacionesContexto } = useEvaluacionesContexto();

  // Estados para los filtros de selección
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(
    () => location.state?.idCurso || null
  );
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(
    () => location.state?.idModulo || null
  );
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(
    () => location.state?.idEvaluacion || null
  );
  const [practicaSeleccionadaId, setPracticaSeleccionadaId] = useState(
    () => location.state?.idPractica || null
  );

  // Estados de datos derivados
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicasEvaluacion, setPracticasEvaluacion] = useState([]);
  const [discentesNotas, setDiscentesNotas] = useState([]);

  // Estados de control de carga y guardado
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);
  const [cargandoDiscentes, setCargandoDiscentes] = useState(false);
  const [guardandoIds, setGuardandoIds] = useState(new Set());
  const [erroresFilas, setErroresFilas] = useState({});

  // Sincronización cuando se navega con un nuevo location.state
  useEffect(() => {
    const estadoNav = location.state;
    if (estadoNav) {
      if (estadoNav.idCurso) setCursoSeleccionadoId(estadoNav.idCurso);
      if (estadoNav.idModulo) setModuloSeleccionadoId(estadoNav.idModulo);
      if (estadoNav.idEvaluacion) setEvaluacionSeleccionadaId(estadoNav.idEvaluacion);
      if (estadoNav.idPractica) setPracticaSeleccionadaId(estadoNav.idPractica);
    }
  }, [location.state]);

  // Se selecciona automáticamente el curso más reciente por defecto si no viene fijado
  useEffect(() => {
    if ((todosCursosContexto || []).length > 0 && !cursoSeleccionadoId && !location.state?.idCurso) {
      const cursosOrdenados = [...todosCursosContexto].sort((a, b) => {
        const fA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fB - fA;
      });

      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId, location.state]);

  // Carga inicial de todas las evaluaciones con detalle de cursos y módulos
  const cargarEvaluaciones = useCallback(async () => {
    setCargandoGeneral(true);
    try {
      const { data: evsDetalle, error } = await obtenerEvaluacionesConDetalle();
      if (!error && evsDetalle && evsDetalle.length > 0) {
        setTodasEvaluaciones(evsDetalle);
      } else if (
        todasEvaluacionesContexto &&
        todasEvaluacionesContexto.length > 0
      ) {
        const mapaCursos = new Map(
          (todosCursosContexto || []).map((c) => [c.id_curso, c]),
        );
        const mapaModulos = new Map(
          (todosModulosContexto || []).map((m) => [m.id_modulo, m]),
        );

        const evs = todasEvaluacionesContexto.map((ev) => ({
          ...ev,
          Cursos: mapaCursos.get(ev.id_curso) || null,
          Modulos: mapaModulos.get(ev.id_modulo) || null,
        }));
        setTodasEvaluaciones(evs);
      }
    } catch (err) {
      console.error("Error al cargar evaluaciones en useCalificar:", err);
    } finally {
      setCargandoGeneral(false);
    }
  }, [todasEvaluacionesContexto, todosCursosContexto, todosModulosContexto]);

  useEffect(() => {
    cargarEvaluaciones();
  }, [cargarEvaluaciones]);

  // Se actualizan los módulos disponibles cuando cambia el curso seleccionado
  useEffect(() => {
    const actualizarModulos = async () => {
      if (cursoSeleccionadoId) {
        const { data: mods } =
          await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (mods && mods.length > 0) {
          setModulosDisponibles(mods);
        } else {
          setModulosDisponibles(todosModulosContexto || []);
        }
      } else {
        setModulosDisponibles(todosModulosContexto || []);
      }
    };
    actualizarModulos();
  }, [cursoSeleccionadoId, todosModulosContexto]);

  // Lista de evaluaciones filtradas por el curso y módulo actuales
  const evaluacionesFiltradas = useMemo(() => {
    return (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso =
        !cursoSeleccionadoId ||
        String(ev.id_curso).toLowerCase() ===
          String(cursoSeleccionadoId).toLowerCase();
      const coincideModulo =
        !moduloSeleccionadoId ||
        String(ev.id_modulo).toLowerCase() ===
          String(moduloSeleccionadoId).toLowerCase();
      return coincideCurso && coincideModulo;
    });
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Objeto de la evaluación actualmente seleccionada
  const evaluacionSeleccionada = useMemo(() => {
    if (!evaluacionSeleccionadaId) return null;
    return (
      (todasEvaluaciones || []).find(
        (ev) =>
          String(ev.id_evaluacion).toLowerCase() ===
          String(evaluacionSeleccionadaId).toLowerCase(),
      ) || null
    );
  }, [todasEvaluaciones, evaluacionSeleccionadaId]);

  // Selección de una evaluación con sincronización de curso y módulo si procede
  const seleccionarEvaluacion = useCallback(
    (idEvaluacion) => {
      setEvaluacionSeleccionadaId(idEvaluacion);
      setPracticaSeleccionadaId(null);
      setDiscentesNotas([]);

      if (idEvaluacion) {
        const ev = (todasEvaluaciones || []).find(
          (item) =>
            String(item.id_evaluacion).toLowerCase() ===
            String(idEvaluacion).toLowerCase(),
        );
        if (ev) {
          if (
            ev.id_curso &&
            String(ev.id_curso) !== String(cursoSeleccionadoId)
          ) {
            setCursoSeleccionadoId(ev.id_curso);
          }
          if (
            ev.id_modulo &&
            String(ev.id_modulo) !== String(moduloSeleccionadoId)
          ) {
            setModuloSeleccionadoId(ev.id_modulo);
          }
        }
      }
    },
    [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId],
  );

  // Carga de prácticas asignadas a la evaluación seleccionada
  const cargarPracticasDeEvaluacion = useCallback(async (idEvaluacion) => {
    if (!idEvaluacion) {
      setPracticasEvaluacion([]);
      setPracticaSeleccionadaId(null);
      return;
    }

    setCargandoPracticas(true);
    try {
      const { data, error } = await obtenerPracticasEvaluacion(idEvaluacion);
      if (error) throw new Error(error);
      const lista = data || [];
      setPracticasEvaluacion(lista);

      // Si no hay práctica seleccionada y la lista no está vacía, se selecciona la primera
      setPracticaSeleccionadaId((prevId) => {
        if (
          prevId &&
          lista.some(
            (p) =>
              String(p.id_practica).toLowerCase() ===
              String(prevId).toLowerCase(),
          )
        ) {
          return prevId;
        }
        return lista.length > 0 ? lista[0].id_practica : null;
      });
    } catch (err) {
      console.error("Error al cargar prácticas de la evaluación:", err);
      setPracticasEvaluacion([]);
    } finally {
      setCargandoPracticas(false);
    }
  }, []);

  useEffect(() => {
    cargarPracticasDeEvaluacion(evaluacionSeleccionadaId);
  }, [evaluacionSeleccionadaId, cargarPracticasDeEvaluacion]);

  // Objeto de la práctica actualmente seleccionada
  const practicaSeleccionada = useMemo(() => {
    if (!practicaSeleccionadaId) return null;
    return (
      (practicasEvaluacion || []).find(
        (p) =>
          String(p.id_practica).toLowerCase() ===
          String(practicaSeleccionadaId).toLowerCase(),
      ) || null
    );
  }, [practicasEvaluacion, practicaSeleccionadaId]);

  // Carga de los discentes con sus calificaciones para la práctica y evaluación seleccionadas
  const cargarDiscentesPractica = useCallback(
    async (idEvaluacion, idPractica) => {
      if (!idEvaluacion || !idPractica) {
        setDiscentesNotas([]);
        return;
      }

      setCargandoDiscentes(true);
      try {
        const evActual = (todasEvaluaciones || []).find(
          (item) =>
            String(item.id_evaluacion).toLowerCase() ===
            String(idEvaluacion).toLowerCase(),
        );

        const idCurso = evActual?.id_curso || cursoSeleccionadoId;
        const idModulo = evActual?.id_modulo || moduloSeleccionadoId;

        const { data, error } = await getDiscentesPorPractica({
          idEvaluacion,
          idPractica,
          idCurso,
          idModulo,
        });

        if (error) throw new Error(error);
        setDiscentesNotas(data || []);
        setErroresFilas({});
      } catch (err) {
        console.error("Error al cargar discentes de la práctica:", err);
        setDiscentesNotas([]);
      } finally {
        setCargandoDiscentes(false);
      }
    },
    [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId],
  );

  useEffect(() => {
    if (evaluacionSeleccionadaId && practicaSeleccionadaId) {
      cargarDiscentesPractica(evaluacionSeleccionadaId, practicaSeleccionadaId);
    } else {
      setDiscentesNotas([]);
    }
  }, [
    evaluacionSeleccionadaId,
    practicaSeleccionadaId,
    cargarDiscentesPractica,
  ]);

  // Selección manual de una práctica
  const seleccionarPractica = useCallback((idPractica) => {
    setPracticaSeleccionadaId(idPractica);
  }, []);

  // Guardado automático de la nota de un discente con actualización optimista y rollback ante fallos
  const guardarNota = useCallback(
    async (idDiscente, nuevaNota) => {
      if (!evaluacionSeleccionadaId || !practicaSeleccionadaId || !idDiscente) {
        return { exito: false, error: "Contexto de evaluación incompleto." };
      }

      // Se localiza el discente en el estado actual
      const discenteActual = discentesNotas.find(
        (d) => d.id_discente === idDiscente,
      );
      if (!discenteActual)
        return { exito: false, error: "Discente no encontrado." };

      // Si la nota no ha cambiado, no se realiza ninguna petición
      const notaOriginal = discenteActual.nota;
      const esVacia =
        nuevaNota === null || nuevaNota === undefined || nuevaNota === "";
      const notaAComparar = esVacia ? null : parseInt(nuevaNota, 10);

      if (notaOriginal === notaAComparar) {
        return { exito: true, sinCambios: true };
      }

      // Validación de rango (0 a 100)
      if (!esVacia) {
        if (isNaN(notaAComparar) || notaAComparar < 0 || notaAComparar > 100) {
          setErroresFilas((prev) => ({
            ...prev,
            [idDiscente]: "La nota debe ser un número entero entre 0 y 100.",
          }));
          mostrarAdvertencia(
            "Nota fuera de rango",
            "La calificación debe ser un valor entero entre 0 y 100.",
          );
          return { exito: false, error: "Nota fuera de rango" };
        }
      }

      // Se limpia cualquier error previo de esta fila
      setErroresFilas((prev) => {
        const copia = { ...prev };
        delete copia[idDiscente];
        return copia;
      });

      // Actualización optimista del estado visual
      setDiscentesNotas((prev) =>
        prev.map((d) =>
          d.id_discente === idDiscente ? { ...d, nota: notaAComparar } : d,
        ),
      );

      // Se registra el discente en el conjunto de guardado activo
      setGuardandoIds((prev) => new Set(prev).add(idDiscente));

      try {
        const respuesta = await guardarNotaPractica({
          idEvaluacion: evaluacionSeleccionadaId,
          idPractica: practicaSeleccionadaId,
          idDiscente,
          nota: notaAComparar,
          idEvaluan: discenteActual.id_evaluan,
          peso: discenteActual.peso || 100,
        });

        if (!respuesta.exito) {
          throw new Error(respuesta.error || "Error al persistir la nota.");
        }

        // Se actualiza el id_evaluan si fue generado en la inserción
        if (respuesta.idEvaluan && !discenteActual.id_evaluan) {
          setDiscentesNotas((prev) =>
            prev.map((d) =>
              d.id_discente === idDiscente
                ? { ...d, id_evaluan: respuesta.idEvaluan }
                : d,
            ),
          );
        }

        // Notificación Toast de confirmación de guardado
        const detalleToast =
          notaAComparar !== null
            ? `Nota guardada: ${notaAComparar} (${discenteActual.nombre} ${discenteActual.apellidos})`
            : `Nota eliminada (${discenteActual.nombre} ${discenteActual.apellidos})`;

        mostrarExito("Calificación guardada", detalleToast);

        // Se actualiza el contador de calificados en la lista de prácticas
        setPracticasEvaluacion((prev) =>
          prev.map((p) => {
            if (
              String(p.id_practica).toLowerCase() ===
              String(practicaSeleccionadaId).toLowerCase()
            ) {
              const cambioCalificado =
                notaOriginal === null && notaAComparar !== null
                  ? 1
                  : notaOriginal !== null && notaAComparar === null
                    ? -1
                    : 0;

              return {
                ...p,
                totalCalificados: Math.max(
                  0,
                  (p.totalCalificados || 0) + cambioCalificado,
                ),
              };
            }
            return p;
          }),
        );

        return { exito: true, data: respuesta.data };
      } catch (err) {
        console.error("Error al guardar nota automática:", err);

        // Reversión del estado a la nota previa
        setDiscentesNotas((prev) =>
          prev.map((d) =>
            d.id_discente === idDiscente ? { ...d, nota: notaOriginal } : d,
          ),
        );

        setErroresFilas((prev) => ({
          ...prev,
          [idDiscente]: err.message || "Error al guardar en la base de datos.",
        }));

        mostrarError(
          "Error al guardar nota",
          `No se pudo registrar la nota de ${discenteActual.nombre}: ${err.message}`,
        );

        return { exito: false, error: err.message };
      } finally {
        setGuardandoIds((prev) => {
          const copia = new Set(prev);
          copia.delete(idDiscente);
          return copia;
        });
      }
    },
    [
      evaluacionSeleccionadaId,
      practicaSeleccionadaId,
      discentesNotas,
      mostrarExito,
      mostrarError,
      mostrarAdvertencia,
    ],
  );

  // Calificar a todos los discentes con una nota fija o por defecto
  const calificarMasivo = useCallback(
    async (notaComun) => {
      if (
        !evaluacionSeleccionadaId ||
        !practicaSeleccionadaId ||
        discentesNotas.length === 0
      ) {
        return { exito: false, error: "No hay discentes para calificar." };
      }

      const numNota =
        notaComun !== null && notaComun !== undefined && notaComun !== ""
          ? parseInt(notaComun, 10)
          : null;

      if (
        numNota !== null &&
        (isNaN(numNota) || numNota < 0 || numNota > 100)
      ) {
        mostrarAdvertencia(
          "Nota no válida",
          "La nota debe estar entre 0 y 100.",
        );
        return { exito: false, error: "Nota no válida" };
      }

      const asignaciones = discentesNotas.map((d) => ({
        id_discente: d.id_discente,
        id_evaluan: d.id_evaluan,
        nota: numNota,
        peso: d.peso || 100,
      }));

      setCargandoDiscentes(true);
      try {
        const res = await guardarNotasLote({
          idEvaluacion: evaluacionSeleccionadaId,
          idPractica: practicaSeleccionadaId,
          calificaciones: asignaciones,
        });

        if (!res.exito) throw new Error(res.error);

        mostrarExito(
          "Calificación masiva completada",
          numNota !== null
            ? `Se asignó la nota ${numNota} a todos los discentes.`
            : "Se han vaciado las notas de todos los discentes.",
        );

        await cargarDiscentesPractica(
          evaluacionSeleccionadaId,
          practicaSeleccionadaId,
        );
        await cargarPracticasDeEvaluacion(evaluacionSeleccionadaId);
        return { exito: true };
      } catch (err) {
        console.error("Error al calificar masivamente:", err);
        mostrarError(
          "Error masivo",
          err.message || "No se pudieron actualizar las calificaciones.",
        );
        return { exito: false, error: err.message };
      } finally {
        setCargandoDiscentes(false);
      }
    },
    [
      evaluacionSeleccionadaId,
      practicaSeleccionadaId,
      discentesNotas,
      mostrarExito,
      mostrarError,
      mostrarAdvertencia,
      cargarDiscentesPractica,
      cargarPracticasDeEvaluacion,
    ],
  );

  // Estadísticas calculadas de la práctica seleccionada
  const estadisticas = useMemo(() => {
    const total = discentesNotas.length;
    const conNota = discentesNotas.filter(
      (d) => d.nota !== null && d.nota !== undefined,
    );
    const calificados = conNota.length;
    const pendientes = total - calificados;
    const aprobados = conNota.filter((d) => Number(d.nota) >= 50).length;
    const suspensos = conNota.filter((d) => Number(d.nota) < 50).length;
    const sobresalientes = conNota.filter((d) => Number(d.nota) >= 90).length;

    const suma = conNota.reduce((acc, d) => acc + Number(d.nota), 0);
    const media = calificados > 0 ? (suma / calificados).toFixed(0) : "-";
    const porcentajeCompletado =
      total > 0 ? Math.round((calificados / total) * 100) : 0;

    return {
      total,
      calificados,
      pendientes,
      aprobados,
      suspensos,
      sobresalientes,
      media,
      porcentajeCompletado,
    };
  }, [discentesNotas]);

  // Recarga completa de los datos de la pantalla
  const recargar = useCallback(async () => {
    await cargarEvaluaciones();
    if (evaluacionSeleccionadaId) {
      await cargarPracticasDeEvaluacion(evaluacionSeleccionadaId);
      if (practicaSeleccionadaId) {
        await cargarDiscentesPractica(
          evaluacionSeleccionadaId,
          practicaSeleccionadaId,
        );
      }
    }
  }, [
    cargarEvaluaciones,
    evaluacionSeleccionadaId,
    practicaSeleccionadaId,
    cargarPracticasDeEvaluacion,
    cargarDiscentesPractica,
  ]);

  return {
    cursos: todosCursosContexto,
    modulosDisponibles,
    todasEvaluaciones,
    evaluacionesFiltradas,
    evaluacionSeleccionada,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    practicasEvaluacion,
    practicaSeleccionadaId,
    practicaSeleccionada,
    seleccionarPractica,
    discentesNotas,
    estadisticas,
    cargando: cargandoGeneral || cargandoPracticas,
    cargandoDiscentes,
    guardandoIds,
    erroresFilas,
    guardarNota,
    calificarMasivo,
    recargar,
  };
};

export default useCalificar;
