import { useState, useEffect, useCallback, useMemo } from 'react';
import useModulosContexto from './useModulosContexto.js';
import useCursosContexto from './useCursosContexto.js';
import useEvaluacionesContexto from './useEvaluacionesContexto.js';
import useToast from './useToast.js';
import {
  obtenerEvaluacionesConDetalle,
  obtenerModulosPorCurso,
  obtenerEstructuraRAModulo,
  obtenerRAEvaluacion,
  obtenerTodasAsignacionesRAEvaluacion,
  vincularRAAEvaluacion,
  desvincularRADeEvaluacion,
  vincularMultiplesRAAEvaluacion,
  desvincularMultiplesRADeEvaluacion,
  ordenarEvaluaciones
} from '../services/evaluacionService.js';
import { supabase } from '../services/supabaseClient.js';
import { formatearTextoRA } from '../services/informesService.js';

// Hook personalizado para gestionar la asignación de Resultados de Aprendizaje (RA) a periodos de evaluación
const useAsignacionRA = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  // Se obtienen los datos de los contextos globales
  const { datos: todosModulosContexto } = useModulosContexto();
  const { datos: todosCursosContexto } = useCursosContexto();
  const { datos: todasEvaluacionesContexto } = useEvaluacionesContexto();

  // Estados de selección de filtros principales
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Estados de datos
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [listaRA, setListaRA] = useState([]);
  const [asignacionesRA, setAsignacionesRA] = useState([]); // [{ id_ra, id_evaluacion, ... }]

  // Estados de control de carga y procesos asíncronos
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoRA, setCargandoRA] = useState(false);
  const [guardandoLote, setGuardandoLote] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Se selecciona automáticamente por defecto el curso académico más reciente
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

  // Se cargan las evaluaciones con su información detallada
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

  // Se actualizan los módulos disponibles según el curso seleccionado
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

  // Evaluaciones filtradas por curso y módulo seleccionados (excluyendo Final que es automática)
  const evaluacionesFiltradas = useMemo(() => {
    const lista = (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso = !cursoSeleccionadoId || String(ev.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase();
      const coincideModulo = !moduloSeleccionadoId || String(ev.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase();
      return coincideCurso && coincideModulo;
    });

    return ordenarEvaluaciones(lista);
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Evaluaciones disponibles para asignación (Primera, Segunda, Tercera y Extraordinaria)
  const evaluacionesAsignables = useMemo(() => {
    return evaluacionesFiltradas.filter((ev) => {
      const nombreNorm = (ev.nombre || '').toLowerCase();
      // Se excluyen evaluaciones de tipo Final u Ordinaria Final ya que abarcan automáticamente todos los RA
      return !nombreNorm.includes('final');
    });
  }, [evaluacionesFiltradas]);

  // Objeto de la evaluación seleccionada actualmente
  const evaluacionSeleccionada = useMemo(() => {
    if (!evaluacionSeleccionadaId) return null;
    return (todasEvaluaciones || []).find(
      (ev) => String(ev.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase()
    ) || null;
  }, [todasEvaluaciones, evaluacionSeleccionadaId]);

  // Se selecciona por defecto la primera evaluación cuando se filtra un módulo
  useEffect(() => {
    if (evaluacionesAsignables.length > 0) {
      const existe = evaluacionesAsignables.some(
        (ev) => String(ev.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase()
      );
      if (!existe) {
        setEvaluacionSeleccionadaId(evaluacionesAsignables[0].id_evaluacion);
      }
    } else if (evaluacionesFiltradas.length > 0 && !evaluacionSeleccionadaId) {
      setEvaluacionSeleccionadaId(evaluacionesFiltradas[0].id_evaluacion);
    }
  }, [evaluacionesAsignables, evaluacionesFiltradas, evaluacionSeleccionadaId]);

  // Se carga la estructura de RA y sus pesos para el módulo y curso seleccionados
  const cargarRADelModulo = useCallback(async () => {
    const idModulo = evaluacionSeleccionada?.id_modulo || moduloSeleccionadoId;
    if (!idModulo) {
      setListaRA([]);
      setAsignacionesRA([]);
      return;
    }

    setCargandoRA(true);
    try {
      // 1. Se obtienen los RA y sus CE desde la BD
      const { data: estructura } = await obtenerEstructuraRAModulo(idModulo);

      // 2. Se obtienen los pesos configurados en ra_curso para este curso
      let pesosMap = new Map();
      if (cursoSeleccionadoId) {
        const { data: pesosData } = await supabase
          .from('ra_curso')
          .select('id_ra, peso')
          .eq('id_curso', cursoSeleccionadoId);

        if (pesosData) {
          pesosMap = new Map(pesosData.map((p) => [p.id_ra, Number(p.peso) || 0]));
        }
      }

      // 3. Se asigna peso equitativo a los RA sin peso configurado
      const totalRA = (estructura || []).length;
      const pesoEquitativo = totalRA > 0 ? Math.floor(100 / totalRA) : 0;
      const resto = totalRA > 0 ? 100 % totalRA : 0;

      const rasConPesos = (estructura || []).map((ra, idx) => {
        let peso = pesosMap.get(ra.id_ra);
        if (peso === undefined || peso === null) {
          peso = idx < resto ? pesoEquitativo + 1 : pesoEquitativo;
        }

        const numRA = ra.numero ?? '';
        const codigoRA = numRA !== '' ? `RA ${numRA}` : 'RA';

        return {
          ...ra,
          codigo: codigoRA,
          peso,
          textoCompleto: formatearTextoRA(ra),
          totalCE: (ra.criterios || []).length
        };
      });

      setListaRA(rasConPesos);

      // 4. Se obtienen las asignaciones en ra_evaluacion para las evaluaciones del módulo
      const { data: asignaciones } = await obtenerTodasAsignacionesRAEvaluacion(idModulo);
      setAsignacionesRA(asignaciones || []);
    } catch (err) {
      console.error('Error al cargar RA y asignaciones del módulo:', err);
      setErrorOperacion(err.message || 'Error al cargar RA del módulo.');
    } finally {
      setCargandoRA(false);
    }
  }, [evaluacionSeleccionada, moduloSeleccionadoId, cursoSeleccionadoId]);

  useEffect(() => {
    cargarRADelModulo();
  }, [cargarRADelModulo]);

  // Conjunto de identificadores de RA asignados a la evaluación actualmente seleccionada
  // Mapa de id_ra -> información de la evaluación donde está asignado en el módulo
  const mapaAsignacionPorRA = useMemo(() => {
    const mapa = new Map();
    (asignacionesRA || []).forEach((asig) => {
      if (asig.id_ra && asig.id_evaluacion) {
        const idRaStr = String(asig.id_ra).toLowerCase();
        const ev = (todasEvaluaciones || []).find(
          (e) => String(e.id_evaluacion).toLowerCase() === String(asig.id_evaluacion).toLowerCase()
        );
        mapa.set(idRaStr, {
          id_evaluacion: asig.id_evaluacion,
          evaluacion: ev || null,
          nombreEvaluacion: ev?.nombre ? `${ev.nombre} evaluación` : 'Otra evaluación'
        });
      }
    });
    return mapa;
  }, [asignacionesRA, todasEvaluaciones]);

  // Conjunto de identificadores de RA asignados a la evaluación actualmente seleccionada
  const idsRAAsignados = useMemo(() => {
    if (!evaluacionSeleccionadaId) return new Set();
    const idEvStr = String(evaluacionSeleccionadaId).toLowerCase();

    const asignados = (asignacionesRA || [])
      .filter((a) => String(a.id_evaluacion).toLowerCase() === idEvStr)
      .map((a) => String(a.id_ra).toLowerCase());

    return new Set(asignados);
  }, [asignacionesRA, evaluacionSeleccionadaId]);

  // Lista de RA con la propiedad reactiva 'asignado' y el detalle de a qué evaluación pertenece
  const rasConEstado = useMemo(() => {
    const idEvActualStr = evaluacionSeleccionadaId ? String(evaluacionSeleccionadaId).toLowerCase() : '';

    return (listaRA || []).map((ra) => {
      const idRaStr = String(ra.id_ra).toLowerCase();
      const infoAsignacion = mapaAsignacionPorRA.get(idRaStr);
      const estaAsignadoActual = idsRAAsignados.has(idRaStr);
      const estaAsignadoAOtra = Boolean(infoAsignacion && String(infoAsignacion.id_evaluacion).toLowerCase() !== idEvActualStr);

      return {
        ...ra,
        asignado: estaAsignadoActual,
        asignadoAOtraEvaluacion: estaAsignadoAOtra,
        evaluacionAsignada: infoAsignacion?.evaluacion || null,
        nombreEvaluacionAsignada: infoAsignacion?.nombreEvaluacion || null,
        idEvaluacionAsignada: infoAsignacion?.id_evaluacion || null
      };
    });
  }, [listaRA, idsRAAsignados, mapaAsignacionPorRA, evaluacionSeleccionadaId]);

  // Suma de pesos de los RA asignados a la evaluación actual
  const sumaPesosAsignados = useMemo(() => {
    return rasConEstado
      .filter((ra) => ra.asignado)
      .reduce((acc, ra) => acc + (ra.peso || 0), 0);
  }, [rasConEstado]);

  // Mapa de asignaciones por evaluación: { [id_evaluacion]: Set([id_ra, ...]) }
  const mapaAsignacionesPorEvaluacion = useMemo(() => {
    const mapa = new Map();
    (asignacionesRA || []).forEach((asig) => {
      if (!mapa.has(asig.id_evaluacion)) {
        mapa.set(asig.id_evaluacion, new Set());
      }
      mapa.get(asig.id_evaluacion).add(asig.id_ra);
    });
    return mapa;
  }, [asignacionesRA]);

  // Selección de una evaluación específica
  const seleccionarEvaluacion = useCallback((idEvaluacion) => {
    setEvaluacionSeleccionadaId(idEvaluacion);
    if (idEvaluacion) {
      const ev = (todasEvaluaciones || []).find(
        (item) => String(item.id_evaluacion).toLowerCase() === String(idEvaluacion).toLowerCase()
      );
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

  // Alternar asignación de un Resultado de Aprendizaje a la evaluación seleccionada con control de exclusividad
  const alternarRA = useCallback(async (ra) => {
    if (!evaluacionSeleccionadaId) {
      mostrarError('Evaluación requerida', 'Debe seleccionar una evaluación antes de asignar RA.');
      return { exito: false, error: 'Debe seleccionar una evaluación.' };
    }

    const idRAStr = String(ra.id_ra).toLowerCase();
    const yaAsignado = idsRAAsignados.has(idRAStr);
    const nuevoEstado = !yaAsignado;

    // Validación de exclusividad: un RA no puede estar asignado a múltiples periodos evaluativos
    if (nuevoEstado && ra.asignadoAOtraEvaluacion) {
      const nombreOtra = ra.nombreEvaluacionAsignada || 'otra evaluación';
      mostrarError(
        'RA ya asignado',
        `El ${ra.codigo || 'RA'} ya está asignado a la ${nombreOtra}. Un Resultado de Aprendizaje sólo puede pertenecer a un periodo evaluativo.`
      );
      return {
        exito: false,
        error: `El ${ra.codigo || 'RA'} ya está asignado a la ${nombreOtra}.`
      };
    }

    // Actualización visual inmediata y optimista
    setAsignacionesRA((prev) => {
      if (nuevoEstado) {
        return [
          ...prev,
          {
            id_ra_evaluacion: `temp_${Date.now()}`,
            id_ra: ra.id_ra,
            id_evaluacion: evaluacionSeleccionadaId,
            RA: ra
          }
        ];
      } else {
        return prev.filter(
          (a) =>
            !(
              String(a.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase() &&
              String(a.id_ra).toLowerCase() === idRAStr
            )
        );
      }
    });

    try {
      if (nuevoEstado) {
        const resp = await vincularRAAEvaluacion({
          idRA: ra.id_ra,
          idEvaluacion: evaluacionSeleccionadaId
        });

        if (!resp.exito) throw new Error(resp.error || 'No se pudo vincular el RA.');

        return {
          exito: true,
          accion: 'vinculado',
          mensaje: `Se ha asignado el ${ra.codigo || 'RA'} a la evaluación.`
        };
      } else {
        const resp = await desvincularRADeEvaluacion({
          idRA: ra.id_ra,
          idEvaluacion: evaluacionSeleccionadaId
        });

        if (!resp.exito) throw new Error(resp.error || 'No se pudo desvincular el RA.');

        return {
          exito: true,
          accion: 'desvinculado',
          mensaje: `Se ha desvinculado el ${ra.codigo || 'RA'} de la evaluación.`
        };
      }
    } catch (err) {
      console.error('Error al alternar RA en evaluación:', err);
      // Reversión visual en caso de fallo
      await cargarRADelModulo();
      mostrarError('Error en asignación', err.message || 'No se pudo guardar la asignación.');
      return { exito: false, error: err.message };
    }
  }, [evaluacionSeleccionadaId, idsRAAsignados, cargarRADelModulo, mostrarError]);

  // Asignar todos los RA disponibles del módulo a la evaluación seleccionada (omitiendo los asignados a otros periodos)
  const asignarTodosRA = useCallback(async () => {
    if (!evaluacionSeleccionadaId || listaRA.length === 0) {
      return { exito: false, error: 'No hay RA disponibles para asignar.' };
    }

    const rasDisponibles = rasConEstado.filter((ra) => !ra.asignado && !ra.asignadoAOtraEvaluacion);
    const idsFaltantes = rasDisponibles.map((ra) => ra.id_ra);
    const rasEnOtras = rasConEstado.filter((ra) => ra.asignadoAOtraEvaluacion);

    if (idsFaltantes.length === 0) {
      if (rasEnOtras.length > 0) {
        mostrarInfo(
          'Sin RA disponibles',
          `Los RA no asignados a esta evaluación ya están vinculados a otros periodos evaluativos.`
        );
      } else {
        mostrarInfo('Información', 'Todos los RA ya se encuentran asignados a esta evaluación.');
      }
      return { exito: true, mensaje: 'No hay más RA disponibles para asignar.' };
    }

    setGuardandoLote(true);
    try {
      const resp = await vincularMultiplesRAAEvaluacion({
        idsRA: idsFaltantes,
        idEvaluacion: evaluacionSeleccionadaId
      });

      if (!resp.exito) throw new Error(resp.error);

      await cargarRADelModulo();
      let mensaje = `Se han asignado ${idsFaltantes.length} RA a la evaluación.`;
      if (rasEnOtras.length > 0) {
        mensaje += ` (${rasEnOtras.length} RA se mantuvieron en sus evaluaciones ya asignadas).`;
      }
      mostrarExito('Asignación masiva', mensaje);
      return { exito: true, mensaje };
    } catch (err) {
      console.error('Error al asignar todos los RA:', err);
      mostrarError('Error', err.message || 'No se pudieron asignar todos los RA.');
      return { exito: false, error: err.message };
    } finally {
      setGuardandoLote(false);
    }
  }, [evaluacionSeleccionadaId, listaRA, rasConEstado, cargarRADelModulo, mostrarExito, mostrarError, mostrarInfo]);

  // Desasignar todos los RA de la evaluación seleccionada
  const desasignarTodosRA = useCallback(async () => {
    if (!evaluacionSeleccionadaId || idsRAAsignados.size === 0) {
      return { exito: false, error: 'No hay RA asignados para desvincular.' };
    }

    const idsAsignadosArray = Array.from(idsRAAsignados);

    setGuardandoLote(true);
    try {
      const resp = await desvincularMultiplesRADeEvaluacion({
        idsRA: idsAsignadosArray,
        idEvaluacion: evaluacionSeleccionadaId
      });

      if (!resp.exito) throw new Error(resp.error);

      await cargarRADelModulo();
      mostrarExito('Desasignación completada', 'Se han desvinculado todos los RA de la evaluación.');
      return { exito: true, mensaje: 'Se han desvinculado todos los RA de la evaluación.' };
    } catch (err) {
      console.error('Error al desasignar todos los RA:', err);
      mostrarError('Error', err.message || 'No se pudieron desvincular los RA.');
      return { exito: false, error: err.message };
    } finally {
      setGuardandoLote(false);
    }
  }, [evaluacionSeleccionadaId, idsRAAsignados, cargarRADelModulo, mostrarExito, mostrarError]);

  // Recarga completa de los datos
  const recargar = useCallback(async () => {
    await Promise.all([cargarEvaluaciones(), cargarRADelModulo()]);
  }, [cargarEvaluaciones, cargarRADelModulo]);

  return {
    cursos: todosCursosContexto,
    modulosDisponibles,
    todasEvaluaciones,
    evaluacionesFiltradas,
    evaluacionesAsignables,
    evaluacionSeleccionada,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    listaRA,
    rasConEstado,
    idsRAAsignados,
    sumaPesosAsignados,
    mapaAsignacionesPorEvaluacion,
    cargando: cargandoGeneral || cargandoRA,
    guardandoLote,
    error: errorOperacion,
    alternarRA,
    asignarTodosRA,
    desasignarTodosRA,
    recargar
  };
};

export default useAsignacionRA;
