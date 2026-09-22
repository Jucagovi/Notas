import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Imparte (Matrícula).
const useImparteGenerado = crearHookTabla('imparte', 'id_imparte');

const useImparte = (autoCargar = true) => {
  return useImparteGenerado(autoCargar);
};

export default useImparte;
