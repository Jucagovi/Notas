import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { Dropdown } from "primereact/dropdown";
import useDatos from "../hooks/useDatos.js";
import MostrarPracticas from "../components/MostrarPracticas.jsx";
import CursosDropDown from "../components/desplegables/CursosDropDown.jsx";
import EvaluacionesDropDown from "../components/desplegables/EvaluacionesDropDown.jsx";
import PracticasEvaluacionDataTable from "../components/datatables/PracticasEvaluacionDataTable.jsx";
import useEstilos from "../hooks/useEstilos.js";

const GestionPracticas = () => {
  /**
   * ¿Problema?
   * Cada evaluación pertenece a un módulo.
   * Cada práctica está asociada a un módulo.
   * Cuando se asignan prácticas a módulos (tal y como está ahora) es posible asignar prácticas
   * de un módulo a una evaluación de un módulo distinto. Hay dos formas de afrontar esto:
   *    ->  en <GestionPracticas>, cada vez que se seleccione una evaluación se filtran
   *        las prácticas de ese módulo y se muestran en el DataTable. Así se pierde la posibilidad
   *        de asignar una práctica que no pertenece a un módulo (más libertad a la hora de reutilizar prácticas),
   *    ->  dejar más libertad para la asignación pero en la vista de consulta de los datos de discente (listado_evaluaciones_ciclos)
   *        hay que añadir un salto entre Evaluaciones.id_modulo = Modulos.id_modulos y no entre Prácticas y módulos
   *        como estaba inicialmente.
   */

  const {
    obtenerConsultaReturn,
    practicas,
    evaluaciones,
    cursos,
    cursoActual,
  } = useDatos();

  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);

  const { ordenarColeccion } = useEstilos();

  // Funciona de alguna forma inexplicable.
  ordenarColeccion(practicasSeleccionadas, "numero");

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

  const buscarPracticas = async () => {
    // Se obtienen las prácticas de esa evaluación de la vista "listado_practicas_evaluaciones".
    const datosDisponen = await obtenerConsultaReturn(
      "listado_practicas_evaluacion",
      [
        {
          columna: "id_evaluacion",
          valor: evaluacionSeleccionada.id_evaluacion,
        },
      ]
    );
    //console.log(datosDisponen);
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
      //console.log(_filtrado);
      setPracticasSeleccionadas(_filtrado);
      //setPracticasSeleccionadas(datosDisponen);
    } else {
      // Si no hay prácticas para esa evaluación, se limpia el estado.
      setPracticasSeleccionadas([]);
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
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-1 px-4 py-2 border-round'>
            <h2>Asigna prácticas a una evaluación.</h2>

            <h4>Selecciona un curso.</h4>
            <div className='card flex justify-content-left'>
              <CursosDropDown
                valor={cursoSeleccionado}
                opciones={cursos}
                setter={setCursoSeleccionado}
                tamanyo='w-full'
              />
            </div>

            <h4>Elige la evaluación.</h4>
            <div className='card flex justify-content-center'>
              <EvaluacionesDropDown
                valor={evaluacionSeleccionada}
                opciones={evaluacionesFiltradas}
                setter={setEvaluacionSeleccionada}
                tamanyo='w-full'
              />
            </div>

            <MostrarPracticas practicas={practicasSeleccionadas} />
          </ColumnaSimple>
          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            {Object.keys(evaluacionSeleccionada).length ? (
              <>
                <PracticasEvaluacionDataTable
                  seleccion={practicasSeleccionadas}
                  setter={setPracticasSeleccionadas}
                  evaluacion={evaluacionSeleccionada}
                />
              </>
            ) : (
              <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                <h3>Selecciona una evaluación para comenzar.</h3>
              </div>
            )}
          </ColumnaSimple>
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionPracticas;
