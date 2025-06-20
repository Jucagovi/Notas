import React from "react";
import { Dropdown } from "primereact/dropdown";

const plantillaClaseDropDown = (option) => {
  if (option) {
    return (
      <div className='flex align-items-center'>
        <div>
          {option.nombre_curso} {option.nombre_modulo}
        </div>
      </div>
    );
  }
};

const ClasesDropDown = ({ valores, opciones, setter, tamanyo = "" }) => {
  return (
    <>
      <Dropdown
        id='claseSeleccionada'
        name='claseSeleccionada'
        value={valores}
        onChange={(evento) => {
          setter(evento.value);
        }}
        options={opciones}
        optionLabel='valor_drop'
        placeholder='Elige una clase...'
        itemTemplate={plantillaClaseDropDown} //Plantilla para el listado de elementos.
        valueTemplate={valores && plantillaClaseDropDown} //Plantilla para el elemento seleccionado.
        className={tamanyo}
      />
    </>
  );
};

export default ClasesDropDown;
