import React, { useContext } from "react";
import Cabecera from "../components/grid/Cabecera.jsx";
import PiePagina from "../components/grid/PiePagina.jsx";
import MenuBarra from "../components/menu/MenuBarra.jsx";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import { Toast } from "primereact/toast";

const PrincipalLayout = ({ children }) => {
  const { toast } = useContext(contextoSesion);
  return (
    <>
      <Toast ref={toast} />
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
