import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';
import {
  getDatosActa,
  transformarDatosActa,
  exportarActaCSV,
  exportarActaPDF
} from '../services/informesService.js';

// Hook personalizado para gestionar los datos y la lógica del acta de evaluación oficial de un módulo
const useInformeEvaluacion = () => {
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Se obtienen los cursos desde el contexto global de la aplicación
  const { datos: todosCursosContexto } = useCursosContexto();

  // Estados de selección para los desplegables de Curso y Módulo
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Módulos disponibles según el curso seleccionado
  const [modulosDisponibles, setModulosDisponibles] = useState([]);

  // Estados de datos del acta
  const [datosCrudos, setDatosCrudos] = useState(null);
  const [filasActa, setFilasActa] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de carga y exportación
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [exportandoCSV, setExportandoCSV] = useState(false);
  const [error, setError] = useState(null);

  // Término de búsqueda para filtrar discentes en la tabla
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Se ordenan los cursos de más reciente a más antiguo según su fecha de creación
  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  // Se selecciona automáticamente por defecto el curso más reciente si no existe uno previo
  useEffect(() => {
    if (cursosOrdenados.length > 0 && !cursoSeleccionadoId) {
      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Manejador para el cambio manual de curso académico
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setModuloSeleccionadoId(null);
    setDatosCrudos(null);
    setFilasActa([]);
    setEvaluaciones([]);
    setEstadisticas(null);
    setError(null);
  }, []);

  // Manejador para el cambio manual de módulo profesional
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    if (!nuevoModuloId) {
      setDatosCrudos(null);
      setFilasActa([]);
      setEvaluaciones([]);
      setEstadisticas(null);
      setError(null);
    }
  }, []);

  // Se cargan los módulos profesionales cuando cambia el curso seleccionado
  useEffect(() => {
    const cargarModulosDelCurso = async () => {
      if (!cursoSeleccionadoId) {
        setModulosDisponibles([]);
        return;
      }

      setCargandoModulos(true);
      try {
        const { data: mods, error: errMods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (errMods) {
          console.error('Error al consultar módulos del curso:', errMods);
          setModulosDisponibles([]);
        } else {
          setModulosDisponibles(mods || []);
        }
      } catch (err) {
        console.error('Error inesperado al cargar módulos del curso:', err);
        setModulosDisponibles([]);
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulosDelCurso();
  }, [cursoSeleccionadoId]);

  // Se obtienen los datos completos del acta cuando se selecciona un módulo profesional
  const cargarDatosActa = useCallback(async () => {
    if (!moduloSeleccionadoId) {
      setDatosCrudos(null);
      setFilasActa([]);
      setEvaluaciones([]);
      setEstadisticas(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await getDatosActa(moduloSeleccionadoId, cursoSeleccionadoId);

      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      const datos = respuesta.data;
      setDatosCrudos(datos);

      // Se realiza la transformación y pivote de datos para la visualización en DataTable
      const transformado = transformarDatosActa(datos);
      setFilasActa(transformado.filas || []);
      setEvaluaciones(transformado.evaluaciones || []);
      setEstadisticas(transformado.estadisticas || null);
    } catch (err) {
      console.error('Error al cargar datos del acta:', err);
      setError(err.message || 'No se pudieron obtener las calificaciones del acta.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones del módulo.');
      setDatosCrudos(null);
      setFilasActa([]);
      setEvaluaciones([]);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  }, [moduloSeleccionadoId, cursoSeleccionadoId, mostrarError]);

  useEffect(() => {
    if (moduloSeleccionadoId) {
      cargarDatosActa();
    } else {
      setDatosCrudos(null);
      setFilasActa([]);
      setEvaluaciones([]);
      setEstadisticas(null);
    }
  }, [moduloSeleccionadoId, cargarDatosActa]);

  // Se filtran los discentes mostrados según el término de búsqueda introducido
  const filasFiltradas = useMemo(() => {
    if (!terminoBusqueda || !terminoBusqueda.trim()) {
      return filasActa;
    }

    const termino = terminoBusqueda.trim().toLowerCase();

    return filasActa.filter((fila) => {
      const coincideNombre =
        (fila.nombre && fila.nombre.toLowerCase().includes(termino)) ||
        (fila.apellidos && fila.apellidos.toLowerCase().includes(termino)) ||
        (fila.nombreCompleto && fila.nombreCompleto.toLowerCase().includes(termino)) ||
        (fila.nombreCompletoDirecto && fila.nombreCompletoDirecto.toLowerCase().includes(termino));

      const coincideNIA = fila.NIA && fila.NIA.toLowerCase().includes(termino);
      const coincideCorreo = fila.correo && fila.correo.toLowerCase().includes(termino);

      return coincideNombre || coincideNIA || coincideCorreo;
    });
  }, [filasActa, terminoBusqueda]);

  // Modelos completos de curso y módulo seleccionados
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

  // Se descarga el archivo CSV con los datos del acta oficial
  const descargarCSV = useCallback(() => {
    if (!moduloSeleccionado) {
      mostrarAdvertencia('Módulo requerido', 'Debe seleccionar un módulo para exportar el acta.');
      return;
    }

    if (filasActa.length === 0) {
      mostrarAdvertencia('Sin registros', 'No hay datos de discentes para exportar a CSV.');
      return;
    }

    setExportandoCSV(true);
    try {
      const resultado = exportarActaCSV({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        evaluaciones,
        filas: filasFiltradas
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('CSV exportado', 'El archivo CSV del acta de evaluación ha sido descargado correctamente.');
    } catch (err) {
      console.error('Error al exportar CSV del acta:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el archivo CSV.');
    } finally {
      setExportandoCSV(false);
    }
  }, [moduloSeleccionado, cursoSeleccionado, evaluaciones, filasFiltradas, filasActa.length, mostrarExito, mostrarError, mostrarAdvertencia]);

  // Se genera y descarga el documento PDF oficial del acta
  const descargarPDF = useCallback(() => {
    if (!moduloSeleccionado) {
      mostrarAdvertencia('Módulo requerido', 'Debe seleccionar un módulo para exportar el acta.');
      return;
    }

    if (filasActa.length === 0) {
      mostrarAdvertencia('Sin registros', 'No hay datos de discentes para exportar a PDF.');
      return;
    }

    setExportandoPDF(true);
    try {
      const resultado = exportarActaPDF({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        evaluaciones,
        filas: filasFiltradas,
        estadisticas
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('PDF exportado', 'El documento PDF del acta de evaluación oficial ha sido generado y descargado.');
    } catch (err) {
      console.error('Error al exportar PDF del acta:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [moduloSeleccionado, cursoSeleccionado, evaluaciones, filasFiltradas, estadisticas, filasActa.length, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    datosCrudos,
    filasActa,
    filasFiltradas,
    evaluaciones,
    estadisticas,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    exportandoPDF,
    exportandoCSV,
    error,
    recargar: cargarDatosActa,
    descargarCSV,
    descargarPDF
  };
};

export default useInformeEvaluacion;
