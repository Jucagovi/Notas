import React, { useState, useEffect } from "react";
import supabase from "../config/config_supabase.js";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useTostadas from "../hooks/useTostadas.js";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import ClasesDropDown from "../components/desplegables/ClasesDropDown.jsx";

const EliminacionClase = ({ valores, setter }) => {
  const [claseSeleccionada, setClaseSeleccionada] = useState({});
  const [listadoClases, setListadoClases] = useState([]);

  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const {
    obtenerTodos,
    errorGeneral,
    cambiarErrorGeneral,
    cambiarEvaluaciones,
  } = useDatos();
  const { iconos } = useEstilos();

  const confirmarBorrarClase = (clase) => {
    confirmDialog({
      message: `¿Quieres eliminar la clase para el ${clase.nombre_curso} y el módulo ${clase.nombre_modulo}?`,
      header: "Confirmación de eliminación de clase",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => {
        borrarClase(clase);
      },
    });
  };

  const borrarClase = async (clase) => {
    //Se inicializa el error.
    cambiarErrorGeneral("");
    //Se obtienen las evaluaciones de esa clase (Evaluaciones por id_curso y módulo).
    const evaluaciones = await busquedaEvaluaciones(clase);
    // Se crea un array de strings y no de objetos.
    const ordenadas = evaluaciones.map((evaluacion) => {
      return evaluacion.id_evaluacion;
    });
    // Se borran los datos de las evaluaciones en "evalua".
    !errorGeneral && (await borrarEvalua(ordenadas));
    // Se borran los datos de "imparte".
    !errorGeneral && (await borrarImparte(clase));
    // Se borran las Evaluaciones, por último.
    !errorGeneral && (await borrarEvaluaciones(ordenadas));
    // Se actualiza el estado del DropDown.
    await obtenerTodos("listado_clases", setter);
    // Se actualiza el estado Evaluaciones del proveedor
    obtenerTodos("Evaluaciones", cambiarEvaluaciones);
  };

  const busquedaEvaluaciones = async (clase) => {
    const { data, error } = await supabase
      .from("Evaluaciones")
      .select("id_evaluacion")
      .eq("id_curso", clase.id_curso)
      .eq("id_modulo", clase.id_modulo);
    if (error) {
      cambiarErrorGeneral(error);
      mostrarTostadaError({
        resumen: "Se ha producido un error en la búsqueda.",
        detalle: `Las evaluaciones para el ${clase.id_curso} no se ha eliminado.`,
      });
    } else {
      mostrarTostadaExito({
        resumen: "Datos encontrados.",
        detalle: `Se han encontrado ${data.length} evaluaciones para esta clase.`,
      });
      return data;
    }
  };

  const borrarEvaluaciones = async (evaluaciones) => {
    const { data, error } = await supabase
      .from("Evaluaciones")
      //.select("*")
      .delete()
      .in("id_evaluacion", evaluaciones);

    if (error) {
      cambiarErrorGeneral(error);
      mostrarTostadaError({
        resumen: "Se ha producido un error en la eliminación.",
        detalle: `Las evaluaciones para el ${clase.nombre_curso} no se han eliminado.`,
      });
    } else {
      mostrarTostadaExito({
        resumen: "Datos de impartición elimininados.",
        detalle: `Se han eliminado ${
          !data?.length && 0
        } evaluaciones para esta clase.`,
      });
    }
  };

  const borrarImparte = async (clase) => {
    const { data, error } = await supabase
      .from("imparte")
      //.select("*")
      .delete()
      .eq("id_curso", clase.id_curso)
      .eq("id_modulo", clase.id_modulo);

    if (error) {
      cambiarErrorGeneral(error);
      mostrarTostadaError({
        resumen: "Se ha producido un error en la eliminación.",
        detalle: `Las evaluaciones para el ${clase.nombre_curso} no se han eliminado.`,
      });
    } else {
      mostrarTostadaExito({
        resumen: "Datos de impartición elimininados.",
        detalle: `Se han eliminado ${
          !data?.length && 0
        } datos impartidos para esta clase.`,
      });
    }
  };

  const borrarEvalua = async (evaluaciones) => {
    // data devuelve los datos eliminados.
    const { data, error } = await supabase
      .from("evaluan")
      //.select("*")
      .delete()
      .in("id_evaluacion", evaluaciones);
    // crear array con los id y borrarlos de una vez

    if (error) {
      cambiarErrorGeneral(error);
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Las evaluaciones para el ${claseNueva.curso.nombre} no se ha eliminado.`,
      });
    } else {
      mostrarTostadaExito({
        resumen: "Datos de las evaluaciones elimininados.",
        detalle: `Se han eliminado ${
          !data?.length && 0
        } entradas de evaluación para esta clase.`,
      });
    }
  };

  useEffect(() => {
    // Se obtienen todas las clases.
    obtenerTodos("listado_clases", setListadoClases, "nombre_curso");
  }, []);

  return (
    <>
      <div className='flex w-6'>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-2 px-4 py-2 border-round'>
          <h3 className='text-red-500'>Eliminar una clase</h3>
          <ClasesDropDown
            valor={claseSeleccionada}
            setter={setClaseSeleccionada}
            opciones={listadoClases}
            tamanyo='w-full'
          />
          <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
            <Button
              label='Eliminar clase'
              severity='danger'
              icon={iconos.papelera}
              onClick={() => {
                confirmarBorrarClase(claseSeleccionada);
              }}
            />
          </div>
        </ColumnaSimple>
      </div>
    </>
  );
};

export default EliminacionClase;
