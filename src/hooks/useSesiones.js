import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Sesiones Horarias.
const useSesionesGenerado = crearHookTabla('Sesiones', 'id_sesion', { columna: 'numero', ascendente: true });

const useSesiones = (autoCargar = true) => {
  return useSesionesGenerado(autoCargar);
};

export default useSesiones;
