import React, { useState, useEffect } from "react";
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

const GestionPracticas = () => {
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
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [listadoPracticasPorEvaluacion, setListadoPracticasPorEvaluacion] =
    useState([]);
  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);
  // Estado para guardar los datos en la tabla "disponen".
  const [disponen, setDisponen] = useState([]);

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

  const crearDisponen = async (datos) => {
    // Se crean los valores de "dispone".
    if (datos.length) {
      const _nuevos = datos.map((practica) => {
        return {
          id_practica: practica.id_practica,
          id_evaluacion: evaluacionSeleccionada.id_evaluacion,
        };
      });
      /*  await insertarDato("disponen", _nuevos);
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
      } */
    }
    // ...se insertan los imparte.
  };

  // Modificar crearDisponen para hacer esto añadiendo la comprobación.

  /* const verificarYInsertar = async (email, otrosDatos) => {
    // 1. Conéctate a Supabase (ya hecho)

    // 2. Realiza una consulta select()
    const { data, error } = await supabase
      .from("users") // Reemplaza 'users' con el nombre de tu tabla
      .select("id") // Select el ID o cualquier columna que identifique el registro
      .eq("email", email); // Reemplaza 'email' con el nombre de tu columna de correo electrónico y 'email' con el valor del correo electrónico

    // 3. Evalúa los resultados
    if (error) {
      console.error("Error al buscar el registro:", error);
      return;
    }

    // 4. Insertar el registro (si no existe)
    if (!data || data.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from("users") // Reemplaza 'users' con el nombre de tu tabla
        .insert([{ email: email, ...otrosDatos }]); // Reemplaza 'email' con el nombre de tu columna de correo electrónico y 'email' con el valor del correo electrónico. 'otrosDatos' son los demás campos que quieres insertar.
      if (insertError) {
        console.error("Error al insertar el registro:", insertError);
      } else {
        console.log("Registro insertado correctamente:", insertData);
      }
    } else {
      console.log("El registro ya existe:", data);
    }
  }; */

  const eliminarDisponen = (options) => {
    console.log(options.data);
    // Eliminar el registro de la BBDD al desmarcar un registro del DataTable.
    // Si falla, volverlo a poner en el estado practicasSeleccionadas.
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

  const traerPracticas = async () => {
    await obtenerConsulta(
      "listado_practicas_disponen",
      setListadoPracticasPorEvaluacion,
      {
        columna: "id_evaluacion",
        valor: evaluacionSeleccionada.id_evaluacion,
      }
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
    // Se eliminan los valores de "disponen" filtrados.
    setListadoPracticasPorEvaluacion([]);
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
      <h2>Gestión de las prácticas.</h2>
      <>
        <div className='flex'>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-4 py-2 border-round'>
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
            <h4>Elige discentes.</h4>

            <ColumnaSimple>
              <DataTable
                paginator
                paginatorPosition='top'
                rows={15}
                value={practicas}
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
                emptyMessage='No hay resultados'
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
            <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
              <Button
                label='Insertar prácticas en la evaluación'
                icon={iconos.aceptar}
                onClick={(evento) => {
                  confirmarInsercion(practicasSeleccionadas);
                }}
              />
            </div>
          </ColumnaSimple>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-4 py-2 border-round'>
            <h3>Vista previa.</h3>
            {practicasSeleccionadas.length
              ? practicasSeleccionadas.map((seleccion) => {
                  return `<p>${seleccion.numero} ${seleccion.nombre} ${seleccion.enunciado}</p>`;
                })
              : "La evaluación no contiene prácticas todavía."}
            <ValorEstado
              mostrar={evaluacionSeleccionada}
              titulo='evaluacionSeleccionada'
            />
            <ValorEstado mostrar={disponen} titulo='disponen' />
            <ValorEstado
              mostrar={practicasSeleccionadas}
              titulo='practicasSeleccionadas'
            />
            <ValorEstado
              mostrar={listadoPracticasPorEvaluacion}
              titulo='listadoPracticasPorEvaluacion'
            />
          </ColumnaSimple>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionPracticas;
