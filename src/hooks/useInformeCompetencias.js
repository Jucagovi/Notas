import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';
import { obtenerDiscentesDeClase } from '../services/cursoSetupService.js';
import { obtenerListaDiscentes } from '../services/discenteService.js';
import {
  getRadarCompetencias,
  exportarInformeCompetenciasPDF
} from '../services/informesService.js';
import { getColorNota } from '../utils/coloresNota.js';
import { formatNota } from '../utils/formatters.js';

// Limpia prefijos redundantes de numeración del Resultado de Aprendizaje
const limpiarDescripcionRA = (texto) => {
  if (!texto) return '';
  return texto
    .replace(/^(RA|Resultado\s+de\s+Aprendizaje)\s*\d*[\s:.-]*/gi, '')
    .replace(/^[\s:.-]+/, '')
    .trim();
};

// Divide un texto largo en líneas de longitud máxima respetando palabras completas para los tooltips
const dividirTextoEnLineas = (texto, maxLongitud = 48) => {
  if (!texto) return [];
  const palabras = texto.trim().split(/\s+/);
  const lineas = [];
  let lineaActual = '';

  palabras.forEach((palabra) => {
    if ((lineaActual ? `${lineaActual} ${palabra}` : palabra).length <= maxLongitud) {
      lineaActual = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    } else {
      if (lineaActual) lineas.push(lineaActual);
      lineaActual = palabra;
    }
  });

  if (lineaActual) lineas.push(lineaActual);
  return lineas;
};

// Hook personalizado para la gestión y cálculo del informe radar de competencias individuales
const useInformeCompetencias = () => {
  const location = useLocation();
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useToast();

  // Contexto global de cursos
  const { datos: todosCursosContexto } = useCursosContexto();

  // Estados de selección para los desplegables en cascada
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(
    () => location.state?.idCurso || null
  );
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(
    () => location.state?.idModulo || null
  );
  const [discenteSeleccionadoId, setDiscenteSeleccionadoId] = useState(
    () => location.state?.idDiscente || null
  );

  // Listados disponibles para los selectores
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [discentesDisponibles, setDiscentesDisponibles] = useState([]);

  // Datos del informe radar
  const [datosRadar, setDatosRadar] = useState(null);

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [cargandoDiscentes, setCargandoDiscentes] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [error, setError] = useState(null);

  // Paleta de colores para el gráfico adaptativa a temas claro y oscuro
  const [temaGraficos, setTemaGraficos] = useState(() => ({
    textColor: '#343a3f',
    textColorSecondary: '#697077',
    surfaceBorder: '#dee2e6',
    surfaceGrid: 'rgba(0, 0, 0, 0.08)'
  }));

  // Sincronización del tema gráfico con las mutaciones de estilo de la aplicación
  useEffect(() => {
    const actualizarColoresTema = () => {
      const estiloComputado = getComputedStyle(document.documentElement);
      const esOscuro =
        document.documentElement.classList.contains('dark-theme') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      setTemaGraficos({
        textColor: esOscuro
          ? '#f1f5f9'
          : estiloComputado.getPropertyValue('--text-color').trim() || '#343a3f',
        textColorSecondary: esOscuro
          ? '#94a3b8'
          : estiloComputado.getPropertyValue('--text-muted').trim() || '#697077',
        surfaceBorder: esOscuro
          ? '#334155'
          : estiloComputado.getPropertyValue('--border-color').trim() || '#dee2e6',
        surfaceGrid: esOscuro
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.08)'
      });
    };

    actualizarColoresTema();

    const observador = new MutationObserver(() => {
      actualizarColoresTema();
    });

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observador.disconnect();
  }, []);

  // Se ordenan los cursos de más reciente a más antiguo según fecha de creación o año escolar
  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (fechaB !== fechaA) return fechaB - fechaA;
      return (b.anyo || '').localeCompare(a.anyo || '');
    });
  }, [todosCursosContexto]);

  // Se preselecciona automáticamente el curso más reciente si no se ha elegido ninguno
  useEffect(() => {
    if (cursosOrdenados.length > 0 && !cursoSeleccionadoId) {
      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Manejador para el cambio manual de curso
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setModuloSeleccionadoId(null);
    setDiscenteSeleccionadoId(null);
    setModulosDisponibles([]);
    setDiscentesDisponibles([]);
    setDatosRadar(null);
    setError(null);
  }, []);

  // Manejador para el cambio manual de módulo
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    setDiscenteSeleccionadoId(null);
    setDiscentesDisponibles([]);
    setDatosRadar(null);
    setError(null);
  }, []);

  // Manejador para el cambio manual de discente
  const handleCambiarDiscente = useCallback((nuevoDiscenteId) => {
    setDiscenteSeleccionadoId(nuevoDiscenteId || null);
    if (!nuevoDiscenteId) {
      setDatosRadar(null);
      setError(null);
    }
  }, []);

  // Se obtienen los módulos correspondientes al curso seleccionado
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
          console.error('Error al consultar módulos del curso:', errMods);
          setModulosDisponibles([]);
        } else {
          setModulosDisponibles(mods || []);
        }
      } catch (err) {
        console.error('Error inesperado al cargar módulos:', err);
        setModulosDisponibles([]);
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulos();
  }, [cursoSeleccionadoId]);

  // Se obtienen los discentes matriculados en el curso y módulo seleccionados
  useEffect(() => {
    const cargarDiscentes = async () => {
      if (!cursoSeleccionadoId || !moduloSeleccionadoId) {
        setDiscentesDisponibles([]);
        return;
      }

      setCargandoDiscentes(true);
      try {
        const { data: discentesClase, error: errClase } = await obtenerDiscentesDeClase(
          cursoSeleccionadoId,
          moduloSeleccionadoId
        );

        if (!errClase && discentesClase && discentesClase.length > 0) {
          setDiscentesDisponibles(discentesClase);
        } else {
          // Si no hay matrículas en imparte, se consultan todos los discentes activos como mecanismo de respaldo
          const { data: todosDiscentes, error: errTodos } = await obtenerListaDiscentes();
          if (!errTodos && todosDiscentes) {
            setDiscentesDisponibles(todosDiscentes);
          } else {
            setDiscentesDisponibles([]);
          }
        }
      } catch (err) {
        console.error('Error inesperado al cargar discentes del módulo:', err);
        setDiscentesDisponibles([]);
      } finally {
        setCargandoDiscentes(false);
      }
    };

    cargarDiscentes();
  }, [cursoSeleccionadoId, moduloSeleccionadoId]);

  // Se obtienen los datos de radar competencial desde Supabase cruzando evaluan y trabajan
  const cargarDatosRadar = useCallback(async () => {
    if (!moduloSeleccionadoId || !discenteSeleccionadoId) {
      setDatosRadar(null);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const resp = await getRadarCompetencias(moduloSeleccionadoId, discenteSeleccionadoId);
      if (resp.error) {
        throw new Error(resp.error);
      }

      setDatosRadar(resp.data);
    } catch (err) {
      console.error('Error al compilar el radar de competencias:', err);
      setError(err.message || 'Error al obtener los datos de competencias del discente.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones competenciales.');
      setDatosRadar(null);
    } finally {
      setCargando(false);
    }
  }, [moduloSeleccionadoId, discenteSeleccionadoId, mostrarError]);

  useEffect(() => {
    if (moduloSeleccionadoId && discenteSeleccionadoId) {
      cargarDatosRadar();
    } else {
      setDatosRadar(null);
    }
  }, [moduloSeleccionadoId, discenteSeleccionadoId, cargarDatosRadar]);

  // Modelos seleccionados para encabezados y exportación
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
    ) || datosRadar?.modulo || null;
  }, [modulosDisponibles, moduloSeleccionadoId, datosRadar?.modulo]);

  const discenteSeleccionado = useMemo(() => {
    if (!discenteSeleccionadoId) return null;
    return (discentesDisponibles || []).find(
      (d) => String(d.id_discente).toLowerCase() === String(discenteSeleccionadoId).toLowerCase()
    ) || datosRadar?.discente || null;
  }, [discentesDisponibles, discenteSeleccionadoId, datosRadar?.discente]);

  const listaRA = useMemo(() => {
    return datosRadar?.listaRA || [];
  }, [datosRadar]);

  const estadisticas = useMemo(() => {
    return datosRadar?.estadisticas || {
      totalRA: 0,
      raEvaluados: 0,
      mediaGlobal: null,
      raSuperados: 0,
      raNoSuperados: 0,
      tasaSuperados: 0,
      raMasFuerte: null,
      raMasDebil: null
    };
  }, [datosRadar]);

  // Se configuran los datos del gráfico Radar de PrimeReact
  const datosGraficoRadar = useMemo(() => {
    if (listaRA.length === 0) {
      return { labels: [], datasets: [] };
    }

    const etiquetas = listaRA.map((ra) => ra.codigo || `RA ${ra.numero || ''}`);
    const valoresNotas = listaRA.map((ra) => (ra.nota !== null && ra.nota !== undefined ? ra.nota : 0));
    const coloresPuntos = listaRA.map((ra) => getColorNota(ra.nota).hex);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Calificación Ponderada (0 - 100)',
          data: valoresNotas,
          backgroundColor: 'rgba(59, 130, 246, 0.22)',
          borderColor: '#3b82f6',
          pointBackgroundColor: coloresPuntos,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#3b82f6',
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2
        }
      ]
    };
  }, [listaRA]);

  // Opciones de visualización y escalas radiales del gráfico Radar
  const opcionesGraficoRadar = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.4,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: temaGraficos.textColor,
            font: { size: 12, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: { weight: 'bold', size: 13 },
          titleColor: '#ffffff',
          bodyFont: { size: 11 },
          bodyColor: '#f1f5f9',
          footerFont: { size: 10, weight: 'normal' },
          footerColor: '#94a3b8',
          padding: 12,
          boxPadding: 4,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              const nombreLimpio = limpiarDescripcionRA(ra?.nombre || '');
              return ra ? `${ra.codigo}${nombreLimpio ? `: ${nombreLimpio}` : ''}` : '';
            },
            beforeBody: (items) => {
              if (!items.length) return [];
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              // Se extrae la descripción limpiando el número del RA y prefijos redundantes
              const descBruta = ra?.descripcion || ra?.textoCompleto || ra?.nombre || '';
              const descLimpia = limpiarDescripcionRA(descBruta);

              if (!descLimpia) {
                return [];
              }

              const lineasDesc = dividirTextoEnLineas(descLimpia, 46);
              return [...lineasDesc, ''];
            },
            label: (context) => {
              const valor = context.raw;
              const idx = context.dataIndex;
              const ra = listaRA[idx];
              if (ra && (ra.nota === null || ra.nota === undefined)) {
                return ' Calificación: Sin calificaciones registradas';
              }
              const infoColor = getColorNota(valor);
              return ` Calificación: ${formatNota(valor)} / 100 (${infoColor.label})`;
            },
            afterBody: (items) => {
              if (!items.length) return [];
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              if (!ra) return [];
              return [` Cobertura: ${ra.ceEvaluados || 0} de ${ra.totalCE || 0} Criterios (CE) evaluados`];
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            color: temaGraficos.textColorSecondary,
            backdropColor: 'transparent',
            showLabelBackdrop: false,
            font: { size: 10 }
          },
          grid: {
            color: temaGraficos.surfaceGrid
          },
          angleLines: {
            color: temaGraficos.surfaceBorder
          },
          pointLabels: {
            color: temaGraficos.textColor,
            font: { size: 11, weight: '600' }
          }
        }
      }
    };
  }, [temaGraficos, listaRA]);

  // Referencia al componente visual Chart de PrimeReact para capturar su imagen
  const chartRef = useRef(null);

  // Se genera y descarga el documento PDF con el gráfico de radar y la tabla de respaldo
  const descargarPDF = useCallback(async () => {
    if (!moduloSeleccionado || !discenteSeleccionado) {
      mostrarAdvertencia('Selección requerida', 'Debe seleccionar un módulo y un discente para exportar.');
      return;
    }

    setExportandoPDF(true);
    try {
      let imagenGrafico = null;
      if (chartRef.current) {
        try {
          const canvas = chartRef.current.getCanvas ? chartRef.current.getCanvas() : null;
          if (canvas) {
            const canvasTemporal = document.createElement('canvas');
            canvasTemporal.width = canvas.width;
            canvasTemporal.height = canvas.height;
            const ctx = canvasTemporal.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasTemporal.width, canvasTemporal.height);
            ctx.drawImage(canvas, 0, 0);

            imagenGrafico = canvasTemporal.toDataURL('image/png', 1.0);
          }
        } catch (errCanvas) {
          console.error('Error al capturar imagen del gráfico radar:', errCanvas);
        }
      }

      const resp = exportarInformeCompetenciasPDF({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        discente: discenteSeleccionado,
        listaRA,
        estadisticas,
        imagenGrafico
      });

      if (!resp.exito) {
        throw new Error(resp.error);
      }

      mostrarExito('Informe exportado', 'El mapa competencial en PDF ha sido generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al exportar informe de competencias a PDF:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [moduloSeleccionado, discenteSeleccionado, cursoSeleccionado, listaRA, estadisticas, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    discentesDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    discenteSeleccionadoId,
    setDiscenteSeleccionadoId: handleCambiarDiscente,
    discenteSeleccionado,
    datosRadar,
    listaRA,
    estadisticas,
    datosGraficoRadar,
    opcionesGraficoRadar,
    chartRef,
    cargando,
    cargandoModulos,
    cargandoDiscentes,
    exportandoPDF,
    error,
    recargar: cargarDatosRadar,
    descargarPDF
  };
};

export default useInformeCompetencias;
