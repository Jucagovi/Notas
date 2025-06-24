import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ColumnaSimple from "../../layout/ColumnaSimple.jsx";
import useDatos from "../../hooks/useDatos.js";
import DiscenteDetalleEvaluaciones from "./DiscenteDetalleEvaluaciones.jsx";
import DiscenteFicha from "./DiscenteFicha.jsx";
import ValorEstado from "../complementos/ValorEstado.jsx";
import CursosDropDown from "../desplegables/CursosDropDown.jsx";
import NotasLineChart from "../graficos/NotasLineChart.jsx";
import { TabView, TabPanel } from "primereact/tabview";
import Cargando from "../Cargando.jsx";
import useEstilos from "../../hooks/useEstilos.js";
import DiscentesEvaluacionesDataTable from "../datatables/DiscentesEvaluacionesDataTable.jsx";
import NotasAgrupadasBarChart from "../graficos/NotasAgrupadasBarChart.jsx";

const DiscenteDetalle = () => {
  //Se recoge el id pasado por parámetro y se cambia el estado del proveedor.
  const { id } = useParams();

  const { obtenerConsulta, cursos, cursoActual } = useDatos();
  const { extraerUnicos } = useEstilos();

  const [cursoSeleccionado, setCursoSeleccionado] = useState({});
  const [listadoEvaluacionesCiclos, setListadoEvaluacionesCiclos] = useState(
    []
  );
  const [modulosUnicos, setModulosUnicos] = useState([]);

  // Estado para las pestañas.
  const [indiceActivo, setIndiceActivo] = useState(0);

  const filtrarEvaluaciones = (modulo) => {
    const _filtrado = listadoEvaluacionesCiclos.filter((eva) => {
      return eva.nombre_modulo === modulo;
    });
    return <DiscentesEvaluacionesDataTable evaluaciones={_filtrado} />;
  };

  const filtrarGrafica = (modulo) => {
    const _filtrado = listadoEvaluacionesCiclos.filter((eva) => {
      return eva.nombre_modulo === modulo;
    });
    return (
      <>
        <NotasLineChart datosBrutos={_filtrado} />
        <NotasAgrupadasBarChart datosBrutos={_filtrado} />
      </>
    );
  };

  useEffect(() => {
    // Se obtienen todas las prácticas (evaluan) sólo del discente en cuestión.
    // Así se evita traer todos los datos (que eventualmente serán muchos).
    // La vista está ordenada por nombre de la evaluación para que se muestre bien en el DataTable de notas.
    obtenerConsulta(
      "listado_evaluaciones_ciclos",
      setListadoEvaluacionesCiclos,
      { columna: "id_discente", valor: id },
      "numero"
    );
    // Se actualiza el curso actual con el último curso creado.
    setCursoSeleccionado(cursoActual);
  }, []);

  /*  useEffect(() => {
    setListadoEvaluacionesCiclos([]);
  }, [cursoSeleccionado]); */

  useEffect(() => {
    listadoEvaluacionesCiclos &&
      setModulosUnicos(
        extraerUnicos(listadoEvaluacionesCiclos, "nombre_modulo")
      );
  }, [listadoEvaluacionesCiclos]);

  return (
    <ColumnaSimple>
      <ColumnaSimple estilo='flex m-1'>
        <DiscenteFicha identificador={id} />
      </ColumnaSimple>
      <ColumnaSimple estilo='m-1 my-2 text-right'>
        <CursosDropDown
          opciones={cursos}
          valor={cursoSeleccionado}
          setter={setCursoSeleccionado}
        />
      </ColumnaSimple>
      <ColumnaSimple estilo='m-1 my-2'>
        <h2>Pestañas con los módulos</h2>
        <TabView>
          {modulosUnicos &&
            modulosUnicos.map((modulo, indice) => {
              return (
                <TabPanel key={indice} header={modulo} className='flex'>
                  <div className='m-0 mr-2 w-6'>
                    {filtrarEvaluaciones(modulo)}
                  </div>
                  <div className='m-0 w-6'>{filtrarGrafica(modulo)}</div>
                </TabPanel>
              );
            })}
        </TabView>
      </ColumnaSimple>
    </ColumnaSimple>
  );
};

export default DiscenteDetalle;
