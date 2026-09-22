import { useContext } from 'react';
import { TemaContexto } from '../context/TemaContexto.jsx';

// Hook personalizado para acceder al estado y acciones del tema claro/oscuro.
export const useTema = () => {
  const contexto = useContext(TemaContexto);

  if (!contexto) {
    throw new Error('useTema debe utilizarse dentro de un TemaProveedor.');
  }

  return contexto;
};

export default useTema;
