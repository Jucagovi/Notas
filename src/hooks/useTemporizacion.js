import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Temporización.
const useTemporizacionGenerado = crearHookTabla('Temporizacion', 'id_temporizacion', { columna: 'orden', ascendente: true });

const useTemporizacion = (autoCargar = true) => {
  return useTemporizacionGenerado(autoCargar);
};

export default useTemporizacion;
