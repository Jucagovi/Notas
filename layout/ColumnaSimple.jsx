import React from "react";

const ColumnaSimple = ({ children }) => {
  return (
    <>
      <div className='border-round border-solid surface-border border-1  border-round-lg p-3'>
        <h1>Esto es el inicio del documento.</h1>
        {children}
      </div>
    </>
  );
};

export default ColumnaSimple;
