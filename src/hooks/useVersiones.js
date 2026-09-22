import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Versiones de Prácticas.
const useVersionesGenerado = crearHookTabla('Versiones', 'id_version');

const useVersiones = (autoCargar = true) => {
  return useVersionesGenerado(autoCargar);
};

export default useVersiones;
