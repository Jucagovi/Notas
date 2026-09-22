import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página de gestión de discentes (alumnos).
const DiscentesPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Discentes"
        descripcion="Listado, matrícula y seguimiento individual de discentes."
      />
    </div>
  );
};

export default DiscentesPagina;
