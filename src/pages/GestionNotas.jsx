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

const GestionNotas = () => {
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

  const practicasInicial = [];
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [practicasFiltradas, setPracticasFiltradas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState({});
  const [evaluacionesActuales, setEvaluacionesActuales] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [discentesFiltrados, setDiscentesFiltrados] = useState([]);
  const [discenteSeleccionado, setDiscenteSeleccionado] = useState({});

  /**
   * Acción que se realiza al pulsar el botón que se ha sustituido por
   * el evento onRowSelect del DataTable. Si se selecciona se inserta en la tabla,
   * si se deselecciona se borra de la tabla.
   */
  const crearDisponen = async (datos) => {
    // Se comprueba si datos tiene valores.
    if (datos.length) {
      /**
       * NOTA IMPORTANTE
       * Si en un map se coloca una función asíncrona, invariablemente se devolverá
       * una promesa, por lo que hay que poner ese map dentro de un Promise.allSettled
       * para que devuelva las promesas consumidas.
       */
      const _nuevos = await Promise.allSettled(
        datos.map(async (dato) => {
          // Se comprueba si existe en la BBDD.
          const { data, error } = await supabase
            .from("disponen")
            .select("*")
            .eq("id_practica", dato.id_practica)
            .eq("id_evaluacion", evaluacionSeleccionada.id_evaluacion);
          // Si la respuesta contiene algo es que existe el registro y no se inserta.
          if (!data || data.length === 0) {
            return {
              id_practica: dato.id_practica,
              id_evaluacion: evaluacionSeleccionada.id_evaluacion,
            };
          }
        })
      );
      // Se crea el array de objetos a insertar.
      const insertar = _nuevos
        // Se filtran los objetos que tengan value (que son los que hay que insertar).
        .filter((_nuevo) => {
          if (_nuevo.value) return _nuevo.value;
        })
        // De los objetos filtardos sólo interesa el objeto value.
        .map((unico) => {
          return unico.value;
        });
      // Se insertan los datos.
      await insertarDato("disponen", insertar);
      if (!errorGeneral) {
        mostrarTostadaExito({
          resumen: "Datos insertados.",
          detalle: `Los datos de dispone se ha insertado correctamente.`,
        });
      } else {
        mostrarTostadaError({
          resumen: "Se ha producido un error en la inserción.",
          detalle: `Los datos de dispone no se ha insertado.`,
        });
      }
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
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-1 px-4 py-2 border-round'>
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
              <DataTable
                removableSort
                value={practicasFiltradas}
                stripedRows
                selectionMode='single'
                onSelectionChange={(e) => {
                  //buscarDiscentes(e.value, evaluacionSeleccionada);
                  setPracticaSeleccionada(e.value);
                }}
                tableStyle={{ minWidth: "50rem" }}
                emptyMessage='Selecciona una evaluación para comenzar.'
              >
                <Column sortable field='numero' header='Número'></Column>
                <Column sortable field='nombre' header='Nombre'></Column>
                <Column field='enunciado' header='Enunciado'></Column>
                <Column sortable field='id_tipopractica' header='Tipo'></Column>
              </DataTable>
            </div>
          </ColumnaSimple>

          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            {Object.keys(practicaSeleccionada).length ? (
              <>
                <div className=' font-bold'>
                  <i
                    className={`${iconos.practica} m-2 fadeinleft animation-duration-1000`}
                    style={{ fontSize: "1.3rem" }}
                  ></i>
                  {practicaSeleccionada.nombre}:{" "}
                  {practicaSeleccionada.enunciado}
                </div>
                <DataTable
                  removableSort
                  //onSelectionChange={(e) => setPracticasSeleccionadas(e.value)}
                  dataKey='id_evaluan'
                  //tableStyle={{ minWidth: "50rem" }}
                  value={discentesFiltrados}
                  emptyMessage='Selecciona una práctica para comenzar.'
                >
                  <Column
                    field='apellidos'
                    header='Apellidos'
                    sortable
                  ></Column>
                  <Column
                    field='nombre_discente'
                    header='Nombre'
                    sortable
                  ></Column>
                  <Column field='nota' header='Nota' sortable></Column>
                </DataTable>
              </>
            ) : (
              <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                Selecciona una práctica para comenzar.
              </div>
            )}
          </ColumnaSimple>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionNotas;
