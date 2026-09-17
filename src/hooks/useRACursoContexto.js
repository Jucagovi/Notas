import { useContext } from 'react';
import { Contexto } from '../context/RACursoContexto.jsx';

// Hook personalizado para acceder al contexto de la tabla ra_curso
const useRACursoContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useRACursoContexto debe ser utilizado dentro de un RACursoContexto.');
  }

  return contexto;
};

export default useRACursoContexto;
