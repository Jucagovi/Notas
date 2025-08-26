import React, { useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import ValorEstado from "../complementos/ValorEstado.jsx";
import useDatos from "../../hooks/useDatos.js";
import useTostadas from "../../hooks/useTostadas.js";
import { Dropdown } from "primereact/dropdown";
import ColumnaSimple from "../../layout/ColumnaSimple.jsx";

const InsercionMasiva = ({ insercion, tabla }) => {
  const valorInicial = "";
  const tablasDesplegable = [
    "Ciclos",
    "Cursos",
    "Discentes",
    "Evaluaciones",
    "Modulos",
    "Practicas",
    "evalua",
    "imparte",
    "disponen",
  ];
  const [valor, setValor] = useState(valorInicial);
  const [filas, setFilas] = useState({});
  const [tablaInsercion, setTablaInsercion] = useState(tabla);
  const [tablaDesplegable, setTablaDesplegable] = useState(tablasDesplegable);

  const { insertarDato, errorGeneral, cambiarErrorGeneral } = useDatos();
  const { mostrarTostadaError, mostrarTostadaExito } = useTostadas();

  const transformarDatosFormatoEspecifico = () => {
    const lineas = valor.split("\n");
    const separadas = lineas.map((linea) => {
      return linea.split(";");
    });
    //Se crea un obejto con una estructura determinada usando los valores de la primera ocurrencia (cabeceras).
    const objetoJSON = separadas.map((valor) => {
      const objeto_temporal = {
        [separadas[0][0]]: valor[0],
        [separadas[0][1]]: valor[1],
        [separadas[0][2]]: valor[2],
      };
      return objeto_temporal;
    });
    // El slice quita el primer objeto que son las cabeceras.
    setFilas(objetoJSON.slice(1));
  };

  const transformarDatos = () => {
    // Se divide le texto en líneas (dividir por el caráter \n).
    const lineas = valor.split("\n");
    // Cada una se separa por el caracter ; y se meten en un array bidimensional.
    const separadas = lineas.map((linea) => {
      return linea.split(";");
    });
    // Por cada ocurrencia del primer array se crea un objeto y se ponen sus claves y sus valores.
    const objetoJSON = separadas.map((valor) => {
      let objeto = {};
      separadas[0].map((val, subindice) => {
        objeto = { ...objeto, [val]: valor[subindice] };
      });
      return objeto;
    });
    // El slice quita el primer objeto que son las cabeceras.
    return objetoJSON.slice(1);
  };

  const insertarDatos = async () => {
    await insertarDato(tablaInsercion, filas);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Los datos se han insertado correctamente (${filas.length} inserciones).`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Los datos no se han insertado.`,
      });
    }
  };

  /**
   * Revisar diseño para no utilizar <br> <-- es muy cutre.
   * Separarlo en dos columnas para mostrar el resultado del formateo del JSON.
   * Si hay contenido en el JSON formateado, se muestra el botón Insertar,
   * inicialmente sólo aparece el de Formatear datos.
   */

  return (
    <>
      <div className='flex '>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center  m-1 border-round'>
          <p>Introduce los datos de la siguiente manera:</p>
          <ol>
            <li>separa las columnas con el caracter ";" (punto y coma),</li>
            <li>da formato a los datos pulsando el botón "Formatear datos",</li>
            <li>se revisa la información obtenida y</li>
            <li>se elige na tabla en donde realizar la inserción.</li>
          </ol>
          <InputTextarea
            className='m-1'
            //autoResize
            placeholder='Introduce aquí los datos a insertar en formato CSV.'
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            rows={10}
            cols={60}
          />
          <Button
            id='formatoDatos'
            className='m-1 md:w-20rem'
            label='Formatear datos'
            onClick={(evento) => {
              setFilas(transformarDatos(evento.target));
            }}
          ></Button>
        </ColumnaSimple>
        <ColumnaSimple estilo='flex-1 align-items-center justify-content-center font-bold m-1 border-round'>
          <ColumnaSimple>
            <Dropdown
              value={tablaInsercion}
              onChange={(e) => setTablaInsercion(e.value)}
              options={tablaDesplegable}
              //optionLabel='name'
              placeholder='Elige una tabla'
              className='w-full md:w-20rem m-1'
            />
            {tablaInsercion && (
              <Button
                id='insercionDatos'
                className='m-1 md:w-15rem'
                label={`Insertar datos`}
                onClick={(evento) => {
                  insertarDatos();
                }}
              ></Button>
            )}
          </ColumnaSimple>
          <ColumnaSimple>
            {filas.length ? (
              <ValorEstado mostrar={filas} titulo='Texto en formato JSON' />
            ) : (
              "No se ha formateado el texto todavía."
            )}
          </ColumnaSimple>
        </ColumnaSimple>
      </div>
    </>
  );
};

export default InsercionMasiva;
