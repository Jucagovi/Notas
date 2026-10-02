import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';
import BadgeModuloFlexibilizado from './BadgeModuloFlexibilizado.jsx';

/**
 * FiltrosTemporizacion - Barra de selección y acciones para la temporización de la clase.
 *
 * Responsabilidad Única: Renderizar los selectores de Año Académico y Clase (que encapsula el módulo),
 * así como los botones de control para refrescar y restablecer el orden curricular.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Listado de años académicos con nombre completo (ej. 2026/2027).
 * @param {number|string|null} props.anioSeleccionado - Año escolar seleccionado actualmente.
 * @param {Function} props.onAnioChange - Manejador de cambio de año académico.
 * @param {boolean} [props.cargandoAnios=false] - Indicador de carga de años académicos.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase activa.
 * @param {Function} props.onClaseChange - Manejador de cambio de clase.
 * @param {Array<Object>} props.clases - Listado de clases pertenecientes al año académico seleccionado.
 * @param {boolean} [props.cargandoClases=false] - Indicador de carga de clases.
 * @param {Function} props.onRecargar - Callback para recargar los datos.
 * @param {Function} props.onRestablecerOrden - Callback para restablecer el orden original.
 * @param {Function} props.onAbrirPropuesta - Callback para abrir el asistente de propuesta de temporización.
 * @param {boolean} [props.cargando=false] - Indicador de consulta de datos en progreso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia en progreso.
 * @param {number} [props.totalUnidades=0] - Cantidad total de unidades listadas.
 */
export const FiltrosTemporizacion = ({
  anios = [],
  anioSeleccionado = null,
  onAnioChange,
  cargandoAnios = false,
  claseSeleccionadaId = null,
  onClaseChange,
  clases = [],
  cargandoClases = false,
  onRecargar,
  onRestablecerOrden,
  onAbrirPropuesta,
  onBorrarTemporizacion,
  cargando = false,
  guardando = false,
  totalUnidades = 0
}) => {
  // Identificación de la clase activa para verificar su estado de flexibilización.
  const claseActual = clases.find((c) => c.id === claseSeleccionadaId) || null;
  const esFlexibilizado = Boolean(
    claseActual?.id_modulo_flexible || claseActual?.id_modulo_flexibilizado
  );

  return (
    <div className="surface-card p-3 border-round border-1 surface-border shadow-1 mb-4">
      {/* 1. Fila superior de selectores con dimensiones contenidas y estándar */}
      <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-3 flex-wrap">
        {/* Selector de Año Académico con ancho contenido */}
        <div className="w-full sm:w-14rem">
          <label htmlFor="selector-anio" className="block text-xs font-semibold text-color-secondary mb-1">
            Año Académico
          </label>
          <Dropdown
            id="selector-anio"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onAnioChange && onAnioChange(e.value)}
            loading={cargandoAnios}
            disabled={cargando || guardando}
            placeholder="Año escolar..."
            className="w-full"
          />
        </div>

        {/* Selector de Clase con ancho contenido */}
        <div className="w-full sm:w-26rem">
          <label htmlFor="selector-clase" className="block text-xs font-semibold text-color-secondary mb-1">
            Clase
          </label>
          <SelectorClase
            id="selector-clase"
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onClaseChange && onClaseChange(e.value)}
            loading={cargandoClases}
            disabled={cargando || guardando}
            placeholder="Seleccionar clase..."
            emptyMessage="No hay clases disponibles en este año académico"
            emptyFilterMessage="No se encontraron clases coincidentes"
            className="w-full"
          />
        </div>

        {/* Indicador visual destacado de flexibilización de módulos */}
        {esFlexibilizado && (
          <div className="flex align-items-end mt-1 sm:mt-3">
            <BadgeModuloFlexibilizado
              nombreModuloSecundario={claseActual?.moduloFlexibleNombre}
              siglasModuloSecundario={claseActual?.moduloFlexibleSiglas}
            />
          </div>
        )}
      </div>

      {/* 2. Fila inferior de botones con tamaño estándar y alineados a la derecha */}
      <div className="flex align-items-center justify-content-end gap-2 mt-3 pt-3 border-top-1 surface-border flex-wrap">
        <Button
          type="button"
          icon="pi pi-sparkles"
          label="Propuesta"
          severity="help"
          outlined
          size="small"
          onClick={onAbrirPropuesta}
          disabled={!claseSeleccionadaId || cargando || guardando || totalUnidades === 0}
          tooltip="Generar propuesta automática de fechas según peso de los RA, horario y calendario"
          tooltipOptions={{ position: 'top' }}
        />

        <Button
          type="button"
          icon="pi pi-refresh"
          label="Actualizar"
          severity="secondary"
          outlined
          size="small"
          onClick={onRecargar}
          loading={cargando}
          disabled={!claseSeleccionadaId || guardando}
          tooltip="Volver a consultar los datos desde la base de datos"
          tooltipOptions={{ position: 'top' }}
        />

        <Button
          type="button"
          icon="pi pi-sort-numeric-down"
          label="Restablecer"
          severity="secondary"
          outlined
          size="small"
          onClick={onRestablecerOrden}
          disabled={!claseSeleccionadaId || cargando || guardando || totalUnidades <= 1}
          tooltip="Volver a ordenar las unidades según su número curricular oficial"
          tooltipOptions={{ position: 'top' }}
        />

        <Button
          type="button"
          icon="pi pi-trash"
          label="Borrar Temporización"
          severity="danger"
          outlined
          size="small"
          onClick={onBorrarTemporizacion}
          disabled={!claseSeleccionadaId || cargando || guardando || totalUnidades === 0}
          tooltip="Eliminar por completo las fechas planificadas de esta clase"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    </div>
  );
};

export default FiltrosTemporizacion;
