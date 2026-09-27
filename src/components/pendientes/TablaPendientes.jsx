import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';

/**
 * TablaPendientes - Componente presentacional para la visualización del listado de calificaciones pendientes.
 *
 * Responsabilidad Única: Renderizar el DataTable estandarizado envolviendo TablaBase, formatear
 * las celdas de discente, actividad y evaluación garantizando el truncado con tooltip en una sola línea,
 * y emitir el evento interactivo de calificar con los identificadores requeridos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.pendientes - Colección de calificaciones pendientes detectadas.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onCalificar - Manejador al hacer clic en el botón Calificar de una fila.
 */
export const TablaPendientes = ({
  pendientes = [],
  cargando = false,
  onCalificar
}) => {
  // Plantilla para la columna de Discente con soporte de truncado y tooltip
  const plantillaDiscente = (rowData) => {
    const texto = rowData.discenteNombreCompleto || 'Discente';
    const subtexto = rowData.discenteNia ? `NIA: ${rowData.discenteNia}` : '';

    return (
      <div
        className="flex align-items-center gap-2 white-space-nowrap overflow-hidden text-overflow-ellipsis celda-discente-tooltip"
        data-pr-tooltip={`${texto}${subtexto ? ` (${subtexto})` : ''}`}
        style={{ maxWidth: '280px' }}
      >
        <i className="pi pi-user text-primary flex-shrink-0" />
        <span className="font-semibold text-900 overflow-hidden text-overflow-ellipsis">
          {texto}
        </span>
        {rowData.discenteNia && (
          <span className="text-color-secondary text-xs flex-shrink-0">
            ({rowData.discenteNia})
          </span>
        )}
      </div>
    );
  };

  // Plantilla para la columna de Actividad con truncado y tooltip
  const plantillaActividad = (rowData) => {
    const texto = rowData.actividadTexto || 'Actividad sin título';

    return (
      <div
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis celda-actividad-tooltip"
        data-pr-tooltip={texto}
        style={{ maxWidth: '380px' }}
      >
        <span className="font-medium text-800">
          {rowData.practicaNombre || 'Práctica'}
        </span>
        {rowData.versionNumero && (
          <span className="text-color-secondary text-sm ml-1">
            ({rowData.versionNumero})
          </span>
        )}
      </div>
    );
  };

  // Plantilla para la columna de Evaluación
  const plantillaEvaluacion = (rowData) => {
    const texto = rowData.evaluacionNombre || 'Evaluación';

    return (
      <div
        className="flex align-items-center gap-2 white-space-nowrap overflow-hidden text-overflow-ellipsis celda-evaluacion-tooltip"
        data-pr-tooltip={texto}
        style={{ maxWidth: '200px' }}
      >
        <i className="pi pi-calendar text-500 flex-shrink-0" />
        <span className="text-800 font-medium overflow-hidden text-overflow-ellipsis">
          {texto}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de Acción con el botón Calificar
  const plantillaAccion = (rowData) => {
    return (
      <div className="flex justify-content-center">
        <Button
          label="Calificar"
          icon="pi pi-pencil"
          size="small"
          onClick={() => onCalificar(rowData)}
          className="p-button-sm"
          tooltip="Abrir cuaderno de calificación para esta actividad"
          tooltipOptions={{ position: 'left' }}
        />
      </div>
    );
  };

  return (
    <div className="surface-card p-3 shadow-1 border-round border-1 surface-border w-full">
      {/* Tooltip global vinculado a las celdas truncadas */}
      <Tooltip target=".celda-discente-tooltip, .celda-actividad-tooltip, .celda-evaluacion-tooltip" position="top" />

      <TablaBase
        data={pendientes}
        loading={cargando}
        paginator={true}
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginatorPosition="top"
        emptyMessage="No hay calificaciones pendientes para los filtros seleccionados."
        sortMode="multiple"
        className="p-datatable-sm w-full"
      >
        {/* Columna Discente ordenable */}
        <Column
          field="discenteNombreCompleto"
          header="Discente"
          sortable
          body={plantillaDiscente}
          style={{ minWidth: '220px', width: '30%' }}
        />

        {/* Columna Actividad ordenable */}
        <Column
          field="actividadTexto"
          header="Actividad"
          sortable
          body={plantillaActividad}
          style={{ minWidth: '260px', width: '40%' }}
        />

        {/* Columna Evaluación ordenable */}
        <Column
          field="evaluacionNombre"
          header="Evaluación"
          sortable
          body={plantillaEvaluacion}
          style={{ minWidth: '160px', width: '20%' }}
        />

        {/* Columna de Acción */}
        <Column
          header="Acción"
          body={plantillaAccion}
          style={{ width: '10%', minWidth: '130px', textAlign: 'center' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaPendientes;
