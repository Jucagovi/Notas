import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import useEstilos from "../../hooks/useEstilos.js";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import ValorEstado from "../complementos/ValorEstado.jsx";

const DetalleDiscenteTablaEvaluaciones = ({ evaluaciones }) => {
  const { iconos, extraerUnicos } = useEstilos();

  /**
   * Estados
   */
  // Para el contenido de la expansión.
  const [contenidoExpandible, setContenidoExpandible] = useState([]);
  // Para el listado de módulos de el curso elegido (se obtienen valores únicos).
  const [modulosUnicos, setModulosUnicos] = useState(
    //extraerUnicos(evaluaciones, "nombre_modulo")
    [
      "Desarrollo Web en Entorno Cliente",
      "Diseño 2D y 3D",
      "Diseño, Gestión, Producción y Publicación",
    ]
  );
  const iconoModulo = `mr-2 ${iconos.modulo}`;

  /*******************************************************************
   * Contenido para la expansión.
   */

  const cabeceraTablaGrupo = (options) => {
    return (
      <React.Fragment>
        <span className='vertical-align-middle ml-2 font-bold line-height-3'>
          {options.nombre_evaluacion} (
          {calcularMediaPonderada(options.id_evaluacion)})
        </span>
      </React.Fragment>
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
            {calcularMediaPonderada(options.id_evaluacion)}
          </div>
        </td>
      </>
    );
  };

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

  const calcularMediaPonderada = (id) => {
    let subtotal = 0;
    let pesoTotal = 0;
    if (id === "curso") {
      evaluaciones.map((eva) => {
        subtotal += eva.nota * eva.peso;
        pesoTotal += eva.peso;
      });
    } else {
      evaluaciones.map((eva) => {
        if (eva.id_evaluacion === id) {
          subtotal += eva.nota * eva.peso;
          pesoTotal += eva.peso;
        }
      });
    }

    return (
      <span style={{ color: colorNota(Math.trunc(subtotal / pesoTotal)) }}>
        {Math.trunc(subtotal / pesoTotal)}
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

  const pieTabla = (
    <ColumnGroup>
      <Row>
        <Column
          footer='Media del curso'
          colSpan={4}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={calcularMediaPonderada("curso")} />
      </Row>
    </ColumnGroup>
  );

  const mostrarCabecera = (valor) => {
    return (
      <span className='flex align-items-center gap-2 w-full'>
        <Avatar image={iconos.modulo} shape='circle' />
        <span className='font-bold white-space-nowrap'>{valor}</span>
        <Badge value='2' className='ml-auto' />
      </span>
    );
  };

  return (
    <>
      <Accordion>
        {modulosUnicos.length
          ? modulosUnicos.map((moduloUnico) => {
              const _filtrado = evaluaciones.filter((eva) => {
                return eva.nombre_modulo === moduloUnico;
              });
              return (
                <AccordionTab
                  header={() => {
                    return mostrarCabecera(moduloUnico);
                  }}
                  leftIcon={iconoModulo}
                >
                  <p className='m-0'>
                    <DataTable
                      value={_filtrado}
                      dataKey={_filtrado.id_practica}
                      //showGridlines
                      stripedRows
                      resizableColumns
                      removableSort
                      editMode='row'
                      columnResizeMode='fit'
                      //paginator
                      //rows={10}
                      footerColumnGroup={pieTabla}
                      expandableRowGroups
                      expandedRows={contenidoExpandible}
                      rowGroupMode='subheader'
                      groupRowsBy='nombre_evaluacion'
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
                      <Column
                        field='unidad'
                        header='Unidad de Trabajo'
                      ></Column>
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
                  </p>
                </AccordionTab>
              );
            })
          : "No se han encontrado módulos."}
      </Accordion>
      {/* <DataTable
        value={evaluaciones}
        dataKey={evaluaciones.id_practica}
        //showGridlines
        stripedRows
        resizableColumns
        removableSort
        editMode='row'
        columnResizeMode='fit'
        //paginator
        //rows={10}
        footerColumnGroup={pieTabla}
        expandableRowGroups
        expandedRows={contenidoExpandible}
        rowGroupMode='subheader'
        groupRowsBy='nombre_evaluacion'
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
        <Column field='unidad' header='Unidad de Trabajo'></Column>
        <Column
          field='nota'
          header='Nota'
          //style={{ color: "red" }}
          body={(options) => {
            return mostrarNota(options);
          }}
        ></Column>
        <Column field='peso' header='Peso'></Column>
      </DataTable> */}
    </>
  );
};

export default DetalleDiscenteTablaEvaluaciones;
