import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Unidades de Trabajo.
const useUnidadesTrabajoGenerado = crearHookTabla('Unidades_Trabajo', 'id_ut', { columna: 'numero', ascendente: true });

const useUnidadesTrabajo = (autoCargar = true) => {
  return useUnidadesTrabajoGenerado(autoCargar);
};

export default useUnidadesTrabajo;
