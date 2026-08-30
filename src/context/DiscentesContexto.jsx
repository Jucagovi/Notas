import React, { createContext } from 'react';
import useDiscentes from '../hooks/useDiscentes.js';

// Contexto para la gestión y estado global de Discentes (alumnado)
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero DiscentesContexto
const DiscentesContexto = ({ children }) => {
  const discentes = useDiscentes();

  return (
    <Contexto.Provider value={discentes}>
      {children}
    </Contexto.Provider>
  );
};

export default DiscentesContexto;
