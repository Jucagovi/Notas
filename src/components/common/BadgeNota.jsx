import React from 'react';
import { Tag } from 'primereact/tag';
import { getSeverityNota } from '../../utils/coloresNotas.js';

/**
 * BadgeNota - Componente presentacional para mostrar calificaciones (0-100) en formato Tag.
 *
 * Responsabilidad Única: Renderizar una calificación numérica con el color semántico
 * estandarizado por el ERP según las franjas de notas oficiales.
 *
 * Franjas semánticas:
 * - < 50: danger (rojo)
 * - 50-59: warning (naranja)
 * - 60-69: info (amarillo/cian)
 * - 70-89: success (verde)
 * - 90-100: primary (azul)
 *
 * @param {Object} props
 * @param {number|string} props.nota - Calificación numérica de 0 a 100.
 * @param {boolean} [props.redondear=false] - Si es true, redondea el valor numérico al entero más cercano.
 * @param {string} [props.className=''] - Clases CSS adicionales.
 * @param {string} [props.textoSinNota='-'] - Texto cuando el valor no es numérico.
 */
export const BadgeNota = ({
  nota,
  redondear = false,
  className = '',
  textoSinNota = '-',
  ...restoProps
}) => {
  const valor = Number(nota);
  const esValido = !Number.isNaN(valor) && nota !== null && nota !== undefined && String(nota).trim() !== '';

  const severity = esValido ? getSeverityNota(valor) : null;
  const textoMostrado = esValido
    ? (redondear ? Math.round(valor) : valor)
    : textoSinNota;

  // PrimeReact Tag no siempre mapea 'primary' en temas sin customización CSS directa,
  // por lo que aseguramos la clase de PrimeFlex si es la franja sobresaliente.
  const claseColorExtra = severity === 'primary' ? 'bg-blue-500 text-white' : '';

  return (
    <Tag
      value={textoMostrado}
      severity={severity === 'primary' ? null : severity}
      className={`font-semibold text-sm ${claseColorExtra} ${className}`.trim()}
      {...restoProps}
    />
  );
};

export default BadgeNota;
