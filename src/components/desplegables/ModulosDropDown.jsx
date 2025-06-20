import React from "react";
import { Dropdown } from "primereact/dropdown";

const ModulosDropDown = ({ valor, opciones, setter, tamanyo = "" }) => {
  //Pantilla para los datos del DropDOwn.
  const moduloElementoPlantilla = (options) => {
    return `${options?.valor_drop}`;
  };

  return (
    <>
      <Dropdown
        id='moduloSeleccionado'
        name='moduloSeleccionado'
        //Estado con el valor seleccionado.
        value={valor}
        itemTemplate={moduloElementoPlantilla}
        // Si no tiene valor no se ejecuta la función y no se muestra "undefined".
        valueTemplate={valor && moduloElementoPlantilla}
        onChange={(e) => {
          setter(e.target.value);
        }}
        // Array con las opciones disponibles.
        options={opciones}
        placeholder='Elige un módulo...'
        className={tamanyo}
      />
    </>
  );
};

export default ModulosDropDown;
