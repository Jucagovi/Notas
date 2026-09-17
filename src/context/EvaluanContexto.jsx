import React, { createContext } from 'react';
import useEvaluan from '../hooks/useEvaluan.js';

// Contexto para la gestión y estado global de la tabla evaluan
export const Contexto = createContext(null);

// Componente proveedor para el contexto de evaluan
const EvaluanContexto = ({ children }) => {
  const evaluan = useEvaluan();

  return (
    <Contexto.Provider value={evaluan}>
      {children}
    </Contexto.Provider>
  );
};

export default EvaluanContexto;
