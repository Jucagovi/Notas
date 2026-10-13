import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import SelectorCurso from '../common/SelectorCurso.jsx';

/**
 * FiltrosSeguimiento - Subcomponente presentacional para los filtros de cabecera.
 *
 * Responsabilidad Única: Renderizar únicamente el selector de Año Académico y el de Curso,
 * ya que cada curso escolar está asociado unívocamente a su módulo curricular correspondiente,
 * mostrando el módulo resuelto de forma automática y el campo del docente titular.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Lista de años académicos disponibles.
 * @param {number|null} props.anioSeleccionado - Año académico seleccionado actualmente.
 * @param {Function} props.onCambioAnio - Manejador de cambio de año académico.
 * @param {Array<Object>} props.cursos - Lista de cursos correspondientes al año activo.
 * @param {string|null} props.cursoSeleccionadoId - Identificador del curso activo.
 * @param {Function} props.onCambioCurso - Manejador de cambio de curso.
 * @param {Object|null} props.moduloActivo - Módulo profesional asociado al curso.
 * @param {string} props.profesor - Nombre del profesor titular.
 * @param {Function} props.onCambioProfesor - Manejador de actualización del nombre del profesor.
 * @param {boolean} [props.cargando=false] - Indicador visual de consulta en curso.
 */
const FiltrosSeguimiento = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  cursos = [],
  cursoSeleccionadoId = null,
  onCambioCurso,
  moduloActivo = null,
  profesor = '',
  onCambioProfesor,
  cargando = false
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="grid formgrid p-fluid row-gap-3">
        {/* 1. Selector de Año Académico con formato 2026/2027 */}
        <div className="col-12 sm:col-6 md:col-4">
          <label htmlFor="filtro-anio" className="block text-xs font-bold text-700 uppercase mb-2">
            Año Académico
          </label>
          <Dropdown
            id="filtro-anio"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            placeholder="Selecciona año..."
            disabled={cargando || anios.length === 0}
            className="w-full"
          />
        </div>

        {/* 2. Selector de Curso filtrado por el año académico activo */}
        <div className="col-12 sm:col-6 md:col-4">
          <label htmlFor="filtro-curso" className="block text-xs font-bold text-700 uppercase mb-2">
            Curso
          </label>
          <SelectorCurso
            id="filtro-curso"
            value={cursoSeleccionadoId}
            options={cursos}
            onChange={(e) => onCambioCurso(e.value)}
            disabled={cargando || cursos.length === 0}
            placeholder="Selecciona curso..."
            className="w-full"
          />
        </div>

        {/* 3. Módulo profesional asociado automáticamente al curso (sin DropDown) */}
        <div className="col-12 sm:col-12 md:col-4">
          <label className="block text-xs font-bold text-700 uppercase mb-2">
            Módulo Asociado
          </label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon bg-blue-50 text-blue-700">
              <i className="pi pi-book" />
            </span>
            <InputText
              value={
                moduloActivo
                  ? `${moduloActivo.siglas ? `${moduloActivo.siglas} - ` : ''}${moduloActivo.nombre}`
                  : 'Asignado automáticamente al seleccionar curso'
              }
              readOnly
              disabled={cargando}
              className="w-full font-semibold surface-100 text-800"
            />
          </div>
        </div>

        {/* 4. Campo de Docente Titular */}
        <div className="col-12">
          <label htmlFor="filtro-profesor" className="block text-xs font-bold text-700 uppercase mb-2">
            Profesor / Docente Titular
          </label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-user text-primary" />
            </span>
            <InputText
              id="filtro-profesor"
              value={profesor}
              onChange={(e) => onCambioProfesor(e.target.value)}
              placeholder="Nombre del docente..."
              disabled={cargando}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosSeguimiento;
