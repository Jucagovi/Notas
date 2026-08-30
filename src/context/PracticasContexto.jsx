import React, { createContext } from 'react';
import usePracticas from '../hooks/usePracticas.js';

// Contexto para la gestión y estado global de Prácticas
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero PracticasContexto
const PracticasContexto = ({ children }) => {
  const practicas = usePracticas();

  return (
    <Contexto.Provider value={practicas}>
      {children}
    </Contexto.Provider>
  );
};

export default PracticasContexto;
