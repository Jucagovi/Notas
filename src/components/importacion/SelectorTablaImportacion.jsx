import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// Componente presentacional para elegir la tabla destino de importación y descargar la plantilla CSV oficial.
const SelectorTablaImportacion = ({
  tablaSeleccionada,
  tablasDisponibles,
  onCambiarTabla,
  onDescargarPlantilla,
  deshabilitado = false
}) => {
  return (
    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
      <div className="flex flex-column sm:flex-row sm:align-items-center gap-3">
        <label htmlFor="selector-tabla" className="font-semibold text-900 white-space-nowrap">
          Tabla de destino:
        </label>
        <Dropdown
          id="selector-tabla"
          value={tablaSeleccionada}
          options={tablasDisponibles}
          onChange={(e) => onCambiarTabla(e.value)}
          placeholder="Seleccione la tabla"
          className="w-full sm:w-20rem"
          disabled={deshabilitado}
        />
      </div>

      <div>
        <Button
          type="button"
          label="Descargar Plantilla CSV"
          icon="pi pi-download"
          className="p-button-outlined p-button-secondary w-full sm:w-auto"
          onClick={onDescargarPlantilla}
          disabled={deshabilitado}
          tooltip="Descarga un archivo CSV con las cabeceras requeridas para esta tabla."
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    </div>
  );
};

export default SelectorTablaImportacion;
