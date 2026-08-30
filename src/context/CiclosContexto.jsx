import React, { createContext } from 'react';
import useCiclos from '../hooks/useCiclos.js';

// Contexto para la gestión y estado global de Ciclos formativos
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero CiclosContexto
const CiclosContexto = ({ children }) => {
  const ciclos = useCiclos();

  return (
    <Contexto.Provider value={ciclos}>
      {children}
    </Contexto.Provider>
  );
};

export default CiclosContexto;
