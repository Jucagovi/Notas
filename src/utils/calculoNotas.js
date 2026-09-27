/**
 * Utilidades puras para el cálculo y normalización de calificaciones según el caso de uso 05.
 *
 * Todas las funciones son puras (sin efectos secundarios ni dependencias del ciclo de vida de React).
 * Las calificaciones son estrictamente números enteros entre 0 y 100 sin decimales.
 */

/**
 * Calcula la nota trimestral normalizada de un alumno sobre 100 en base a los RA asignados a la evaluación.
 *
 * Algoritmo de normalización (Punto 3 del caso de uso 05):
 * 1. Rescatar los pesos de cada RA implicado en la evaluación desde ra_curso.
 * 2. Sumar los pesos de los RA implicados.
 * 3. Multiplicar la nota obtenida por el alumno en cada RA por su peso porcentual, sumar los resultados
 *    y dividir entre la suma total de los pesos (reescalado proporcional al 100%).
 * 4. Redondear al entero más próximo (0 - 100).
 *
 * @param {Object|Array} datosAlumno - Objeto o mapa con las calificaciones del alumno por RA.
 *                                      Puede tener formato { [id_ra]: nota } o { notasRA: { [id_ra]: nota } }
 *                                      o un array de objetos [{ id_ra, nota }].
 * @param {Array<Object>|Object} pesosRA - Listado de pesos de los RA asignados a la evaluación.
 *                                         Puede ser un array [{ id_ra, peso }] o mapa { [id_ra]: peso }.
 * @returns {number|null} - Calificación normalizada entera (0 a 100) o null si no hay datos suficientes.
 */
export const calcularNotaTrimestralNormalizada = (datosAlumno, pesosRA) => {
  if (!datosAlumno || !pesosRA) {
    return null;
  }

  // 1. Normalización de la estructura de pesos de los RA.
  const mapaPesos = new Map();
  if (Array.isArray(pesosRA)) {
    pesosRA.forEach((item) => {
      if (item && item.id_ra) {
        const pesoNumerico = Number(item.peso);
        if (!isNaN(pesoNumerico) && pesoNumerico > 0) {
          mapaPesos.set(item.id_ra, pesoNumerico);
        }
      }
    });
  } else if (typeof pesosRA === 'object') {
    Object.entries(pesosRA).forEach(([idRa, peso]) => {
      const pesoNumerico = Number(peso);
      if (!isNaN(pesoNumerico) && pesoNumerico > 0) {
        mapaPesos.set(idRa, pesoNumerico);
      }
    });
  }

  if (mapaPesos.size === 0) {
    return null;
  }

  // 2. Normalización de las notas del alumno por RA.
  const mapaNotas = new Map();
  if (Array.isArray(datosAlumno)) {
    datosAlumno.forEach((item) => {
      if (item && item.id_ra && item.nota !== undefined && item.nota !== null) {
        const notaNum = Number(item.nota);
        if (!isNaN(notaNum)) {
          mapaNotas.set(item.id_ra, notaNum);
        }
      }
    });
  } else if (datosAlumno.notasRA && typeof datosAlumno.notasRA === 'object') {
    Object.entries(datosAlumno.notasRA).forEach(([idRa, nota]) => {
      if (nota !== undefined && nota !== null) {
        const notaNum = Number(nota);
        if (!isNaN(notaNum)) {
          mapaNotas.set(idRa, notaNum);
        }
      }
    });
  } else if (typeof datosAlumno === 'object') {
    Object.entries(datosAlumno).forEach(([idRa, nota]) => {
      if (nota !== undefined && nota !== null && typeof nota !== 'object') {
        const notaNum = Number(nota);
        if (!isNaN(notaNum)) {
          mapaNotas.set(idRa, notaNum);
        }
      }
    });
  }

  // 3. Cálculo de la suma total de los pesos de los RA implicados en el trimestre.
  let sumaPesosTotales = 0;
  let sumaPonderada = 0;
  let cantidadNotasComputadas = 0;

  for (const [idRa, peso] of mapaPesos.entries()) {
    sumaPesosTotales += peso;

    if (mapaNotas.has(idRa)) {
      const nota = mapaNotas.get(idRa);
      sumaPonderada += nota * peso;
      cantidadNotasComputadas++;
    }
  }

  // Si no se asignó ningún peso o no hay ninguna nota registrada, se devuelve null.
  if (sumaPesosTotales <= 0 || cantidadNotasComputadas === 0) {
    return null;
  }

  // 4. Aplicación de la fórmula de reescalado al 100%.
  const notaNormalizada = Math.round(sumaPonderada / sumaPesosTotales);

  // Se asegura el rango estricto entre 0 y 100.
  return Math.min(100, Math.max(0, notaNormalizada));
};

/**
 * Calcula la nota final ordinaria del módulo mediante la suma ponderada global de todos los RA.
 *
 * @param {Object} notasPorRA - Mapa { [id_ra]: nota } con las calificaciones de todos los RA.
 * @param {Array<Object>} todosPesosRA - Listado de todos los RA del curso con sus pesos [{ id_ra, peso }].
 * @returns {number|null} - Calificación final entera (0 a 100) o null si no están todos los datos.
 */
export const calcularNotaFinalGlobal = (notasPorRA, todosPesosRA) => {
  if (!notasPorRA || !todosPesosRA || !Array.isArray(todosPesosRA) || todosPesosRA.length === 0) {
    return null;
  }

  let sumaPonderada = 0;
  let sumaPesos = 0;

  for (const item of todosPesosRA) {
    const peso = Number(item.peso) || 0;
    const nota = notasPorRA[item.id_ra];

    if (nota === undefined || nota === null) {
      // Se requiere que todos los RA evaluables tengan calificación para cerrar el acta ordinaria.
      return null;
    }

    sumaPonderada += Number(nota) * peso;
    sumaPesos += peso;
  }

  if (sumaPesos <= 0) return null;

  const notaFinal = Math.round(sumaPonderada / sumaPesos);
  return Math.min(100, Math.max(0, notaFinal));
};

/**
 * Determina si un discente debe habilitar el flujo de la Evaluación Extraordinaria.
 * Según la regla de negocio: se activa si la Evaluación Final tiene nota y es estrictamente menor a 50.
 *
 * @param {number|null|undefined} notaFinal - Calificación obtenida en la Evaluación Final Ordinaria.
 * @returns {boolean} - Verdadero si corresponde convocatoria extraordinaria.
 */
export const verificarEvaluacionExtraordinaria = (notaFinal) => {
  if (notaFinal === null || notaFinal === undefined || isNaN(Number(notaFinal))) {
    return false;
  }
  return Number(notaFinal) < 50;
};
