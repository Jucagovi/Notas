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

const ClasesDropDown = ({ valor, opciones, setter, tamanyo = "" }) => {
  return (
    <>
      <Dropdown
        id='claseSeleccionada'
        name='claseSeleccionada'
        value={valor}
        onChange={(evento) => {
          setter(evento.value);
        }}
        options={opciones}
        optionLabel='valor_drop'
        placeholder='Elige una clase...'
        itemTemplate={plantillaClaseDropDown} //Plantilla para el listado de elementos.
        valueTemplate={Object.keys(valor).length && plantillaClaseDropDown} //Plantilla para el elemento seleccionado.
        className={tamanyo}
      />
    </>
  );
};

export default ClasesDropDown;
