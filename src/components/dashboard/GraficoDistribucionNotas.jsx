import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';

// Subcomponente para renderizar el gráfico doughnut de distribución de notas por escala oficial.
const GraficoDistribucionNotas = ({ datos = null, tieneCalificaciones = false }) => {
  const tieneDatosValidos =
    tieneCalificaciones &&
    datos &&
    datos.datasets &&
    datos.datasets[0]?.data?.some((val) => val > 0);

  // Opciones de configuración del gráfico doughnut.
  const opciones = {
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-color, #e0e0e0)',
          usePointStyle: true,
          boxWidth: 8,
          padding: 14,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const valor = context.parsed;
            const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${valor} (${porcentaje}%)`;
          }
        }
      }
    }
  };

  return (
    <Card
      title="Distribución de calificaciones"
      className="h-full shadow-1 border-round surface-card"
    >
      {tieneDatosValidos ? (
        <div style={{ height: '320px', position: 'relative' }}>
          <Chart type="doughnut" data={datos} options={opciones} className="h-full w-full" />
        </div>
      ) : (
        <div
          className="flex flex-column align-items-center justify-content-center text-center p-4 border-round surface-ground"
          style={{ height: '320px' }}
        >
          <div className="mb-3 text-400" style={{ fontSize: '2.5rem' }}>
            <i className="pi pi-chart-pie" />
          </div>
          <div
            className="flex align-items-center gap-2 px-4 py-2 border-round mb-2"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8'
            }}
          >
            <i className="pi pi-info-circle" />
            <span className="text-sm font-medium">
              No hay datos de distribución de calificaciones.
            </span>
          </div>
          <span className="text-xs text-muted" style={{ maxWidth: '28rem' }}>
            Se mostrará la proporción de suspensos, suficientes, bien, notables y sobresalientes cuando existan calificaciones en el sistema.
          </span>
        </div>
      )}
    </Card>
  );
};

export default GraficoDistribucionNotas;
