import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// Componente para los filtros contextuales en cascada del informe de análisis de dificultad (Curso -> Módulo -> Práctica)
const InformeDificultadFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  practicasDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  practicaSeleccionadaId,
  setPracticaSeleccionadaId,
  cargando = false,
  cargandoModulos = false,
  cargandoPracticas = false,
  exportandoPDF = false,
  totalNotas = 0,
  recargar = () => {},
  descargarPDF = () => {}
}) => {
  // Plantilla visual personalizada para las opciones de Curso
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

  // Plantilla visual para las opciones de Práctica
  const plantillaOpcionPractica = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex flex-column">
        <span className="font-semibold text-color">
          {opcion.numero ? `Práctica ${opcion.numero}: ` : ''}{opcion.nombre || 'Sin título'}
        </span>
        {opcion.unidad && (
          <span className="text-xs text-muted mt-1">Unidad: {opcion.unidad}</span>
        )}
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Práctica
  const plantillaValorPractica = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-file-edit text-primary" />
          <span className="font-medium text-color">
            {opcion.numero ? `Práctica ${opcion.numero}: ` : ''}{opcion.nombre || 'Sin título'}
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
          <label htmlFor="select-curso-dificultad" className="block text-xs font-bold text-muted uppercase mb-1">
            1. Curso Académico
          </label>
          <Dropdown
            id="select-curso-dificultad"
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

        {/* 2. Desplegable de Módulo Profesional */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-modulo-dificultad" className="block text-xs font-bold text-muted uppercase mb-1">
            2. Módulo Profesional
          </label>
          <Dropdown
            id="select-modulo-dificultad"
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

        {/* 3. Desplegable de Práctica */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-practica-dificultad" className="block text-xs font-bold text-muted uppercase mb-1">
            3. Práctica
          </label>
          <Dropdown
            id="select-practica-dificultad"
            value={practicaSeleccionadaId}
            options={practicasDisponibles}
            optionValue="id_practica"
            optionLabel="nombre"
            onChange={(e) => setPracticaSeleccionadaId(e.value)}
            placeholder={
              !moduloSeleccionadoId
                ? 'Primero seleccione un módulo'
                : cargandoPracticas
                ? 'Cargando prácticas...'
                : practicasDisponibles.length === 0
                ? 'No hay prácticas en este módulo'
                : 'Seleccione una Práctica...'
            }
            disabled={!moduloSeleccionadoId || cargandoPracticas || practicasDisponibles.length === 0}
            itemTemplate={plantillaOpcionPractica}
            valueTemplate={plantillaValorPractica}
            className="w-full p-inputtext-sm"
            showClear={!!practicaSeleccionadaId}
            filter
            filterBy="nombre,numero,unidad"
            filterPlaceholder="Buscar práctica..."
            aria-label="Seleccionar práctica"
          />
        </div>
      </div>

      {/* Barra secundaria de acciones y estado */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mt-2 pt-2 border-top-1 surface-border">
        <div className="flex align-items-center gap-2">
          {practicaSeleccionadaId && (
            <span className="text-xs text-muted">
              {cargando ? (
                'Consultando calificaciones...'
              ) : (
                <>
                  <span className="font-semibold text-color">{totalNotas}</span>{' '}
                  {totalNotas === 1 ? 'calificación analizada' : 'calificaciones analizadas'}
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
            disabled={!practicaSeleccionadaId}
            tooltip="Volver a consultar calificaciones de la base de datos"
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
            disabled={!practicaSeleccionadaId || cargando || totalNotas === 0}
            tooltip="Descargar informe de dificultad en formato PDF"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default InformeDificultadFiltros;
