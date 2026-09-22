import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Discentes.
const useDiscentesGenerado = crearHookTabla('Discentes', 'id_discente', { columna: 'apellidos', ascendente: true });

const useDiscentes = (autoCargar = true) => {
  return useDiscentesGenerado(autoCargar);
};

export default useDiscentes;
