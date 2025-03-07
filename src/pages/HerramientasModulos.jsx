import React, { useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { confirmDialog } from "primereact/confirmdialog";
import "./HerramientasModulos.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearModulos from "../components/formularios/FormCrearModulos.jsx";

const HerramientasModulos = () => {
  // Información necesaria para la gestión de los datos.
  const {
    obtenerTodos,
    actualizarDato,
    error,
    borrarDato,
    crearDato,
    modulo,
    modulos,
    cambiarModulos,
  } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();
  const { iconos } = useEstilos();
  const { visible, alternarModal } = useModales();

  /** Funciones para la gestión de la BBDD. */
  /** Estas funciones son diseñadas para este componente utilizando, internamente, las genéricas del contexto. */
  const actualizarModulo = async (evento) => {
    let { newData, index } = evento;
    await actualizarDato("Modulos", "id_modulo", newData);
    if (!error) {
      let _modulos = [...modulos];
      _modulos[index] = newData;
      cambiarModulos(_modulos);
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
      cambiarModulos(_modulos);
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

  const crearModulo = async () => {
    await crearDato("Modulos", modulo);
    if (!error) {
      /** Se vuelve a traer los datos desde el servidor ya que al crearlos
       * no se genera un id_modulo (se crea en la BBDD) y si se añade al estado
       * lo hace sin el identificador. Al borrar o actualizar sin recargar la
       * página se produce un error. Si se vuelven a traer los daros tras la
       * inserción la información es completa.
       */
      obtenerTodos("Modulos", cambiarModulos);
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `El módulo ${modulo.nombre} se ha insertado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `El módulo ${modulo.nombre} no se ha insertado.`,
      });
    }
    alternarModal();
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
    obtenerTodos("Modulos", cambiarModulos);
  }, []);

  return (
    <ColumnaSimple>
      <div className=''>
        <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
          <p>Error en todo momento -- "{error}".</p>
          <Button
            label='Añadir módulo'
            icon={iconos.mas}
            onClick={() => alternarModal()}
          />
        </div>
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

        {/*  Formulario para un componente nuevo. */}
        <Dialog
          header='Formulario inserción de módulos'
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => {
            alternarModal();
          }}
        >
          <FormCrearModulos funcion={crearModulo} />
        </Dialog>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasModulos;
