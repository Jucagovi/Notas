import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCursosContexto from './useCursosContexto.js';
import useModulosContexto from './useModulosContexto.js';
import useEvaluacionesContexto from './useEvaluacionesContexto.js';
import useToast from './useToast.js';
import {
  obtenerModulosPorCurso,
  obtenerEvaluacionesConDetalle
} from '../services/evaluacionService.js';
import {
  getPendientesPorEvaluacion,
  exportarInformePendientesPDF
} from '../services/informesService.js';

// Hook personalizado para gestionar el informe de calificaciones pendientes y sus filtros contextuales
const useInformePendientes = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Contextos globales de datos
  const { datos: todosCursosContexto } = useCursosContexto();
  const { datos: todosModulosContexto } = useModulosContexto();
  const { datos: todasEvaluacionesContexto } = useEvaluacionesContexto();

  // Estados para los tres desplegables en cascada (Curso -> Módulo -> Evaluación)
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Opciones disponibles para desplegables
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [todasEvaluacionesDetalle, setTodasEvaluacionesDetalle] = useState([]);

  // Estados de datos de calificaciones pendientes
  const [listaPendientes, setListaPendientes] = useState([]);
  const [metadatos, setMetadatos] = useState(null);

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [error, setError] = useState(null);

  // Filtro de búsqueda libre para la tabla
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Se ordenan los cursos de más reciente a más antiguo según created_at
  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  // Se selecciona automáticamente por defecto el curso más reciente al inicio
  useEffect(() => {
    if ((todosCursosContexto || []).length > 0 && !cursoSeleccionadoId) {
      const cursosOrdenadosLista = [...todosCursosContexto].sort((a, b) => {
        const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fechaB - fechaA;
      });

      if (cursosOrdenadosLista[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenadosLista[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId]);

  // Carga inicial de todas las evaluaciones con detalle de cursos y módulos
  useEffect(() => {
    const cargarTodasEvaluaciones = async () => {
      setCargandoEvaluaciones(true);
      try {
        const { data: evsDetalle, error: errEvs } = await obtenerEvaluacionesConDetalle();
        if (!errEvs && evsDetalle && evsDetalle.length > 0) {
          setTodasEvaluacionesDetalle(evsDetalle);
        } else if (todasEvaluacionesContexto && todasEvaluacionesContexto.length > 0) {
          const mapaCursos = new Map((todosCursosContexto || []).map((c) => [c.id_curso, c]));
          const mapaModulos = new Map((todosModulosContexto || []).map((m) => [m.id_modulo, m]));

          const evs = todasEvaluacionesContexto.map((ev) => ({
            ...ev,
            Cursos: mapaCursos.get(ev.id_curso) || null,
            Modulos: mapaModulos.get(ev.id_modulo) || null
          }));
          setTodasEvaluacionesDetalle(evs);
        }
      } catch (err) {
        console.error('Error al precargar evaluaciones en useInformePendientes:', err);
      } finally {
        setCargandoEvaluaciones(false);
      }
    };

    cargarTodasEvaluaciones();
  }, [todasEvaluacionesContexto, todosCursosContexto, todosModulosContexto]);

  // Manejador para el cambio de Curso académico (reinicia módulo, evaluación y resultados)
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setModuloSeleccionadoId(null);
    setEvaluacionSeleccionadaId(null);
    setListaPendientes([]);
    setMetadatos(null);
    setError(null);
  }, []);

  // Manejador para el cambio de Módulo profesional (reinicia evaluación y resultados)
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    setEvaluacionSeleccionadaId(null);
    setListaPendientes([]);
    setMetadatos(null);
    setError(null);
  }, []);

  // Manejador para el cambio de Evaluación (desencadena la carga de notas pendientes)
  const handleCambiarEvaluacion = useCallback((nuevaEvaluacionId) => {
    setEvaluacionSeleccionadaId(nuevaEvaluacionId || null);
    if (!nuevaEvaluacionId) {
      setListaPendientes([]);
      setMetadatos(null);
    }
  }, []);

  // Se actualizan los módulos disponibles cuando cambia el curso seleccionado
  useEffect(() => {
    const cargarModulosDelCurso = async () => {
      if (!cursoSeleccionadoId) {
        setModulosDisponibles([]);
        return;
      }

      setCargandoModulos(true);
      try {
        const { data: mods, error: errMods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (!errMods && mods && mods.length > 0) {
          setModulosDisponibles(mods);
        } else {
          setModulosDisponibles(todosModulosContexto || []);
        }
      } catch (err) {
        console.error('Error al cargar módulos del curso:', err);
        setModulosDisponibles(todosModulosContexto || []);
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulosDelCurso();
  }, [cursoSeleccionadoId, todosModulosContexto]);

  // Se filtran las evaluaciones disponibles según el curso y módulo seleccionados de forma memorizada
  const evaluacionesDisponibles = useMemo(() => {
    if (!cursoSeleccionadoId || !moduloSeleccionadoId) {
      return [];
    }

    return (todasEvaluacionesDetalle || []).filter((ev) => {
      const coincideCurso = String(ev.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase();
      const coincideModulo = String(ev.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase();
      return coincideCurso && coincideModulo;
    });
  }, [cursoSeleccionadoId, moduloSeleccionadoId, todasEvaluacionesDetalle]);

  // Se obtienen las calificaciones pendientes cuando hay una evaluación seleccionada
  const cargarCalificacionesPendientes = useCallback(async () => {
    if (!evaluacionSeleccionadaId) {
      setListaPendientes([]);
      setMetadatos(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await getPendientesPorEvaluacion(evaluacionSeleccionadaId);

      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      setListaPendientes(respuesta.data || []);
      setMetadatos(respuesta.metadatos || null);
    } catch (err) {
      console.error('Error al cargar calificaciones pendientes:', err);
      setError(err.message || 'Error al obtener las notas pendientes.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones pendientes.');
      setListaPendientes([]);
      setMetadatos(null);
    } finally {
      setCargando(false);
    }
  }, [evaluacionSeleccionadaId, mostrarError]);

  useEffect(() => {
    if (evaluacionSeleccionadaId) {
      cargarCalificacionesPendientes();
    } else {
      setListaPendientes([]);
      setMetadatos(null);
    }
  }, [evaluacionSeleccionadaId, cargarCalificacionesPendientes]);

  // Se filtran las filas de la tabla según el término de búsqueda introducido
  const listaPendientesFiltrada = useMemo(() => {
    if (!terminoBusqueda || !terminoBusqueda.trim()) {
      return listaPendientes;
    }

    const termino = terminoBusqueda.trim().toLowerCase();

    return listaPendientes.filter((fila) => {
      const coincideDiscente =
        (fila.nombreDiscente && fila.nombreDiscente.toLowerCase().includes(termino)) ||
        (fila.apellidosDiscente && fila.apellidosDiscente.toLowerCase().includes(termino)) ||
        (fila.nombreCompletoDiscente && fila.nombreCompletoDiscente.toLowerCase().includes(termino)) ||
        (fila.discenteNia && fila.discenteNia.toLowerCase().includes(termino));

      const coincidePractica =
        (fila.nombrePractica && fila.nombrePractica.toLowerCase().includes(termino)) ||
        (fila.numeroPractica && fila.numeroPractica.toString().toLowerCase().includes(termino)) ||
        (fila.textoPractica && fila.textoPractica.toLowerCase().includes(termino));

      const coincideEvaluacion =
        fila.nombreEvaluacion && fila.nombreEvaluacion.toLowerCase().includes(termino);

      return coincideDiscente || coincidePractica || coincideEvaluacion;
    });
  }, [listaPendientes, terminoBusqueda]);

  // Objetos de contexto seleccionados
  const cursoSeleccionado = useMemo(() => {
    if (!cursoSeleccionadoId) return null;
    return (todosCursosContexto || []).find(
      (c) => String(c.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase()
    ) || null;
  }, [todosCursosContexto, cursoSeleccionadoId]);

  const moduloSeleccionado = useMemo(() => {
    if (!moduloSeleccionadoId) return null;
    return (modulosDisponibles || []).find(
      (m) => String(m.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase()
    ) || null;
  }, [modulosDisponibles, moduloSeleccionadoId]);

  const evaluacionSeleccionada = useMemo(() => {
    if (!evaluacionSeleccionadaId) return null;
    return (evaluacionesDisponibles || []).find(
      (ev) => String(ev.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase()
    ) || metadatos?.evaluacion || null;
  }, [evaluacionesDisponibles, evaluacionSeleccionadaId, metadatos]);

  // Redirección a la pantalla de Calificar preseleccionando evaluación y práctica
  const irACalificar = useCallback((fila) => {
    if (!fila) return;

    navigate('/calificar', {
      state: {
        idCurso: fila.id_curso || cursoSeleccionadoId,
        idModulo: fila.id_modulo || moduloSeleccionadoId,
        idEvaluacion: fila.id_evaluacion || evaluacionSeleccionadaId,
        idPractica: fila.id_practica
      }
    });
  }, [navigate, cursoSeleccionadoId, moduloSeleccionadoId, evaluacionSeleccionadaId]);

  // Se genera y descarga el documento PDF del informe de pendientes
  const descargarPDF = useCallback(async () => {
    if (!evaluacionSeleccionada) {
      mostrarAdvertencia('Evaluación requerida', 'Debe seleccionar una evaluación para exportar el informe.');
      return;
    }

    setExportandoPDF(true);
    try {
      const resultado = exportarInformePendientesPDF({
        evaluacion: evaluacionSeleccionada,
        curso: cursoSeleccionado,
        modulo: moduloSeleccionado,
        pendientes: listaPendientesFiltrada
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('Informe exportado', 'El informe en PDF ha sido generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al generar PDF de calificaciones pendientes:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [evaluacionSeleccionada, cursoSeleccionado, moduloSeleccionado, listaPendientesFiltrada, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    evaluacionesDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    evaluacionSeleccionadaId,
    setEvaluacionSeleccionadaId: handleCambiarEvaluacion,
    evaluacionSeleccionada,
    listaPendientes: listaPendientesFiltrada,
    totalPendientesOriginal: listaPendientes.length,
    metadatos,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    cargandoEvaluaciones,
    exportandoPDF,
    error,
    recargar: cargarCalificacionesPendientes,
    irACalificar,
    descargarPDF
  };
};

export default useInformePendientes;
