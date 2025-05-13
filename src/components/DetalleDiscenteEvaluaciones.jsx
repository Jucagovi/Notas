import React, { useState } from "react";
import useEstilos from "../hooks/useEstilos.js";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import ValorEstado from "./complementos/ValorEstado.jsx";
import TablaEvaluaciones from "./tablas/TablaEvaluaciones.jsx";

const DetalleDiscenteEvaluaciones = ({ evaluaciones }) => {
  const { iconos, extraerUnicos } = useEstilos();
  // Para el listado de módulos de el curso elegido (se obtienen valores únicos).
  const [modulosUnicos, setModulosUnicos] = useState(
    extraerUnicos(evaluaciones, "nombre_modulo")
  );

  const iconoModulo = `mr-2 ${iconos.modulo}`;

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
          ? modulosUnicos.map((moduloUnico, indice) => {
              const _filtrado = evaluaciones.filter((eva) => {
                return eva.nombre_modulo === moduloUnico;
              });
              return (
                <AccordionTab
                  key={indice}
                  header={() => {
                    return mostrarCabecera(moduloUnico);
                  }}
                  //leftIcon={iconoModulo}
                >
                  <div className='m-0'>
                    <TablaEvaluaciones evaluaciones={_filtrado} />
                  </div>
                </AccordionTab>
              );
            })
          : "No se han encontrado módulos."}
      </Accordion>
    </>
  );
};

export default DetalleDiscenteEvaluaciones;
