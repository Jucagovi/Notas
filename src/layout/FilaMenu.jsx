import { Menubar } from "primereact/menubar";
import React from "react";

const FilaMenu = ({ elementosMenu, children }) => {
  return (
    <>
      <div className='grid'>
        <div className='col'>
          <Menubar className='w-auto h-3rem ' model={elementosMenu} />
        </div>
      </div>
      <div className='grid border-round border-solid surface-border border-1 border-round-lg p-2 m-2'>
        <div className='col'>{children}</div>
      </div>
    </>
  );
};

export default FilaMenu;
