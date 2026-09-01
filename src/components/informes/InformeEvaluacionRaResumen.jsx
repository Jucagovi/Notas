import React from 'react';
import { Card } from 'primereact/card';
import { getColorNota } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Componente para mostrar las tarjetas resumen de indicadores clave (KPI) del acta de evaluación por RA
const InformeEvaluacionRaResumen = ({ estadisticas = null, modulo = null, soloCompletos = false }) => {
  if (!estadisticas) return null;

  const {
    totalDiscentes = 0,
    totalRA = 0,
    mediaGlobal = null,
    tasaAprobadosGlobal = 0,
    totalAprobadosGlobal = 0
  } = estadisticas;

  // Se calcula el color visual para la nota media global
  const infoColorMedia = getColorNota(mediaGlobal);

  return (
    <div className="grid mb-4">
      {/* 1. Tarjeta: Total Discentes Matriculados */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="surface-card shadow-1 border-round h-full border-1 surface-border">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="block text-500 font-medium text-xs mb-1 uppercase">
                Discentes Matriculados
              </span>
              <div className="text-900 font-bold text-2xl">
                {totalDiscentes}
              </div>
              <span className="text-muted text-xs">
                {modulo?.siglas ? `Módulo ${modulo.siglas}` : 'En este módulo'}
              </span>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{ width: '2.8rem', height: '2.8rem', backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
            >
              <i className="pi pi-users text-blue-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Tarjeta: Total Resultados de Aprendizaje */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="surface-card shadow-1 border-round h-full border-1 surface-border">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="block text-500 font-medium text-xs mb-1 uppercase">
                Resultados Aprendizaje
              </span>
              <div className="text-900 font-bold text-2xl">
                {totalRA}
              </div>
              <span className="text-muted text-xs">
                RA configurados en currículo
              </span>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{ width: '2.8rem', height: '2.8rem', backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
            >
              <i className="pi pi-sliders-h text-purple-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Tarjeta: Calificación Media Global del Módulo */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="surface-card shadow-1 border-round h-full border-1 surface-border">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="block text-500 font-medium text-xs mb-1 uppercase">
                {soloCompletos ? 'Media Evaluación Continua' : 'Nota Media Final'}
              </span>
              <div className="text-900 font-bold text-2xl" style={{ color: infoColorMedia.hex }}>
                {mediaGlobal !== null ? `${formatNota(mediaGlobal)}` : 'Sin notas'}
              </div>
              <span className="text-muted text-xs">
                {infoColorMedia.label}
              </span>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{ width: '2.8rem', height: '2.8rem', backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
            >
              <i className="pi pi-chart-line text-green-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Tarjeta: Tasa Global de Aprobados */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="surface-card shadow-1 border-round h-full border-1 surface-border">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="block text-500 font-medium text-xs mb-1 uppercase">
                Tasa de Aprobados
              </span>
              <div className="text-900 font-bold text-2xl" style={{ color: tasaAprobadosGlobal >= 50 ? '#22c55e' : '#ef4444' }}>
                {tasaAprobadosGlobal}%
              </div>
              <span className="text-muted text-xs">
                {totalAprobadosGlobal} de {totalDiscentes} discentes (&ge; 50)
              </span>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: tasaAprobadosGlobal >= 50 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
              }}
            >
              <i
                className={`pi ${tasaAprobadosGlobal >= 50 ? 'pi-check-circle text-green-500' : 'pi-exclamation-triangle text-red-500'} text-xl`}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InformeEvaluacionRaResumen;
