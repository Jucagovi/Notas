import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosCalificar - Barra de filtros contextuales para la calificación de actividades.
 *
 * Responsabilidad Única: Renderizar los desplegables interdependientes en cascada:
 * Año académico -> Clase -> Versiones (de la clase activa).
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Catálogo de años académicos disponibles.
 * @param {number|string|null} props.anioSeleccionado - Año escolar activo.
 * @param {Function} props.onCambioAnio - Manejador al cambiar el año escolar.
 * @param {boolean} props.cargandoAnios - Indicador de carga de años.
 * @param {Array<Object>} props.clases - Catálogo de clases filtradas por el año escolar.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase seleccionada.
 * @param {Function} props.onClaseChange - Manejador al cambiar de clase.
 * @param {boolean} props.cargandoClases - Indicador de carga de clases.
 * @param {Array<Object>} props.versiones - Lista de versiones registradas en la clase activa.
 * @param {string|null} props.versionSeleccionadaId - Identificador de la versión activa.
 * @param {Function} props.onVersionChange - Manejador al cambiar de versión.
 * @param {boolean} props.cargandoVersiones - Indicador de carga de versiones.
 * @param {Function} props.onRecargar - Acción para refrescar catálogos y calificaciones.
 */
const FiltrosCalificar = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  cargandoAnios = false,
  clases = [],
  claseSeleccionadaId = null,
  onClaseChange,
  cargandoClases = false,
  versiones = [],
  versionSeleccionadaId = null,
  onVersionChange,
  cargandoVersiones = false,
  onRecargar
}) => {
  // Plantilla visual para los elementos del listado desplegable de versiones
  const plantillaItemVersion = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center justify-content-between w-full py-1">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-bookmark text-primary" />
          <span className="font-semibold text-900">{opcion.nombrePractica}</span>
          <span className="text-color-secondary text-sm">
            ({opcion.numeroVersion})
          </span>
        </div>
        <div className="flex align-items-center gap-2">
          {opcion.evaluacionNombre && (
            <span className="text-color-secondary text-xs">
              {opcion.evaluacionNombre}
            </span>
          )}
          {opcion.peso > 0 && (
            <span className="text-xs bg-surface-100 px-2 py-1 border-round text-color-secondary">
              {opcion.peso}%
            </span>
          )}
        </div>
      </div>
    );
  };

  // Plantilla para la versión actualmente seleccionada en el input cerrado
  const plantillaValorVersion = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-bookmark text-primary" />
        <span className="font-semibold text-900">{opcion.nombrePractica}</span>
        <span className="text-color-secondary text-sm">
          ({opcion.numeroVersion})
        </span>
        {opcion.evaluacionNombre && (
          <span className="text-color-secondary text-xs ml-1">
            — {opcion.evaluacionNombre}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="grid formgrid p-fluid align-items-end">
        {/* 1. Selector de Año Académico */}
        <div className="col-12 sm:col-6 md:col-3">
          <label htmlFor="selector-anio-calificar" className="block text-900 font-semibold mb-2 text-sm">
            Año académico <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="selector-anio-calificar"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            loading={cargandoAnios}
            disabled={cargandoAnios}
            placeholder="Selecciona año..."
            className="w-full"
          />
        </div>

        {/* 2. Selector de Clase dependiente del Año Académico */}
        <div className="col-12 sm:col-6 md:col-4">
          <label htmlFor="selector-clase-calificar" className="block text-900 font-semibold mb-2 text-sm">
            Clase <span className="text-red-500">*</span>
          </label>
          <SelectorClase
            id="selector-clase-calificar"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onClaseChange(e.value)}
            loading={cargandoClases}
            disabled={!anioSeleccionado || cargandoClases || clases.length === 0}
            placeholder={
              !anioSeleccionado
                ? 'Selecciona primero un año...'
                : clases.length === 0 && !cargandoClases
                ? 'No hay clases en este año'
                : 'Selecciona una clase...'
            }
            emptyMessage="No hay clases disponibles en este año escolar"
            filter
            className="w-full"
          />
        </div>

        {/* 3. Selector de Versión dependiente de la Clase */}
        <div className="col-12 md:col-4">
          <label htmlFor="selector-version-calificar" className="block text-900 font-semibold mb-2 text-sm">
            Versión (Actividad) <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="selector-version-calificar"
            value={versionSeleccionadaId}
            options={versiones}
            onChange={(e) => onVersionChange(e.value)}
            optionLabel="etiqueta"
            optionValue="id_version"
            loading={cargandoVersiones}
            disabled={!claseSeleccionadaId || cargandoVersiones || versiones.length === 0}
            placeholder={
              !claseSeleccionadaId
                ? 'Selecciona primero una clase...'
                : versiones.length === 0 && !cargandoVersiones
                ? 'No hay versiones en esta clase'
                : 'Selecciona una versión...'
            }
            filter
            filterBy="etiqueta,nombrePractica,numeroVersion,evaluacionNombre"
            itemTemplate={plantillaItemVersion}
            valueTemplate={plantillaValorVersion}
            emptyMessage="No hay versiones disponibles para esta clase."
            emptyFilterMessage="No se encontraron versiones coincidentes."
            className="w-full"
          />
        </div>

        {/* 4. Botón de refresco manual */}
        <div className="col-12 md:col-1 flex justify-content-end align-items-center mt-2 md:mt-0">
          <Button
            type="button"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            onClick={onRecargar}
            tooltip="Refrescar catálogos y calificaciones"
            tooltipOptions={{ position: 'top' }}
            className="w-full md:w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosCalificar;
