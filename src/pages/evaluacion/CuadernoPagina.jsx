import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Cuaderno del profesor para seguimiento diario de notas.
const CuadernoPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Cuaderno del Profesor"
        descripcion="Vista unificada de calificaciones por discente, actividad y evaluación."
      />
    </div>
  );
};

export default CuadernoPagina;
