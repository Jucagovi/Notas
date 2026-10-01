import React from 'react';
import { Button } from 'primereact/button';
import SelectorCurso from '../common/SelectorCurso.jsx';
import SelectorModulo from '../common/SelectorModulo.jsx';

/**
 * FiltrosProgreso - Componente presentacional para los filtros de Curso y Módulo.
 *
 * Responsabilidad Única: Renderizar los desplegables estandarizados de selección de
 * Curso Académico y Módulo Profesional junto al botón de recarga de datos, empleando
 * estrictamente los selectores especializados de dominio ubicados en common.
 *
 * @param {Object} props
 * @param {Array<Object>} props.cursos - Catálogo de cursos académicos disponibles.
 * @param {string|null} props.cursoSeleccionadoId - Identificador del curso activo.
 * @param {Function} props.onCambioCurso - Manejador del cambio de curso.
 * @param {Array<Object>} props.modulos - Catálogo de módulos profesionales.
 * @param {string|null} props.moduloSeleccionadoId - Identificador del módulo seleccionado.
 * @param {Function} props.onCambioModulo - Manejador del cambio de módulo.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} [props.onRecargar] - Manejador para refrescar los datos.
 */
export const FiltrosProgreso = ({
  cursos = [],
  cursoSeleccionadoId = null,
  onCambioCurso,
  modulos = [],
  moduloSeleccionadoId = null,
  onCambioModulo,
  cargando = false,
  onRecargar
}) => {
  return (
    <div className="surface-card p-3 shadow-1 border-round mb-4 border-1 surface-border">
      <div className="grid align-items-center">
        {/* Selector de Curso Académico */}
        <div className="col-12 md:col-5">
          <label
            htmlFor="filtro-curso-progreso"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Curso Académico
          </label>
          <SelectorCurso
            id="filtro-curso-progreso"
            value={cursoSeleccionadoId}
            options={cursos}
            onChange={(e) => onCambioCurso && onCambioCurso(e.value)}
            loading={cargando}
            placeholder="Selecciona un curso..."
            className="w-full"
          />
        </div>

        {/* Selector de Módulo Profesional */}
        <div className="col-12 md:col-6">
          <label
            htmlFor="filtro-modulo-progreso"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Módulo Profesional
          </label>
          <SelectorModulo
            id="filtro-modulo-progreso"
            value={moduloSeleccionadoId}
            options={modulos}
            onChange={(e) => onCambioModulo && onCambioModulo(e.value)}
            loading={cargando}
            placeholder="Selecciona un módulo formativo..."
            className="w-full"
          />
        </div>

        {/* Botón de refresco manual */}
        {onRecargar && (
          <div className="col-12 md:col-1 flex justify-content-end md:justify-content-center mt-2 md:mt-4">
            <Button
              icon="pi pi-refresh"
              tooltip="Actualizar datos"
              tooltipOptions={{ position: 'top' }}
              onClick={onRecargar}
              loading={cargando}
              text
              rounded
              severity="secondary"
              aria-label="Refrescar informe"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosProgreso;
