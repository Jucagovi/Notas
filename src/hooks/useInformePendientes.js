import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import {
  getPendientesPorCurso,
  exportarInformePendientesPDF
} from '../services/informesService.js';

// Hook personalizado para gestionar el informe de calificaciones pendientes con navegación por pestañas de módulos
const useInformePendientes = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Contexto global de cursos
  const { datos: todosCursosContexto } = useCursosContexto();

  // Estado del único selector de filtro: Curso académico
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);

  // Datos consolidados del curso devueltos por el servicio
  const [datosCurso, setDatosCurso] = useState(null);

  // Índice de la pestaña del módulo activa en el componente TabView
  const [indiceModuloActivo, setIndiceModuloActivo] = useState(0);

  // Término de búsqueda para filtrar la tabla de calificaciones pendientes
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Estados de carga, exportación y error
  const [cargando, setCargando] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [error, setError] = useState(null);

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
      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId, cursosOrdenados]);

  // Se obtienen todas las calificaciones pendientes del curso seleccionado
  const cargarPendientesCurso = useCallback(async () => {
    if (!cursoSeleccionadoId) {
      setDatosCurso(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await getPendientesPorCurso(cursoSeleccionadoId);

      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      setDatosCurso(respuesta.data || null);

      // Se comprueba que el índice activo no sobrepase el nuevo número de módulos
      setIndiceModuloActivo((prev) => {
        const total = respuesta.data?.modulos?.length || 0;
        if (total === 0) return 0;
        return prev >= total ? 0 : prev;
      });
    } catch (err) {
      console.error('Error al cargar calificaciones pendientes del curso:', err);
      setError(err.message || 'Error al obtener las calificaciones pendientes del curso.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones pendientes.');
      setDatosCurso(null);
    } finally {
      setCargando(false);
    }
  }, [cursoSeleccionadoId, mostrarError]);

  useEffect(() => {
    cargarPendientesCurso();
  }, [cargarPendientesCurso]);

  // Manejador para el cambio de Curso académico
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setIndiceModuloActivo(0);
    setTerminoBusqueda('');
  }, []);

  // Lista de módulos del curso
  const modulos = useMemo(() => {
    return datosCurso?.modulos || [];
  }, [datosCurso]);

  // Módulo actualmente seleccionado según el índice del TabView
  const moduloActivo = useMemo(() => {
    if (!modulos || modulos.length === 0) return null;
    return modulos[indiceModuloActivo] || modulos[0] || null;
  }, [modulos, indiceModuloActivo]);

  // Lista de pendientes del módulo activo filtrada por el término de búsqueda
  const listaPendientesModuloFiltrada = useMemo(() => {
    if (!moduloActivo?.pendientes) return [];
    if (!terminoBusqueda || !terminoBusqueda.trim()) {
      return moduloActivo.pendientes;
    }

    const termino = terminoBusqueda.trim().toLowerCase();

    return moduloActivo.pendientes.filter((fila) => {
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
  }, [moduloActivo, terminoBusqueda]);

  // Redirección directa al módulo de Calificar preseleccionando evaluación y práctica
  const irACalificar = useCallback((fila) => {
    if (!fila) return;

    navigate('/calificar', {
      state: {
        idCurso: fila.id_curso || cursoSeleccionadoId,
        idModulo: fila.id_modulo,
        idEvaluacion: fila.id_evaluacion,
        idPractica: fila.id_practica
      }
    });
  }, [navigate, cursoSeleccionadoId]);

  // Se genera y descarga el documento PDF del módulo activo
  const descargarPDF = useCallback(async () => {
    if (!moduloActivo) {
      mostrarAdvertencia('Módulo requerido', 'Seleccione un módulo para exportar el informe.');
      return;
    }

    setExportandoPDF(true);
    try {
      const resultado = exportarInformePendientesPDF({
        curso: datosCurso?.curso,
        modulo: moduloActivo,
        evaluacion: null,
        pendientes: listaPendientesModuloFiltrada
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
  }, [moduloActivo, datosCurso, listaPendientesModuloFiltrada, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado: datosCurso?.curso || null,
    modulos,
    indiceModuloActivo,
    setIndiceModuloActivo,
    moduloActivo,
    listaPendientesModulo: listaPendientesModuloFiltrada,
    totalPendientesModuloOriginal: moduloActivo?.totalPendientes || 0,
    totalPendientesCurso: datosCurso?.totalPendientesCurso || 0,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    exportandoPDF,
    error,
    recargar: cargarPendientesCurso,
    irACalificar,
    descargarPDF
  };
};

export default useInformePendientes;
