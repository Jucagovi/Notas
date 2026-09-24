import React from 'react';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';
import BotonAccion from '../common/BotonAccion.jsx';

/**
 * FiltrosCurriculo - Componente presentacional para la selección de clase y disparadores de acciones.
 *
 * Responsabilidad Única: Renderizar el selector de clase y los botones de acción principales
 * con espaciados homogéneos, omitiendo información redundante del módulo ya implícito en la clase.
 *
 * @param {Object} props
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase activa.
 * @param {Function} props.onClaseChange - Manejador de cambio de clase.
 * @param {Array<Object>} props.clases - Listado consolidado de clases disponibles.
 * @param {boolean} props.cargandoClases - Estado de carga de clases.
 * @param {Function} props.onNuevaUT - Manejador para abrir el diálogo de nueva UT.
 * @param {Function} props.onRecargar - Manejador para refrescar los datos curriculares.
 * @param {boolean} props.cargando - Estado de carga general.
 * @param {number} props.totalUTs - Total de unidades de trabajo existentes.
 * @param {number} props.totalHuerfanas - Total de actividades sin asignar.
 * @param {number} props.totalVersiones - Total de actividades registradas.
 */
const FiltrosCurriculo = ({
  claseSeleccionadaId,
  onClaseChange,
  clases = [],
  cargandoClases = false,
  onNuevaUT,
  onRecargar,
  cargando = false,
  totalUTs = 0,
  totalHuerfanas = 0,
  totalVersiones = 0
}) => {
  return (
    <div className="surface-card border-round border-1 surface-border p-3 mb-4 shadow-1">
      <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
        {/* Bloque del selector de Clase */}
        <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-3 flex-1">
          <div className="w-full sm:w-28rem">
            <label className="block text-xs font-semibold text-color-secondary mb-1">
              Clase
            </label>
            <SelectorClase
              value={claseSeleccionadaId}
              options={clases}
              onChange={(e) => onClaseChange(e.value)}
              loading={cargandoClases}
              placeholder="Seleccionar clase..."
              className="w-full"
            />
          </div>
        </div>

        {/* Bloque de acciones a la derecha con margen homogéneo entre botones */}
        <div className="flex align-items-center justify-content-end gap-2 flex-wrap">
          {/* Botón para crear una nueva unidad de trabajo */}
          <Button
            label="Nueva Unidad"
            icon="pi pi-plus"
            severity="primary"
            onClick={onNuevaUT}
            disabled={!claseSeleccionadaId || cargando}
            tooltip={!claseSeleccionadaId ? 'Selecciona una clase previamente.' : 'Añadir nueva unidad didáctica.'}
            tooltipOptions={{ position: 'top' }}
          />

          {/* Botón para refrescar los datos con separación uniforme */}
          <BotonAccion
            tipo="cancelar"
            label=""
            icon="pi pi-refresh"
            onClick={onRecargar}
            disabled={cargando}
            tooltip="Actualizar datos curriculares."
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Resumen numérico informativo de la selección actual */}
      {claseSeleccionadaId && (
        <div className="flex align-items-center gap-3 mt-3 pt-2 border-top-1 surface-border text-xs text-color-secondary flex-wrap">
          <span className="flex align-items-center gap-1">
            <i className="pi pi-folder text-primary" />
            <span>Unidades de Trabajo:</span>
            <strong className="text-900">{totalUTs}</strong>
          </span>
          <span>•</span>
          <span className="flex align-items-center gap-1">
            <i className="pi pi-file text-primary" />
            <span>Total Actividades:</span>
            <strong className="text-900">{totalVersiones}</strong>
          </span>
          <span>•</span>
          <span className="flex align-items-center gap-1">
            <i className="pi pi-exclamation-circle text-orange-500" />
            <span>Sin asignar a UT:</span>
            <strong className={totalHuerfanas > 0 ? 'text-orange-500 font-bold' : 'text-900'}>
              {totalHuerfanas}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default FiltrosCurriculo;
