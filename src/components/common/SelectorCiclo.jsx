import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorCiclo - Componente presentacional para la selección de Ciclos Formativos.
 *
 * Responsabilidad Única: Renderizar un desplegable de ciclos formativos mostrando
 * el icono de maletín profesional, las siglas en negrita y el nombre completo de la titulación.
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id_ciclo).
 * @param {Array<Object>} [props.options=[]] - Lista de ciclos.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona un ciclo...'] - Marcador de posición.
 * @param {boolean} [props.filter=true] - Habilitar filtro de búsqueda.
 * @param {string} [props.optionLabel='nombre'] - Clave para etiquetado.
 * @param {string} [props.optionValue='id_ciclo'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor.
 */
export const SelectorCiclo = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona un ciclo...',
  filter = true,
  optionLabel = 'nombre',
  optionValue = 'id_ciclo',
  className = 'w-full',
  ...restoProps
}) => {
  // Plantilla para cada ciclo en la lista desplegada
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-briefcase text-primary" />
        {opcion.siglas && (
          <span className="font-bold text-900">{opcion.siglas}</span>
        )}
        {opcion.siglas && opcion.nombre && <span className="text-400">-</span>}
        <span className="text-800">{opcion.nombre}</span>
      </div>
    );
  };

  // Plantilla para el ciclo seleccionado
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-briefcase text-primary" />
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
      emptyMessage="No hay ciclos disponibles"
      emptyFilterMessage="No se encontraron ciclos coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorCiclo;
