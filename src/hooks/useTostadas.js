import React, { useContext } from "react";
import { contextoTostadas } from "../contexts/ProveedorTostadas.jsx";

const useTostadas = () => {
  const contexto = useContext(contextoTostadas);
  return contexto;
};

export default useTostadas;
