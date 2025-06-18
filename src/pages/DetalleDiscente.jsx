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
import DetalleDiscenteEvaluaciones from "../components/DetalleDiscenteEvaluaciones.jsx";

const DetalleDiscente = () => {
  const { id } = useParams();
  const {
    cargando,
    cambiarErrorGeneral,
    obtenerConsulta,
    evaluan,
    cambiarEvaluan,
    evaluaciones,
    cursos,
    curso,
    cambiarCurso,
    cursoActual,
  } = useDatos();

  const dataTableRef = useRef(null);

  /*******************************************************************
   * Estado para los componentes del formulario (PrimeReact).
   */
  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [listadoEvaluacionesCiclos, setListadoEvaluacionesCiclos] = useState(
    []
  );

  const cargaInicialDatos = async () => {
    // Se obtienen todas las prácticas (evaluan) sólo del discente en cuestión.
    // Así se evita traer todos los datos (que eventualmente serán muchos).
    // La vista está ordenada por nombre de la evaluación para que se muestre bien en el DataTable de notas.
    await obtenerConsulta(
      "listado_evaluaciones_ciclos",
      setListadoEvaluacionesCiclos,
      { columna: "id_discente", valor: id }
    );
    // Se actualiza el curso actual con el último curso creado.
    setCursoSeleccionado(cursoActual);
  };

  useEffect(() => {
    cargaInicialDatos();
  }, []);

  return (
    <ColumnaSimple>
      <ColumnaSimple>
        <h2>Ficha de detalle discente con id = {id}</h2>
      </ColumnaSimple>
      <ColumnaSimple>
        <ColumnaSimple>
          <div className='text-right'>
            <Dropdown
              //Estado con el valor seleccionado.
              value={cursoSeleccionado}
              onChange={(e) => {
                setCursoSeleccionado(e.target.value);
              }}
              // Array con las opciones disponibles.
              options={cursos}
              // Clave del objeto que se mostrará en el desplegable.
              optionLabel='nombre'
              placeholder='Elige un curso'
              className=''
            ></Dropdown>
            {/* <ValorEstado mostrar={cursoSeleccionado} /> */}
          </div>
        </ColumnaSimple>
        <ColumnaSimple>
          <div>
            {Array.isArray(listadoEvaluacionesCiclos) &&
            listadoEvaluacionesCiclos?.length ? (
              <DetalleDiscenteEvaluaciones
                evaluaciones={listadoEvaluacionesCiclos}
                curso={cursoSeleccionado}
              />
            ) : (
              "No se han encontrado datos de/la discente."
            )}
          </div>
        </ColumnaSimple>
      </ColumnaSimple>
      {/*  Todas las prácticas {listadoEvaluacionesCiclos.length}
      <ValorEstado mostrar={listadoEvaluacionesCiclos} /> */}
    </ColumnaSimple>
  );
};

export default DetalleDiscente;
