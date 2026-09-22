import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Generación de la memoria pedagógica anual.
const MemoriaPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Memoria Anual"
        descripcion="Generación automatizada de la memoria curricular de fin de curso."
      />
    </div>
  );
};

export default MemoriaPagina;
