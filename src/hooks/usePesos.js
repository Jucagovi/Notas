import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useModulosContexto from './useModulosContexto.js';
import useEvaluacionesContexto from './useEvaluacionesContexto.js';
import useToast from './useToast.js';
import {
  obtenerEvaluacionesConDetalle,
  obtenerModulosPorCurso
} from '../services/evaluacionService.js';
import {
  obtenerPracticasEvaluacion,
  actualizarPesosEvaluacion,
  calcularDistribucionEquitativa
} from '../services/pesosService.js';

// Hook personalizado para gestionar la asignación y balanceo de pesos de prácticas en una evaluación
const usePesos = () => {
  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();

  // Contextos globales de datos
  const { datos: todosCursosContexto } = useCursosContexto();
  const { datos: todosModulosContexto } = useModulosContexto();
  const { datos: todasEvaluacionesContexto } = useEvaluacionesContexto();

  // Estados para los filtros superiores
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Estados de datos obtenidos de Supabase
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [practicasIniciales, setPracticasIniciales] = useState([]);

  // Estados de control de carga y guardado
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Se selecciona automáticamente por defecto el curso más reciente
  useEffect(() => {
    if ((todosCursosContexto || []).length > 0 && !cursoSeleccionadoId) {
      const cursosOrdenados = [...todosCursosContexto].sort((a, b) => {
        const fA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fB - fA;
      });

      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId]);

  // Carga inicial de evaluaciones con información completa de cursos y módulos
  const cargarEvaluaciones = useCallback(async () => {
    setCargandoGeneral(true);
    try {
      const { data: evsDetalle, error } = await obtenerEvaluacionesConDetalle();
      if (!error && evsDetalle && evsDetalle.length > 0) {
        setTodasEvaluaciones(evsDetalle);
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
      console.error('Error al cargar evaluaciones en usePesos:', err);
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

  // Lista de evaluaciones filtradas por el curso y módulo actuales
  const evaluacionesFiltradas = useMemo(() => {
    return (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso =
        !cursoSeleccionadoId ||
        String(ev.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase();
      const coincideModulo =
        !moduloSeleccionadoId ||
        String(ev.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase();
      return coincideCurso && coincideModulo;
    });
  }, [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]);

  // Objeto con la información de la evaluación seleccionada actualmente
  const evaluacionSeleccionada = useMemo(() => {
    if (!evaluacionSeleccionadaId) return null;
    return (
      (todasEvaluaciones || []).find(
        (ev) =>
          String(ev.id_evaluacion).toLowerCase() ===
          String(evaluacionSeleccionadaId).toLowerCase()
      ) || null
    );
  }, [todasEvaluaciones, evaluacionSeleccionadaId]);

  // Selección de una evaluación con sincronización de curso y módulo
  const seleccionarEvaluacion = useCallback(
    (idEvaluacion) => {
      setEvaluacionSeleccionadaId(idEvaluacion);

      if (idEvaluacion) {
        const ev = (todasEvaluaciones || []).find(
          (item) =>
            String(item.id_evaluacion).toLowerCase() ===
            String(idEvaluacion).toLowerCase()
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
    },
    [todasEvaluaciones, cursoSeleccionadoId, moduloSeleccionadoId]
  );

  // Carga de prácticas asignadas a la evaluación seleccionada desde la tabla evaluan
  const cargarPracticas = useCallback(async (idEvaluacion) => {
    if (!idEvaluacion) {
      setPracticas([]);
      setPracticasIniciales([]);
      return;
    }

    setCargandoPracticas(true);
    try {
      const { data, error } = await obtenerPracticasEvaluacion(idEvaluacion);
      if (error) {
        throw new Error(error);
      }
      const lista = data || [];
      setPracticas(lista);
      // Se clona la lista inicial para poder comprobar si hay modificaciones pendientes
      setPracticasIniciales(JSON.parse(JSON.stringify(lista)));
    } catch (err) {
      console.error('Error al cargar prácticas de la evaluación en usePesos:', err);
      mostrarError('Error de consulta', 'No se pudieron obtener las prácticas de la evaluación seleccionada.');
      setPracticas([]);
      setPracticasIniciales([]);
    } finally {
      setCargandoPracticas(false);
    }
  }, [mostrarError]);

  useEffect(() => {
    cargarPracticas(evaluacionSeleccionadaId);
  }, [evaluacionSeleccionadaId, cargarPracticas]);

  // Cálculo en tiempo real de la suma total de los pesos asignados
  const sumaTotalPesos = useMemo(() => {
    return (practicas || []).reduce((acumulador, item) => {
      const valor = parseInt(item.peso, 10);
      return acumulador + (isNaN(valor) ? 0 : valor);
    }, 0);
  }, [practicas]);

  // Cálculo del porcentaje restante o excedido
  const pesoRestante = useMemo(() => {
    return 100 - sumaTotalPesos;
  }, [sumaTotalPesos]);

  // Estado del balanceo actual
  const estadoBalanceo = useMemo(() => {
    if ((practicas || []).length === 0) return 'vacio';
    if (sumaTotalPesos === 100) return 'valido';
    if (sumaTotalPesos < 100) return 'incompleto';
    return 'excedido';
  }, [practicas, sumaTotalPesos]);

  // Detección de modificaciones locales respecto al estado guardado en base de datos
  const hayCambiosSinGuardar = useMemo(() => {
    if (practicas.length !== practicasIniciales.length) return false;
    return practicas.some((p) => {
      const original = practicasIniciales.find((o) => o.id_practica === p.id_practica);
      return !original || Number(original.peso) !== Number(p.peso);
    });
  }, [practicas, practicasIniciales]);

  // Se actualiza el peso de una práctica concreta en el estado local de React
  const actualizarPeso = useCallback((idPractica, nuevoValor) => {
    const valorNumerico = nuevoValor === null || nuevoValor === undefined || isNaN(nuevoValor)
      ? 0
      : Math.max(0, Math.min(100, parseInt(nuevoValor, 10)));

    setPracticas((prev) =>
      prev.map((item) =>
        item.id_practica === idPractica
          ? { ...item, peso: valorNumerico }
          : item
      )
    );
  }, []);

  // Se distribuye el 100% de forma equitativa entre todas las prácticas asignadas
  const repartirEquitativamente = useCallback(() => {
    if ((practicas || []).length === 0) {
      mostrarAdvertencia('Sin prácticas', 'No hay prácticas vinculadas en esta evaluación para distribuir.');
      return;
    }

    const distribucion = calcularDistribucionEquitativa(practicas.length);

    setPracticas((prev) =>
      prev.map((item, index) => ({
        ...item,
        peso: distribucion[index] || 0
      }))
    );

    mostrarInfo(
      'Distribución equitativa',
      `Se han repartido los pesos entre las ${practicas.length} prácticas sumando el 100%.`
    );
  }, [practicas, mostrarAdvertencia, mostrarInfo]);

  // Se restablecen los valores a los últimos datos guardados en la base de datos
  const restablecerValores = useCallback(() => {
    setPracticas(JSON.parse(JSON.stringify(practicasIniciales)));
    mostrarInfo('Valores restablecidos', 'Se han recuperado los pesos almacenados en la base de datos.');
  }, [practicasIniciales, mostrarInfo]);

  // Se persiste el balanceo masivo de pesos en la base de datos de Supabase
  const guardarBalanceo = useCallback(async () => {
    if (!evaluacionSeleccionadaId) {
      mostrarAdvertencia('Evaluación no seleccionada', 'Debe seleccionar una evaluación para guardar los pesos.');
      return { exito: false };
    }

    if (practicas.length === 0) {
      mostrarAdvertencia('Sin prácticas', 'No hay prácticas vinculadas a esta evaluación.');
      return { exito: false };
    }

    if (sumaTotalPesos !== 100) {
      mostrarAdvertencia(
        'Suma incorrecta',
        `La suma total de pesos debe ser exactamente 100% (actual: ${sumaTotalPesos}%).`
      );
      return { exito: false };
    }

    setGuardando(true);
    try {
      const respuesta = await actualizarPesosEvaluacion(evaluacionSeleccionadaId, practicas);

      if (!respuesta.exito) {
        throw new Error(respuesta.error || 'Error al persistir los pesos.');
      }

      // Se actualiza el estado inicial para reflejar que no hay cambios pendientes
      setPracticasIniciales(JSON.parse(JSON.stringify(practicas)));

      mostrarExito(
        'Balanceo guardado',
        `Se han actualizado correctamente los pesos de las ${practicas.length} prácticas en la evaluación.`
      );

      return { exito: true };
    } catch (err) {
      console.error('Error al guardar balanceo de pesos:', err);
      mostrarError('Error al guardar', err.message || 'No se pudieron actualizar los pesos en la base de datos.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [
    evaluacionSeleccionadaId,
    practicas,
    sumaTotalPesos,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia
  ]);

  // Recarga completa de los datos
  const recargar = useCallback(async () => {
    await cargarEvaluaciones();
    if (evaluacionSeleccionadaId) {
      await cargarPracticas(evaluacionSeleccionadaId);
    }
  }, [cargarEvaluaciones, evaluacionSeleccionadaId, cargarPracticas]);

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
    practicas,
    sumaTotalPesos,
    pesoRestante,
    estadoBalanceo,
    esGuardable: sumaTotalPesos === 100 && practicas.length > 0 && !guardando && !cargandoPracticas,
    hayCambiosSinGuardar,
    cargando: cargandoGeneral || cargandoPracticas,
    cargandoPracticas,
    guardando,
    actualizarPeso,
    repartirEquitativamente,
    restablecerValores,
    guardarBalanceo,
    recargar
  };
};

export default usePesos;
