import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Desarrollan (UT - RA).
const useDesarrollanGenerado = crearHookTabla('desarrollan', 'id_desarrollan');

const useDesarrollan = (autoCargar = true) => {
  return useDesarrollanGenerado(autoCargar);
};

export default useDesarrollan;
