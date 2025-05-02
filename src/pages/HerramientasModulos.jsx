import React, { useEffect, useRef } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
import "./HerramientasModulos.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearModulos from "../components/formularios/FormCrearModulos.jsx";

const HerramientasModulos = () => {
  /**
   * Referencia que apunta al DataTable para la creación del CSV.
   */

  const dataTableRef = useRef(null);

  // Información necesaria para la gestión de los datos.
  const {
    obtenerTodos,
    actualizarDato,
    errorGeneral,
    borrarDato,
    insertarDato,
    modulo,
    modulos,
    cambiarModulos,
    ciclos,
  } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();
  const { iconos, exportarCSV } = useEstilos();
  const { visible, alternarModal } = useModales();

  /** Funciones para la gestión de la BBDD. */
  /** Estas funciones son diseñadas para este componente utilizando, internamente, las genéricas del contexto. */
  const actualizarModulo = async (evento) => {
    let { newData, index } = evento;
    await actualizarDato("Modulos", "id_modulo", newData);
    if (!errorGeneral) {
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

    if (!errorGeneral) {
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
    await insertarDato("Modulos", modulo);
    if (!errorGeneral) {
      /** Se vuelve a traer los datos desde el servidor ya que al crearlos
       * no se genera un id_modulo (se crea en la BBDD) y si se añade al estado
       * lo hace sin el identificador. Al borrar o actualizar sin recargar la
       * página se produce un error. Si se vuelven a traer los daros tras la
       * inserción la información es completa.
       * PROPONER -> Cambiar el id de la BBDD por UUID y generarlo en local al insertar.
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

  /***********************************************************
   *  Función principal que se ejecuta al pulsar botón check.
   * */
  const editarModulo = (e) => {
    actualizarModulo(e);
  };

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */

  const editorTexto = (options) => {
    return (
      <InputText
        type='text'
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const editorTextoArea = (options) => {
    return (
      <InputTextarea
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        rows={3}
        cols={60}
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

  const editorCiclos = (options) => {
    return (
      <Dropdown
        // Valor de select que tiene inicialmente (al ser dibujado por el componente).
        value={options.value.id_ciclo}
        // Objeto de valores a mostrar en el select.
        options={ciclos}
        // Clave a mostrar de ese objeto.
        optionLabel='siglas'
        // Valor del select que devuelve a los datos del DataTable.
        onChange={(e) => {
          options.editorCallback(e.value.id_ciclo);
        }}
        placeholder='Ciclo'
      />
    );
  };

  /**
   * Funciones para los body de las columnas del DataTable.
   * */

  const mostrarSiglasCiclos = (options) => {
    const ciclo = ciclos.filter((c) => c.id_ciclo === options.id_ciclo);
    return ciclo[0].siglas;
  };

  const mostrarDescripcion = (valor) => {
    return (
      <InputTextarea
        value={valor}
        readOnly
        cols={60}
        autoResize
        className='border-none outline-none select-none appearance-none surface-0'
      />
    );
  };

  /******************************************************
   * Funciones para la exportación de ficheros.
   *
   */

  /**************************************************
   * Funcionamiento básico del DataTable
   *
   * Cada uno posee un array de objetos con los datos de cada columna.
   * Para ello se crea un evento especial con un nuevo valor: newData (e.NewData).
   * Cada columna genera un objeto para ese array general.
   * En cada columna se debe saber:
   *  - field   ->  datos que se van a añadir al objeto de columna,
   *  - headr   ->  información de la cabecera de la columna,
   *  - body    ->  contenido de la celda en modo "listado" (si no especifica se pondrá el field)
   *                puede ser el resulatdo de una función que devuelva cualquier componente
   *                por ejemplo para mostrar un valor diferente al field (ver desplegable Ciclos),
   *  - editor  ->  contenido de la celda en modo edición que también puede ser una función
   *                estas funciones reciben un objeto con los valores de toda la fila (options)
   *                options posee el método editorCallback() que cambia el valor de field.
   *
   * */

  useEffect(() => {
    obtenerTodos("Modulos", cambiarModulos);
  }, []);

  return (
    <ColumnaSimple>
      <h2>
        <i className={iconos.modulo} style={{ fontSize: "1.7rem" }}></i>{" "}
        Mantenimiento de módulos
      </h2>
      <div className=''>
        <div className='p-inputgroup flex-1 herramientasModulos_input'>
          <Button
            type='button'
            icon={iconos.archivo}
            onClick={() => {
              exportarCSV(dataTableRef, false);
            }}
            tooltip='Exportar a CSV'
            tooltipOptions={{ position: "top" }}
            raised
          />
          <Button
            label='Añadir módulo'
            icon={iconos.mas}
            onClick={() => alternarModal()}
          />
        </div>
        <DataTable
          value={modulos}
          ref={dataTableRef}
          showGridlines
          size='small'
          loading={false}
          resizableColumns
          removableSort
          editMode='row'
          dataKey='id_modulo'
          columnResizeMode='fit'
          onRowEditComplete={(e) => {
            editarModulo(e);
          }}
          tableStyle={{ maxWidth: "60rem" }}
        >
          <Column rowEditor={true} bodyStyle={{ textAlign: "center" }}></Column>
          <Column
            bodyStyle={{ textAlign: "center" }}
            editor={(options) => {
              return editorBorrar(options);
            }}
          ></Column>
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
            field='id_ciclo'
            header='Ciclo'
            sortable
            editor={(options) => editorCiclos(options)}
            body={(options) => mostrarSiglasCiclos(options)}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
          <Column
            field='descripcion'
            header='Descripción'
            body={(options) => {
              return mostrarDescripcion(options.descripcion);
            }}
            editor={(options) => editorTextoArea(options)}
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
