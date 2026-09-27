import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import SelectorCurso from '../common/SelectorCurso.jsx';

/**
 * FiltroCursoEvaluaciones - Barra superior de selección de curso y actualización de datos.
 *
 * Responsabilidad Única: Renderizar el selector de cursos, mostrar el indicador de prácticas huérfanas
 * en la bandeja de pendientes y proporcionar el botón para refrescar los datos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.cursos - Listado de cursos académicos disponibles.
 * @param {string|null} props.cursoSeleccionadoId - Identificador del curso activo.
 * @param {Function} props.onCursoChange - Manejador del cambio de curso.
 * @param {boolean} props.cargandoCursos - Indicador de consulta de cursos.
 * @param {number} props.totalHuerfanas - Cantidad de versiones en la bandeja de pendientes.
 * @param {Function} props.onRecargar - Manejador para refrescar los datos.
 * @param {boolean} props.guardando - Indicador de guardado en curso.
 */
export const FiltroCursoEvaluaciones = ({
  cursos = [],
  cursoSeleccionadoId = null,
  onCursoChange,
  cargandoCursos = false,
  totalHuerfanas = 0,
  onRecargar,
  guardando = false
}) => {
  return (
    <div className="surface-card p-3 border-round shadow-1 border-1 surface-border mb-3">
      <div className="grid align-items-center">
        {/* 1. Selector de Curso */}
        <div className="col-12 sm:col-7 md:col-8">
          <label
            htmlFor="selectorCursoEvaluaciones"
            className="block text-xs font-semibold text-600 uppercase mb-1"
          >
            Curso Académico
          </label>
          <SelectorCurso
            id="selectorCursoEvaluaciones"
            value={cursoSeleccionadoId}
            options={cursos}
            onChange={(e) => onCursoChange(e.value)}
            loading={cargandoCursos}
            disabled={cargandoCursos || guardando}
            placeholder="Selecciona un curso..."
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* 2. Indicador de la Bandeja de Pendientes y Botón de Actualizar Datos */}
        <div className="col-12 sm:col-5 md:col-4 flex align-items-center justify-content-end gap-3 pt-2 sm:pt-3">
          {cursoSeleccionadoId && (
            <div className="flex align-items-center gap-2">
              <Tag
                value={`${totalHuerfanas} pendientes`}
                severity={totalHuerfanas > 0 ? 'warning' : 'success'}
                icon={totalHuerfanas > 0 ? 'pi pi-inbox' : 'pi pi-check'}
                className="text-xs px-2 py-1"
              />
            </div>
          )}

          {/* Botón de actualizar datos con icono centrado vertical y horizontalmente y tamaño optimizado */}
          <Button
            type="button"
            icon="pi pi-refresh"
            tooltip="Actualizar datos del curso"
            tooltipOptions={{ position: 'top' }}
            onClick={onRecargar}
            disabled={guardando || !cursoSeleccionadoId}
            severity="secondary"
            outlined
            style={{ width: '2.75rem', height: '2.75rem' }}
            className="flex align-items-center justify-content-center p-0 flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltroCursoEvaluaciones;
