import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import CeldaFechaTemporizacion from './CeldaFechaTemporizacion.jsx';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

/**
 * TablaTemporizacion - Tabla interactiva principal para la temporización de unidades.
 *
 * Responsabilidad Única: Renderizar el listado tabular de unidades de trabajo con soporte para
 * reordenación nativa RowReorder, edición en línea de fechas previstas y reales mediante Calendar,
 * y disparadores de acciones para edición exhaustiva y gestión modal de observaciones.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Conjunto ordenado de unidades temporizadas.
 * @param {boolean} [props.cargando=false] - Indicador de carga de datos.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia o reordenación en curso.
 * @param {Function} props.onReordenar - Callback disparado al soltar una fila reordenada.
 * @param {Function} props.onActualizarCampo - Callback para mutar un campo específico en línea.
 * @param {Function} props.onEditar - Callback para abrir el diálogo modal de edición completa.
 * @param {Function} props.onAbrirObservaciones - Callback para abrir el diálogo modal de observaciones.
 */
export const TablaTemporizacion = ({
  temporizaciones = [],
  cargando = false,
  guardando = false,
  onReordenar,
  onActualizarCampo,
  onEditar,
  onAbrirObservaciones
}) => {
  // Plantilla para la columna de número y nombre oficial de la Unidad de Trabajo.
  const plantillaUnidadTrabajo = (fila) => {
    const ut = fila.unidad_trabajo;
    const numUT = formatearNumeroUT(ut?.numero || fila.orden);
    const texto = `${numUT}: ${ut?.nombre || 'Sin título'}`;
    return (
      <div className="flex align-items-center gap-2">
        <span
          className="white-space-nowrap overflow-hidden text-overflow-ellipsis font-semibold text-900 inline-block max-w-24rem"
          data-pr-tooltip={texto}
        >
          {texto}
        </span>
      </div>
    );
  };

  // Plantilla para los botones de acción rápida (observaciones y edición completa).
  const plantillaAcciones = (fila) => {
    const tieneObservaciones = Boolean(fila.observaciones && fila.observaciones.trim());

    return (
      <div className="flex align-items-center justify-content-center gap-1">
        {/* Botón para visualizar / editar observaciones en popup modal */}
        <Button
          type="button"
          icon="pi pi-comment"
          rounded
          text
          severity={tieneObservaciones ? 'info' : 'secondary'}
          onClick={() => onAbrirObservaciones && onAbrirObservaciones(fila)}
          tooltip={
            tieneObservaciones
              ? `Observaciones: ${fila.observaciones}`
              : 'Añadir observaciones a la unidad'
          }
          tooltipOptions={{ position: 'left' }}
        />

        {/* Botón para editar detalles completos de la temporización */}
        <Button
          type="button"
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          onClick={() => onEditar && onEditar(fila)}
          tooltip="Editar detalles completos de la unidad"
          tooltipOptions={{ position: 'left' }}
        />
      </div>
    );
  };

  return (
    <div className="surface-card border-round border-1 surface-border shadow-1 overflow-hidden">
      {/* Tooltip global para los textos descriptivos de la tabla */}
      <Tooltip target="[data-pr-tooltip]" position="top" />

      <DataTable
        value={temporizaciones}
        reorderableRows
        onRowReorder={(e) => onReordenar && onReordenar(e.value)}
        loading={cargando}
        paginator
        rows={25}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginatorPosition="top"
        emptyMessage="No hay unidades de trabajo temporizadas para esta clase."
        stripedRows
        responsiveLayout="scroll"
        className="p-datatable-sm"
        dataKey="id_temporizacion"
      >
        {/* Columna de asidero para reordenación nativa Drag & Drop */}
        <Column
          rowReorder
          style={{ width: '3rem', textAlign: 'center' }}
          headerTooltip="Haga clic y arrastre para reordenar la secuencia"
        />

        {/* Columna de posición u orden numérico actual */}
        <Column
          field="orden"
          header="Nº"
          style={{ width: '3.5rem', textAlign: 'center' }}
          body={(fila) => (
            <span className="font-bold text-primary text-sm">#{fila.orden}</span>
          )}
        />

        {/* Columna de Unidad de Trabajo oficial */}
        <Column
          header="Unidad de Trabajo"
          body={plantillaUnidadTrabajo}
          style={{ minWidth: '16rem' }}
        />

        {/* Columna de Fecha Inicio Prevista con Calendar */}
        <Column
          header="Prevista Inicio"
          style={{ width: '14.5rem', minWidth: '14.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_ini_prevista}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_ini_prevista', nuevaFecha)
              }
              disabled={false}
            />
          )}
        />

        {/* Columna de Fecha Fin Prevista con Calendar */}
        <Column
          header="Prevista Fin"
          style={{ width: '14.5rem', minWidth: '14.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_fin_prevista}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_fin_prevista', nuevaFecha)
              }
              disabled={false}
            />
          )}
        />

        {/* Columna de Acciones con botón de observaciones y edición */}
        <Column
          header="Acciones"
          body={plantillaAcciones}
          style={{ width: '7rem', minWidth: '7rem', textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default TablaTemporizacion;
