import React, { useState, useEffect } from "react";
import supabase from "../config/config_supabase.js";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { confirmDialog } from "primereact/confirmdialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useTostadas from "../hooks/useTostadas.js";
import { InputTextarea } from "primereact/inputtextarea";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";
import CreacionClaseCurso from "../components/creacionClase/CreacionClaseCurso.jsx";
import CreacionClaseModulo from "../components/creacionClase/CreacionClaseModulo.jsx";
import CreacionClaseEvaluaciones from "../components/creacionClase/CreacionClaseEvaluaciones.jsx";
import CreacionClaseDiscentes from "../components/creacionClase/CreacionClaseDiscentes.jsx";
import MostrarPracticas from "../components/MostrarPracticas.jsx";
import Cargando from "../components/Cargando.jsx";
import EvaluacionPesoDataTable from "../components/datatables/EvaluacionPesoDataTable.jsx";

const GestionEvaluaciones = () => {
  const {
    actualizarFormulario,
    actualizarDato,
    insertarDato,
    obtenerTodos,
    obtenerConsulta,
    obtenerConsultaReturn,
    practicas,
    evaluaciones,
    cursos,
    cursoActual,
    errorGeneral,
  } = useDatos();
  const { iconos } = useEstilos();

  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [practicasFiltradas, setPracticasFiltradas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState({});
  const [evaluacionesActuales, setEvaluacionesActuales] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});

  const buscarPracticas = async (evaluacion) => {
    // Se obtienen las prácticas de esa evaluación de la tabla "disponen".
    const practicas = await obtenerConsultaReturn(
      "listado_practicas_evaluacion",
      {
        columna: "id_evaluacion",
        valor: evaluacion.id_evaluacion,
      }
    );
    setPracticasFiltradas(practicas);
  };

  useEffect(() => {
    // Se filtran las evaluaciones por cursoActual.
    const _filtrado = evaluaciones.filter((evaluacion) => {
      return cursoActual.id_curso === evaluacion.id_curso;
    });
    setEvaluacionesActuales(_filtrado);
  }, []);

  useEffect(() => {
    Object.keys(evaluacionSeleccionada).length &&
      buscarPracticas(evaluacionSeleccionada);

    setPracticaSeleccionada({});
  }, [evaluacionSeleccionada]);

  return (
    <ColumnaSimple>
      <h2>Gestión de pesos para la evaluación.</h2>

      <div>
        <h4>Elige la evaluación.</h4>
        <div className='card flex '>
          <Dropdown
            id='evaluacionSeleccionada'
            name='evaluacionSeleccionada'
            value={evaluacionSeleccionada}
            onChange={(evento) => {
              setEvaluacionSeleccionada(evento.value);
            }}
            options={evaluacionesActuales}
            optionLabel='nombre'
            placeholder='Elige una evaluación...'
            scrollHeight='400px'
            //className='w-full '
          />
        </div>
        <div className='my-3'>
          {Object.keys(evaluacionSeleccionada).length ? (
            <EvaluacionPesoDataTable
              valores={practicasFiltradas}
              evaluacion={evaluacionSeleccionada.id_evaluacion}
            />
          ) : (
            <div className='vertical-align-middle m-1 px-2 py-2 h-full'>
              Selecciona una evaluación para comenzar.
            </div>
          )}
        </div>
      </div>
    </ColumnaSimple>
  );
};

export default GestionEvaluaciones;
