import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

/**
 * BarraProgresoCobertura - Componente presentacional para visualizar el grado global de asignación de los CE.
 *
 * Responsabilidad Única: Renderizar una barra de progreso gruesa y destacada en la parte superior,
 * junto con los indicadores cuantitativos de criterios completos, parciales y pendientes en la clase.
 *
 * @param {Object} props
 * @param {Object} props.metricas - Métricas cuantitativas calculadas para los criterios del módulo.
 * @param {number} props.metricas.totalCE - Número total de Criterios de Evaluación.
 * @param {number} props.metricas.ceCompletos - Criterios con asignación exacta del 100%.
 * @param {number} props.metricas.ceIncompletos - Criterios con asignación parcial (1-99%).
 * @param {number} props.metricas.ceSinAsignar - Criterios sin asignación (0%).
 * @param {number} props.metricas.ceExcedidos - Criterios que superan el 100%.
 * @param {number} props.metricas.porcentajeGlobalMedio - Porcentaje de cobertura global medio.
 * @param {string|null} [props.nombrePracticaActiva=null] - Nombre de la práctica activa seleccionada.
 */
export const BarraProgresoCobertura = ({
  metricas,
  nombrePracticaActiva = null
}) => {
  const {
    totalCE = 0,
    ceCompletos = 0,
    ceIncompletos = 0,
    ceSinAsignar = 0,
    ceExcedidos = 0,
    porcentajeGlobalMedio = 0
  } = metricas || {};

  // Plantilla de texto personalizada para el interior de la barra de progreso
  const renderizarValorProgreso = (valor) => {
    return (
      <span className="font-bold text-sm text-white">
        {valor}% Cobertura Curricular
      </span>
    );
  };

  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      {/* Título de la sección y resumen cuantitativo */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-pie text-primary text-xl" />
          <span className="font-bold text-900 text-base">
            Grado de Asignación Curricular de los Criterios
          </span>
          {nombrePracticaActiva && (
            <span className="text-color-secondary text-sm hidden md:inline">
              (Editando: <strong className="text-900">{nombrePracticaActiva}</strong>)
            </span>
          )}
        </div>

        {/* Resumen de conteos mediante etiquetas legibles */}
        <div className="flex align-items-center gap-2 flex-wrap text-sm">
          <span className="px-2 py-1 border-round bg-green-50 text-green-700 font-medium border-1 border-green-200">
            <i className="pi pi-check text-xs mr-1" />
            {ceCompletos}/{totalCE} al 100%
          </span>

          {ceIncompletos > 0 && (
            <span className="px-2 py-1 border-round bg-orange-50 text-orange-700 font-medium border-1 border-orange-200">
              <i className="pi pi-clock text-xs mr-1" />
              {ceIncompletos} incompletos
            </span>
          )}

          {ceExcedidos > 0 && (
            <span className="px-2 py-1 border-round bg-red-50 text-red-700 font-medium border-1 border-red-200">
              <i className="pi pi-exclamation-circle text-xs mr-1" />
              {ceExcedidos} excedidos (&gt;100%)
            </span>
          )}

          {ceSinAsignar > 0 && (
            <span className="px-2 py-1 border-round surface-100 text-600 font-medium border-1 surface-border">
              {ceSinAsignar} sin asignar
            </span>
          )}
        </div>
      </div>

      {/* Componente ProgressBar grueso y destacado con texto siempre centrado */}
      <div className="w-full relative" style={{ height: '26px' }}>
        <ProgressBar
          value={porcentajeGlobalMedio}
          showValue={false}
          style={{ height: '26px' }}
          className="border-round w-full h-full"
        />
        <div
          className="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <span
            className="font-bold text-sm"
            style={{
              color: '#0f172a',
              textShadow: '0 0 5px #ffffff, 0 0 3px #ffffff'
            }}
          >
            {porcentajeGlobalMedio}% Cobertura Curricular
          </span>
        </div>
      </div>

      {/* Avisos contextuales sobre el balance de cobertura */}
      {ceExcedidos > 0 && (
        <div className="flex align-items-center gap-2 p-2 mt-2 border-round bg-red-50 text-red-700 text-sm border-1 border-red-200">
          <i className="pi pi-exclamation-triangle font-bold" />
          <span>
            Existen criterios cuya suma de porcentajes acumulados entre varias prácticas supera el 100%. Conviene reajustar los porcentajes.
          </span>
        </div>
      )}

      {ceExcedidos === 0 && ceIncompletos > 0 && (
        <div className="flex align-items-center gap-2 p-2 mt-2 border-round bg-blue-50 text-blue-700 text-sm border-1 border-blue-200">
          <i className="pi pi-info-circle" />
          <span>
            Un Criterio de Evaluación puede distribuirse entre varias prácticas. El objetivo formativo es que el total global acumulado alcance el 100%.
          </span>
        </div>
      )}
    </div>
  );
};

export default BarraProgresoCobertura;
