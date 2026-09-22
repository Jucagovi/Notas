import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Página de centro de ayuda y soporte.
const AyudaPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Ayuda y Documentación"
        descripcion="Manual de usuario, guías de inicio rápido y soporte técnico."
      />
    </div>
  );
};

export default AyudaPagina;
