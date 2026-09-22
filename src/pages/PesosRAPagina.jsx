import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página de ponderación y pesos de Resultados de Aprendizaje (RA) y Criterios (CE).
const PesosRAPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Pesos RA y CE"
        descripcion="Distribución de porcentajes de evaluación curricular."
      />
    </div>
  );
};

export default PesosRAPagina;
