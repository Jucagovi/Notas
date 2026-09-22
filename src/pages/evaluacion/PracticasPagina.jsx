import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Repositorio de prácticas y actividades didácticas.
const PracticasPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Repositorio de Prácticas"
        descripcion="Banco de actividades evaluables, enunciados y rúbricas de corrección."
      />
    </div>
  );
};

export default PracticasPagina;
