import React from "react";
import { useParams } from "react-router-dom";
import ColumnaSimple from "../layout/ColumnaSimple";

const DetalleDiscente = () => {
  const { id } = useParams();

  return (
    <ColumnaSimple>
      <h2>Ficha de detalle discente con id = {id}</h2>
    </ColumnaSimple>
  );
};

export default DetalleDiscente;
