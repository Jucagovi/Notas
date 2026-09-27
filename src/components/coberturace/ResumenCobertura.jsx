import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

/**
 * ResumenCobertura - Componente presentacional con tarjetas métricas de la auditoría curricular.
 *
 * Responsabilidad Única: Exponer de forma sintetizada el estado global de la cobertura de CE
 * del módulo seleccionado, permitiendo al docente advertir inmediatamente el porcentaje de cumplimiento
 * y la cantidad de criterios sin cubrir o desbalanceados.
 *
 * @param {Object} props
 * @param {Object} props.metricas - Objeto con los cálculos estadísticos consolidados.
 * @param {number} props.metricas.totalCE - Número total de Criterios de Evaluación en el módulo.
 * @param {number} props.metricas.totalCubiertos - Cantidad de criterios con cobertura exacta al 100%.
 * @param {number} props.metricas.totalSinCubrir - Cantidad de criterios sin actividades asignadas (0%).
 * @param {number} props.metricas.totalDesbalanceados - Cantidad de criterios con suma inferior o superior al 100%.
 * @param {number} props.metricas.porcentajeGlobal - Porcentaje de criterios correctamente cubiertos.
 */
export const ResumenCobertura = ({ metricas }) => {
  const {
    totalCE = 0,
    totalCubiertos = 0,
    totalSinCubrir = 0,
    totalDesbalanceados = 0,
    porcentajeGlobal = 0
  } = metricas || {};

  return (
    <div className="grid mb-4">
      {/* Tarjeta: Total de Criterios */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round shadow-1 border-1 surface-border h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              Total Criterios (CE)
            </span>
            <div
              className="flex align-items-center justify-content-center border-round bg-blue-50 text-blue-500"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-list text-lg" />
            </div>
          </div>
          <div className="text-2xl font-bold text-900">{totalCE}</div>
          <span className="text-xs text-color-secondary mt-1">
            Distribuidos en los RA del módulo
          </span>
        </div>
      </div>

      {/* Tarjeta: Cobertura Completa (100%) */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round shadow-1 border-1 surface-border h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-green-600 uppercase">
              Cubiertos al 100%
            </span>
            <div
              className="flex align-items-center justify-content-center border-round bg-green-50 text-green-500"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-check-circle text-lg" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{totalCubiertos}</div>
          <span className="text-xs text-color-secondary mt-1">
            Ponderación completa y válida
          </span>
        </div>
      </div>

      {/* Tarjeta: Sin Cubrir (0%) */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round shadow-1 border-1 surface-border h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase">
              Sin Cubrir (0%)
            </span>
            <div
              className="flex align-items-center justify-content-center border-round surface-200 text-color-secondary"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-info-circle text-lg" />
            </div>
          </div>
          <div className="text-2xl font-bold text-700">{totalSinCubrir}</div>
          <span className="text-xs text-color-secondary mt-1">
            Sin actividades asociadas
          </span>
        </div>
      </div>

      {/* Tarjeta: Desbalanceados (<100% o >100%) */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round shadow-1 border-1 surface-border h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase">
              Desbalanceados
            </span>
            <div
              className="flex align-items-center justify-content-center border-round bg-red-50 text-red-500"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-exclamation-triangle text-lg" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{totalDesbalanceados}</div>
          <span className="text-xs text-color-secondary mt-1">
            Suma menor o mayor al 100%
          </span>
        </div>
      </div>

      {/* Barra de progreso global del módulo */}
      <div className="col-12 mt-1">
        <div className="surface-card p-3 border-round shadow-1 border-1 surface-border">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-sm font-semibold text-800">
              Cumplimiento curricular global del módulo
            </span>
            <span className="text-sm font-bold text-primary">
              {porcentajeGlobal}% ({totalCubiertos} de {totalCE} CE válidos)
            </span>
          </div>
          <ProgressBar
            value={porcentajeGlobal}
            showValue={false}
            style={{ height: '0.65rem' }}
            color={porcentajeGlobal === 100 ? '#10b981' : porcentajeGlobal >= 50 ? '#3b82f6' : '#f59e0b'}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumenCobertura;
