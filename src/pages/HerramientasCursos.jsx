import React, { useState, useRef, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
import "./HerramientasCiclos.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearCurso from "../components/formularios/FormCrearCurso.jsx";

const HerramientasCursos = () => {
  /**
   * Referencia que apunta al DataTable para la creación del CSV.
   */

  const dataTableRef = useRef(null);

  // Información necesaria para la gestión de los datos.
  const {
    obtenerTodos,
    actualizarDato,
    errorGeneral,
    cargando,
    borrarDato,
    insertarDato,
    ciclo,
    cambiarCiclo,
    ciclos,
    cambiarCiclos,
    cursos,
    cambiarCursos,
    curso,
    cambiarCurso,
  } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();
  const { iconos, exportarCSV } = useEstilos();
  const { visible, alternarModal } = useModales();

  /** Funciones para la gestión de la BBDD. */
  /** Estas funciones son diseñadas para este componente utilizando, internamente, las genéricas del contexto. */
  const actualizarCurso = async (evento) => {
    let { newData, index } = evento;
    await actualizarDato("Cursos", "id_curso", newData);
    if (!errorGeneral) {
      let _cursos = [...cursos];
      _cursos[index] = newData;
      cambiarCiclos(_cursos);
      mostrarTostadaExito({
        resumen: "Datos actualizados.",
        detalle: `El curso ${newData.nombre} se ha actualizado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en la actualización.",
        detalle: `El curso ${newData.nombre} no se ha actualizado.`,
      });
    }
  };

  const borrarCurso = async (datos) => {
    await borrarDato("Cursos", "id_curso", datos);

    if (!errorGeneral) {
      const _cursos = cursos.filter((ciclo) => {
        if (ciclo.id_ciclo !== datos["id_ciclo"]) {
          return ciclo;
        }
      });
      cambiarCiclos(_cursos);
      mostrarTostadaExito({
        resumen: "Datos eliminados.",
        detalle: `El curso ${datos.nombre} se ha eliminado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en el borrado.",
        detalle: `El curso ${datos.nombre} no se ha eliminado.`,
      });
    }
  };

  const confirmarBorrado = (datos) => {
    confirmDialog({
      message: `¿Quieres borrar el curso ${datos.nombre}?`,
      header: "Confirmación de borrado",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        borrarCiclo(datos);
      },
    });
  };

  const crearCurso = async () => {
    await insertarDato("Cursos", curso);
    if (!errorGeneral) {
      /** Se vuelve a traer los datos desde el servidor ya que al crearlos
       * no se genera un id_modulo (se crea en la BBDD) y si se añade al estado
       * lo hace sin el identificador. Al borrar o actualizar sin recargar la
       * página se produce un error. Si se vuelven a traer los daros tras la
       * inserción la información es completa.
       * PROPONER -> Cambiar el id de la BBDD por UUID y generarlo en local al insertar.
       */
      obtenerTodos("Cursos", cambiarCursos);
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `El curso ${modulo.nombre} se ha insertado correctamente.`,
      });
      // Se limpia el estado y, con él, el formulario.
      cambiarCurso({});
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `El curso ${modulo.nombre} no se ha insertado.`,
      });
    }
    alternarModal();
  };

  /** Funciones para el DataTable. */

  /***********************************************************
   *  Función principal que se ejecuta al pulsar botón check.
   * */
  const editarCurso = (e) => {
    actualizarCurso(e);
  };

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */
  // Segundo parámetro para especificar la calse del input (taaño).
  const editorTexto = (options, largo) => {
    return (
      <InputText
        className={
          largo
            ? `herramientasCiclos_inputLargo`
            : `herramientasCiclos_inputCorto`
        }
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

  /**
   * Funciones para los body de las columnas del DataTable.
   * */

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

  /**************************************************
   * Funcionamiento básico del DataTable
   *
   * Cada uno posee un array de objetos con los datos de cada columna.
   * Para ello se crea un evento especial con un nuevo valor: newData (e.NewData).
   * Cada columna genera un objeto para ese array general.
   * En cada columna se debe saber:
   *  - field   ->  datos que se van a añadir al objeto de columna,
   *  - head    ->  información de la cabecera de la columna,
   *  - body    ->  contenido de la celda en modo "listado" (si no especifica se pondrá el field)
   *                puede ser el resulatdo de una función que devuelva cualquier componente
   *                por ejemplo para mostrar un valor diferente al field (ver desplegable Ciclos),
   *  - editor  ->  contenido de la celda en modo edición que también puede ser una función
   *                estas funciones reciben un objeto con los valores de toda la fila (options)
   *                options posee el método editorCallback() que cambia el valor de field.
   *
   * */

  return (
    <ColumnaSimple>
      <h2>
        <i className={iconos.curso} style={{ fontSize: "1.5rem" }}></i>{" "}
        Mantenimiento de cursos
      </h2>
      <div>
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
            label='Añadir curso'
            icon={iconos.mas}
            onClick={() => {
              alternarModal();
            }}
          />
        </div>
        <DataTable
          value={cursos}
          ref={dataTableRef}
          showGridlines
          size='small'
          loading={cargando}
          resizableColumns
          removableSort
          editMode='row'
          dataKey='id_curso'
          columnResizeMode='fit'
          onRowEditComplete={(e) => {
            editarCurso(e);
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
            editor={(options) => editorTexto(options, true)}
          ></Column>
          <Column
            field='centro'
            header='Centro formativo'
            editor={(options) => editorTexto(options, true)}
          ></Column>
          <Column
            sortable
            field='anyo'
            header='Año de inicio'
            editor={(options) => editorTexto(options, false)}
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
          <FormCrearCurso funcion={crearCurso} />
        </Dialog>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasCursos;
