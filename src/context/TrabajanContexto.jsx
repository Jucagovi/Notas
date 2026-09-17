import React, { createContext } from 'react';
import useTrabajan from '../hooks/useTrabajan.js';

// Contexto para la gestión y estado global de la tabla trabajan
export const Contexto = createContext(null);

// Componente proveedor para el contexto de trabajan
const TrabajanContexto = ({ children }) => {
  const trabajan = useTrabajan();

  return (
    <Contexto.Provider value={trabajan}>
      {children}
    </Contexto.Provider>
  );
};

export default TrabajanContexto;
