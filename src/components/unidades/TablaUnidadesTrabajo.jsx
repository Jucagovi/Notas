import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

/**
 * TablaUnidadesTrabajo - Componente presentacional para la columna tabular de Unidades de Trabajo.
 *
 * Responsabilidad Única: Renderizar una tabla estructurada de Unidades de Trabajo fusionando Nº y Nombre
 * en una única columna 'Unidad de trabajo' (ej. 'UT01 Entorno de trabajo'), con todas las filas colapsadas
 * inicialmente y desplegables únicamente por interacción del usuario, mostrando las prácticas asignadas
 * con el botón para desvincularlas.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Listado de unidades didácticas con sus versiones asignadas.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onEditar - Callback para editar una unidad didáctica.
 * @param {Function} props.onEliminar - Callback para eliminar una unidad didáctica.
 * @param {Function} props.onNuevaUT - Callback para crear una nueva unidad didáctica.
 * @param {Function} props.onDesvincularPractica - Callback para desvincular una práctica de la UT.
 */
const TablaUnidadesTrabajo = ({
  unidades = [],
  cargando = false,
  onEditar,
  onEliminar,
  onNuevaUT,
  onDesvincularPractica
}) => {
  // Estado local para mantener las filas colapsadas inicialmente (sólo se mostrarán si el usuario pulsa sobre ellas).
  const [filasExpandidas, setFilasExpandidas] = useState(null);

  // Manejador para alternar la expansión de una fila al pulsar sobre el título de la UT.
  const alternarFila = (idUt) => {
    setFilasExpandidas((prev) => {
      const nuevo = { ...(prev || {}) };
      if (nuevo[idUt]) {
        delete nuevo[idUt];
      } else {
        nuevo[idUt] = true;
      }
      return nuevo;
    });
  };

  if (!cargando && unidades.length === 0) {
    return (
      <div className="surface-card border-round border-1 surface-border p-3 shadow-1 h-full flex flex-column justify-content-center">
        <EstadoVacio
          mensaje="No hay Unidades de Trabajo creadas"
          descripcion="Define las unidades de trabajo del módulo para estructurar los contenidos curriculares de esta clase."
          icono="pi pi-folder-open"
          botonLabel="Nueva Unidad"
          botonIcono="pi pi-plus"
          onAccion={onNuevaUT}
          className="w-full my-0"
        />
      </div>
    );
  }

  // Plantilla fusionada para 'Unidad de trabajo' concatenando número (UT01) y nombre.
  const plantillaUnidadTrabajo = (fila) => {
    const etiquetaUT = formatearNumeroUT(fila.numero);
    const textoCompleto = `${etiquetaUT} ${fila.nombre}`;

    return (
      <div
        className="flex align-items-center gap-2 overflow-hidden cursor-pointer py-1"
        title={`${textoCompleto} (Pulsa para expandir o colapsar prácticas)`}
        onClick={() => alternarFila(fila.id_ut)}
      >
        <span className="font-bold text-primary font-mono flex-shrink-0">
          {etiquetaUT}
        </span>
        <span className="font-semibold text-900 linea-truncada">
          {fila.nombre}
        </span>
      </div>
    );
  };

  // Plantilla para el cómputo de actividades asociadas mostrando únicamente el número como texto plano.
  const plantillaActividades = (fila) => {
    const total = fila.versiones?.length || 0;
    return (
      <span className="text-sm font-bold text-800">
        {total}
      </span>
    );
  };

  // Plantilla para las acciones de cada fila con espaciado homogéneo entre botones.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center justify-content-center gap-1">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          size="small"
          severity="secondary"
          onClick={() => onEditar(fila)}
          tooltip={`Editar ${formatearNumeroUT(fila.numero)}.`}
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          size="small"
          severity="danger"
          onClick={() => onEliminar(fila)}
          tooltip={`Eliminar ${formatearNumeroUT(fila.numero)}.`}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla para la segunda fila inferior donde se muestran las prácticas asignadas a la UT.
  const plantillaPracticasAsignadas = (fila) => {
    const practicas = fila.versiones || [];
    const etiquetaUT = formatearNumeroUT(fila.numero);

    return (
      <div className="py-2 px-3 surface-50 border-round">
        <div className="text-xs font-semibold text-color-secondary mb-2 flex align-items-center gap-1">
          <i className="pi pi-book text-xs text-primary" />
          <span>Prácticas asignadas a {etiquetaUT}:</span>
        </div>

        {practicas.length === 0 ? (
          <div className="text-xs text-400 font-italic py-1">
            No hay prácticas asignadas a esta unidad de trabajo.
          </div>
        ) : (
          <div className="flex flex-column gap-1">
            {practicas.map((v) => {
              const nombrePractica = v.Practicas?.nombre || 'Práctica sin título';
              const numVersion = v.numero ? `V${v.numero}` : 'V1';

              return (
                <div
                  key={v.id_version}
                  className="flex align-items-center justify-content-between p-2 surface-card border-1 surface-border border-round"
                >
                  <div className="flex align-items-center gap-2 overflow-hidden min-w-0">
                    <span className="font-bold text-xs text-primary font-mono flex-shrink-0">
                      {numVersion}
                    </span>
                    <span className="text-sm font-semibold text-900 linea-truncada" title={nombrePractica}>
                      {nombrePractica}
                    </span>
                  </div>

                  <Button
                    label="Desvincular práctica"
                    icon="pi pi-times"
                    severity="danger"
                    size="small"
                    text
                    className="p-button-sm text-xs py-1 px-2 flex-shrink-0"
                    onClick={() => onDesvincularPractica && onDesvincularPractica(v.id_version)}
                    tooltip={`Desvincular "${nombrePractica}" de ${etiquetaUT}.`}
                    tooltipOptions={{ position: 'left' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="surface-card border-round border-1 surface-border p-3 shadow-1 h-full w-full overflow-hidden">
      <div className="flex align-items-center justify-content-between mb-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-list text-primary font-bold" />
          <h3 className="text-base font-bold text-900 m-0">Unidades de Trabajo</h3>
        </div>
        <Button
          label="Añadir UT"
          icon="pi pi-plus"
          size="small"
          outlined
          onClick={onNuevaUT}
          tooltip="Crear una nueva unidad de trabajo."
          tooltipOptions={{ position: 'left' }}
        />
      </div>

      <TablaBase
        value={unidades}
        dataKey="id_ut"
        expandedRows={filasExpandidas}
        onRowToggle={(e) => setFilasExpandidas(e.data)}
        rowExpansionTemplate={plantillaPracticasAsignadas}
        loading={cargando}
        paginator={true}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se encontraron unidades de trabajo."
        className="p-datatable-sm w-full"
      >
        <Column
          expander
          style={{ width: '2.5rem' }}
        />
        <Column
          field="nombre"
          header="Unidad de trabajo"
          body={plantillaUnidadTrabajo}
          sortable
          sortField="numero"
          filter
          filterPlaceholder="Filtrar por unidad..."
          style={{ minWidth: '160px' }}
        />
        <Column
          header="Actividades"
          body={plantillaActividades}
          style={{ width: '80px', textAlign: 'center' }}
        />
        <Column
          header="Acciones"
          body={plantillaAcciones}
          style={{ width: '80px', textAlign: 'center' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaUnidadesTrabajo;
