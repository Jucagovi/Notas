import React from "react";

const ColumnaSimple = ({ children, estilo, colorBorde }) => {
  return (
    <div
      className={`${
        estilo ? estilo : ""
      } "border-round border-solid border-1 border-round-lg p-2 m-2" ${
        colorBorde ? colorBorde : "surface-border"
      }`}
    >
      {children}
    </div>
  );
};

export default ColumnaSimple;
