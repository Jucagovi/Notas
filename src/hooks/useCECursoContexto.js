import { useContext } from 'react';
import { Contexto } from '../context/CECursoContexto.jsx';

// Hook personalizado para acceder al contexto de la tabla ce_curso
const useCECursoContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useCECursoContexto debe ser utilizado dentro de un CECursoContexto.');
  }

  return contexto;
};

export default useCECursoContexto;
