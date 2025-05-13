import React from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";

const CreacionCurso = () => {
  return (
    <>
      <ColumnaSimple>
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
      <ColumnaSimple>
        Previsualización del curso a medida que se va creando (poner a la
        derecha).
      </ColumnaSimple>
    </>
  );
};

export default CreacionCurso;
