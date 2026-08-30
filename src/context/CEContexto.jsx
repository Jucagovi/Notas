import React, { createContext } from 'react';
import useCE from '../hooks/useCE.js';

// Contexto para la gestión y estado global de CE (Criterios de Evaluación)
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero CEContexto
const CEContexto = ({ children }) => {
  const ce = useCE();

  return (
    <Contexto.Provider value={ce}>
      {children}
    </Contexto.Provider>
  );
};

export default CEContexto;
