import React from "react";
import { useNavigate } from "react-router";

import { Menubar } from "primereact/menubar";

const MenuBarra = () => {
  const navegar = useNavigate();

  const items = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => {
        navegar("/");
      },
    },
    {
      label: "Notas",
      icon: "pi pi-server",
      command: () => {
        navegar("/notas");
      },
    },
    {
      label: "Informes",
      icon: "pi pi-server",
      command: () => {
        navegar("/informes");
      },
    },
    {
      label: "Herramientas",
      icon: "pi pi-search",
      items: [
        {
          label: "Ciclos",
          icon: "pi pi-bolt",
        },
        {
          label: "Módulos",
          icon: "pi pi-server",
        },
        {
          label: "Prácticas",
          icon: "pi pi-pencil",
        },
        {
          label: "Informes",
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
      label: "Acerca de",
      icon: "pi pi-envelope",
      command: () => {
        navegar("/acercade");
      },
    },
    {
      label: "Salir",
      icon: "pi pi-sign-out",
      command: () => {
        navegar("/login");
      },
    },
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
