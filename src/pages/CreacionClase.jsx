import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useTostadas from "../hooks/useTostadas.js";
import CreacionClaseCurso from "../components/creacionClase/CreacionClaseCurso.jsx";
import CreacionClaseModulo from "../components/creacionClase/CreacionClaseModulo.jsx";
import CreacionClaseEvaluaciones from "../components/creacionClase/CreacionClaseEvaluaciones.jsx";
import CreacionClaseDiscentes from "../components/creacionClase/CreacionClaseDiscentes.jsx";
import CrearClaseDataTable from "../components/datatables/CrearClaseDataTable.jsx";
import EliminacionClase from "../components/creacionClase/EliminacionClase.jsx";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import CursosDropDown from "../components/desplegables/CursosDropDown.jsx";
import ModulosDropDown from "../components/desplegables/ModulosDropDown.jsx";

const CreacionClase = () => {
  const cursoInicial = {
    curso: "",
    modulo: "",
    evaluaciones: null,
    discentes: null,
    imparte: [],
  };

  // Datos del curso actual.
  const [claseNueva, setClaseNueva] = useState(cursoInicial);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [listadoModulos, setListadoModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState("");
  const [discentesSeleccionados, setDiscentesSeleccionados] = useState("");

  const {
    insertarDato,
    obtenerTodos,
    cursos,
    errorGeneral,
    cambiarEvaluaciones,
  } = useDatos();
  const { iconos } = useEstilos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  /**
   * Se ejecuta al seleccionar un curso y módulo (DropDown)
   */
  const crearEvaluaciones = (curso, modulo) => {
    return [
      {
        nombre: `Primera evaluación ${
          modulo.modulo_siglas ? modulo.modulo_siglas : ""
        } ${curso?.nombre.substr(5)}`,
        fecha_ini: `${curso?.anyo}-09-01`,
        fecha_fin: `${curso?.anyo}-12-22`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Segunda evaluación ${
          modulo.modulo_siglas ? modulo.modulo_siglas : ""
        } ${curso?.nombre.substr(5)}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-01-07`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-03-15`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Final ordinaria ${
          modulo.modulo_siglas ? modulo.modulo_siglas : ""
        } ${curso?.nombre.substr(5)}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-03-16`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-05-30`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
      {
        nombre: `Extraordinaria ${
          modulo.modulo_siglas ? modulo.modulo_siglas : ""
        } ${curso?.nombre.substr(5)}`,
        fecha_ini: `${parseInt(curso?.anyo) + 1}-06-01`,
        fecha_fin: `${parseInt(curso?.anyo) + 1}-06-30`,
        descripcion: "",
        id_curso: curso?.id_curso,
        id_modulo: modulo?.id_modulo,
      },
    ];
  };

  const crearImparte = (clase) => {
    const _imparte = clase.discentes.map((discente) => {
      return {
        id_discente: discente.id_discente,
        id_curso: claseNueva.curso.id_curso,
        id_modulo: claseNueva.modulo.id_modulo,
      };
    });
    setClaseNueva({ ...claseNueva, ["imparte"]: _imparte });
    return _imparte;
  };

  const confirmarInsercion = (datos) => {
    confirmDialog({
      message: `¿Quieres crear una clase para el curso ${datos.curso.nombre} y el módulo ${datos.modulo.nombre_modulo}?`,
      header: "Confirmación de creación de clase",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        crearClase(datos);
      },
    });
  };

  const crearClase = async () => {
    //Se insertan las evaluaciones.
    await insertarDato("Evaluaciones", claseNueva.evaluaciones);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Las evaluaciones para el ${claseNueva.curso.nombre} se ha insertado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Las evaluaciones para el ${claseNueva.curso.nombre} no se ha insertado.`,
      });
    }
    // Se crean los imparte...
    const imparte_insertar = crearImparte(claseNueva);
    // ...se insertan los imparte.
    await insertarDato("imparte", imparte_insertar);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Los datos de imparte se ha insertado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Los datos de imparte no se ha insertado.`,
      });
    }
    // Se actualizan las Evaluaciones en el proveedor para que los datos estén actualizados.
    obtenerTodos("Evaluaciones", cambiarEvaluaciones);
  };

  useEffect(() => {
    cursoSeleccionado &&
      moduloSeleccionado &&
      setClaseNueva({
        ...claseNueva,
        ["curso"]: cursoSeleccionado,
        ["modulo"]: moduloSeleccionado,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [cursoSeleccionado, moduloSeleccionado]);

  /*  useEffect(() => {
    moduloSeleccionado &&
      cursoSeleccionado &&
      setClaseNueva({
        ...claseNueva,
        ["modulo"]: moduloSeleccionado,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [moduloSeleccionado]); */

  useEffect(() => {
    discentesSeleccionados &&
      setClaseNueva({
        ...claseNueva,
        ["discentes"]: discentesSeleccionados,
      });
  }, [discentesSeleccionados]);

  useEffect(() => {
    obtenerTodos("listado_ciclos_modulos", setListadoModulos, "nombre_ciclo");
  }, []);

  return (
    <>
      <div className='flex'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-4 py-2 border-round'>
          <h2>Asistente para crear una clase.</h2>
          <h4>Selecciona un curso.</h4>
          <div className='card flex justify-content-center'>
            <CursosDropDown
              valor={cursoSeleccionado}
              setter={setCursoSeleccionado}
              opciones={cursos}
              tamanyo='w-full'
            />
          </div>

          <h4>Especifica el módulo.</h4>
          <div className='card flex justify-content-center'>
            <ModulosDropDown
              valor={moduloSeleccionado}
              setter={setModuloSeleccionado}
              opciones={listadoModulos}
              tamanyo='w-full'
            />
          </div>
          <h4>Elige discentes.</h4>
          <ColumnaSimple>
            <CrearClaseDataTable
              valoresSeleccionados={discentesSeleccionados}
              setter={setDiscentesSeleccionados}
            />
          </ColumnaSimple>
          <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
            <Button
              label='Crear clase'
              icon={iconos.aceptar}
              onClick={() => {
                confirmarInsercion(claseNueva);
              }}
            />
          </div>
          <h3>Zona peligrosa</h3>
          <ColumnaSimple modo='advertencia' estilo='my-2 px-2 py-2'>
            <h3>Edición de clases</h3>
          </ColumnaSimple>
          <ColumnaSimple modo='peligro'>
            <EliminacionClase />
          </ColumnaSimple>
        </ColumnaSimple>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-4 py-2'>
          <h3>Vista previa.</h3>
          {claseNueva.curso && <CreacionClaseCurso datos={claseNueva.curso} />}
          {claseNueva.modulo && (
            <CreacionClaseModulo datos={claseNueva.modulo} />
          )}
          {claseNueva.evaluaciones && (
            <CreacionClaseEvaluaciones datos={claseNueva.evaluaciones} />
          )}
          {claseNueva.discentes && (
            <CreacionClaseDiscentes datos={claseNueva.discentes} />
          )}
        </ColumnaSimple>
      </div>
    </>
  );
};

export default CreacionClase;
