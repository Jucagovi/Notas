import { useContext } from 'react';
import { Contexto } from '../context/CiclosContexto.jsx';

// Hook personalizado para acceder al contexto de Ciclos formativos
const useCiclosContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useCiclosContexto debe ser utilizado dentro de un CiclosContexto.');
  }

  return contexto;
};

export default useCiclosContexto;
