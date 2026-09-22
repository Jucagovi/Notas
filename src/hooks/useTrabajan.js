import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Trabajan (CE - Versiones).
const useTrabajanGenerado = crearHookTabla('trabajan', 'id_trabajan');

const useTrabajan = (autoCargar = true) => {
  return useTrabajanGenerado(autoCargar);
};

export default useTrabajan;
