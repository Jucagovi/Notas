import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página interactiva de calificación de alumnos.
const CalificarPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Calificar"
        descripcion="Calificación rápida e interactiva de discentes por actividad o práctica."
      />
    </div>
  );
};

export default CalificarPagina;
