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

  const { insertarDato, errorGeneral } = useDatos();
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
   */

  return (
    <>
      <div className=''>
        <InputTextarea
          className='m-2 flex-grow-0'
          //autoResize
          placeholder='Introduce aquí los datos a insertar en formato CSV.'
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          rows={10}
          cols={60}
        />
        {!tabla && (
          <>
            <br />
            <Dropdown
              value={tablaInsercion}
              onChange={(e) => setTablaInsercion(e.value)}
              options={tablaDesplegable}
              //optionLabel='name'
              placeholder='Elige una tabla donde realizar la inserción'
              className='w-full md:w-30rem m-2'
            />
          </>
        )}
        {insercion && (
          <>
            <br />
            <Button
              id='formatoDatos'
              className='m-2 md:w-20rem'
              label='Formatear datos'
              onClick={(evento) => {
                setFilas(transformarDatos(evento.target));
              }}
            ></Button>
            <br />
            <Button
              id='insercionDatos'
              className='m-2 md:w-20rem'
              label={`Insertar datos en ${tabla}`}
              onClick={(evento) => {
                insertarDatos();
              }}
            ></Button>
          </>
        )}
      </div>
    </>
  );
};

export default InsercionMasiva;
