import { useContext } from 'react';
import { Contexto } from '../context/CursosContexto.jsx';

// Hook personalizado para acceder al contexto de Cursos académicos
const useCursosContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useCursosContexto debe ser utilizado dentro de un CursosContexto.');
  }

  return contexto;
};

export default useCursosContexto;
