import React from "react";

import { Menu } from "primereact/menu";

const MenuPrincial = () => {
  const items = [
    {
      label: "Documents",
      items: [
        {
          label: "New",
          icon: "pi pi-plus",
        },
        {
          label: "Search",
          icon: "pi pi-search",
        },
      ],
    },
    {
      label: "Profile",
      items: [
        {
          label: "Settings",
          icon: "pi pi-cog",
        },
        {
          label: "Logout",
          icon: "pi pi-sign-out",
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
