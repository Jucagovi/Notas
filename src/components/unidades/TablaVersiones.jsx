import React, { useState, useMemo } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

/**
 * TablaVersiones - Componente presentacional para la columna tabular de Versiones de las prácticas.
 *
 * Responsabilidad Única: Renderizar el listado tabular de las versiones con los filtros de cabecera
 * separados para permitir espacio visual, mostrando el nombre de la versión como texto sin Tag y
 * disponiendo los botones de asignación a UT en una fila inferior con comportamiento de conmutación.
 *
 * @param {Object} props
 * @param {Array<Object>} props.versiones - Listado de versiones asociadas a la clase.
 * @param {Array<Object>} props.unidades - Listado de unidades de trabajo disponibles para asignación.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onAsignarUT - Callback invocado al pulsar un número de UT para asignar o desasignar.
 */
const TablaVersiones = ({
  versiones = [],
  unidades = [],
  cargando = false,
  onAsignarUT
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas', 'huerfanas', 'asignadas'

  // Mapa asociativo id_ut -> unidad para búsquedas ágiles de nombres y números de UT.
  const mapaUnidades = useMemo(() => {
    const mapa = new Map();
    unidades.forEach((ut) => {
      mapa.set(ut.id_ut, ut);
    });
    return mapa;
  }, [unidades]);

  // Filtrado reactivo de versiones según el texto de búsqueda y el filtro de asignación.
  const versionesFiltradas = useMemo(() => {
    return (versiones || []).filter((v) => {
      // 1. Filtro por estado de asignación
      if (filtroEstado === 'huerfanas' && v.id_ut) return false;
      if (filtroEstado === 'asignadas' && !v.id_ut) return false;

      // 2. Filtro textual por nombre de práctica, versión o nombre de la UT
      if (!terminoBusqueda.trim()) return true;
      const busqueda = terminoBusqueda.toLowerCase();
      const nombrePractica = (v.Practicas?.nombre || '').toLowerCase();
      const numeroVersion = (v.numero || '').toLowerCase();
      const utAsignada = v.id_ut ? (mapaUnidades.get(v.id_ut)?.nombre || '').toLowerCase() : '';
      return (
        nombrePractica.includes(busqueda) ||
        numeroVersion.includes(busqueda) ||
        utAsignada.includes(busqueda)
      );
    });
  }, [versiones, filtroEstado, terminoBusqueda, mapaUnidades]);

  // Manejador del clic en el botón de una UT con comportamiento conmutador (asignar/desasignar).
  const manejarClickUT = (idVersion, idUtPulsada, estaAsignada) => {
    if (!onAsignarUT) return;
    // Si se pulsa una vez se asigna; si se vuelve a pulsar la misma UT, se desasigna.
    if (estaAsignada) {
      onAsignarUT(idVersion, null);
    } else {
      onAsignarUT(idVersion, idUtPulsada);
    }
  };

  if (!cargando && versiones.length === 0) {
    return (
      <div className="surface-card border-round border-1 surface-border p-3 shadow-1 h-full flex flex-column justify-content-center">
        <EstadoVacio
          mensaje="No hay actividades planificadas"
          descripcion="No se han registrado versiones de prácticas para esta clase y módulo."
          icono="pi pi-file"
          className="w-full my-0"
        />
      </div>
    );
  }

  // Plantilla de fila con fila superior (versión y nombre como texto plano) y fila inferior (botones de asignación).
  const plantillaVersionYAsignacion = (fila) => {
    const nombrePractica = fila.Practicas?.nombre || 'Práctica sin título';
    const etiquetaVersion = fila.numero ? `V${fila.numero}` : 'V1';
    const utAsignada = mapaUnidades.get(fila.id_ut);
    const etiquetaUT = utAsignada ? formatearNumeroUT(utAsignada.numero) : null;

    return (
      <div className="flex flex-column gap-2 py-1 w-full overflow-hidden">
        {/* Fila superior: Nombre de versión como texto (sin Tag) y nombre de la práctica */}
        <div className="flex align-items-center justify-content-between gap-2 w-full">
          <div className="flex align-items-center gap-2 overflow-hidden flex-grow-1 min-w-0">
            {/* Nombre de la versión renderizado estrictamente como texto */}
            <span className="font-bold text-sm text-primary font-mono flex-shrink-0">
              {etiquetaVersion}
            </span>
            <span className="text-400 font-bold">•</span>
            <span
              className="linea-truncada font-semibold text-900 text-sm"
              title={nombrePractica}
            >
              {nombrePractica}
            </span>
          </div>

          {/* Insignia indicadora de la UT a la que está asignada */}
          <div className="flex-shrink-0">
            {etiquetaUT ? (
              <Tag
                severity="success"
                value={etiquetaUT}
                className="text-xs font-mono font-bold"
                title={`Asignada a ${etiquetaUT}: ${utAsignada?.nombre || ''}`}
              />
            ) : (
              <Tag
                severity="warning"
                value="Sin asignar"
                className="text-xs"
              />
            )}
          </div>
        </div>

        {/* Fila inferior: Botones para asignar/desasignar a una UT al pulsar sobre su número */}
        <div className="flex align-items-center gap-1 flex-wrap pt-1 border-top-1 surface-border">
          <span className="text-xs text-color-secondary font-semibold mr-1">
            Asignar a UT:
          </span>
          {(!unidades || unidades.length === 0) ? (
            <span className="text-400 font-italic text-xs">
              No hay unidades creadas
            </span>
          ) : (
            unidades.map((ut) => {
              const etiqueta = formatearNumeroUT(ut.numero);
              const estaAsignada = fila.id_ut === ut.id_ut;

              return (
                <Button
                  key={ut.id_ut}
                  label={etiqueta}
                  icon={estaAsignada ? 'pi pi-check' : undefined}
                  size="small"
                  outlined={!estaAsignada}
                  severity={estaAsignada ? 'primary' : 'secondary'}
                  className="p-button-xs py-1 px-2 text-xs font-mono font-bold"
                  onClick={() => manejarClickUT(fila.id_version, ut.id_ut, estaAsignada)}
                  tooltip={
                    estaAsignada
                      ? `Asignada a ${etiqueta}. Pulsa de nuevo para desasignar.`
                      : `Pulsa para asignar a ${etiqueta}: ${ut.nombre}`
                  }
                  tooltipOptions={{ position: 'top' }}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="surface-card border-round border-1 surface-border p-3 shadow-1 h-full w-full overflow-hidden">
      {/* 1. Primera fila de la cabecera: Título "Versiones de las prácticas" */}
      <div className="flex align-items-center justify-content-between mb-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-file text-primary font-bold" />
          <h3 className="text-base font-bold text-900 m-0">Versiones de las prácticas</h3>
        </div>
        <span className="text-xs text-color-secondary font-semibold">
          {versionesFiltradas.length} {versionesFiltradas.length === 1 ? 'versión' : 'versiones'}
        </span>
      </div>

      {/* 2. Segunda fila de la cabecera: Filtros separados con espacio visual y buscador */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 mb-3">
        {/* Botones de filtro de estado separados para permitir espacio visual */}
        <div className="flex align-items-center gap-2 flex-wrap">
          <Button
            label="Todas"
            size="small"
            outlined={filtroEstado !== 'todas'}
            severity={filtroEstado === 'todas' ? 'primary' : 'secondary'}
            className="p-button-sm text-xs px-3"
            onClick={() => setFiltroEstado('todas')}
          />
          <Button
            label="Sin asignar"
            size="small"
            outlined={filtroEstado !== 'huerfanas'}
            severity={filtroEstado === 'huerfanas' ? 'warning' : 'secondary'}
            className="p-button-sm text-xs px-3"
            onClick={() => setFiltroEstado('huerfanas')}
          />
          <Button
            label="Asignadas"
            size="small"
            outlined={filtroEstado !== 'asignadas'}
            severity={filtroEstado === 'asignadas' ? 'success' : 'secondary'}
            className="p-button-sm text-xs px-3"
            onClick={() => setFiltroEstado('asignadas')}
          />
        </div>

        {/* Buscador de texto adaptado al ancho */}
        <span className="p-input-icon-left w-full sm:w-auto">
          <i className="pi pi-search text-xs" />
          <InputText
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar práctica..."
            className="p-inputtext-sm w-full sm:w-13rem"
          />
        </span>
      </div>

      {/* Listado tabular de versiones con paginación superior obligatoria */}
      <TablaBase
        value={versionesFiltradas}
        loading={cargando}
        paginator={true}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se encontraron versiones coincidentes."
        className="p-datatable-sm w-full"
      >
        <Column
          header="Prácticas y Versiones"
          body={plantillaVersionYAsignacion}
          style={{ minWidth: '200px' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaVersiones;
