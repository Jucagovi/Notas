import React from 'react';
import { Dropdown } from 'primereact/dropdown';

/**
 * SelectorClase - Componente presentacional para la selección de Clases (Curso + Módulo).
 *
 * Responsabilidad Única: Renderizar un desplegable estilizado de clases mostrando
 * el icono institucional, el nombre del curso, las siglas entre paréntesis y el nombre del módulo.
 *
 * @param {Object} props
 * @param {*} props.value - Valor seleccionado (normalmente id de la clase).
 * @param {Array<Object>} [props.options=[]] - Lista de clases.
 * @param {Function} props.onChange - Manejador de evento al cambiar de opción.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.disabled=false] - Indicador de estado deshabilitado.
 * @param {string} [props.placeholder='Selecciona una clase...'] - Marcador de posición.
 * @param {boolean} [props.filter=true] - Habilitar filtro textual.
 * @param {string} [props.optionLabel='etiqueta'] - Clave para etiquetado.
 * @param {string} [props.optionValue='id'] - Clave para el valor seleccionado.
 * @param {string} [props.className='w-full'] - Clases CSS del contenedor.
 */
export const SelectorClase = ({
  value,
  options = [],
  onChange,
  loading = false,
  disabled = false,
  placeholder = 'Selecciona una clase...',
  filter = true,
  optionLabel = 'etiqueta',
  optionValue = 'id',
  className = 'w-full',
  ...restoProps
}) => {
  // Helper para extraer de forma tolerante los campos de una clase
  const extraerCamposClase = (opcion) => {
    if (!opcion) return { curso: '', siglas: '', modulo: '' };
    const curso = opcion.cursoNombre || opcion.nombreCurso || (typeof opcion.curso === 'object' ? opcion.curso?.nombre : opcion.curso) || '';
    const siglas = opcion.moduloSiglas || opcion.siglasModulo || (typeof opcion.modulo === 'object' ? opcion.modulo?.siglas : '') || opcion.siglas || '';
    const modulo = opcion.moduloNombre || opcion.nombreModulo || (typeof opcion.modulo === 'object' ? opcion.modulo?.nombre : opcion.modulo) || opcion.nombre || '';
    return { curso, siglas, modulo };
  };

  // Plantilla para cada elemento en la lista desplegada
  const plantillaItem = (opcion) => {
    if (!opcion) return null;
    const { curso, siglas, modulo } = extraerCamposClase(opcion);

    return (
      <div className="flex align-items-center gap-2 py-1 flex-wrap">
        <i className="pi pi-graduation-cap text-primary" />
        {curso && <span className="font-semibold text-900">{curso}</span>}
        {siglas && (
          <span className="text-color-secondary text-sm">
            ({siglas})
          </span>
        )}
        {modulo && <span className="text-800">{modulo}</span>}
      </div>
    );
  };

  // Plantilla para el valor actualmente seleccionado
  const plantillaValor = (opcion, dProps) => {
    if (!opcion) {
      return <span>{dProps.placeholder}</span>;
    }
    const { curso, siglas, modulo } = extraerCamposClase(opcion);

    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-graduation-cap text-primary" />
        {curso && <span className="font-semibold text-900">{curso}</span>}
        {siglas && (
          <span className="text-color-secondary text-sm">
            ({siglas})
          </span>
        )}
        {modulo && <span className="text-800">{modulo}</span>}
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
      filterBy="etiqueta,cursoNombre,nombreCurso,moduloNombre,nombreModulo,moduloSiglas,siglas"
      optionLabel={optionLabel}
      optionValue={optionValue}
      itemTemplate={plantillaItem}
      valueTemplate={plantillaValor}
      emptyMessage="No hay clases configuradas"
      emptyFilterMessage="No se encontraron clases coincidentes"
      className={className}
      {...restoProps}
    />
  );
};

export default SelectorClase;
