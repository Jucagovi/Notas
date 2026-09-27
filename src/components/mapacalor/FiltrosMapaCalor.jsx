import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosMapaCalor - Componente presentacional para los filtros superiores del Mapa de Calor.
 *
 * Responsabilidad Única: Renderizar los selectores en cascada (Año Académico -> Clase)
 * aplicando la habilitación secuencial requerida y la acción de refresco.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Catálogo de Años Académicos disponibles.
 * @param {number|string|null} props.anioSeleccionado - Año académico seleccionado actualmente.
 * @param {Function} props.onCambioAnio - Manejador de selección de año académico.
 * @param {Array<Object>} props.clases - Catálogo de Clases disponibles para el año.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase activa.
 * @param {Function} props.onCambioClase - Manejador de selección de clase.
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 * @param {Function} [props.onRecargar] - Manejador para recargar la información.
 */
export const FiltrosMapaCalor = ({
  anios = [],
  anioSeleccionado,
  onCambioAnio,
  clases = [],
  claseSeleccionadaId,
  onCambioClase,
  cargando = false,
  onRecargar
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1 mb-4">
      <div className="grid align-items-end">
        {/* Selector de Año Académico */}
        <div className="col-12 sm:col-5 md:col-4">
          <label
            htmlFor="filtro-anio-mapa-calor"
            className="block text-900 font-semibold mb-2 text-sm"
          >
            Año académico
          </label>
          <Dropdown
            id="filtro-anio-mapa-calor"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            placeholder="Selecciona año escolar..."
            className="w-full"
            disabled={cargando || anios.length === 0}
            optionLabel="label"
            optionValue="value"
          />
        </div>

        {/* Selector especializado de Clase (ordenado de más reciente a más antiguo) */}
        <div className="col-12 sm:col-5 md:col-6">
          <label
            htmlFor="filtro-clase-mapa-calor"
            className="block text-900 font-semibold mb-2 text-sm"
          >
            Clase
          </label>
          <SelectorClase
            id="filtro-clase-mapa-calor"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onCambioClase(e.value)}
            disabled={!anioSeleccionado || cargando}
            placeholder={
              !anioSeleccionado
                ? 'Selecciona antes un año académico...'
                : 'Selecciona una clase...'
            }
            className="w-full"
          />
        </div>

        {/* Botón de refresco manual */}
        {onRecargar && (
          <div className="col-12 sm:col-2 md:col-2 flex justify-content-end sm:justify-content-start">
            <Button
              icon="pi pi-refresh"
              onClick={onRecargar}
              disabled={cargando}
              loading={cargando}
              tooltip="Recargar datos del mapa de calor"
              tooltipOptions={{ position: 'top' }}
              className="p-button-outlined p-button-secondary w-full sm:w-auto"
              aria-label="Recargar"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosMapaCalor;
