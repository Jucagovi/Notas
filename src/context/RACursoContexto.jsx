import React, { createContext } from 'react';
import useRACurso from '../hooks/useRACurso.js';

// Contexto para la gestión y estado global de la tabla ra_curso
export const Contexto = createContext(null);

// Componente proveedor para el contexto de ra_curso
const RACursoContexto = ({ children }) => {
  const raCurso = useRACurso();

  return (
    <Contexto.Provider value={raCurso}>
      {children}
    </Contexto.Provider>
  );
};

export default RACursoContexto;
