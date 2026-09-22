import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Seguimiento del progreso curricular de las unidades.
const ProgresoPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Progreso Curricular"
        descripcion="Seguimiento del cumplimiento de unidades temporizadas frente al avance real."
      />
    </div>
  );
};

export default ProgresoPagina;
