import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { procesarEstadisticas } from '../services/dashboardService.js';

// Estado inicial para las estadísticas agregadas del panel de control
const ESTADISTICAS_INICIALES = {
  totalAlumnos: 0,
  totalModulos: 0,
  totalCalificaciones: 0,
  notaMediaGlobal: null,
  tasaAprobados: null,
  distribucion: {
    suspensos: 0,
    aprobados: 0,
    notables: 0,
    sobresalientes: 0
  },
  mediasPorModulo: [],
  alumnosEnRiesgo: [],
  tieneDatos: false,
  idCurso: null
};

// Hook específico del Dashboard que consume exclusivamente el hook genérico useDatos para acceder a Supabase
const useDashboard = () => {
  // Se inicializan los hooks useDatos para cada una de las tablas requeridas por el panel de control
  const {
    obtenerDatos: obtenerCursos,
    cargando: cargandoCursos,
    error: errorCursos
  } = useDatos('Cursos');

  const {
    obtenerDatos: obtenerDiscentes,
    cargando: cargandoDiscentes,
    error: errorDiscentes
  } = useDatos('Discentes');

  const {
    obtenerDatos: obtenerModulos,
    cargando: cargandoModulos,
    error: errorModulos
  } = useDatos('Modulos');

  const {
    obtenerDatos: obtenerEvaluaciones,
    cargando: cargandoEvaluaciones,
    error: errorEvaluaciones
  } = useDatos('Evaluaciones');

  const {
    obtenerDatos: obtenerImparte,
    cargando: cargandoImparte,
    error: errorImparte
  } = useDatos('imparte');

  const {
    obtenerDatos: obtenerEvaluan,
    cargando: cargandoEvaluan,
    error: errorEvaluan
  } = useDatos('evaluan');

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [datosCrudos, setDatosCrudos] = useState({
    cursos: [],
    discentes: [],
    modulos: [],
    evaluaciones: [],
    imparte: [],
    evaluan: []
  });

  // Función para coordinar la carga de todas las tablas necesarias a través de useDatos
  const cargarEstadisticas = useCallback(async () => {
    try {
      // Se obtienen los datos concurrentemente empleando useDatos
      const [
        cursosBD,
        discentesBD,
        modulosBD,
        evaluacionesBD,
        imparteBD,
        evaluanBD
      ] = await Promise.all([
        obtenerCursos('*'),
        obtenerDiscentes('*'),
        obtenerModulos('*'),
        obtenerEvaluaciones('id_evaluacion, id_curso, id_modulo, nombre'),
        obtenerImparte('id_imparte, id_curso, id_modulo, id_discente'),
        obtenerEvaluan('*, Practicas(id_modulo), Evaluaciones(id_curso, id_modulo)')
      ]);

      const nuevosDatosCrudos = {
        cursos: cursosBD || [],
        discentes: discentesBD || [],
        modulos: modulosBD || [],
        evaluaciones: evaluacionesBD || [],
        imparte: imparteBD || [],
        evaluan: evaluanBD || []
      };

      setDatosCrudos(nuevosDatosCrudos);
    } catch (err) {
      console.error(
        'Error al coordinar la obtención de datos en useDashboard:',
        err
      );
    } finally {
      setCargandoInicial(false);
    }
  }, [
    obtenerCursos,
    obtenerDiscentes,
    obtenerModulos,
    obtenerEvaluaciones,
    obtenerImparte,
    obtenerEvaluan
  ]);

  // Se ejecuta la carga inicial al montar el hook
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Se ordenan los cursos de más reciente a más antiguo según fecha de creación y denominación del año
  const cursosOrdenados = useMemo(() => {
    return [...(datosCrudos.cursos || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (fechaB !== fechaA) return fechaB - fechaA;
      return (b.anyo || '').localeCompare(a.anyo || '', undefined, { numeric: true });
    });
  }, [datosCrudos.cursos]);

  // Se fija automáticamente el curso más reciente por defecto una vez cargados los cursos
  useEffect(() => {
    if (cursosOrdenados.length > 0) {
      const cursoExiste = cursosOrdenados.some((c) => c.id_curso === cursoSeleccionadoId);
      if (!cursoSeleccionadoId || !cursoExiste) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Objeto completo del curso seleccionado actualmente
  const cursoSeleccionado = useMemo(() => {
    if (!cursoSeleccionadoId) return null;
    return cursosOrdenados.find((c) => c.id_curso === cursoSeleccionadoId) || null;
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Se recalculan las métricas estadísticas para el curso seleccionado
  const estadisticas = useMemo(() => {
    if (
      datosCrudos.cursos.length === 0 &&
      datosCrudos.discentes.length === 0 &&
      datosCrudos.modulos.length === 0
    ) {
      return ESTADISTICAS_INICIALES;
    }

    return procesarEstadisticas({
      listaDiscentes: datosCrudos.discentes,
      listaModulos: datosCrudos.modulos,
      listaCalificaciones: datosCrudos.evaluan,
      listaEvaluaciones: datosCrudos.evaluaciones,
      listaImparte: datosCrudos.imparte,
      idCurso: cursoSeleccionadoId
    });
  }, [datosCrudos, cursoSeleccionadoId]);

  // Estado consolidado de carga y errores provenientes de los hooks de useDatos
  const cargando =
    cargandoInicial ||
    cargandoCursos ||
    cargandoDiscentes ||
    cargandoModulos ||
    cargandoEvaluaciones ||
    cargandoImparte ||
    cargandoEvaluan;

  const error =
    errorCursos ||
    errorDiscentes ||
    errorModulos ||
    errorEvaluaciones ||
    errorImparte ||
    errorEvaluan;

  return {
    estadisticas,
    cursos: cursosOrdenados,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    cargando,
    error,
    recargarEstadisticas: cargarEstadisticas
  };
};

export default useDashboard;
