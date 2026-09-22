import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación CE por Curso (ce_curso).
const useCeCursoGenerado = crearHookTabla('ce_curso', 'id_ce_curso');

const useCeCurso = (autoCargar = true) => {
  return useCeCursoGenerado(autoCargar);
};

export default useCeCurso;
