import React, { useState, useEffect } from "react";
import supabase from "../../config/config_supabase.js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import useTostadas from "../../hooks/useTostadas.js";

const EvaluacionPesoDataTable = ({ valores, evaluacion }) => {
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [totalPorcentaje, setTotalPorcentaje] = useState(0);

  const editorTexto = (options) => {
    return (
      <InputText
        type='text'
        className='w-8'
        value={options.value || ""}
        onChange={(e) => {
          options.editorCallback(e.target.value);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  };

  const editarEvaluacion = (e) => {
    let { rowData, newValue, value, field, originalEvent: event } = e;
    // Se comparan los valoes nuevo y viejo y sólo se actualiza si son diferentes (evota errores).
    if (newValue !== value) {
      if (newValue.trim().length > 0) rowData[field] = newValue;
      else event.preventDefault();
      actualizarPeso({
        id_evaluacion: evaluacion,
        id_practica: rowData.id_practica,
        peso: newValue,
      });
    }
  };

  const actualizarPeso = async (datos) => {
    const { data, error } = await supabase
      .from("evaluan")
      .update({ peso: datos.peso })
      .eq("id_evaluacion", datos.id_evaluacion)
      .eq("id_practica", datos.id_practica);
    if (!error) {
      // Se actualiza el total del pie de tabla.
      evaluacionesPie(datos);
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

  const evaluacionesPie = (datos) => {
    if (Array.isArray(datos) && datos?.length) {
      const total = datos.reduce((acumulador, valor, indice, array) => {
        return acumulador + valor.peso;
      }, 0);
      setTotalPorcentaje(total);
    } else {
      return "0";
    }
  };

  useEffect(() => {
    evaluacionesPie(valores);
  }, [evaluacion]);

  const pieTabla = (
    <ColumnGroup>
      <Row>
        <Column
          footer='Suma total (debe ser 100)'
          colSpan={2}
          footerStyle={{ textAlign: "right" }}
        />
        <Column
          footerStyle={{ textAlign: "center" }}
          footer={totalPorcentaje}
        />
      </Row>
    </ColumnGroup>
  );

  return (
    <DataTable
      removableSort
      editMode='cell'
      dataKey='id_practica'
      tableStyle={{ maxWidth: "50rem" }}
      value={valores}
      emptyMessage='Selecciona una evaluación para comenzar.'
      footerColumnGroup={pieTabla}
    >
      <Column
        style={{ width: "15%" }}
        field='numero'
        header='Número'
        sortable
      ></Column>
      <Column
        style={{ width: "70%" }}
        field='enunciado'
        header='Enunciado'
        sortable
      ></Column>
      <Column
        className='text-center'
        style={{ width: "15%" }}
        field='peso'
        header='Peso'
        sortable
        editor={(options) => {
          return editorTexto(options);
        }}
        onCellEditComplete={(options) => {
          editarEvaluacion(options);
        }}
      ></Column>
    </DataTable>
  );
};

export default EvaluacionPesoDataTable;
