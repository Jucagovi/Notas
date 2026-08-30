import { useContext } from 'react';
import { Contexto } from '../context/SesionContexto.jsx';

// Hook personalizado para acceder al contexto global de sesión y autenticación
const useSesionContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useSesionContexto debe ser utilizado dentro de un SesionContexto.');
  }

  return contexto;
};

export default useSesionContexto;
