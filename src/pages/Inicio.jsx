import { useContext, useState } from "react";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import ColumnaSimple from "../layout/ColumnaSimple";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import useDatos from "../hooks/useDatos.js";
import Consola from "../components/herramientas/Consola.jsx";
import Cargando from "../components/Cargando.jsx";
import { Button } from "primereact/button";

const Inicio = () => {
  const { curso } = useDatos();
  const { sesionIniciada } = useContext(contextoSesion);

  return (
    <>
      <ColumnaSimple>
        {sesionIniciada ? (
          <h2>Bienvenido/a.</h2>
        ) : (
          <h2>Aún no ha iniciado sesión.</h2>
        )}
      </ColumnaSimple>
    </>
  );
};

export default Inicio;
