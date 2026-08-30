import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import { ordenarEvaluaciones } from '../../services/evaluacionService.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente de filtros y controles superiores para la selección de curso, módulo y evaluación
const EvaluacionFiltros = ({ alAbrirGestionEvaluacion = () => {} }) => {
  const {
    cursos,
    modulosDisponibles,
    todasEvaluaciones,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    evaluacionSeleccionada,
    practicas,
    estructuraRA,
    asignacionesTrabajan,
    practicasEvaluacion,
    cargando,
    recargarTodo
  } = useEvaluacionGestionContexto();

  // Opciones para el desplegable de Cursos
  const opcionesCursos = (cursos || []).map((c) => ({
    label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
    value: c.id_curso
  }));

  // Opciones para el desplegable de Módulos
  const opcionesModulos = (modulosDisponibles || []).map((m) => ({
    label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
    value: m.id_modulo,
    siglas: m.siglas,
    nombre: m.nombre
  }));

  // Opciones para el desplegable de Evaluaciones ordenadas cronológicamente
  const opcionesEvaluaciones = ordenarEvaluaciones(
    (todasEvaluaciones || []).filter((ev) => {
      const coincideCurso = !cursoSeleccionadoId || ev.id_curso === cursoSeleccionadoId;
      const coincideModulo = !moduloSeleccionadoId || ev.id_modulo === moduloSeleccionadoId;
      return coincideCurso && coincideModulo;
    })
  ).map((ev) => {
    const nombreModulo = ev.Modulos?.siglas || ev.Modulos?.nombre || 'Módulo';
    const nombreCurso = ev.Cursos?.nombre ? ` - ${ev.Cursos.nombre}` : '';
    return {
      label: `${ev.nombre} Evaluación - ${nombreModulo}${nombreCurso}`,
      value: ev.id_evaluacion
    };
  });

  // Cálculo de estadísticas resumidas del módulo actual
  const totalCriterios = estructuraRA.reduce((acc, ra) => acc + (ra.criterios?.length || 0), 0);
  const cesCubiertosSet = new Set(asignacionesTrabajan.map((t) => t.id_ce));
  const totalCESCubiertos = cesCubiertosSet.size;

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
      {/* Fila principal de controles desplegables */}
      <div className="grid align-items-center">
        {/* Desplegable de Selección de Curso */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-curso" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar mr-1" /> Curso Académico:
          </label>
          <Dropdown
            id="select-curso"
            value={cursoSeleccionadoId}
            options={opcionesCursos}
            onChange={(e) => {
              setCursoSeleccionadoId(e.value);
              // Si la evaluación actual no coincide con el nuevo curso, se deselecciona
              if (evaluacionSeleccionada && evaluacionSeleccionada.id_curso !== e.value) {
                seleccionarEvaluacion(null);
              }
            }}
            placeholder="Seleccione un Curso..."
            showClear
            filter
            className="w-full"
          />
        </div>

        {/* Desplegable de Selección de Módulo */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-modulo" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-book mr-1" /> Módulo Profesional:
          </label>
          <Dropdown
            id="select-modulo"
            value={moduloSeleccionadoId}
            options={opcionesModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            filterBy="label,siglas,nombre"
            onChange={(e) => {
              setModuloSeleccionadoId(e.value);
              // Si la evaluación actual no coincide con el nuevo módulo, se deselecciona
              if (evaluacionSeleccionada && evaluacionSeleccionada.id_modulo !== e.value) {
                seleccionarEvaluacion(null);
              }
            }}
            placeholder="Seleccione un Módulo..."
            showClear
            filter
            className="w-full"
          />
        </div>

        {/* Desplegable de Selección de Evaluación */}
        <div className="col-12 md:col-4">
          <label htmlFor="select-evaluacion" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar-plus mr-1" /> Periodo de Evaluación:
          </label>
          <Dropdown
            id="select-evaluacion"
            value={evaluacionSeleccionadaId}
            options={opcionesEvaluaciones}
            onChange={(e) => seleccionarEvaluacion(e.value)}
            placeholder={
              opcionesEvaluaciones.length === 0
                ? 'No hay evaluaciones para los filtros'
                : 'Seleccione una Evaluación...'
            }
            showClear
            filter
            className="w-full"
          />
        </div>
      </div>

      {/* Fila secundaria: Resumen del estado actual y acciones rápidas */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-2 border-top-1 surface-border">
        <div className="flex flex-wrap align-items-center gap-2">
          {moduloSeleccionadoId ? (
            <>
              <Tag
                severity="info"
                icon="pi pi-file-edit"
                value={`${practicas.length} Prácticas disponibles`}
              />
              <Tag
                severity="success"
                icon="pi pi-check-circle"
                value={`${estructuraRA.length} RA (${totalCESCubiertos}/${totalCriterios} CE cubiertos)`}
              />
              {evaluacionSeleccionada && (
                <Tag
                  severity="warning"
                  icon="pi pi-bookmark"
                  value={`${practicasEvaluacion.length} Prácticas en ${evaluacionSeleccionada.nombre}`}
                />
              )}
            </>
          ) : (
            <span className="text-sm text-muted">
              Seleccione un módulo o una evaluación para comenzar el mapeo con Resultados de Aprendizaje.
            </span>
          )}
        </div>

        <div className="flex align-items-center gap-2 justify-content-end">
          {evaluacionSeleccionada && (
            <Button
              type="button"
              label="Ver Evaluación"
              icon="pi pi-sliders-h"
              size="small"
              severity="secondary"
              outlined
              onClick={alAbrirGestionEvaluacion}
              tooltip="Gestionar prácticas vinculadas a esta evaluación reglamentaria"
              tooltipOptions={{ position: 'top' }}
            />
          )}
          <Button
            type="button"
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            text
            loading={cargando}
            onClick={recargarTodo}
            tooltip="Recargar datos actualizados"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluacionFiltros;
