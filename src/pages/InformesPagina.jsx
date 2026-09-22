import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Catálogo general de informes pedagógicos y administrativos.
const InformesPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Listado de Informes"
        descripcion="Catálogo centralizado de informes oficiales y análisis pedagógico."
      />
    </div>
  );
};

export default InformesPagina;
