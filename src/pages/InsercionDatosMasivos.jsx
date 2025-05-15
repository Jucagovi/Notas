import React from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";

const InsercionDatosMasivos = () => {
  return (
    <ColumnaSimple>
      <InsercionMasiva insercion={true} />
    </ColumnaSimple>
  );
};

export default InsercionDatosMasivos;
