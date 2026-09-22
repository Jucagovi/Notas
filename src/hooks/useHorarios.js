import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación Horarios.
const useHorariosGenerado = crearHookTabla('Horarios', 'id_horario', { columna: 'dia_semana', ascendente: true });

const useHorarios = (autoCargar = true) => {
  return useHorariosGenerado(autoCargar);
};

export default useHorarios;
