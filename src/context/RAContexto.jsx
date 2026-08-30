import React, { createContext } from 'react';
import useRA from '../hooks/useRA.js';

// Contexto para la gestión y estado global de RA (Resultados de Aprendizaje)
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero RAContexto
const RAContexto = ({ children }) => {
  const ra = useRA();

  return (
    <Contexto.Provider value={ra}>
      {children}
    </Contexto.Provider>
  );
};

export default RAContexto;
