import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';

// Componente para el listado principal de discentes con selector de curso, buscador, conmutador de estado en línea y acceso a su ficha interactiva
const DiscentesLista = ({
  discentes = [],
  cargando = false,
  cursos = [],
  cursoSeleccionadoId = null,
  cursoSeleccionado = null,
  alCambiarCurso = () => {},
  alSeleccionarDiscente = () => {},
  alCambiarEstado = () => {},
  alRecargar = () => {}
}) => {
  const [filtroGlobal, setFiltroGlobal] = useState('');
  // Filtro por estado por defecto en 'activos' (solo discentes activos)
  const [filtroEstado, setFiltroEstado] = useState('activos'); // 'activos' | 'todos' | 'inactivos'

  // Plantilla visual para las opciones en el desplegable de selección de curso
  const plantillaOpcionCurso = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex flex-column py-1">
        <span className="font-semibold text-color">{opcion.nombre}</span>
        <span className="text-xs text-muted">
          {opcion.anyo ? `Año: ${opcion.anyo}` : ''} {opcion.centro ? `| ${opcion.centro}` : ''}
        </span>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado en el desplegable de curso
  const plantillaValorCurso = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary" />
          <span className="font-medium text-color">{opcion.nombre}</span>
          {opcion.anyo && <span className="text-xs text-muted">({opcion.anyo})</span>}
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  // Conteo reactivo de discentes por estado de actividad dentro del conjunto actual
  const totalActivos = useMemo(
    () => (discentes || []).filter((d) => d.activo !== false).length,
    [discentes]
  );
  const totalInactivos = useMemo(
    () => (discentes || []).filter((d) => d.activo === false).length,
    [discentes]
  );

  // Filtrado reactivo de discentes por texto y estado de actividad
  const discentesFiltrados = useMemo(() => {
    return (discentes || []).filter((d) => {
      const termino = filtroGlobal.trim().toLowerCase();
      const nombreCompleto = `${d.nombre || ''} ${d.apellidos || ''}`.toLowerCase();
      const nia = (d.NIA || '').toLowerCase();
      const correo = (d.correo || '').toLowerCase();
      const localidad = (d.localidad || '').toLowerCase();

      const coincideTexto =
        !termino ||
        nombreCompleto.includes(termino) ||
        nia.includes(termino) ||
        correo.includes(termino) ||
        localidad.includes(termino);

      if (!coincideTexto) return false;

      const esActivo = d.activo !== false;
      if (filtroEstado === 'activos') return esActivo;
      if (filtroEstado === 'inactivos') return !esActivo;

      return true;
    });
  }, [discentes, filtroGlobal, filtroEstado]);

  // Plantilla para la celda de alumno con avatar e información de contacto
  const plantillaAlumno = (rowData) => {
    const iniciales = `${(rowData.nombre || '')[0] || ''}${(rowData.apellidos || '')[0] || ''}`.toUpperCase() || 'AL';
    return (
      <div className="flex align-items-center gap-3 py-1">
        {rowData.imagen ? (
          <Avatar
            image={rowData.imagen}
            shape="circle"
            size="large"
            className="flex-shrink-0"
          />
        ) : (
          <Avatar
            label={iniciales}
            shape="circle"
            size="large"
            className="surface-200 text-primary font-bold text-base flex-shrink-0"
          />
        )}
        <div className="flex flex-column">
          <span className="font-bold text-color text-base">
            {rowData.apellidos}, {rowData.nombre}
          </span>
          <span className="text-xs text-muted mt-1">
            {rowData.correo || 'Sin correo registrado'}
          </span>
        </div>
      </div>
    );
  };

  // Plantilla para la celda del NIA
  const plantillaNia = (rowData) => {
    return (
      <span className="font-mono text-sm font-semibold text-color-secondary">
        {rowData.NIA || '-'}
      </span>
    );
  };

  // Plantilla para la localidad
  const plantillaLocalidad = (rowData) => {
    return (
      <div className="flex align-items-center gap-2 text-sm text-color-secondary">
        <i className="pi pi-map-marker text-muted" />
        <span>{rowData.localidad || '-'}</span>
      </div>
    );
  };

  // Plantilla para la columna Estado exclusivamente con InputSwitch y auto-save
  const plantillaEstado = (rowData) => {
    const esActivo = rowData.activo !== false;

    return (
      <div
        className="flex align-items-center justify-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <InputSwitch
          checked={esActivo}
          onChange={(e) => {
            alCambiarEstado(rowData.id_discente, e.value);
          }}
          tooltip={esActivo ? 'Discente activo (clic para desactivar)' : 'Discente inactivo (clic para activar)'}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla para la columna Acción con icono id-card optimizado y en color azul
  const plantillaAcciones = (rowData) => {
    return (
      <Button
        type="button"
        text
        rounded
        onClick={(e) => {
          e.stopPropagation();
          alSeleccionarDiscente(rowData.id_discente);
        }}
        tooltip="Abrir informe 360º del estudiante"
        tooltipOptions={{ position: 'left' }}
        style={{ width: '2.6rem', height: '2.6rem', padding: 0 }}
      >
        <i
          className="pi pi-id-card transition-colors hover:text-blue-700"
          style={{ fontSize: '1.7rem', color: '#2563eb', lineHeight: 1 }}
        />
      </Button>
    );
  };

  // Renderizado del estado de carga con Skeleton
  if (cargando && discentes.length === 0) {
    return (
      <Card className="shadow-1">
        <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-3 mb-4">
          <div>
            <Skeleton width="200px" height="2rem" className="mb-2" />
            <Skeleton width="320px" height="1.2rem" />
          </div>
          <div className="flex align-items-center gap-2">
            <Skeleton width="180px" height="2.5rem" />
            <Skeleton width="100px" height="2.5rem" />
          </div>
        </div>
        <Skeleton width="100%" height="350px" borderRadius="8px" />
      </Card>
    );
  }

  return (
    <Card className="shadow-1">
      {/* Cabecera del listado con buscador, selector de curso y acciones rápidas */}
      <div className="flex flex-column lg:flex-row lg:justify-content-between lg:align-items-center gap-3 mb-3 pb-3 border-bottom-1 surface-border">
        <div>
          <h2 className="text-xl font-bold m-0 text-color">
            Listado de discentes
          </h2>
          <p className="text-muted text-xs m-0 mt-1">
            {cursoSeleccionado
              ? `Discentes matriculados en el curso ${cursoSeleccionado.nombre}${cursoSeleccionado.anyo ? ` (${cursoSeleccionado.anyo})` : ''}. Seleccione un estudiante para consultar su informe integral.`
              : 'Seleccione un estudiante del listado para consultar su ficha completa, progreso por módulos y gráficos evolutivos.'}
          </p>
        </div>

        <div className="flex flex-wrap align-items-center gap-2">
          {/* Selector de curso escolar con Dropdown de PrimeReact */}
          <div className="flex align-items-center gap-2">
            <label
              htmlFor="filtro-curso-discentes"
              className="text-xs font-bold text-muted uppercase"
            >
              Curso:
            </label>
            <Dropdown
              id="filtro-curso-discentes"
              value={cursoSeleccionadoId}
              options={cursos}
              optionValue="id_curso"
              optionLabel="nombre"
              onChange={(e) => alCambiarCurso(e.value)}
              placeholder="Seleccione curso..."
              className="w-full sm:w-18rem p-inputtext-sm"
              itemTemplate={plantillaOpcionCurso}
              valueTemplate={plantillaValorCurso}
              showClear={cursos.length > 1}
              disabled={cargando || cursos.length === 0}
              filter={cursos.length > 4}
              filterBy="nombre,anyo,centro"
              filterPlaceholder="Buscar curso..."
              aria-label="Filtrar discentes por curso académico"
            />
          </div>

          <Button
            type="button"
            icon="pi pi-refresh"
            label="Actualizar"
            size="small"
            outlined
            onClick={alRecargar}
            tooltip="Refrescar catálogo de discentes"
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
      </div>

      {/* Barra de herramientas para filtrado global y por estado */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 mb-3">
        <div className="p-input-icon-left w-full sm:w-22rem">
          <i className="pi pi-search" />
          <InputText
            value={filtroGlobal}
            onChange={(e) => setFiltroGlobal(e.target.value)}
            placeholder="Buscar por nombre, apellidos, NIA o correo..."
            className="w-full p-inputtext-sm"
          />
        </div>

        <div className="flex align-items-center gap-1">
          <span className="text-xs font-semibold text-muted mr-1">Filtrar:</span>
          <Button
            label={`Solo Activos (${totalActivos})`}
            size="small"
            text={filtroEstado !== 'activos'}
            severity={filtroEstado === 'activos' ? 'success' : 'secondary'}
            className="p-1 px-2 text-xs font-semibold"
            onClick={() => setFiltroEstado('activos')}
          />
          <Button
            label={`Todos (${discentes.length})`}
            size="small"
            text={filtroEstado !== 'todos'}
            severity={filtroEstado === 'todos' ? 'primary' : 'secondary'}
            className="p-1 px-2 text-xs"
            onClick={() => setFiltroEstado('todos')}
          />
          <Button
            label={`Inactivos (${totalInactivos})`}
            size="small"
            text={filtroEstado !== 'inactivos'}
            severity={filtroEstado === 'inactivos' ? 'danger' : 'secondary'}
            className="p-1 px-2 text-xs"
            onClick={() => setFiltroEstado('inactivos')}
          />
        </div>
      </div>

      {/* Tabla de Discentes con navegación a detalle al pulsar la fila */}
      <DataTable
        value={discentesFiltrados}
        dataKey="id_discente"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20, 50]}
        selectionMode="single"
        onRowClick={(e) => alSeleccionarDiscente(e.data.id_discente)}
        emptyMessage={
          cursoSeleccionado
            ? `No se encontraron discentes matriculados en el curso ${cursoSeleccionado.nombre} con los criterios especificados.`
            : 'No se encontraron discentes registrados con los criterios especificados.'
        }
        className="p-datatable-sm cursor-pointer"
        responsiveLayout="scroll"
        stripedRows
      >
        <Column
          field="apellidos"
          header="Estudiante"
          body={plantillaAlumno}
          sortable
          style={{ minWidth: '260px' }}
        />
        <Column
          field="NIA"
          header="NIA"
          body={plantillaNia}
          sortable
          style={{ width: '130px', minWidth: '130px' }}
        />
        <Column
          field="localidad"
          header="Localidad"
          body={plantillaLocalidad}
          sortable
          style={{ minWidth: '150px' }}
        />
        <Column
          field="activo"
          header="Estado"
          body={plantillaEstado}
          sortable
          style={{ width: '110px', minWidth: '110px', textAlign: 'center' }}
        />
        <Column
          header="Acción"
          body={plantillaAcciones}
          style={{ width: '90px', minWidth: '90px', textAlign: 'center' }}
        />
      </DataTable>
    </Card>
  );
};

export default DiscentesLista;
