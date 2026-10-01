import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

/**
 * ResumenProgreso - Componente presentacional con los indicadores KPI de progreso y desviación.
 *
 * Responsabilidad Única: Renderizar una fila de tarjetas analíticas con el conteo de
 * unidades formativas, estado de impartición, avance porcentual y balance de desviaciones temporales.
 *
 * @param {Object} props
 * @param {Object} props.estadisticas - Objeto consolidado con las métricas calculadas.
 */
export const ResumenProgreso = ({ estadisticas = {} }) => {
  const {
    total = 0,
    completadas = 0,
    enCurso = 0,
    pendientes = 0,
    conRetraso = 0,
    enTiempo = 0,
    porcentajeProgreso = 0
  } = estadisticas;

  return (
    <div className="grid mb-4">
      {/* 1. Tarjeta Total de Unidades */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              Total Unidades
            </span>
            <div className="w-2rem h-2rem border-round bg-blue-50 text-blue-600 flex align-items-center justify-content-center">
              <i className="pi pi-folder text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-900 mb-1">{total}</div>
          <span className="text-xs text-color-secondary">
            {pendientes} pendientes de inicio
          </span>
        </div>
      </div>

      {/* 2. Tarjeta Avance Curricular */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              Avance Curricular
            </span>
            <div className="w-2rem h-2rem border-round bg-indigo-50 text-indigo-600 flex align-items-center justify-content-center">
              <i className="pi pi-check-circle text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-900 mb-1">
            {completadas} / {total}
          </div>
          <div className="flex flex-column gap-1">
            <div className="flex justify-content-between text-xs text-color-secondary">
              <span>Completadas</span>
              <span className="font-bold">{porcentajeProgreso}%</span>
            </div>
            <ProgressBar
              value={porcentajeProgreso}
              showValue={false}
              style={{ height: '6px' }}
              color="#4f46e5"
            />
          </div>
        </div>
      </div>

      {/* 3. Tarjeta En Tiempo */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              En Tiempo
            </span>
            <div className="w-2rem h-2rem border-round bg-green-50 text-green-600 flex align-items-center justify-content-center">
              <i className="pi pi-verified text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">{enTiempo}</div>
          <span className="text-xs text-color-secondary">
            {enCurso} actualmente en curso
          </span>
        </div>
      </div>

      {/* 4. Tarjeta Retraso Detectado */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              Desviación / Retraso
            </span>
            <div
              className={`w-2rem h-2rem border-round flex align-items-center justify-content-center ${
                conRetraso > 0 ? 'bg-red-50 text-red-600' : 'bg-surface-100 text-color-secondary'
              }`}
            >
              <i className="pi pi-exclamation-triangle text-sm" />
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${conRetraso > 0 ? 'text-red-600' : 'text-900'}`}>
            {conRetraso}
          </div>
          <span className="text-xs text-color-secondary">
            {conRetraso > 0
              ? `${conRetraso} ${conRetraso === 1 ? 'unidad requiere' : 'unidades requieren'} ajuste`
              : 'Sin alertas de desfase'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumenProgreso;
