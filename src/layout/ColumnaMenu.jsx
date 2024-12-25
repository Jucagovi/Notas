import React from "react";
import { Menu } from "primereact/menu";

const ColumnaMenu = ({ elementosMenu, children }) => {
  return (
    <>
      <div className='grid'>
        <div className='col-2'>
          <Menu className='w-auto' model={elementosMenu} />
        </div>
        <div className='col border-round border-solid surface-border border-1 border-round-lg p-2 m-2'>
          {children}
        </div>
      </div>
    </>
  );
};

export default ColumnaMenu;
