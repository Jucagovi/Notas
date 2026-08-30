import React, { createContext } from 'react';
import useSesion from '../hooks/useSesion.js';

// Contexto global para la gestión del estado de sesión y autenticación de usuario
export const Contexto = createContext(null);

// Componente proveedor del contexto de sesión
const SesionContexto = ({ children }) => {
  const sesion = useSesion();

  return (
    <Contexto.Provider value={sesion}>
      {children}
    </Contexto.Provider>
  );
};

export default SesionContexto;
