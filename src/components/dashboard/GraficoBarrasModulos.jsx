import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';

// Subcomponente para renderizar el gráfico de barras comparativo de notas medias por módulo.
const GraficoBarrasModulos = ({ datos = null }) => {
  const tieneDatos = datos && datos.datasets && datos.datasets[0]?.data?.length > 0;

  // Configuración de visualización y escalas para el gráfico de barras.
  const opciones = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => ` Nota media: ${context.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-color-secondary, #888888)'
        },
        grid: {
          color: 'var(--surface-border, rgba(255, 255, 255, 0.08))',
          drawBorder: false
        }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: 'var(--text-color-secondary, #888888)',
          stepSize: 20
        },
        grid: {
          color: 'var(--surface-border, rgba(255, 255, 255, 0.08))',
          drawBorder: false
        }
      }
    }
  };

  return (
    <Card
      title="Nota media por módulo"
      className="h-full shadow-1 border-round surface-card"
    >
      {tieneDatos ? (
        <div style={{ height: '320px', position: 'relative' }}>
          <Chart type="bar" data={datos} options={opciones} className="h-full w-full" />
        </div>
      ) : (
        <div
          className="flex flex-column align-items-center justify-content-center text-center p-4 border-round surface-ground"
          style={{ height: '320px' }}
        >
          <i className="pi pi-chart-bar text-4xl text-400 mb-3" />
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
              No hay calificaciones registradas por asignatura.
            </span>
          </div>
          <span className="text-xs text-muted" style={{ maxWidth: '28rem' }}>
            El gráfico comparativo de notas medias se generará automáticamente a medida que se califiquen las actividades de los módulos.
          </span>
        </div>
      )}
    </Card>
  );
};

export default GraficoBarrasModulos;
