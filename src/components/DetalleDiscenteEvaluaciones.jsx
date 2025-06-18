import React, { useState, useEffect } from "react";
import useEstilos from "../hooks/useEstilos.js";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import ValorEstado from "./complementos/ValorEstado.jsx";
import DiscentesEvaluacionesDataTable from "./datatables/DiscentesEvaluacionesDataTable.jsx";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";

const DetalleDiscenteEvaluaciones = ({ evaluaciones, curso }) => {
  const { iconos, extraerUnicos } = useEstilos();
  /**
   * Para el listado de módulos de el curso elegido (se obtienen valores únicos).
   * Controla los <DiscentesEvaluacionesDataTable>.
   */
  const [modulosUnicos, setModulosUnicos] = useState([]);

  const mostrarCabecera = (valor) => {
    return (
      <span className='flex align-items-center gap-2 w-full'>
        <Avatar image={iconos.modulo} shape='circle' />
        <span className='font-bold white-space-nowrap'>{valor}</span>
        <Badge value='2' className='ml-auto' />
      </span>
    );
  };

  const filtrarListadoCurso = (cursoFiltrar) => {
    const _listado = evaluaciones.filter((evaluacion) => {
      return evaluacion.id_curso === cursoFiltrar.id_curso;
    });
    console.log(_listado);
    // Se extraen los módulos únicos (por cada uno se pinta un <DiscentesEvaluacionesDataTable>).
    setModulosUnicos(extraerUnicos(_listado, "id_modulo"));
  };

  useEffect(() => {
    filtrarListadoCurso(curso);
  }, [curso]);

  return (
    <>
      {Array.isArray(modulosUnicos) && modulosUnicos?.length
        ? modulosUnicos.map((moduloUnico, indice) => {
            const _filtrado = evaluaciones.filter((eva) => {
              return eva.id_modulo === moduloUnico;
            });
            return (
              <div key={indice} className='my-5'>
                <DiscentesEvaluacionesDataTable evaluaciones={_filtrado} />
              </div>
            );
          })
        : "No se han encontrado módulos."}
    </>
  );
};

export default DetalleDiscenteEvaluaciones;
