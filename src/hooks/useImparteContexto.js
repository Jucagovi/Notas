import { useContext } from 'react';
import { Contexto } from '../context/ImparteContexto.jsx';

// Hook personalizado para acceder al contexto de la tabla imparte
const useImparteContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useImparteContexto debe ser utilizado dentro de un ImparteContexto.');
  }

  return contexto;
};

export default useImparteContexto;
