import React, { useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import ValorEstado from "../complementos/ValorEstado.jsx";

const InsercionMasiva = () => {
  const valorInicial = "";
  const [valor, setValor] = useState(valorInicial);
  const [claves, setClaves] = useState([]);
  const [ciclos, setCiclos] = useState({});

  const transformarDatos = (tabla) => {
    const lineas = valor.split("\n");

    const separadas = lineas.map((linea) => {
      return linea.split(";");
    });

    const feo = separadas.map((valor) => {
      const objeto_temporal = {
        [separadas[0][0]]: valor[0],
        [separadas[0][1]]: valor[1],
        [separadas[0][2]]: valor[2],
      };
      return objeto_temporal;
    });
    // Se incluye el slice para eliminar el primer elemento del array
    // que incluye las cabeceras.
    setCiclos(feo.slice(1));
  };

  const transformarDatos2 = (tabla) => {
    const lineas = valor.split("\n");
    //console.log(lineas);
    const separadas = lineas.map((linea) => {
      return linea.split(";");
    });
    setClaves(separadas);

    const feo = separadas.map((valor, indice) => {
      const objeto = separadas[0].map((val, subindice) => {
        console.log(`${val}: ${valor[indice][subindice]}`);
      });
      return objeto;
    });
    console.log(feo);
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
        label='Insertar ciclos'
        onClick={(evento) => {
          transformarDatos2(evento.target);
        }}
      ></Button>
      <ValorEstado titulo='Claves' mostrar={claves} />
      <ValorEstado titulo='Ciclos' mostrar={ciclos} />
    </>
  );
};

export default InsercionMasiva;
