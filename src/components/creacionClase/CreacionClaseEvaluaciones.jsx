import React from "react";
import useEstilos from "../../hooks/useEstilos.js";

const CreacionClaseEvaluaciones = ({ datos }) => {
  const { iconos } = useEstilos();
  return (
    <div className='m-2'>
      <h4>Se crearán las siguientes evaluaciones:</h4>

      {datos.map((evaluacion, indice) => {
        return (
          <div key={indice} className='pl-5 font-bold'>
            <i
              className={`${iconos.evaluacion} m-2 fadeinleft animation-duration-400`}
              style={{ fontSize: "1.3rem" }}
            ></i>
            {evaluacion.nombre}
          </div>
        );
      })}
    </div>
  );
};

export default CreacionClaseEvaluaciones;
