import React, { useContext } from "react";
import ColumnaSimple from "../../layout/ColumnaSimple.jsx";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { contextoSesion } from "../../contexts/ProveedorSesion.jsx";

const IniciarSesionMagicLink = () => {
  const { iniciarSesionMagicLink, actualizarDato } = useContext(contextoSesion);

  return (
    <>
      <ColumnaSimple estilo='p-6 w-4'>
        <h2 className='text-xl'>Inicia sesión</h2>
        <InputText
          type='text'
          name='email'
          placeholder='Correo electrónico'
          onChange={(e) => {
            actualizarDato(e);
          }}
        />
        <p className='text-sm'>
          Inicia sesión con un correo electrónico. <br></br> Recibirás un enlace
          para iniciarla.
        </p>
        <Button
          className='m-2'
          icon='pi pi-sign-in'
          label=' Iniciar sesión'
          onClick={() => {
            iniciarSesionMagicLink();
          }}
        />
      </ColumnaSimple>
    </>
  );
};

export default IniciarSesionMagicLink;
