import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorDiscente - Componente presentacional para la selección de Discentes (Alumnado).
 *
 * Responsabilidad Única: Renderizar un desplegable de estudiantes mostrando el icono de usuario,
 * nombre, apellidos y su identificador NIA en texto secundario gris (PrimeFlex).
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id_discente).
 * @param {Array<Object>} [props.options=[]] - Lista de discentes.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona un discente...'] - Marcador de posición.
 * @param {boolean} [props.filter=true] - Habilitar filtro de búsqueda.
 * @param {string} [props.optionLabel='apellidos'] - Clave para etiquetado.
 * @param {string} [props.optionValue='id_discente'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor.
 */
export const SelectorDiscente = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona un discente...',
  filter = true,
  optionLabel = 'apellidos',
  optionValue = 'id_discente',
  className = 'w-full',
  ...restoProps
}) => {
  // Plantilla para cada discente en la lista desplegada
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center justify-content-between w-full py-1">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user text-primary" />
          <span className="font-medium text-900">
            {opcion.nombre} {opcion.apellidos}
          </span>
        </div>
        {opcion.NIA && (
          <span className="text-color-secondary text-xs ml-2">
            NIA: {opcion.NIA}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el discente seleccionado
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-user text-primary" />
        <span className="font-medium text-900">
          {opcion.nombre} {opcion.apellidos}
        </span>
        {opcion.NIA && (
          <span className="text-color-secondary text-xs">
            ({opcion.NIA})
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
      filterBy="nombre,apellidos,NIA"
      optionLabel={optionLabel}
      optionValue={optionValue}
      itemTemplate={plantillaItem}
      valueTemplate={plantillaValor}
      emptyMessage="No hay discentes registrados"
      emptyFilterMessage="No se encontraron discentes coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorDiscente;
