import React, { createContext, useRef } from "react";

const contextoEstilos = createContext();

const ProveedorEstilos = ({ children }) => {
  /* Listado de los iconos de la aplicación. */
  const iconos = {
    inicio: "pi pi-home",
    nota: "pi pi-server",
    herramienta: "pi pi-cog",
    ciclo: "pi pi-graduation-cap",
    practica: "pi pi-pen-to-square",
    modulo: "pi pi-calendar",
    sobre: "pi pi-envelope",
    salir: "pi pi-sign-out",
    entrar: "pi pi-sign-in",
    usuario: "pi pi-user",
    claro: "pi pi-sun",
    oscuro: "pi pi-moon",
    siglas: "pi pi-hashtag",
    descripcion: "pi pi-file-plus",
    aceptar: "pi pi-check",
    cancelar: "pi pi-times",
    buscar: "pi pi-search",
    mas: "pi pi-plus-circle",
    menos: "pi pi-minus-circle",
    archivo: "pi pi-file",
    informe: "pi pi-clipboard",
  };

  const datosAproveer = { iconos };

  return (
    <contextoEstilos.Provider value={datosAproveer}>
      {children}
    </contextoEstilos.Provider>
  );
};

export default ProveedorEstilos;
export { contextoEstilos };
