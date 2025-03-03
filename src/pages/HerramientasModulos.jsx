import React, { useState, useEffect, useContext } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import { contextoDatos } from "../contexts/ProveedorDatos.jsx";
import { contextoTostadas } from "../contexts/ProveedorTostadas.jsx";
import "./HerramientasModulos.css";
import { FloatLabel } from "primereact/floatlabel";

const HerramientasModulos = () => {
  const { obtenerTodos, actualizarDato, error, borrarDato } =
    useContext(contextoDatos);

  const { mostrarTostadaError, mostrarTostadaExito } =
    useContext(contextoTostadas);

  /** Funciones para la gestión de la BBDD. */
  const [modulos, setModulos] = useState([]);

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

  /** Funciones para el DataTable. */

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
          ></Column>
          <Column
            field='siglas'
            header='Siglas'
            editor={(options) => editorTexto(options)}
          ></Column>
          <Column
            field='descripcion'
            header='Descripción'
            editor={(options) => editorTexto(options)}
          ></Column>
          <Column
            field='id_ciclo'
            header='Ciclo'
            sortable
            editor={(options) => editorTexto(options)}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
          <Column rowEditor={true} bodyStyle={{ textAlign: "center" }}></Column>
          <Column
            bodyStyle={{ textAlign: "center" }}
            editor={(options) => {
              return editorBorrar(options);
            }}
          ></Column>
        </DataTable>
        <ColumnaSimple estilo=''>
          <div className='card gap-3'>
            <h2>Formulario inserción de módulos.</h2>
            <div className='p-inputgroup flex-1'>
              <span className='p-inputgroup-addon'>
                <i className='pi pi-user'></i>
              </span>
              <FloatLabel>
                <InputText id='nombreModulo' className='p-inputtext-sm' />
                <label htmlFor='nombreModulo'>Nombre del módulo</label>
              </FloatLabel>
            </div>
            <div className='p-inputgroup flex-1'>
              <span className='p-inputgroup-addon'>
                <i className='pi pi-user'></i>
              </span>
              <FloatLabel>
                <InputText id='siglasModulo' placeholder='Siglas del módulo' />
                <label htmlFor='siglasModulo'>Siglas del módulo</label>
              </FloatLabel>
            </div>
            <div className='p-inputgroup flex-1'>
              <span className='p-inputgroup-addon'>
                <i className='pi pi-user'></i>
              </span>
              <FloatLabel>
                <InputText
                  id='descripcionModulo'
                  placeholder='Descripción del módulo'
                />
                <label htmlFor='descripcionModulo'>
                  Descripción del módulo
                </label>
              </FloatLabel>
            </div>
            <div className='p-inputgroup flex-1'>
              <span className='p-inputgroup-addon'>
                <i className='pi pi-user'></i>
              </span>
              <FloatLabel>
                <InputText
                  id='cicloModulo'
                  placeholder='Ciclo donde se imparte el módulo'
                />
                <label htmlFor='cicloModulo'>
                  Ciclo donde se imparte el módulo
                </label>
              </FloatLabel>
            </div>
          </div>
        </ColumnaSimple>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasModulos;
