import { useContext } from 'react';
import { Contexto } from '../context/PracticasContexto.jsx';

// Hook personalizado para acceder al contexto de Prácticas
const usePracticasContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('usePracticasContexto debe ser utilizado dentro de un PracticasContexto.');
  }

  return contexto;
};

export default usePracticasContexto;
