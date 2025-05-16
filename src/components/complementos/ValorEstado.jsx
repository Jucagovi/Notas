import React from "react";

const ValorEstado = (props) => {
  const { mostrar, titulo } = props;
  return (
    <>
      <div>
        <h3> {titulo ? titulo : "Valor del estado actual"}</h3>
        <pre>{JSON.stringify(mostrar, null, 2)}</pre>
      </div>
    </>
  );
};

export default ValorEstado;
