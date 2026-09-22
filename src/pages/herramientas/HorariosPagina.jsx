import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Planificación semanal de sesiones y horarios escolares.
const HorariosPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Horarios y Disponibilidad"
        descripcion="Configuración de sesiones lectivas semanales, tramos horarios y aulas."
      />
    </div>
  );
};

export default HorariosPagina;
