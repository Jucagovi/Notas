import React, { useContext } from "react";
import { contextoDatos } from "../contexts/ProveedorDatos.jsx";

const useDatos = () => {
  const contexto = useContext(contextoDatos);
  return contexto;
};

export default useDatos;
