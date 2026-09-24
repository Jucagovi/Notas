import React, { useState } from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import TarjetaActividad from './TarjetaActividad.jsx';

/**
 * TarjetaUnidadTrabajo - Componente presentacional interactivo para representar una Unidad de Trabajo (UT).
 *
 * Responsabilidad Única: Renderizar los datos descriptivos de la unidad didáctica,
 * la lista de actividades asignadas con sus ranuras Swapy y la zona de soltado (dropzone) activa.
 *
 * @param {Object} props
 * @param {Object} props.unidad - Objeto de la unidad de trabajo con sus versiones asignadas.
 * @param {Function} props.onEditar - Manejador para abrir el diálogo de edición.
 * @param {Function} props.onEliminar - Manejador para disparar la confirmación de eliminación.
 * @param {Function} props.onDesvincularActividad - Callback para desvincular una actividad.
 * @param {Array<Object>} [props.unidadesDisponibles=[]] - Lista global de UTs para reasignaciones.
 * @param {Function} [props.onAsignarUT] - Callback para asignar una actividad a una UT.
 */
const TarjetaUnidadTrabajo = ({
  unidad,
  onEditar,
  onEliminar,
  onDesvincularActividad,
  unidadesDisponibles = [],
  onAsignarUT
}) => {
  const [arrastrandoSobre, setArrastrandoSobre] = useState(false);

  const versiones = unidad.versiones || [];
  const cantidadActividades = versiones.length;

  // Manejador del arrastre nativo sobre la zona de soltado de la unidad didáctica.
  const manejarDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!arrastrandoSobre) {
      setArrastrandoSobre(true);
    }
  };

  const manejarDragLeave = () => {
    setArrastrandoSobre(false);
  };

  // Manejador del soltado nativo para compatibilidad directa.
  const manejarDrop = (e) => {
    e.preventDefault();
    setArrastrandoSobre(false);
    const idVersion = e.dataTransfer.getData('text/plain');
    if (idVersion && typeof onAsignarUT === 'function') {
      onAsignarUT(idVersion, unidad.id_ut);
    }
  };

  return (
    <div className="tarjeta-ut">
      {/* Cabecera de la Unidad de Trabajo */}
      <div className="tarjeta-ut-header flex align-items-center justify-content-between gap-2">
        <div className="flex align-items-center gap-2 overflow-hidden flex-1 min-w-0">
          <span className="font-bold text-base text-primary flex-shrink-0">
            UT {unidad.numero}
          </span>
          <span
            className="font-semibold text-sm text-900 linea-truncada"
            title={unidad.nombre}
          >
            {unidad.nombre}
          </span>
        </div>

        <div className="flex align-items-center gap-1 flex-shrink-0">
          <Tag
            value={`${cantidadActividades} act.`}
            severity={cantidadActividades > 0 ? 'success' : 'secondary'}
            className="text-xs"
          />

          <Button
            icon="pi pi-pencil"
            rounded
            text
            size="small"
            severity="secondary"
            className="w-1.75rem h-1.75rem p-0"
            onClick={() => onEditar(unidad)}
            tooltip="Modificar datos de la unidad."
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            icon="pi pi-trash"
            rounded
            text
            size="small"
            severity="danger"
            className="w-1.75rem h-1.75rem p-0"
            onClick={() => onEliminar(unidad)}
            tooltip="Eliminar unidad de trabajo (las actividades quedarán huérfanas)."
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Cuerpo de la tarjeta con descripción y ranuras Swapy */}
      <div className="tarjeta-ut-body">
        {unidad.descripcion && (
          <p
            className="text-xs text-color-secondary m-0 linea-truncada mb-2"
            title={unidad.descripcion}
          >
            {unidad.descripcion}
          </p>
        )}

        {/* Listado de actividades asignadas a la unidad */}
        <div className="lista-actividades-ut">
          {versiones.map((v) => (
            <div
              key={v.id_version}
              data-swapy-slot={`slot-ut_${unidad.id_ut}_ver_${v.id_version}`}
              className="w-full"
            >
              <TarjetaActividad
                version={v}
                esHuerfana={false}
                unidadesDisponibles={unidadesDisponibles}
                onAsignarUT={onAsignarUT}
                onDesvincular={onDesvincularActividad}
              />
            </div>
          ))}
        </div>

        {/* Zona receptora de soltado (Drop Zone) para Swapy y eventos nativos */}
        <div
          data-swapy-slot={`slot-ut-dropzone_${unidad.id_ut}`}
          onDragOver={manejarDragOver}
          onDragLeave={manejarDragLeave}
          onDrop={manejarDrop}
          className={`dropzone-ut mt-auto ${arrastrandoSobre ? 'drop-highlight' : ''}`}
        >
          <i className="pi pi-plus-circle text-sm" />
          <span>Arrastra una actividad aquí</span>
        </div>
      </div>
    </div>
  );
};

export default TarjetaUnidadTrabajo;
