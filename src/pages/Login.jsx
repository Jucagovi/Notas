import React, { useState, useContext } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const Login = () => {
  const {
    iniciarSesionMagicLink,
    actualizarDato,
    errorUsuario,
    crearCuenta,
    datosSesion,
  } = useContext(contextoSesion);

  return (
    <ColumnaSimple estilo='flex flex-column align-items-center text-center p-6'>
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
      {/* <ColumnaSimple estilo='p-6 w-4'>
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
      </ColumnaSimple> */}
    </ColumnaSimple>
  );
};

export default Login;
