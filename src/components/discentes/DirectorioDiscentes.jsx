import React, { useState, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { Column } from 'primereact/column';
import TablaBase from '../common/TablaBase.jsx';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * DirectorioDiscentes - Subcomponente presentacional para el catálogo de estudiantes.
 *
 * Responsabilidad Única: Renderizar el listado tabular de discentes con filtros reactivos
 * por texto (ancho ampliado), botones de estado (Todos, Activos, Inactivos), selector de clases
 * con orden cronológico (las más recientes arriba) e InputSwitch centrado sin texto redundante.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes registrados.
 * @param {Array<Object>} [props.clases=[]] - Catálogo de clases disponibles.
 * @param {Array<Object>} [props.imparte=[]] - Matrículas de discentes en clases.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onSeleccionarDiscente - Callback al pulsar sobre la fila de un discente.
 * @param {Function} props.onAlternarActivo - Callback al conmutar el InputSwitch de estado.
 */
export const DirectorioDiscentes = ({
  discentes = [],
  clases = [],
  imparte = [],
  cargando = false,
  onSeleccionarDiscente,
  onAlternarActivo
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Ordenación estricta de clases: las más recientes se posicionan en la parte superior del selector
  const clasesOrdenadas = useMemo(() => {
    const lista = [...(clases || [])];
    lista.sort((a, b) => {
      const anioA = a.anioInicio || 0;
      const anioB = b.anioInicio || 0;
      if (anioB !== anioA) return anioB - anioA;
      const compCurso = (a.cursoNombre || '').localeCompare(b.cursoNombre || '', 'es');
      if (compCurso !== 0) return compCurso;
      return (a.moduloNombre || '').localeCompare(b.moduloNombre || '', 'es');
    });
    return lista;
  }, [clases]);

  // Conjunto de identificadores de discentes matriculados en la clase seleccionada
  const idsDiscentesClase = useMemo(() => {
    if (!claseSeleccionadaId || !imparte || imparte.length === 0) return null;
    const claseObj = clasesOrdenadas.find((c) => c.id === claseSeleccionadaId);
    if (!claseObj) return null;

    const matriculados = imparte
      .filter(
        (rel) =>
          rel.id_curso === claseObj.id_curso &&
          rel.id_modulo === claseObj.id_modulo
      )
      .map((rel) => rel.id_discente);

    return new Set(matriculados);
  }, [claseSeleccionadaId, imparte, clasesOrdenadas]);

  // Filtrado reactivo en memoria combinando texto, estado de actividad y clase
  const discentesFiltrados = useMemo(() => {
    let resultado = discentes || [];

    // 1. Filtro por estado activo / inactivo
    if (filtroEstado === 'activos') {
      resultado = resultado.filter((d) => d.activo !== false);
    } else if (filtroEstado === 'inactivos') {
      resultado = resultado.filter((d) => d.activo === false);
    }

    // 2. Filtro por clase seleccionada en el Dropdown
    if (idsDiscentesClase) {
      resultado = resultado.filter((d) => idsDiscentesClase.has(d.id_discente));
    }

    // 3. Filtro textual por nombre, apellidos, NIA o correo
    if (filtroTexto.trim()) {
      const termino = filtroTexto.toLowerCase();
      resultado = resultado.filter((d) => {
        const nombreCompleto = `${d.nombre || ''} ${d.apellidos || ''}`.toLowerCase();
        const apellidosNombre = `${d.apellidos || ''} ${d.nombre || ''}`.toLowerCase();
        const nia = (d.NIA || '').toLowerCase();
        const correo = (d.correo || '').toLowerCase();

        return (
          nombreCompleto.includes(termino) ||
          apellidosNombre.includes(termino) ||
          nia.includes(termino) ||
          correo.includes(termino)
        );
      });
    }

    return resultado;
  }, [discentes, filtroEstado, idsDiscentesClase, filtroTexto]);

  // Plantilla visual para la celda de datos personales con avatar e iniciales
  const plantillaDiscente = (fila) => {
    const iniciales = `${(fila.nombre || '')[0] || ''}${(fila.apellidos || '')[0] || ''}`.toUpperCase() || 'D';
    const nombreCompleto = `${fila.apellidos}, ${fila.nombre}`;

    return (
      <div className="flex align-items-center gap-3 py-1">
        {fila.imagen ? (
          <Avatar
            image={fila.imagen}
            shape="circle"
            size="normal"
            className="shadow-1 flex-shrink-0"
          />
        ) : (
          <Avatar
            label={iniciales}
            shape="circle"
            size="normal"
            className="bg-primary text-white font-bold flex-shrink-0"
          />
        )}
        <div className="flex flex-column overflow-hidden">
          <span
            className="font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
            data-pr-tooltip={nombreCompleto}
          >
            {nombreCompleto}
          </span>
          {fila.correo && (
            <span
              className="text-xs text-color-secondary white-space-nowrap overflow-hidden text-overflow-ellipsis"
              data-pr-tooltip={fila.correo}
            >
              {fila.correo}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Plantilla para la columna NIA
  const plantillaNia = (fila) => {
    return (
      <span className="font-mono text-sm text-700 font-semibold">
        {fila.NIA || '-'}
      </span>
    );
  };

  // Plantilla para la columna Activo con InputSwitch centrado sin texto a la derecha
  const plantillaActivo = (fila) => {
    const esActivo = fila.activo !== false;

    return (
      <div
        className="flex align-items-center justify-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <InputSwitch
          checked={esActivo}
          onChange={(e) => onAlternarActivo && onAlternarActivo(fila, e.value)}
          tooltip={esActivo ? 'Desactivar discente' : 'Activar discente'}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Barra de herramientas superior con búsqueda ampliada, 3 botones de estado y selector de clases
  const cabeceraTabla = (
    <div className="flex flex-column gap-3 py-1">
      <div className="flex flex-column lg:flex-row align-items-stretch lg:align-items-center justify-content-between gap-3">
        {/* Bloque de filtros */}
        <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-2 flex-grow-1 flex-wrap">
          {/* 1. Buscador textual con ancho ampliado un 50% (de 16rem a 24rem) */}
          <span className="p-input-icon-left w-full sm:w-24rem">
            <i className="pi pi-search" />
            <InputText
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Buscar por discente, NIA o correo..."
              className="w-full p-inputtext-sm"
            />
          </span>

          {/* 2. Tres botones de filtrado de estado: Todos, Activos e Inactivos */}
          <div className="flex align-items-center gap-1">
            <Button
              label="Todos"
              size="small"
              severity={filtroEstado === 'todos' ? 'primary' : 'secondary'}
              outlined={filtroEstado !== 'todos'}
              onClick={() => setFiltroEstado('todos')}
              className="text-xs px-3 py-2"
            />
            <Button
              label="Activos"
              size="small"
              severity={filtroEstado === 'activos' ? 'primary' : 'secondary'}
              outlined={filtroEstado !== 'activos'}
              onClick={() => setFiltroEstado('activos')}
              className="text-xs px-3 py-2"
            />
            <Button
              label="Inactivos"
              size="small"
              severity={filtroEstado === 'inactivos' ? 'primary' : 'secondary'}
              outlined={filtroEstado !== 'inactivos'}
              onClick={() => setFiltroEstado('inactivos')}
              className="text-xs px-3 py-2"
            />
          </div>

          {/* 3. Selector de clase con las más recientes arriba */}
          <div className="w-full sm:w-20rem">
            <SelectorClase
              value={claseSeleccionadaId}
              options={clasesOrdenadas}
              onChange={(e) => setClaseSeleccionadaId(e.value)}
              placeholder="Todas las clases"
              showClear={true}
              className="w-full p-inputtext-sm"
            />
          </div>

          {(filtroTexto || filtroEstado !== 'todos' || claseSeleccionadaId) && (
            <Button
              icon="pi pi-filter-slash"
              label="Limpiar"
              rounded
              text
              size="small"
              severity="secondary"
              onClick={() => {
                setFiltroTexto('');
                setFiltroEstado('todos');
                setClaseSeleccionadaId(null);
              }}
              tooltip="Restablecer todos los filtros"
              tooltipOptions={{ position: 'top' }}
            />
          )}
        </div>

        {/* Resumen cuantitativo */}
        <div className="text-xs text-color-secondary flex align-items-center gap-2 flex-shrink-0">
          <i className="pi pi-users text-primary" />
          <span>
            Total: <strong>{discentesFiltrados.length}</strong> discentes
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1">
      <Tooltip target="[data-pr-tooltip]" />

      <TablaBase
        value={discentesFiltrados}
        loading={cargando}
        header={cabeceraTabla}
        paginator={true}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage={
          filtroTexto || filtroEstado !== 'todos' || claseSeleccionadaId
            ? 'No se encontraron discentes que coincidan con los filtros aplicados.'
            : 'No hay discentes registrados en la base de datos.'
        }
        className="p-datatable-sm w-full cursor-pointer"
        onRowClick={(e) => onSeleccionarDiscente && onSeleccionarDiscente(e.data)}
      >
        <Column
          field="apellidos"
          header="Discente"
          body={plantillaDiscente}
          sortable
          style={{ minWidth: '240px' }}
        />
        <Column
          field="NIA"
          header="NIA"
          body={plantillaNia}
          sortable
          style={{ width: '130px' }}
        />
        <Column
          field="localidad"
          header="Localidad"
          sortable
          style={{ minWidth: '150px' }}
          body={(fila) => (
            <span
              className="white-space-nowrap overflow-hidden text-overflow-ellipsis block text-700"
              data-pr-tooltip={fila.localidad || '-'}
            >
              {fila.localidad || '-'}
            </span>
          )}
        />
        <Column
          field="activo"
          header="Activo"
          body={plantillaActivo}
          sortable
          style={{ width: '90px', textAlign: 'center' }}
          bodyClassName="text-center"
        />
      </TablaBase>
    </div>
  );
};

export default DirectorioDiscentes;
