import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import useDatos from "../hooks/useDatos.js";
import EvaluacionPesoDataTable from "../components/datatables/EvaluacionPesoDataTable.jsx";
import EvaluacionesDropDown from "../components/desplegables/EvaluacionesDropDown.jsx";

const GestionEvaluaciones = () => {
  const { obtenerConsultaReturn, evaluaciones, cursoActual } = useDatos();

  const [practicasFiltradas, setPracticasFiltradas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState({});
  const [evaluacionesActuales, setEvaluacionesActuales] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});

  const buscarPracticas = async (evaluacion) => {
    // Se obtienen las prácticas de esa evaluación de la tabla "disponen".
    const practicas = await obtenerConsultaReturn(
      "listado_practicas_evaluacion",
      [
        {
          columna: "id_evaluacion",
          valor: evaluacion.id_evaluacion,
        },
      ]
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
          <EvaluacionesDropDown
            valor={evaluacionSeleccionada}
            opciones={evaluacionesActuales}
            setter={setEvaluacionSeleccionada}
            tamanyo='w-6'
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
