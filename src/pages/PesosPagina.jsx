import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página de asignación y gestión de pesos de evaluación.
const PesosPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Asignación de Pesos"
        descripcion="Ponderación porcentual de resultados de aprendizaje y criterios."
      />
    </div>
  );
};

export default PesosPagina;
