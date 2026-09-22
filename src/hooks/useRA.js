import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Resultados de Aprendizaje (RA).
const useRAGenerado = crearHookTabla('RA', 'id_ra', { columna: 'numero', ascendente: true });

const useRA = (autoCargar = true) => {
  return useRAGenerado(autoCargar);
};

export default useRA;
