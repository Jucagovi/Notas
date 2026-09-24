import React, { useRef } from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';

/**
 * TarjetaActividad - Componente presentacional interactivo para representar una actividad (versión).
 *
 * Responsabilidad Única: Renderizar la información de la práctica con atributos Swapy
 * e interactividad de arrastre, ofreciendo además opciones rápidas de asignación y desvinculación.
 *
 * @param {Object} props
 * @param {Object} props.version - Objeto con los datos de la versión y práctica asociada.
 * @param {boolean} [props.esHuerfana=false] - Indica si la actividad carece de unidad asignada.
 * @param {Array<Object>} [props.unidadesDisponibles=[]] - Lista de unidades de trabajo para asignación rápida.
 * @param {Function} [props.onAsignarUT] - Callback para asignar a una unidad específica.
 * @param {Function} [props.onDesvincular] - Callback para devolver la actividad al estado huérfano.
 */
const TarjetaActividad = ({
  version,
  esHuerfana = false,
  unidadesDisponibles = [],
  onAsignarUT,
  onDesvincular
}) => {
  const menuAsignacionRef = useRef(null);

  const nombrePractica = version.Practicas?.nombre || 'Práctica';
  const numeroVersion = version.numero ? `V${version.numero}` : 'V1';
  const enunciado = version.enunciado || version.Practicas?.descripcion || '';

  // Se construyen las opciones del menú contextual para asignación rápida a una unidad didáctica.
  const elementosMenuAsignacion = unidadesDisponibles.map((ut) => ({
    label: `UT ${ut.numero}: ${ut.nombre}`,
    icon: 'pi pi-folder',
    command: () => {
      if (typeof onAsignarUT === 'function') {
        onAsignarUT(version.id_version, ut.id_ut);
      }
    }
  }));

  // Manejador del inicio de arrastre nativo para compatibilidad complementaria con HTML5.
  const manejarDragStart = (e) => {
    e.dataTransfer.setData('text/plain', version.id_version);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      data-swapy-item={`version_${version.id_version}`}
      draggable="true"
      onDragStart={manejarDragStart}
      className={`tarjeta-actividad ${esHuerfana ? 'actividad-huerfana' : ''}`}
    >
      {/* Menú emergente de asignación directa */}
      <Menu
        model={elementosMenuAsignacion}
        popup
        ref={menuAsignacionRef}
        id={`menu_asignar_${version.id_version}`}
      />

      {/* Cabecera de la tarjeta con asa de arrastre, título y etiquetas */}
      <div className="flex align-items-center justify-content-between gap-2 w-full">
        <div className="flex align-items-center gap-2 overflow-hidden flex-1 min-w-0">
          <i
            data-swapy-handle
            className="pi pi-bars actividad-drag-handle"
            title="Arrastra para mover a otra unidad o al panel de huérfanas."
          />
          <span
            className="font-semibold text-sm text-900 linea-truncada"
            title={nombrePractica}
          >
            {nombrePractica}
          </span>
        </div>

        <div className="flex align-items-center gap-1 flex-shrink-0">
          <Tag
            value={numeroVersion}
            severity={esHuerfana ? 'warning' : 'info'}
            className="text-xs"
          />

          {/* Botón de desvinculación si está asignada a una unidad */}
          {!esHuerfana && onDesvincular && (
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              size="small"
              className="w-1.5rem h-1.5rem p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDesvincular(version.id_version);
              }}
              tooltip="Desvincular de esta unidad didáctica."
              tooltipOptions={{ position: 'top' }}
            />
          )}

          {/* Botón de asignación directa si la actividad es huérfana */}
          {esHuerfana && unidadesDisponibles.length > 0 && onAsignarUT && (
            <Button
              icon="pi pi-arrow-right"
              rounded
              text
              severity="success"
              size="small"
              className="w-1.5rem h-1.5rem p-0"
              onClick={(e) => {
                e.stopPropagation();
                menuAsignacionRef.current?.toggle(e);
              }}
              tooltip="Asignar rápidamente a una unidad didáctica."
              tooltipOptions={{ position: 'left' }}
            />
          )}
        </div>
      </div>

      {/* Descripción o enunciado de la práctica truncado con tooltip informativo */}
      {enunciado && (
        <p
          className="text-xs text-color-secondary m-0 linea-truncada"
          title={enunciado}
        >
          {enunciado}
        </p>
      )}

      {/* Información complementaria de peso evaluable si existe */}
      {version.peso_evaluacion > 0 && (
        <div className="flex align-items-center gap-1 text-xs text-color-secondary mt-1">
          <i className="pi pi-percentage text-xs" />
          <span>Peso evaluable: <strong>{version.peso_evaluacion}%</strong></span>
        </div>
      )}
    </div>
  );
};

export default TarjetaActividad;
