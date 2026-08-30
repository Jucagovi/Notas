import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

// Opciones disponibles para el filtrado por estado de cobertura
const BOTONES_FILTRO = [
  { id: 'todos', label: 'Todos', icon: 'pi pi-list', severityActivo: 'primary' },
  { id: 'completo', label: '100% Cubiertos', icon: 'pi pi-check-circle', severityActivo: 'success' },
  { id: 'incompleto', label: 'Incompletos (<100%)', icon: 'pi pi-exclamation-triangle', severityActivo: 'danger' },
  { id: 'sin_cubrir', label: 'Sin cubrir (0%)', icon: 'pi pi-minus-circle', severityActivo: 'secondary' },
  { id: 'excedido', label: 'Sobrecobertura (>100%)', icon: 'pi pi-times-circle', severityActivo: 'danger' }
];

// Componente de filtros superiores y herramientas de búsqueda para el informe de cobertura curricular
const InformeCoberturaFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  filtroEstado,
  setFiltroEstado,
  terminoBusqueda,
  setTerminoBusqueda,
  cargando,
  cargandoModulos,
  exportandoPDF,
  recargar,
  descargarPDF,
  totalFilas = 0,
  totalFiltradas = 0
}) => {
  // Plantilla de renderizado para las opciones del desplegable de cursos
  const plantillaOpcionCurso = (opcion) => {
    if (!opcion) return null;
    return <span className="font-semibold text-sm py-1 block">{opcion.nombre}</span>;
  };

  // Plantilla para la opción seleccionada de curso
  const plantillaValorCurso = (opcion, props) => {
    if (opcion) {
      return <span className="text-sm font-semibold text-color">{opcion.nombre}</span>;
    }
    return <span>{props.placeholder}</span>;
  };

  // Plantilla de renderizado para las opciones del desplegable de módulos
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

  // Plantilla para la opción seleccionada de módulo
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
      {/* 1. Fila de selectores primarios (Curso, Módulo) y botones de acción */}
      <div className="grid align-items-end">
        {/* Selector de Curso Académico */}
        <div className="col-12 md:col-4">
          <label htmlFor="selector-curso" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-calendar mr-1" />
            Curso Académico
          </label>
          <Dropdown
            id="selector-curso"
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

        {/* Selector dependiente de Módulo Profesional */}
        <div className="col-12 md:col-5">
          <label htmlFor="selector-modulo" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-book mr-1" />
            Módulo Profesional
          </label>
          <Dropdown
            id="selector-modulo"
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
            emptyMessage={cursoSeleccionadoId ? 'No hay módulos asignados a este curso.' : 'Seleccione primero un curso.'}
            emptyFilterMessage="No se encontraron módulos coincidentes."
            disabled={cargando || cargandoModulos || modulosDisponibles.length === 0}
          />
        </div>

        {/* Botones de acción: Recargar y Exportar a PDF */}
        <div className="col-12 md:col-3 flex align-items-center justify-content-end gap-2">
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Recargar"
            size="small"
            severity="secondary"
            outlined
            onClick={recargar}
            loading={cargando}
            tooltip="Actualizar datos de cobertura curricular desde el servidor"
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
            tooltip="Descargar informe completo de auditoría en formato PDF"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* 2. Fila centrada con botones independientes de filtrado por estado con separación amplia y estilo outline */}
      {totalFilas > 0 && (
        <div className="flex flex-column align-items-center justify-content-center gap-3 pt-2 border-top-1 surface-border">
          <div className="flex align-items-center justify-content-center flex-wrap gap-4 w-full">
            {BOTONES_FILTRO.map((boton) => {
              const estaActivo = filtroEstado === boton.id;
              return (
                <Button
                  key={boton.id}
                  type="button"
                  label={boton.label}
                  icon={boton.icon}
                  size="small"
                  outlined={!estaActivo}
                  severity={estaActivo ? boton.severityActivo : 'secondary'}
                  className={`px-3 py-2 text-xs font-semibold ${!estaActivo ? 'border-1 surface-border text-color-secondary' : 'shadow-1'}`}
                  onClick={() => setFiltroEstado(boton.id)}
                />
              );
            })}
          </div>

          {/* Contador de resultados */}
          <div className="text-xs text-muted font-semibold text-center">
            Mostrando {totalFiltradas} de {totalFilas} criterios
          </div>
        </div>
      )}

      {/* 3. Fila independiente para la barra de búsqueda */}
      {totalFilas > 0 && (
        <div className="w-full">
          <div className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar por código CE, RA o práctica..."
              className="w-full p-inputtext-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeCoberturaFiltros;
