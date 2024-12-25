import React from "react";

const ColumnaSimple = ({ children, estilo }) => {
  return (
    <div
      className={`border-round border-solid surface-border border-1 border-round-lg p-2 m-2 ${estilo}`}
    >
      {children}
    </div>
  );
};

export default ColumnaSimple;
