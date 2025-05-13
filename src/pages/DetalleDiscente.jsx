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
  } = useDatos();

  const dataTableRef = useRef(null);

  /*******************************************************************
   * Estado para los componentes del formulario (PrimeReact).
   */
  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [listadoEvaluacionesCursos, setListadoEvaluacionesCursos] = useState(
    []
  );
  const [listadoFiltrado, setListadoFiltrado] = useState([]);

  const cargaInicialDatos = async () => {
    const filtro = { columna: "id_discente", valor: id };
    /**
     * Es mejor crear una vista con las consultas multitabla en Supabase.
     * Se pasa el setter de evaluanFiltrado para actualizar la tabla de detalle directamente.
     */

    await obtenerConsulta(
      "listado_evaluaciones_ciclos",
      setListadoEvaluacionesCursos,
      filtro
    );
    // Se actualiza el curso actual con el último curso creado.
    setCursoSeleccionado(cursos[cursos.length - 1]);
  };

  const filtrarListadoCurso = (cursoFiltrar) => {
    const _listado = listadoEvaluacionesCursos.filter((evaluacion) => {
      return evaluacion.id_curso === cursoFiltrar.id_curso;
    });
    setListadoFiltrado(_listado);
  };

  useEffect(() => {
    cargaInicialDatos();
  }, []);

  useEffect(() => {
    filtrarListadoCurso(cursoSeleccionado);
  }, [cursoSeleccionado]);

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
          </div>
        </ColumnaSimple>
        <ColumnaSimple>
          <div>
            {Array.isArray(listadoFiltrado) && listadoFiltrado.length ? (
              <DetalleDiscenteEvaluaciones evaluaciones={listadoFiltrado} />
            ) : (
              "No se han encontrado datos del/la discente."
            )}
          </div>
        </ColumnaSimple>
      </ColumnaSimple>
    </ColumnaSimple>
  );
};

export default DetalleDiscente;
