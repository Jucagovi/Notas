import React, { useState } from "react";
import supabase from "../../config/config_supabase.js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import useDatos from "../../hooks/useDatos.js";
import useEstilos from "../../hooks/useEstilos.js";
import useTostadas from "../../hooks/useTostadas.js";

/**
 * ¿Poner un estado en el componente padre para controlar las inserciones desde fuera o hacerla aquí?
 */

const EditarClaseDataTable = ({ valoresSeleccionados, setter, clase }) => {
  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  // Para el formulario controlado de la búsqueda.
  const [valoresFiltro, setValoresFiltro] = useState("");

  const { discentes, errorGeneral, cambiarErrorGeneral, insertarDato } =
    useDatos();
  const { extraerUnicos } = useEstilos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const filtrarDatos = (e) => {
    const value = e.target.value;
    let _filtros = { ...filtros };
    _filtros["global"].value = value;
    setFiltros(_filtros);
    setValoresFiltro(value);
  };

  const limpiarFiltro = () => {
    setFiltros({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    setValoresFiltro("");
  };

  const dibujarCabeceraBusqueda = () => {
    //className='flex justify-content-between'
    return (
      <div className='flex justify-content-end'>
        <IconField iconPosition='left'>
          <InputIcon className='pi pi-search' />
          <InputText
            value={valoresFiltro}
            onChange={(e) => {
              filtrarDatos(e);
            }}
            placeholder='Buscar...'
          />
        </IconField>
        <Button
          type='button'
          icon='pi pi-filter-slash'
          label=''
          text
          onClick={() => {
            limpiarFiltro();
          }}
        />
      </div>
    );
  };

  const obtenerEvaluaciones = async (curso, modulo) => {
    // Se obtienen a través de curso y módulo.
    const { data, error } = await supabase
      .from("Evaluaciones")
      .select("*")
      .eq("id_curso", curso)
      .eq("id_modulo", modulo);

    // Se genera un array con los id_evaluacion (para hacer una sola búsqueda).
    return data.map((evaluacion) => {
      return evaluacion.id_evaluacion;
    });
  };

  const obtenerPracticasEvaluacion = async (datos) => {
    // Se obtienen las prácticas de todas las evaluaciones.
    const { data, error } = await supabase
      .from("evaluan")
      .select("id_practica, id_evaluacion, peso")
      .in("id_evaluacion", datos);
    // Se obtienen las prácticas únicas de las evaluaciones realizadas (un objeto).
    const unicosPorIdPractica = Array.from(
      new Map(data.map((item) => [item.id_practica, item])).values()
    );
    // Cortesía de la IA.
    return unicosPorIdPractica;
  };

  const matricularDiscenteCurso = async (datos) => {
    // Se obtienen las evaluaciones.
    const evaluaciones = await obtenerEvaluaciones(
      clase.id_curso,
      clase.id_modulo
    );
    // Se obtienen las prácticas de todas las evaluaciones realizadas hasta la fecha.
    const practicas = await obtenerPracticasEvaluacion(evaluaciones);
    // Se añade el id_discente al objeto anterior.
    const evaluan_nuevos = practicas.map((practica) => {
      return { ...practica, ["id_discente"]: datos.data.id_discente };
    });
    // Se inserta un nuevo registro con el alta en "imparte".
    await insertarDato("imparte", {
      id_modulo: clase.id_modulo,
      id_curso: clase.id_curso,
      id_discente: datos.data.id_discente,
    });
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Se ha matriculado el/la nuevo/a discente correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `No se ha matriculado al/la discente.`,
      });
    }
    // Se insertan las prácticas con peso del nuevo discente en "evalua".
    await insertarDato("evaluan", evaluan_nuevos);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Las prácticas para el/la nuevo/a discente se han insertado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Los datos de evalua no se ha insertado.`,
      });
    }
  };

  /****************************************************
   * Funciones para desmatricular discentes.
   */

  const borrarEvaluaciones = async (evaluaciones, discente) => {
    const { data, error } = await supabase
      .from("evaluan")
      //.select("*")
      .delete()
      .in("id_evaluacion", evaluaciones)
      .eq("id_discente", discente);

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
        } evaluaciones para este discente.`,
      });
    }
  };

  const borrarImparte = async (curso, modulo, discente) => {
    const { data, error } = await supabase
      .from("imparte")
      //.select("*")
      .delete()
      .eq("id_curso", curso)
      .eq("id_discente", discente)
      .eq("id_modulo", modulo);

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
        } evaluaciones para este discente.`,
      });
    }
  };

  const desmatricularDiscenteCurso = async (datos) => {
    // Se obtienen las evaluaciones.
    const evaluaciones = await obtenerEvaluaciones(
      clase.id_curso,
      clase.id_modulo
    );
    // Para cada una elimino los datos con id_discente e id_evaluacion (evaluan).
    evaluaciones && borrarEvaluaciones(evaluaciones, datos.data.id_discente);
    // Se elimina de imparte por id_discente, id_curso e id_modulo.
    evaluaciones &&
      borrarImparte(clase.id_curso, clase.id_modulo, datos.data.id_discente);
  };

  return (
    <DataTable
      paginator
      rows={10}
      value={discentes}
      selectionMode={null}
      selection={valoresSeleccionados}
      removableSort
      filters={filtros}
      globalFilterFields={["nombre", "apellidos"]}
      onSelectionChange={(e) => setter(e.value)}
      dataKey='id_discente'
      //tableStyle={{ minWidth: "50rem" }}
      header={dibujarCabeceraBusqueda}
      emptyMessage='No hay resultados'
      onRowSelect={(options) => {
        matricularDiscenteCurso(options);
      }}
      onRowUnselect={(options) => {
        desmatricularDiscenteCurso(options);
      }}
    >
      <Column selectionMode='multiple' headerStyle={{ width: "3rem" }}></Column>
      <Column field='nombre' header='Nombre' sortable></Column>
      <Column field='apellidos' header='Apellidos' sortable></Column>
      <Column field='localidad' header='Localidad'></Column>
    </DataTable>
  );
};

export default EditarClaseDataTable;
