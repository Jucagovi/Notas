import React from "react";
import Cabecera from "../components/grid/Cabecera.jsx";
import PiePagina from "../components/grid/PiePagina.jsx";
import MenuBarra from "../components/menu/MenuBarra.jsx";

const PrincipalLayout = ({ children }) => {
  return (
    <>
      <div className='m-4'>
        <div className='grid'>
          <div className='col p-2'>
            <Cabecera />
          </div>
        </div>
        <div className='grid'>
          <div className='col p-1'>
            <MenuBarra />
          </div>
        </div>
        <div className='grid'>
          <div className='col p-1'>{children}</div>
        </div>
        <div className='grid'>
          <div className='col p-5'>
            <PiePagina />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrincipalLayout;
