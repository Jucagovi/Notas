import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Calendario lectivo con festivos y jornadas laborales.
const CalendarioPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Calendario Lectivo"
        descripcion="Gestión de días festivos, vacaciones escolares y jornadas no lectivas."
      />
    </div>
  );
};

export default CalendarioPagina;
