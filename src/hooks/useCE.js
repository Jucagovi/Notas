import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Criterios de Evaluación (CE).
const useCEGenerado = crearHookTabla('CE', 'id_ce', { columna: 'numero', ascendente: true });

const useCE = (autoCargar = true) => {
  return useCEGenerado(autoCargar);
};

export default useCE;
