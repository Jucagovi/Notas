import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Exportación oficial a plataformas autonómicas (ITACA y AULES).
const ExportadorPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Exportador Oficial"
        descripcion="Generación de archivos para la exportación de notas a ITACA y AULES."
      />
    </div>
  );
};

export default ExportadorPagina;
