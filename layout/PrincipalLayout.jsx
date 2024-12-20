import React from "react";
import Cabecera from "../src/components/grid/Cabecera.jsx";
import PiePagina from "../src/components/grid/PiePagina.jsx";
import MenuBarra from "../src/components/menu/MenuBarra.jsx";

const PrincipalLayout = ({ children }) => {
  return (
    <>
      <div className='grid'>
        <div className='col p-2'>
          <Cabecera />
        </div>
      </div>
      <div className='grid'>
        <div className='col p-2'>
          <MenuBarra />
        </div>
      </div>
      <div className='grid'>
        <div className='col p-2'>{children}</div>
      </div>
      <div className='grid'>
        <div className='col p-5'>
          <PiePagina />
        </div>
      </div>
    </>
  );
};

export default PrincipalLayout;
