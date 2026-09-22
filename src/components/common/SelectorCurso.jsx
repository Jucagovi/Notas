import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorCurso - Componente presentacional para la selección de Cursos Académicos.
 *
 * Responsabilidad Única: Renderizar un desplegable estilizado de cursos mostrando icono,
 * nombre, año y centro escolar entre paréntesis.
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id_curso).
 * @param {Array<Object>} [props.options=[]] - Lista de opciones de cursos.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona un curso...'] - Texto de marcador de posición.
 * @param {boolean} [props.filter=true] - Habilitar filtro de búsqueda textual.
 * @param {string} [props.optionLabel='nombre'] - Clave para etiquetado y filtrado.
 * @param {string} [props.optionValue='id_curso'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor del Dropdown.
 */
export const SelectorCurso = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona un curso...',
  filter = true,
  optionLabel = 'nombre',
  optionValue = 'id_curso',
  className = 'w-full',
  ...restoProps
}) => {
  // Plantilla para cada elemento desplegado en la lista
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center justify-content-between w-full py-1">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-building text-primary" />
          <span className="font-semibold text-900">{opcion.nombre}</span>
          {opcion.centro && (
            <span className="text-color-secondary text-sm">
              ({opcion.centro})
            </span>
          )}
        </div>
        {opcion.anyo && (
          <span className="text-color-secondary font-medium text-sm ml-2">
            {opcion.anyo}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el elemento seleccionado en el input cerrado
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-building text-primary" />
        <span className="font-semibold text-900">{opcion.nombre}</span>
        {opcion.anyo && (
          <span className="text-color-secondary text-sm">
            {opcion.anyo}
          </span>
        )}
        {opcion.centro && (
          <span className="text-color-secondary text-sm">
            ({opcion.centro})
          </span>
        )}
      </div>
    );
  };

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={onChange}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      filter={filter}
      filterBy="nombre,anyo,centro"
      optionLabel={optionLabel}
      optionValue={optionValue}
      itemTemplate={plantillaItem}
      valueTemplate={plantillaValor}
      emptyMessage="No hay cursos disponibles"
      emptyFilterMessage="No se encontraron cursos coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorCurso;
