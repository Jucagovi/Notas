import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Image } from "primereact/image";
import logo from "../../assets/logo.png";
import { contextoSesion } from "../../contexts/ProveedorSesion.jsx";
import useEstilos from "../../hooks/useEstilos.js";

const MenuBarra = () => {
  const navegar = useNavigate();
  const { sesionIniciada, cerrarSesion } = useContext(contextoSesion);
  const { iconos } = useEstilos();
  const items = [
    {
      label: "Inicio",
      icon: iconos.inicio,
      command: () => {
        navegar("/");
      },
    },
    {
      label: "Notas",
      icon: iconos.nota,
      command: () => {
        navegar("/notas");
      },
    },
    {
      label: "Informes",
      icon: iconos.informe,
      command: () => {
        navegar("/informes");
      },
    },
    {
      label: "Herramientas",
      icon: iconos.herramienta,
      items: [
        {
          label: "Ciclos",
          icon: iconos.ciclo,
          command: () => {
            navegar("/herramientasciclos");
          },
        },
        {
          label: "Módulos",
          icon: iconos.modulo,
          command: () => {
            navegar("/herramientasmodulos");
          },
        },
        {
          label: "Prácticas",
          icon: iconos.practica,
          command: () => {
            navegar("/herramientaspracticas");
          },
        },
        {
          label: "Informes",
          icon: iconos.informe,
          items: [
            {
              label: "Apollo",
              icon: iconos.informe,
            },
            {
              label: "Ultima",
              icon: iconos.informe,
            },
          ],
        },
      ],
    },
    {
      label: "Acerca de",
      icon: iconos.sobre,
      command: () => {
        navegar("/acercade");
      },
    },
  ];

  const itemsSinSesion = [
    {
      label: "Inicio",
      icon: iconos.inicio,
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
          icon={iconos.salir}
          raised
          severity='secondary'
          label='Salir'
          onClick={() => {
            cerrarSesion();
          }}
        />
      ) : (
        <Button
          icon={iconos.entrar}
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
