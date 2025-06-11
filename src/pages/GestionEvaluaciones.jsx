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

const GestionEvaluaciones = () => {
  /**
   * ¡¡¡REVISAR PROCEDIMIENTO DE GestionPracticas!!!
   *
   * Posivilidad de dividrlo en tres procesos*:
   *  -> asignar prácticas a evaluación,
   *  -> dotar de peso a las prácticas para esa evaluación y
   *  -> poner notas de las prácticas a cada discente.
   *
   *  * se separa la asignación de prácticas a la evaluación del peso de la práctica
   *    ya que inicialmente no sé los pesos asignados a cada práctica.
   *    (al calcular la media en los informes de notas, si no se ha especificado peso
   *    en todas las prácticas, será calculada como media aritmética y no ponderada).
   *
   * En lugar de meter los datos en "disponen" hacerlo en "evaluan".
   * Cuando se introduzca una práctica en "disponen" se crea una entrada en "evaluan"
   * por cada discente que pertenezca a esa evaluación (peso y nota vacíos).
   *
   * Después se articula una nueva zona (Notas) para introducir las notas de las prácticas.
   *
   * Otra nueva (Evaluación) para introducir los pesos de las prácticas.
   * Además de la ya existente (Prácticas) para asignar prácticas a evaluaciones.
   *
   * CAMBIO DE IDEA -> Añadir un input con el peso para incluir esta tarea (la inserción de pesos)
   *    en el área de Prácticas (al mostrar el listado de prácticas).
   *
   *
   */

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

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */

  const editorTexto = (options) => {
    return (
      <InputText
        type='number'
        value={options.value || ""}
        onChange={(e) => {
          options.editorCallback(e.target.value);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  };

  const editarEvaluacion = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    if (newValue.trim().length > 0) rowData[field] = newValue;
    else event.preventDefault();
    actualizarPeso({
      id_evaluacion: evaluacionSeleccionada.id_evaluacion,
      id_practica: rowData.id_practica,
      peso: newValue,
    });
  };

  const actualizarPeso = async (datos) => {
    const { data, error } = await supabase
      .from("evaluan")
      .update({ peso: datos.peso })
      .eq("id_evaluacion", datos.id_evaluacion)
      .eq("id_practica", datos.id_practica);
    if (!error) {
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
      <>
        <div className='flex'>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-1 px-2 py-2 border-round'>
            <h2>Asigna peso a las prácticas.</h2>

            <h4>Elige la evaluación.</h4>
            <div className='card flex justify-content-center'>
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
                className='w-full '
              />
            </div>
            <div className='my-3'>
              {Object.keys(evaluacionSeleccionada).length ? (
                <>
                  <DataTable
                    removableSort
                    editMode='cell'
                    dataKey='id_practica'
                    //tableStyle={{ minWidth: "50rem" }}
                    value={practicasFiltradas}
                    emptyMessage='Selecciona una evaluación para comenzar.'
                  >
                    <Column field='numero' header='Número' sortable></Column>
                    <Column
                      field='enunciado'
                      header='Enunciado'
                      sortable
                    ></Column>
                    <Column
                      field='peso'
                      header='Peso'
                      sortable
                      editor={(options) => {
                        return editorTexto(options);
                      }}
                      onCellEditComplete={(options) => {
                        editarEvaluacion(options);
                      }}
                    ></Column>
                  </DataTable>
                </>
              ) : (
                <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                  Selecciona una evaluación para comenzar.
                </div>
              )}
            </div>
          </ColumnaSimple>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionEvaluaciones;
