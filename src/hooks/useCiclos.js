import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Ciclos Formativos.
const useCiclosGenerado = crearHookTabla('Ciclos', 'id_ciclo', { columna: 'nombre', ascendente: true });

const useCiclos = (autoCargar = true) => {
  return useCiclosGenerado(autoCargar);
};

export default useCiclos;
