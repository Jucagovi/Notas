import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla Calendario_Eventos (anteriormente denominada Festivos).
const useFestivosGenerado = crearHookTabla('Calendario_Eventos', 'id_evento', { columna: 'fecha_inicio', ascendente: true });

const useFestivos = (autoCargar = true) => {
  return useFestivosGenerado(autoCargar);
};

export default useFestivos;
