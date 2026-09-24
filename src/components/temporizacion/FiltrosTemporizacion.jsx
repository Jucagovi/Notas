import React from 'react';
import { Button } from 'primereact/button';
import SelectorCurso from '../common/SelectorCurso.jsx';
import SelectorModulo from '../common/SelectorModulo.jsx';

/**
 * FiltrosTemporizacion - Barra de selección y acciones para la temporización del módulo.
 *
 * Responsabilidad Única: Renderizar los selectores de Curso y Módulo profesional,
 * así como los botones de control para refrescar y restablecer el orden curricular.
 *
 * @param {Object} props
 * @param {string|null} props.cursoSeleccionadoId - Identificador del curso activo.
 * @param {Function} props.onCursoChange - Manejador de cambio de curso.
 * @param {Array<Object>} props.cursos - Listado de cursos académicos disponibles.
 * @param {boolean} props.cargandoCursos - Indicador de carga de cursos.
 * @param {string|null} props.moduloSeleccionadoId - Identificador del módulo activo.
 * @param {Function} props.onModuloChange - Manejador de cambio de módulo.
 * @param {Array<Object>} props.modulos - Listado de módulos profesionales disponibles.
 * @param {boolean} props.cargandoModulos - Indicador de carga de módulos.
 * @param {Function} props.onRecargar - Callback para recargar los datos.
 * @param {Function} props.onRestablecerOrden - Callback para restablecer el orden original.
 * @param {boolean} props.cargando - Indicador de consulta de datos en progreso.
 * @param {boolean} props.guardando - Indicador de persistencia en progreso.
 * @param {number} props.totalUnidades - Cantidad total de unidades listadas.
 */
export const FiltrosTemporizacion = ({
  cursoSeleccionadoId,
  onCursoChange,
  cursos = [],
  cargandoCursos = false,
  moduloSeleccionadoId,
  onModuloChange,
  modulos = [],
  cargandoModulos = false,
  onRecargar,
  onRestablecerOrden,
  cargando = false,
  guardando = false,
  totalUnidades = 0
}) => {
  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="grid formgrid p-fluid align-items-end">
        {/* Selector de Curso Académico */}
        <div className="col-12 md:col-4">
          <label htmlFor="selector-curso" className="font-semibold text-800 text-sm mb-2 block">
            Curso Académico
          </label>
          <SelectorCurso
            id="selector-curso"
            value={cursoSeleccionadoId}
            options={cursos}
            onChange={(e) => onCursoChange(e.value)}
            loading={cargandoCursos}
            disabled={cargando || guardando}
            placeholder="Seleccionar curso escolar..."
          />
        </div>

        {/* Selector de Módulo Profesional */}
        <div className="col-12 md:col-5">
          <label htmlFor="selector-modulo" className="font-semibold text-800 text-sm mb-2 block">
            Módulo Profesional
          </label>
          <SelectorModulo
            id="selector-modulo"
            value={moduloSeleccionadoId}
            options={modulos}
            onChange={(e) => onModuloChange(e.value)}
            loading={cargandoModulos}
            disabled={cargando || guardando}
            placeholder="Seleccionar módulo profesional..."
          />
        </div>

        {/* Botones de acción complementarios */}
        <div className="col-12 md:col-3 flex align-items-center justify-content-end gap-2 mt-3 md:mt-0">
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Actualizar"
            severity="secondary"
            outlined
            onClick={onRecargar}
            loading={cargando}
            disabled={!cursoSeleccionadoId || !moduloSeleccionadoId || guardando}
            tooltip="Volver a consultar los datos desde la base de datos"
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            type="button"
            icon="pi pi-sort-numeric-down"
            label="Restablecer"
            severity="secondary"
            outlined
            onClick={onRestablecerOrden}
            disabled={!cursoSeleccionadoId || !moduloSeleccionadoId || cargando || guardando || totalUnidades <= 1}
            tooltip="Volver a ordenar las unidades según su número curricular oficial"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosTemporizacion;
