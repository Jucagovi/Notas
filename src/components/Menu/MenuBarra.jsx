import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Image } from "primereact/image";
import logo from "../../assets/logo.png";
import { contextoSesion } from "../../contexts/ProveedorSesion.jsx";

const MenuBarra = () => {
  const navegar = useNavigate();
  const { sesionIniciada, cerrarSesion } = useContext(contextoSesion);
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
      icon: "pi pi-clipboard",
      command: () => {
        navegar("/informes");
      },
    },
    {
      label: "Herramientas",
      icon: "pi pi-cog",
      items: [
        {
          label: "Ciclos",
          icon: "pi pi-bolt",
          command: () => {
            navegar("/herramientasciclos");
          },
        },
        {
          label: "Módulos",
          icon: "pi pi-folder-open",
          command: () => {
            navegar("/herramientasmodulos");
          },
        },
        {
          label: "Prácticas",
          icon: "pi pi-pen-to-square",
          command: () => {
            navegar("/herramientaspracticas");
          },
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
  ];

  const itemsSinSesion = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => {
        navegar("/");
      },
    },
  ];

  const inicio = <Image src={logo} alt='Logotipo' width='50' />;
  const fin = (
    <div className='flex align-items-center gap-2'>
      {sesionIniciada ? (
        <Button
          icon='pi pi-sign-out'
          raised
          severity='secondary'
          label='Salir'
          onClick={() => {
            cerrarSesion();
          }}
        />
      ) : (
        <Button
          icon='pi pi-sign-in'
          raised
          severity='secondary'
          label='Iniciar sesión'
          onClick={() => {
            navegar("/login");
          }}
        />
      )}
    </div>
  );

  return (
    <>
      <h1>
        <Menubar
          model={sesionIniciada ? items : itemsSinSesion}
          start={inicio}
          end={fin}
        />
      </h1>
    </>
  );
};

export default MenuBarra;
