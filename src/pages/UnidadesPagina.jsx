import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página de unidades de trabajo curricular.
const UnidadesPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Unidades de Trabajo"
        descripcion="Estructura curricular de unidades didácticas y contenidos."
      />
    </div>
  );
};

export default UnidadesPagina;
