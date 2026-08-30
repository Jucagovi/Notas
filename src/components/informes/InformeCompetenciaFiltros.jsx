import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';

// Componente para los filtros contextuales en cascada del informe de radar de competencias (Curso -> Módulo -> Discente)
const InformeCompetenciaFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  discentesDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  discenteSeleccionadoId,
  setDiscenteSeleccionadoId,
  cargando = false,
  cargandoModulos = false,
  cargandoDiscentes = false,
  exportandoPDF = false,
  totalRA = 0,
  recargar = () => {},
  descargarPDF = () => {}
}) => {
  // Plantilla visual para las opciones de Curso en el desplegable
  const plantillaOpcionCurso = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex flex-column">
        <span className="font-semibold text-color">{opcion.nombre}</span>
        <span className="text-xs text-muted">
          {opcion.anyo ? `Año: ${opcion.anyo}` : ''} {opcion.centro ? `| ${opcion.centro}` : ''}
        </span>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Curso
  const plantillaValorCurso = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary" />
          <span className="font-medium text-color">{opcion.nombre}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  // Plantilla visual para las opciones de Módulo
  const plantillaOpcionModulo = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex flex-column">
        <div className="flex align-items-center gap-2">
          {opcion.siglas && (
            <span className="font-bold text-xs bg-primary-reverse text-primary border-round px-1">
              {opcion.siglas}
            </span>
          )}
          <span className="font-medium text-color">{opcion.nombre}</span>
        </div>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Módulo
  const plantillaValorModulo = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-book text-primary" />
          <span className="font-medium text-color">
            {opcion.siglas ? `[${opcion.siglas}] ` : ''}{opcion.nombre}
          </span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  // Plantilla visual para las opciones de Discente
  const plantillaOpcionDiscente = (opcion) => {
    if (!opcion) return null;
    const iniciales = `${opcion.nombre?.charAt(0) || ''}${opcion.apellidos?.charAt(0) || ''}`.toUpperCase();

    return (
      <div className="flex align-items-center gap-2 py-1">
        {opcion.imagen ? (
          <Avatar image={opcion.imagen} shape="circle" size="normal" />
        ) : (
          <Avatar label={iniciales || 'AL'} shape="circle" size="normal" className="bg-primary-100 text-primary font-bold" />
        )}
        <div className="flex flex-column">
          <span className="font-semibold text-color">
            {opcion.apellidos ? `${opcion.apellidos}, ${opcion.nombre}` : opcion.nombre}
          </span>
          <span className="text-xs text-muted">
            {opcion.NIA ? `NIA: ${opcion.NIA}` : ''} {opcion.correo ? `| ${opcion.correo}` : ''}
          </span>
        </div>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Discente
  const plantillaValorDiscente = (opcion, props) => {
    if (opcion) {
      const iniciales = `${opcion.nombre?.charAt(0) || ''}${opcion.apellidos?.charAt(0) || ''}`.toUpperCase();

      return (
        <div className="flex align-items-center gap-2">
          {opcion.imagen ? (
            <Avatar image={opcion.imagen} shape="circle" size="small" />
          ) : (
            <Avatar label={iniciales || 'AL'} shape="circle" size="small" className="bg-primary-100 text-primary font-bold" />
          )}
          <span className="font-medium text-color">
            {opcion.apellidos ? `${opcion.apellidos}, ${opcion.nombre}` : opcion.nombre}
          </span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="grid align-items-center">
        {/* 1. Desplegable de Curso Académico (con selección inicial al más reciente) */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-curso-competencias" className="block text-xs font-bold text-muted uppercase mb-1">
            1. Curso Académico
          </label>
          <Dropdown
            id="select-curso-competencias"
            value={cursoSeleccionadoId}
            options={cursos}
            optionValue="id_curso"
            optionLabel="nombre"
            onChange={(e) => setCursoSeleccionadoId(e.value)}
            placeholder="Seleccione un Curso..."
            itemTemplate={plantillaOpcionCurso}
            valueTemplate={plantillaValorCurso}
            className="w-full p-inputtext-sm"
            showClear={!!cursoSeleccionadoId}
            filter
            filterBy="nombre,anyo,centro"
            filterPlaceholder="Buscar curso..."
            aria-label="Seleccionar curso académico"
          />
        </div>

        {/* 2. Desplegable de Módulo Profesional (espera intervención del usuario) */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-modulo-competencias" className="block text-xs font-bold text-muted uppercase mb-1">
            2. Módulo Profesional
          </label>
          <Dropdown
            id="select-modulo-competencias"
            value={moduloSeleccionadoId}
            options={modulosDisponibles}
            optionValue="id_modulo"
            optionLabel="nombre"
            onChange={(e) => setModuloSeleccionadoId(e.value)}
            placeholder={
              !cursoSeleccionadoId
                ? 'Primero seleccione un curso'
                : cargandoModulos
                ? 'Cargando módulos...'
                : 'Seleccione un Módulo...'
            }
            disabled={!cursoSeleccionadoId || cargandoModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            className="w-full p-inputtext-sm"
            showClear={!!moduloSeleccionadoId}
            filter
            filterBy="nombre,siglas"
            filterPlaceholder="Buscar módulo..."
            aria-label="Seleccionar módulo profesional"
          />
        </div>

        {/* 3. Desplegable de Discente (espera intervención del usuario) */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-discente-competencias" className="block text-xs font-bold text-muted uppercase mb-1">
            3. Discente
          </label>
          <Dropdown
            id="select-discente-competencias"
            value={discenteSeleccionadoId}
            options={discentesDisponibles}
            optionValue="id_discente"
            optionLabel="nombre"
            onChange={(e) => setDiscenteSeleccionadoId(e.value)}
            placeholder={
              !moduloSeleccionadoId
                ? 'Primero seleccione un módulo'
                : cargandoDiscentes
                ? 'Cargando discentes...'
                : discentesDisponibles.length === 0
                ? 'No hay discentes matriculados'
                : 'Seleccione un Discente...'
            }
            disabled={!moduloSeleccionadoId || cargandoDiscentes || discentesDisponibles.length === 0}
            itemTemplate={plantillaOpcionDiscente}
            valueTemplate={plantillaValorDiscente}
            className="w-full p-inputtext-sm"
            showClear={!!discenteSeleccionadoId}
            filter
            filterBy="nombre,apellidos,NIA,correo"
            filterPlaceholder="Buscar discente..."
            aria-label="Seleccionar discente"
          />
        </div>
      </div>

      {/* Barra secundaria de acciones y estado */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mt-2 pt-2 border-top-1 surface-border">
        <div className="flex align-items-center gap-2">
          {discenteSeleccionadoId && (
            <span className="text-xs text-muted">
              {cargando ? (
                'Calculando competencias por RA...'
              ) : (
                <>
                  <span className="font-semibold text-color">{totalRA}</span>{' '}
                  {totalRA === 1 ? 'resultado de aprendizaje analizado' : 'resultados de aprendizaje analizados'}
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Actualizar"
            size="small"
            severity="secondary"
            outlined
            onClick={recargar}
            loading={cargando}
            disabled={!discenteSeleccionadoId}
            tooltip="Volver a consultar las calificaciones de la base de datos"
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            type="button"
            icon="pi pi-file-pdf"
            label="Exportar PDF"
            size="small"
            severity="primary"
            onClick={descargarPDF}
            loading={exportandoPDF}
            disabled={!discenteSeleccionadoId || cargando || totalRA === 0}
            tooltip="Descargar mapa competencial en formato PDF"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default InformeCompetenciaFiltros;
