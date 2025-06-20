import React from "react";
import { Dropdown } from "primereact/dropdown";

const CursosDropDown = ({ valor, opciones, setter, tamanyo = "" }) => {
  //Pantilla para los datos del DropDOwn.
  const cursoElementoPlantilla = (options) => {
    return `${options?.nombre} en ${options?.centro} (${options?.anyo})`;
  };

  return (
    <>
      <Dropdown
        id='cursoSeleccionado'
        name='cursoSeleccionado'
        //Estado con el valor seleccionado.
        value={valor}
        itemTemplate={cursoElementoPlantilla}
        // Si no tiene valor no se ejecuta la función y no se muestra "undefined".
        valueTemplate={valor && cursoElementoPlantilla}
        onChange={(e) => {
          setter(e.target.value);
        }}
        // Array con las opciones disponibles.
        options={opciones}
        // Clave del objeto que se mostrará en el desplegable.
        //optionLabel='nombre'
        placeholder='Elige un curso...'
        className={tamanyo}
      />
    </>
  );
};

export default CursosDropDown;
