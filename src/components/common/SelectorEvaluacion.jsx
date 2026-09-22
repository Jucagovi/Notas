import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorEvaluacion - Componente presentacional para la selección de Períodos de Evaluación.
 *
 * Responsabilidad Única: Renderizar un desplegable de períodos de evaluación con icono de
 * calculadora, siglas y el nombre o referencia del ciclo formativo.
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id_evaluacion).
 * @param {Array<Object>} [props.options=[]] - Lista de períodos de evaluación.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona una evaluación...'] - Marcador de posición.
 * @param {boolean} [props.filter=true] - Habilitar filtro de búsqueda.
 * @param {string} [props.optionLabel='nombre'] - Clave para etiquetado.
 * @param {string} [props.optionValue='id_evaluacion'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor.
 */
export const SelectorEvaluacion = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona una evaluación...',
  filter = true,
  optionLabel = 'nombre',
  optionValue = 'id_evaluacion',
  className = 'w-full',
  ...restoProps
}) => {
  // Plantilla para cada evaluación en la lista desplegada
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    const cicloRef = opcion.cicloNombre || opcion.ciclo || opcion.siglasCiclo || '';

    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-calculator text-primary" />
        {opcion.siglas && (
          <span className="font-bold text-900">{opcion.siglas}</span>
        )}
        {opcion.siglas && opcion.nombre && <span className="text-400">-</span>}
        <span className="text-800">{opcion.nombre}</span>
        {cicloRef && (
          <span className="text-color-secondary text-sm ml-1">
            ({cicloRef})
          </span>
        )}
      </div>
    );
  };

  // Plantilla para la evaluación seleccionada
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    const cicloRef = opcion.cicloNombre || opcion.ciclo || opcion.siglasCiclo || '';

    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-calculator text-primary" />
        {opcion.siglas && (
          <span className="font-bold text-900">{opcion.siglas}</span>
        )}
        {opcion.siglas && opcion.nombre && <span className="text-400">-</span>}
        <span className="text-800">{opcion.nombre}</span>
        {cicloRef && (
          <span className="text-color-secondary text-sm">
            ({cicloRef})
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
      filterBy="nombre,siglas,cicloNombre,ciclo"
      optionLabel={optionLabel}
      optionValue={optionValue}
      itemTemplate={plantillaItem}
      valueTemplate={plantillaValor}
      emptyMessage="No hay evaluaciones registradas"
      emptyFilterMessage="No se encontraron evaluaciones coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorEvaluacion;
