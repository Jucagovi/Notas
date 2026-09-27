import React from 'react';

/**
 * ResumenCurriculo - Componente presentacional para métricas e información del currículo seleccionado.
 *
 * Responsabilidad Única: Renderizar una banda analítica resumida con el ciclo formativo,
 * módulo activo, cantidad de Resultados de Aprendizaje, Criterios de Evaluación y promedio por RA.
 *
 * @param {Object} props
 * @param {Object|null} [props.ciclo=null] - Datos del ciclo formativo seleccionado.
 * @param {Object|null} [props.modulo=null] - Datos del módulo profesional seleccionado.
 * @param {number} [props.totalRA=0] - Cantidad total de Resultados de Aprendizaje.
 * @param {number} [props.totalCE=0] - Cantidad total de Criterios de Evaluación.
 */
export const ResumenCurriculo = ({
  ciclo = null,
  modulo = null,
  totalRA = 0,
  totalCE = 0
}) => {
  // Cálculo de promedio de criterios por cada Resultado de Aprendizaje
  const promedioCePorRa = totalRA > 0 ? (totalCE / totalRA).toFixed(1) : '0';

  return (
    <div className="grid mb-4">
      {/* Tarjeta 1: Ciclo y Módulo activo */}
      <div className="col-12 md:col-6 lg:col-4">
        <div className="surface-card border-round p-3 border-1 surface-border shadow-1 h-full flex align-items-center gap-3">
          <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-book text-primary text-xl" />
          </div>
          <div className="flex flex-column overflow-hidden">
            <span className="text-xs text-color-secondary font-semibold uppercase tracking-wider">
              {ciclo?.siglas || 'Ciclo'}
            </span>
            <span
              className="text-base font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
              title={modulo?.nombre || ''}
            >
              {modulo ? `${modulo.siglas ? `${modulo.siglas} - ` : ''}${modulo.nombre}` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Resultados de Aprendizaje */}
      <div className="col-12 sm:col-4 lg:col-3">
        <div className="surface-card border-round p-3 border-1 surface-border shadow-1 h-full flex align-items-center justify-content-between">
          <div className="flex flex-column">
            <span className="text-xs text-color-secondary font-semibold uppercase tracking-wider">
              Resultados de Aprendizaje
            </span>
            <span className="text-2xl font-bold text-900 mt-1">
              {totalRA}
            </span>
          </div>
          <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-bookmark text-primary text-xl" />
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Criterios de Evaluación */}
      <div className="col-12 sm:col-4 lg:col-3">
        <div className="surface-card border-round p-3 border-1 surface-border shadow-1 h-full flex align-items-center justify-content-between">
          <div className="flex flex-column">
            <span className="text-xs text-color-secondary font-semibold uppercase tracking-wider">
              Criterios de Evaluación
            </span>
            <span className="text-2xl font-bold text-900 mt-1">
              {totalCE}
            </span>
          </div>
          <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-check-circle text-green-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Tarjeta 4: Promedio CE / RA */}
      <div className="col-12 sm:col-4 lg:col-2">
        <div className="surface-card border-round p-3 border-1 surface-border shadow-1 h-full flex align-items-center justify-content-between">
          <div className="flex flex-column">
            <span className="text-xs text-color-secondary font-semibold uppercase tracking-wider">
              Media CE / RA
            </span>
            <span className="text-2xl font-bold text-900 mt-1">
              {promedioCePorRa}
            </span>
          </div>
          <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-chart-pie text-orange-500 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenCurriculo;
