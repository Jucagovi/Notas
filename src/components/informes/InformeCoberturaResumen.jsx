import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Message } from 'primereact/message';

// Componente de tarjetas estadísticas KPI y estado de salud curricular para el informe de cobertura
const InformeCoberturaResumen = ({ estadisticas = {}, modulo = null }) => {
  const {
    totalRA = 0,
    totalCE = 0,
    ceCompletos = 0,
    ceIncompletos = 0,
    ceSinCubrir = 0,
    ceExcedidos = 0,
    porcentajeGlobal = 0,
    porcentajeMedio = 0,
    estadoGeneral = 'vacio'
  } = estadisticas;

  if (totalCE === 0) return null;

  return (
    <div className="flex flex-column gap-3 mb-4">
      {/* 1. Tarjetas KPI de cobertura */}
      <div className="grid">
        {/* Total de Criterios y Resultados */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">TOTAL CRITERIOS</span>
                <span className="text-2xl font-bold text-color">{totalCE}</span>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              >
                <i className="pi pi-list-check text-blue-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-muted">
              En {totalRA} {totalRA === 1 ? 'Resultado' : 'Resultados'} (RA)
            </span>
          </div>
        </div>

        {/* Criterios 100% Cubiertos */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">100% CUBIERTOS</span>
                <span className="text-2xl font-bold text-green-500">{ceCompletos}</span>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
              >
                <i className="pi pi-check-circle text-green-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-green-600 font-semibold">
              {totalCE > 0 ? Math.round((ceCompletos / totalCE) * 100) : 0}% del currículo
            </span>
          </div>
        </div>

        {/* Criterios Incompletos (< 100%) */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">INCOMPLETOS</span>
                <span className={`text-2xl font-bold ${ceIncompletos > 0 ? 'text-red-500' : 'text-color'}`}>
                  {ceIncompletos}
                </span>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <i className="pi pi-exclamation-triangle text-red-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-muted">Suman entre 1% y 99%</span>
          </div>
        </div>

        {/* Criterios Sin Cubrir (0%) */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">SIN CUBRIR</span>
                <span className={`text-2xl font-bold ${ceSinCubrir > 0 ? 'text-500' : 'text-color'}`}>
                  {ceSinCubrir}
                </span>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(148, 163, 184, 0.15)' }}
              >
                <i className="pi pi-minus-circle text-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-muted">Sin prácticas (0%)</span>
          </div>
        </div>

        {/* Criterios con Sobrecobertura (> 100%) */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">SOBRECOBERTURA</span>
                <span className={`text-2xl font-bold ${ceExcedidos > 0 ? 'text-red-500' : 'text-color'}`}>
                  {ceExcedidos}
                </span>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <i className="pi pi-times-circle text-red-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-muted">Exceso de ponderación</span>
          </div>
        </div>

        {/* Porcentaje Medio de Cobertura */}
        <div className="col-12 sm:col-6 lg:col-2 md:col-4">
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
            <div className="flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-xs font-bold text-muted block mb-1">MEDIA COBERTURA</span>
                <div className="flex align-items-baseline gap-1">
                  <span className={`text-2xl font-bold ${porcentajeMedio === 100 ? 'text-green-500' : 'text-color'}`}>
                    {porcentajeMedio}%
                  </span>
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
              >
                <i className="pi pi-percentage text-purple-500 font-bold text-base" />
              </div>
            </div>
            <span className="text-xs text-muted">Promedio por criterio</span>
          </div>
        </div>
      </div>

      {/* 2. Barra de progreso general de salud curricular y mensaje de validación */}
      <div className="surface-card p-4 border-round shadow-1 flex flex-column gap-2">
        <div className="flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-2">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-bar text-primary" />
            <span className="font-bold text-sm text-color">
              Nivel de Cumplimiento Curricular de {modulo?.siglas || modulo?.nombre || 'Módulo'}
            </span>
          </div>
          <span className="text-xs font-bold text-muted">
            {ceCompletos} de {totalCE} criterios completados ({porcentajeGlobal}%)
          </span>
        </div>

        <ProgressBar
          value={porcentajeGlobal}
          color={porcentajeGlobal === 100 ? '#22c55e' : porcentajeGlobal >= 70 ? '#3b82f6' : '#ef4444'}
          style={{ height: '8px' }}
          showValue={false}
        />

        {/* Mensaje de auditoría condicional */}
        {estadoGeneral === 'valido' ? (
          <div className="mt-1">
            <Message
              severity="success"
              text="Auditoría superada con éxito: todos los criterios de evaluación tienen asignadas prácticas que suman exactamente el 100%."
              className="w-full text-xs"
            />
          </div>
        ) : (
          <div className="mt-1">
            <Message
              severity={ceExcedidos > 0 || ceIncompletos > 0 ? 'error' : 'warn'}
              text={`Se han detectado desviaciones en el diseño curricular: ${
                ceIncompletos > 0 ? `${ceIncompletos} criterios incompletos (<100%), ` : ''
              }${ceSinCubrir > 0 ? `${ceSinCubrir} sin cubrir (0%), ` : ''}${
                ceExcedidos > 0 ? `${ceExcedidos} con sobrecobertura (>100%).` : ''
              } Es necesario ajustar las asignaciones en la sección de Asignación CE.`}
              className="w-full text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InformeCoberturaResumen;
