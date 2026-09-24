import React from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import SelectorCurso from '../common/SelectorCurso.jsx';
import SelectorModulo from '../common/SelectorModulo.jsx';
import BotonAccion from '../common/BotonAccion.jsx';

/**
 * FiltrosCurriculo - Componente presentacional para la selección de curso y módulo,
 * cambio de vista y disparadores de acciones para el gestor de unidades de trabajo.
 *
 * Responsabilidad Única: Renderizar los selectores de dominio estandarizados y los controles
 * de acción principales sin ejecutar peticiones HTTP directamente.
 *
 * @param {Object} props
 * @param {string|null} props.cursoSeleccionadoId - Identificador del curso activo.
 * @param {Function} props.onCursoChange - Manejador de cambio de curso.
 * @param {Array<Object>} props.cursos - Listado de cursos académicos.
 * @param {boolean} props.cargandoCursos - Estado de carga de cursos.
 * @param {string|null} props.moduloSeleccionadoId - Identificador del módulo activo.
 * @param {Function} props.onModuloChange - Manejador de cambio de módulo.
 * @param {Array<Object>} props.modulos - Listado de módulos profesionales.
 * @param {boolean} props.cargandoModulos - Estado de carga de módulos.
 * @param {Function} props.onNuevaUT - Manejador para abrir el diálogo de nueva UT.
 * @param {Function} props.onRecargar - Manejador para refrescar los datos.
 * @param {boolean} props.cargando - Estado de carga general.
 * @param {number} props.totalUTs - Total de unidades de trabajo existentes.
 * @param {number} props.totalHuerfanas - Total de actividades sin asignar.
 * @param {number} props.totalVersiones - Total de actividades registradas.
 * @param {string} props.vistaActiva - Vista activa actual ('visual' o 'tabla').
 * @param {Function} props.onVistaChange - Manejador para alternar la vista.
 */
const FiltrosCurriculo = ({
  cursoSeleccionadoId,
  onCursoChange,
  cursos = [],
  cargandoCursos = false,
  moduloSeleccionadoId,
  onModuloChange,
  modulos = [],
  cargandoModulos = false,
  onNuevaUT,
  onRecargar,
  cargando = false,
  totalUTs = 0,
  totalHuerfanas = 0,
  totalVersiones = 0,
  vistaActiva = 'visual',
  onVistaChange
}) => {
  // Opciones para el selector de modo de vista.
  const opcionesVista = [
    { label: 'Gestión Drag & Drop', value: 'visual', icon: 'pi pi-objects-column' },
    { label: 'Vista Tabular', value: 'tabla', icon: 'pi pi-table' }
  ];

  return (
    <div className="surface-card border-round border-1 surface-border p-3 mb-4 shadow-1">
      <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
        {/* Bloque de selectores de dominio */}
        <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-3 flex-1">
          <div className="w-full sm:w-16rem">
            <label className="block text-xs font-semibold text-color-secondary mb-1">
              Curso Académico
            </label>
            <SelectorCurso
              value={cursoSeleccionadoId}
              options={cursos}
              onChange={(e) => onCursoChange(e.value)}
              loading={cargandoCursos}
              placeholder="Seleccionar curso..."
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-20rem">
            <label className="block text-xs font-semibold text-color-secondary mb-1">
              Módulo Profesional
            </label>
            <SelectorModulo
              value={moduloSeleccionadoId}
              options={modulos}
              onChange={(e) => onModuloChange(e.value)}
              loading={cargandoModulos}
              placeholder="Seleccionar módulo..."
              className="w-full"
            />
          </div>
        </div>

        {/* Bloque de alternancia de vista y acciones */}
        <div className="flex flex-wrap align-items-center justify-content-between lg:justify-content-end gap-2">
          {/* Selector de tipo de vista */}
          <SelectButton
            value={vistaActiva}
            onChange={(e) => e.value && onVistaChange(e.value)}
            options={opcionesVista}
            optionLabel="label"
            className="p-buttonset-sm"
          />

          {/* Botón para crear una nueva unidad de trabajo */}
          <Button
            label="Nueva Unidad"
            icon="pi pi-plus"
            severity="primary"
            onClick={onNuevaUT}
            disabled={!moduloSeleccionadoId || cargando}
            tooltip={!moduloSeleccionadoId ? 'Selecciona un módulo previamente.' : 'Añadir nueva unidad didáctica.'}
            tooltipOptions={{ position: 'top' }}
          />

          {/* Botón para refrescar los datos */}
          <BotonAccion
            tipo="cancelar"
            label=""
            icon="pi pi-refresh"
            onClick={onRecargar}
            disabled={cargando}
            tooltip="Actualizar datos curriculares."
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Resumen numérico informativo de la selección actual */}
      {moduloSeleccionadoId && (
        <div className="flex align-items-center gap-3 mt-3 pt-2 border-top-1 surface-border text-xs text-color-secondary flex-wrap">
          <span className="flex align-items-center gap-1">
            <i className="pi pi-folder text-primary" />
            <span>Unidades Didácticas:</span>
            <strong className="text-900">{totalUTs}</strong>
          </span>
          <span>•</span>
          <span className="flex align-items-center gap-1">
            <i className="pi pi-file text-primary" />
            <span>Total Actividades:</span>
            <strong className="text-900">{totalVersiones}</strong>
          </span>
          <span>•</span>
          <span className="flex align-items-center gap-1">
            <i className="pi pi-exclamation-circle text-orange-500" />
            <span>Sin asignar (huérfanas):</span>
            <strong className={totalHuerfanas > 0 ? 'text-orange-500 font-bold' : 'text-900'}>
              {totalHuerfanas}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default FiltrosCurriculo;
