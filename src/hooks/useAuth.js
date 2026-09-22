import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// Hook personalizado para acceder al estado de autenticación y métodos de sesión.
const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProveedor.');
  }

  return contexto;
};

export default useAuth;
