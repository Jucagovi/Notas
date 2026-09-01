import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';

// Componente de filtros superiores y barra de herramientas para el acta de evaluación por Resultados de Aprendizaje
const InformeEvaluacionRaFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  terminoBusqueda,
  setTerminoBusqueda,
  campoOrden = 'apellidos',
  direccionOrden = 'asc',
  alternarOrdenacion = () => {},
  soloCompletos = false,
  conmutarModoEvaluacion,
  cargando = false,
  cargandoModulos = false,
  exportandoCSV = false,
  exportandoPDF = false,
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
          <label htmlFor="selector-curso-ra" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-calendar mr-1" />
            Curso Académico
          </label>
          <Dropdown
            id="selector-curso-ra"
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

        {/* Selector de Módulo Profesional (requiere selección manual del usuario) */}
        <div className="col-12 md:col-5">
          <label htmlFor="selector-modulo-ra" className="block text-xs font-bold text-muted mb-2 uppercase">
            <i className="pi pi-book mr-1" />
            Módulo Profesional
          </label>
          <Dropdown
            id="selector-modulo-ra"
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
            tooltip="Actualizar calificaciones por RA desde el servidor"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* 2. Barra de herramientas inferior con búsqueda, ordenación, botón de evaluación y exportaciones */}
      {totalFilas > 0 && (
        <div className="flex flex-column gap-3 pt-3 border-top-1 surface-border">
          <div className="flex flex-column xl:flex-row xl:align-items-center xl:justify-content-between gap-3">
            {/* Buscador de Discentes y Botones de Ordenación */}
            <div className="flex flex-wrap align-items-center gap-2">
              <div className="p-input-icon-left w-full sm:w-16rem">
                <i className="pi pi-search" />
                <InputText
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  placeholder="Buscar discente..."
                  className="w-full p-inputtext-sm"
                />
              </div>

              {/* Botones para ordenar a los discentes por nombre o por apellidos */}
              <div className="flex align-items-center gap-1">
                <Button
                  type="button"
                  icon={
                    campoOrden === 'apellidos'
                      ? (direccionOrden === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up')
                      : 'pi pi-sort-alt'
                  }
                  label={
                    campoOrden === 'apellidos'
                      ? (direccionOrden === 'asc' ? 'Apellidos (A-Z)' : 'Apellidos (Z-A)')
                      : 'Apellidos'
                  }
                  size="small"
                  severity={campoOrden === 'apellidos' ? 'primary' : 'secondary'}
                  outlined={campoOrden !== 'apellidos'}
                  onClick={() => alternarOrdenacion('apellidos')}
                  tooltip="Ordenar discentes por apellidos (haga clic para alternar A-Z y Z-A)"
                  tooltipOptions={{ position: 'top' }}
                />
                <Button
                  type="button"
                  icon={
                    campoOrden === 'nombre'
                      ? (direccionOrden === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up')
                      : 'pi pi-sort-alt'
                  }
                  label={
                    campoOrden === 'nombre'
                      ? (direccionOrden === 'asc' ? 'Nombre (A-Z)' : 'Nombre (Z-A)')
                      : 'Nombre'
                  }
                  size="small"
                  severity={campoOrden === 'nombre' ? 'primary' : 'secondary'}
                  outlined={campoOrden !== 'nombre'}
                  onClick={() => alternarOrdenacion('nombre')}
                  tooltip="Ordenar discentes por nombre (haga clic para alternar A-Z y Z-A)"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            </div>

            {/* Botones de acción: Cálculo de Evaluación Continua y Exportación */}
            <div className="flex flex-wrap align-items-center gap-2">
              {/* Botón para alternar el cálculo de nota para evaluación continua (sólo RA completos totalizada a 100) */}
              <Button
                type="button"
                icon={soloCompletos ? 'pi pi-check-circle' : 'pi pi-calculator'}
                label={soloCompletos ? 'Modo: Evaluación Continua' : 'Calcular nota para evaluación'}
                size="small"
                severity={soloCompletos ? 'help' : 'secondary'}
                outlined={!soloCompletos}
                onClick={conmutarModoEvaluacion}
                disabled={cargando || totalFilas === 0}
                tooltip={
                  soloCompletos
                    ? 'Haga clic para volver a la ponderación anual ordinaria con todos los RA'
                    : 'Calcula la nota temporal considerando únicamente los RA completos y totalizada al 100%'
                }
                tooltipOptions={{ position: 'top' }}
              />

              {/* Botón de Exportar a CSV */}
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
                tooltip="Descargar acta por RA en formato CSV para hoja de cálculo"
                tooltipOptions={{ position: 'top' }}
              />

              {/* Botón de Exportar a PDF */}
              <Button
                type="button"
                icon="pi pi-file-pdf"
                label="Exportar PDF"
                size="small"
                severity="primary"
                onClick={descargarPDF}
                loading={exportandoPDF}
                disabled={cargando || totalFilas === 0}
                tooltip="Descargar acta oficial en PDF con desglose por RA y firma"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>

          {/* 3. Indicador de estado y modo de cálculo activo */}
          <div className="flex flex-wrap align-items-center justify-content-between gap-2 text-xs text-muted font-semibold pl-1">
            <span>
              Mostrando {totalFiltradas} de {totalFilas} discentes matriculados
            </span>
            <div className="flex align-items-center gap-2">
              <span className="text-500">Modo de cálculo:</span>
              {soloCompletos ? (
                <Tag
                  value="Evaluación Continua (sólo RA completos, totalizado a 100)"
                  severity="info"
                  icon="pi pi-bolt"
                  className="text-xs"
                />
              ) : (
                <Tag
                  value="Ponderación Anual Oficial (todos los RA)"
                  severity="success"
                  icon="pi pi-check"
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeEvaluacionRaFiltros;
