import React, { useContext } from "react";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";

const useSesion = () => {
  const contexto = useContext(contextoSesion);
  return contexto;
};

export default useSesion;
