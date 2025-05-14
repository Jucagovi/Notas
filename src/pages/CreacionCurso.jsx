import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { FloatLabel } from "primereact/floatlabel";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";

import { InputText } from "primereact/inputtext";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const CreacionCurso = () => {
  // Año actual para calcular los nombres del curso.
  const anyo = new Date().getFullYear();
  const [anyoActual, setAnyoActual] = useState(`${anyo}/${anyo + 1}`);

  const cursoInicial = {
    curso: {
      centro: "IES Poeta Paco Mollà (Petrer)",
      nombre: `Curso ${anyoActual}`,
      descripcion: "",
    },
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
  const [cursoTemporal, setCursoTemporal] = useState(cursoInicial.curso);

  const { actualizarFormulario } = useDatos();
  const { iconos } = useEstilos();

  // Que anyo cambie con el valor del estado tambien -> substrint -> to Int -> +1.
  const crearEvaluaciones = () => {
    return [
      {
        nombre: `Primera evaluación ${anyoActual}`,
        fecha_ini: `${anyo}-09-01`,
        fecha_fin: `${anyo}-12-22`,
        descripcion: "",
        id_curso: "",
      },
      {
        nombre: `Segunda evaluación ${anyoActual}`,
        fecha_ini: `${anyo + 1}-01-07`,
        fecha_fin: `${anyo + 1}-03-15`,
        descripcion: "",
        id_curso: "",
      },
      {
        nombre: `Final ordinaria ${anyoActual}`,
        fecha_ini: `${anyo + 1}-03-16`,
        fecha_fin: `${anyo + 1}-05-30`,
        descripcion: "",
        id_curso: "",
      },
      {
        nombre: `Extraordinaria ${anyoActual}`,
        fecha_ini: `${anyo + 1}-06-01`,
        fecha_fin: `${anyo + 1}-06-30`,
        descripcion: "",
        id_curso: "",
      },
    ];
  };

  /**
   * Dependencia entre los dos estados para simplificar el acceso a un objeto dentro de otro.
   * Revisar si es posible hacerlo de forma directa y quitar la dependencia.
   */
  useEffect(() => {
    setCursoNuevo({ ...cursoNuevo, ["curso"]: cursoTemporal });
  }, [cursoTemporal]);

  useEffect(() => {
    setCursoNuevo({ ...cursoNuevo, ["evaluaciones"]: crearEvaluaciones() });
  }, [anyoActual]);

  return (
    <>
      <div className='flex'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-5 py-3 border-round'>
          <h2>Asistente para crear un curso.</h2>
          <ColumnaSimple>
            <div className='p-inputgroup flex-1 herramientasModulos_input'>
              <span className='p-inputgroup-addon'>
                <i className={iconos.calendario}></i>
              </span>
              <InputText
                id='anyo'
                className='p-inputtext-sm'
                name='anyo'
                value={anyoActual || ""}
                onChange={(evento) => {
                  setAnyoActual(evento.target.value);
                }}
              />
            </div>
            <div className='p-inputgroup flex-1 herramientasModulos_input'>
              <span className='p-inputgroup-addon'>
                <i className={iconos.centro}></i>
              </span>
              <InputText
                id='centro'
                className='p-inputtext-sm'
                name='centro'
                value={cursoTemporal.centro || ""}
                onChange={(evento) => {
                  actualizarFormulario(evento, cursoTemporal, setCursoTemporal);
                }}
              />
            </div>
            <div className='p-inputgroup flex-1 herramientasModulos_input'>
              <span className='p-inputgroup-addon'>
                <i className={iconos.curso}></i>
              </span>
              <InputText
                id='nombre'
                className='p-inputtext-sm'
                name='nombre'
                value={cursoTemporal.nombre || ""}
                onChange={(evento) => {
                  actualizarFormulario(evento, cursoTemporal, setCursoTemporal);
                }}
              />
            </div>
            <div className='p-inputgroup flex-1 herramientasModulos_input'>
              <span className='p-inputgroup-addon'>
                <i className={iconos.texto}></i>
              </span>
              <InputText
                id='descripcion'
                className='p-inputtext-sm'
                name='descripcion'
                value={cursoTemporal.descripcion || ""}
                onChange={(evento) => {
                  actualizarFormulario(evento, cursoTemporal, setCursoTemporal);
                }}
              />
            </div>
          </ColumnaSimple>
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
          <ValorEstado mostrar={anyoActual} />
          <ValorEstado mostrar={cursoNuevo} />
        </ColumnaSimple>
      </div>
    </>
  );
};

export default CreacionCurso;
