import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';
import {
  obtenerDatosCoberturaCurricular,
  exportarInformeCoberturaPDF,
  formatearTextoRA,
  formatearTextoCE
} from '../services/informesService.js';

// Hook personalizado para la gestión y cálculo del informe de auditoría de cobertura curricular (CE y RA)
const useInformeCoberturaCE = () => {
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Contextos globales de datos
  const { datos: todosCursosContexto } = useCursosContexto();

  // Estados de filtros
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);

  // Se selecciona automáticamente el curso más reciente por defecto al inicio
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

  // Estados de los datos cargados desde Supabase
  const [datosBrutos, setDatosBrutos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [error, setError] = useState(null);

  // Filtros reactivos de la vista
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Manejador para el cambio manual de curso académico
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setModuloSeleccionadoId(null);
    setDatosBrutos(null);
  }, []);

  // Manejador para el cambio manual de módulo profesional
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    if (!nuevoModuloId) {
      setDatosBrutos(null);
    }
  }, []);

  // Se actualizan los módulos disponibles cuando el usuario selecciona un curso
  useEffect(() => {
    const cargarModulos = async () => {
      if (!cursoSeleccionadoId) {
        setModulosDisponibles([]);
        return;
      }

      setCargandoModulos(true);
      try {
        const { data: mods, error: errMods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (errMods) {
          console.error('Error al consultar módulos por curso:', errMods);
          setModulosDisponibles([]);
        } else if (mods && mods.length > 0) {
          setModulosDisponibles(mods);
        } else {
          setModulosDisponibles([]);
        }
      } catch (err) {
        console.error('Error inesperado al cargar módulos del curso:', err);
        setModulosDisponibles([]);
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulos();
  }, [cursoSeleccionadoId]);

  // Se obtienen los datos de cobertura cuando el usuario ha seleccionado curso y módulo
  const cargarDatosCobertura = useCallback(async () => {
    if (!cursoSeleccionadoId || !moduloSeleccionadoId) {
      setDatosBrutos(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const { data, error: errConsulta } = await obtenerDatosCoberturaCurricular(
        moduloSeleccionadoId,
        cursoSeleccionadoId
      );

      if (errConsulta) {
        throw new Error(errConsulta);
      }

      setDatosBrutos(data);
    } catch (err) {
      console.error('Error al cargar datos de auditoría de cobertura:', err);
      setError(err.message || 'No se pudieron obtener los datos de cobertura curricular.');
      mostrarError('Error de consulta', 'No se pudieron obtener los datos de auditoría curricular.');
      setDatosBrutos(null);
    } finally {
      setCargando(false);
    }
  }, [moduloSeleccionadoId, cursoSeleccionadoId, mostrarError]);

  useEffect(() => {
    if (cursoSeleccionadoId && moduloSeleccionadoId) {
      cargarDatosCobertura();
    } else {
      setDatosBrutos(null);
    }
  }, [cursoSeleccionadoId, moduloSeleccionadoId, cargarDatosCobertura]);

  // Se transforman los datos de Supabase en filas planas con cálculo acumulativo de porcentajes por CE
  const filasCE = useMemo(() => {
    if (!datosBrutos || !datosBrutos.listaCE || !datosBrutos.listaRA) {
      return [];
    }

    const { listaRA, listaCE, listaTrabajan } = datosBrutos;
    const mapaRA = new Map(listaRA.map((ra) => [ra.id_ra, ra]));

    // Se ordenan los criterios por número ascendente
    const cesOrdenados = [...listaCE].sort((a, b) => {
      const numA = parseFloat(a.numero) || 0;
      const numB = parseFloat(b.numero) || 0;
      return numA - numB;
    });

    return cesOrdenados.map((ce) => {
      const raAsociado = mapaRA.get(ce.id_ra) || {};
      const asignaciones = (listaTrabajan || []).filter((t) => t.id_ce === ce.id_ce);

      // Se recopilan las prácticas vinculadas con sus aportaciones porcentuales
      const practicas = asignaciones.map((item) => {
        const infoPractica = item.Practicas || {};
        const porcentajeValor = parseInt(item.porcentaje, 10);
        const porcentajeNormalizado = isNaN(porcentajeValor) ? 0 : porcentajeValor;

        return {
          id_trabajan: item.id_trabajan,
          id_practica: item.id_practica,
          porcentaje: porcentajeNormalizado,
          descripcion: item.descripcion || '',
          nombre: infoPractica.nombre || 'Práctica sin título',
          numero: infoPractica.numero || '',
          unidad: infoPractica.unidad || '',
          enunciado: infoPractica.enunciado || '',
          etiqueta: `${infoPractica.numero ? `P${infoPractica.numero}: ` : ''}${infoPractica.nombre || 'Práctica'}`
        };
      });

      // Se calcula en el frontend la suma total de los porcentajes de cobertura asignados al CE
      const porcentaje_total = practicas.reduce((acumulado, p) => acumulado + p.porcentaje, 0);

      // Se clasifica el estado de cobertura según las reglas de negocio
      let estado_cobertura = 'completo';
      if (porcentaje_total === 0 || practicas.length === 0) {
        estado_cobertura = 'sin_cubrir';
      } else if (porcentaje_total < 100) {
        estado_cobertura = 'incompleto';
      } else if (porcentaje_total > 100) {
        estado_cobertura = 'excedido';
      }

      // Se genera la representación en texto legible de las prácticas asociadas
      const practicas_texto =
        practicas.length > 0
          ? practicas.map((p) => `${p.etiqueta} (${p.porcentaje}%)`).join(', ')
          : 'Sin prácticas asignadas';

      const textoRAFormateado = formatearTextoRA(raAsociado);
      const textoCEFormateado = formatearTextoCE(ce);

      return {
        id_ce: ce.id_ce,
        ce_numero: ce.numero,
        ce_codigo: `CE${ce.numero ?? ''}`,
        ce_nombre: ce.nombre,
        ce_descripcion: ce.descripcion || '',
        ce_texto: textoCEFormateado,
        id_ra: raAsociado.id_ra,
        ra_numero: raAsociado.numero,
        ra_codigo: `RA${raAsociado.numero ?? ''}`,
        ra_nombre: raAsociado.nombre || '',
        ra_descripcion: raAsociado.descripcion || '',
        ra_texto: textoRAFormateado,
        ra_codigo_nombre: textoRAFormateado,
        practicas,
        practicas_texto,
        porcentaje_total,
        estado_cobertura
      };
    });
  }, [datosBrutos]);

  // Se calculan las estadísticas e indicadores agregados de cobertura
  const estadisticas = useMemo(() => {
    const totalCE = filasCE.length;
    const totalRA = datosBrutos?.listaRA?.length || 0;

    const ceCompletos = filasCE.filter((f) => f.estado_cobertura === 'completo').length;
    const ceIncompletos = filasCE.filter((f) => f.estado_cobertura === 'incompleto').length;
    const ceSinCubrir = filasCE.filter((f) => f.estado_cobertura === 'sin_cubrir').length;
    const ceExcedidos = filasCE.filter((f) => f.estado_cobertura === 'excedido').length;

    const sumaPorcentajes = filasCE.reduce((acumulado, f) => acumulado + f.porcentaje_total, 0);
    const porcentajeGlobal = totalCE > 0 ? Math.round((ceCompletos / totalCE) * 100) : 0;
    const porcentajeMedio = totalCE > 0 ? Math.round(sumaPorcentajes / totalCE) : 0;

    let estadoGeneral = 'valido';
    if (totalCE === 0) {
      estadoGeneral = 'vacio';
    } else if (ceCompletos === totalCE) {
      estadoGeneral = 'valido';
    } else if (ceExcedidos > 0 || ceIncompletos > 0) {
      estadoGeneral = 'invalido';
    }

    return {
      totalCE,
      totalRA,
      ceCompletos,
      ceIncompletos,
      ceSinCubrir,
      ceExcedidos,
      porcentajeGlobal,
      porcentajeMedio,
      estadoGeneral,
      esAuditoriaCorrecta: totalCE > 0 && ceCompletos === totalCE
    };
  }, [filasCE, datosBrutos]);

  // Se filtran las filas de la tabla según el filtro de estado y el término de búsqueda
  const filasFiltradas = useMemo(() => {
    return filasCE.filter((fila) => {
      // 1. Filtrado por estado de cobertura
      if (filtroEstado !== 'todos') {
        if (filtroEstado === 'completo' && fila.estado_cobertura !== 'completo') return false;
        if (filtroEstado === 'incompleto' && fila.estado_cobertura !== 'incompleto') return false;
        if (filtroEstado === 'sin_cubrir' && fila.estado_cobertura !== 'sin_cubrir') return false;
        if (filtroEstado === 'excedido' && fila.estado_cobertura !== 'excedido') return false;
      }

      // 2. Filtrado por texto de búsqueda libre
      if (terminoBusqueda && terminoBusqueda.trim()) {
        const termino = terminoBusqueda.trim().toLowerCase();
        const coincideCE =
          (fila.ce_codigo && fila.ce_codigo.toLowerCase().includes(termino)) ||
          (fila.ce_nombre && fila.ce_nombre.toLowerCase().includes(termino)) ||
          (fila.ce_descripcion && fila.ce_descripcion.toLowerCase().includes(termino));
        const coincideRA =
          (fila.ra_codigo && fila.ra_codigo.toLowerCase().includes(termino)) ||
          (fila.ra_nombre && fila.ra_nombre.toLowerCase().includes(termino));
        const coincidePracticas =
          fila.practicas_texto && fila.practicas_texto.toLowerCase().includes(termino);

        return coincideCE || coincideRA || coincidePracticas;
      }

      return true;
    });
  }, [filasCE, filtroEstado, terminoBusqueda]);

  // Objetos de curso y módulo actualmente seleccionados
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
    ) || datosBrutos?.modulo || null;
  }, [modulosDisponibles, moduloSeleccionadoId, datosBrutos]);

  // Se genera el documento PDF de auditoría y se emite la notificación correspondiente
  const descargarPDF = useCallback(async () => {
    if (!moduloSeleccionado) {
      mostrarAdvertencia('Módulo requerido', 'Debe seleccionar un módulo para exportar el informe.');
      return;
    }

    if (filasCE.length === 0) {
      mostrarAdvertencia('Sin datos', 'No existen criterios de evaluación para generar el informe.');
      return;
    }

    setExportandoPDF(true);
    try {
      const resultado = exportarInformeCoberturaPDF({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        estadisticas,
        filasCE
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('Informe exportado', 'El informe en PDF ha sido generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al generar PDF de cobertura:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [moduloSeleccionado, cursoSeleccionado, estadisticas, filasCE, mostrarExito, mostrarError, mostrarAdvertencia]);

  // Se ordenan los cursos por fecha de creación descendente (el más reciente primero)
  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    filasCE,
    filasFiltradas,
    estadisticas,
    filtroEstado,
    setFiltroEstado,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    exportandoPDF,
    error,
    recargar: cargarDatosCobertura,
    descargarPDF
  };
};

export default useInformeCoberturaCE;
