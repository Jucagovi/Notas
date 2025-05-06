import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import useEstilos from "../../hooks/useEstilos.js";

const DetalleDiscenteTablaEvaluaciones = ({ datos }) => {
  /*******************************************************************
   * Funciones para la tabla.
   */

  const { colorNota } = useEstilos();

  const mostrarNombreCompleto = (options) => {
    return `${options.numero} ${options.nombre_practica} ${options.enunciado}`;
  };

  const mostrarNota = (options) => {
    return (
      <span style={{ color: colorNota(options.nota) }}>{options.nota}</span>
    );
  };

  const calcularMediaPonderada = () => {
    let subtotal = 0;
    let pesoTotal = 0;
    datos.map((dato) => {
      subtotal += dato.nota * dato.peso;
      pesoTotal += dato.peso;
    });
    //return Math.trunc(subtotal / pesoTotal);
    return (
      <span style={{ color: colorNota(Math.trunc(subtotal / pesoTotal)) }}>
        {Math.trunc(subtotal / pesoTotal)}
      </span>
    );
  };

  const calcularTotalPeso = () => {
    let total = 0;
    datos.map((dato) => {
      total += dato.peso;
    });
    return total;
  };

  const pieTabla = (
    <ColumnGroup>
      <Row>
        <Column
          footer='Totales:'
          colSpan={2}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={calcularMediaPonderada} />
        <Column footer={calcularTotalPeso} />
      </Row>
    </ColumnGroup>
  );

  return (
    <>
      <p>
        Her una table maedtro detalle: maestro las tres evaluaciones con la nota
        por color, detalle el listado de notas tal y como está ahora. QUitar el
        drop down.
      </p>
      <DataTable
        value={datos}
        dataKey={datos.id_practica}
        //showGridlines
        stripedRows
        resizableColumns
        removableSort
        editMode='row'
        columnResizeMode='fit'
        paginator
        rows={10}
        footerColumnGroup={pieTabla}
      >
        <Column
          field='numero'
          header='Nombre de la práctica'
          body={(options) => {
            return mostrarNombreCompleto(options);
          }}
          sortable
        ></Column>
        <Column sortable field='unidad' header='Unidad de Trabajo'></Column>
        <Column
          sortable
          field='nota'
          header='Nota'
          //style={{ color: "red" }}
          body={(options) => {
            return mostrarNota(options);
          }}
        ></Column>
        <Column sortable field='peso' header='Peso'></Column>
      </DataTable>
    </>
  );
};

export default DetalleDiscenteTablaEvaluaciones;
