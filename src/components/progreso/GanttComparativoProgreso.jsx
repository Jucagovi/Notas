import React, { useMemo } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearFechaEspanol, parsearFechaISO } from '../../utils/fechas.js';

// Meses del curso escolar estándar en España de septiembre a junio.
const MESES_ESCOLAR = [
  { nombre: 'Sep', mes: 8 },
  { nombre: 'Oct', mes: 9 },
  { nombre: 'Nov', mes: 10 },
  { nombre: 'Dic', mes: 11 },
  { nombre: 'Ene', mes: 0 },
  { nombre: 'Feb', mes: 1 },
  { nombre: 'Mar', mes: 2 },
  { nombre: 'Abr', mes: 3 },
  { nombre: 'May', mes: 4 },
  { nombre: 'Jun', mes: 5 }
];

/**
 * GanttComparativoProgreso - Visualizador tipo diagrama de Gantt comparativo.
 *
 * Responsabilidad Única: Renderizar una línea de tiempo horizontal con solapamiento visual
 * directo entre las barras previstas (gris/transparente) y las ejecutadas reales (color sólido
 * verde si a tiempo, rojo si hubo retraso) para cada Unidad de Trabajo.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades con cálculo de desviación e hitos.
 * @param {number} [props.anioInicio=2026] - Año escolar de inicio de la clase.
 */
export const GanttComparativoProgreso = ({ unidades = [], anioInicio = 2026 }) => {
  // Determinación de los límites temporales generales del cronograma escolar.
  const { inicioMs, totalMs } = useMemo(() => {
    let minMs = new Date(anioInicio, 8, 1).getTime(); // 1 de Septiembre
    let maxMs = new Date(anioInicio + 1, 5, 30, 23, 59, 59).getTime(); // 30 de Junio

    // Si existen fechas reales o previstas que excedan el marco por defecto, se amplía el rango.
    (unidades || []).forEach((u) => {
      [u.fecha_ini_prevista, u.fecha_ini_real].forEach((f) => {
        if (f) {
          const d = parsearFechaISO(f);
          if (d && !isNaN(d.getTime())) minMs = Math.min(minMs, d.getTime());
        }
      });
      [u.fecha_fin_prevista, u.fecha_fin_real].forEach((f) => {
        if (f) {
          const d = parsearFechaISO(f);
          if (d && !isNaN(d.getTime())) maxMs = Math.max(maxMs, d.getTime());
        }
      });
    });

    const diff = Math.max(1, maxMs - minMs);
    return { inicioMs: minMs, totalMs: diff };
  }, [unidades, anioInicio]);

  // Posicionamiento porcentual (0 - 100%) de las marcas mensuales superiores.
  const columnasMeses = useMemo(() => {
    return MESES_ESCOLAR.map((m, idx) => {
      const anio = idx < 4 ? anioInicio : anioInicio + 1;
      const primerDia = new Date(anio, m.mes, 1);
      const ultimoDia = new Date(anio, m.mes + 1, 0, 23, 59, 59);

      const left = Math.max(0, Math.min(100, ((primerDia.getTime() - inicioMs) / totalMs) * 100));
      const right = Math.max(0, Math.min(100, ((ultimoDia.getTime() - inicioMs) / totalMs) * 100));
      const width = Math.max(0, right - left);

      return {
        nombre: `${m.nombre} ${String(anio).slice(-2)}`,
        leftPct: left,
        widthPct: width
      };
    }).filter((c) => c.widthPct > 0);
  }, [anioInicio, inicioMs, totalMs]);

  // Cálculo de las coordenadas de las barras de solapamiento para cada unidad.
  const filasGantt = useMemo(() => {
    return unidades.map((u) => {
      // 1. Barra de marco previsto (transparente/gris con borde discontinuo)
      let barraPrevista = null;
      if (u.fecha_ini_prevista && u.fecha_fin_prevista) {
        const dIni = parsearFechaISO(u.fecha_ini_prevista);
        const dFin = parsearFechaISO(u.fecha_fin_prevista);
        if (dIni && dFin) {
          const startMs = dIni.getTime();
          const endMs = new Date(dFin.getFullYear(), dFin.getMonth(), dFin.getDate(), 23, 59, 59).getTime();
          const left = Math.max(0, Math.min(100, ((startMs - inicioMs) / totalMs) * 100));
          const right = Math.max(0, Math.min(100, ((endMs - inicioMs) / totalMs) * 100));
          barraPrevista = {
            left: `${left.toFixed(2)}%`,
            width: `${Math.max(1.5, right - left).toFixed(2)}%`
          };
        }
      }

      // 2. Barra de ejecución real (color sólido verde o rojo)
      let barraReal = null;
      const fIniReal = u.fecha_ini_real || (u.estado === 'En Curso' ? u.fecha_ini_prevista : null);
      const fFinReal = u.fecha_fin_real || (u.estado === 'En Curso' ? new Date() : null);

      if (fIniReal && fFinReal) {
        const dIni = fIniReal instanceof Date ? fIniReal : parsearFechaISO(fIniReal);
        const dFin = fFinReal instanceof Date ? fFinReal : parsearFechaISO(fFinReal);
        if (dIni && dFin) {
          const startMs = dIni.getTime();
          const endMs = new Date(dFin.getFullYear(), dFin.getMonth(), dFin.getDate(), 23, 59, 59).getTime();
          const left = Math.max(0, Math.min(100, ((startMs - inicioMs) / totalMs) * 100));
          const right = Math.max(0, Math.min(100, ((endMs - inicioMs) / totalMs) * 100));
          barraReal = {
            left: `${left.toFixed(2)}%`,
            width: `${Math.max(1.5, right - left).toFixed(2)}%`,
            color: u.colorReal
          };
        }
      }

      return {
        ...u,
        barraPrevista,
        barraReal
      };
    });
  }, [unidades, inicioMs, totalMs]);

  if (!unidades || unidades.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin datos para el diagrama comparativo"
        descripcion="Selecciona un curso y módulo con temporizaciones configuradas para visualizar el cronograma."
        icono="pi pi-chart-bar"
        className="my-3 p-4"
      />
    );
  }

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1">
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cabecera del Gantt comparativo */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
        <div>
          <h3 className="text-lg font-bold text-900 m-0">
            Cronograma Comparativo (Gantt)
          </h3>
          <span className="text-xs text-color-secondary">
            Solapamiento visual directo: marco previsto (gris/transparente) frente a ejecución real (color sólido)
          </span>
        </div>

        {/* Leyenda cromática de barras */}
        <div className="flex align-items-center gap-3 text-xs text-color-secondary flex-wrap">
          <span className="flex align-items-center gap-1">
            <span
              className="w-1rem h-1rem border-round border-1 border-dashed inline-block"
              style={{ backgroundColor: 'rgba(156, 163, 175, 0.4)', borderColor: '#6b7280' }}
            />
            <span>Previsto</span>
          </span>
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-0.5rem border-round bg-green-500 inline-block" />
            <span>Real (A tiempo)</span>
          </span>
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-0.5rem border-round bg-red-500 inline-block" />
            <span>Real (Con retraso)</span>
          </span>
        </div>
      </div>

      {/* Contenedor del gráfico con scroll horizontal seguro */}
      <div className="overflow-x-auto w-full">
        <div style={{ minWidth: '780px' }}>
          {/* Fila superior con meses lectivos */}
          <div className="flex border-bottom-1 surface-border pb-1 mb-2 text-xs font-semibold text-color-secondary">
            <div style={{ width: '240px' }} className="flex-shrink-0 pr-2">
              Unidad de Trabajo / Desviación
            </div>
            <div className="flex-1 relative" style={{ height: '22px' }}>
              {columnasMeses.map((col, idx) => (
                <div
                  key={`col-mes-${idx}`}
                  className="absolute text-center border-left-1 surface-border overflow-hidden text-overflow-ellipsis white-space-nowrap px-1"
                  style={{ left: `${col.leftPct}%`, width: `${col.widthPct}%`, fontSize: '11px' }}
                >
                  {col.nombre}
                </div>
              ))}
            </div>
          </div>

          {/* Filas con las barras comparativas */}
          <div className="flex flex-column gap-2">
            {filasGantt.map((item) => {
              const tooltipTexto =
                `${item.numUT}: ${item.nombreUT}\n` +
                (item.fecha_ini_prevista
                  ? `• Previsto: ${formatearFechaEspanol(item.fecha_ini_prevista)} — ${formatearFechaEspanol(item.fecha_fin_prevista)}\n`
                  : '• Sin fechas previstas\n') +
                (item.fecha_ini_real
                  ? `• Real: ${formatearFechaEspanol(item.fecha_ini_real)} — ${formatearFechaEspanol(item.fecha_fin_real)}\n`
                  : item.estado === 'En Curso'
                  ? '• Real: En curso actualmente\n'
                  : '') +
                `• Desviación: ${item.textoDesviacion}`;

              return (
                <div
                  key={`fila-gantt-${item.id_temporizacion || item.id_ut}`}
                  className="flex align-items-center py-1 hover:surface-50 border-round transition-colors transition-duration-150"
                  style={{ minHeight: '38px' }}
                >
                  {/* Columna identificativa izquierda */}
                  <div
                    style={{ width: '240px' }}
                    className="flex-shrink-0 pr-2 flex align-items-center justify-content-between overflow-hidden"
                  >
                    <span
                      className="font-bold text-xs text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                      title={`${item.numUT}: ${item.nombreUT}`}
                    >
                      {item.numUT}: {item.nombreUT}
                    </span>
                    <Badge
                      value={item.textoDesviacion}
                      severity={item.severidad}
                      className="text-xs ml-1 flex-shrink-0"
                    />
                  </div>

                  {/* Pista temporal con solapamiento visual */}
                  <div
                    className="flex-1 relative h-full flex align-items-center"
                    style={{ height: '32px' }}
                    data-pr-tooltip={tooltipTexto}
                  >
                    {/* Líneas guía de fondo */}
                    {columnasMeses.map((col, idx) => (
                      <div
                        key={`guia-${idx}`}
                        className="absolute h-full border-left-1 border-dashed surface-border pointer-events-none"
                        style={{ left: `${col.leftPct}%` }}
                      />
                    ))}

                    {/* Barra prevista: fondo gris semitransparente con borde discontinuo */}
                    {item.barraPrevista ? (
                      <div
                        className="absolute border-1 border-dashed border-round shadow-1 cursor-pointer flex align-items-center px-1"
                        style={{
                          left: item.barraPrevista.left,
                          width: item.barraPrevista.width,
                          height: '24px',
                          backgroundColor: 'rgba(156, 163, 175, 0.35)',
                          borderColor: '#6b7280',
                          zIndex: 1
                        }}
                      >
                        <span className="text-xs text-700 font-semibold white-space-nowrap overflow-hidden text-overflow-ellipsis">
                          {item.numUT} Previsto
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-400 italic">Sin fechas previstas</span>
                    )}

                    {/* Barra ejecutada real: color sólido que solapa sobre la prevista */}
                    {item.barraReal && (
                      <div
                        className="absolute border-round shadow-2"
                        style={{
                          left: item.barraReal.left,
                          width: item.barraReal.width,
                          height: '10px',
                          bottom: '3px',
                          backgroundColor: item.barraReal.color,
                          zIndex: 2
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttComparativoProgreso;
