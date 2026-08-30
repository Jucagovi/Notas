import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { getColorNota } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Componente para el resumen ejecutivo con tarjetas de indicadores KPI del rendimiento competencial
const InformeCompetenciaResumen = ({ estadisticas, discente, modulo }) => {
  if (!estadisticas) return null;

  const {
    totalRA = 0,
    raEvaluados = 0,
    mediaGlobal = null,
    raSuperados = 0,
    raNoSuperados = 0,
    tasaSuperados = 0,
    raMasFuerte = null,
    raMasDebil = null
  } = estadisticas;

  const infoMedia = getColorNota(mediaGlobal);

  return (
    <div className="grid">
      {/* 1. Media Competencial Global */}
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full surface-card shadow-1 border-round">
          <div className="flex justify-content-between align-items-start mb-2">
            <div>
              <span className="block text-500 font-medium mb-1 text-xs uppercase">
                Media Competencial
              </span>
              <div className="text-2xl font-bold text-900">
                {mediaGlobal !== null ? `${formatNota(mediaGlobal)}` : '-'}
                {mediaGlobal !== null && <span className="text-sm text-500 font-normal"> / 100</span>}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{ width: '2.5rem', height: '2.5rem', backgroundColor: `${infoMedia.hex}20` }}
            >
              <i className="pi pi-chart-pie text-xl" style={{ color: infoMedia.hex }} />
            </div>
          </div>
          <div className="flex align-items-center gap-2 mt-2">
            {mediaGlobal !== null ? (
              <Tag
                value={infoMedia.label}
                severity={mediaGlobal >= 70 ? 'success' : mediaGlobal >= 50 ? 'warning' : 'danger'}
                className="text-xs"
              />
            ) : (
              <span className="text-xs text-500">Sin calificaciones</span>
            )}
            <span className="text-xs text-500">
              {raEvaluados} de {totalRA} RAs evaluados
            </span>
          </div>
        </Card>
      </div>

      {/* 2. Tasa de RAs Superados */}
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full surface-card shadow-1 border-round">
          <div className="flex justify-content-between align-items-start mb-2">
            <div>
              <span className="block text-500 font-medium mb-1 text-xs uppercase">
                RAs Superados
              </span>
              <div className="text-2xl font-bold text-900">
                {raSuperados} <span className="text-sm text-500 font-normal">/ {totalRA} ({tasaSuperados}%)</span>
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-check-circle text-blue-500 text-xl" />
            </div>
          </div>
          <div className="flex align-items-center gap-2 mt-2">
            <Tag
              value={raSuperados === totalRA && totalRA > 0 ? '100% Superado' : `${raNoSuperados} pendientes`}
              severity={raSuperados === totalRA && totalRA > 0 ? 'success' : raNoSuperados > 0 ? 'warning' : 'info'}
              className="text-xs"
            />
            <span className="text-xs text-500">
              Nota &ge; 50 puntos
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Competencia Más Fuerte (Fortaleza) */}
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full surface-card shadow-1 border-round">
          <div className="flex justify-content-between align-items-start mb-2">
            <div className="overflow-hidden">
              <span className="block text-500 font-medium mb-1 text-xs uppercase">
                Mayor Fortaleza
              </span>
              <div className="text-lg font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                {raMasFuerte ? `${raMasFuerte.codigo}` : 'Sin datos'}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-green-100 border-round flex-shrink-0"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-star-fill text-green-500 text-xl" />
            </div>
          </div>
          <div className="flex align-items-center gap-2 mt-2">
            {raMasFuerte && raMasFuerte.nota !== null ? (
              <>
                <Tag
                  value={`${formatNota(raMasFuerte.nota)} pts`}
                  severity="success"
                  className="text-xs font-bold"
                />
                <span className="text-xs text-500 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                  {raMasFuerte.nombre || 'Resultado destacado'}
                </span>
              </>
            ) : (
              <span className="text-xs text-500">No hay datos suficientes</span>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Competencia a Reforzar (Área de Mejora) */}
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full surface-card shadow-1 border-round">
          <div className="flex justify-content-between align-items-start mb-2">
            <div className="overflow-hidden">
              <span className="block text-500 font-medium mb-1 text-xs uppercase">
                Área de Refuerzo
              </span>
              <div className="text-lg font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                {raMasDebil ? `${raMasDebil.codigo}` : 'Sin datos'}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round flex-shrink-0"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-exclamation-triangle text-orange-500 text-xl" />
            </div>
          </div>
          <div className="flex align-items-center gap-2 mt-2">
            {raMasDebil && raMasDebil.nota !== null ? (
              <>
                <Tag
                  value={`${formatNota(raMasDebil.nota)} pts`}
                  severity={raMasDebil.nota < 50 ? 'danger' : 'warning'}
                  className="text-xs font-bold"
                />
                <span className="text-xs text-500 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                  {raMasDebil.nombre || 'Área con menor puntuación'}
                </span>
              </>
            ) : (
              <span className="text-xs text-500">No hay datos suficientes</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InformeCompetenciaResumen;
