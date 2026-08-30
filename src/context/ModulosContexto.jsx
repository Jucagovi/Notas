import React, { createContext } from 'react';
import useModulos from '../hooks/useModulos.js';

// Contexto para la gestión y estado global de Módulos profesionales
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero ModulosContexto
const ModulosContexto = ({ children }) => {
  const modulos = useModulos();

  return (
    <Contexto.Provider value={modulos}>
      {children}
    </Contexto.Provider>
  );
};

export default ModulosContexto;
