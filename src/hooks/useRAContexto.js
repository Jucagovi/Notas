import { useContext } from 'react';
import { Contexto } from '../context/RAContexto.jsx';

// Hook personalizado para acceder al contexto de RA (Resultados de Aprendizaje)
const useRAContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useRAContexto debe ser utilizado dentro de un RAContexto.');
  }

  return contexto;
};

export default useRAContexto;
