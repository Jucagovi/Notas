import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const NotasPracticasDataTable = ({ valores, setter }) => {
  return (
    <>
      <DataTable
        className='w-full'
        removableSort
        value={valores}
        stripedRows
        selectionMode='single'
        onSelectionChange={(e) => {
          //buscarDiscentes(e.value, evaluacionSeleccionada);
          setter(e.value);
        }}
        //tableStyle={{ minWidth: "50rem" }}
        emptyMessage='Selecciona una evaluación para comenzar.'
      >
        <Column
          style={{ width: "10%" }}
          sortable
          field='numero'
          header='Número'
        ></Column>
        <Column
          style={{ width: "90%" }}
          field='enunciado'
          header='Enunciado'
        ></Column>
      </DataTable>
    </>
  );
};

export default NotasPracticasDataTable;
