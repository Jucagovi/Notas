import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Seguimiento trimestral y comparativas por evaluación.
const SeguimientoPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Seguimiento Trimestral"
        descripcion="Informe comparativo de notas medias y porcentaje de aprobados por evaluación."
      />
    </div>
  );
};

export default SeguimientoPagina;
