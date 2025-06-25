import React, { useState } from "react";
import ColumnaSimple from "../../layout/ColumnaSimple.jsx";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import useDatos from "../../hooks/useDatos.js";
import useEstilos from "../../hooks/useEstilos.js";
import useTostadas from "../../hooks/useTostadas.js";

const CopiaSeguridad = () => {
  const { obtenerTodosReturn } = useDatos();
  const { iconos } = useEstilos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const [mensajes, setMensajes] = useState("");
  /**
   * Se utiliza un propio "cargando" (en lugar del general) para esperar
   * un segundo como mínimo sólo por apariencia.
   */
  const [cargando, setCargando] = useState(false);

  const tablasCopia = [
    "Ciclos",
    "Cursos",
    "Discentes",
    "Evaluaciones",
    "Modulos",
    "Practicas",
    "TipoEvaluacion",
    "TipoPracticas",
    "evaluan",
    "imparte",
  ];

  const tablasIconos = [
    "ciclo",
    "curso",
    "usuario",
    "evaluacion",
    "modulo",
    "practica",
    "evaluacion",
    "practica",
    "evaluacion",
    "curso",
  ];

  const descargarJSON = async (tabla) => {
    setCargando(true);

    // Se obtienen los datos de la BBDD.
    const datos = await obtenerTodosReturn(tabla);
    // Se tranforman en BLOB.
    const jsonString = JSON.stringify(datos, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    // Se construye una URL.
    const url = URL.createObjectURL(blob);
    // Se genera un elemento <a> con la URL...
    const enlace = document.createElement("a");
    enlace.href = url;
    const fecha = new Date();
    enlace.download = `${tabla} - ${fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })}.json`;
    document.body.appendChild(enlace);
    // ...y se activa.
    enlace.click();

    // Se limpia el elemento del DOM.
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setCargando(false);
    }, 1200);
  };

  const copiaCompleta = () => {
    tablasCopia.map((tabla) => {
      descargarJSON(tabla);
    });
  };

  return (
    <>
      <ColumnaSimple estilo='px-2 py-2'>
        <h2>Copia de seguridad</h2>
        <ColumnaSimple estilo='my-2'>
          <h3>Completa</h3>
          <div className='m-2'>
            <Button
              label={
                cargando ? "Creando fichero..." : "Copia de seguridad completa"
              }
              icon={iconos.archivo}
              outlined
              raised
              severity='warning'
              loading={cargando}
              onClick={() => {
                copiaCompleta();
              }}
            />
          </div>
        </ColumnaSimple>
        <ColumnaSimple>
          <div className='m-2'>
            <h3>Por tablas</h3>
            {tablasCopia.map((tabla, indice) => {
              return (
                <Button
                  key={indice}
                  label={cargando ? "Creando fichero..." : tabla}
                  className='w-15rem m-2'
                  icon={iconos[tablasIconos[indice]]}
                  outlined
                  //text
                  //raised
                  severity='info'
                  loading={cargando}
                  onClick={(e) => {
                    descargarJSON(tabla);
                  }}
                />
              );
            })}
          </div>
        </ColumnaSimple>
      </ColumnaSimple>
    </>
  );
};

export default CopiaSeguridad;
