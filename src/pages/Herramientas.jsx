import React from "react";
import ColumnaSimple from "../layout/ColumnaSimple";

const Herramientas = () => {
  // Elementos del menú.
  const items = [
    {
      label: "Documents",
      icon: "pi pi-plus",
    },
    {
      label: "Profile",
      icon: "pi pi-cog",
    },
  ];
  return (
    <>
      <ColumnaSimple>
        <h1>Herramientas</h1>
      </ColumnaSimple>
    </>
  );
};

export default Herramientas;
