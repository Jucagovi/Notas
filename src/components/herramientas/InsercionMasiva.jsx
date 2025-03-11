import React, { useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import ValorEstado from "../complementos/ValorEstado.jsx";
import useDatos from "../../hooks/useDatos.js";
import useTostadas from "../../hooks/useTostadas.js";

const InsercionMasiva = () => {
  const valorInicial = "";
  const [valor, setValor] = useState(valorInicial);
  const [ciclos, setCiclos] = useState({});

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
    setCiclos(objetoJSON.slice(1));
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
    await insertarDato("Ciclos", ciclos);
    if (!errorGeneral) {
      mostrarTostadaExito({
        resumen: "Datos insertados.",
        detalle: `Los datos se han insertado correctamente (${ciclos.length} inserciones).`,
      });
    } else {
      mostrarTostadaError({
        resumen: "Se ha producido un error en la inserción.",
        detalle: `Los datos no se han insertado.`,
      });
    }
  };

  return (
    <>
      <InputTextarea
        autoResize
        placeholder='Introduce aquí el texto a formatear'
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        rows={10}
        cols={60}
      />
      <Button
        id='ciclos'
        label='Formatear ciclos'
        onClick={(evento) => {
          setCiclos(transformarDatos(evento.target));
        }}
      ></Button>
      <ValorEstado titulo='Ciclos' mostrar={ciclos} />
      <Button
        id='ciclos'
        label='Insertar ciclos'
        onClick={(evento) => {
          insertarDatos();
        }}
      ></Button>
    </>
  );
};

export default InsercionMasiva;
