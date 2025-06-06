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
   * Otra nueva (Evaluación) para introducir los pesos de las prácticas.
   * Además de la ya existente (Prácticas) para asignar prácticas a evaluaciones.
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

  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);

  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [valoresFiltro, setValoresFiltro] = useState(""); // Para el formulario controlado de la búsqueda.

  const confirmarInsercion = (datos) => {
    confirmDialog({
      message: `¿Quieres insertar las prácticas en la evaluación ${evaluacionSeleccionada.nombre}?`,
      header: "Confirmación de asignación prácticas",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        crearDisponen(datos);
      },
    });
  };

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

  const eliminarDisponen = async (options) => {
    // Es necesario comprobar dos id. Se hace a mano.
    const { data, error } = await supabase
      .from("disponen")
      .delete()
      .eq("id_practica", options.data.id_practica)
      .eq("id_evaluacion", evaluacionSeleccionada.id_evaluacion);
    if (!error) {
      mostrarTostadaExito({
        resumen: "Datos eliminados.",
        detalle: `Los datos de dispone se han eliminado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error con el borrado.",
        detalle: `Los datos de dispone no se ha eliminado.`,
      });
    }
  };

  const insertarDisponen = async (options) => {
    await insertarDato("disponen", {
      id_practica: options.data.id_practica,
      id_evaluacion: evaluacionSeleccionada.id_evaluacion,
    });
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
  };

  /**
   * Plantillas para los DropDown.
   */
  const plantillaCursoDropDown = (option) => {
    return (
      <div className='flex align-items-center'>
        <div>
          {option.nombre} en {option.centro}
        </div>
      </div>
    );
  };

  const plantillaModuloDropDown = (option) => {
    return (
      <div className='flex align-items-center'>
        <div>
          ({option.siglas_ciclo}) {option.siglas_modulo} {option.nombre_modulo}
        </div>
      </div>
    );
  };

  /**
   * Funciones para el formulario de búsqueda en el DataTable de discentes.
   */
  const filtrarDatos = (e) => {
    const value = e.target.value;
    let _filtros = { ...filtros };
    _filtros["global"].value = value;
    setFiltros(_filtros);
    setValoresFiltro(value);
  };

  const limpiarFiltro = () => {
    setFiltros({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    setValoresFiltro("");
  };

  const dibujarCabeceraBusqueda = () => {
    //className='flex justify-content-between'
    return (
      <div className='flex justify-content-end'>
        <IconField iconPosition='left'>
          <InputIcon className='pi pi-search' />
          <InputText
            value={valoresFiltro}
            onChange={(e) => {
              filtrarDatos(e);
            }}
            placeholder='Buscar...'
          />
        </IconField>
        <Button
          type='button'
          icon='pi pi-filter-slash'
          label=''
          text
          onClick={() => {
            limpiarFiltro();
          }}
        />
      </div>
    );
  };

  const buscarPracticas = async () => {
    // Se obtienen las prácticas de esa evaluación de la tabla "disponen".
    const datosDisponen = await obtenerConsultaReturn("disponen", {
      columna: "id_evaluacion",
      valor: evaluacionSeleccionada.id_evaluacion,
    });
    // Si existen, se crea un array con los identificadores de las prácticas.
    if (datosDisponen.length) {
      const identificadores = datosDisponen.map((dato) => {
        return dato.id_practica;
      });
      //Se filtran las prácticas (del estado Practicas) y se añaden al estado que controla el DataTable.
      const _filtrado = practicas.filter((practica) => {
        //Lo evuelve si el id_está en algunos de los valores que salen de dispone.
        return identificadores.includes(practica.id_practica);
      });
      setPracticasSeleccionadas(_filtrado);
    }
  };

  useEffect(() => {
    const _filtrado = evaluaciones.filter((evaluacion) => {
      return cursoSeleccionado.id_curso === evaluacion.id_curso;
    });
    setEvaluacionesFiltradas(_filtrado);
    // Se elimina la evaluación seleccionada para evita problemas.
    setEvaluacionSeleccionada({});
    // Se deseleccionan las prácticas seleccionadas (DataTable).
    setPracticasSeleccionadas([]);
  }, [cursoSeleccionado]);

  useEffect(() => {
    // Si el objeto no esta vacío...
    Object.keys(evaluacionSeleccionada).length && buscarPracticas();
    // Se deseleccionan las prácticas seleccionadas (DataTable).
    setPracticasSeleccionadas([]);
  }, [evaluacionSeleccionada]);

  useEffect(() => {
    // Se signa aquí para que se actualice el DropDown de evaluación.
    setCursoSeleccionado(cursoActual);
  }, []);

  return (
    <ColumnaSimple>
      <h2>Gestión de notas.</h2>
      <>
        <div className='flex'>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-1 px-4 py-2 border-round'>
            <h2>Asistente para crear una clase.</h2>

            <h4>Selecciona un curso.</h4>
            <div className='card flex justify-content-center'>
              <Dropdown
                id='cursoSeleccionado'
                name='cursoSeleccionado'
                value={cursoSeleccionado}
                onChange={(evento) => {
                  setCursoSeleccionado(evento.value);
                }}
                options={cursos}
                optionLabel='nombre'
                placeholder='Elige un curso...'
                className='w-full '
              />
            </div>

            <h4>Elige la evaluación.</h4>
            <div className='card flex justify-content-center'>
              <Dropdown
                id='evaluacionSeleccionada'
                name='evaluacionSeleccionada'
                value={evaluacionSeleccionada}
                onChange={(evento) => {
                  setEvaluacionSeleccionada(evento.value);
                }}
                options={evaluacionesFiltradas}
                optionLabel='nombre'
                placeholder='Elige una evaluación...'
                className='w-full '
              />
            </div>
            <MostrarPracticas practicas={practicasSeleccionadas} />

            {/* <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
              <Button
                label='Guardar prácticas en la evaluación'
                icon={iconos.aceptar}
                onClick={(evento) => {
                  confirmarInsercion(practicasSeleccionadas);
                }}
              />
            </div> */}
          </ColumnaSimple>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            <DataTable
              paginator
              paginatorPosition='top'
              rows={15}
              value={
                evaluacionSeleccionada.id_evaluacion
                  ? practicas
                  : practicasInicial
              }
              selectionMode={null}
              selection={practicasSeleccionadas}
              removableSort
              filters={filtros}
              globalFilterFields={["nombre", "unidad", "enunciado", "numero"]}
              onSelectionChange={(e) => setPracticasSeleccionadas(e.value)}
              dataKey='id_practica'
              tableStyle={{ minWidth: "50rem" }}
              header={dibujarCabeceraBusqueda}
              onRowUnselect={eliminarDisponen}
              onRowSelect={insertarDisponen}
              emptyMessage='Selecciona una evaluación para comenzar.'
            >
              <Column
                selectionMode='multiple'
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column field='numero' header='Número' sortable></Column>
              <Column field='nombre' header='Nombre' sortable></Column>
              <Column field='enunciado' header='Enunciado' sortable></Column>
            </DataTable>
          </ColumnaSimple>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionNotas;
