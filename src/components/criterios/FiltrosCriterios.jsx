import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosCriterios - Componente presentacional para los filtros contextuales de año académico y clase.
 *
 * Responsabilidad Única: Renderizar los desplegables interdependientes para la selección
 * del año académico y la clase activa, utilizando el componente común SelectorClase.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Lista de años académicos disponibles.
 * @param {number|string|null} props.anioSeleccionado - Año académico activo.
 * @param {Function} props.onCambioAnio - Manejador al cambiar el año académico.
 * @param {boolean} [props.cargandoAnios=false] - Indicador de carga de años.
 * @param {Array<Object>} props.clases - Lista de clases filtradas por el año académico.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase seleccionada.
 * @param {Function} props.onCambioClase - Manejador al cambiar de clase.
 * @param {boolean} [props.cargandoClases=false] - Indicador de carga de clases.
 * @param {boolean} [props.disabled=false] - Estado deshabilitado general.
 */
export const FiltrosCriterios = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  cargandoAnios = false,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  cargandoClases = false,
  disabled = false
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="flex flex-column md:flex-row align-items-start md:align-items-center gap-3">
        {/* Selector de Año Académico */}
        <div className="w-full md:w-15rem">
          <label htmlFor="selector-anio-criterios" className="font-semibold text-800 text-sm mb-1 block">
            Año académico <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="selector-anio-criterios"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            loading={cargandoAnios}
            disabled={disabled || cargandoAnios}
            placeholder="Selecciona año..."
            className="w-full"
          />
        </div>

        {/* Selector de Clase dependiente */}
        <div className="flex-1 w-full">
          <label htmlFor="selector-clase-criterios" className="font-semibold text-800 text-sm mb-1 block">
            Clase <span className="text-red-500">*</span>
          </label>
          <SelectorClase
            id="selector-clase-criterios"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onCambioClase(e.value)}
            loading={cargandoClases}
            disabled={disabled || cargandoClases || clases.length === 0}
            placeholder={clases.length === 0 ? 'No hay clases en este año académico' : 'Selecciona una clase...'}
            emptyMessage="No hay clases disponibles en este año escolar"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosCriterios;
