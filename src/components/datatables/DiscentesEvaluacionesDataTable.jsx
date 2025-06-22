import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import useEstilos from "../../hooks/useEstilos.js";

const DiscentesEvaluacionesDataTable = ({ evaluaciones }) => {
  const { colorNota } = useEstilos();

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
    return `${options.numero} ${options.nombre_practica} ${options.enunciado}`;
  };

  const mostrarNota = (options) => {
    return <span className={colorNota(options.nota)}>{options.nota}</span>;
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
        ></Column>
        <Column field='peso' header='Peso'></Column>
      </DataTable>
    </>
  );
};

export default DiscentesEvaluacionesDataTable;
