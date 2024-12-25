import React, { useState, useEffect } from "react";
import ColumnaSimple from "../layout/ColumnaSimple";
import { Chart } from "primereact/chart";

const Notas = () => {
  const data = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Sales",
        data: [540, 325, 702, 620],
        backgroundColor: [
          "rgba(255, 159, 64, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgb(255, 159, 64)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const [chartData, setChartData] = useState(data);
  const [chartOptions, setChartOptions] = useState(options);

  return (
    <ColumnaSimple>
      <h2>Sección para gestionar las notas.</h2>
      <ColumnaSimple>
        <Chart
          className='w-8'
          type='bar'
          data={chartData}
          options={chartOptions}
        />
      </ColumnaSimple>
      <ColumnaSimple>
        <Chart
          className='w-6'
          type='pie'
          data={chartData}
          options={chartOptions}
        />
      </ColumnaSimple>
      <ColumnaSimple>
        <Chart
          className='w-6'
          type='doughnut'
          data={chartData}
          options={chartOptions}
        />
      </ColumnaSimple>
      <ColumnaSimple>
        <Chart
          className='w-6'
          type='line'
          data={chartData}
          options={chartOptions}
        />
      </ColumnaSimple>
    </ColumnaSimple>
  );
};

export default Notas;
