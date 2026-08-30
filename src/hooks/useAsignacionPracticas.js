import { useState, useEffect, useCallback, useMemo } from 'react';
import usePracticasContexto from './usePracticasContexto.js';
import useModulosContexto from './useModulosContexto.js';
import useCursosContexto from './useCursosContexto.js';
import useEvaluacionesContexto from './useEvaluacionesContexto.js';
import {
  obtenerEvaluacionesConDetalle,
  obtenerModulosPorCurso,
  obtenerPracticasPorModulo,
  obtenerPracticasEvaluacion,
  vincularPracticaAEvaluacion as vincularPracticaServicio,
  desvincularPracticaDeEvaluacion as desvincularPracticaServicio,
  vincularMultiplesPracticasAEvaluacion as vincularLoteServicio,
  desvincularMultiplesPracticasDeEvaluacion as desvincularLoteServicio
} from '../services/evaluacionService.js';

// Hook personalizado para gestionar la asignación de prácticas a periodos de evaluación
const useAsignacionPracticas = () => {
  // Datos de los contextos globales
  const { recargar: recargarPracticasContexto } = usePracticasContexto();
  const { datos: todosModulosContexto } = useModulosContexto();
  const { datos: todosCursosContexto } = useCursosContexto();
  const { datos: todasEvaluacionesContexto } = useEvaluacionesContexto();

  // Estados de filtros y selección
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Estados de datos
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicasDisponibles, setPracticasDisponibles] = useState([]);
  const [practicasEvaluacion, setPracticasEvaluacion] = useState([]);

  // Estados de control de carga y procesos asíncronos
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);
  const [guardandoLote, setGuardandoLote] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Se selecciona por defecto el último curso creado (el más reciente)
  useEffect(() => {
    if ((todosCursosContexto || []).length > 0 && !cursoSeleccionadoId) {
      const cursosOrdenados = [...todosCursosContexto].sort((a, b) => {
        const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fechaB - fechaA;
      });

      if (cursosOrdenados[0] && cursosOrdenados[0].id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId]);

  // Carga inicial de evaluaciones con detalle de Curso y Módulo
  const cargarEvaluaciones = useCallback(async () => {
    setCargandoGeneral(true);
    setErrorOperacion(null);
    try {
      const { data: evaluacionesDetalle, error } = await obtenerEvaluacionesConDetalle();
      if (!error && evaluacionesDetalle && evaluacionesDetalle.length > 0) {
        setTodasEvaluaciones(evaluacionesDetalle);
      } else if (todasEvaluacionesContexto && todasEvaluacionesContexto.length > 0) {
        const mapaCursos = new Map((todosCursosContexto || []).map((c) => [c.id_curso, c]));
        const mapaModulos = new Map((todosModulosContexto || []).map((m) => [m.id_modulo, m]));

        const evs = todasEvaluacionesContexto.map((ev) => ({
          ...ev,
          Cursos: mapaCursos.get(ev.id_curso) || null,
          Modulos: mapaModulos.get(ev.id_modulo) || null
        }));
        setTodasEvaluaciones(evs);
      }
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setErrorOperacion(err.message || 'Error al cargar evaluaciones.');
    } finally {
      setCargandoGeneral(false);
    }
  }, [todasEvaluacionesContexto, todosCursosContexto, todosModulosContexto]);

  useEffect(() => {
    cargarEvaluaciones();
  }, [cargarEvaluaciones]);

  // Actualización de módulos disponibles según el curso seleccionado
  useEffect(() => {
    const actualizarModulos = async () => {
      if (cursoSeleccionadoId) {
        const { data: mods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
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

  // Evaluaciones filtradas por curso y módulo
  const evaluacionesFiltradas = useMemo(() => {
    return (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso = !cursoSeleccionadoId || String(ev.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase();
      const coincideModulo = !moduloSeleccionadoId || String(ev.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase();
      return coincideCurso && coincideModulo;
    });
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Objeto de la evaluación seleccionada actualmente
  const evaluacionSeleccionada = useMemo(() => {
    if (!evaluacionSeleccionadaId) return null;
    return (todasEvaluaciones || []).find((ev) => String(ev.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase()) || null;
  }, [todasEvaluaciones, evaluacionSeleccionadaId]);

  // Conjunto con los identificadores de prácticas ya asignadas a la evaluación
  const idsPracticasAsignadas = useMemo(() => {
    return new Set((practicasEvaluacion || []).map((p) => String(p.id_practica).toLowerCase()));
  }, [practicasEvaluacion]);

  // Selección de una evaluación
  const seleccionarEvaluacion = useCallback((idEvaluacion) => {
    setEvaluacionSeleccionadaId(idEvaluacion);
    if (idEvaluacion) {
      const ev = (todasEvaluaciones || []).find((item) => String(item.id_evaluacion).toLowerCase() === String(idEvaluacion).toLowerCase());
      if (ev) {
        if (ev.id_curso && String(ev.id_curso) !== String(cursoSeleccionadoId)) {
          setCursoSeleccionadoId(ev.id_curso);
        }
        if (ev.id_modulo && String(ev.id_modulo) !== String(moduloSeleccionadoId)) {
          setModuloSeleccionadoId(ev.id_modulo);
        }
      }
    }
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Carga de prácticas asociadas a la evaluación en la tabla evaluan
  const cargarPracticasEvaluacion = useCallback(async (idEvaluacion) => {
    if (!idEvaluacion) {
      setPracticasEvaluacion([]);
      return;
    }
    try {
      const { data, error } = await obtenerPracticasEvaluacion(idEvaluacion);
      if (error) throw new Error(error);
      setPracticasEvaluacion(data || []);
    } catch (err) {
      console.error('Error al cargar prácticas de la evaluación:', err);
    }
  }, []);

  // Carga de todas las prácticas pertenecientes al módulo de la evaluación
  useEffect(() => {
    let activo = true;

    const cargarPracticasDelModulo = async () => {
      const idModulo = evaluacionSeleccionada?.id_modulo || evaluacionSeleccionada?.Modulos?.id_modulo || moduloSeleccionadoId;

      if (!idModulo) {
        if (activo) {
          setPracticasDisponibles([]);
          setPracticasEvaluacion([]);
        }
        return;
      }

      if (activo) setCargandoPracticas(true);

      try {
        const { data: practicasBD } = await obtenerPracticasPorModulo(idModulo);

        if (activo) {
          setPracticasDisponibles(practicasBD || []);
        }

        // Se cargan las prácticas asignadas en evaluan
        if (evaluacionSeleccionadaId && activo) {
          await cargarPracticasEvaluacion(evaluacionSeleccionadaId);
        }
      } catch (err) {
        console.error('Error al cargar prácticas del módulo:', err);
        if (activo) setErrorOperacion(err.message || 'Error al consultar prácticas.');
      } finally {
        if (activo) setCargandoPracticas(false);
      }
    };

    cargarPracticasDelModulo();

    return () => {
      activo = false;
    };
  }, [evaluacionSeleccionada, evaluacionSeleccionadaId, moduloSeleccionadoId, cargarPracticasEvaluacion]);

  // Alternar la vinculación de una práctica con actualización visual inmediata
  const alternarPractica = useCallback(async (practica) => {
    if (!evaluacionSeleccionadaId) {
      return { exito: false, error: 'Debe seleccionar una evaluación antes de asignar prácticas.' };
    }

    const idPracticaStr = String(practica.id_practica).toLowerCase();
    const yaAsignada = idsPracticasAsignadas.has(idPracticaStr);
    const nuevoEstado = !yaAsignada;

    setErrorOperacion(null);

    // Actualización visual inmediata
    setPracticasEvaluacion((prev) => {
      if (nuevoEstado) {
        const existe = prev.some((p) => String(p.id_practica).toLowerCase() === idPracticaStr);
        if (existe) return prev;
        return [...prev, { id_practica: practica.id_practica, practica, peso: 100 }];
      } else {
        return prev.filter((p) => String(p.id_practica).toLowerCase() !== idPracticaStr);
      }
    });

    try {
      if (nuevoEstado) {
        const resp = await vincularPracticaServicio({
          idPractica: practica.id_practica,
          idEvaluacion: evaluacionSeleccionadaId,
          idCurso: evaluacionSeleccionada?.id_curso || cursoSeleccionadoId,
          idModulo: evaluacionSeleccionada?.id_modulo || moduloSeleccionadoId,
          peso: 100
        });

        if (!resp.exito) throw new Error(resp.error || 'No se pudo vincular la práctica.');

        return {
          exito: true,
          accion: 'vinculada',
          mensaje: `Se ha vinculado la práctica "${practica.nombre}" a la evaluación.`
        };
      } else {
        const resp = await desvincularPracticaServicio({
          idPractica: practica.id_practica,
          idEvaluacion: evaluacionSeleccionadaId
        });

        if (!resp.exito) throw new Error(resp.error || 'No se pudo desvincular la práctica.');

        return {
          exito: true,
          accion: 'desvinculada',
          mensaje: `Se ha desvinculado la práctica "${practica.nombre}" de la evaluación.`
        };
      }
    } catch (err) {
      console.error('Error al alternar práctica en evaluación:', err);
      setErrorOperacion(err.message);

      // Reversión del estado en caso de error en la base de datos
      setPracticasEvaluacion((prev) => {
        if (nuevoEstado) {
          return prev.filter((p) => String(p.id_practica).toLowerCase() !== idPracticaStr);
        } else {
          const existe = prev.some((p) => String(p.id_practica).toLowerCase() === idPracticaStr);
          if (existe) return prev;
          return [...prev, { id_practica: practica.id_practica, practica, peso: 100 }];
        }
      });

      return { exito: false, error: err.message };
    }
  }, [evaluacionSeleccionadaId, evaluacionSeleccionada, cursoSeleccionadoId, moduloSeleccionadoId, idsPracticasAsignadas]);

  // Vincular todas las prácticas disponibles con actualización visual inmediata
  const vincularTodasPracticas = useCallback(async () => {
    if (!evaluacionSeleccionadaId || !evaluacionSeleccionada || practicasDisponibles.length === 0) {
      return { exito: false, error: 'No hay prácticas disponibles para vincular.' };
    }

    const idsFaltantes = practicasDisponibles
      .map((p) => p.id_practica)
      .filter((id) => !idsPracticasAsignadas.has(String(id).toLowerCase()));

    if (idsFaltantes.length === 0) {
      return { exito: true, mensaje: 'Todas las prácticas ya se encuentran asignadas.' };
    }

    const estadoPrevio = [...practicasEvaluacion];
    const nuevasAsignadas = practicasDisponibles.map((p) => ({
      id_practica: p.id_practica,
      practica: p,
      peso: 100
    }));

    setPracticasEvaluacion(nuevasAsignadas);
    setGuardandoLote(true);

    try {
      const resp = await vincularLoteServicio({
        idsPracticas: idsFaltantes,
        idEvaluacion: evaluacionSeleccionadaId,
        idCurso: evaluacionSeleccionada.id_curso || cursoSeleccionadoId,
        idModulo: evaluacionSeleccionada.id_modulo || moduloSeleccionadoId,
        peso: 100
      });

      if (!resp.exito) {
        setPracticasEvaluacion(estadoPrevio);
        throw new Error(resp.error);
      }

      return {
        exito: true,
        mensaje: `Se han asignado ${idsFaltantes.length} prácticas a la evaluación.`
      };
    } catch (err) {
      console.error('Error al vincular todas las prácticas:', err);
      return { exito: false, error: err.message };
    } finally {
      setGuardandoLote(false);
    }
  }, [evaluacionSeleccionadaId, evaluacionSeleccionada, cursoSeleccionadoId, moduloSeleccionadoId, practicasDisponibles, idsPracticasAsignadas, practicasEvaluacion]);

  // Desvincular todas las prácticas con actualización visual inmediata
  const desvincularTodasPracticas = useCallback(async () => {
    if (!evaluacionSeleccionadaId || practicasEvaluacion.length === 0) {
      return { exito: false, error: 'No hay prácticas asignadas para desvincular.' };
    }

    const estadoPrevio = [...practicasEvaluacion];
    const idsAsignadas = practicasEvaluacion.map((p) => p.id_practica);

    setPracticasEvaluacion([]);
    setGuardandoLote(true);

    try {
      const resp = await desvincularLoteServicio({
        idsPracticas: idsAsignadas,
        idEvaluacion: evaluacionSeleccionadaId
      });

      if (!resp.exito) {
        setPracticasEvaluacion(estadoPrevio);
        throw new Error(resp.error);
      }

      return {
        exito: true,
        mensaje: 'Se han desvinculado todas las prácticas de la evaluación.'
      };
    } catch (err) {
      console.error('Error al desvincular todas las prácticas:', err);
      return { exito: false, error: err.message };
    } finally {
      setGuardandoLote(false);
    }
  }, [evaluacionSeleccionadaId, practicasEvaluacion]);

  // Recarga completa de datos
  const recargar = useCallback(async () => {
    await Promise.all([
      cargarEvaluaciones(),
      recargarPracticasContexto()
    ]);
    if (evaluacionSeleccionadaId) {
      await cargarPracticasEvaluacion(evaluacionSeleccionadaId);
    }
  }, [cargarEvaluaciones, recargarPracticasContexto, evaluacionSeleccionadaId, cargarPracticasEvaluacion]);

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
    practicasDisponibles,
    practicasEvaluacion,
    idsPracticasAsignadas,
    cargando: cargandoGeneral || cargandoPracticas,
    guardandoLote,
    error: errorOperacion,
    alternarPractica,
    vincularTodasPracticas,
    desvincularTodasPracticas,
    recargar
  };
};

export default useAsignacionPracticas;
