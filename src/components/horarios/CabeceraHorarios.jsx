import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import HeaderPagina from '../common/HeaderPagina.jsx';

/**
 * CabeceraHorarios - Componente presentacional para la cabecera y selección del año académico.
 *
 * Responsabilidad Única: Renderizar el título general, subtítulo y el Dropdown de años
 * académicos registrados en la tabla Cursos, idéntico al del módulo de Calendario escolar.
 *
 * @param {Object} props
 * @param {number|null} props.anioSeleccionado - Año académico activo de inicio (ej. 2026).
 * @param {Array<Object>} [props.opcionesAnios=[]] - Lista de opciones de años ({ label, value }).
 * @param {Function} props.onCambiarAnio - Manejador al seleccionar un nuevo año académico.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 */
export const CabeceraHorarios = ({
  anioSeleccionado,
  opcionesAnios = [],
  onCambiarAnio,
  cargando = false
}) => {
  return (
    <div className="flex flex-column gap-3 w-full">
      <HeaderPagina
        titulo="Gestor de Horarios y Disponibilidad"
        descripcion="Definición de tramos horarios, cuadrícula semanal por cursos y visualización del horario docente."
        acciones={
          <div className="flex align-items-center gap-2 w-full md:w-auto">
            <label htmlFor="selector-anio-horarios" className="text-sm font-semibold text-700 white-space-nowrap">
              Año académico:
            </label>
            <div style={{ minWidth: '160px' }}>
              <Dropdown
                id="selector-anio-horarios"
                value={anioSeleccionado}
                options={opcionesAnios}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => onCambiarAnio && onCambiarAnio(e.value)}
                disabled={cargando}
                placeholder="Seleccione un año..."
                className="w-full p-inputtext-sm"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CabeceraHorarios;
