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
    calendario: "pi pi-calendar-clock",
    evaluacion: "pi pi-list-check",
    consola: "pi pi-desktop",
    cargando: "pi pi-spinner-dotted pi-spin",
    papelera: "pi pi-trash",
    boton: "pi pi-power-off",
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
    if (nota == null) return "text-900"; // white
    if (nota == 100) return "text-blue-500";
    if (nota >= 90) return "text-green-500";
    if (nota >= 50) return "text-900"; // white
    if (nota < 50) return "text-red-500";
    return "text-orange-500";
  };

  const coloresGrafico = {
    rojo: "#C74242",
    azul: "#354BB9",
    blanco: "white",
    verde: "#6CC773",
    naranja: "#E4A660",
    gris: "grey",
  };

  const procesarFecha = (fechaCadena) => {
    // Se separa la fecha.
    const [anio, mes, dia] = fechaCadena.split("-").map(Number);
    // Se crear objeto Date.
    const fecha = new Date(anio, mes - 1, dia);
    // Array de nombres de meses.
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    // Formato europeo extendido.
    return `${dia} de ${meses[mes - 1]} de ${anio}`;
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

  const ordenarColeccion = (coleccion, campo) => {
    coleccion.sort((a, b) => {
      return a[campo].localeCompare(b[campo]);
    });
  };

  const exportarCSV = (referencia, selectionOnly) => {
    //dataTableRef.current.exportCSV({ selectionOnly });
    referencia.current.exportCSV({ selectionOnly });
  };

  const datosAproveer = {
    iconos,
    coloresGrafico,
    acortarTexto,
    exportarCSV,
    calcularEdad,
    colorNota,
    extraerUnicos,
    procesarFecha,
    ordenarColeccion,
  };

  return (
    <contextoEstilos.Provider value={datosAproveer}>
      {children}
    </contextoEstilos.Provider>
  );
};

export default ProveedorEstilos;
export { contextoEstilos };
