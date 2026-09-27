import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosActaTrimestres - Componente presentacional para los filtros contextuales del acta por trimestres.
 *
 * Responsabilidad Única: Renderizar los desplegables de Año Académico y de Curso / Módulo (Clase)
 * utilizando el componente común SelectorClase y gestionando el refresco de datos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Catálogo de años escolares disponibles [{ label: '2026/2027', value: 2026 }].
 * @param {number|string|null} props.anioSeleccionado - Año escolar seleccionado por defecto o por el usuario.
 * @param {Function} props.onCambioAnio - Manejador del cambio de año escolar.
 * @param {boolean} [props.cargandoAnios=false] - Indicador de carga de años académicos.
 * @param {Array<Object>} props.clases - Catálogo de clases pertenecientes al año seleccionado.
 * @param {string|null} props.claseSeleccionadaId - Identificador único de la clase seleccionada.
 * @param {Function} props.onCambioClase - Manejador del cambio de clase.
 * @param {boolean} [props.cargandoClases=false] - Indicador de carga de clases.
 * @param {Function} [props.onRecargar] - Manejador opcional para refrescar las fuentes de datos.
 */
export const FiltrosActaTrimestres = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  cargandoAnios = false,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  cargandoClases = false,
  onRecargar
}) => {
  return (
    <div className="surface-card p-3 shadow-1 border-round mb-4 border-1 surface-border">
      <div className="grid align-items-center">
        {/* Selector de Año Académico: se selecciona el año más reciente por defecto */}
        <div className="col-12 md:col-4">
          <label
            htmlFor="filtro-anio-acta-trimestres"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Año Académico
          </label>
          <Dropdown
            id="filtro-anio-acta-trimestres"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            loading={cargandoAnios}
            placeholder="Selecciona año académico..."
            className="w-full"
            aria-label="Seleccionar año académico"
          />
        </div>

        {/* Selector de Curso y Módulo (Clase): espera la selección interactiva del docente */}
        <div className="col-12 md:col-6 lg:col-7">
          <label
            htmlFor="filtro-clase-acta-trimestres"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Curso / Módulo (Clase)
          </label>
          <SelectorClase
            id="filtro-clase-acta-trimestres"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onCambioClase(e.value)}
            loading={cargandoClases}
            placeholder="Selecciona un curso y módulo..."
            filter
            className="w-full"
          />
        </div>

        {/* Botón de recarga de datos */}
        {onRecargar && (
          <div className="col-12 md:col-2 lg:col-1 flex justify-content-end md:justify-content-center mt-2 md:mt-4">
            <Button
              icon="pi pi-refresh"
              tooltip="Refrescar datos de la clase"
              tooltipOptions={{ position: 'top' }}
              onClick={onRecargar}
              text
              rounded
              severity="secondary"
              aria-label="Refrescar datos"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosActaTrimestres;
