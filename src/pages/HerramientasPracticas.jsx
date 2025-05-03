import React, { useEffect, useRef, useState } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
import "./HerramientasPracticas.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearPractica from "../components/formularios/FormCrearPractica.jsx";

const HerramientasPracticas = () => {
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
    practica,
    cambiarPractica,
    practicas,
    cambiarPracticas,
    tipoPracticas,
  } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();
  const { iconos, exportarCSV } = useEstilos();
  const { visible, alternarModal } = useModales();

  /** Funciones para la gestión de la BBDD. */
  /** Estas funciones son diseñadas para este componente utilizando, internamente, las genéricas del contexto. */
  const actualizarPractica = async (evento) => {
    let { newData, index } = evento;
    await actualizarDato("Practicas", "id_practica", newData);
    if (!errorGeneral) {
      let _practicas = [...practicas];
      _practicas[index] = newData;
      cambiarPracticas(_practicas);
      mostrarTostadaExito({
        resumen: "Datos actualizados.",
        detalle: `La práctica ${newData.nombre} se ha actualizado.`,
      });
      //cambiarPractica({});
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en la actualización.",
        detalle: `La práctica ${newData.nombre} no se ha actualizado.`,
      });
    }
  };

  const borrarPractica = async (datos) => {
    await borrarDato("Practicas", "id_practica", datos);

    if (!errorGeneral) {
      const _practicas = practicas.filter((practica) => {
        if (practica.id_practica !== datos["id_practica"]) {
          return practica;
        }
      });
      cambiarPracticas(_practicas);
      mostrarTostadaExito({
        resumen: "Datos eliminados.",
        detalle: `La práctica ${datos.nombre} se ha eliminado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en el borrado.",
        detalle: `La práctica ${datos.nombre} no se ha eliminado.`,
      });
    }
  };

  const confirmarBorrado = (datos) => {
    confirmDialog({
      message: `¿Quieres borrar la práctica ${datos.nombre}?`,
      header: "Confirmación de borrado",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        borrarPractica(datos);
      },
    });
  };

  const crearPractica = async () => {
    await insertarDato("Practicas", practica);
    if (!errorGeneral) {
      /** Se vuelve a traer los datos desde el servidor ya que al crearlos
       * no se genera un id_modulo (se crea en la BBDD) y si se añade al estado
       * lo hace sin el identificador. Al borrar o actualizar sin recargar la
       * página se produce un error. Si se vuelven a traer los daros tras la
       * inserción la información es completa.
       * PROPONER -> Cambiar el id de la BBDD por UUID y generarlo en local al insertar.
       */
      obtenerTodos("Practicas", cambiarPracticas);
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `La práctica ${practica.nombre} se ha insertado correctamente.`,
      });
      cambiarPractica({});
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `La práctica ${practica.nombre} no se ha insertado.`,
      });
    }
    alternarModal();
  };

  /** Funciones para el DataTable. */

  /***********************************************************
   *  Función principal que se ejecuta al pulsar botón check.
   * */
  const editarPractica = (e) => {
    actualizarPractica(e);
  };

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */

  const editorTexto = (options, largo) => {
    return (
      <InputText
        className={
          largo
            ? `herramientasPracticas_inputLargo`
            : `herramientasPracticas_inputCorto`
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

  const editorTipoPractica = (options) => {
    return (
      <Dropdown
        // Valor de select que tiene inicialmente (al ser dibujado por el componente).
        value={options.value.id_tipopractica}
        // Objeto de valores a mostrar en el select.
        options={tipoPracticas}
        // Clave a mostrar de ese objeto.
        optionLabel='nombre'
        // Valor del select que devuelve a los datos del DataTable.
        onChange={(e) => {
          options.editorCallback(e.value.id_tipopractica);
        }}
        placeholder='Tipo de práctica'
      />
    );
  };

  /**
   * Funciones para los body de las columnas del DataTable.
   * */

  const mostrarTipoPractica = (options) => {
    const tipo = tipoPracticas.filter(
      (c) => c.id_tipopractica === options.id_tipopractica
    );
    return tipo[0].nombre;
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
    obtenerTodos("Practicas", cambiarPracticas);
  }, []);

  return (
    <ColumnaSimple>
      <h2>
        <i className={iconos.modulo} style={{ fontSize: "1.7rem" }}></i>{" "}
        Mantenimiento de prácticas
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
            label='Añadir práctica'
            icon={iconos.mas}
            onClick={() => alternarModal()}
          />
        </div>
        <DataTable
          value={practicas}
          ref={dataTableRef}
          showGridlines
          size='small'
          loading={false}
          resizableColumns
          removableSort
          editMode='row'
          dataKey='id_practica'
          columnResizeMode='fit'
          onRowEditComplete={(e) => {
            editarPractica(e);
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
            field='numero'
            header='Número'
            sortable
            editor={(options) => editorTexto(options, false)}
          ></Column>
          <Column
            field='nombre'
            header='Título'
            editor={(options) => editorTexto(options, true)}
          ></Column>
          <Column
            field='id_tipopractica'
            header='Tipo de práctica'
            sortable
            editor={(options) => editorTipoPractica(options)}
            body={(options) => mostrarTipoPractica(options)}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
          <Column
            field='enunciado'
            header='Enunciado'
            body={(options) => {
              return mostrarDescripcion(options.enunciado);
            }}
            editor={(options) => editorTextoArea(options)}
          ></Column>
          <Column
            field='descripcion'
            header='Objetivos/contenidos'
            body={(options) => {
              return mostrarDescripcion(options.descripcion);
            }}
            editor={(options) => editorTextoArea(options)}
          ></Column>
        </DataTable>

        {/*  Formulario para un componente nuevo. */}
        <Dialog
          header='Formulario inserción de prácticas'
          visible={visible}
          style={{ width: "50vw" }}
          onHide={() => {
            alternarModal();
          }}
        >
          <FormCrearPractica funcion={crearPractica} />
        </Dialog>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasPracticas;

{
  /* 
  
import { createSwapy } from "swapy";

  const arrastrable = useRef(null);
  const arrastrable2 = useRef(null);
  const contenedor = useRef(null);
  const contenedor2 = useRef(null);

  useEffect(() => {
    if (contenedor.current) {
      arrastrable.current = createSwapy(contenedor.current);
      arrastrable.current.onSwap((evento) => {
        console.log("swap", evento);
      });
    }

    if (contenedor2.current) {
      arrastrable2.current = createSwapy(contenedor2.current);
      arrastrable2.current.onSwap((evento) => {
        console.log("swap2", evento);
      });
    }

    return () => {
      arrastrable.current?.destroy();
      arrastrable2.current?.destroy();
    };
  }, []);
  
  <div ref={contenedor}>
        <div data-swapy-slot='a'>
          <div data-swapy-item='a'>
            <div>A</div>
          </div>
        </div>

        <div data-swapy-slot='b'>
          <div data-swapy-item='b'>
            <div>B</div>
          </div>
        </div>
      </div>

      <div ref={contenedor2}>
        <div data-swapy-slot='1'>
          <div data-swapy-item='1'>
            <div>1</div>
          </div>
        </div>

        <div data-swapy-slot='2'>
          <div data-swapy-item='2'>
            <div>2</div>
          </div>
        </div>
      </div> */
}
