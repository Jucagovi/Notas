import React, { useState, useMemo } from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import {
  formatearFechaEspanol
} from '../../utils/fechas.js';
import {
  obtenerConfiguracionTipoEvento
} from '../../utils/coloreCalendario.js';

/**
 * TablaEventosCalendario - Subcomponente presentacional para la gestión tabular de los eventos del curso.
 *
 * Responsabilidad Única: Renderizar una tabla con paginación superior (5, 10, 15, 20, 25 elementos),
 * filtrado por texto, badges de tipo y estado lectivo, y acciones de edición y eliminación.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.eventos=[]] - Lista de eventos registrados.
 * @param {Function} props.onEditar - Callback para editar un evento existente.
 * @param {Function} props.onEliminar - Callback para eliminar un evento existente.
 * @param {Function} props.onLimpiarTodo - Callback para vaciar todos los eventos.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de bloqueo.
 */
export const TablaEventosCalendario = ({
  eventos = [],
  onEditar,
  onEliminar,
  onLimpiarTodo,
  cargando = false,
  disabled = false
}) => {
  const [filtroGlobal, setFiltroGlobal] = useState('');

  // Filtrado reactivo en memoria por fechas, tipo o descripción.
  const eventosFiltrados = useMemo(() => {
    if (!filtroGlobal.trim()) return eventos;
    const busqueda = filtroGlobal.toLowerCase().trim();
    return eventos.filter((ev) => {
      const fIni = formatearFechaEspanol(ev.fecha_inicio);
      const fFin = formatearFechaEspanol(ev.fecha_fin);
      const tipo = (ev.tipo_evento || '').toLowerCase();
      const desc = (ev.descripcion || '').toLowerCase();
      return (
        fIni.includes(busqueda) ||
        fFin.includes(busqueda) ||
        tipo.includes(busqueda) ||
        desc.includes(busqueda)
      );
    });
  }, [eventos, filtroGlobal]);

  // Plantilla para la columna de fechas (inicio - fin).
  const plantillaFechas = (fila) => {
    const inicioStr = formatearFechaEspanol(fila.fecha_inicio);
    const finStr = formatearFechaEspanol(fila.fecha_fin || fila.fecha_inicio);
    const esMismoDia = !fila.fecha_fin || fila.fecha_inicio === fila.fecha_fin;

    return (
      <div className="flex align-items-center gap-2 white-space-nowrap">
        <i className="pi pi-calendar text-primary text-xs" />
        <span className="font-semibold text-900 text-sm">
          {esMismoDia ? inicioStr : `${inicioStr} - ${finStr}`}
        </span>
      </div>
    );
  };

  // Plantilla para la columna del tipo de evento con su color canónico.
  const plantillaTipo = (fila) => {
    const config = obtenerConfiguracionTipoEvento(fila.tipo_evento);
    return (
      <span
        className="px-2 py-1 border-round text-xs font-semibold inline-block white-space-nowrap shadow-1"
        style={{
          backgroundColor: config.color,
          color: config.colorTexto,
          border: `1px solid ${config.colorBorde}`
        }}
      >
        {fila.tipo_evento}
      </span>
    );
  };

  // Plantilla para el carácter lectivo del evento.
  const plantillaLectivo = (fila) => {
    return (
      <Tag
        severity={fila.es_lectivo ? 'success' : 'danger'}
        value={fila.es_lectivo ? 'Lectivo' : 'No Lectivo'}
        className="text-xs font-semibold"
      />
    );
  };

  // Plantilla para la descripción truncada con tooltip nativo.
  const plantillaDescripcion = (fila) => {
    const texto = fila.descripcion && fila.descripcion.trim()
      ? fila.descripcion.trim()
      : 'Sin descripción adicional';

    return (
      <div
        className="overflow-hidden text-overflow-ellipsis white-space-nowrap text-sm text-700"
        title={texto}
        style={{ maxWidth: '280px' }}
      >
        {texto}
      </div>
    );
  };

  // Plantilla para las acciones de edición y eliminación.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center gap-1 justify-content-end">
        {onEditar && (
          <Button
            type="button"
            icon="pi pi-pencil"
            text
            rounded
            severity="secondary"
            size="small"
            onClick={() => onEditar(fila)}
            disabled={disabled}
            tooltip="Editar evento"
            tooltipOptions={{ position: 'top' }}
          />
        )}
        {onEliminar && (
          <Button
            type="button"
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            size="small"
            onClick={() => onEliminar(fila.id_evento)}
            disabled={disabled}
            tooltip="Eliminar evento"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    );
  };

  // Cabecera superior de la tabla con barra de búsqueda y botón de vaciado.
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 p-1">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-list text-primary text-xl" />
        <h3 className="text-base font-bold text-900 m-0">
          Listado de Eventos Registrados
        </h3>
        <Tag
          severity="info"
          value={`${eventos.length} ${eventos.length === 1 ? 'evento' : 'eventos'}`}
          className="text-xs"
        />
      </div>

      <div className="flex align-items-center gap-2 flex-wrap">
        <span className="p-input-icon-left w-full sm:w-auto">
          <i className="pi pi-search" />
          <InputText
            value={filtroGlobal}
            onChange={(e) => setFiltroGlobal(e.target.value)}
            placeholder="Buscar por fecha, tipo o detalle..."
            className="p-inputtext-sm w-full sm:w-16rem"
          />
        </span>

        {eventos.length > 0 && onLimpiarTodo && (
          <Button
            type="button"
            icon="pi pi-trash"
            label="Limpiar Todo"
            severity="danger"
            outlined
            size="small"
            onClick={onLimpiarTodo}
            disabled={disabled}
            tooltip="Eliminar todos los eventos del curso"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3 w-full">
      {eventos.length === 0 ? (
        <EstadoVacio
          mensaje="No hay eventos en el calendario"
          descripcion="Utilice el calendario superior seleccionando un día o arrastrando un rango para añadir eventos, o pulse en 'Añadir Periodo'."
          icono="pi pi-calendar-times"
        />
      ) : (
        <TablaBase
          data={eventosFiltrados}
          loading={cargando}
          header={cabeceraTabla}
          paginator
          paginatorPosition="top"
          rows={10}
          rowsPerPageOptions={[5, 10, 15, 20, 25]}
          emptyMessage="No se encontraron eventos coincidentes con la búsqueda"
          className="p-datatable-sm"
        >
          <Column
            header="Fechas"
            body={plantillaFechas}
            style={{ minWidth: '180px', width: '22%' }}
            sortable
            sortField="fecha_inicio"
          />
          <Column
            header="Tipo de Evento"
            body={plantillaTipo}
            style={{ minWidth: '160px', width: '20%' }}
            sortable
            sortField="tipo_evento"
          />
          <Column
            header="Carácter"
            body={plantillaLectivo}
            style={{ minWidth: '120px', width: '15%' }}
            sortable
            sortField="es_lectivo"
          />
          <Column
            header="Descripción / Motivo"
            body={plantillaDescripcion}
            style={{ minWidth: '220px', width: '33%' }}
          />
          <Column
            header="Acciones"
            body={plantillaAcciones}
            style={{ width: '10%', minWidth: '90px' }}
            alignHeader="right"
          />
        </TablaBase>
      )}
    </div>
  );
};

export default TablaEventosCalendario;
