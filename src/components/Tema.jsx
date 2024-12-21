import React, { useState, useContext } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { PrimeReactContext } from "primereact/api";
import { SelectButton } from "primereact/selectbutton";
import { ToggleButton } from "primereact/togglebutton";

const Tema = () => {
  /** Comentar todas estas pruebas y poner un Togglebutton que cambie el tema al pulsarlo onChangue con un estado para cambiar el icono. */

  // Se usa el contexto de PrimeReact para cambiar el tema de la aplicación.
  const { changeTheme } = useContext(PrimeReactContext);
  // Estado para controlar el cmabio el botón.
  const [marcado, setMarcado] = useState(false);
  // Estado para cambiar el tema en la eqtiqueta <Link> de index.HTML
  // (hay que copiar los temas a la carpeta publi/themes).
  const [theme, setTheme] = useState("dark");

  const [checked, setChecked] = useState(false);

  // Función para cambiar el tema utilizando changeTheme importado desde el contexto de PrimeReact.
  const cambiarTema = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    changeTheme(
      `lara-${theme}-blue`,
      `lara-${newTheme}-blue`,
      "tema-aplicacion",
      () => setTheme(newTheme)
    );
  };

  return (
    <div className='grid'>
      <div className='col'>
        <ToggleButton
          onLabel='Oscuro'
          offLabel='Claro'
          onIcon='pi pi-moon'
          offIcon='pi pi-sun'
          checked={checked}
          onChange={(e) => {
            setChecked(e.value);
            cambiarTema();
          }}
          className='w-7rem'
        />
      </div>
    </div>
  );
};

export default Tema;
