import { useContext } from 'react';
import { Contexto } from '../context/ModulosContexto.jsx';

// Hook personalizado para acceder al contexto de Módulos profesionales
const useModulosContexto = () => {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error('useModulosContexto debe ser utilizado dentro de un ModulosContexto.');
  }

  return contexto;
};

export default useModulosContexto;
