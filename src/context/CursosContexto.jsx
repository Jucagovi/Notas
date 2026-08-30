import React, { createContext } from 'react';
import useCursos from '../hooks/useCursos.js';

// Contexto para la gestión y estado global de Cursos académicos
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero CursosContexto
const CursosContexto = ({ children }) => {
  const cursos = useCursos();

  return (
    <Contexto.Provider value={cursos}>
      {children}
    </Contexto.Provider>
  );
};

export default CursosContexto;
