import { useContext } from 'react';
import { Contexto } from '../context/ToastContexto.jsx';

// Hook personalizado para acceder al sistema global de notificaciones Toast
const useToast = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useToast debe ser utilizado dentro de un ToastContexto.');
  }

  return contexto;
};

export default useToast;
