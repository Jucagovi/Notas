import React, { useState, useEffect } from "react";
import supabase from "../../config/config_supabase";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Button } from "primereact/button";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import useTostadas from "../../hooks/useTostadas.js";
import useDatos from "../../hooks/useDatos.js";
import useEstilos from "../../hooks/useEstilos.js";

const PracticasEvaluacionDataTable = ({ seleccion, setter, evaluacion }) => {
  const {
    practicas,
    obtenerConsultaReturn,
    errorGeneral,
    insertarDato,
    cambiarErrorGeneral,
  } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();
  const { iconos } = useEstilos();

  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [valoresFiltro, setValoresFiltro] = useState(""); // Para el formulario controlado de la búsqueda.

  const eliminarEvaluan = async (options) => {
    // Es necesario comprobar dos id. Se hace a mano.
    const { data, error } = await supabase
      .from("evaluan")
      .delete()
      .eq("id_practica", options.data.id_practica)
      .eq("id_evaluacion", evaluacion.id_evaluacion);
    if (!error) {
      mostrarTostadaExito({
        resumen: "Datos eliminados.",
        detalle: `Los datos de dispone se han eliminado correctamente.`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error con el borrado.",
        detalle: `Los datos de dispone no se ha eliminado.`,
      });
    }
  };

  const cuerpoColumnaInicial = (options) => {
    const existe = seleccion.some((obj) => {
      return obj.id_practica === options.id_practica;
    });

    return existe ? (
      <i
        className={`${iconos.practica} m-2 fadeinleft animation-duration-400 vertical-align-middle`}
        style={{ fontSize: "1.1rem" }}
      ></i>
    ) : (
      ""
    );
  };

  const insertarEvaluan = async (options) => {
    // Se obtiene el listado de los discentes de la evaluación a través de una vista.
    const discentesEvaluacion = await obtenerConsultaReturn(
      "listado_discentes_curso",
      {
        columna: "id_evaluacion",
        valor: evaluacion.id_evaluacion,
      }
    );

    const discentes =
      Array.isArray(discentesEvaluacion) && discentesEvaluacion.length
        ? discentesEvaluacion.map((discente) => {
            return {
              id_evaluacion: evaluacion.id_evaluacion,
              id_discente: discente.id_discente,
              id_practica: options.data.id_practica,
            };
          })
        : cambiarErrorGeneral(
            "No se han encontrado discentes para esa evaluación."
          );
    /**
     * Una vez construido el listado de todos los discentes de la evaluación
     * se introducen en la tabla "evaluan" junto con la evaluación y la práctica.
     * Eso sí, tras comprobar si se han encontrado discentes para esa evaluación.
     */
    // Shortcircuit operator -> si todo va bien (todo es true) hago la sentencia del final.
    !errorGeneral && (await insertarDato("evaluan", discentes));

    if (errorGeneral) {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Los datos de dispone no se ha insertado: ${errorGeneral}.`,
      });
    } else {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Los datos de dispone se ha insertado correctamente.`,
      });
    }
  };

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

  return (
    <>
      <DataTable
        key={seleccion}
        paginator
        paginatorPosition='top'
        rows={15}
        value={practicas}
        selectionMode='multiple'
        selection={seleccion}
        removableSort
        filters={filtros}
        globalFilterFields={["nombre", "unidad", "enunciado", "numero"]}
        onSelectionChange={(e) => {
          setter(e.value);
        }}
        dataKey='id_practica'
        tableStyle={{ minWidth: "50rem" }}
        header={dibujarCabeceraBusqueda}
        onRowUnselect={eliminarEvaluan}
        onRowSelect={insertarEvaluan}
        emptyMessage='Selecciona una evaluación para comenzar.'
      >
        <Column body={cuerpoColumnaInicial}></Column>
        <Column field='numero' header='Número' sortable></Column>
        <Column field='nombre' header='Nombre' sortable></Column>
        <Column field='enunciado' header='Enunciado' sortable></Column>
      </DataTable>
    </>
  );
};

export default PracticasEvaluacionDataTable;
