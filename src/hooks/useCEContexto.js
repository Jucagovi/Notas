import { useContext } from 'react';
import { Contexto } from '../context/CEContexto.jsx';

// Hook personalizado para acceder al contexto de CE (Criterios de Evaluación)
const useCEContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useCEContexto debe ser utilizado dentro de un CEContexto.');
  }

  return contexto;
};

export default useCEContexto;
