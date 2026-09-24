import React, { useState, useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import TarjetaActividad from './TarjetaActividad.jsx';

/**
 * PanelActividadesHuerfanas - Componente presentacional interactivo para el panel de actividades sin asignar.
 *
 * Responsabilidad Única: Renderizar el panel lateral o fijo con las versiones cuyo campo id_ut es nulo,
 * ofreciendo filtrado en tiempo real, zonas Swapy de soltado y desvinculación interactiva.
 *
 * @param {Object} props
 * @param {Array<Object>} props.actividades - Listado de versiones huérfanas.
 * @param {Array<Object>} props.unidadesDisponibles - Listado de unidades de trabajo disponibles para asignación rápida.
 * @param {Function} props.onAsignarUT - Callback para asignar una actividad a una unidad didáctica.
 * @param {Function} props.onDesvincularActividad - Callback para desvincular una actividad de su unidad.
 */
const PanelActividadesHuerfanas = ({
  actividades = [],
  unidadesDisponibles = [],
  onAsignarUT,
  onDesvincularActividad
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [arrastrandoSobre, setArrastrandoSobre] = useState(false);

  // Filtrado reactivo de actividades huérfanas según el texto introducido en el buscador.
  const actividadesFiltradas = useMemo(() => {
    if (!filtroTexto.trim()) return actividades;
    const busqueda = filtroTexto.toLowerCase();
    return actividades.filter((act) => {
      const nombre = (act.Practicas?.nombre || '').toLowerCase();
      const version = (act.numero || '').toLowerCase();
      const enunciado = (act.enunciado || act.Practicas?.descripcion || '').toLowerCase();
      return (
        nombre.includes(busqueda) ||
        version.includes(busqueda) ||
        enunciado.includes(busqueda)
      );
    });
  }, [actividades, filtroTexto]);

  // Manejador del arrastre nativo sobre la zona de desvinculación.
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

  // Manejador del soltado nativo en la zona de desvinculación.
  const manejarDrop = (e) => {
    e.preventDefault();
    setArrastrandoSobre(false);
    const idVersion = e.dataTransfer.getData('text/plain');
    if (idVersion && typeof onDesvincularActividad === 'function') {
      onDesvincularActividad(idVersion);
    }
  };

  const total = actividades.length;

  return (
    <aside className="panel-huerfanas">
      {/* Cabecera del panel con título y contador */}
      <div className="panel-huerfanas-header flex align-items-center justify-content-between gap-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-inbox text-orange-500 font-bold" />
          <h2 className="font-bold text-sm text-900 m-0">Actividades Huérfanas</h2>
        </div>
        <Tag
          value={`${total} ${total === 1 ? 'actividad' : 'actividades'}`}
          severity={total > 0 ? 'warning' : 'success'}
          className="text-xs"
        />
      </div>

      <div className="p-3 border-bottom-1 surface-border">
        {/* Zona de soltado para desvincular actividades de sus UTs */}
        <div
          data-swapy-slot="slot-huerfanas-dropzone"
          onDragOver={manejarDragOver}
          onDragLeave={manejarDragLeave}
          onDrop={manejarDrop}
          className={`dropzone-desvincular ${arrastrandoSobre ? 'drop-highlight' : ''}`}
        >
          <i className="pi pi-undo text-sm" />
          <span>Arrastra aquí para desvincular</span>
        </div>

        {/* Campo de búsqueda y filtrado de actividades */}
        {total > 3 && (
          <div className="p-input-icon-left w-full">
            <i className="pi pi-search text-xs" />
            <InputText
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Buscar actividad..."
              className="p-inputtext-sm w-full"
            />
          </div>
        )}
      </div>

      {/* Lista de tarjetas de actividades huérfanas */}
      <div className="panel-huerfanas-list">
        {total === 0 ? (
          <div className="flex flex-column align-items-center justify-content-center text-center py-6 px-3">
            <i className="pi pi-check-circle text-green-500 text-3xl mb-2" />
            <span className="font-bold text-sm text-900 mb-1">
              Todas las actividades asignadas
            </span>
            <p className="text-xs text-color-secondary m-0">
              No existen prácticas huérfanas en este curso y módulo.
            </p>
          </div>
        ) : actividadesFiltradas.length === 0 ? (
          <div className="flex flex-column align-items-center justify-content-center text-center py-4">
            <i className="pi pi-filter-slash text-color-secondary text-2xl mb-2" />
            <span className="text-xs text-color-secondary">
              No coinciden actividades con la búsqueda.
            </span>
          </div>
        ) : (
          actividadesFiltradas.map((act) => (
            <div
              key={act.id_version}
              data-swapy-slot={`slot-huerfana_${act.id_version}`}
              className="w-full"
            >
              <TarjetaActividad
                version={act}
                esHuerfana={true}
                unidadesDisponibles={unidadesDisponibles}
                onAsignarUT={onAsignarUT}
              />
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default PanelActividadesHuerfanas;
