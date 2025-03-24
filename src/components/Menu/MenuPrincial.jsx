import React from "react";
import useEstilos from "../../hooks/useEstilos";
import { Menu } from "primereact/menu";

const MenuPrincial = () => {
  const { iconos } = useEstilos();
  const items = [
    {
      label: "Documents",
      items: [
        {
          label: "New",
          icon: iconos.mas,
        },
        {
          label: "Search",
          icon: iconos.buscar,
        },
      ],
    },
    {
      label: "Profile",
      items: [
        {
          label: "Settings",
          icon: iconos.herramiemta,
        },
        {
          label: "Logout",
          icon: iconos.salir,
        },
      ],
    },
  ];
  return (
    <>
      <div className='font-bold'>
        <Menu model={items} />
      </div>
    </>
  );
};

export default MenuPrincial;
