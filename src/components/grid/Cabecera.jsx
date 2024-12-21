import React from "react";
import Tema from "../Tema.jsx";

const Cabecera = () => {
  return (
    <>
      <div className='border-round-sm font-bold'>
        <h1>Cabecera</h1>
        <div className='text-right'>
          <Tema />
        </div>
      </div>
    </>
  );
};

export default Cabecera;
