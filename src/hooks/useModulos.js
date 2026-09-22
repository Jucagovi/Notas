import { crearHookTabla } from './crearHookTabla.js';

// Custom Hook para gestionar el mantenimiento de Módulos Profesionales.
const useModulosGenerado = crearHookTabla('Modulos', 'id_modulo', { columna: 'nombre', ascendente: true });

const useModulos = (autoCargar = true) => {
  return useModulosGenerado(autoCargar);
};

export default useModulos;
