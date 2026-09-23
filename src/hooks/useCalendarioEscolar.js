import useCalendario from './useCalendario.js';

/**
 * useCalendarioEscolar - Hook adaptador de compatibilidad para useCalendario.
 *
 * Responsabilidad Única: Exponer la funcionalidad del hook useCalendario manteniendo
 * compatibilidad hacia atrás con cualquier importación previa.
 */
export const useCalendarioEscolar = (cursoId) => {
  return useCalendario(cursoId);
};

export default useCalendarioEscolar;
