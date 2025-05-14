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
    texto: "pi pi-align-justify",
    editar: "pi pi-file-edit",
    curso: "pi pi-book",
    insercion: "pi pi-file-arrow-up",
    centro: "pi pi-building-columns",
  };

  const acortarTexto = (texto, longitud = 0) => {
    const long = longitud === 0 ? texto.length : longitud;
    console.log(texto.substring(0, long));
    console.log(longitud);
    console.log(texto.length);
    return texto.substring(0, long);
  };

  const calcularEdad = (fechaNacimiento) => {
    const date = new Date(fechaNacimiento);
    const yearOfBirth = date.getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearOfBirth;
    return age;
  };

  const colorNota = (nota) => {
    if (nota == null) return "white";
    if (nota >= 90) return "green";
    if (nota > 55) return "white";
    if (nota < 45) return "red";
    return "orange";
  };

  /*******************************************************************
   * Función para individualizar valores en evaluaciones.
   * Crea un nuevo (new) conjunto de datos (Set) individualizando los
   * valores (clave) del conjunto de datos (coleccion) pasados como
   * parametros.
   */

  const extraerUnicos = (coleccion, clave) => {
    return [
      ...new Set(
        coleccion.map((item) => {
          return item[clave];
        })
      ),
    ];
  };

  /******************************************************
   * Funciones para la exportación de ficheros.
   *
   */

  const exportarCSV = (referencia, selectionOnly) => {
    //dataTableRef.current.exportCSV({ selectionOnly });
    referencia.current.exportCSV({ selectionOnly });
  };

  const datosAproveer = {
    iconos,
    acortarTexto,
    exportarCSV,
    calcularEdad,
    colorNota,
    extraerUnicos,
  };

  return (
    <contextoEstilos.Provider value={datosAproveer}>
      {children}
    </contextoEstilos.Provider>
  );
};

export default ProveedorEstilos;
export { contextoEstilos };
