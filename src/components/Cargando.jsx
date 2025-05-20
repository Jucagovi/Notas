import React from "react";
import useEstilos from "../hooks/useEstilos.js";

const Cargando = () => {
  const { iconos } = useEstilos();

  return (
    <>
      <div className='flex align-items-center justify-content-center fadein animation-duration-1000'>
        <i className={iconos.cargando} style={{ fontSize: "2rem" }}></i>
      </div>
    </>
  );
};

export default Cargando;
