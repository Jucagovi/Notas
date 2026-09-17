import { useContext } from 'react';
import { Contexto } from '../context/TrabajanContexto.jsx';

// Hook personalizado para acceder al contexto de la tabla trabajan
const useTrabajanContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useTrabajanContexto debe ser utilizado dentro de un TrabajanContexto.');
  }

  return contexto;
};

export default useTrabajanContexto;
