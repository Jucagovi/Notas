import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento del Banco de Prácticas Maestro.
const usePracticasGenerado = crearHookTabla('Practicas', 'id_practica', { columna: 'nombre', ascendente: true });

const usePracticas = (autoCargar = true) => {
  return usePracticasGenerado(autoCargar);
};

export default usePracticas;
