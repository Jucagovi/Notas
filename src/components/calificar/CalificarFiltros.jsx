import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ordenarEvaluaciones } from '../../services/evaluacionService.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente de cabecera con desplegables dependientes para filtrar por Curso, Módulo y Evaluación
const CalificarFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  evaluacionesFiltradas = [],
  todasEvaluaciones = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  evaluacionSeleccionadaId,
  seleccionarEvaluacion,
  evaluacionSeleccionada,
  practicasEvaluacion = [],
  cargando = false,
  recargar = () => {}
}) => {
  // Opciones para el desplegable de Cursos
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones para el desplegable de Módulos
  const opcionesModulos = useMemo(() => {
    return (modulosDisponibles || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo,
      siglas: m.siglas,
      nombre: m.nombre
    }));
  }, [modulosDisponibles]);

  // Opciones para el desplegable de Evaluaciones ordenadas cronológicamente (Primera, Segunda, Final, Extraordinaria)
  const opcionesEvaluaciones = useMemo(() => {
    const lista =
      evaluacionesFiltradas && evaluacionesFiltradas.length > 0
        ? evaluacionesFiltradas
        : todasEvaluaciones;

    return ordenarEvaluaciones(lista || []).map((ev) => {
      const nombreModulo = ev.Modulos?.siglas || ev.Modulos?.nombre || 'Módulo';
      const nombreCurso = ev.Cursos?.nombre ? ` - ${ev.Cursos.nombre}` : '';
      return {
        label: `${ev.nombre} Evaluación - ${nombreModulo}${nombreCurso}`,
        value: ev.id_evaluacion
      };
    });
  }, [evaluacionesFiltradas, todasEvaluaciones]);

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
      {/* Fila principal con los 3 selectores dependientes */}
      <div className="grid align-items-center">
        {/* 1. Selector de Curso Académico */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-curso-calificar" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar mr-1" /> Curso Académico:
          </label>
          <Dropdown
            id="filtro-curso-calificar"
            value={cursoSeleccionadoId}
            options={opcionesCursos}
            onChange={(e) => {
              setCursoSeleccionadoId(e.value);
              // Si la evaluación seleccionada no pertenece al nuevo curso, se deselecciona
              if (evaluacionSeleccionada && evaluacionSeleccionada.id_curso !== e.value) {
                seleccionarEvaluacion(null);
              }
            }}
            placeholder="Seleccione un Curso..."
            showClear
            filter
            className="w-full text-sm"
          />
        </div>

        {/* 2. Selector de Módulo Profesional */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-modulo-calificar" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-book mr-1" /> Módulo Profesional:
          </label>
          <Dropdown
            id="filtro-modulo-calificar"
            value={moduloSeleccionadoId}
            options={opcionesModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            filterBy="label,siglas,nombre"
            onChange={(e) => {
              setModuloSeleccionadoId(e.value);
              // Si la evaluación seleccionada no pertenece al nuevo módulo, se deselecciona
              if (evaluacionSeleccionada && evaluacionSeleccionada.id_modulo !== e.value) {
                seleccionarEvaluacion(null);
              }
            }}
            placeholder="Seleccione un Módulo..."
            showClear
            filter
            className="w-full text-sm"
          />
        </div>

        {/* 3. Selector de Periodo de Evaluación */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-evaluacion-calificar" className="block text-sm font-semibold mb-1 text-primary">
            <i className="pi pi-check-square mr-1" /> Periodo de Evaluación (*):
          </label>
          <Dropdown
            id="filtro-evaluacion-calificar"
            value={evaluacionSeleccionadaId}
            options={opcionesEvaluaciones}
            onChange={(e) => seleccionarEvaluacion(e.value)}
            placeholder={
              opcionesEvaluaciones.length === 0
                ? 'No hay evaluaciones disponibles'
                : 'Seleccione una Evaluación...'
            }
            showClear
            filter
            className="w-full font-semibold"
          />
        </div>
      </div>

      {/* Barra de estado y resumen del contexto seleccionado */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-2 border-top-1 surface-border">
        <div className="flex flex-wrap align-items-center gap-2">
          {evaluacionSeleccionada ? (
            <>
              <Tag
                severity="info"
                icon="pi pi-bookmark"
                value={`${evaluacionSeleccionada.nombre} Evaluación`}
                className="font-bold"
              />
              <Tag
                severity="secondary"
                icon="pi pi-book"
                value={evaluacionSeleccionada.Modulos?.nombre || 'Módulo'}
              />
              <Tag
                severity={practicasEvaluacion.length > 0 ? 'success' : 'warning'}
                icon="pi pi-file-edit"
                value={`${practicasEvaluacion.length} Práctica${practicasEvaluacion.length === 1 ? '' : 's'} en esta evaluación`}
              />
            </>
          ) : (
            <span className="text-sm text-muted">
              Seleccione un Curso, Módulo y Evaluación para cargar las prácticas vinculadas.
            </span>
          )}
        </div>

        <div className="flex align-items-center gap-2 justify-content-end">
          <Button
            type="button"
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            text
            loading={cargando}
            onClick={recargar}
            tooltip="Recargar datos actualizados"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalificarFiltros;
