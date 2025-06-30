import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import useEstilos from "../../hooks/useEstilos.js";
import ValorEstado from "../complementos/ValorEstado.jsx";
//import ChartDataLabels from "chartjs-plugin-datalabels";

const NotasAgrupadasTarta = ({ datosBrutos }) => {
  const [datos, setDatos] = useState({});
  const [opciones, setOpciones] = useState({});
  const { coloresGrafico } = useEstilos();

  const options = {
    maintainAspectRatio: true,
    aspectRatio: 1.7,
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: {
        labels: {
          usePointStyle: false,
        },
      },
    },
    datalabels: {
      color: "#fff",
      formatter: (value, context) => {
        const label = context.chart.data.labels[context.dataIndex];
        return `${label}: ${value} Feo`;
      },
    },
    tooltip: {
      enabled: false,
    },
  };

  const construirDatos = (datosBruto) => {
    // Sólo si hay datos.
    if (Array.isArray(datosBruto) && datosBruto?.length) {
      // Se construye la estructura de datos.
      const notasAgrupadas = [0, 0, 0, 0, 0, 0, 0, 0];

      // Se obtienen las notas.
      datosBruto.map((practica) => {
        if (practica.nota <= 30) notasAgrupadas[0]++;
        else if (practica.nota <= 49) notasAgrupadas[1]++;
        else if (practica.nota <= 59) notasAgrupadas[2]++;
        else if (practica.nota <= 69) notasAgrupadas[3]++;
        else if (practica.nota <= 79) notasAgrupadas[4]++;
        else if (practica.nota <= 89) notasAgrupadas[5]++;
        else if (practica.nota <= 99) notasAgrupadas[6]++;
        else notasAgrupadas[7]++;
      });

      //Se termina de completar el objeto.
      const datosOrdenados = {
        labels: ["<30", "40", "50", "60", "70", "80", "90", "100"],
        datasets: [
          {
            //label: "Sales",
            data: notasAgrupadas,
            backgroundColor: [
              "rgba(245, 87, 87, 0.3)",
              "rgba(255, 159, 64, 0.3)",
              "rgba(255, 255, 255, 0.5)",
              "rgba(255, 255, 255, 0.5)",
              "rgba(75, 192, 157, 0.3)",
              "rgba(64, 190, 92, 0.3)",
              "rgba(54, 162, 235, 0.3)",
              "rgba(54, 102, 235, 0.3)",
            ],
            hoverBackgroundColor: [
              "rgb(238, 79, 79)",
              "rgb(255, 159, 64)",
              "rgb(255, 255, 255)",
              "rgb(255, 255, 255)",
              "rgb(75, 192, 137)",
              "rgb(27, 189, 94)",
              "rgb(54, 162, 235)",
              "rgb(54, 96, 235)",
            ],
            borderWidth: 0.5,
            hoverOffset: 10,
          },
        ],
      };
      setDatos(datosOrdenados);
    }
  };

  useEffect(() => {
    construirDatos(datosBrutos);
    setOpciones(options);
  }, []);
  return (
    <>
      <Chart
        type='doughnut'
        data={datos}
        options={options}
        //className='w-full md:w-30rem'
      />
    </>
  );
};

export default NotasAgrupadasTarta;
