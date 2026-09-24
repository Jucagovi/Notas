import React, { useMemo } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { formatearFechaEspanol, parsearFechaISO } from '../../utils/fechas.js';
import { formatearNumeroUT } from '../../utils/formatoUT.js';
import { PALETA_COLORES_UT } from './gestorPropuestaFechas.js';

// Meses que componen el curso escolar regular de septiembre a agosto.
const MESES_CURSO = [
  { nombre: 'Sep', mesJS: 8 },
  { nombre: 'Oct', mesJS: 9 },
  { nombre: 'Nov', mesJS: 10 },
  { nombre: 'Dic', mesJS: 11 },
  { nombre: 'Ene', mesJS: 0 },
  { nombre: 'Feb', mesJS: 1 },
  { nombre: 'Mar', mesJS: 2 },
  { nombre: 'Abr', mesJS: 3 },
  { nombre: 'May', mesJS: 4 },
  { nombre: 'Jun', mesJS: 5 },
  { nombre: 'Jul', mesJS: 6 },
  { nombre: 'Ago', mesJS: 7 }
];

/**
 * DiagramaGanttTemporizacion - Visualizador de cronograma tipo Gantt para el curso escolar.
 *
 * Responsabilidad Única: Renderizar una línea temporal gráfica comparativa que posicione las
 * Unidades de Trabajo según sus fechas previstas y reales a lo largo de los meses lectivos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Lista de unidades temporizadas con fechas e hitos.
 * @param {Date|null} [props.fechaInicioPeriodo] - Fecha oficial de inicio de curso.
 * @param {Date|null} [props.fechaFinPeriodo] - Fecha oficial de finalización de curso.
 * @param {number} [props.anioInicio=2026] - Año inicial de la clase.
 */
export const DiagramaGanttTemporizacion = ({
  temporizaciones = [],
  fechaInicioPeriodo = null,
  fechaFinPeriodo = null,
  anioInicio = 2026
}) => {
  // Determinación de los límites temporales del cronograma (por defecto: 1 de septiembre a 31 de julio/agosto).
  const { inicioMs, totalMs } = useMemo(() => {
    const defaultInicio = new Date(anioInicio, 8, 1); // 1 de Septiembre
    const defaultFin = new Date(anioInicio + 1, 6, 31); // 31 de Julio

    const dIni = fechaInicioPeriodo && !isNaN(fechaInicioPeriodo.getTime())
      ? new Date(Math.min(fechaInicioPeriodo.getTime(), defaultInicio.getTime()))
      : defaultInicio;

    const dFin = fechaFinPeriodo && !isNaN(fechaFinPeriodo.getTime())
      ? new Date(Math.max(fechaFinPeriodo.getTime(), defaultFin.getTime()))
      : defaultFin;

    const iMs = dIni.getTime();
    const tMs = Math.max(1, dFin.getTime() - iMs);

    return { inicioMs: iMs, totalMs: tMs };
  }, [fechaInicioPeriodo, fechaFinPeriodo, anioInicio]);

  // Cálculo de las posiciones relativas (en porcentaje 0 - 100%) para las marcas de los meses.
  const columnasMeses = useMemo(() => {
    return MESES_CURSO.map((m, idx) => {
      const anio = idx < 4 ? anioInicio : anioInicio + 1;
      const primerDiaMes = new Date(anio, m.mesJS, 1);
      const ultimoDiaMes = new Date(anio, m.mesJS + 1, 0, 23, 59, 59);

      const leftPct = Math.max(0, Math.min(100, ((primerDiaMes.getTime() - inicioMs) / totalMs) * 100));
      const rightPct = Math.max(0, Math.min(100, ((ultimoDiaMes.getTime() - inicioMs) / totalMs) * 100));
      const widthPct = Math.max(0, rightPct - leftPct);

      return {
        nombre: `${m.nombre} ${String(anio).slice(-2)}`,
        leftPct,
        widthPct
      };
    }).filter((m) => m.widthPct > 0);
  }, [anioInicio, inicioMs, totalMs]);

  // Cálculo de barras de Gantt para cada unidad temporizada.
  const barrasUnidades = useMemo(() => {
    return temporizaciones.map((temp, index) => {
      const ut = temp.unidad_trabajo;
      const numUT = formatearNumeroUT(ut?.numero || temp.orden);
      const color = PALETA_COLORES_UT[index % PALETA_COLORES_UT.length];

      // 1. Barra de fechas previstas
      let barraPrevista = null;
      if (temp.fecha_ini_prevista && temp.fecha_fin_prevista) {
        const dIni = parsearFechaISO(temp.fecha_ini_prevista);
        const dFin = parsearFechaISO(temp.fecha_fin_prevista);

        if (dIni && dFin && !isNaN(dIni.getTime()) && !isNaN(dFin.getTime())) {
          const startMs = dIni.getTime();
          const endMs = new Date(dFin.getFullYear(), dFin.getMonth(), dFin.getDate(), 23, 59, 59).getTime();

          const left = Math.max(0, Math.min(100, ((startMs - inicioMs) / totalMs) * 100));
          const right = Math.max(0, Math.min(100, ((endMs - inicioMs) / totalMs) * 100));
          const width = Math.max(1.5, right - left);

          barraPrevista = {
            left: `${left.toFixed(2)}%`,
            width: `${width.toFixed(2)}%`,
            fechaIni: temp.fecha_ini_prevista,
            fechaFin: temp.fecha_fin_prevista
          };
        }
      }

      // 2. Barra de fechas reales ejecutadas
      let barraReal = null;
      if (temp.fecha_ini_real && temp.fecha_fin_real) {
        const dIniReal = parsearFechaISO(temp.fecha_ini_real);
        const dFinReal = parsearFechaISO(temp.fecha_fin_real);

        if (dIniReal && dFinReal && !isNaN(dIniReal.getTime()) && !isNaN(dFinReal.getTime())) {
          const startMs = dIniReal.getTime();
          const endMs = new Date(dFinReal.getFullYear(), dFinReal.getMonth(), dFinReal.getDate(), 23, 59, 59).getTime();

          const left = Math.max(0, Math.min(100, ((startMs - inicioMs) / totalMs) * 100));
          const right = Math.max(0, Math.min(100, ((endMs - inicioMs) / totalMs) * 100));
          const width = Math.max(1.5, right - left);

          barraReal = {
            left: `${left.toFixed(2)}%`,
            width: `${width.toFixed(2)}%`,
            fechaIni: temp.fecha_ini_real,
            fechaFin: temp.fecha_fin_real
          };
        }
      }

      return {
        id: temp.id_temporizacion,
        numUT,
        nombre: ut?.nombre || 'Unidad de Trabajo',
        estado: temp.estado || 'Pendiente',
        color,
        barraPrevista,
        barraReal
      };
    });
  }, [temporizaciones, inicioMs, totalMs]);

  if (temporizaciones.length === 0) {
    return null;
  }

  return (
    <div className="surface-card border-round border-1 surface-border shadow-1 p-3 mb-4">
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cabecera del Diagrama de Gantt */}
      <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border flex-wrap gap-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-bar text-primary text-xl" />
          <div>
            <h3 className="m-0 text-base font-bold text-900">
              Cronograma de Impartición (Diagrama de Gantt)
            </h3>
            <span className="text-xs text-color-secondary">
              Distribución temporal del módulo a lo largo del curso escolar
            </span>
          </div>
        </div>

        {/* Leyenda explicativa de barras */}
        <div className="flex align-items-center gap-3 text-xs text-color-secondary flex-wrap">
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round bg-primary inline-block" />
            <span>Fechas Previstas</span>
          </span>
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-0.5rem border-round surface-900 inline-block" />
            <span>Ejecución Real</span>
          </span>
        </div>
      </div>

      {/* Contenedor del cronograma con desplazamiento horizontal seguro */}
      <div className="overflow-x-auto w-full">
        <div style={{ minWidth: '780px' }}>
          {/* Fila cabecera con los meses del curso */}
          <div className="flex border-bottom-1 surface-border pb-1 mb-2 text-xs font-semibold text-color-secondary">
            {/* Columna izquierda de nombres de unidad */}
            <div style={{ width: '220px' }} className="flex-shrink-0 pr-2">
              Unidad de Trabajo
            </div>

            {/* Espacio del eje temporal con nombres de mes */}
            <div className="flex-1 relative" style={{ height: '22px' }}>
              {columnasMeses.map((col, idx) => (
                <div
                  key={`mes-header-${idx}`}
                  className="absolute text-center border-left-1 surface-border overflow-hidden text-overflow-ellipsis white-space-nowrap px-1"
                  style={{
                    left: `${col.leftPct}%`,
                    width: `${col.widthPct}%`,
                    fontSize: '11px'
                  }}
                >
                  {col.nombre}
                </div>
              ))}
            </div>
          </div>

          {/* Filas de unidades del cronograma */}
          <div className="flex flex-column gap-2">
            {barrasUnidades.map((item) => {
              const tooltipTexto = `${item.numUT}: ${item.nombre}\n` +
                (item.barraPrevista
                  ? `• Previsto: ${formatearFechaEspanol(item.barraPrevista.fechaIni)} - ${formatearFechaEspanol(item.barraPrevista.fechaFin)}\n`
                  : '• Sin fechas previstas\n') +
                (item.barraReal
                  ? `• Real: ${formatearFechaEspanol(item.barraReal.fechaIni)} - ${formatearFechaEspanol(item.barraReal.fechaFin)}\n`
                  : '') +
                `• Estado: ${item.estado}`;

              return (
                <div
                  key={`gantt-row-${item.id}`}
                  className="flex align-items-center py-1 hover:surface-50 border-round transition-colors transition-duration-150"
                  style={{ minHeight: '36px' }}
                >
                  {/* Columna fija izquierda con UT y estado */}
                  <div
                    style={{ width: '220px' }}
                    className="flex-shrink-0 pr-2 flex align-items-center justify-content-between overflow-hidden"
                  >
                    <span
                      className="font-semibold text-xs text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                      title={`${item.numUT}: ${item.nombre}`}
                    >
                      {item.numUT}: {item.nombre}
                    </span>
                    <Tag
                      value={item.estado}
                      severity={
                        item.estado === 'Completada'
                          ? 'success'
                          : item.estado === 'En Curso'
                          ? 'info'
                          : 'warning'
                      }
                      className="text-xs py-0 px-1 ml-1 flex-shrink-0"
                    />
                  </div>

                  {/* Espacio del eje de tiempo donde se dibuja la barra */}
                  <div className="flex-1 relative h-full flex align-items-center" style={{ height: '30px' }}>
                    {/* Líneas guía verticales de fondo para cada mes */}
                    {columnasMeses.map((col, idx) => (
                      <div
                        key={`linea-guia-${idx}`}
                        className="absolute h-full border-left-1 border-dashed surface-border pointer-events-none"
                        style={{ left: `${col.leftPct}%` }}
                      />
                    ))}

                    {/* Barra de temporización prevista */}
                    {item.barraPrevista ? (
                      <div
                        className="absolute h-1.5rem border-round flex align-items-center px-2 cursor-pointer shadow-1 transition-all transition-duration-150 hover:shadow-2"
                        style={{
                          left: item.barraPrevista.left,
                          width: item.barraPrevista.width,
                          backgroundColor: item.color.fondo,
                          color: item.color.texto,
                          zIndex: 2
                        }}
                        data-pr-tooltip={tooltipTexto}
                      >
                        <span className="text-xs font-bold white-space-nowrap overflow-hidden text-overflow-ellipsis">
                          {item.numUT}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-400 italic">
                        Sin fechas previstas asignadas
                      </span>
                    )}

                    {/* Sub-barra de ejecución real (si existe) */}
                    {item.barraReal && (
                      <div
                        className="absolute border-round surface-900 shadow-1"
                        style={{
                          left: item.barraReal.left,
                          width: item.barraReal.width,
                          height: '5px',
                          bottom: '1px',
                          zIndex: 3
                        }}
                        data-pr-tooltip={`Ejecución Real: ${formatearFechaEspanol(item.barraReal.fechaIni)} - ${formatearFechaEspanol(item.barraReal.fechaFin)}`}
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

export default DiagramaGanttTemporizacion;
