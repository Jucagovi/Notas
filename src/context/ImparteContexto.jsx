import React, { createContext } from 'react';
import useImparte from '../hooks/useImparte.js';

// Contexto para la gestión y estado global de la tabla imparte
export const Contexto = createContext(null);

// Componente proveedor para el contexto de imparte
const ImparteContexto = ({ children }) => {
  const imparte = useImparte();

  return (
    <Contexto.Provider value={imparte}>
      {children}
    </Contexto.Provider>
  );
};

export default ImparteContexto;
