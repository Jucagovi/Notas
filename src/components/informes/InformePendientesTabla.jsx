import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tooltip } from 'primereact/tooltip';

// Componente para la visualización tabular de calificaciones pendientes agrupadas por evaluación
const InformePendientesTabla = ({
  filas = [],
  cargando = false,
  alCalificar = () => {}
}) => {
  // Plantilla para la cabecera de subgrupo por evaluación
  const plantillaCabeceraEvaluacion = (data) => {
    const totalGrupo = filas.filter((f) => f.id_evaluacion === data.id_evaluacion).length;

    return (
      <div className="flex align-items-center justify-content-between w-full py-2 px-3 surface-ground border-round">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-clock text-primary font-bold" />
          <span className="font-bold text-color text-sm">
            {data.nombreEvaluacion || 'Evaluación'}
          </span>
          {data.evaluacion?.fecha_ini && (
            <span className="text-xs text-muted ml-2">
              ({new Date(data.evaluacion.fecha_ini).toLocaleDateString('es-ES')}
              {data.evaluacion.fecha_fin ? ` - ${new Date(data.evaluacion.fecha_fin).toLocaleDateString('es-ES')}` : ''})
            </span>
          )}
        </div>
        <Badge
          value={`${totalGrupo} pendiente${totalGrupo === 1 ? '' : 's'}`}
          severity="warning"
        />
      </div>
    );
  };

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

  // Plantilla visual para la columna de Práctica con texto integrado y tooltip
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

  // Función de ordenación que mantiene siempre agrupadas las filas por evaluación
  const ordenarPersonalizado = (event) => {
    const { data, field, order } = event;
    return [...data].sort((a, b) => {
      const evA = a.ordenEvaluacion ?? 99;
      const evB = b.ordenEvaluacion ?? 99;
      if (evA !== evB) {
        return evA - evB;
      }
      const valA = a[field] ?? '';
      const valB = b[field] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * order;
      }
      return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * order;
    });
  };

  return (
    <div className="surface-card p-3 border-round shadow-1">
      {/* Tooltip flotante para mostrar el nombre completo de prácticas truncadas */}
      <Tooltip target=".practica-item-tooltip" position="top" showDelay={200} />

      <DataTable
        value={filas}
        loading={cargando}
        rowGroupMode="subheader"
        groupRowsBy="id_evaluacion"
        rowGroupHeaderTemplate={plantillaCabeceraEvaluacion}
        customSort
        sortFunction={ordenarPersonalizado}
        paginator={filas.length > 10}
        rows={15}
        rowsPerPageOptions={[10, 15, 25, 50]}
        tableStyle={{ minWidth: '35rem' }}
        stripedRows
        responsiveLayout="scroll"
        className="p-datatable-sm"
        emptyMessage="No se encontraron calificaciones pendientes para los filtros seleccionados."
      >
        {/* Columna Discente */}
        <Column
          field="nombreCompletoDiscente"
          header="Discente"
          body={plantillaDiscente}
          sortable
          style={{ width: '40%' }}
        />

        {/* Columna Práctica sin calificar */}
        <Column
          field="nombrePractica"
          header="Práctica"
          body={plantillaPractica}
          sortable
          style={{ width: '45%' }}
        />

        {/* Columna Acción con botón Calificar */}
        <Column
          header="Acción"
          body={plantillaAccion}
          bodyClassName="text-center"
          headerClassName="text-center"
          style={{ width: '15%' }}
        />
      </DataTable>
    </div>
  );
};

export default InformePendientesTabla;
