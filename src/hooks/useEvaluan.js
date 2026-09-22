import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Evalúan (Calificaciones).
const useEvaluanGenerado = crearHookTabla('evaluan', 'id_evaluan');

const useEvaluan = (autoCargar = true) => {
  return useEvaluanGenerado(autoCargar);
};

export default useEvaluan;
