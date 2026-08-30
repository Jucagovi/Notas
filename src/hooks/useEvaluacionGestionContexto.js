import { useContext } from 'react';
import { Contexto } from '../context/EvaluacionGestionContexto.jsx';

// Hook personalizado para consumir el contexto de gestión de evaluaciones
const useEvaluacionGestionContexto = () => {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error(
      'useEvaluacionGestionContexto debe ser utilizado dentro de un EvaluacionGestionContexto'
    );
  }
  return contexto;
};

export default useEvaluacionGestionContexto;
