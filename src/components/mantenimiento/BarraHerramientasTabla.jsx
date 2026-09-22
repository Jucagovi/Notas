import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';

// Barra de herramientas superior para la tabla de mantenimiento con acciones y filtro global.
const BarraHerramientasTabla = ({
  filtroGlobal,
  onCambioFiltro,
  onNuevo,
  onActualizar,
  cargando,
  totalRegistros,
  etiquetaNuevo = 'Nuevo Registro'
}) => {
  return (
    <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 w-full py-2">
      {/* Botones de acción principales */}
      <div className="flex align-items-center gap-2 w-full md:w-auto">
        <Button
          label={etiquetaNuevo}
          icon="pi pi-plus"
          severity="primary"
          onClick={onNuevo}
          disabled={cargando}
          className="p-button-sm shadow-1"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          text
          rounded
          onClick={onActualizar}
          loading={cargando}
          tooltip="Recargar datos"
          tooltipOptions={{ position: 'top' }}
          aria-label="Actualizar"
        />
        <Tag
          value={`${totalRegistros} ${totalRegistros === 1 ? 'registro' : 'registros'}`}
          severity="info"
          className="ml-2 px-3 py-1 font-semibold"
        />
      </div>

      {/* Buscador global con icono */}
      <div className="w-full md:w-auto">
        <span className="p-input-icon-left w-full md:w-20rem">
          <i className="pi pi-search" />
          <InputText
            value={filtroGlobal}
            onChange={(e) => onCambioFiltro(e.target.value)}
            placeholder="Buscar en la tabla..."
            className="p-inputtext-sm w-full"
          />
        </span>
      </div>
    </div>
  );
};

export default BarraHerramientasTabla;
