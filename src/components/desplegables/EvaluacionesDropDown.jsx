import React from "react";
import { Dropdown } from "primereact/dropdown";

const EvaluacionesDropDown = ({ valor, opciones, setter, tamanyo = "" }) => {
  //Pantilla para los datos del DropDown.
  const evaluacionElementoPlantilla = (options) => {
    return `${options?.nombre}`;
  };

  return (
    <>
      <Dropdown
        id='evaluacionSeleccionada'
        name='evaluacionSeleccionada'
        //Estado con el valor seleccionado.
        value={valor}
        onChange={(e) => {
          setter(e.target.value);
        }}
        // Array con las opciones disponibles.
        options={opciones}
        // Clave del objeto que se mostrará en el desplegable.
        //optionLabel='nombre'
        placeholder='Elige una evaluación...'
        itemTemplate={evaluacionElementoPlantilla}
        valueTemplate={Object.keys(valor).length && evaluacionElementoPlantilla}
        scrollHeight='400px'
        className={tamanyo}
      />
    </>
  );
};

export default EvaluacionesDropDown;
