import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

import useDatos from "../../hooks/useDatos.js";
import useTostadas from "../../hooks/useTostadas.js";
import useEstilos from "../../hooks/useEstilos.js";

const NotasDiscentesDataTable = ({ valores, practica }) => {
  const { actualizarDato, errorGeneral } = useDatos();
  const { mostrarTostadaExito, mostrarTostadaError } = useTostadas();
  const { iconos } = useEstilos();

  const editorTexto = (options) => {
    return (
      <div>
        <InputText
          type='text'
          className='w-6'
          value={options.value || ""}
          onChange={(e) => {
            options.editorCallback(e.target.value);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  const editarNota = (e) => {
    let { rowData, newValue, field, value, originalEvent: event } = e;
    // Se comparan los valoes nuevo y viejo y sólo se actualiza si son diferentes (evota errores).
    if (newValue !== value) {
      if (newValue.trim().length > 0) rowData[field] = newValue;
      else event.preventDefault();
      actualizarNota(rowData.id_evaluan, rowData.nota);
    }
  };

  const mostrarNota = (datos) => {
    return datos.nota < 49 ? (
      <span className='text-red-500'>{datos.nota}</span>
    ) : (
      <span>{datos.nota}</span>
    );
  };

  const actualizarNota = async (id_evaluan, nota) => {
    const datos = { id_evaluan: id_evaluan, nota: nota };
    await actualizarDato("evaluan", "id_evaluan", datos);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Nota actualizada.",
        detalle: `La nota se ha actualizado.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Hay un error en la actualización.",
        detalle: `La nota no se ha actualizado.`,
      });
    }
  };

  return (
    <>
      <div className=' font-bold flex vertical-align-middle'>
        <i
          className={`${iconos.practica} m-2 mt-3 vertical-align-middle fadeinleft animation-duration-900`}
          style={{ fontSize: "1.5rem" }}
        ></i>
        <h3>
          {practica.nombre}: {practica.enunciado}
        </h3>
      </div>
      <DataTable
        removableSort
        className='w-full'
        editMode='cell'
        //onSelectionChange={(e) => setPracticasSeleccionadas(e.value)}
        dataKey='id_evaluan'
        //tableStyle={{ minWidth: "50rem" }}
        value={valores}
        emptyMessage='Selecciona una práctica para comenzar.'
      >
        <Column
          style={{ width: "40%" }}
          field='apellidos'
          header='Apellidos'
          sortable
        ></Column>
        <Column
          style={{ width: "40%" }}
          field='nombre_discente'
          header='Nombre'
          sortable
        ></Column>
        <Column
          className='text-center'
          style={{ width: "20%" }}
          field='nota'
          header='Nota'
          body={(options) => {
            return mostrarNota(options);
          }}
          sortable
          editor={(options) => {
            return editorTexto(options);
          }}
          onCellEditComplete={(options) => {
            editarNota(options);
          }}
        ></Column>
      </DataTable>
    </>
  );
};

export default NotasDiscentesDataTable;
