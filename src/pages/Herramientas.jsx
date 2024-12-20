import React from "react";
import ColumnaMenu from "../../layouts/ColumnaMenu.jsx";

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
      <ColumnaMenu elementosMenu={items}>
        <h1>Herramientas</h1>
      </ColumnaMenu>
    </>
  );
};

export default Herramientas;
