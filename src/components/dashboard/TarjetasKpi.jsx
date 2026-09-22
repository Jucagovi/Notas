import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { getColorNota } from '../../utils/coloresNota.js';

// Componente presentacional para renderizar las cuatro tarjetas de métricas e indicadores clave (KPIs).
const TarjetasKpi = ({
  totalDiscentes = 0,
  totalModulos = 0,
  notaMediaGlobal = null,
  tasaAprobados = null,
  totalAprobados = 0,
  totalSuspensos = 0
}) => {
  const tieneNotaMedia = notaMediaGlobal !== null && notaMediaGlobal !== undefined;
  const infoColorNota = tieneNotaMedia ? getColorNota(notaMediaGlobal) : null;
  const tieneTasa = tasaAprobados !== null && tasaAprobados !== undefined;

  return (
    <div className="grid">
      {/* Tarjeta 1: Total de discentes */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="h-full shadow-1 border-round surface-card">
          <div className="flex justify-content-between align-items-start">
            <div>
              <span className="block font-semibold mb-2 text-sm text-muted">
                TOTAL DISCENTES
              </span>
              <div className="font-bold text-3xl text-color">{totalDiscentes}</div>
              <div className="text-xs text-muted mt-2">
                <span className="text-green-500 font-bold">100% </span>
                <span>matriculados y activos</span>
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: 'var(--primary-light, rgba(59, 130, 246, 0.15))'
              }}
            >
              <i className="pi pi-users text-xl text-primary font-bold"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Tarjeta 2: Módulos activos */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="h-full shadow-1 border-round surface-card">
          <div className="flex justify-content-between align-items-start">
            <div>
              <span className="block font-semibold mb-2 text-sm text-muted">
                MÓDULOS ACTIVOS
              </span>
              <div className="font-bold text-3xl text-color">{totalModulos}</div>
              <div className="text-xs text-muted mt-2">
                <span>Módulos profesionales registrados</span>
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: 'rgba(168, 85, 247, 0.15)'
              }}
            >
              <i className="pi pi-book text-xl text-purple-500 font-bold"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Tarjeta 3: Nota media global */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="h-full shadow-1 border-round surface-card">
          <div className="flex justify-content-between align-items-start">
            <div>
              <span className="block font-semibold mb-2 text-sm text-muted">
                NOTA MEDIA GLOBAL
              </span>
              <div className="font-bold text-3xl text-color">
                {tieneNotaMedia ? notaMediaGlobal : '—'}
              </div>
              <div className="mt-2">
                {tieneNotaMedia ? (
                  <Tag
                    value={infoColorNota.etiqueta}
                    style={{
                      backgroundColor: infoColorNota.hex,
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '0.25rem 0.55rem'
                    }}
                  />
                ) : (
                  <Tag
                    value="Sin calificaciones"
                    icon="pi pi-info-circle"
                    style={{
                      backgroundColor: '#6c757d',
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '0.25rem 0.55rem'
                    }}
                  />
                )}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: 'rgba(59, 130, 246, 0.15)'
              }}
            >
              <i className="pi pi-chart-line text-xl text-blue-500 font-bold"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Tarjeta 4: Tasa de aprobados */}
      <div className="col-12 sm:col-6 lg:col-3">
        <Card className="h-full shadow-1 border-round surface-card">
          <div className="flex justify-content-between align-items-start">
            <div className="w-full mr-2">
              <span className="block font-semibold mb-2 text-sm text-muted">
                TASA DE APROBADOS
              </span>
              <div className="font-bold text-3xl text-color mb-2">
                {tieneTasa ? `${tasaAprobados}%` : '—'}
              </div>
              <ProgressBar
                value={tieneTasa ? tasaAprobados : 0}
                showValue={false}
                style={{ height: '7px' }}
              />
              <div className="text-xs text-muted mt-2">
                {tieneTasa ? (
                  <span>
                    <strong className="text-green-500">{totalAprobados}</strong> aprobados vs{' '}
                    <strong className="text-red-500">{totalSuspensos}</strong> suspensos
                  </span>
                ) : (
                  <span className="text-orange-500 font-medium">Sin datos evaluativos</span>
                )}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round flex-shrink-0"
              style={{
                width: '2.8rem',
                height: '2.8rem',
                backgroundColor: 'rgba(34, 197, 94, 0.15)'
              }}
            >
              <i className="pi pi-check text-xl text-green-500 font-bold"></i>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TarjetasKpi;
