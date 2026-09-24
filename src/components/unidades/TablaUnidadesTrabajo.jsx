import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * TablaUnidadesTrabajo - Componente presentacional para la visualización tabular de Unidades de Trabajo.
 *
 * Responsabilidad Única: Renderizar una tabla estructurada de Unidades de Trabajo con ordenación,
 * paginación en la parte superior y botones de acción rápida para edición y borrado.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Listado de unidades didácticas con sus versiones asignadas.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onEditar - Callback para editar una unidad didáctica.
 * @param {Function} props.onEliminar - Callback para eliminar una unidad didáctica.
 * @param {Function} props.onNuevaUT - Callback para crear una nueva unidad didáctica.
 */
const TablaUnidadesTrabajo = ({
  unidades = [],
  cargando = false,
  onEditar,
  onEliminar,
  onNuevaUT
}) => {
  if (!cargando && unidades.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay Unidades de Trabajo para mostrar"
        descripcion="No se han registrado unidades didácticas para este módulo profesional."
        icono="pi pi-table"
        botonLabel="Nueva Unidad"
        botonIcono="pi pi-plus"
        onAccion={onNuevaUT}
        className="w-full my-0"
      />
    );
  }

  // Plantilla para la columna de número de unidad didáctica.
  const plantillaNumero = (fila) => {
    return (
      <span className="font-bold text-primary">
        UT {fila.numero}
      </span>
    );
  };

  // Plantilla para la columna de nombre con truncado y tooltip.
  const plantillaNombre = (fila) => {
    return (
      <span className="linea-truncada font-semibold text-900" title={fila.nombre}>
        {fila.nombre}
      </span>
    );
  };

  // Plantilla para la descripción con truncado y tooltip.
  const plantillaDescripcion = (fila) => {
    return fila.descripcion ? (
      <span className="linea-truncada text-color-secondary" title={fila.descripcion}>
        {fila.descripcion}
      </span>
    ) : (
      <span className="text-400 font-italic text-sm">Sin descripción</span>
    );
  };

  // Plantilla para el cómputo de actividades asociadas.
  const plantillaActividades = (fila) => {
    const total = fila.versiones?.length || 0;
    return (
      <Tag
        value={`${total} ${total === 1 ? 'actividad' : 'actividades'}`}
        severity={total > 0 ? 'success' : 'secondary'}
        className="text-xs"
      />
    );
  };

  // Plantilla para las acciones de cada fila.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center gap-1">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          size="small"
          severity="secondary"
          onClick={() => onEditar(fila)}
          tooltip="Editar unidad didáctica."
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          size="small"
          severity="danger"
          onClick={() => onEliminar(fila)}
          tooltip="Eliminar unidad didáctica."
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <div className="surface-card border-round border-1 surface-border p-3 shadow-1">
      <TablaBase
        value={unidades}
        loading={cargando}
        paginator={true}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se encontraron unidades de trabajo."
        className="p-datatable-sm"
      >
        <Column
          field="numero"
          header="Nº"
          body={plantillaNumero}
          sortable
          style={{ width: '90px' }}
        />
        <Column
          field="nombre"
          header="Nombre de la Unidad"
          body={plantillaNombre}
          sortable
          filter
          filterPlaceholder="Filtrar..."
          style={{ minWidth: '240px' }}
        />
        <Column
          field="descripcion"
          header="Descripción Curricular"
          body={plantillaDescripcion}
          style={{ minWidth: '280px' }}
        />
        <Column
          header="Actividades"
          body={plantillaActividades}
          style={{ width: '160px' }}
        />
        <Column
          header="Acciones"
          body={plantillaAcciones}
          style={{ width: '110px', textAlign: 'center' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaUnidadesTrabajo;
