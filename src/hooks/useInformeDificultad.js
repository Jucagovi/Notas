import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import {
  obtenerModulosPorCurso,
  obtenerPracticasPorModulo
} from '../services/evaluacionService.js';
import {
  getDistribucionNotas,
  exportarInformeDificultadPDF
} from '../services/informesService.js';
import { getColorNota } from '../utils/coloresNota.js';
import { formatNota } from '../utils/formatters.js';

// Definición canónica de los diez rangos o intervalos (bins) del histograma de dificultad
export const RANGOS_HISTOGRAMA = [
  { clave: '0-10', etiqueta: '0-10', min: 0, max: 10, valorMedio: 5, etiquetaNivel: 'Suspenso' },
  { clave: '11-20', etiqueta: '11-20', min: 11, max: 20, valorMedio: 15, etiquetaNivel: 'Suspenso' },
  { clave: '21-30', etiqueta: '21-30', min: 21, max: 30, valorMedio: 25, etiquetaNivel: 'Suspenso' },
  { clave: '31-40', etiqueta: '31-40', min: 31, max: 40, valorMedio: 35, etiquetaNivel: 'Suspenso' },
  { clave: '41-50', etiqueta: '41-50', min: 41, max: 50, valorMedio: 45, etiquetaNivel: 'Suspenso' },
  { clave: '51-60', etiqueta: '51-60', min: 51, max: 60, valorMedio: 55, etiquetaNivel: 'Suficiente' },
  { clave: '61-70', etiqueta: '61-70', min: 61, max: 70, valorMedio: 65, etiquetaNivel: 'Bien' },
  { clave: '71-80', etiqueta: '71-80', min: 71, max: 80, valorMedio: 75, etiquetaNivel: 'Notable' },
  { clave: '81-90', etiqueta: '81-90', min: 81, max: 90, valorMedio: 85, etiquetaNivel: 'Notable' },
  { clave: '91-100', etiqueta: '91-100', min: 91, max: 100, valorMedio: 95, etiquetaNivel: 'Sobresaliente' }
];

// Hook personalizado para gestionar los datos y la lógica del informe de dificultad de prácticas
const useInformeDificultad = () => {
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
  const [practicaSeleccionadaId, setPracticaSeleccionadaId] = useState(
    () => location.state?.idPractica || null
  );

  // Listados disponibles para los desplegables
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicasDisponibles, setPracticasDisponibles] = useState([]);

  // Estados de datos obtenidos de la base de datos
  const [notasBrutas, setNotasBrutas] = useState([]);

  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [error, setError] = useState(null);

  // Paleta de colores para gráficos reactiva al tema claro y oscuro
  const [temaGraficos, setTemaGraficos] = useState(() => ({
    textColor: '#343a3f',
    textColorSecondary: '#697077',
    surfaceBorder: '#dee2e6',
    surfaceGrid: 'rgba(0, 0, 0, 0.06)'
  }));

  // Sincronización del tema gráfico con las mutaciones de la clase y atributo de tema del documento
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
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.06)'
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
    setPracticaSeleccionadaId(null);
    setPracticasDisponibles([]);
    setNotasBrutas([]);
    setError(null);
  }, []);

  // Manejador para el cambio manual de módulo profesional
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    setPracticaSeleccionadaId(null);
    setNotasBrutas([]);
    setError(null);
  }, []);

  // Manejador para el cambio manual de práctica
  const handleCambiarPractica = useCallback((nuevaPracticaId) => {
    setPracticaSeleccionadaId(nuevaPracticaId || null);
    if (!nuevaPracticaId) {
      setNotasBrutas([]);
      setError(null);
    }
  }, []);

  // Se obtienen los módulos cuando se selecciona un curso académico
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
          console.error('Error al consultar módulos por curso:', errMods);
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

  // Se obtienen las prácticas asociadas cuando se selecciona un módulo profesional
  useEffect(() => {
    const cargarPracticasDelModulo = async () => {
      if (!moduloSeleccionadoId) {
        setPracticasDisponibles([]);
        return;
      }

      setCargandoPracticas(true);
      try {
        const { data: practicas, error: errPracticas } = await obtenerPracticasPorModulo(moduloSeleccionadoId);
        if (errPracticas) {
          console.error('Error al consultar prácticas por módulo:', errPracticas);
          setPracticasDisponibles([]);
        } else {
          setPracticasDisponibles(practicas || []);
        }
      } catch (err) {
        console.error('Error inesperado al cargar prácticas del módulo:', err);
        setPracticasDisponibles([]);
      } finally {
        setCargandoPracticas(false);
      }
    };

    cargarPracticasDelModulo();
  }, [moduloSeleccionadoId]);

  // Se obtienen las calificaciones no nulas de la práctica desde la base de datos
  const cargarDistribucionNotas = useCallback(async () => {
    if (!practicaSeleccionadaId) {
      setNotasBrutas([]);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const respuesta = await getDistribucionNotas(practicaSeleccionadaId);
      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      setNotasBrutas(respuesta.data || []);
    } catch (err) {
      console.error('Error al cargar la distribución de notas:', err);
      setError(err.message || 'No se pudieron obtener las calificaciones de la práctica.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones de la práctica.');
      setNotasBrutas([]);
    } finally {
      setCargando(false);
    }
  }, [practicaSeleccionadaId, mostrarError]);

  useEffect(() => {
    if (practicaSeleccionadaId) {
      cargarDistribucionNotas();
    } else {
      setNotasBrutas([]);
    }
  }, [practicaSeleccionadaId, cargarDistribucionNotas]);

  // Se calculan las estadísticas pedagógicas principales (media, tasa de aprobados y diagnóstico)
  const estadisticas = useMemo(() => {
    const totalEvaluados = notasBrutas.length;

    if (totalEvaluados === 0) {
      return {
        totalEvaluados: 0,
        media: 0,
        mediaFormateada: '-',
        aprobados: 0,
        suspensos: 0,
        tasaAprobados: 0,
        tasaAprobadosFormateada: '-',
        diagnostico: 'Sin datos',
        diagnosticoDescripcion: 'No se han registrado calificaciones para esta práctica.',
        severidadDiagnostico: 'info',
        colorDiagnostico: '#9ca3af'
      };
    }

    // Se calcula la media aritmética
    const sumaNotas = notasBrutas.reduce((acumulador, nota) => acumulador + nota, 0);
    const media = sumaNotas / totalEvaluados;

    // Se contabilizan aprobados (nota >= 50 en la escala 0-100) y suspensos
    const aprobados = notasBrutas.filter((nota) => nota >= 50).length;
    const suspensos = totalEvaluados - aprobados;
    const tasaAprobados = (aprobados / totalEvaluados) * 100;

    // Se determina el diagnóstico automático en función de la media aritmética
    let diagnostico = 'Adecuada';
    let diagnosticoDescripcion = 'Media equilibrada (50-79 puntos). El nivel de exigencia es pedagógicamente adecuado.';
    let severidadDiagnostico = 'success';
    let colorDiagnostico = '#22c55e';

    if (media >= 80) {
      diagnostico = 'Muy Fácil';
      diagnosticoDescripcion = 'Media superior a 80 puntos. La práctica presenta una dificultad muy baja o los alumnos la dominan plenamente.';
      severidadDiagnostico = 'info';
      colorDiagnostico = '#3b82f6';
    } else if (media < 50) {
      diagnostico = 'Difícil';
      diagnosticoDescripcion = 'Media inferior a 50 puntos. La práctica presenta un nivel alto de dificultad y podría requerir refuerzo pedagógico.';
      severidadDiagnostico = 'danger';
      colorDiagnostico = '#ef4444';
    }

    return {
      totalEvaluados,
      media,
      mediaFormateada: formatNota(media),
      aprobados,
      suspensos,
      tasaAprobados,
      tasaAprobadosFormateada: `${tasaAprobados.toFixed(1)}%`,
      diagnostico,
      diagnosticoDescripcion,
      severidadDiagnostico,
      colorDiagnostico
    };
  }, [notasBrutas]);

  // Se agrupan y cuentan las notas dentro de los 10 intervalos del histograma
  const distribucionRangos = useMemo(() => {
    const totalNotas = notasBrutas.length;

    return RANGOS_HISTOGRAMA.map((rango) => {
      const frecuencia = notasBrutas.filter((nota) => {
        const n = Math.round(nota);
        return n >= rango.min && n <= rango.max;
      }).length;

      const porcentaje = totalNotas > 0 ? (frecuencia / totalNotas) * 100 : 0;
      const infoColor = getColorNota(rango.valorMedio);

      return {
        ...rango,
        rango: rango.etiqueta,
        frecuencia,
        porcentaje,
        porcentajeFormateado: `${porcentaje.toFixed(1)}%`,
        colorHex: infoColor.hex,
        claseTexto: infoColor.text,
        claseFondo: infoColor.bg
      };
    });
  }, [notasBrutas]);

  // Se configuran los datos del gráfico de barras para PrimeReact Chart
  const datosGrafico = useMemo(() => {
    const etiquetas = distribucionRangos.map((r) => r.rango);
    const frecuencias = distribucionRangos.map((r) => r.frecuencia);
    const colores = distribucionRangos.map((r) => r.colorHex);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Nº de Alumnos',
          data: frecuencias,
          backgroundColor: colores,
          borderColor: colores,
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 45
        }
      ]
    };
  }, [distribucionRangos]);

  // Se configuran las opciones visuales y escalas del gráfico de barras
  const opcionesGrafico = useMemo(() => {
    const maxFrecuencia = Math.max(...distribucionRangos.map((r) => r.frecuencia), 0);
    const sugeridoMax = maxFrecuencia > 0 ? Math.ceil(maxFrecuencia * 1.15) : 5;

    return {
      maintainAspectRatio: false,
      aspectRatio: 1.6,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { weight: 'bold', size: 13 },
          bodyFont: { size: 12 },
          padding: 10,
          displayColors: true,
          callbacks: {
            title: (items) => {
              if (!items || items.length === 0) return '';
              const index = items[0].dataIndex;
              const rango = distribucionRangos[index];
              return `Rango de Notas: ${rango?.rango || ''} puntos`;
            },
            label: (context) => {
              const index = context.dataIndex;
              const rango = distribucionRangos[index];
              const total = estadisticas.totalEvaluados;
              const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
              return ` Alumnos: ${context.raw} (${pct}%) - ${rango?.etiquetaNivel || ''}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Intervalos de Calificación (0 - 100)',
            color: temaGraficos.textColorSecondary,
            font: { weight: 'bold', size: 12 }
          },
          ticks: {
            color: temaGraficos.textColorSecondary,
            font: { weight: '600', size: 11 }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Número de Alumnos',
            color: temaGraficos.textColorSecondary,
            font: { weight: 'bold', size: 12 }
          },
          beginAtZero: true,
          suggestedMax: sugeridoMax,
          ticks: {
            color: temaGraficos.textColorSecondary,
            precision: 0,
            stepSize: 1,
            font: { size: 11 }
          },
          grid: {
            color: temaGraficos.surfaceGrid,
            drawBorder: false
          }
        }
      }
    };
  }, [distribucionRangos, estadisticas.totalEvaluados, temaGraficos]);

  // Objetos de modelo seleccionados para cabeceras y exportación
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

  const practicaSeleccionada = useMemo(() => {
    if (!practicaSeleccionadaId) return null;
    return (practicasDisponibles || []).find(
      (p) => String(p.id_practica).toLowerCase() === String(practicaSeleccionadaId).toLowerCase()
    ) || null;
  }, [practicasDisponibles, practicaSeleccionadaId]);

  // Referencia al componente visual Chart de PrimeReact para capturar su imagen
  const chartRef = useRef(null);

  // Se genera y descarga el documento PDF del informe de dificultad incluyendo el histograma
  const descargarPDF = useCallback(async () => {
    if (!practicaSeleccionada) {
      mostrarAdvertencia('Práctica requerida', 'Debe seleccionar una práctica para exportar el informe.');
      return;
    }

    setExportandoPDF(true);
    try {
      // Se extrae la imagen del histograma desde el elemento canvas con fondo blanco
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
          console.error('Error al capturar la imagen del gráfico para PDF:', errCanvas);
        }
      }

      const resultado = exportarInformeDificultadPDF({
        practica: practicaSeleccionada,
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        estadisticas,
        distribucionRangos,
        imagenGrafico
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('Informe exportado', 'El informe en PDF con el gráfico de histograma ha sido generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al exportar informe de dificultad a PDF:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [practicaSeleccionada, moduloSeleccionado, cursoSeleccionado, estadisticas, distribucionRangos, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    practicasDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    practicaSeleccionadaId,
    setPracticaSeleccionadaId: handleCambiarPractica,
    practicaSeleccionada,
    notasBrutas,
    estadisticas,
    distribucionRangos,
    datosGrafico,
    opcionesGrafico,
    chartRef,
    cargando,
    cargandoModulos,
    cargandoPracticas,
    exportandoPDF,
    error,
    recargar: cargarDistribucionNotas,
    descargarPDF
  };
};

export default useInformeDificultad;
