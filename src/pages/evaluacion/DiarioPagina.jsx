import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';

// Diario de clase con anotaciones diarias del profesor.
const DiarioPagina = () => {
  return (
    <div className="flex flex-column w-full">
      <HeaderPagina
        titulo="Diario de Aula"
        descripcion="Registro diario de sesiones, incidencias de clase y actividades desarrolladas."
      />
    </div>
  );
};

export default DiarioPagina;
