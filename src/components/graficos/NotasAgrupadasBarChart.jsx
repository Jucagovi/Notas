import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import useEstilos from "../../hooks/useEstilos.js";
import ValorEstado from "../complementos/ValorEstado.jsx";

const NotasAgrupadasBarChart = ({ datosBrutos }) => {
  const [datos, setDatos] = useState({});
  const [opciones, setOpciones] = useState({});
  const { coloresGrafico } = useEstilos();

  const options = {
    maintainAspectRatio: true,
    aspectRatio: 2,
    responsive: true,
    plugins: {
      legend: {
        position: "none",
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: coloresGrafico.gris,
        },
        grid: {
          color: coloresGrafico.gris,
        },
      },
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
            borderColor: [
              "rgb(238, 79, 79)",
              "rgb(255, 159, 64)",
              "rgb(255, 255, 255)",
              "rgb(255, 255, 255)",
              "rgb(75, 192, 137)",
              "rgb(27, 189, 94)",
              "rgb(54, 162, 235)",
              "rgb(54, 96, 235)",
            ],
            borderWidth: 1.5,
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
      <Chart type='bar' data={datos} options={options} />
    </>
  );
};

export default NotasAgrupadasBarChart;
