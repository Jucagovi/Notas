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
import { Dialog } from "primereact/dialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useTostadas from "../hooks/useTostadas.js";
import useModales from "../hooks/useModales.js";
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

const GestionNotas = () => {
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

  const { alternarModal, visible } = useModales();

  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [practicasFiltradas, setPracticasFiltradas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState({});
  const [evaluacionesActuales, setEvaluacionesActuales] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [discentesFiltrados, setDiscentesFiltrados] = useState([]);

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */

  const editorTexto = (options) => {
    return (
      <div>
        <InputText
          type='text'
          className='w-6'
          value={options.value || ""}
          onChange={(e) => {
            options.editorCallback(e.target.value);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  const editarNota = (e) => {
    let { rowData, newValue, field, value, originalEvent: event } = e;
    // Se comparan los valoes nuevo y viejo y sólo se actualiza si son diferentes (evota errores).
    if (newValue !== value) {
      if (newValue.trim().length > 0) rowData[field] = newValue;
      else event.preventDefault();
      actualizarNota(rowData.id_evaluan, rowData.nota);
    }
  };

  const actualizarNota = async (id_evaluan, nota) => {
    const datos = { id_evaluan: id_evaluan, nota: nota };
    await actualizarDato("evaluan", "id_evaluan", datos);
    if (!errorGeneral) {
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

  const buscarDiscentes = async (practica, evaluacion) => {
    const { data, error } = await supabase
      .from("listado_discentes_evaluacion")
      .select("*")
      .eq("id_practica", practica.id_practica)
      .eq("id_evaluacion", evaluacion.id_evaluacion);

    setDiscentesFiltrados(data);
  };

  const mostrarNota = (datos) => {
    return datos.nota < 49 ? (
      <span className='text-red-500'>{datos.nota}</span>
    ) : (
      <span>{datos.nota}</span>
    );
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
    setDiscentesFiltrados([]);
    setPracticaSeleccionada({});
  }, [evaluacionSeleccionada]);

  useEffect(() => {
    Object.keys(practicaSeleccionada).length &&
      buscarDiscentes(practicaSeleccionada, evaluacionSeleccionada);
  }, [practicaSeleccionada]);

  return (
    <ColumnaSimple>
      <h2>Gestión de notas.</h2>
      <>
        <div className='flex'>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            <h2>Asigna notas a las prácticas.</h2>

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

            <h4>Elige la práctica.</h4>
            <div className='card flex justify-content-center'>
              {Object.keys(practicasFiltradas).length ? (
                <DataTable
                  className='w-full'
                  removableSort
                  value={practicasFiltradas}
                  stripedRows
                  selectionMode='single'
                  onSelectionChange={(e) => {
                    //buscarDiscentes(e.value, evaluacionSeleccionada);
                    setPracticaSeleccionada(e.value);
                  }}
                  //tableStyle={{ minWidth: "50rem" }}
                  emptyMessage='Selecciona una evaluación para comenzar.'
                >
                  <Column
                    style={{ width: "10%" }}
                    sortable
                    field='numero'
                    header='Número'
                  ></Column>
                  <Column
                    style={{ width: "90%" }}
                    field='enunciado'
                    header='Enunciado'
                  ></Column>
                </DataTable>
              ) : (
                <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                  Selecciona una práctica para comenzar.
                </div>
              )}
            </div>
          </ColumnaSimple>

          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            {Object.keys(practicaSeleccionada).length ? (
              <>
                <div className=' font-bold flex vertical-align-middle'>
                  <i
                    className={`${iconos.practica} m-2 mt-3 vertical-align-middle fadeinleft animation-duration-900`}
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                  <h3>
                    {practicaSeleccionada.nombre}:{" "}
                    {practicaSeleccionada.enunciado}
                  </h3>
                </div>

                <DataTable
                  removableSort
                  className='w-full'
                  editMode='cell'
                  //onSelectionChange={(e) => setPracticasSeleccionadas(e.value)}
                  dataKey='id_evaluan'
                  //tableStyle={{ minWidth: "50rem" }}
                  value={discentesFiltrados}
                  emptyMessage='Selecciona una práctica para comenzar.'
                >
                  <Column
                    style={{ width: "40%" }}
                    field='apellidos'
                    header='Apellidos'
                    sortable
                  ></Column>
                  <Column
                    style={{ width: "40%" }}
                    field='nombre_discente'
                    header='Nombre'
                    sortable
                  ></Column>
                  <Column
                    className='text-center'
                    style={{ width: "20%" }}
                    field='nota'
                    header='Nota'
                    body={(options) => {
                      return mostrarNota(options);
                    }}
                    sortable
                    editor={(options) => {
                      return editorTexto(options);
                    }}
                    onCellEditComplete={(options) => {
                      editarNota(options);
                    }}
                  ></Column>
                </DataTable>
              </>
            ) : (
              <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                Selecciona una práctica para comenzar.
              </div>
            )}
            <Cargando />
          </ColumnaSimple>

          <Dialog
            header='Conectando con el servidor...'
            visible={visible}
            style={{ width: "50vw" }}
            onHide={() => {
              alternarModal();
            }}
          >
            <Cargando />
          </Dialog>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionNotas;
