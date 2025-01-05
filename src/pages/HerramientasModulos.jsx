import React, { useState, useEffect, useContext, useRef } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import { contextoDatos } from "../contexts/ProveedorDatos.jsx";
import { contextoTostadas } from "../contexts/ProveedorTostadas.jsx";
import "./HerramientasModulos.css";
import ValorEstado from "../components/complementos/ValorEstado";

const HerramientasModulos = () => {
  const { obtenerTodos, actualizarDato, error, lanzarError, borrarDato } =
    useContext(contextoDatos);

  const { tostada, mostrarTostadaError, mostrarTostadaExito } =
    useContext(contextoTostadas);

  const moduloInicial = {
    id_modulo: "",
    nombre: "",
    siglas: "",
    descripcion: "",
    id_ciclo: "",
  };
  const [modulos, setModulos] = useState([]);
  const [modulo, setModulo] = useState(moduloInicial);

  /********************************************************
   * Funciones para el tratamiento de la BBDD
   */

  const actualizarModulo = async (e) => {
    let { newData, index } = e;
    await actualizarDato("Modulos", "id_modulo", newData);
    if (!error) {
      let _modulos = [...modulos];
      _modulos[index] = newData;
      setModulos(_modulos);
      mostrarTostadaExito({
        resumen: "Datos actualizados.",
        detalle: `El módulo ${newData.nombre} se ha actualizado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en la actualización.",
        detalle: `El módulo ${newData.nombre} no se ha actualizado.`,
      });
    }
  };

  const borrarModulo = async (datos) => {
    await borrarDato("Modulos", "id_modulo", datos);

    if (!error) {
      const _modulos = modulos.filter((modulo) => {
        if (modulo.id_modulo !== datos["id_modulo"]) {
          return modulo;
        }
      });
      // Se actualiza el estado.
      setModulos(_modulos);
      mostrarTostadaExito({
        resumen: "Datos eliminados.",
        detalle: `El módulo ${datos.nombre} se ha eliminado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en el borrado.",
        detalle: `El módulo ${datos.nombre} no se ha eliminado.`,
      });
    }
  };

  const confirmarBorrado = (datos) => {
    confirmDialog({
      message: `¿Quieres borrar el módulo ${datos.nombre}?`,
      header: "Confirmación de borrado",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        borrarModulo(datos);
      },
    });
  };

  /********************************************
   * Funciones para el DataTable
   */
  const editarModulo = (e) => {
    actualizarModulo(e);
  };

  const editorTexto = (options) => {
    return (
      <InputText
        type='text'
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const editorBorrar = (options) => {
    return (
      <Button
        icon='pi pi-trash'
        severity='danger'
        //rounded
        //outlined
        text
        onClick={(e) => {
          confirmarBorrado(options.rowData);
        }}
      />
    );
  };

  /***
 * Colocar en cada DataTable la opción de exportar el listado a un CSV, PDF o EXCEL
 * 
 * const header = (
        <div className="flex align-items-center justify-content-end gap-2">
            <Button type="button" icon="pi pi-file" rounded onClick={() => exportCSV(false)} data-pr-tooltip="CSV" />
            <Button type="button" icon="pi pi-file-excel" severity="success" rounded onClick={exportExcel} data-pr-tooltip="XLS" />
            <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPdf} data-pr-tooltip="PDF" />
        </div>
    );

    https://primereact.org/datatable/#edit
 * 
 */

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
          size='small'
          loading={false}
          resizableColumns
          removableSort
          editMode='row'
          dataKey='id_modulo'
          onRowEditComplete={(e) => {
            editarModulo(e);
          }}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field='nombre'
            header='Nombre'
            sortable
            editor={(options) => editorTexto(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='siglas'
            header='Siglas'
            //body={statusBodyTemplate}
            editor={(options) => editorTexto(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='descripcion'
            header='Descripción'
            //body={priceBodyTemplate}
            editor={(options) => editorTexto(options)}
            //style={{ width: "20%" }}
          ></Column>
          <Column
            field='id_ciclo'
            header='Ciclo'
            sortable
            //body={priceBodyTemplate}
            editor={(options) => editorTexto(options)}
            //style={{ width: "20%" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
          <Column
            rowEditor={true} // Revisar funcionamiento de esto.
            //headerStyle={{ width: "10%", minWidth: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
          <Column
            //field='id_modulo'
            bodyStyle={{ textAlign: "center" }}
            editor={(options) => {
              return editorBorrar(options);
            }}
          ></Column>
        </DataTable>
        <ColumnaSimple estilo=''>Columna 2</ColumnaSimple>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasModulos;
