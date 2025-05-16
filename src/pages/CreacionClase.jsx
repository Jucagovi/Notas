import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";

import { InputText } from "primereact/inputtext";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";

const CreacionClase = () => {
  const cursoInicial = {
    curso: "",
    modulo: "",
    evaluaciones: [
      {
        nombre: "",
        fecha_ini: "",
        fecha_fin: "",
        descripcion: "",
        id_curso: "",
        id_modulo: "",
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
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [listadoModulos, setListadoModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState("");

  const { actualizarFormulario, obtenerTodos, cursos } = useDatos();
  const { iconos } = useEstilos();

  /**
   * Se ejecuta al seleccionar un curso (DropDown)
   */
  const crearEvaluaciones = (curso, modulo) => {
    return [
      {
        nombre: `Primera evaluación ${curso?.nombre}`,
        fecha_ini: `${curso?.anyo}-09-01`,
        fecha_fin: `${curso?.anyo}-12-22`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Segunda evaluación ${curso?.nombre}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-01-07`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-03-15`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Final ordinaria ${curso?.nombre}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-03-16`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-05-30`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Extraordinaria ${curso?.nombre}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-06-01`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-06-30`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
    ];
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
   * ¡¡¡NO FUNCIONAN LAS PLANTILLAS!!!
   * Revisar -> si no van, crear un campo en la vista.
   * En el evento onChange del DropDown no es posible hacerlo
   * (sólo permite setear el estado). Si se coloca otra cosa
   * las plantillas no funcionan.
   */
  useEffect(() => {
    cursoSeleccionado &&
      setCursoNuevo({
        ...cursoNuevo,
        ["curso"]: cursoSeleccionado.id_curso,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [cursoSeleccionado]);

  useEffect(() => {
    moduloSeleccionado &&
      setCursoNuevo({
        ...cursoNuevo,
        ["modulo"]: moduloSeleccionado.id_modulo,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [moduloSeleccionado]);

  useEffect(() => {
    obtenerTodos("listado_ciclos_modulos", setListadoModulos, "nombre_ciclo");
  }, []);

  return (
    <>
      <div className='flex'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-5 py-3 border-round'>
          <h2>Asistente para crear una clase.</h2>

          <h4>Selecciona un curso para crear la clase.</h4>
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
              placeholder='Elige un curso donde crear la clase'
              //valueTemplate={!cursoSeleccionado && plantillaCursoDropDown}
              //itemTemplate={!cursoSeleccionado && plantillaCursoDropDown}
              className='w-full '
            />
          </div>

          <h4>Selecciona el módulo para crear la clase.</h4>
          <div className='card flex justify-content-center'>
            <Dropdown
              id='moduloSeleccionado'
              name='moduloSeleccionado'
              value={moduloSeleccionado}
              onChange={(evento) => {
                setModuloSeleccionado(evento.value);
              }}
              options={listadoModulos}
              optionLabel='valor_drop'
              placeholder='Elige un módulo que impartir en clase'
              //valueTemplate={plantillaModuloDropDown}
              //itemTemplate={plantillaModuloDropDown}
              className='w-full '
            />
          </div>
          <ColumnaSimple>
            <ColumnaSimple>
              <h3>Selecciona discentes para cada módulo.</h3>
              <InsercionMasiva tabla={"Discentes"} insercion={false} />
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
          <ValorEstado mostrar={cursoNuevo} titulo='cursoNuevo' />
        </ColumnaSimple>
      </div>
    </>
  );
};

export default CreacionClase;
