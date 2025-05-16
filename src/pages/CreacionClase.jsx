import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { confirmDialog } from "primereact/confirmdialog";
import useDatos from "../hooks/useDatos.js";
import useEstilos from "../hooks/useEstilos.js";
import useTostadas from "../hooks/useTostadas.js";
import { InputTextarea } from "primereact/inputtextarea";
import ValorEstado from "../components/complementos/ValorEstado.jsx";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import InsercionMasiva from "../components/herramientas/InsercionMasiva.jsx";
import CreacionClaseCurso from "../components/creacionClase/CreacionClaseCurso.jsx";
import CreacionClaseModulo from "../components/creacionClase/CreacionClaseModulo.jsx";
import CreacionClaseEvaluaciones from "../components/creacionClase/CreacionClaseEvaluaciones.jsx";
import CreacionClaseDiscentes from "../components/creacionClase/CreacionClaseDiscentes.jsx";

const CreacionClase = () => {
  const cursoInicial = {
    curso: "",
    modulo: "",
    evaluaciones: null /* [
      {
        nombre: "",
        fecha_ini: "",
        fecha_fin: "",
        descripcion: "",
        id_curso: "",
        id_modulo: "",
      },
    ] */,
    discentes: null /* [
       {
        nombre: "",
        apellidos: "",
        correo: "",
        fecha_nac: "",
        localidad: "",
        imagen: "",
      },
    ] */,
    imparte: [
      /* { id_discente: "", id_curso: "", id_modulo: "" } */
    ],
  };

  // Datos del curso actual.

  const [claseNueva, setClaseNueva] = useState(cursoInicial);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [listadoModulos, setListadoModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState("");
  const [discentesSeleccionados, setDiscentesSeleccionados] = useState("");

  const {
    actualizarFormulario,
    insertarDato,
    obtenerTodos,
    cursos,
    discentes,
    errorGeneral,
  } = useDatos();
  const { iconos } = useEstilos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [valoresFiltro, setValoresFiltro] = useState(""); // Para el formulario controlado de la búsqueda.

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
    //console.log(imparte_insertar);
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
    console.log(claseNueva);
  };

  const transformarDiscentes = (textoCSV) => {
    // Se divide le texto en líneas (dividir por el caráter \n).
    const lineas = textoCSV.split("\n");
    // Cada una se separa por el caracter ; y se meten en un array bidimensional.
    const separadas = lineas.map((linea) => {
      return linea.split(",");
    });
    // Por cada ocurrencia del primer array se crea un objeto y se ponen sus claves y sus valores.
    const objetoJSON = separadas.map((textoCSV) => {
      let objeto = {};
      separadas[0].map((val, subindice) => {
        objeto = { ...objeto, [val]: textoCSV[subindice] };
      });
      return objeto;
    });
    // El slice quita el primer objeto que son las cabeceras.
    return objetoJSON.slice(1);
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
   * Funciones para el formulario de búsqueda en el DataTable de discentes.
   */
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

  /**
   * ¡¡¡NO FUNCIONAN LAS PLANTILLAS!!!
   * Revisar -> si no van, crear un campo en la vista.
   * En el evento onChange del DropDown no es posible hacerlo
   * (sólo permite setear el estado). Si se coloca otra cosa
   * las plantillas no funcionan.
   */
  useEffect(() => {
    cursoSeleccionado &&
      setClaseNueva({
        ...claseNueva,
        ["curso"]: cursoSeleccionado,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [cursoSeleccionado]);

  useEffect(() => {
    moduloSeleccionado &&
      setClaseNueva({
        ...claseNueva,
        ["modulo"]: moduloSeleccionado,
        ["evaluaciones"]: crearEvaluaciones(
          cursoSeleccionado,
          moduloSeleccionado
        ),
      });
  }, [moduloSeleccionado]);

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

          <h4>Especifica el módulo.</h4>
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
          <h4>Elige discentes.</h4>
          {/* <InputTextarea
            className='m-1'
            //autoResize
            placeholder='Introduce aquí los datos a insertar en formato CSV.'
            value={discentesSeleccionados}
            onChange={(e) => {
              setDiscentesSeleccionados(e.target.value);
              //console.log(transformarDiscentes(e.target.value));
            }}
            rows={10}
            cols={60}
          /> */}
          {/* selectionMode={rowClick ? null : 'checkbox'} */}
          <ColumnaSimple>
            <DataTable
              paginator
              rows={10}
              value={discentes}
              selectionMode={null}
              selection={discentesSeleccionados}
              removableSort
              filters={filtros}
              globalFilterFields={["nombre", "apellidos"]}
              onSelectionChange={(e) => setDiscentesSeleccionados(e.value)}
              dataKey='id_discente'
              tableStyle={{ minWidth: "50rem" }}
              header={dibujarCabeceraBusqueda}
              emptyMessage='No hay resultados'
            >
              <Column
                selectionMode='multiple'
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column field='nombre' header='Nombre' sortable></Column>
              <Column field='apellidos' header='Apellidos' sortable></Column>
              <Column field='localidad' header='Localidad'></Column>
            </DataTable>
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
        </ColumnaSimple>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center m-1 px-4 py-2 border-round'>
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
          <ValorEstado mostrar={claseNueva.imparte} />
        </ColumnaSimple>
      </div>
    </>
  );
};

export default CreacionClase;
