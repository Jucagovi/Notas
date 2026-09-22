import React from 'react';
import HeaderPagina from '../common/HeaderPagina.jsx';
import SelectorCurso from '../common/SelectorCurso.jsx';

/**
 * CabeceraHorarios - Componente presentacional para la cabecera y selección del curso activo.
 *
 * Responsabilidad Única: Renderizar el título general, subtítulo y el selector de curso académico.
 *
 * @param {Object} props
 * @param {Array<Object>} props.cursos - Listado de cursos académicos disponibles.
 * @param {string|null} props.cursoId - Identificador del curso académico actualmente seleccionado.
 * @param {Function} props.onCambiarCurso - Manejador al seleccionar un nuevo curso.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 */
export const CabeceraHorarios = ({
  cursos = [],
  cursoId,
  onCambiarCurso,
  cargando = false
}) => {
  return (
    <div className="flex flex-column gap-3 w-full">
      <HeaderPagina
        titulo="Gestor de Horarios y Disponibilidad"
        descripcion="Definición de tramos horarios, cuadrícula semanal por grupos y visualización del horario docente."
        acciones={
          <div className="flex align-items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-semibold text-700 white-space-nowrap">
              Curso:
            </span>
            <div style={{ minWidth: '240px' }}>
              <SelectorCurso
                value={cursoId}
                options={cursos}
                onChange={(e) => onCambiarCurso(e.value)}
                loading={cargando}
                disabled={cargando || cursos.length === 0}
                placeholder="Seleccionar curso..."
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CabeceraHorarios;
