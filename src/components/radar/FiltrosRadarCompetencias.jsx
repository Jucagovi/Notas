import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';
import SelectorDiscente from '../common/SelectorDiscente.jsx';

/**
 * FiltrosRadarCompetencias - Subcomponente presentacional para los filtros en cascada del radar.
 *
 * Responsabilidad Única: Renderizar la barra de filtros contextuales (Año Académico -> Clase -> Discente)
 * habilitando secuencialmente cada desplegable conforme el usuario efectúa su selección y tratando
 * los cursos conceptualmente como clases.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Catálogo de años académicos disponibles [{ label: '2026/2027', value: 2026 }].
 * @param {number|string|null} props.anioSeleccionado - Año escolar seleccionado (por defecto el más reciente).
 * @param {Function} props.onCambioAnio - Callback al cambiar el año académico.
 * @param {Array<Object>} props.clases - Lista de clases del año ordenadas de más reciente a más antigua.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase seleccionada (espera acción del usuario).
 * @param {Function} props.onCambioClase - Callback al seleccionar una clase.
 * @param {Array<Object>} props.discentes - Lista de discentes matriculados en la clase seleccionada.
 * @param {string|null} props.discenteId - Identificador del discente seleccionado.
 * @param {Function} props.onCambioDiscente - Callback al seleccionar un discente.
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 * @param {Function} [props.onRecargar] - Manejador para refrescar los datos.
 */
export const FiltrosRadarCompetencias = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  discentes = [],
  discenteId = null,
  onCambioDiscente,
  cargando = false,
  onRecargar
}) => {
  return (
    <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1 mb-4">
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-filter text-primary text-xl" />
          <div>
            <h2 className="text-base md:text-lg font-bold text-900 m-0">Filtros de Contexto</h2>
            <span className="text-xs text-color-secondary">
              Selección jerárquica para generar el informe de la clase
            </span>
          </div>
        </div>

        {onRecargar && (
          <Button
            icon="pi pi-refresh"
            label="Actualizar"
            outlined
            size="small"
            onClick={onRecargar}
            loading={cargando}
            tooltip="Recargar datos de la clase"
            tooltipOptions={{ position: 'left' }}
            className="p-button-secondary text-xs align-self-end md:align-self-auto"
          />
        )}
      </div>

      <div className="grid">
        {/* Selector 1: Año Académico (obtenido de la tabla cursos y preseleccionado por defecto) */}
        <div className="col-12 md:col-3">
          <label className="block text-900 font-medium mb-2 text-sm">
            1. Año Académico <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio && onCambioAnio(e.value)}
            loading={cargando && anios.length === 0}
            placeholder="Selecciona año académico..."
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Selector 2: Clase (Curso / Módulo) - Ordenadas de más reciente a más antigua */}
        <div className="col-12 md:col-5">
          <label className="block text-900 font-medium mb-2 text-sm">
            2. Clase <span className="text-red-500">*</span>
          </label>
          <SelectorClase
            value={claseSeleccionadaId}
            options={clases}
            onChange={(e) => onCambioClase && onCambioClase(e.value)}
            disabled={!anioSeleccionado || clases.length === 0}
            loading={cargando && !!anioSeleccionado && clases.length === 0}
            placeholder={
              !anioSeleccionado
                ? 'Elige primero un año académico'
                : clases.length === 0
                ? 'Sin clases en este año académico'
                : 'Selecciona una clase...'
            }
            filter
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Selector 3: Discente (Alumno) - Habilitado solo tras elegir clase */}
        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2 text-sm">
            3. Discente (Alumno) <span className="text-red-500">*</span>
          </label>
          <SelectorDiscente
            value={discenteId}
            options={discentes}
            onChange={(e) => onCambioDiscente && onCambioDiscente(e.value)}
            disabled={!claseSeleccionadaId}
            loading={cargando && !!claseSeleccionadaId && discentes.length === 0}
            placeholder={
              !claseSeleccionadaId
                ? 'Elige primero una clase'
                : discentes.length === 0
                ? 'No hay discentes en esta clase'
                : 'Selecciona discente...'
            }
            className="w-full p-inputtext-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosRadarCompetencias;
