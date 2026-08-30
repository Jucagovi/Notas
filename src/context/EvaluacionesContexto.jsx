import React, { createContext } from 'react';
import useEvaluaciones from '../hooks/useEvaluaciones.js';

// Contexto para la gestión y estado global de Evaluaciones
export const Contexto = createContext(null);

// Componente proveedor que coincide con el nombre del fichero EvaluacionesContexto
const EvaluacionesContexto = ({ children }) => {
  const evaluaciones = useEvaluaciones();

  return (
    <Contexto.Provider value={evaluaciones}>
      {children}
    </Contexto.Provider>
  );
};

export default EvaluacionesContexto;
