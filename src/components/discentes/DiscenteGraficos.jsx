import React, { useState, useEffect, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { getColorNota } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Componente para la representación gráfica del rendimiento del discente (Evolución temporal y Distribución)
const DiscenteGraficos = ({
  evolucionTemporal = null,
  distribucion = null,
  estadisticas = null,
  estadisticasGlobales = null
}) => {
  // Estado reactivo para adaptar los colores de los gráficos al tema Nano de PrimeReact
  const [temaGraficos, setTemaGraficos] = useState(() => ({
    textColor: '#343a3f',
    textColorSecondary: '#697077',
    surfaceBorder: '#dee2e6',
    surfaceGrid: 'rgba(0, 0, 0, 0.06)'
  }));

  // Sincronización dinámica de los colores del gráfico al alternar temas
  useEffect(() => {
    const actualizarColores = () => {
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

    actualizarColores();

    const observador = new MutationObserver(() => {
      actualizarColores();
    });

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observador.disconnect();
  }, []);

  const evolucion =
    evolucionTemporal ||
    estadisticas?.evolucionTemporal ||
    estadisticasGlobales?.evolucionTemporal ||
    [];

  const dist =
    distribucion ||
    estadisticas?.distribucion ||
    estadisticasGlobales?.distribucion ||
    {};

  const totalCalificaciones =
    (dist.suspensos || 0) +
    (dist.aprobados || 0) +
    (dist.notables || 0) +
    (dist.sobresalientes || 0);

  // Configuración del Gráfico de Líneas: Evolución temporal de las notas de las prácticas
  const datosGraficoLineas = useMemo(() => {
    const etiquetas = evolucion.map((item) => item.etiqueta || item.nombrePractica || 'Práctica');
    const valoresNotas = evolucion.map((item) => item.nota);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Calificación (0 - 100)',
          data: valoresNotas,
          fill: true,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          tension: 0.35,
          pointBackgroundColor: valoresNotas.map((n) => getColorNota(n).hex),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  }, [evolucion]);

  // Opciones de visualización y escalas del Gráfico de Líneas
  const opcionesGraficoLineas = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { weight: 'bold' },
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const index = items[0].dataIndex;
              const punto = evolucion[index];
              return punto
                ? `${punto.moduloSiglas ? punto.moduloSiglas + ': ' : ''}${punto.nombrePractica || punto.etiqueta}`
                : '';
            },
            label: (context) => {
              const valor = context.raw;
              const index = context.dataIndex;
              const punto = evolucion[index];
              const evaluacionTexto = punto?.evaluacion ? ` [${punto.evaluacion}]` : '';
              return ` Nota: ${formatNota(valor)} / 100${evaluacionTexto}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: temaGraficos.textColorSecondary,
            font: { size: 11, weight: '500' },
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: temaGraficos.textColorSecondary,
            stepSize: 20
          },
          grid: {
            color: temaGraficos.surfaceGrid,
            drawBorder: false
          }
        }
      }
    };
  }, [temaGraficos, evolucion]);

  // Configuración del Gráfico Circular / Doughnut: Agrupación de notas por categorías
  const datosGraficoDistribucion = useMemo(() => {
    return {
      labels: [
        'Suspensos (< 50)',
        'Aprobados (50 - 69)',
        'Notables (70 - 89)',
        'Sobresalientes (90 - 100)'
      ],
      datasets: [
        {
          data: [
            dist.suspensos || 0,
            dist.aprobados || 0,
            dist.notables || 0,
            dist.sobresalientes || 0
          ],
          backgroundColor: [
            getColorNota(0).hex,
            getColorNota(55).hex,
            getColorNota(75).hex,
            getColorNota(95).hex
          ],
          hoverBackgroundColor: [
            getColorNota(0).hex,
            getColorNota(55).hex,
            getColorNota(75).hex,
            getColorNota(95).hex
          ],
          borderWidth: 2,
          borderColor: temaGraficos.surfaceBorder
        }
      ]
    };
  }, [dist.suspensos, dist.aprobados, dist.notables, dist.sobresalientes, temaGraficos.surfaceBorder]);

  // Opciones del Gráfico de Distribución
  const opcionesGraficoDistribucion = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: temaGraficos.textColor,
            usePointStyle: true,
            padding: 14,
            font: { size: 11, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          callbacks: {
            label: (context) => {
              const valor = context.raw || 0;
              const porcentaje =
                totalCalificaciones > 0
                  ? ((valor / totalCalificaciones) * 100).toFixed(1)
                  : 0;
              return ` ${context.label}: ${valor} (${porcentaje}%)`;
            }
          }
        }
      }
    };
  }, [temaGraficos, totalCalificaciones]);

  if (totalCalificaciones === 0) {
    return (
      <div className="surface-card p-4 border-round border-1 surface-border shadow-1 text-center">
        <div className="flex flex-column align-items-center justify-content-center">
          <i className="pi pi-chart-line text-4xl text-muted mb-2" />
          <h3 className="text-base font-bold m-0 mb-1 text-color">
            Sin calificaciones suficientes para generar gráficos
          </h3>
          <p className="text-muted text-xs m-0">
            Introduzca calificaciones en las prácticas de este módulo para visualizar la evolución temporal y la distribución por tramos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* 1. Gráfico de Líneas: Evolución temporal */}
      <div className="col-12 lg:col-7">
        <Card
          title={
            <div className="flex align-items-center justify-content-between">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-chart-line text-blue-500 text-lg" />
                <span className="text-base font-bold">Evolución temporal de calificaciones</span>
              </div>
              <Tag
                value={`${evolucion.length} prácticas`}
                severity="info"
                className="text-xs"
              />
            </div>
          }
          subTitle="Seguimiento cronológico del rendimiento en las tareas y actividades asentadas."
          className="h-full shadow-1 surface-card border-round"
        >
          <div style={{ height: '280px' }}>
            <Chart
              type="line"
              data={datosGraficoLineas}
              options={opcionesGraficoLineas}
              style={{ height: '100%' }}
            />
          </div>
        </Card>
      </div>

      {/* 2. Gráfico Circular: Distribución por categorías */}
      <div className="col-12 lg:col-5">
        <Card
          title={
            <div className="flex align-items-center justify-content-between">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-chart-pie text-green-500 text-lg" />
                <span className="text-base font-bold">Distribución de notas por tramos</span>
              </div>
              <Tag
                value={`${totalCalificaciones} calificaciones`}
                severity="success"
                className="text-xs"
              />
            </div>
          }
          subTitle="Agrupación por rangos: Suspensos, Aprobados, Notables y Sobresalientes."
          className="h-full shadow-1 surface-card border-round"
        >
          <div style={{ height: '280px' }}>
            <Chart
              type="doughnut"
              data={datosGraficoDistribucion}
              options={opcionesGraficoDistribucion}
              style={{ height: '100%' }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiscenteGraficos;
