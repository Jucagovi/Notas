import React from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';

// Página informativa sobre la aplicación.
const AcercaDePagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Acerca de"
        descripcion="Información del sistema y versión actual."
      />
    </div>
  );
};

export default AcercaDePagina;
