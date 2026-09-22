import React, { useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import EstadoVacio from '../common/EstadoVacio.jsx';
import {
  formatearFechaEspanol,
  obtenerNombreDiaSemana
} from '../../utils/fechas.js';

/**
 * PanelDetalleFestivos - Subcomponente presentacional simplificado para mostrar los días no lectivos marcados.
 *
 * Responsabilidad Única: Renderizar los días festivos como etiquetas (<Tag>) compactas ordenadas
 * cronológicamente con formato día/mes y tooltip descriptivo con el motivo o festividad.
 */
export const PanelDetalleFestivos = ({
  festivos = [],
  onEliminarFestivo,
  onLimpiarFestivos,
  onAbrirDialogoRango,
  onAbrirDialogoCopiar,
  disabled = false
}) => {
  // Se ordenan cronológicamente las fechas festivas.
  const festivosOrdenados = useMemo(() => {
    return [...festivos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [festivos]);

  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3 w-full">
      {/* Cabecera del panel simplificado */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-sun text-red-500 text-xl" />
          <h2 className="text-lg font-bold text-900 m-0">
            Días No Lectivos Marcados
          </h2>
          <Tag
            severity="danger"
            value={`${festivos.length} ${festivos.length === 1 ? 'día' : 'días'}`}
            className="text-xs"
          />
        </div>

        <div className="flex align-items-center gap-2 flex-wrap">
          <Button
            type="button"
            icon="pi pi-calendar-plus"
            label="Añadir Periodo"
            outlined
            severity="secondary"
            size="small"
            onClick={onAbrirDialogoRango}
            disabled={disabled}
            tooltip="Añadir un bloque continuo de días (ej. Navidad o Semana Santa)"
            tooltipOptions={{ position: 'top' }}
          />

          {onAbrirDialogoCopiar && (
            <Button
              type="button"
              icon="pi pi-copy"
              label="Copiar de Curso"
              outlined
              severity="secondary"
              size="small"
              onClick={onAbrirDialogoCopiar}
              disabled={disabled}
              tooltip="Copiar festivos registrados desde otro curso escolar"
              tooltipOptions={{ position: 'top' }}
            />
          )}

          {festivos.length > 0 && (
            <Button
              type="button"
              icon="pi pi-trash"
              label="Limpiar Todo"
              severity="danger"
              outlined
              size="small"
              onClick={onLimpiarFestivos}
              disabled={disabled}
              tooltip="Eliminar todos los festivos marcados"
              tooltipOptions={{ position: 'top' }}
            />
          )}
        </div>
      </div>

      {/* Listado de festivos con Tags o EstadoVacio */}
      {festivos.length === 0 ? (
        <EstadoVacio
          mensaje="Sin festivos registrados"
          descripcion="Haga clic sobre cualquier día laborable en la cuadrícula superior o use 'Añadir Periodo' para incorporar vacaciones completas."
          icono="pi pi-sun"
          botonLabel="Añadir Periodo"
          botonIcono="pi pi-calendar-plus"
          onAccion={onAbrirDialogoRango}
        />
      ) : (
        <div className="flex flex-wrap gap-2 p-3 surface-50 border-round-lg border-1 surface-border">
          {festivosOrdenados.map((f) => {
            const partes = f.fecha.split('-');
            const diaMes = `${partes[2]}/${partes[1]}`;
            const diaSemana = obtenerNombreDiaSemana(f.fechaObj || f.fecha);
            const motivo = f.descripcion && f.descripcion.trim() ? f.descripcion.trim() : 'Día festivo / no lectivo';
            const textoTooltip = `${diaSemana}, ${formatearFechaEspanol(f.fecha)}: ${motivo}`;

            return (
              <Tag
                key={f.fecha}
                severity="danger"
                className="text-sm px-3 py-2 flex align-items-center gap-2 cursor-pointer shadow-1"
                tooltip={textoTooltip}
                tooltipOptions={{ position: 'top' }}
              >
                <i className="pi pi-calendar-times text-xs opacity-80" />
                <span className="font-bold">{diaMes}</span>
                {!disabled && (
                  <i
                    className="pi pi-times text-xs ml-1 opacity-70 hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarFestivo(f.fecha);
                    }}
                    title="Eliminar este festivo"
                  />
                )}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PanelDetalleFestivos;
