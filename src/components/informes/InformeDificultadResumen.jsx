import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { getColorNota } from '../../utils/coloresNota.js';

// Componente para el panel de resumen con tres tarjetas Card de PrimeReact: Nota Media, Tasa de Aprobados y Diagnóstico Automático
const InformeDificultadResumen = ({ estadisticas = {}, practica = null }) => {
  const {
    totalEvaluados = 0,
    media = 0,
    mediaFormateada = '-',
    aprobados = 0,
    suspensos = 0,
    tasaAprobados = 0,
    tasaAprobadosFormateada = '-',
    diagnostico = 'Sin datos',
    diagnosticoDescripcion = '',
    severidadDiagnostico = 'info'
  } = estadisticas;

  // Se obtiene la información cromática para la nota media
  const colorMedia = getColorNota(media);

  return (
    <div className="grid mb-3">
      {/* 1. Tarjeta Card: Nota Media */}
      <div className="col-12 md:col-4">
        <Card className="h-full surface-card shadow-1 border-1 surface-border">
          <div className="flex justify-content-between align-items-start mb-2">
            <div>
              <span className="text-xs font-bold text-muted block mb-1">NOTA MEDIA</span>
              <div className="flex align-items-baseline gap-2">
                <span className={`text-3xl font-bold ${totalEvaluados > 0 ? colorMedia.text : 'text-color'}`}>
                  {totalEvaluados > 0 ? mediaFormateada : '-'}
                </span>
                {totalEvaluados > 0 && (
                  <span className="text-xs text-muted font-medium">/ 100 pts</span>
                )}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: totalEvaluados > 0 ? `${colorMedia.hex}25` : 'rgba(100, 116, 139, 0.15)'
              }}
            >
              <i className={`pi pi-chart-line text-lg ${totalEvaluados > 0 ? colorMedia.text : 'text-500'}`} />
            </div>
          </div>

          <div className="flex align-items-center justify-content-between pt-2 border-top-1 surface-border">
            <span className="text-xs text-muted">
              {totalEvaluados === 1 ? '1 discente evaluado' : `${totalEvaluados} discentes evaluados`}
            </span>
            {totalEvaluados > 0 && (
              <Tag
                value={colorMedia.label}
                severity={
                  media >= 90
                    ? 'info'
                    : media >= 70
                    ? 'success'
                    : media >= 60
                    ? 'warning'
                    : media >= 50
                    ? 'warning'
                    : 'danger'
                }
                className="text-xs"
              />
            )}
          </div>
        </Card>
      </div>

      {/* 2. Tarjeta Card: Tasa de Aprobados */}
      <div className="col-12 md:col-4">
        <Card className="h-full surface-card shadow-1 border-1 surface-border">
          <div className="flex justify-content-between align-items-start mb-2">
            <div>
              <span className="text-xs font-bold text-muted block mb-1">TASA DE APROBADOS</span>
              <div className="flex align-items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    totalEvaluados === 0
                      ? 'text-color'
                      : tasaAprobados >= 75
                      ? 'text-green-500'
                      : tasaAprobados >= 50
                      ? 'text-orange-500'
                      : 'text-red-500'
                  }`}
                >
                  {totalEvaluados > 0 ? tasaAprobadosFormateada : '-'}
                </span>
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor:
                  totalEvaluados === 0
                    ? 'rgba(100, 116, 139, 0.15)'
                    : tasaAprobados >= 50
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)'
              }}
            >
              <i
                className={`pi ${
                  totalEvaluados === 0
                    ? 'pi-percentage text-500'
                    : tasaAprobados >= 50
                    ? 'pi-check-circle text-green-500'
                    : 'pi-times-circle text-red-500'
                } text-lg`}
              />
            </div>
          </div>

          <div className="flex align-items-center justify-content-between pt-2 border-top-1 surface-border">
            <span className="text-xs text-muted">
              {totalEvaluados > 0
                ? `${aprobados} aptos (>= 50) | ${suspensos} no aptos`
                : 'Sin notas registradas'}
            </span>
            {totalEvaluados > 0 && (
              <span className={`text-xs font-semibold ${tasaAprobados >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {tasaAprobados >= 50 ? 'Mayoría Aprobada' : 'Atención Requerida'}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Tarjeta Card: Diagnóstico Automático */}
      <div className="col-12 md:col-4">
        <Card className="h-full surface-card shadow-1 border-1 surface-border">
          <div className="flex justify-content-between align-items-start mb-2">
            <div>
              <span className="text-xs font-bold text-muted block mb-1">DIAGNÓSTICO AUTOMÁTICO</span>
              <div className="flex align-items-center gap-2">
                <Tag
                  value={diagnostico}
                  severity={severidadDiagnostico}
                  className="text-base font-bold px-3 py-1"
                />
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor:
                  diagnostico === 'Muy Fácil'
                    ? 'rgba(59, 130, 246, 0.15)'
                    : diagnostico === 'Adecuada'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : diagnostico === 'Difícil'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(100, 116, 139, 0.15)'
              }}
            >
              <i
                className={`pi ${
                  diagnostico === 'Muy Fácil'
                    ? 'pi-thumbs-up text-blue-500'
                    : diagnostico === 'Adecuada'
                    ? 'pi-verified text-green-500'
                    : diagnostico === 'Difícil'
                    ? 'pi-exclamation-triangle text-red-500'
                    : 'pi-info-circle text-500'
                } text-lg`}
              />
            </div>
          </div>

          <div className="pt-2 border-top-1 surface-border">
            <p className="text-xs text-muted m-0 line-height-3">
              {diagnosticoDescripcion || 'Distribución pedagógica según la media de la práctica.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InformeDificultadResumen;
