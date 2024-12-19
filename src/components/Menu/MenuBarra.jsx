import React from "react";

import { Menubar } from "primereact/menubar";

const MenuBarra = () => {
  const items = [
    {
      label: "Inicio",
      icon: "pi pi-home",
    },
    {
      label: "Mantenimiento",
      icon: "pi pi-server",
      command: () => {
        console.log("/installation");
      },
    },
    {
      label: "Prácticas",
      icon: "pi pi-search",
      items: [
        {
          label: "Components",
          icon: "pi pi-bolt",
        },
        {
          label: "Blocks",
          icon: "pi pi-server",
        },
        {
          label: "UI Kit",
          icon: "pi pi-pencil",
        },
        {
          label: "Templates",
          icon: "pi pi-palette",
          items: [
            {
              label: "Apollo",
              icon: "pi pi-palette",
            },
            {
              label: "Ultima",
              icon: "pi pi-palette",
            },
          ],
        },
      ],
    },
    {
      label: "Contacto",
      icon: "pi pi-envelope",
    },
    { label: "Salir", icon: "pi pi-sign-out" },
  ];

  return (
    <>
      <h1>
        <Menubar model={items} />
      </h1>
    </>
  );
};

export default MenuBarra;
