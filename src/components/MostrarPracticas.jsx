import React from "react";
import useEstilos from "../hooks/useEstilos.js";
import MostrarPractica from "./MostrarPractica.jsx";
import ValorEstado from "./complementos/ValorEstado.jsx";

const MostrarPracticas = ({ practicas }) => {
  const { iconos, ordenarColeccion } = useEstilos();

  return (
    <>
      <h3>
        <i
          className={`${iconos.evaluacion} m-2 fadeinleft animation-duration-400 vertical-align-middle`}
          style={{ fontSize: "2rem" }}
        ></i>
        Listado de prácticas para la evaluación ({practicas.length} prácticas).
      </h3>
      {Array.isArray(practicas) && practicas.length
        ? practicas.map((practica) => {
            return (
              <MostrarPractica key={practica.id_practica} practica={practica} />
            );
          })
        : "Esta evaluación no dispone de prácticas."}
      <ValorEstado mostrar={practicas} />;
    </>
  );
};

export default MostrarPracticas;
