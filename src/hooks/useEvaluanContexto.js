import { useContext } from 'react';
import { Contexto } from '../context/EvaluanContexto.jsx';

// Hook personalizado para acceder al contexto de la tabla evaluan
const useEvaluanContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useEvaluanContexto debe ser utilizado dentro de un EvaluanContexto.');
  }

  return contexto;
};

export default useEvaluanContexto;
