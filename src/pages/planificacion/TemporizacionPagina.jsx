import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Temporización de las unidades de trabajo en el calendario.
const TemporizacionPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Temporización"
        descripcion="Planificación temporal por semanas y fechas de las unidades de trabajo."
      />
    </div>
  );
};

export default TemporizacionPagina;
