import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar la tabla de relación RA por Curso (ra_curso).
const useRaCursoGenerado = crearHookTabla('ra_curso', 'id_ra_curso');

const useRaCurso = (autoCargar = true) => {
  return useRaCursoGenerado(autoCargar);
};

export default useRaCurso;
