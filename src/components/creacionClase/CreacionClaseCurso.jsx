import React from "react";
import useEstilos from "../../hooks/useEstilos.js";

const CreacionClaseCurso = ({ datos }) => {
  const { iconos } = useEstilos();
  return (
    <>
      <div className='m-2'>
        <h3>
          <i
            className={`${iconos.curso} m-2 fadeinleft animation-duration-400`}
            style={{ fontSize: "1.5rem" }}
          ></i>
          {datos.nombre} en {datos.centro}
        </h3>
      </div>
    </>
  );
};

export default CreacionClaseCurso;
