import React, { useContext } from "react";
import ColumnaSimple from "../../layout/ColumnaSimple.jsx";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { contextoSesion } from "../../contexts/ProveedorSesion.jsx";

const CrearCuenta = () => {
  const { actualizarDato, crearCuenta, datosSesion } =
    useContext(contextoSesion);

  return (
    <>
      <ColumnaSimple estilo='p-6 w-4'>
        <h2 className='text-xl'>¿No tienes cuenta?</h2>
        <InputText
          type='text'
          name='email'
          placeholder='Correo electrónico'
          onChange={(e) => {
            actualizarDato(e);
          }}
        />
        <InputText
          className='m-2'
          type='password'
          name='password'
          placeholder='Contraseña'
          onChange={(e) => {
            actualizarDato(e);
          }}
        />
        <p className='text-sm'>
          Especifica un correo electrónico. <br></br> Recibirás un enlace para
          validar tu cuenta.
        </p>
        <Button
          className='m-2'
          icon='pi pi-user-plus'
          label='Crear Cuenta'
          onClick={(e) => {
            crearCuenta();
          }}
        />
      </ColumnaSimple>
    </>
  );
};

export default CrearCuenta;
