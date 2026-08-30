import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';

// Componente para la visualización tabular interactiva de las calificaciones pendientes
const InformePendientesTabla = ({
  filas = [],
  cargando = false,
  alCalificar = () => {}
}) => {
  // Plantilla visual para la columna del Discente con Avatar y NIA
  const plantillaDiscente = (fila) => {
    const iniciales = (fila.nombreDiscente?.[0] || 'D') + (fila.apellidosDiscente?.[0] || '');
    return (
      <div className="flex align-items-center gap-2">
        <Avatar
          image={fila.discenteImagen || undefined}
          label={!fila.discenteImagen ? iniciales.toUpperCase() : undefined}
          shape="circle"
          size="normal"
          className="font-bold flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary-light, #e0f2fe)',
            color: 'var(--primary-color, #0284c7)'
          }}
        />
        <div className="flex flex-column min-w-0">
          <span className="font-bold text-color white-space-nowrap overflow-hidden text-overflow-ellipsis">
            {fila.nombreCompletoDiscente || `${fila.nombreDiscente} ${fila.apellidosDiscente}`}
          </span>
          <span className="text-xs text-muted white-space-nowrap overflow-hidden text-overflow-ellipsis">
            {fila.discenteNia ? `NIA: ${fila.discenteNia}` : fila.discenteCorreo || 'Sin NIA'}
          </span>
        </div>
      </div>
    );
  };

  // Plantilla visual para la columna de Práctica con texto integrado, truncado y tooltip
  const plantillaPractica = (fila) => {
    const prefijo = fila.numeroPractica ? `P${fila.numeroPractica} - ` : '';
    const nombreCompleto = `${prefijo}${fila.nombrePractica || 'Práctica sin título'}`;
    const detalleTooltip = fila.practica?.unidad
      ? `${nombreCompleto} (Unidad: ${fila.practica.unidad})`
      : nombreCompleto;

    return (
      <div className="flex flex-column min-w-0" style={{ maxWidth: '100%' }}>
        <div
          className="practica-item-tooltip white-space-nowrap overflow-hidden text-overflow-ellipsis cursor-pointer"
          data-pr-tooltip={detalleTooltip}
        >
          <span className="font-semibold text-color">
            {nombreCompleto}
          </span>
        </div>
        {fila.practica?.unidad && (
          <span className="text-xs text-muted white-space-nowrap overflow-hidden text-overflow-ellipsis">
            Unidad: {fila.practica.unidad}
          </span>
        )}
      </div>
    );
  };

  // Plantilla visual para la columna de Acción con el botón Calificar
  const plantillaAccion = (fila) => {
    return (
      <Button
        type="button"
        label="Calificar"
        icon="pi pi-pencil"
        size="small"
        severity="primary"
        className="p-button-sm"
        onClick={() => alCalificar(fila)}
        tooltip={`Calificar práctica para ${fila.nombreDiscente || 'el alumno'}`}
        tooltipOptions={{ position: 'left' }}
        aria-label={`Calificar práctica de ${fila.nombreCompletoDiscente}`}
      />
    );
  };

  return (
    <div className="surface-card p-3 border-round shadow-1">
      {/* Tooltip flotante para mostrar el nombre completo de prácticas truncadas */}
      <Tooltip target=".practica-item-tooltip" position="top" showDelay={200} />

      <DataTable
        value={filas}
        loading={cargando}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '35rem' }}
        stripedRows
        responsiveLayout="scroll"
        className="p-datatable-sm"
        emptyMessage="No se encontraron calificaciones pendientes para los filtros seleccionados."
      >
        {/* Columna Discente (ordenación por nombre completo o apellidos) */}
        <Column
          field="nombreCompletoDiscente"
          header="Discente"
          body={plantillaDiscente}
          sortable
          style={{ width: '35%' }}
        />

        {/* Columna Práctica sin calificar (ordenación por número o título con tooltip) */}
        <Column
          field="nombrePractica"
          header="Práctica"
          body={plantillaPractica}
          sortable
          style={{ width: '50%' }}
        />

        {/* Columna Acción con botón Calificar */}
        <Column
          header="Acción"
          body={plantillaAccion}
          style={{ width: '15%', textAlign: 'center' }}
          headerStyle={{ textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default InformePendientesTabla;
