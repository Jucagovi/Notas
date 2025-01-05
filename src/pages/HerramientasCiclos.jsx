import React, { useState, useRef } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import supabase from "../config/config_supabase.js";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";

const HerramientasCiclos = () => {
  const discentesInicial = [];
  const [discentes, setDiscentes] = useState(discentesInicial);
  const [discenteSeleccionado, setDiscenteSeleccionsado] = useState({});
  const toast = useRef(null);

  const obtenerDiscentes = async () => {
    let { data, error } = await supabase.from("Discentes").select("*");

    error ? console.log(error) : setDiscentes(data);
  };

  const seleccionFila = (evento) => {
    toast.current.show({
      severity: "info",
      summary: "Discente seleccionado",
      detail: `${evento?.data.nombre} ${evento?.data.apellidos}`,
      life: 3000,
    });
  };

  const deseleccionFila = (evento) => {
    toast.current.show({
      severity: "warn",
      summary: "Discente deseleccionado",
      detail: `${evento.data.nombre} ${evento.data.apellidos}`,
      life: 3000,
    });
  };

  return (
    <>
      <ColumnaSimple>
        <h1>Herramientas ciclos.</h1>
        <Toast ref={toast} />
        <Button
          onClick={() => {
            obtenerDiscentes();
          }}
        >
          Obtener discentes
        </Button>
        <ValorEstado estadoaMostrar={discenteSeleccionado} />
        <DataTable
          value={discentes}
          showGridlines
          removableSort
          tableStyle={{ minWidth: "50rem" }}
          selectionMode='single'
          selection={discenteSeleccionado}
          onRowSelect={(e) => {
            seleccionFila(e);
          }}
          onRowUnselect={(e) => {
            deseleccionFila(e);
          }}
          onSelectionChange={(e) => {
            setDiscenteSeleccionsado(e.value);
            //console.log(e);
          }}
        >
          <Column field='id_discente' sortable header='Código'></Column>
          <Column field='nombre' sortable header='Nombre'></Column>
          <Column field='apellidos' sortable header='Apellidos'></Column>
          <Column field='correo' header='Correo electrónico'></Column>
          <Column field='fecha_nac' header='Nacimiento'></Column>
        </DataTable>
        <ValorEstado estadoaMostrar={discentes} />
      </ColumnaSimple>
    </>
  );
};

export default HerramientasCiclos;
