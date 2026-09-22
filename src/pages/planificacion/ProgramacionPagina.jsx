import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Programación didáctica general por curso y módulo.
const ProgramacionPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Programación Didáctica"
        descripcion="Diseño global de la programación docente por curso y módulo formativo."
      />
    </div>
  );
};

export default ProgramacionPagina;
