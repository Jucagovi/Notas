import React from 'react';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';
import BotonAccion from '../common/BotonAccion.jsx';

/**
 * FiltrosPesos - Componente presentacional para la selección de clase y acciones sobre ponderaciones.
 *
 * Responsabilidad Única: Renderizar el selector de Clase utilizando el componente común
 * estandarizado y los botones de acción en una sola fila proporcionada a la derecha del desplegable.
 *
 * @param {Object} props
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase activa.
 * @param {Function} props.onClaseChange - Manejador de selección de clase.
 * @param {Array<Object>} props.clases - Lista de clases del curso actual preparadas para el selector.
 * @param {boolean} [props.cargandoClases=false] - Indicador de carga del listado de clases.
 * @param {Function} props.onDistribuirEquitativo - Callback para ejecutar la distribución matemática equitativa.
 * @param {Function} props.onRestablecer - Callback para deshacer cambios no guardados.
 * @param {Function} props.onRecargar - Callback para recargar datos desde el servidor.
 * @param {Function} props.onGuardar - Callback para persistir los cambios.
 * @param {boolean} [props.cargando=false] - Indicador de carga de datos curriculares.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia en curso.
 * @param {boolean} [props.hayCambios=false] - Bandera indicadora de modificaciones locales no guardadas.
 * @param {number} [props.totalRA=0] - Total de Resultados de Aprendizaje listados.
 */
export const FiltrosPesos = ({
  claseSeleccionadaId,
  onClaseChange,
  clases = [],
  cargandoClases = false,
  onDistribuirEquitativo,
  onRestablecer,
  onRecargar,
  onGuardar,
  cargando = false,
  guardando = false,
  hayCambios = false,
  totalRA = 0
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="flex flex-column lg:flex-row lg:align-items-center justify-content-between gap-3">
        {/* Selector de Clase a la izquierda */}
        <div className="flex-1" style={{ maxWidth: '36rem' }}>
          <label htmlFor="selector-clase-pesos" className="font-semibold text-800 text-sm mb-1 block">
            Clase <span className="text-red-500">*</span>
          </label>
          <SelectorClase
            id="selector-clase-pesos"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onClaseChange(e.value)}
            loading={cargandoClases}
            disabled={cargando || guardando}
            placeholder="Seleccionar clase..."
            emptyMessage="No hay clases creadas en el curso académico actual (2026-2027)"
            className="w-full"
          />
        </div>

        {/* Botones de acción en una sola fila proporcionada a la derecha */}
        <div className="flex flex-row align-items-center justify-content-start lg:justify-content-end gap-2 flex-wrap sm:flex-nowrap pt-2 lg:pt-0">
          <Button
            type="button"
            icon="pi pi-sliders-h"
            label="Reparto Equitativo"
            severity="secondary"
            outlined
            size="small"
            onClick={onDistribuirEquitativo}
            disabled={!claseSeleccionadaId || cargando || guardando || totalRA === 0}
            tooltip="Distribuye el 100% equitativamente entre los RA y CE de la clase"
            tooltipOptions={{ position: 'top' }}
            className="white-space-nowrap"
          />

          <Button
            type="button"
            icon="pi pi-undo"
            label="Restablecer"
            severity="secondary"
            outlined
            size="small"
            onClick={onRestablecer}
            disabled={!claseSeleccionadaId || !hayCambios || cargando || guardando}
            tooltip="Descartar las modificaciones actuales y recargar los valores guardados"
            tooltipOptions={{ position: 'top' }}
            className="white-space-nowrap"
          />

          <Button
            type="button"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            size="small"
            onClick={onRecargar}
            disabled={!claseSeleccionadaId || cargando || guardando}
            tooltip="Recargar datos de la clase desde la base de datos"
            tooltipOptions={{ position: 'top' }}
          />

          <BotonAccion
            tipo="guardar"
            label={guardando ? 'Guardando...' : 'Guardar Ponderación'}
            icon={guardando ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            onClick={onGuardar}
            disabled={!claseSeleccionadaId || cargando || guardando}
            className="white-space-nowrap p-button-sm"
            tooltip={
              hayCambios
                ? 'Existen cambios pendientes de guardar en la clase'
                : 'Guardar la ponderación actual de la clase'
            }
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosPesos;
