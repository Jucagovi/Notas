import { useContext } from 'react';
import { Contexto } from '../context/DiscentesContexto.jsx';

// Hook personalizado para acceder al contexto de Discentes
const useDiscentesContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useDiscentesContexto debe ser utilizado dentro de un DiscentesContexto.');
  }

  return contexto;
};

export default useDiscentesContexto;
