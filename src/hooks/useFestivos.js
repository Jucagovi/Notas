import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Festivos.
const useFestivosGenerado = crearHookTabla('Festivos', 'id_festivo', { columna: 'fecha', ascendente: true });

const useFestivos = (autoCargar = true) => {
  return useFestivosGenerado(autoCargar);
};

export default useFestivos;
