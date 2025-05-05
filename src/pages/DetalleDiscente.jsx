import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
//import "./HerramientasPracticas.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearPractica from "../components/formularios/FormCrearPractica.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const DetalleDiscente = () => {
  const { id } = useParams();
  const { obtenerConsulta, evaluan, cambiarEvaluan } = useDatos();

  useEffect(() => {
    const filtro = { columna: "id_discente", valor: id };
    // Es mejor crear una vista con las consultas multitabla en Supabase.
    obtenerConsulta("listado_evaluaciones", cambiarEvaluan, filtro);
  }, []);

  return (
    <ColumnaSimple>
      <h2>Ficha de detalle discente con id = {id}</h2>
      <ValorEstado mostrar={evaluan} />
    </ColumnaSimple>
  );
};

export default DetalleDiscente;
