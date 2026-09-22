import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Períodos de Evaluación.
const useEvaluacionesGenerado = crearHookTabla('Evaluaciones', 'id_evaluacion', { columna: 'fecha_ini', ascendente: true });

const useEvaluaciones = (autoCargar = true) => {
  return useEvaluacionesGenerado(autoCargar);
};

export default useEvaluaciones;
