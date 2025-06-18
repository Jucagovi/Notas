import React, { useRef } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import useEstilos from "../hooks/useEstilos.js";
import { Button } from "primereact/button";
import DiscentesListadoDataTable from "../components/datatables/DiscentesListadoDataTable.jsx";

const GestionDiscentes = () => {
  const { iconos, calcularEdad, exportarCSV } = useEstilos();

  const dataTableRef = useRef(null);

  return (
    <ColumnaSimple>
      <div>
        <div className='flex justify-content-between'>
          <h2>
            <i className={iconos.usuario} style={{ fontSize: "1.2rem" }}></i>{" "}
            Gestión de discentes
          </h2>
          <Button
            type='button'
            icon={iconos.archivo}
            text
            severity='secondary'
            onClick={() => {
              exportarCSV(dataTableRef, false);
            }}
            tooltip='Exportar a CSV'
            tooltipOptions={{ position: "left" }}
          />
        </div>
        <DiscentesListadoDataTable referencia={dataTableRef} />
      </div>
    </ColumnaSimple>
  );
};

export default GestionDiscentes;
