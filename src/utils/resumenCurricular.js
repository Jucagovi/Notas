/**
 * Utilidad pura para el análisis y resumen curricular de actividades seleccionadas.
 *
 * Responsabilidad Única: Analizar las versiones (prácticas/exámenes) seleccionadas para una evaluación,
 * cruzar sus Criterios de Evaluación (CE) trabajados a través de la tabla `trabajan` y determinar
 * el porcentaje de cobertura de cada Resultado de Aprendizaje (RA) en tiempo real.
 */

/**
 * Analiza las versiones seleccionadas y calcula la cobertura de RAs y CEs.
 *
 * @param {Array<Object>} versionesSeleccionadas - Lista de versiones asignadas a la evaluación.
 * @param {Array<Object>} todosCE - Catálogo de Criterios de Evaluación del módulo.
 * @param {Array<Object>} todosRA - Catálogo de Resultados de Aprendizaje del módulo.
 * @param {Array<Object>} listaTrabajan - Relaciones entre versiones y CE con sus porcentajes.
 * @returns {Object} - Resumen con lista detallada por RA y texto formateado para el usuario.
 */
export const calcularResumenCurricular = (
  versionesSeleccionadas = [],
  todosCE = [],
  todosRA = [],
  listaTrabajan = []
) => {
  if (!Array.isArray(versionesSeleccionadas) || versionesSeleccionadas.length === 0) {
    return {
      coberturasRA: [],
      textoResumen: 'Esta evaluación aún no tiene actividades prácticas asignadas.',
      totalVersiones: 0,
      totalCEsCubiertos: 0
    };
  }

  // 1. Identificación de los IDs de versiones seleccionadas.
  const idsVersiones = new Set(
    versionesSeleccionadas.map((v) => v.id_version).filter(Boolean)
  );

  // 2. Filtrado de registros de la tabla `trabajan` correspondientes a las versiones activas.
  const mapaPorcentajePorCE = new Map();
  (listaTrabajan || []).forEach((t) => {
    if (idsVersiones.has(t.id_version) && t.id_ce) {
      const porcentajeActual = mapaPorcentajePorCE.get(t.id_ce) || 0;
      const incremento = Number(t.porcentaje) || 100;
      // Se acumula el porcentaje trabajado para cada criterio, con tope del 100%.
      mapaPorcentajePorCE.set(t.id_ce, Math.min(100, porcentajeActual + incremento));
    }
  });

  const cesTrabajadosIds = new Set(mapaPorcentajePorCE.keys());

  // 3. Agrupación y cálculo de cobertura por cada Resultado de Aprendizaje.
  const mapaCEsPorRA = new Map();
  (todosCE || []).forEach((ce) => {
    if (ce.id_ra) {
      if (!mapaCEsPorRA.has(ce.id_ra)) {
        mapaCEsPorRA.set(ce.id_ra, []);
      }
      mapaCEsPorRA.get(ce.id_ra).push(ce);
    }
  });

  const coberturasRA = [];

  (todosRA || []).forEach((ra) => {
    const cesDelRA = mapaCEsPorRA.get(ra.id_ra) || [];
    const totalCEs = cesDelRA.length;

    if (totalCEs === 0) {
      // Si el RA no tiene CEs desglosados, se verifica si alguna versión lo referencia directamente.
      const directo = versionesSeleccionadas.some(
        (v) => Array.isArray(v.raIdsVinculados) && v.raIdsVinculados.includes(ra.id_ra)
      );
      if (directo) {
        coberturasRA.push({
          id_ra: ra.id_ra,
          numero: ra.numero,
          codigo: `RA${ra.numero || '?'}`.trim(),
          nombre: ra.nombre || ra.descripcion || '',
          porcentaje: 100,
          cesCubiertos: 0,
          totalCEs: 0
        });
      }
      return;
    }

    // Se calcula la suma ponderada del porcentaje de cobertura de los CEs de este RA.
    let sumaPorcentajesCE = 0;
    let cantidadCubiertos = 0;

    cesDelRA.forEach((ce) => {
      const porcentajeCE = mapaPorcentajePorCE.get(ce.id_ce) || 0;
      if (porcentajeCE > 0) {
        sumaPorcentajesCE += porcentajeCE;
        cantidadCubiertos++;
      }
    });

    const porcentajeRA = Math.round(sumaPorcentajesCE / totalCEs);

    if (porcentajeRA > 0) {
      coberturasRA.push({
        id_ra: ra.id_ra,
        numero: ra.numero,
        codigo: `RA${ra.numero || '?'}`.trim(),
        nombre: ra.nombre || ra.descripcion || '',
        porcentaje: Math.min(100, porcentajeRA),
        cesCubiertos: cantidadCubiertos,
        totalCEs
      });
    }
  });

  // Ordenación por el número identificador del Resultado de Aprendizaje.
  coberturasRA.sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));

  // 4. Formateo de la frase descriptiva visual para el docente.
  // Ejemplo normativo: "Esta evaluación cubrirá el RA1 (100%), RA2 (45%) y RA3 (20%)".
  let textoResumen = '';
  if (coberturasRA.length === 0) {
    textoResumen = 'Las actividades seleccionadas aún no tienen Criterios de Evaluación (CE) vinculados.';
  } else {
    const fragmentos = coberturasRA.map((item) => `${item.codigo} (${item.porcentaje}%)`);
    if (fragmentos.length === 1) {
      textoResumen = `Esta evaluación cubrirá el ${fragmentos[0]}.`;
    } else {
      const ultimos = fragmentos.slice(0, -1).join(', ');
      const ultimo = fragmentos[fragmentos.length - 1];
      textoResumen = `Esta evaluación cubrirá el ${ultimos} y ${ultimo}.`;
    }
  }

  return {
    coberturasRA,
    textoResumen,
    totalVersiones: versionesSeleccionadas.length,
    totalCEsCubiertos: cesTrabajadosIds.size
  };
};

export default calcularResumenCurricular;
