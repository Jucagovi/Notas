import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import SelectorModulo from '../common/SelectorModulo.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * WidgetRadarCobertura - Componente presentacional para la auditoría legal curricular.
 *
 * Responsabilidad Única: Renderizar el gráfico radial de cobertura de Resultados de Aprendizaje
 * por módulo e identificar visualmente las áreas curriculares huérfanas sin prácticas asignadas.
 *
 * @param {Object} props
 * @param {Object} props.radarData - Datos calculados del radar (chartData, areasHuerfanas, totalRAs, totalCubiertos, porcentajeGlobal).
 * @param {Array<Object>} props.modulos - Lista de módulos disponibles para alternar la vista.
 * @param {string|null} props.moduloSeleccionadoId - Identificador del módulo actualmente auditado.
 * @param {Function} props.onCambiarModulo - Manejador para cambiar de módulo.
 */
export const WidgetRadarCobertura = ({
  radarData,
  modulos = [],
  moduloSeleccionadoId,
  onCambiarModulo
}) => {
  const navigate = useNavigate();
  const {
    chartData,
    areasHuerfanas = [],
    totalRAs = 0,
    totalCubiertos = 0,
    porcentajeGlobal = 0
  } = radarData || {};

  // Opciones de configuración para el gráfico tipo Radar de Chart.js.
  const chartOptions = useMemo(() => {
    return {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (contexto) => `Cobertura: ${contexto.formattedValue}%`
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            display: false
          },
          grid: {
            color: '#e5e7eb'
          },
          angleLines: {
            color: '#e5e7eb'
          },
          pointLabels: {
            color: '#374151',
            font: {
              size: 11,
              weight: '600'
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }, []);

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget con selector de módulo */}
        <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-pie text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Radar de Cobertura</h2>
              <span className="text-xs text-color-secondary">Auditoría de Resultados de Aprendizaje</span>
            </div>
          </div>

          {/* Selector de módulo usando el componente estándar común */}
          <div className="w-full sm:w-14rem">
            <SelectorModulo
              value={moduloSeleccionadoId}
              options={modulos}
              onChange={(e) => onCambiarModulo && onCambiarModulo(e.value)}
              placeholder="Elegir módulo..."
              className="p-inputtext-sm w-full"
            />
          </div>
        </div>

        {/* Resumen cuantitativo rápido */}
        <div className="flex align-items-center justify-content-between bg-surface-50 p-2 border-round border-1 surface-border mb-3 text-xs">
          <span className="text-700">
            Cubiertos: <strong>{totalCubiertos} / {totalRAs} RA</strong>
          </span>
          <div className="flex align-items-center gap-1">
            <span className="text-color-secondary">Promedio:</span>
            <Tag
              value={`${porcentajeGlobal}%`}
              severity={porcentajeGlobal >= 80 ? 'success' : (porcentajeGlobal >= 50 ? 'warning' : 'danger')}
              className="text-xs font-bold"
            />
          </div>
        </div>

        {/* Gráfico radial de PrimeReact */}
        {!chartData || totalRAs === 0 ? (
          <EstadoVacio
            mensaje="Sin Resultados de Aprendizaje"
            descripcion="El módulo seleccionado no cuenta con RAs registrados en la base de datos."
            icono="pi pi-shield"
            className="my-2 p-3"
          />
        ) : (
          <div className="w-full flex justify-content-center align-items-center" style={{ height: '220px' }}>
            <Chart type="radar" data={chartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />
          </div>
        )}

        {/* Alerta de áreas curriculares huérfanas */}
        {areasHuerfanas.length > 0 && (
          <div className="mt-3 p-2 border-round bg-red-50 text-red-700 border-1 border-red-200 text-xs flex flex-column gap-1">
            <div className="flex align-items-center gap-2 font-bold">
              <i className="pi pi-exclamation-circle text-red-600" />
              <span>Áreas curriculares huérfanas ({areasHuerfanas.length})</span>
            </div>
            <p className="m-0 text-red-600 line-height-2">
              Los siguientes RA no disponen de actividades prácticas vinculadas:{' '}
              <strong>{areasHuerfanas.map((a) => a.codigo).join(', ')}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Pie del widget con acceso al taller de prácticas */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-content-between align-items-center">
        <Button
          label="Mapeo de Criterios"
          icon="pi pi-check-square"
          size="small"
          text
          onClick={() => navigate('/criterios')}
        />
        <Button
          label="Taller de Prácticas"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/taller-practicas')}
        />
      </div>
    </div>
  );
};

export default WidgetRadarCobertura;
