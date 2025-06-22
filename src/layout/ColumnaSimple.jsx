import React from "react";

const ColumnaSimple = ({ children, estilo, modo }) => {
  const modoBorde = (seleccion) => {
    switch (seleccion) {
      case "peligro":
        return "border-red-500";
      case "advertencia":
        return "border-orange-500";
      case "exito":
        return "border-green-500";
      case "informacion":
        return "border-blue-500";
      default:
        return "surface-border";
    }
  };

  return (
    <div
      className={`${
        estilo ? estilo : ""
      } "border-round border-solid border-1 border-round-lg p-2 m-2" ${modoBorde(
        modo
      )}`}
    >
      {children}
    </div>
  );
};

export default ColumnaSimple;
