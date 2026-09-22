import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorModulo - Componente presentacional para la selección de Módulos Profesionales.
 *
 * Responsabilidad Única: Renderizar un desplegable estilizado de módulos curriculares
 * mostrando el icono de libro, las siglas oficiales en negrita y la denominación del módulo.
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id_modulo).
 * @param {Array<Object>} [props.options=[]] - Lista de módulos.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona un módulo...'] - Texto de placeholder.
 * @param {boolean} [props.filter=true] - Habilitar filtro de búsqueda.
 * @param {string} [props.optionLabel='nombre'] - Clave para etiquetado.
 * @param {string} [props.optionValue='id_modulo'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor.
 */
export const SelectorModulo = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona un módulo...',
  filter = true,
  optionLabel = 'nombre',
  optionValue = 'id_modulo',
  className = 'w-full',
  ...restoProps
}) => {
  // Plantilla para cada elemento en la lista desplegada
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-book text-primary" />
        {opcion.siglas && (
          <span className="font-bold text-900">{opcion.siglas}</span>
        )}
        {opcion.siglas && opcion.nombre && <span className="text-400">-</span>}
        <span className="text-800">{opcion.nombre}</span>
      </div>
    );
  };

  // Plantilla para el valor actualmente seleccionado
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-book text-primary" />
        {opcion.siglas && (
          <span className="font-bold text-900">{opcion.siglas}</span>
        )}
        {opcion.siglas && opcion.nombre && <span className="text-400">-</span>}
        <span className="text-800">{opcion.nombre}</span>
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
      filterBy="siglas,nombre"
      optionLabel={optionLabel}
      optionValue={optionValue}
      itemTemplate={plantillaItem}
      valueTemplate={plantillaValor}
      emptyMessage="No hay módulos disponibles"
      emptyFilterMessage="No se encontraron módulos coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorModulo;
