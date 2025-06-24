import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { InputText } from "primereact/inputtext";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";
import useTostadas from "../../hooks/useTostadas.js";

const DiscentesEvaluacionesDataTable = ({ evaluaciones }) => {
  const { colorNota, iconos } = useEstilos();
  const { actualizarDato, errorGeneral } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  /*******************************************************************
   * IMPORTANTE
   * El array de objetos con las evaluaciones hay que ordenarlo para que todas
   * las evaluaciones se muestren agrupadas en el DataTable (si no es así aparecen separadas).
   */

  const evaluacionesOrdenadas = evaluaciones.sort((a, b) => {
    if (a.id_evaluacion < b.id_evaluacion) return -1;
    if (a.id_evaluacion > b.id_evaluacion) return 1;
    return 0;
  });

  /*******************************************************************
   * Contenido para la expansión.
   */

  const [contenidoExpandible, setContenidoExpandible] = useState([]);

  const cabeceraTablaGrupo = (options) => {
    return (
      <>
        <span className='vertical-align-middle ml-2 font-bold line-height-3'>
          {options.nombre_evaluacion} (
          {evaluaciones && calcularMediaPonderada(options.id_evaluacion)})
        </span>
      </>
    );
  };

  const pieTablaGrupo = (options) => {
    return (
      <>
        <td colSpan={3}>
          <div className='flex justify-content-end font-bold w-full'>
            Media evaluación:
          </div>
        </td>
        <td colSpan={2}>
          <div className='flex justify-content-left font-bold w-full'>
            {evaluaciones && calcularMediaPonderada(options.id_evaluacion)}
          </div>
        </td>
      </>
    );
  };

  /*******************************************************************
   * Funciones para la tabla.
   */

  // Para el contenido de la expansión.

  const mostrarNombreCompleto = (options) => {
    return `${options.numero} ${options.enunciado}`;
  };

  const mostrarNota = (options) => {
    return (
      <span className={colorNota(options.nota)}>
        {options.nota ? options.nota : <i className={iconos.pregunta}></i>}
      </span>
    );
  };

  const calcularMediaPonderada = (id) => {
    let subtotal = 0;
    let pesoTotal = 0;
    if (id === "curso") {
      evaluaciones.map((eva) => {
        subtotal += parseInt(eva.nota) * parseInt(eva.peso);
        pesoTotal += parseInt(eva.peso);
      });
    } else {
      evaluaciones.map((eva) => {
        if (eva.id_evaluacion === id) {
          subtotal += parseInt(eva.nota) * parseInt(eva.peso);
          pesoTotal += parseInt(eva.peso);
        }
      });
    }
    const resultado = Math.trunc(subtotal / pesoTotal);
    return (
      <span style={{ color: colorNota(resultado) }}>
        {resultado ? resultado : ""}
      </span>
    );
  };

  const calcularTotalPeso = () => {
    let total = 0;
    evaluaciones.map((dato) => {
      total += dato.peso;
    });
    return total;
  };

  const editorTexto = (options) => {
    return (
      <div>
        <InputText
          type='text'
          className='w-4rem'
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

  const cabeceraTabla = `${evaluaciones[0].nombre_modulo}`;

  const pieTabla = (
    <ColumnGroup>
      <Row>
        <Column
          footer='Media del curso'
          colSpan={3}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={calcularMediaPonderada("curso")} />
      </Row>
    </ColumnGroup>
  );

  return (
    <>
      <DataTable
        header={cabeceraTabla}
        value={evaluacionesOrdenadas}
        dataKey={evaluaciones.id_practica}
        //showGridlines
        stripedRows
        resizableColumns
        removableSort
        //editMode='row'
        columnResizeMode='fit'
        //paginator
        //rows={10}
        footerColumnGroup={pieTabla}
        //expandableRowGroups
        //expandedRows={contenidoExpandible}
        rowGroupMode='subheader' //"subheader" and "rowgroup"
        groupRowsBy='id_evaluacion'
        onRowToggle={(e) => {
          setContenidoExpandible(e.data);
        }}
        editMode='cell'
        rowGroupHeaderTemplate={cabeceraTablaGrupo}
        rowGroupFooterTemplate={pieTablaGrupo}
      >
        <Column></Column>
        <Column
          field='numero'
          header='Nombre de la práctica'
          body={(options) => {
            return mostrarNombreCompleto(options);
          }}
        ></Column>
        {/* <Column field='unidad' header='Unidad de Trabajo'></Column> */}
        <Column
          field='nota'
          header='Nota'
          //style={{ color: "red" }}
          body={(options) => {
            return mostrarNota(options);
          }}
          editor={(options) => {
            return editorTexto(options);
          }}
          onCellEditComplete={(options) => {
            editarNota(options);
          }}
        ></Column>
        <Column field='peso' header='Peso'></Column>
      </DataTable>
    </>
  );
};

export default DiscentesEvaluacionesDataTable;
