import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { getColorNota } from '../../utils/coloresNota.js';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * GraficosRendimientoDiscente - Subcomponente presentacional para los gráficos de rendimiento 360º.
 *
 * Responsabilidad Única: Renderizar el gráfico interactivo de líneas (evolución temporal)
 * y el gráfico circular/doughnut (distribución por categorías oficiales con colores de getColorNota).
 *
 * @param {Object} props
 * @param {Array<Object>} props.actividades - Lista de actividades del módulo seleccionado.
 * @param {Object} props.estadisticas - Estadísticas agregadas del módulo.
 */
export const GraficosRendimientoDiscente = ({
  actividades = [],
  estadisticas = {}
}) => {
  const { calificadas = 0, distribucion = {} } = estadisticas;

  // Configuración de los datos del Gráfico de Líneas (Evolución temporal de notas)
  const datosLineas = useMemo(() => {
    const etiquetas = actividades.map((a) => {
      const nombreCorto =
        a.nombre_practica.length > 20
          ? `${a.nombre_practica.substring(0, 18)}...`
          : a.nombre_practica;
      return `${nombreCorto} (${a.numero_version || 'v1.0'})`;
    });

    const valoresNotas = actividades.map((a) =>
      a.nota !== null && a.nota !== undefined ? a.nota : null
    );

    const coloresPuntos = actividades.map((a) => {
      if (a.nota === null || a.nota === undefined) return '#94a3b8';
      return getColorNota(a.nota).hex;
    });

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Calificación',
          data: valoresNotas,
          fill: false,
          borderColor: '#3b82f6',
          tension: 0.35,
          spanGaps: true,
          pointBackgroundColor: coloresPuntos,
          pointBorderColor: coloresPuntos,
          pointHoverBackgroundColor: coloresPuntos,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  }, [actividades]);

  // Opciones para el Gráfico de Líneas
  const opcionesLineas = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 11 }
          },
          grid: {
            color: '#e5e7eb'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 20,
            font: { size: 10 }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const idx = items[0].dataIndex;
              const act = actividades[idx];
              return act ? `${act.nombre_practica} (${act.nombre_evaluacion})` : '';
            },
            label: (contexto) => {
              const valor = contexto.raw;
              if (valor === null || valor === undefined) {
                return ' Calificación: Sin calificar';
              }
              const { etiqueta } = getColorNota(valor);
              return ` Calificación: ${valor}/100 (${etiqueta})`;
            }
          }
        }
      }
    };
  }, [actividades]);

  // Configuración de los datos del Gráfico Circular / Doughnut
  // Regla estricta: los colores de los segmentos deben extraerse de getColorNota
  const datosDoughnut = useMemo(() => {
    const {
      suspensos = 0,
      suficientes = 0,
      bien = 0,
      notables = 0,
      sobresalientes = 0
    } = distribucion;

    // Extracción estricta de la escala cromática oficial mediante getColorNota
    const colorSuspenso = getColorNota(40).hex;
    const colorSuficiente = getColorNota(55).hex;
    const colorBien = getColorNota(65).hex;
    const colorNotable = getColorNota(75).hex;
    const colorSobresaliente = getColorNota(95).hex;

    return {
      labels: [
        `Suspensos (<50): ${suspensos}`,
        `Suficientes (50-59): ${suficientes}`,
        `Bien (60-69): ${bien}`,
        `Notables (70-89): ${notables}`,
        `Sobresalientes (90-100): ${sobresalientes}`
      ],
      datasets: [
        {
          data: [suspensos, suficientes, bien, notables, sobresalientes],
          backgroundColor: [
            colorSuspenso,
            colorSuficiente,
            colorBien,
            colorNotable,
            colorSobresaliente
          ],
          hoverBackgroundColor: [
            colorSuspenso,
            colorSuficiente,
            colorBien,
            colorNotable,
            colorSobresaliente
          ],
          borderWidth: 2
        }
      ]
    };
  }, [distribucion]);

  // Opciones para el Gráfico Circular / Doughnut
  const opcionesDoughnut = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: { size: 11 },
            color: '#4b5563'
          }
        },
        tooltip: {
          callbacks: {
            label: (contexto) => {
              const valor = contexto.raw || 0;
              const porcentaje =
                calificadas > 0 ? Math.round((valor / calificadas) * 100) : 0;
              return ` ${valor} actividad(es) (${porcentaje}%)`;
            }
          }
        }
      }
    };
  }, [calificadas]);

  if (calificadas === 0) {
    return (
      <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1">
        <EstadoVacio
          mensaje="Sin calificaciones para generar gráficos"
          descripcion="Introduce calificaciones en la tabla superior para visualizar la evolución temporal y la distribución estadística del discente."
          icono="pi pi-chart-line"
          className="my-2"
        />
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Gráfico 1: Evolución temporal de calificaciones */}
      <div className="col-12 lg:col-7">
        <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border">
            <i className="pi pi-chart-line text-primary" />
            <h4 className="text-sm md:text-base font-bold text-900 m-0">
              Evolución Temporal de Calificaciones
            </h4>
          </div>

          <div className="w-full" style={{ height: '240px' }}>
            <Chart
              type="line"
              data={datosLineas}
              options={opcionesLineas}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Gráfico 2: Distribución por categorías oficiales */}
      <div className="col-12 lg:col-5">
        <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border">
            <i className="pi pi-chart-pie text-primary" />
            <h4 className="text-sm md:text-base font-bold text-900 m-0">
              Distribución por Rangos Oficiales
            </h4>
          </div>

          <div className="w-full flex justify-content-center align-items-center" style={{ height: '240px' }}>
            <Chart
              type="doughnut"
              data={datosDoughnut}
              options={opcionesDoughnut}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosRendimientoDiscente;
