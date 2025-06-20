import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import useDatos from "../../hooks/useDatos.js";
import ValorEstado from "../complementos/ValorEstado";
import useEstilos from "../../hooks/useEstilos.js";

const NotasLineChart = ({ identificador, datosBrutos }) => {
  const [datos, setDatos] = useState({});
  const [opciones, setOpciones] = useState({});
  const { coloresGrafico } = useEstilos();

  const options = {
    maintainAspectRatio: true,
    aspectRatio: 2,
    responsive: true,
    /* animations: {
      tension: {
        duration: 1000,
        easing: "linear",
        from: 1,
        to: 0,
        loop: true,
      },
    }, */
    plugins: {
      legend: {
        position: "none",
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: coloresGrafico.gris,
        },
        grid: {
          color: coloresGrafico.gris,
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          /*  color: "grey", */
          color: (context) => {
            if (context.tick.value == 50) {
              return coloresGrafico.rojo;
            } else {
              return coloresGrafico.gris;
            }
          },
        },
        grid: {
          /* color: "grey", */
          color: (context) => {
            if (context.tick.value == 50) {
              return coloresGrafico.rojo;
            } else {
              return coloresGrafico.gris;
            }
          },
        },
      },
    },
  };

  // Se contruyen los datos para la gráfica.
  const construirDatos = async (datosBruto) => {
    // Sólo si hay datos.
    if (Array.isArray(datosBruto) && datosBruto?.length) {
      // Se obtienen las etiquetas.
      const etiquetas = datosBruto.map((practica) => {
        return practica.numero;
      });
      // Se obtienen las notas.
      const notas = datosBruto.map((practica) => {
        return practica.nota;
      });
      //Se termina de completar el objeto.
      let datosOrdenados = {
        labels: etiquetas,
        datasets: [
          {
            /* label: datosBruto[0].id_evaluacion, */
            data: notas,
            fill: false,
            //stepped: true,
            //borderDash: [5, 5],
            //borderColor: "white",
            borderColor: (context) => {
              if (context.raw < 50) {
                return coloresGrafico.rojo;
              } else {
                return coloresGrafico.blanco;
              }
            },
            backgroundColor: (context) => {
              if (context.raw < 50) {
                return coloresGrafico.rojo;
              } else {
                return coloresGrafico.blanco;
              }
            },
            tension: 0.3,
            pointStyle: "rectRounded",
            pointRadius: 5,
            pointHoverRadius: 10,
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
      <Chart type='line' data={datos} options={options} />
    </>
  );
};

export default NotasLineChart;
