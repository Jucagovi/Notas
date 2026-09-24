import React from 'react';
import { InputText } from 'primereact/inputtext';
import SelectorModulo from '../common/SelectorModulo.jsx';

/**
 * FiltrosTaller - Componente presentacional para la barra superior de selección y búsqueda del taller de prácticas.
 *
 * Responsabilidad Única: Renderizar los controles de filtrado por módulo profesional,
 * el cuadro de búsqueda en tiempo real y los indicadores estadísticos del repositorio.
 *
 * @param {Object} props
 * @param {Array<Object>} props.modulos - Lista de módulos disponibles en el sistema.
 * @param {string|null} props.moduloSeleccionadoId - Identificador del módulo activo.
 * @param {Function} props.onCambioModulo - Callback ejecutado al seleccionar un módulo.
 * @param {boolean} [props.cargandoModulos=false] - Indicador de estado de carga de módulos.
 * @param {string} props.terminoBusqueda - Texto actual introducido en el buscador.
 * @param {Function} props.onCambioBusqueda - Callback ejecutado al escribir en el buscador.
 * @param {number} props.totalPracticas - Conteo total de prácticas para el filtro actual.
 * @param {number} props.totalVersiones - Conteo de versiones de la práctica seleccionada.
 */
export const FiltrosTaller = ({
  modulos = [],
  moduloSeleccionadoId = null,
  onCambioModulo,
  cargandoModulos = false,
  terminoBusqueda = '',
  onCambioBusqueda,
  totalPracticas = 0,
  totalVersiones = 0
}) => {
  return (
    <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 mb-3">
      <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        {/* Selector de módulo profesional obligatorio */}
        <div className="flex flex-column sm:flex-row sm:align-items-center gap-2 flex-grow-1">
          <label className="text-sm font-semibold text-700 white-space-nowrap">
            Módulo Formativo:
          </label>
          <div className="w-full sm:w-20rem">
            <SelectorModulo
              value={moduloSeleccionadoId}
              options={modulos}
              onChange={(e) => onCambioModulo(e.value)}
              loading={cargandoModulos}
              placeholder="Todos los módulos..."
              className="w-full"
            />
          </div>
        </div>

        {/* Buscador de texto y badges de estadísticas */}
        <div className="flex align-items-center gap-3 flex-wrap">
          <span className="p-input-icon-left w-full sm:w-16rem">
            <i className="pi pi-search text-400" />
            <InputText
              value={terminoBusqueda}
              onChange={(e) => onCambioBusqueda(e.target.value)}
              placeholder="Buscar práctica..."
              className="w-full p-inputtext-sm"
            />
          </span>

          <div className="flex align-items-center gap-2">
            <span
              className="inline-flex align-items-center px-2 py-1 border-round surface-100 text-700 text-xs font-semibold"
              title="Total de prácticas registradas en el catálogo actual"
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
