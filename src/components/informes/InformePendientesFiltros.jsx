import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';

// Componente para los filtros contextuales en cascada del informe de calificaciones pendientes
const InformePendientesFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  evaluacionesDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  evaluacionSeleccionadaId,
  setEvaluacionSeleccionadaId,
  terminoBusqueda,
  setTerminoBusqueda,
  totalPendientes = 0,
  totalFiltrados = 0,
  cargando = false,
  cargandoModulos = false,
  cargandoEvaluaciones = false,
  exportandoPDF = false,
  recargar = () => {},
  descargarPDF = () => {}
}) => {
  // Plantilla visual personalizada para la opción de Curso en el desplegable
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

  // Plantilla visual para el valor seleccionado del Curso
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

  // Plantilla visual para la opción de Módulo
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

  // Plantilla visual para la opción de Evaluación
  const plantillaOpcionEvaluacion = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center justify-content-between w-full">
        <span className="font-medium text-color">{opcion.nombre}</span>
        {opcion.fecha_ini && (
          <span className="text-xs text-muted">
            {new Date(opcion.fecha_ini).toLocaleDateString('es-ES')}
          </span>
        )}
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Evaluación
  const plantillaValorEvaluacion = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-clock text-primary" />
          <span className="font-medium text-color">{opcion.nombre}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      {/* Fila de los tres Dropdowns en cascada */}
      <div className="grid align-items-center">
        {/* 1. Desplegable de Curso Académico */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-curso" className="block text-xs font-bold text-muted uppercase mb-1">
            1. Curso Académico
          </label>
          <Dropdown
            id="select-curso"
            value={cursoSeleccionadoId}
            options={cursos}
            optionValue="id_curso"
            optionLabel="nombre"
            onChange={(e) => setCursoSeleccionadoId(e.value)}
            placeholder="Seleccione un Curso"
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

        {/* 2. Desplegable de Módulo Profesional (deshabilitado si no hay curso seleccionado) */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-modulo" className="block text-xs font-bold text-muted uppercase mb-1">
            2. Módulo Profesional
          </label>
          <Dropdown
            id="select-modulo"
            value={moduloSeleccionadoId}
            options={modulosDisponibles}
            optionValue="id_modulo"
            optionLabel="nombre"
            onChange={(e) => setModuloSeleccionadoId(e.value)}
            placeholder={
              !cursoSeleccionadoId
                ? 'Primero elija un curso'
                : cargandoModulos
                ? 'Cargando módulos...'
                : 'Seleccione un Módulo'
            }
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            className="w-full p-inputtext-sm"
            disabled={!cursoSeleccionadoId || cargandoModulos}
            showClear={!!moduloSeleccionadoId}
            filter
            filterBy="nombre,siglas"
            filterPlaceholder="Buscar módulo..."
            aria-label="Seleccionar módulo profesional"
          />
        </div>

        {/* 3. Desplegable de Evaluación (deshabilitado si no hay módulo seleccionado) */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-evaluacion" className="block text-xs font-bold text-muted uppercase mb-1">
            3. Evaluación
          </label>
          <Dropdown
            id="select-evaluacion"
            value={evaluacionSeleccionadaId}
            options={evaluacionesDisponibles}
            optionValue="id_evaluacion"
            optionLabel="nombre"
            onChange={(e) => setEvaluacionSeleccionadaId(e.value)}
            placeholder={
              !moduloSeleccionadoId
                ? 'Primero elija un módulo'
                : cargandoEvaluaciones
                ? 'Cargando evaluaciones...'
                : evaluacionesDisponibles.length === 0
                ? 'Sin evaluaciones para este módulo'
                : 'Seleccione una Evaluación'
            }
            itemTemplate={plantillaOpcionEvaluacion}
            valueTemplate={plantillaValorEvaluacion}
            className="w-full p-inputtext-sm"
            disabled={!moduloSeleccionadoId || cargandoEvaluaciones || evaluacionesDisponibles.length === 0}
            showClear={!!evaluacionSeleccionadaId}
            filter
            filterBy="nombre"
            filterPlaceholder="Buscar evaluación..."
            aria-label="Seleccionar periodo de evaluación"
          />
        </div>
      </div>

      {/* Barra de herramientas y búsqueda cuando hay una evaluación activa */}
      {evaluacionSeleccionadaId && (
        <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-3 mt-3 border-top-1 surface-border">
          {/* Campo de búsqueda libre en la tabla */}
          <div className="p-input-icon-left w-full sm:w-20rem">
            <i className="pi pi-search" />
            <InputText
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar por discente o práctica..."
              className="w-full p-inputtext-sm"
              disabled={cargando}
            />
            {terminoBusqueda && (
              <Button
                type="button"
                icon="pi pi-times"
                className="p-button-text p-button-sm absolute right-0 top-0 h-full"
                onClick={() => setTerminoBusqueda('')}
                aria-label="Limpiar búsqueda"
              />
            )}
          </div>

          {/* Acciones de recarga, contador y exportación a PDF */}
          <div className="flex align-items-center gap-2">
            <Badge
              value={`${totalFiltrados} pendiente${totalFiltrados === 1 ? '' : 's'}`}
              severity={totalPendientes > 0 ? 'warning' : 'success'}
              className="mr-1"
            />

            <Button
              type="button"
              icon="pi pi-refresh"
              size="small"
              severity="secondary"
              outlined
              onClick={recargar}
              loading={cargando}
              tooltip="Actualizar lista de pendientes"
              tooltipOptions={{ position: 'top' }}
              aria-label="Recargar calificaciones pendientes"
            />

            <Button
              type="button"
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              size="small"
              severity="danger"
              outlined
              onClick={descargarPDF}
              loading={exportandoPDF}
              disabled={cargando}
              tooltip="Descargar informe en formato PDF"
              tooltipOptions={{ position: 'top' }}
              aria-label="Exportar a PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InformePendientesFiltros;
