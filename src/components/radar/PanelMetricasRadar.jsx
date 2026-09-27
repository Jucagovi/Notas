import React from 'react';
import { Card } from 'primereact/card';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * PanelMetricasRadar - Subcomponente presentacional para las tarjetas de resumen del discente.
 *
 * Responsabilidad Única: Mostrar el resumen cuantitativo del rendimiento competencial
 * (media ponderada, RAs superados, RAs pendientes y porcentaje de cobertura completada).
 *
 * @param {Object} props
 * @param {Object} props.metricas - Indicadores agregados del rendimiento competencial.
 * @param {Object|null} [props.discente] - Datos del discente evaluado.
 * @param {Object|null} [props.clase] - Datos de la clase evaluada.
 * @param {Object|null} [props.modulo] - Datos del módulo evaluado (compatibilidad).
 */
export const PanelMetricasRadar = ({ metricas = {}, discente = null, clase = null, modulo = null }) => {
  const {
    promedioCompetencias = null,
    totalRAs = 0,
    rasSuperados = 0,
    rasPendientes = 0,
    porcentajeCompletos = 0
  } = metricas;

  const infoColorMedia = promedioCompetencias !== null ? getColorNota(promedioCompetencias) : null;

  return (
    <div className="grid mb-4">
      {/* Tarjeta 1: Nota Media Competencial */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
              Media Competencial
            </span>
            <div className="w-2rem h-2rem border-round bg-blue-50 text-blue-500 flex align-items-center justify-content-center">
              <i className="pi pi-chart-pie" />
            </div>
          </div>
          <div className="flex align-items-baseline gap-2">
            <span
              className="text-2xl md:text-3xl font-bold"
              style={{ color: infoColorMedia ? infoColorMedia.hex : 'inherit' }}
            >
              {promedioCompetencias !== null ? promedioCompetencias : '-'}
            </span>
            {promedioCompetencias !== null && (
              <span className="text-xs font-semibold text-color-secondary">
                / 100 ({infoColorMedia.etiqueta})
              </span>
            )}
          </div>
          <span className="text-xs text-color-secondary mt-1">
            Promedio ponderado de la clase
          </span>
        </div>
      </div>

      {/* Tarjeta 2: RAs Superados */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
              RAs Superados
            </span>
            <div className="w-2rem h-2rem border-round bg-green-50 text-green-500 flex align-items-center justify-content-center">
              <i className="pi pi-check-circle" />
            </div>
          </div>
          <div className="flex align-items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-green-600">
              {rasSuperados}
            </span>
            <span className="text-xs text-color-secondary">
              de {totalRAs} Resultados
            </span>
          </div>
          <span className="text-xs text-color-secondary mt-1">
            Calificación &ge; 50 puntos
          </span>
        </div>
      </div>

      {/* Tarjeta 3: RAs a Reforzar */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
              RAs a Reforzar
            </span>
            <div className="w-2rem h-2rem border-round bg-orange-50 text-orange-500 flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle" />
            </div>
          </div>
          <div className="flex align-items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-orange-600">
              {rasPendientes}
            </span>
            <span className="text-xs text-color-secondary">
              pendientes o &lt; 50
            </span>
          </div>
          <span className="text-xs text-color-secondary mt-1">
            Requieren atención didáctica
          </span>
        </div>
      </div>

      {/* Tarjeta 4: Completitud Curricular */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div className="flex align-items-center justify-content-between mb-2">
            <span className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
              Cobertura Evaluada
            </span>
            <div className="w-2rem h-2rem border-round bg-primary-50 text-primary flex align-items-center justify-content-center">
              <i className="pi pi-compass" />
            </div>
          </div>
          <div className="flex align-items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {porcentajeCompletos}%
            </span>
            <span className="text-xs text-color-secondary">
              completados al 100%
            </span>
          </div>
          <span className="text-xs text-color-secondary mt-1">
            Criterios de evaluación cubiertos
          </span>
        </div>
      </div>
    </div>
  );
};

export default PanelMetricasRadar;
