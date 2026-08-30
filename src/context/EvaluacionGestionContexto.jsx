import React, { createContext } from 'react';
import useEvaluacionGestion from '../hooks/useEvaluacionGestion.js';

// Contexto principal para la gestión de evaluaciones y asignación de prácticas
export const Contexto = createContext(null);

// Componente proveedor que suministra el estado y métodos de evaluación a los componentes hijos
const EvaluacionGestionContexto = ({ children }) => {
  const estadoEvaluacion = useEvaluacionGestion();

  return (
    <Contexto.Provider value={estadoEvaluacion}>
      {children}
    </Contexto.Provider>
  );
};

export default EvaluacionGestionContexto;
