import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import CeldaFechaTemporizacion from './CeldaFechaTemporizacion.jsx';

// Opciones estándar para el selector de estado dentro de la tabla.
const OPCIONES_ESTADO = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Curso', value: 'En Curso' },
  { label: 'Completada', value: 'Completada' }
];

/**
 * TablaTemporizacion - Tabla interactiva principal para la temporización de unidades.
 *
 * Responsabilidad Única: Renderizar el listado tabular de unidades de trabajo con soporte para
 * reordenación nativa RowReorder, edición en línea de fechas con Calendar y selector de estado con Dropdown.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Conjunto ordenado de unidades temporizadas.
 * @param {boolean} [props.cargando=false] - Indicador de carga de datos.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia o reordenación en curso.
 * @param {Function} props.onReordenar - Callback disparado al soltar una fila reordenada.
 * @param {Function} props.onActualizarCampo - Callback para mutar un campo específico en línea.
 * @param {Function} props.onEditar - Callback para abrir el diálogo modal de edición completa.
 */
export const TablaTemporizacion = ({
  temporizaciones = [],
  cargando = false,
  guardando = false,
  onReordenar,
  onActualizarCampo,
  onEditar
}) => {
  // Plantilla para la columna de número y nombre oficial de la Unidad de Trabajo.
  const plantillaUnidadTrabajo = (fila) => {
    const ut = fila.unidad_trabajo;
    const texto = `UT ${ut?.numero || fila.orden}: ${ut?.nombre || 'Sin título'}`;
    return (
      <div className="flex align-items-center gap-2">
        <span
          className="white-space-nowrap overflow-hidden text-overflow-ellipsis font-semibold text-900 inline-block max-w-16rem"
          data-pr-tooltip={texto}
        >
          {texto}
        </span>
      </div>
    );
  };

  // Plantilla para el nombre alternativo específico de este curso.
  const plantillaNombreAlternativo = (fila) => {
    if (!fila.nombre_alternativo) {
      return <span className="text-400 font-italic text-sm">-</span>;
    }
    return (
      <span
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis text-800 text-sm inline-block max-w-12rem"
        data-pr-tooltip={fila.nombre_alternativo}
      >
        {fila.nombre_alternativo}
      </span>
    );
  };

  // Plantilla para las observaciones truncadas con tooltip descriptivo.
  const plantillaObservaciones = (fila) => {
    if (!fila.observaciones) {
      return <span className="text-400 font-italic text-sm">-</span>;
    }
    return (
      <span
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis text-600 text-sm inline-block max-w-10rem"
        data-pr-tooltip={fila.observaciones}
      >
        {fila.observaciones}
      </span>
    );
  };

  // Plantilla para el selector de estado en celda.
  const plantillaEstado = (fila) => {
    return (
      <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <Dropdown
          value={fila.estado || 'Pendiente'}
          options={OPCIONES_ESTADO}
          onChange={(e) => onActualizarCampo(fila.id_temporizacion, 'estado', e.value)}
          disabled={guardando}
          className="p-inputtext-sm w-full"
        />
      </div>
    );
  };

  // Plantilla para los botones de acción rápida.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center justify-content-center gap-1">
        <Button
          type="button"
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          onClick={() => onEditar(fila)}
          tooltip="Editar detalles completos de la temporización"
          tooltipOptions={{ position: 'left' }}
          disabled={guardando}
        />
      </div>
    );
  };

  return (
    <div className="surface-card border-round border-1 surface-border shadow-1 overflow-hidden">
      {/* Tooltip global para los textos truncados de la tabla */}
      <Tooltip target="[data-pr-tooltip]" position="top" />

      <DataTable
        value={temporizaciones}
        reorderableRows
        onRowReorder={(e) => onReordenar(e.value)}
        loading={cargando}
        paginator
        rows={25}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginatorPosition="top"
        emptyMessage="No hay unidades de trabajo temporizadas para este módulo y curso."
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
          style={{ width: '4rem', textAlign: 'center' }}
          body={(fila) => (
            <span className="font-bold text-primary text-sm">#{fila.orden}</span>
          )}
        />

        {/* Columna de Unidad de Trabajo oficial */}
        <Column
          header="Unidad de Trabajo"
          body={plantillaUnidadTrabajo}
          style={{ minWidth: '15rem', maxWidth: '20rem' }}
        />

        {/* Columna de Nombre alternativo para el curso */}
        <Column
          header="Nombre en el Curso"
          body={plantillaNombreAlternativo}
          style={{ minWidth: '11rem', maxWidth: '14rem' }}
        />

        {/* Columna de Fecha Inicio Prevista con Calendar */}
        <Column
          header="Prevista Inicio"
          style={{ width: '10.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_ini_prevista}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_ini_prevista', nuevaFecha)
              }
              disabled={guardando}
            />
          )}
        />

        {/* Columna de Fecha Fin Prevista con Calendar */}
        <Column
          header="Prevista Fin"
          style={{ width: '10.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_fin_prevista}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_fin_prevista', nuevaFecha)
              }
              disabled={guardando}
            />
          )}
        />

        {/* Columna de Fecha Inicio Real con Calendar */}
        <Column
          header="Real Inicio"
          style={{ width: '10.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_ini_real}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_ini_real', nuevaFecha)
              }
              disabled={guardando}
            />
          )}
        />

        {/* Columna de Fecha Fin Real con Calendar */}
        <Column
          header="Real Fin"
          style={{ width: '10.5rem' }}
          body={(fila) => (
            <CeldaFechaTemporizacion
              valor={fila.fecha_fin_real}
              onChange={(nuevaFecha) =>
                onActualizarCampo(fila.id_temporizacion, 'fecha_fin_real', nuevaFecha)
              }
              disabled={guardando}
            />
          )}
        />

        {/* Columna de Estado con Dropdown */}
        <Column
          header="Estado"
          body={plantillaEstado}
          style={{ width: '9.5rem' }}
        />

        {/* Columna de Observaciones */}
        <Column
          header="Observaciones"
          body={plantillaObservaciones}
          style={{ minWidth: '9rem', maxWidth: '12rem' }}
        />

        {/* Columna de Acciones */}
        <Column
          header="Acciones"
          body={plantillaAcciones}
          style={{ width: '5rem', textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default TablaTemporizacion;
