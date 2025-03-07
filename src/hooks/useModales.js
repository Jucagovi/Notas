import React, { useContext } from "react";
import { contextoModales } from "../contexts/ProveedorModales.jsx";

const useModales = () => {
  const contexto = useContext(contextoModales);
  return contexto;
};

export default useModales;
