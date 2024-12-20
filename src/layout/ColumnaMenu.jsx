import React from "react";
import { Menu } from "primereact/menu";

const ColumnaMenu = ({ elementosMenu, children }) => {
  return (
    <>
      <div className='grid'>
        <div className='col-2'>
          <Menu model={elementosMenu} />
        </div>
        <div className='col-10 border-round border-solid surface-border border-1  border-round-lg'>
          {children}
        </div>
      </div>
    </>
  );
};

export default ColumnaMenu;
