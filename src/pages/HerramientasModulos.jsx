import React, { useState, useEffect, useContext, useRef } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { contextoDatos } from "../contexts/ProveedorDatos.jsx";
import { contextoSesion } from "../contexts/ProveedorSesion.jsx";
import "./HerramientasModulos.css";
import ValorEstado from "../components/complementos/ValorEstado";

const HerramientasModulos = () => {
  const { obtenerTodos, actualizarDato, error, lanzarError } =
    useContext(contextoDatos);

  const { toast } = useContext(contextoSesion);

  const moduloInicial = {
    id_modulo: "",
    nombre: "",
    siglas: "",
    descripcion: "",
    id_ciclo: "",
  };
  const [modulos, setModulos] = useState([]);
  const [modulo, setModulo] = useState(moduloInicial);

  const actualizarModulo = async (datos) => {
    await actualizarDato("Modulos", "id_modulo", datos);
    return error === "";
  };

  const onRowEditComplete = (e) => {
    let _modulos = [...modulos];
    let { newData, index } = e;
    setModulo(newData);
    if (actualizarModulo(newData)) {
      _modulos[index] = newData;
      setModulos(_modulos);
      !error ? mostrarToastInfo(newData) : mostrarToastError(newData);
    } else {
      console.log(error);
    }
  };

  const textEditor = (options) => {
    return (
      <InputText
        type='text'
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const allowEdit = (rowData) => {
    return rowData.name !== "feo";
  };

  // Hacer función genérica (en el contexto) que recibe un JSON como parámetro.
  const mostrarToastInfo = (datos) => {
    toast.current.show({
      severity: "info",
      summary: "Módulo actualizado de forma correcta.",
      detail: `El módulo ${datos.nombre} ha sido modificado.`,
      life: 3000,
    });
  };

  const mostrarToastError = (datos) => {
    toast.current.show({
      severity: "error",
      summary: "Se ha producido un error.",
      detail: `El módulo ${datos.nombre} no ha sido modificado.`,
      life: 3000,
    });
  };

  useEffect(() => {
    obtenerTodos("Modulos", setModulos);
  }, []);

  //herramientasmodulos_contenedor
  return (
    <ColumnaSimple>
      <div className=''>
        <DataTable
          value={modulos}
          showGridlines
          removableSort
          editMode='row'
          dataKey='id_modulo'
          onRowEditComplete={onRowEditComplete}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field='nombre'
            header='Nombre'
            sortable
            editor={(options) => textEditor(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='siglas'
            header='Siglas'
            //body={statusBodyTemplate}
            editor={(options) => textEditor(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='descripcion'
            header='Descripción'
            //body={priceBodyTemplate}
            editor={(options) => textEditor(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='id_ciclo'
            header='Ciclo'
            sortable
            //body={priceBodyTemplate}
            editor={(options) => textEditor(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            rowEditor={allowEdit} // Revisar funcionamiento de esto.
            headerStyle={{ width: "10%", minWidth: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
        </DataTable>
        <ColumnaSimple estilo=''>Columna 2</ColumnaSimple>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasModulos;
