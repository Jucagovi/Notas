import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

// Hook personalizado para acceder al sistema global de notificaciones Toast.
const useGlobalToast = () => {
  const contexto = useContext(ToastContext);

  if (!contexto) {
    throw new Error('useGlobalToast debe ser utilizado dentro de un ToastProveedor.');
  }

  return contexto;
};

export default useGlobalToast;
