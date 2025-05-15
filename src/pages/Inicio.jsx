import { useContext } from "react";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import ColumnaSimple from "../layout/ColumnaSimple";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";

const Inicio = () => {
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
