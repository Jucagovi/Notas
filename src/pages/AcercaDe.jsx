import React from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import ColumnaMenu from "../layout/ColumnaMenu.jsx";
import FilaMenu from "../layout/FilaMenu.jsx";

const AcercaDe = () => {
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
    <ColumnaMenu elementosMenu={items}>
      <h2>AcercaDe</h2>
      <ColumnaMenu elementosMenu={items}>
        <FilaMenu elementosMenu={items}>Mucho más contenido.</FilaMenu>
      </ColumnaMenu>
    </ColumnaMenu>
  );
};

export default AcercaDe;
