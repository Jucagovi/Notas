import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Cursos Académicos.
const useCursosGenerado = crearHookTabla('Cursos', 'id_curso', { columna: 'anyo', ascendente: false });

const useCursos = (autoCargar = true) => {
  return useCursosGenerado(autoCargar);
};

export default useCursos;
