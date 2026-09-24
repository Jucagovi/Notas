import { formatearNumeroUT } from '../../utils/formatoUT.js';

// Paleta cromática accesible para diferenciar visualmente cada Unidad de Trabajo en el calendario y Gantt.
export const PALETA_COLORES_UT = [
  { fondo: '#2563EB', texto: '#ffffff', nombre: 'Azul' },
  { fondo: '#059669', texto: '#ffffff', nombre: 'Esmeralda' },
  { fondo: '#D97706', texto: '#ffffff', nombre: 'Ámbar' },
  { fondo: '#7C3AED', texto: '#ffffff', nombre: 'Violeta' },
  { fondo: '#DB2777', texto: '#ffffff', nombre: 'Rosa' },
  { fondo: '#0891B2', texto: '#ffffff', nombre: 'Cian' },
  { fondo: '#EA580C', texto: '#ffffff', nombre: 'Naranja' },
  { fondo: '#0D9488', texto: '#ffffff', nombre: 'Teal' },
  { fondo: '#4F46E5', texto: '#ffffff', nombre: 'Índigo' },
  { fondo: '#65A30D', texto: '#ffffff', nombre: 'Lima' },
  { fondo: '#C026D3', texto: '#ffffff', nombre: 'Fucsia' },
  { fondo: '#0284C7', texto: '#ffffff', nombre: 'Azul Cielo' },
  { fondo: '#CA8A04', texto: '#ffffff', nombre: 'Dorado' },
  { fondo: '#9333EA', texto: '#ffffff', nombre: 'Púrpura' },
  { fondo: '#16A34A', texto: '#ffffff', nombre: 'Verde' },
  { fondo: '#475569', texto: '#ffffff', nombre: 'Pizarra' }
];

/**
 * gestorPropuestaFechas.js - Funciones matemáticas de partición y ajuste interactivo de fechas lectivas.
 *
 * Responsabilidad Única: Proveer funciones puras para calcular y recalcular las fronteras temporales
 * de las Unidades de Trabajo a partir de la lista de días lectivos y los límites asignados por el usuario.
 */

/**
 * Recalcula la lista de unidades propuestas y el mapa de fechas a partir de un array de índices de frontera.
 *
 * Cada frontera k (0 <= k < N - 1) representa el índice en diasClase del último día de la unidad k.
 * La unidad k + 1 comienza en el índice k + 1.
 *
 * @param {Array<number>} boundaries - Índices de corte en el array diasClase.
 * @param {Array<Object>} unidadesBase - Lista original de unidades de trabajo de la propuesta.
 * @param {Array<Object>} diasClase - Lista completa ordenada de días lectivos del curso.
 * @returns {Object} Objeto con las nuevas unidades, mapa de fechas y array de fronteras normalizado.
 */
export function recalcularPropuestaDesdeFronteras(boundaries, unidadesBase = [], diasClase = []) {
  const M = diasClase?.length || 0;
  const N = unidadesBase?.length || 0;

  if (M === 0 || N === 0) {
    return { unidades: [], mapaFechaUt: new Map(), boundaries: [] };
  }

  // Caso especial: Una sola unidad didáctica abarca todos los días lectivos disponibles.
  if (N === 1) {
    const u = unidadesBase[0];
    const fechaIni = diasClase[0].fechaISO;
    const fechaFin = diasClase[M - 1].fechaISO;
    const diasISO = diasClase.map((d) => d.fechaISO);
    const utFinal = {
      ...u,
      numDias: M,
      porcentaje: 100,
      fecha_ini_prevista: fechaIni,
      fecha_fin_prevista: fechaFin,
      diasISO
    };
    const mapa = new Map();
    diasISO.forEach((f) => {
      mapa.set(f, {
        id_ut: u.id_ut,
        orden: u.orden,
        numero: formatearNumeroUT(u.unidad_trabajo?.numero || u.orden),
        nombre: u.unidad_trabajo?.nombre || 'Unidad de Trabajo',
        color: u.color,
        fecha_ini_prevista: fechaIni,
        fecha_fin_prevista: fechaFin
      });
    });
    return { unidades: [utFinal], mapaFechaUt: mapa, boundaries: [] };
  }

  // Normalización estricta de las fronteras para garantizar que cada unidad conserve al menos un día lectivo.
  const limitesValidos = [...boundaries];

  // 1. Barrido hacia adelante para asegurar límites crecientes: boundaries[k] >= boundaries[k-1] + 1
  for (let k = 0; k < N - 1; k += 1) {
    const minK = k === 0 ? 0 : limitesValidos[k - 1] + 1;
    if (limitesValidos[k] === undefined || limitesValidos[k] < minK) {
      limitesValidos[k] = minK;
    }
  }

  // 2. Barrido hacia atrás para asegurar espacio suficiente para las unidades posteriores: boundaries[k] <= M - N + k
  for (let k = N - 2; k >= 0; k -= 1) {
    const maxK = k === N - 2 ? M - 2 : limitesValidos[k + 1] - 1;
    if (limitesValidos[k] > maxK) {
      limitesValidos[k] = maxK;
    }
  }

  // Re-validación hacia adelante tras el ajuste hacia atrás
  for (let k = 0; k < N - 1; k += 1) {
    const minK = k === 0 ? 0 : limitesValidos[k - 1] + 1;
    if (limitesValidos[k] < minK) {
      limitesValidos[k] = minK;
    }
  }

  const nuevasUnidades = [];
  const nuevoMapa = new Map();

  for (let i = 0; i < N; i += 1) {
    const base = unidadesBase[i];
    const startIdx = i === 0 ? 0 : limitesValidos[i - 1] + 1;
    const endIdx = i === N - 1 ? M - 1 : limitesValidos[i];

    const numDias = Math.max(1, endIdx - startIdx + 1);
    const porcentaje = Math.max(1, Math.round((numDias / M) * 100));
    const fechaIni = diasClase[startIdx]?.fechaISO || '';
    const fechaFin = diasClase[endIdx]?.fechaISO || '';
    const diasISO = diasClase.slice(startIdx, endIdx + 1).map((d) => d.fechaISO);

    const utObj = {
      ...base,
      numDias,
      porcentaje,
      fecha_ini_prevista: fechaIni,
      fecha_fin_prevista: fechaFin,
      diasISO
    };
    nuevasUnidades.push(utObj);

    diasISO.forEach((fISO) => {
      nuevoMapa.set(fISO, {
        id_ut: base.id_ut,
        orden: base.orden,
        numero: formatearNumeroUT(base.unidad_trabajo?.numero || base.orden),
        nombre: base.unidad_trabajo?.nombre || 'Unidad de Trabajo',
        color: base.color,
        fecha_ini_prevista: fechaIni,
        fecha_fin_prevista: fechaFin
      });
    });
  }

  return {
    unidades: nuevasUnidades,
    mapaFechaUt: nuevoMapa,
    boundaries: limitesValidos
  };
}

/**
 * Desplaza la duración de una unidad sumando o restando un día lectivo.
 */
export function ajustarDiasUnidad(boundaries, indiceUnidad, delta, unidadesBase, diasClase) {
  const N = unidadesBase?.length || 0;
  if (N <= 1) return { boundaries };

  const nuevosLimites = [...boundaries];

  if (indiceUnidad < N - 1) {
    // Se desplaza la frontera derecha de la unidad seleccionada
    nuevosLimites[indiceUnidad] += delta;
  } else if (indiceUnidad === N - 1) {
    // Si es la última unidad, se desplaza la frontera izquierda en dirección inversa
    nuevosLimites[N - 2] -= delta;
  }

  return recalcularPropuestaDesdeFronteras(nuevosLimites, unidadesBase, diasClase);
}

/**
 * Asigna un rango de días seleccionado con el ratón a una unidad específica.
 */
export function asignarRangoAUnidad(boundaries, indiceUnidad, startIdx, endIdx, unidadesBase, diasClase) {
  const N = unidadesBase?.length || 0;
  if (N <= 1) return { boundaries };

  const nuevosLimites = [...boundaries];
  const A = Math.min(startIdx, endIdx);
  const B = Math.max(startIdx, endIdx);

  // Se ajusta la frontera izquierda si la unidad no es la primera
  if (indiceUnidad > 0) {
    nuevosLimites[indiceUnidad - 1] = A - 1;
  }

  // Se ajusta la frontera derecha si la unidad no es la última
  if (indiceUnidad < N - 1) {
    nuevosLimites[indiceUnidad] = B;
  }

  return recalcularPropuestaDesdeFronteras(nuevosLimites, unidadesBase, diasClase);
}

/**
 * Ajusta el límite de una unidad al hacer clic sobre un día lectivo concreto.
 */
export function ajustarFronteraPorClick(boundaries, indiceUnidad, diaIdx, unidadesBase, diasClase) {
  const N = unidadesBase?.length || 0;
  const M = diasClase?.length || 0;
  if (N <= 1) return { boundaries };

  const startIdxActual = indiceUnidad === 0 ? 0 : boundaries[indiceUnidad - 1] + 1;
  const endIdxActual = indiceUnidad === N - 1 ? M - 1 : boundaries[indiceUnidad];

  const nuevosLimites = [...boundaries];

  if (diaIdx < startIdxActual) {
    // El usuario pulsó un día anterior al inicio: se adelanta el inicio de la unidad
    if (indiceUnidad > 0) {
      nuevosLimites[indiceUnidad - 1] = diaIdx - 1;
    }
  } else if (diaIdx > endIdxActual) {
    // El usuario pulsó un día posterior al fin: se posterga el fin de la unidad
    if (indiceUnidad < N - 1) {
      nuevosLimites[indiceUnidad] = diaIdx;
    }
  } else {
    // El día está dentro del rango actual: se acerca el extremo más próximo
    const distInicio = Math.abs(diaIdx - startIdxActual);
    const distFin = Math.abs(diaIdx - endIdxActual);

    if (distFin <= distInicio && indiceUnidad < N - 1) {
      nuevosLimites[indiceUnidad] = diaIdx;
    } else if (indiceUnidad > 0) {
      nuevosLimites[indiceUnidad - 1] = diaIdx - 1;
    }
  }

  return recalcularPropuestaDesdeFronteras(nuevosLimites, unidadesBase, diasClase);
}
