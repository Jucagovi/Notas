import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
//import "./HerramientasPracticas.css";
import useDatos from "../hooks/useDatos.js";
import useTostadas from "../hooks/useTostadas.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import { Dialog } from "primereact/dialog";
import FormCrearPractica from "../components/formularios/FormCrearPractica.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import DetalleDiscenteTablaEvaluaciones from "../components/tablas/DetalleDiscenteTablaEvaluaciones.jsx";

const DetalleDiscente = () => {
  const { id } = useParams();
  const {
    cargando,
    cambiarErrorGeneral,
    obtenerConsulta,
    evaluan,
    cambiarEvaluan,
    evaluaciones,
  } = useDatos();

  const dataTableRef = useRef(null);

  /*******************************************************************
   * Estado para los componentes del formulario (PrimeReact).
   */
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [evaluanFiltrado, setEvaluanFiltrado] = useState([]);

  useEffect(() => {
    const filtro = { columna: "id_discente", valor: id };
    // Es mejor crear una vista con las consultas multitabla en Supabase.
    obtenerConsulta("listado_evaluaciones", cambiarEvaluan, filtro);
  }, []);

  return (
    <ColumnaSimple>
      <ColumnaSimple>
        <h2>Ficha de detalle discente con id = {id}</h2>
      </ColumnaSimple>

      <ColumnaSimple>
        <div className='text-right'>
          <Dropdown
            //Estado con el valor seleccionado.
            value={evaluacionSeleccionada}
            onChange={(e) => {
              setEvaluacionSeleccionada(e.value);
              const _filtrados = evaluan.filter((eva) => {
                if (eva.id_evaluacion === e.value.id_evaluacion) {
                  return eva;
                }
              });
              setEvaluanFiltrado(_filtrados);
            }}
            // Array con las opciones disponibles.
            options={evaluaciones}
            // Clave del objeto que se mostrará en el desplegable.
            optionLabel='nombre'
            placeholder='Elige una evaluación'
            className=''
          ></Dropdown>
        </div>
        <div>
          {Array.isArray(evaluanFiltrado) && evaluanFiltrado.length ? (
            <DetalleDiscenteTablaEvaluaciones datos={evaluanFiltrado} />
          ) : (
            "No se ha seleccionado una evaluación."
          )}
        </div>
      </ColumnaSimple>
    </ColumnaSimple>
  );
};

export default DetalleDiscente;
