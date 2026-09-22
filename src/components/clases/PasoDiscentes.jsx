import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import CeldaTruncada from '../mantenimiento/CeldaTruncada.jsx';

// Opciones disponibles para el filtro por estado de actividad.
const OPCIONES_ESTADO = [
  { label: 'Solo Activos', value: 'activos' },
  { label: 'Solo Inactivos', value: 'inactivos' },
  { label: 'Todos los Discentes', value: 'todos' }
];

// Paso 3: Selección múltiple de discentes con filtro por activo/inactivo y paginación superior de 5 a 25 elementos.
const PasoDiscentes = ({
  discentes = [],
  discentesSeleccionados = [],
  onCambiarSeleccion
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos');

  // Filtrado reactivo en cliente combinando el estado de actividad y el texto de búsqueda.
  const discentesFiltrados = useMemo(() => {
    return discentes.filter((d) => {
      // 1. Filtrado por estado activo / inactivo.
      if (filtroEstado === 'activos' && d.activo === false) {
        return false;
      }
      if (filtroEstado === 'inactivos' && d.activo !== false) {
        return false;
      }

      // 2. Filtrado por cadena de búsqueda de texto.
      if (!filtroTexto.trim()) return true;
      const busqueda = filtroTexto.toLowerCase();
      const nombreCompleto = `${d.nombre || ''} ${d.apellidos || ''}`.toLowerCase();
      const nia = (d.NIA || '').toLowerCase();
      const correo = (d.correo || '').toLowerCase();
      return nombreCompleto.includes(busqueda) || nia.includes(busqueda) || correo.includes(busqueda);
    });
  }, [discentes, filtroEstado, filtroTexto]);

  // Selección de todos los discentes visibles con un solo clic.
  const seleccionarTodosVisibles = () => {
    const mapaActual = new Map(discentesSeleccionados.map((d) => [d.id_discente, d]));
    discentesFiltrados.forEach((d) => mapaActual.set(d.id_discente, d));
    onCambiarSeleccion(Array.from(mapaActual.values()));
  };

  // Deseleccionar todos los discentes actualmente elegidos.
  const deseleccionarTodos = () => {
    onCambiarSeleccion([]);
  };

  const cabeceraTabla = (
    <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
      <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center gap-2 w-full lg:w-auto">
        <span className="p-input-icon-left w-full sm:w-18rem">
          <i className="pi pi-search" />
          <InputText
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por nombre, apellidos o NIA..."
            className="w-full p-inputtext-sm"
          />
        </span>
        {filtroTexto && (
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-sm"
            onClick={() => setFiltroTexto('')}
            tooltip="Limpiar búsqueda"
          />
        )}

        {/* Filtro por estado activo / inactivo */}
        <div className="flex align-items-center gap-2">
          <span className="text-secondary text-sm font-semibold">Estado:</span>
          <Dropdown
            value={filtroEstado}
            options={OPCIONES_ESTADO}
            onChange={(e) => setFiltroEstado(e.value)}
            className="p-inputtext-sm w-12rem"
          />
        </div>
      </div>

      <div className="flex align-items-center gap-2">
        <Button
          label="Seleccionar visibles"
          icon="pi pi-check-square"
          size="small"
          outlined
          onClick={seleccionarTodosVisibles}
        />
        <Button
          label="Deseleccionar"
          icon="pi pi-minus-circle"
          size="small"
          severity="secondary"
          outlined
          onClick={deseleccionarTodos}
          disabled={discentesSeleccionados.length === 0}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-column gap-3 py-2">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 className="m-0 text-xl font-bold text-800">Matriculación de Discentes</h3>
          <p className="text-secondary text-sm m-0 mt-1">
            Marca los discentes que cursarán el módulo seleccionado en este curso.
          </p>
        </div>
        <span className="text-sm font-bold text-primary px-3 py-2 surface-100 border-round">
          {discentesSeleccionados.length} discentes seleccionados
        </span>
      </div>

      <DataTable
        value={discentesFiltrados}
        selection={discentesSeleccionados}
        onSelectionChange={(e) => onCambiarSeleccion(e.value)}
        dataKey="id_discente"
        header={cabeceraTabla}
        paginator
        paginatorPosition="top"
        rows={5}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        responsiveLayout="scroll"
        className="p-datatable-sm surface-border border-1 border-round"
        emptyMessage="No se han encontrado discentes con los criterios especificados."
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />

        <Column
          field="apellidos"
          header="Apellidos"
          sortable
          body={(fila) => <CeldaTruncada valor={fila.apellidos} anchoMaximo="180px" />}
          headerStyle={{ width: '25%' }}
        />

        <Column
          field="nombre"
          header="Nombre"
          sortable
          body={(fila) => <CeldaTruncada valor={fila.nombre} anchoMaximo="140px" />}
          headerStyle={{ width: '22%' }}
        />

        <Column
          field="NIA"
          header="NIA"
          sortable
          body={(fila) => <span className="font-mono text-sm">{fila.NIA || '-'}</span>}
          headerStyle={{ width: '13%' }}
        />

        <Column
          field="correo"
          header="Correo electrónico"
          body={(fila) => <CeldaTruncada valor={fila.correo} anchoMaximo="180px" />}
          headerStyle={{ width: '25%' }}
        />

        <Column
          field="activo"
          header="Estado"
          sortable
          body={(fila) => (
            <span className={fila.activo !== false ? 'text-green-700 font-semibold text-xs' : 'text-red-500 font-semibold text-xs'}>
              {fila.activo !== false ? 'Activo' : 'Inactivo'}
            </span>
          )}
          headerStyle={{ width: '15%' }}
        />
      </DataTable>
    </div>
  );
};

export default PasoDiscentes;
