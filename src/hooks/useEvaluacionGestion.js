import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import {
  obtenerEvaluacionesConDetalle,
  obtenerModulosPorCurso,
  obtenerPracticasPorModulo,
  obtenerEstructuraRAModulo,
  obtenerAsignacionesTrabajanModulo,
  guardarAsignacionTrabajan,
  eliminarAsignacionTrabajan,
  obtenerPracticasEvaluacion,
  vincularPracticaAEvaluacion as vincularPracticaAEvaluacionServicio,
  desvincularPracticaDeEvaluacion as desvincularPracticaDeEvaluacionServicio
} from '../services/evaluacionService.js';

// Hook para gestionar el estado integral de la página de evaluaciones y el mapeo de prácticas a RA y CE
const useEvaluacionGestion = () => {
  // Se cargan los cursos base mediante useDatos
  const { datos: cursos, cargando: cargandoCursos, obtenerDatos: obtenerCursos } = useDatos('Cursos');
  const { datos: todosModulos, obtenerDatos: obtenerTodosModulos } = useDatos('Modulos');

  // Estados de selección de filtros
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Estados de datos derivados
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [estructuraRA, setEstructuraRA] = useState([]);
  const [asignacionesTrabajan, setAsignacionesTrabajan] = useState([]);
  const [practicasEvaluacion, setPracticasEvaluacion] = useState([]);

  // Estados de control de carga y procesos
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Se realiza la carga inicial de cursos, módulos y evaluaciones
  const cargarDatosIniciales = useCallback(async () => {
    setCargandoGeneral(true);
    setErrorOperacion(null);
    try {
      await Promise.all([
        obtenerCursos('*'),
        obtenerTodosModulos('*')
      ]);

      const { data: evaluacionesDetalle, error: errorEv } = await obtenerEvaluacionesConDetalle();
      if (errorEv) throw new Error(errorEv);
      setTodasEvaluaciones(evaluacionesDetalle || []);
    } catch (err) {
      console.error('Error al cargar datos iniciales de evaluaciones:', err);
      setErrorOperacion(err.message || 'Error al cargar los datos iniciales.');
    } finally {
      setCargandoGeneral(false);
    }
  }, [obtenerCursos, obtenerTodosModulos]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Se actualizan los módulos disponibles cuando cambia el curso seleccionado
  useEffect(() => {
    const actualizarModulosCurso = async () => {
      if (cursoSeleccionadoId) {
        const { data: mods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (mods && mods.length > 0) {
          setModulosDisponibles(mods);
        } else {
          // Si no hay módulos en imparte, se muestran todos los módulos del sistema
          setModulosDisponibles(todosModulos || []);
        }
      } else {
        setModulosDisponibles(todosModulos || []);
      }
    };
    actualizarModulosCurso();
  }, [cursoSeleccionadoId, todosModulos]);

  // Lista de evaluaciones filtradas por el curso y módulo seleccionados
  const evaluacionesFiltradas = useMemo(() => {
    return (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso = !cursoSeleccionadoId || ev.id_curso === cursoSeleccionadoId;
      const coincideModulo = !moduloSeleccionadoId || ev.id_modulo === moduloSeleccionadoId;
      return coincideCurso && coincideModulo;
    });
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Objeto de la evaluación actualmente seleccionada
  const evaluacionSeleccionada = useMemo(() => {
    return (todasEvaluaciones || []).find((ev) => ev.id_evaluacion === evaluacionSeleccionadaId) || null;
  }, [todasEvaluaciones, evaluacionSeleccionadaId]);

  // Se sincroniza el módulo y curso si se selecciona una evaluación directamente
  const seleccionarEvaluacion = useCallback((idEvaluacion) => {
    setEvaluacionSeleccionadaId(idEvaluacion);
    if (idEvaluacion) {
      const ev = (todasEvaluaciones || []).find((item) => item.id_evaluacion === idEvaluacion);
      if (ev) {
        if (ev.id_curso && ev.id_curso !== cursoSeleccionadoId) {
          setCursoSeleccionadoId(ev.id_curso);
        }
        if (ev.id_modulo && ev.id_modulo !== moduloSeleccionadoId) {
          setModuloSeleccionadoId(ev.id_modulo);
        }
      }
    }
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Se cargan las prácticas, RA, CE y asignaciones cuando cambia el módulo seleccionado
  const cargarDetallesModulo = useCallback(async (idModulo) => {
    if (!idModulo) {
      setPracticas([]);
      setEstructuraRA([]);
      setAsignacionesTrabajan([]);
      return;
    }
    setCargandoDetalles(true);
    try {
      const [respPracticas, respRA, respTrabajan] = await Promise.all([
        obtenerPracticasPorModulo(idModulo),
        obtenerEstructuraRAModulo(idModulo),
        obtenerAsignacionesTrabajanModulo(idModulo)
      ]);

      setPracticas(respPracticas.data || []);
      setEstructuraRA(respRA.data || []);
      setAsignacionesTrabajan(respTrabajan.data || []);
    } catch (err) {
      console.error('Error al cargar detalles del módulo:', err);
      setErrorOperacion('Error al cargar la información del módulo.');
    } finally {
      setCargandoDetalles(false);
    }
  }, []);

  useEffect(() => {
    cargarDetallesModulo(moduloSeleccionadoId);
  }, [moduloSeleccionadoId, cargarDetallesModulo]);

  // Se cargan las prácticas asociadas a la evaluación seleccionada
  const cargarPracticasEvaluacionActual = useCallback(async (idEvaluacion) => {
    if (!idEvaluacion) {
      setPracticasEvaluacion([]);
      return;
    }
    try {
      const { data } = await obtenerPracticasEvaluacion(idEvaluacion);
      setPracticasEvaluacion(data || []);
    } catch (err) {
      console.error('Error al cargar prácticas de la evaluación:', err);
    }
  }, []);

  useEffect(() => {
    cargarPracticasEvaluacionActual(evaluacionSeleccionadaId);
  }, [evaluacionSeleccionadaId, cargarPracticasEvaluacionActual]);

  // Se asigna una práctica a un criterio de evaluación guardando en la tabla trabajan
  const asignarPracticaACE = useCallback(async ({ id_ce, id_practica, porcentaje, descripcion = '', vincularEvaluacion = false }) => {
    setGuardando(true);
    setErrorOperacion(null);
    try {
      const { data, error } = await guardarAsignacionTrabajan({
        id_ce,
        id_practica,
        porcentaje,
        descripcion
      });

      if (error) throw new Error(error);

      // Se actualiza el estado local de asignaciones trabajan
      setAsignacionesTrabajan((prev) => {
        const existeIndex = prev.findIndex((item) => item.id_ce === id_ce && item.id_practica === id_practica);
        if (existeIndex >= 0) {
          const copia = [...prev];
          copia[existeIndex] = data;
          return copia;
        }
        return [...prev, data];
      });

      // Si se solicitó vincular a la evaluación actual seleccionada
      if (vincularEvaluacion && evaluacionSeleccionadaId) {
        await vincularPracticaAEvaluacionServicio({
          idPractica: id_practica,
          idEvaluacion: evaluacionSeleccionadaId,
          idCurso: cursoSeleccionadoId,
          idModulo: moduloSeleccionadoId,
          peso: 100
        });
        await cargarPracticasEvaluacionActual(evaluacionSeleccionadaId);
      }

      return { exito: true, data };
    } catch (err) {
      console.error('Error al asignar práctica a CE:', err);
      setErrorOperacion(err.message || 'Error al guardar la asignación.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [evaluacionSeleccionadaId, cursoSeleccionadoId, moduloSeleccionadoId, cargarPracticasEvaluacionActual]);

  // Se desvincula una práctica de un criterio de evaluación eliminando de trabajan
  const desvincularPracticaDeCE = useCallback(async (idTrabajan) => {
    setGuardando(true);
    setErrorOperacion(null);
    try {
      const { exito, error } = await eliminarAsignacionTrabajan(idTrabajan);
      if (!exito) throw new Error(error);

      setAsignacionesTrabajan((prev) => prev.filter((item) => item.id_trabajan !== idTrabajan));
      return { exito: true };
    } catch (err) {
      console.error('Error al desvincular práctica de CE:', err);
      setErrorOperacion(err.message || 'Error al eliminar la asignación.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, []);

  // Se vincula una práctica a la evaluación actual (tabla evaluan)
  const vincularPracticaAEvaluacion = useCallback(async (idPractica, peso = 100) => {
    if (!evaluacionSeleccionadaId) {
      return { exito: false, error: 'Debe seleccionar una evaluación previamente.' };
    }
    setGuardando(true);
    try {
      const respuesta = await vincularPracticaAEvaluacionServicio({
        idPractica,
        idEvaluacion: evaluacionSeleccionadaId,
        idCurso: cursoSeleccionadoId,
        idModulo: moduloSeleccionadoId,
        peso
      });

      if (respuesta.exito) {
        await cargarPracticasEvaluacionActual(evaluacionSeleccionadaId);
      }
      return respuesta;
    } catch (err) {
      console.error('Error al vincular práctica a la evaluación:', err);
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [evaluacionSeleccionadaId, cursoSeleccionadoId, moduloSeleccionadoId, cargarPracticasEvaluacionActual]);

  // Se desvincula una práctica de la evaluación actual (tabla evaluan)
  const desvincularPracticaDeEvaluacion = useCallback(async (idPractica) => {
    if (!evaluacionSeleccionadaId) return { exito: false };
    setGuardando(true);
    try {
      const respuesta = await desvincularPracticaDeEvaluacionServicio({
        idPractica,
        idEvaluacion: evaluacionSeleccionadaId
      });

      if (respuesta.exito) {
        await cargarPracticasEvaluacionActual(evaluacionSeleccionadaId);
      }
      return respuesta;
    } catch (err) {
      console.error('Error al desvincular práctica de la evaluación:', err);
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [evaluacionSeleccionadaId, cargarPracticasEvaluacionActual]);

  // Se fuerza la recarga completa de los datos
  const recargarTodo = useCallback(async () => {
    await cargarDatosIniciales();
    if (moduloSeleccionadoId) {
      await cargarDetallesModulo(moduloSeleccionadoId);
    }
    if (evaluacionSeleccionadaId) {
      await cargarPracticasEvaluacionActual(evaluacionSeleccionadaId);
    }
  }, [cargarDatosIniciales, moduloSeleccionadoId, cargarDetallesModulo, evaluacionSeleccionadaId, cargarPracticasEvaluacionActual]);

  return {
    cursos,
    todosModulos,
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
    practicas,
    estructuraRA,
    asignacionesTrabajan,
    practicasEvaluacion,
    cargando: cargandoGeneral || cargandoCursos || cargandoDetalles,
    guardando,
    error: errorOperacion,
    asignarPracticaACE,
    desvincularPracticaDeCE,
    vincularPracticaAEvaluacion,
    desvincularPracticaDeEvaluacion,
    recargarTodo
  };
};

export default useEvaluacionGestion;
