import React, { useState } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const CreacionCurso = () => {
  const cursoInicial = {
    curso: { centro: "", nombre: "", descripcion: "" },
    evaluaciones: [
      {
        nombre: "",
        fecha_ini: "",
        fecha_fin: "",
        descripcion: "",
        id_curso: "",
      },
    ],
    discentes: [
      {
        nombre: "",
        apellidos: "",
        correo: "",
        fecha_nac: "",
        localidad: "",
        imagen: "",
      },
    ],
    repetidores: [{ id_discente: "", id_curso: "", id_modulo: "" }],
    imparte: [{ id_discente: "", id_curso: "", id_modulo: "" }],
  };
  // Datos del curso actual.
  const [cursoNuevo, setCursoNuevo] = useState(cursoInicial);

  // Año actual para calcular los nombres del curso.
  const anyoActual = new Date().getFullYear();

  console.log(anyoActual);
  return (
    <>
      <div className='flex'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center  font-bold m-2 px-5 py-3 border-round'>
          <h2>Asistente para crear un curso.</h2>
          <ColumnaSimple>Nombre del Curso</ColumnaSimple>
          <ColumnaSimple>
            <h3>Se crearán las siguientes Evaluaciones.</h3>
          </ColumnaSimple>
          <ColumnaSimple>
            <h3>Selecciona los módulos para este curso.</h3>
            <ColumnaSimple>
              CheckBox con los módulos agrupados por cilos
            </ColumnaSimple>
            <ColumnaSimple>
              <h3>Selecciona discentes para cada módulo.</h3>
              <ColumnaSimple>
                NUEVOS -- Una pestaña por módulo con un textArea para colocar un
                CSV con los discentes que serán creados.
              </ColumnaSimple>
              <ColumnaSimple>
                REPETIDORES -- listado actual de la BBDD con un filtro para
                buscar.
              </ColumnaSimple>
            </ColumnaSimple>
          </ColumnaSimple>
        </ColumnaSimple>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-5 py-3 border-round'>
          <h3>Vista previa del curso a insertar.</h3>
          <ValorEstado mostrar={cursoNuevo} />
        </ColumnaSimple>
      </div>
    </>
  );
};

export default CreacionCurso;
