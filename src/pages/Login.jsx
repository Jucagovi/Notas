import React, { useContext } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import InicioSesionPassword from "../components/login/inicioSesionPassword.jsx";

const Login = () => {
  return (
    <ColumnaSimple estilo='flex flex-column align-items-center text-center p-6'>
      <InicioSesionPassword />
    </ColumnaSimple>
  );
};

export default Login;
