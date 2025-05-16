import React from "react";
import useEstilos from "../../hooks/useEstilos.js";

const CreacionClaseDiscentes = ({ datos }) => {
  const { iconos } = useEstilos();
  return (
    <div>
      <h4>Discentes matriculados ({datos.length} matrículas):</h4>

      {datos.map((discente) => {
        return (
          <div key={discente.id_discente} className='pl-5 font-bold'>
            <i
              className={`${iconos.usuario} m-2 fadeinleft animation-duration-400`}
              style={{ fontSize: "1.3rem" }}
            ></i>
            {discente.apellidos}, {discente.nombre}
          </div>
        );
      })}
    </div>
  );
};

export default CreacionClaseDiscentes;
