import { useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { parsearFechaISO, extraerAnioInicioCurso } from '../utils/fechas.js';

/**
 * Comprueba con rigor si un curso pertenece a un año escolar numérico específico (ej. 2026 para 2026/2027).
 *
 * Se descartan falsos positivos producidos por coincidencias parciales de texto (como que "2025/2026" coincida con 2026).
 *
 * @param {Object} curso - Registro del curso.
 * @param {number|string|null} anio - Año de inicio del curso lectivo (ej. 2026).
 * @returns {boolean} Verdadero si el curso pertenece estrictamente al año académico indicado.
 */
const cursoPerteneceAlAnio = (curso, anio) => {
  if (!curso || anio === null || anio === undefined) return true;
  const anioNum = Number(anio);
  if (isNaN(anioNum)) return true;

  // 1. Comprobación prioritaria por la denominación del campo anyo.
  if (curso.anyo) {
    const anyoStr = String(curso.anyo).trim();

    // Formato canónico YYYY/YYYY o YYYY-YYYY (ej. "2026/2027", "2026-2027"): debe empezar por el año de inicio.
    const matchRango = anyoStr.match(/^(\d{4})[\/\-](\d{4})$/);
    if (matchRango) {
      return Number(matchRango[1]) === anioNum;
    }

    // Formato de año numérico individual de 4 dígitos (ej. "2026").
    const matchCuatro = anyoStr.match(/^\b(20\d{2})\b$/);
    if (matchCuatro) {
      return Number(matchCuatro[1]) === anioNum;
    }

    // Formato abreviado de dos dígitos YY/YY (ej. "26/27").
    const matchCorto = anyoStr.match(/^(\d{2})[\/\-](\d{2})$/);
    if (matchCorto) {
      return Number(matchCorto[1]) === (anioNum % 100);
    }

    // Extracción estándar del primer año de 4 dígitos si contiene texto compuesto.
    const matchGeneral = anyoStr.match(/\b(20\d{2})\b/);
    if (matchGeneral) {
      return Number(matchGeneral[1]) === anioNum;
    }
  }

  // 2. Comprobación por fecha oficial de inicio de curso (agosto/septiembre marca el inicio del año).
  if (curso.fecha_inicio) {
    const fInicio = parsearFechaISO(curso.fecha_inicio);
    if (fInicio && !isNaN(fInicio.getTime())) {
      const anioF = fInicio.getFullYear();
      const mesF = fInicio.getMonth(); // 0-indexado: 0 = enero, 7 = agosto, 8 = septiembre.
      const anioCalculado = mesF < 7 ? anioF - 1 : anioF;
      return anioCalculado === anioNum;
    }
  }

  // 3. Comprobación por fecha de creación en base de datos en ausencia de otros datos explícitos.
  if (curso.created_at) {
    const fCreacion = new Date(curso.created_at);
    if (!isNaN(fCreacion.getTime())) {
      const anioC = fCreacion.getFullYear();
      const mesC = fCreacion.getMonth();
      const anioCalculado = mesC < 7 ? anioC - 1 : anioC;
      return anioCalculado === anioNum;
    }
  }

  return false;
};

/**
 * Custom Hook para la obtención y estructuración del listado de Clases disponibles.
 *
 * Responsabilidad Única: Consultar las entidades Cursos y Modulos junto a sus relaciones en
 * imparte (donde se encuentran matriculados los discentes) y Evaluaciones para construir el catálogo
 * unívoco de clases (binomio curso escolar y módulo profesional) preparado para SelectorClase,
 * filtrando estrictamente por el año académico activo cuando se proporciona.
 *
 * @param {number|string|null} [anioFiltro=null] - Año de inicio del curso académico para filtrar (ej. 2026).
 */
const useClases = (anioFiltro = null) => {
  const {
    datos: cursos,
    cargando: cargandoCursos,
    error: errorCursos,
    obtenerDatos: obtenerCursos
  } = useDatos('Cursos');

  const {
    datos: modulos,
    cargando: cargandoModulos,
    error: errorModulos,
    obtenerDatos: obtenerModulos
  } = useDatos('Modulos');

  const {
    datos: imparte,
    cargando: cargandoImparte,
    error: errorImparte,
    obtenerDatos: obtenerImparte
  } = useDatos('imparte');

  const {
    datos: evaluaciones,
    cargando: cargandoEvaluaciones,
    error: errorEvaluaciones,
    obtenerDatos: obtenerEvaluaciones
  } = useDatos('Evaluaciones');

  // Consulta de datos de entidades maestras y relaciones al inicializar o recargar.
  const recargar = useCallback(async () => {
    await Promise.all([
      obtenerCursos(),
      obtenerModulos(),
      obtenerImparte('id_curso, id_modulo, id_discente'),
      obtenerEvaluaciones('id_curso, id_modulo')
    ]);
  }, [
    obtenerCursos,
    obtenerModulos,
    obtenerImparte,
    obtenerEvaluaciones
  ]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Construcción del catálogo consolidado de clases filtradas por el año académico activo.
  const clases = useMemo(() => {
    const mapaClases = new Map();

    // 1. Filtrado riguroso de cursos pertenecientes al año académico seleccionado.
    const listaCursos = (cursos || []).filter((c) =>
      anioFiltro ? cursoPerteneceAlAnio(c, anioFiltro) : true
    );
    const mapaCursos = new Map(listaCursos.map((c) => [c.id_curso, c]));
    const idsCursosValidos = new Set(listaCursos.map((c) => c.id_curso));

    const listaModulos = modulos || [];
    const mapaModulos = new Map(listaModulos.map((m) => [m.id_modulo, m]));

    // 2. Se obtienen las clases a partir de las matrículas existentes en la tabla imparte
    // (donde los discentes están creados y asignados al binomio curso escolar y módulo).
    const paresImparte = [];
    (imparte || []).forEach((rel) => {
      if (rel.id_curso && rel.id_modulo && idsCursosValidos.has(rel.id_curso)) {
        paresImparte.push({ id_curso: rel.id_curso, id_modulo: rel.id_modulo });
      }
    });

    // Se priorizan estrictamente las clases que cuentan con discentes matriculados en imparte.
    // Solo si no existe ninguna matrícula en imparte para los cursos de ese año escolar,
    // se emplean como respaldo excepcional las clases configuradas en Evaluaciones.
    let paresSeleccionados = paresImparte;
    if (paresSeleccionados.length === 0 && evaluaciones && evaluaciones.length > 0) {
      const paresEvaluaciones = [];
      evaluaciones.forEach((rel) => {
        if (rel.id_curso && rel.id_modulo && idsCursosValidos.has(rel.id_curso)) {
          paresEvaluaciones.push({ id_curso: rel.id_curso, id_modulo: rel.id_modulo });
        }
      });
      paresSeleccionados = paresEvaluaciones;
    }

    // 3. Se insertan las clases identificadas de forma unívoca en el catálogo.
    paresSeleccionados.forEach(({ id_curso, id_modulo }) => {
      const clave = `${id_curso}_${id_modulo}`;
      if (!mapaClases.has(clave)) {
        const c = mapaCursos.get(id_curso);
        const m = mapaModulos.get(id_modulo);
        if (c && m) {
          const anioInicio = extraerAnioInicioCurso(c);
          const idModuloFlexible = c.id_modulo_flexible || null;
          const moduloFlexibleObj = idModuloFlexible ? (mapaModulos.get(idModuloFlexible) || null) : null;

          mapaClases.set(clave, {
            id: clave,
            id_curso,
            id_modulo,
            cursoNombre: c.nombre,
            cursoAnyo: c.anyo || '',
            cursoCentro: c.centro || '',
            moduloNombre: m.nombre,
            moduloSiglas: m.siglas || '',
            moduloObj: m,
            cursoObj: c,
            id_modulo_flexible: idModuloFlexible,
            id_modulo_flexibilizado: idModuloFlexible,
            moduloFlexibleObj,
            moduloFlexibleNombre: moduloFlexibleObj?.nombre || null,
            moduloFlexibleSiglas: moduloFlexibleObj?.siglas || null,
            esFlexibilizado: Boolean(idModuloFlexible),
            anioInicio,
            anioCompleto: anioInicio ? `${anioInicio}/${anioInicio + 1}` : (c.anyo || ''),
            etiqueta: `${c.nombre} — ${m.siglas ? `${m.siglas}: ` : ''}${m.nombre}`
          });
        }
      }
    });

    // 4. Ordenación alfabética por nombre de curso y nombre de módulo.
    const listaOrdenada = Array.from(mapaClases.values());
    listaOrdenada.sort((a, b) =>
      a.cursoNombre.localeCompare(b.cursoNombre) ||
      a.moduloNombre.localeCompare(b.moduloNombre)
    );
    return listaOrdenada;
  }, [
    cursos,
    modulos,
    imparte,
    evaluaciones,
    anioFiltro
  ]);

  const cargando =
    cargandoCursos ||
    cargandoModulos ||
    cargandoImparte ||
    cargandoEvaluaciones;

  const error =
    errorCursos ||
    errorModulos ||
    errorImparte ||
    errorEvaluaciones;

  return {
    clases,
    cargando,
    error,
    recargar
  };
};

export default useClases;
