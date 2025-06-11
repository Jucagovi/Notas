import React, { useState, useEffect } from "react";
import supabase from "../config/config_supabase.js";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useModales from "../hooks/useModales.js";
import Cargando from "../components/Cargando.jsx";
import NotasDiscentesDataTable from "../components/datatables/NotasDiscentesDataTable.jsx";
import NotasPracticasDataTable from "../components/datatables/NotasPracticasDataTable.jsx";

const GestionNotas = () => {
  const { obtenerConsultaReturn, evaluaciones, cursoActual, cargando } =
    useDatos();
  const { iconos } = useEstilos();

  const { alternarModal, visible } = useModales();

  const [practicasFiltradas, setPracticasFiltradas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState({});
  const [evaluacionesActuales, setEvaluacionesActuales] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState({});
  const [discentesFiltrados, setDiscentesFiltrados] = useState([]);

  /***********************************************************
   *  Funciones para los modos edición del DataTable.
   * */

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
                <NotasPracticasDataTable
                  valores={practicasFiltradas}
                  setter={setPracticaSeleccionada}
                />
              ) : (
                <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                  Selecciona una práctica para comenzar.
                </div>
              )}
            </div>
          </ColumnaSimple>

          <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-2 py-2 border-round'>
            {Object.keys(practicaSeleccionada).length ? (
              <NotasDiscentesDataTable
                valores={discentesFiltrados}
                practica={practicaSeleccionada}
              />
            ) : (
              <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
                Selecciona una práctica para comenzar.
              </div>
            )}
          </ColumnaSimple>
          {/**
           * Mostrar el componente cada vez que carge algo.
           * Para que esto funcione se deben utiliar las funciones genéricas
           * del proveedor.
           * */}
          {cargando && (
            <Dialog
              //header='Conectando con el servidor...'
              visible={true}
              style={{ width: "35vw" }}
              onHide={() => {
                alternarModal();
              }}
            >
              <Cargando />
            </Dialog>
          )}
        </div>
      </>
    </ColumnaSimple>
  );
};

export default GestionNotas;
