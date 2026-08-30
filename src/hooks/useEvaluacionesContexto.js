import { useContext } from 'react';
import { Contexto } from '../context/EvaluacionesContexto.jsx';

// Hook personalizado para acceder al contexto de Evaluaciones
const useEvaluacionesContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useEvaluacionesContexto debe ser utilizado dentro de un EvaluacionesContexto.');
  }

  return contexto;
};

export default useEvaluacionesContexto;
