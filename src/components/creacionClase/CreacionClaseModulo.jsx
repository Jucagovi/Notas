import React from "react";
import useEstilos from "../../hooks/useEstilos.js";

const CreacionClaseModulo = ({ datos }) => {
  const { iconos } = useEstilos();
  return (
    <>
      <div className='m-2'>
        <h3>
          <i
            className={`${iconos.ciclo} m-2 fadeinleft animation-duration-400`}
            style={{ fontSize: "1.5rem" }}
          ></i>
          {datos.nombre_ciclo} ({datos.siglas_ciclo})
        </h3>
      </div>
      <div className='m-2'>
        <h3>
          <i
            className={`${iconos.modulo} m-2 fadeinleft animation-duration-400 animation-delay-200`}
            style={{ fontSize: "1.5rem" }}
          ></i>
          {datos.nombre_modulo} ({datos.modulo_siglas})
        </h3>
      </div>
    </>
  );
};

export default CreacionClaseModulo;
