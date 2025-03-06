import React, { useContext } from "react";
import { contextoEstilos } from "../contexts/ProveedorEstilos.jsx";

const useEstilos = () => {
  const contexto = useContext(contextoEstilos);
  return contexto;
};

export default useEstilos;
