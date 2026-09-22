import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página de asignación y ponderación de Criterios de Evaluación.
const CriteriosPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Asignación CE"
        descripcion="Asignación y ponderación de criterios de evaluación a resultados de aprendizaje."
      />
    </div>
  );
};

export default CriteriosPagina;
