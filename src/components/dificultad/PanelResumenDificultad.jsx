import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { getColorNota } from '../../utils/coloresNota.js';
import useTema from '../../hooks/useTema.js';

/**
 * PanelResumenDificultad - Subcomponente presentacional para el grid superior con tres tarjetas KPI.
 *
 * Responsabilidad Única: Calcular y renderizar los tres indicadores clave especificados:
 * 1. Nota Media aritmética de las notas entregadas (escala 0-100).
 * 2. Tasa de Aprobados (porcentaje de calificaciones >= 50).
 * 3. Diagnóstico Automático cualitativo dinámico ("Muy Fácil", "Adecuada", "Difícil").
 *
 * @param {Object} props
 * @param {Array<number>} props.notas - Array numérico de calificaciones de la actividad seleccionada.
 */
export const PanelResumenDificultad = ({ notas = [] }) => {
  const { esOscuro } = useTema();

  // Cálculo de las métricas estadísticas a partir de las calificaciones entregadas
  const metricas = useMemo(() => {
    const totalEntregadas = notas.length;

    if (totalEntregadas === 0) {
      return {
        totalEntregadas: 0,
        mediaTexto: '-',
        mediaValor: null,
        tasaAprobadosTexto: '-',
        totalAprobados: 0,
        diagnosticoTexto: 'Sin datos',
        diagnosticoSeveridad: 'secondary',
        diagnosticoDescripcion: 'No se registran calificaciones en esta actividad.',
        diagnosticoIcono: 'pi pi-info-circle',
        colorMedia: esOscuro ? '#94a3b8' : '#6c757d'
      };
    }

    const sumaNotas = notas.reduce((acum, val) => acum + val, 0);
    const mediaCalculada = Number((sumaNotas / totalEntregadas).toFixed(1));
    const aprobados = notas.filter((n) => n >= 50).length;
    const porcentajeAprobados = Number(((aprobados / totalEntregadas) * 100).toFixed(1));

    // Diagnóstico pedagógico automático según la media global
    let diagnosticoTexto = 'Adecuada';
    let diagnosticoSeveridad = 'info';
    let diagnosticoDescripcion = 'Nivel equilibrado de exigencia curricular (50 - 80).';
    let diagnosticoIcono = 'pi pi-check';

    if (mediaCalculada > 80) {
      diagnosticoTexto = 'Muy Fácil';
      diagnosticoSeveridad = 'success';
      diagnosticoDescripcion = 'Rendimiento sobresaliente o exigencia baja (> 80).';
      diagnosticoIcono = 'pi pi-thumbs-up';
    } else if (mediaCalculada < 50) {
      diagnosticoTexto = 'Difícil';
      diagnosticoSeveridad = 'danger';
      diagnosticoDescripcion = 'Tasa elevada de suspensos o examen desproporcionado (< 50).';
      diagnosticoIcono = 'pi pi-exclamation-triangle';
    }

    const { hex: colorMedia } = getColorNota(mediaCalculada, esOscuro);

    return {
      totalEntregadas,
      mediaTexto: `${mediaCalculada}`,
      mediaValor: mediaCalculada,
      tasaAprobadosTexto: `${porcentajeAprobados}%`,
      totalAprobados: aprobados,
      diagnosticoTexto,
      diagnosticoSeveridad,
      diagnosticoDescripcion,
      diagnosticoIcono,
      colorMedia
    };
  }, [notas, esOscuro]);

  return (
    <div className="grid mb-4">
      {/* 1. Tarjeta: Nota Media */}
      <div className="col-12 md:col-4">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-2">
            <span className="text-color-secondary font-medium text-sm">
              Nota Media
            </span>
            <div
              className="flex align-items-center justify-content-center border-round"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: `${metricas.colorMedia}15`
              }}
            >
              <i
                className="pi pi-chart-bar text-xl"
                style={{ color: metricas.colorMedia }}
              />
            </div>
          </div>
          <div
            className="font-bold text-3xl mb-1"
            style={{ color: metricas.colorMedia }}
          >
            {metricas.mediaTexto}
            {metricas.mediaValor !== null && (
              <span className="text-color-secondary text-base font-normal ml-1">
                / 100
              </span>
            )}
          </div>
          <span className="text-xs text-color-secondary">
            {metricas.totalEntregadas > 0
              ? `Media calculada sobre ${metricas.totalEntregadas} ${
                  metricas.totalEntregadas === 1 ? 'entrega' : 'entregas'
                }`
              : 'Sin entregas registradas'}
          </span>
        </Card>
      </div>

      {/* 2. Tarjeta: Tasa de Aprobados */}
      <div className="col-12 md:col-4">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-2">
            <span className="text-color-secondary font-medium text-sm">
              Tasa de Aprobados
            </span>
            <div
              className="flex align-items-center justify-content-center bg-green-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className="pi pi-check-circle text-green-600 text-xl" />
            </div>
          </div>
          <div className="text-color font-bold text-3xl mb-1">
            {metricas.tasaAprobadosTexto}
          </div>
          <span className="text-xs text-color-secondary">
            {metricas.totalEntregadas > 0
              ? `${metricas.totalAprobados} de ${metricas.totalEntregadas} discentes con nota ≥ 50`
              : 'Sin calificaciones suficientes'}
          </span>
        </Card>
      </div>

      {/* 3. Tarjeta: Diagnóstico Automático */}
      <div className="col-12 md:col-4">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-2">
            <span className="text-color-secondary font-medium text-sm">
              Diagnóstico Automático
            </span>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <i className={`${metricas.diagnosticoIcono} text-blue-600 text-xl`} />
            </div>
          </div>
          <div className="flex align-items-center gap-2 mb-1">
            <Tag
              value={metricas.diagnosticoTexto}
              severity={metricas.diagnosticoSeveridad}
              className="text-base px-3 py-1 font-bold"
            />
          </div>
          <span className="text-xs text-color-secondary">
            {metricas.diagnosticoDescripcion}
          </span>
        </Card>
      </div>
    </div>
  );
};

export default PanelResumenDificultad;
