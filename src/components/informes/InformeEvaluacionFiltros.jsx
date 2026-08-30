import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

// Componente de filtros superiores y barra de herramientas para el acta de evaluación oficial del módulo
const InformeEvaluacionFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  terminoBusqueda,
  setTerminoBusqueda,
  cargando,
  cargandoModulos,
  exportandoCSV,
  exportandoPDF,
  recargar,
  descargarCSV,
  descargarPDF,
  totalFilas = 0,
  totalFiltradas = 0
}) => {
  // Plantilla visual para las opciones del selector de cursos
  const plantillaOpcionCurso = (opcion) => {
    if (!opcion) return null;
    return <span className="font-semibold text-sm py-1 block">{opcion.nombre}</span>;
  };

  // Plantilla visual para el valor seleccionado de curso
  const plantillaValorCurso = (opcion, props) => {
    if (opcion) {
      return <span className="text-sm font-semibold text-color">{opcion.nombre}</span>;
    }
    return <span>{props.placeholder}</span>;
  };

  // Plantilla visual para las opciones del selector de módulos
  const plantillaOpcionModulo = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center gap-2 py-1">
        {opcion.siglas && (
          <span className="font-bold text-xs bg-primary-100 text-primary border-round px-2 py-1">
            {opcion.siglas}
          </span>
        )}
        <span className="font-semibold text-sm">{opcion.nombre}</span>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de módulo
  const plantillaValorModulo = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          {opcion.siglas && (
            <span className="font-bold text-xs bg-primary-100 text-primary border-round px-1 py-0">
              {opcion.siglas}
            </span>
          )}
          <span className="text-sm font-semibold text-color">{opcion.nombre}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  return (
    <div className="surface-card p-4 border-round shadow-1 flex flex-column gap-3 mb-4">
      {/* 1. Fila de selectores primarios (Curso, Módulo) y botón Recargar */}
      <div className="grid align-items-end">
        {/* Selector de Curso Académico (preseleccionado por defecto con el más reciente) */}
        <div className="col-12 md:col-5">
          <label htmlFor="selector-curso-acta" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-calendar mr-1" />
            Curso Académico
          </label>
          <Dropdown
            id="selector-curso-acta"
            value={cursoSeleccionadoId}
            options={cursos}
            optionValue="id_curso"
            optionLabel="nombre"
            onChange={(e) => setCursoSeleccionadoId(e.value)}
            placeholder="Seleccione un Curso"
            itemTemplate={plantillaOpcionCurso}
            valueTemplate={plantillaValorCurso}
            className="w-full"
            filter
            filterBy="nombre,anyo,centro"
            emptyFilterMessage="No se encontraron cursos coincidentes."
            disabled={cargando}
          />
        </div>

        {/* Selector de Módulo Profesional (espera intervención del usuario) */}
        <div className="col-12 md:col-5">
          <label htmlFor="selector-modulo-acta" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-book mr-1" />
            Módulo Profesional
          </label>
          <Dropdown
            id="selector-modulo-acta"
            value={moduloSeleccionadoId}
            options={modulosDisponibles}
            optionValue="id_modulo"
            optionLabel="nombre"
            onChange={(e) => setModuloSeleccionadoId(e.value)}
            placeholder={cargandoModulos ? 'Cargando módulos...' : 'Seleccione un Módulo'}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            className="w-full"
            filter
            filterBy="nombre,siglas,descripcion"
            emptyMessage={cursoSeleccionadoId ? 'No hay módulos impartidos en este curso.' : 'Seleccione primero un curso.'}
            emptyFilterMessage="No se encontraron módulos coincidentes."
            disabled={cargando || cargandoModulos || modulosDisponibles.length === 0}
          />
        </div>

        {/* Botón de acción: Recargar */}
        <div className="col-12 md:col-2 flex align-items-center justify-content-end">
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Recargar"
            size="small"
            severity="secondary"
            outlined
            className="w-full md:w-auto"
            onClick={recargar}
            loading={cargando}
            disabled={!moduloSeleccionadoId}
            tooltip="Actualizar calificaciones del módulo desde el servidor"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* 2. Fila con Input de Búsqueda a la izquierda y Botones de Exportar (CSV y PDF) a la derecha */}
      {totalFilas > 0 && (
        <div className="flex flex-column gap-2 pt-3 border-top-1 surface-border">
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
            {/* Input de Búsqueda a la izquierda */}
            <div className="p-input-icon-left w-full sm:w-20rem">
              <i className="pi pi-search" />
              <InputText
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar discente..."
                className="w-full p-inputtext-sm"
              />
            </div>

            {/* Botones de Exportar CSV y Exportar PDF alineados a la derecha */}
            <div className="flex align-items-center gap-2 flex-shrink-0">
              <Button
                type="button"
                icon="pi pi-file-excel"
                label="Exportar CSV"
                size="small"
                severity="success"
                outlined
                onClick={descargarCSV}
                loading={exportandoCSV}
                disabled={cargando || totalFilas === 0}
                tooltip="Descargar acta oficial en formato CSV para hoja de cálculo"
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
                disabled={cargando || totalFilas === 0}
                tooltip="Descargar acta oficial en formato PDF para Jefatura de Estudios"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>

          {/* 3. Texto informativo en una nueva línea debajo del input de búsqueda */}
          <div className="text-xs text-muted font-semibold pl-1">
            Mostrando {totalFiltradas} de {totalFilas} discentes matriculados
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeEvaluacionFiltros;
