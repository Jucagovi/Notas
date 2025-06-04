import React from "react";
import useEstilos from "../hooks/useEstilos.js";

const MostrarPractica = ({ practica }) => {
  const { iconos } = useEstilos();
  return (
    <div className=' font-bold pl-5'>
      <i
        className={`${iconos.practica} m-2 fadeinleft animation-duration-400`}
        style={{ fontSize: "1.3rem" }}
      ></i>
      {practica.numero} {practica.enunciado}
    </div>
  );
};

export default MostrarPractica;
