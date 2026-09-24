import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosTaller - Componente presentacional para la barra superior de selección y búsqueda del taller de prácticas.
 *
 * Responsabilidad Única: Renderizar los controles de filtrado por año académico y clase (que encapsula el módulo),
 * el cuadro de búsqueda en tiempo real y los indicadores estadísticos del repositorio.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Listado de años académicos con formato completo (ej. 2026/2027).
 * @param {number|string|null} props.anioSeleccionado - Año académico activo para el filtrado.
 * @param {Function} props.onCambioAnio - Callback ejecutado al cambiar de año académico.
 * @param {Array<Object>} props.clases - Lista de clases disponibles para el año seleccionado.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase activa.
 * @param {Function} props.onCambioClase - Callback ejecutado al seleccionar una clase.
 * @param {boolean} [props.cargandoClases=false] - Indicador de estado de carga de las clases.
 * @param {string} props.terminoBusqueda - Texto actual introducido en el buscador.
 * @param {Function} props.onCambioBusqueda - Callback ejecutado al escribir en el buscador.
 * @param {number} props.totalPracticas - Conteo total de prácticas para el filtro actual.
 * @param {number} props.totalVersiones - Conteo de versiones de la práctica seleccionada.
 */
export const FiltrosTaller = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  cargandoClases = false,
  terminoBusqueda = '',
  onCambioBusqueda,
  totalPracticas = 0,
  totalVersiones = 0
}) => {
  return (
    <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 mb-3">
      <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
        {/* Controles de selección: Año Académico y Clase */}
        <div className="flex flex-column sm:flex-row sm:align-items-center gap-3 flex-grow-1 flex-wrap">
          {/* Selector de Año Académico delante del selector de clase */}
          <div className="flex align-items-center gap-2">
            <label htmlFor="selector-anio-academico" className="text-sm font-semibold text-700 white-space-nowrap">
              Año Académico:
            </label>
            <div className="w-10rem sm:w-11rem">
              <Dropdown
                id="selector-anio-academico"
                value={anioSeleccionado}
                options={anios}
                onChange={(e) => onCambioAnio && onCambioAnio(e.value)}
                placeholder="Año escolar..."
                className="w-full"
              />
            </div>
          </div>

          {/* Selector de Clase que sustituye al anterior selector de módulo */}
          <div className="flex align-items-center gap-2 flex-grow-1 min-w-16rem max-w-30rem">
            <label htmlFor="selector-clase-taller" className="text-sm font-semibold text-700 white-space-nowrap">
              Clase:
            </label>
            <div className="w-full">
              <SelectorClase
                id="selector-clase-taller"
                value={claseSeleccionadaId}
                options={clases}
                onChange={(e) => onCambioClase && onCambioClase(e.value)}
                loading={cargandoClases}
                placeholder="Seleccione una clase..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Buscador de texto y badges de estadísticas */}
        <div className="flex align-items-center gap-3 flex-wrap">
          <span className="p-input-icon-left w-full sm:w-16rem">
            <i className="pi pi-search text-400" />
            <InputText
              value={terminoBusqueda}
              onChange={(e) => onCambioBusqueda && onCambioBusqueda(e.target.value)}
              placeholder="Buscar práctica..."
              className="w-full p-inputtext-sm"
            />
          </span>

          <div className="flex align-items-center gap-2">
            <span
              className="inline-flex align-items-center px-2 py-1 border-round surface-100 text-700 text-xs font-semibold"
              title="Total de prácticas registradas en el catálogo de esta clase"
            >
              <i className="pi pi-book mr-1 text-primary text-xs" />
              {totalPracticas} {totalPracticas === 1 ? 'práctica' : 'prácticas'}
            </span>

            {totalVersiones > 0 && (
              <span
                className="inline-flex align-items-center px-2 py-1 border-round surface-100 text-700 text-xs font-semibold"
                title="Versiones registradas para la práctica activa"
              >
                <i className="pi pi-code mr-1 text-teal-600 text-xs" />
                {totalVersiones} {totalVersiones === 1 ? 'versión' : 'versiones'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosTaller;

