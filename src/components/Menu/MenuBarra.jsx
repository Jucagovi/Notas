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
  // Listado de entradas en el menú/submenú con la sesión iniciada.
  const items = [
    {
      label: "Inicio",
      icon: iconos.inicio,
      command: () => {
        navegar("/");
      },
    },
    {
      label: "Discentes",
      icon: iconos.usuario,
      command: () => {
        navegar("/gestiondiscentes");
      },
    },
    {
      label: "Prácticas",
      icon: iconos.practica,
      command: () => {
        navegar("/gestionpracticas");
      },
    },
    {
      label: "Notas",
      icon: iconos.nota,
      command: () => {
        navegar("/gestionnotas");
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
          label: "Mantenimiento",
          icon: iconos.editar,
          items: [
            {
              label: "Cursos",
              icon: iconos.curso,
              command: () => {
                navegar("/herramientascursos");
              },
            },
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
          ],
        },
        {
          label: "Crear clase",
          icon: iconos.curso,
          command: () => {
            navegar("/creacionclase");
          },
        },
        {
          label: "Inserción datos",
          icon: iconos.insercion,
          command: () => {
            navegar("/inserciondatos");
          },
        },
        {
          label: "Consola",
          icon: iconos.consola,
          command: () => {
            navegar("/consola");
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
