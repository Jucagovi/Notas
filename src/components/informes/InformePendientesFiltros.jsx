import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';

// Componente para los filtros del informe de calificaciones pendientes basado en curso académico
const InformePendientesFiltros = ({
  cursos = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  terminoBusqueda = '',
  setTerminoBusqueda = () => {},
  totalPendientesCurso = 0,
  cargando = false,
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

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="grid align-items-center">
        {/* Desplegable único: Curso Académico */}
        <div className="col-12 md:col-5">
          <label htmlFor="select-curso" className="block text-xs font-bold text-muted uppercase mb-1">
            Curso Académico
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

        {/* Barra de búsqueda y acciones rápidas */}
        <div className="col-12 md:col-7 flex flex-column sm:flex-row align-items-stretch sm:align-items-center justify-content-end gap-2 pt-2 md:pt-4">
          {/* Campo de búsqueda libre */}
          <div className="p-input-icon-left w-full sm:w-18rem">
            <i className="pi pi-search" />
            <InputText
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar discente o práctica..."
              className="w-full p-inputtext-sm"
              disabled={cargando || !cursoSeleccionadoId}
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

          {/* Contador e insignias */}
          <div className="flex align-items-center gap-2 justify-content-end">
            {cursoSeleccionadoId && (
              <Badge
                value={`${totalPendientesCurso} pendiente${totalPendientesCurso === 1 ? '' : 's'}`}
                severity={totalPendientesCurso > 0 ? 'warning' : 'success'}
                tooltip="Total de calificaciones pendientes en el curso"
                tooltipOptions={{ position: 'top' }}
              />
            )}

            <Button
              type="button"
              icon="pi pi-refresh"
              size="small"
              severity="secondary"
              outlined
              onClick={recargar}
              loading={cargando}
              tooltip="Actualizar calificaciones pendientes"
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
              disabled={cargando || !cursoSeleccionadoId}
              tooltip="Descargar informe del módulo activo en formato PDF"
              tooltipOptions={{ position: 'top' }}
              aria-label="Exportar a PDF"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformePendientesFiltros;
