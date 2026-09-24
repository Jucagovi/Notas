/**
 * Formatea el número correlativo de una Unidad de Trabajo anteponiendo un cero
 * a la izquierda si el valor de la unidad es menor a 10 (por ejemplo, UT01).
 *
 * @param {number|string} numero - Número de la unidad de trabajo.
 * @returns {string} - Cadena formateada con UT01, UT02, UT10, etc.
 */
export const formatearNumeroUT = (numero) => {
  if (numero === null || numero === undefined || numero === '') return '';
  const num = Number(numero);
  if (isNaN(num)) return `UT${numero}`;
  return num < 10 ? `UT0${num}` : `UT${num}`;
};

export default formatearNumeroUT;
