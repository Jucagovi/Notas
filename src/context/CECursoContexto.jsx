import React, { createContext } from 'react';
import useCECurso from '../hooks/useCECurso.js';

// Contexto para la gestión y estado global de la tabla ce_curso
export const Contexto = createContext(null);

// Componente proveedor para el contexto de ce_curso
const CECursoContexto = ({ children }) => {
  const ceCurso = useCECurso();

  return (
    <Contexto.Provider value={ceCurso}>
      {children}
    </Contexto.Provider>
  );
};

export default CECursoContexto;
