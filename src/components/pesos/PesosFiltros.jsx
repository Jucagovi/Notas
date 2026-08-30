import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ordenarEvaluaciones } from '../../services/evaluacionService.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente de cabecera con selectores dependientes para Curso, Módulo y Evaluación
const PesosFiltros = ({
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
  totalPracticas = 0,
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
      {/* Selectores de filtrado principal */}
      <div className="grid align-items-center">
        {/* Selector de Curso */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-curso-pesos" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar mr-1" /> Curso Académico:
          </label>
          <Dropdown
            id="filtro-curso-pesos"
            value={cursoSeleccionadoId}
            options={opcionesCursos}
            onChange={(e) => {
              setCursoSeleccionadoId(e.value);
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

        {/* Selector de Módulo */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-modulo-pesos" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-book mr-1" /> Módulo Profesional:
          </label>
          <Dropdown
            id="filtro-modulo-pesos"
            value={moduloSeleccionadoId}
            options={opcionesModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            filterBy="label,siglas,nombre"
            onChange={(e) => {
              setModuloSeleccionadoId(e.value);
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

        {/* Selector de Evaluación */}
        <div className="col-12 md:col-4">
          <label htmlFor="filtro-evaluacion-pesos" className="block text-sm font-semibold mb-1 text-primary">
            <i className="pi pi-percentage mr-1" /> Periodo de Evaluación (*):
          </label>
          <Dropdown
            id="filtro-evaluacion-pesos"
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

      {/* Resumen contextual de la evaluación seleccionada */}
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
                severity={totalPracticas > 0 ? 'success' : 'warning'}
                icon="pi pi-file-edit"
                value={`${totalPracticas} Práctica${totalPracticas === 1 ? '' : 's'} a ponderar`}
              />
            </>
          ) : (
            <span className="text-sm text-muted">
              Seleccione un Curso, Módulo y Evaluación para gestionar los pesos de sus prácticas.
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

export default PesosFiltros;
