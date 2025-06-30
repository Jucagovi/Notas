import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import ClasesDropDown from "../components/desplegables/ClasesDropDown.jsx";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import EditarClaseDataTable from "../components/datatables/EditarClaseDataTable.jsx";

const EdicionClase = () => {
  const [claseSeleccionada, setClaseSeleccionada] = useState({});
  const [listadoClases, setListadoClases] = useState([]);
  const [discentesClase, setDiscentesClase] = useState([]);

  const { obtenerTodos, obtenerConsulta } = useDatos();

  const buscarDiscentesClase = async () => {
    obtenerConsulta("listado_clase_discentes", setDiscentesClase, [
      { columna: "id_curso", valor: claseSeleccionada.id_curso },
      { columna: "id_modulo", valor: claseSeleccionada.id_modulo },
    ]);
  };

  useEffect(() => {
    // Se obtienen todas las clases.
    obtenerTodos("listado_clases", setListadoClases, "nombre_curso");
  }, []);

  useEffect(() => {
    Object.keys(claseSeleccionada).length && buscarDiscentesClase();
  }, [claseSeleccionada]);

  return (
    <>
      <div className='flex'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-4 py-2 border-round'>
          <h3>Editar una clase</h3>
          <ClasesDropDown
            valor={claseSeleccionada}
            setter={setClaseSeleccionada}
            opciones={listadoClases}
            tamanyo='w-full'
          />
        </ColumnaSimple>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-4 py-2'>
          {Object.keys(claseSeleccionada).length ? (
            <>
              <h4>Edita discentes para el curso</h4>
              <ColumnaSimple>
                <EditarClaseDataTable
                  valoresSeleccionados={discentesClase}
                  setter={setDiscentesClase}
                  clase={claseSeleccionada}
                />
              </ColumnaSimple>
            </>
          ) : (
            <div className='flex align-items-center justify-content-center vertical-align-middle m-1 px-2 py-2 h-full'>
              <h3>Elige un curso para modificar sus discentes</h3>
            </div>
          )}
        </ColumnaSimple>
      </div>
    </>
  );
};

export default EdicionClase;
