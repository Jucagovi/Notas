import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { parsearFechaISO, formatearFechaISO, formatearFechaEspanol, extraerAnioInicioCurso } from '../utils/fechas.js';
import { formatearNumeroUT } from '../utils/formatoUT.js';

/**
 * Custom Hook para la generación y gestión del Informe de Seguimiento de Programaciones.
 *
 * Responsabilidad Única: Orquestar la obtención de datos curriculares y de temporización
 * mediante el hook genérico useDatos, calcular el cruce de fechas previstas frente a las
 * unidades realmente completadas para una evaluación o fecha de corte seleccionada,
 * y gestionar los textos cualitativos del docente.
 *
 * @param {string|null} [idCursoInicial=null] - Identificador único opcional del curso escolar.
 * @param {string|null} [idModuloInicial=null] - Identificador único opcional del módulo profesional.
 */
const useInformeSeguimiento = (idCursoInicial = null, idModuloInicial = null) => {
  // 1. Instancias aisladas del hook genérico useDatos para cada tabla requerida.
  const {
    obtenerDatos: obtenerCursos,
    cargando: cargandoCursos,
    error: errorCursos
  } = useDatos('Cursos');

  const {
    obtenerDatos: obtenerModulos,
    cargando: cargandoModulos,
    error: errorModulos
  } = useDatos('Modulos');

  const {
    obtenerDatos: obtenerTemporizacion,
    cargando: cargandoTemporizacion,
    error: errorTemporizacion
  } = useDatos('Temporizacion');

  const {
    obtenerDatos: obtenerUTs,
    cargando: cargandoUTs,
    error: errorUTs
  } = useDatos('Unidades_Trabajo');

  const {
    obtenerDatos: obtenerEvaluaciones,
    cargando: cargandoEvaluaciones,
    error: errorEvaluaciones
  } = useDatos('Evaluaciones');

  const {
    obtenerDatos: obtenerHorarios,
    cargando: cargandoHorarios,
    error: errorHorarios
  } = useDatos('Horarios');

  const {
    obtenerDatos: obtenerImparte,
    cargando: cargandoImparte,
    error: errorImparte
  } = useDatos('imparte');

  // Estados de datos maestros consultados de la base de datos.
  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [imparte, setImparte] = useState([]);
  const [temporizaciones, setTemporizaciones] = useState([]);
  const [unidadesTrabajo, setUnidadesTrabajo] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [horarios, setHorarios] = useState([]);

  // Estados de selección del docente.
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(idCursoInicial);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(idModuloInicial);
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(null);

  // Estados del editor cualitativo.
  const [fechaCorte, setFechaCorte] = useState(() => new Date());
  const [profesor, setProfesor] = useState('');
  const [observaciones, setObservaciones] = useState('El curso avanza de forma correcta y sin incidentes.');
  const [contenidosImpartidosTexto, setContenidosImpartidosTexto] = useState(
    'Durante este período se han impartido todos los contenidos programados con normalidad. No ha habido ningún problema ni se ha propuesto ninguna modificación.'
  );

  const [cargandoLocal, setCargandoLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  // 2. Consulta y carga inicial de catálogos base.
  const cargarCatalogosBase = useCallback(async () => {
    setCargandoLocal(true);
    setErrorLocal(null);
    try {
      const [
        datosCursos,
        datosModulos,
        datosImparte,
        datosUTs,
        datosEvaluaciones,
        datosHorarios
      ] = await Promise.all([
        obtenerCursos('*', (q) => q.order('anyo', { ascending: false })),
        obtenerModulos('*', (q) => q.order('nombre', { ascending: true })),
        obtenerImparte('id_curso, id_modulo'),
        obtenerUTs('*', (q) => q.order('numero', { ascending: true })),
        obtenerEvaluaciones('*', (q) => q.order('nombre', { ascending: true })),
        obtenerHorarios('*')
      ]);

      setCursos(datosCursos || []);
      setModulos(datosModulos || []);
      setImparte(datosImparte || []);
      setUnidadesTrabajo(datosUTs || []);
      setEvaluaciones(datosEvaluaciones || []);
      setHorarios(datosHorarios || []);
      return true;
    } catch (err) {
      console.error('Error al cargar datos base para el informe de seguimiento:', err);
      setErrorLocal(err?.message || 'Error al obtener catálogos de base de datos.');
      return false;
    } finally {
      setCargandoLocal(false);
    }
  }, [
    obtenerCursos,
    obtenerModulos,
    obtenerImparte,
    obtenerUTs,
    obtenerEvaluaciones,
    obtenerHorarios
  ]);

  useEffect(() => {
    cargarCatalogosBase();
  }, [cargarCatalogosBase]);

  // 3. Obtención y estructuración de los Años Académicos disponibles.
  const anios = useMemo(() => {
    const conjuntoAnios = new Set();
    const lista = [];

    (cursos || []).forEach((c) => {
      const anioInicio = extraerAnioInicioCurso(c);
      if (anioInicio && !conjuntoAnios.has(anioInicio)) {
        conjuntoAnios.add(anioInicio);
        lista.push({
          label: `${anioInicio}/${anioInicio + 1}`,
          value: anioInicio
        });
      }
    });

    lista.sort((a, b) => b.value - a.value);

    // En caso de ausencia de registros se provee el año escolar en curso.
    if (lista.length === 0) {
      const hoy = new Date();
      const anioBase = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
      lista.push({
        label: `${anioBase}/${anioBase + 1}`,
        value: anioBase
      });
    }

    return lista;
  }, [cursos]);

  // Autoselección inicial del año académico activo.
  useEffect(() => {
    if (!anioSeleccionado && anios.length > 0) {
      setAnioSeleccionado(anios[0].value);
    }
  }, [anios, anioSeleccionado]);

  // 4. Filtrado de Cursos correspondientes al año académico seleccionado.
  const cursosFiltrados = useMemo(() => {
    if (!anioSeleccionado) return cursos;
    return (cursos || []).filter((c) => {
      const anioInicio = extraerAnioInicioCurso(c);
      return anioInicio === anioSeleccionado;
    });
  }, [cursos, anioSeleccionado]);

  // Autoselección reactiva de curso si el actual no pertenece al año seleccionado.
  useEffect(() => {
    if (cursosFiltrados.length > 0) {
      const existe = cursosFiltrados.some((c) => c.id_curso === cursoSeleccionadoId);
      if (!existe) {
        setCursoSeleccionadoId(cursosFiltrados[0].id_curso);
      }
    } else {
      setCursoSeleccionadoId(null);
    }
  }, [cursosFiltrados, cursoSeleccionadoId]);

  // Curso activo seleccionado.
  const cursoActivo = useMemo(() => {
    return (cursos || []).find((c) => c.id_curso === cursoSeleccionadoId) || null;
  }, [cursos, cursoSeleccionadoId]);

  // Año académico en formato completo legible (ej. '2026/2027').
  const anioAcademicoTexto = useMemo(() => {
    if (cursoActivo && cursoActivo.anyo) {
      return String(cursoActivo.anyo).trim();
    }
    if (anioSeleccionado) {
      return `${anioSeleccionado}/${anioSeleccionado + 1}`;
    }
    return '2026/2027';
  }, [cursoActivo, anioSeleccionado]);

  // 5. Determinación automática del Módulo profesional asociado al Curso seleccionado.
  // Regla de Negocio: Cada curso está vinculado a su módulo correspondiente; no se precisa Dropdown manual.
  useEffect(() => {
    if (!cursoSeleccionadoId) {
      setModuloSeleccionadoId(null);
      return;
    }

    // 5.1. Búsqueda prioritaria en Temporizacion cruzando con Unidades de Trabajo.
    const tempDelCurso = (temporizaciones || []).find((t) => t.id_curso === cursoSeleccionadoId);
    if (tempDelCurso) {
      const utCorrespondiente = (unidadesTrabajo || []).find((u) => u.id_ut === tempDelCurso.id_ut);
      if (utCorrespondiente && utCorrespondiente.id_modulo) {
        setModuloSeleccionadoId(utCorrespondiente.id_modulo);
        return;
      }
    }

    // 5.2. Búsqueda en la tabla imparte.
    const relacionImparte = (imparte || []).find((rel) => rel.id_curso === cursoSeleccionadoId && rel.id_modulo);
    if (relacionImparte) {
      setModuloSeleccionadoId(relacionImparte.id_modulo);
      return;
    }

    // 5.3. Búsqueda en Horarios.
    const horarioCurso = (horarios || []).find((h) => h.id_curso === cursoSeleccionadoId && h.id_modulo);
    if (horarioCurso) {
      setModuloSeleccionadoId(horarioCurso.id_modulo);
      return;
    }

    // 5.4. Búsqueda en Evaluaciones.
    const evalCurso = (evaluaciones || []).find((e) => e.id_curso === cursoSeleccionadoId && e.id_modulo);
    if (evalCurso) {
      setModuloSeleccionadoId(evalCurso.id_modulo);
      return;
    }

    // 5.5. Búsqueda por módulo flexibilizado en el curso.
    if (cursoActivo && cursoActivo.id_modulo_flexible) {
      setModuloSeleccionadoId(cursoActivo.id_modulo_flexible);
      return;
    }

    // 5.6. Si no hay relación explícita previa, se toma el primer módulo disponible como respaldo.
    if (modulos && modulos.length > 0) {
      setModuloSeleccionadoId(modulos[0].id_modulo);
    }
  }, [
    cursoSeleccionadoId,
    temporizaciones,
    unidadesTrabajo,
    imparte,
    horarios,
    evaluaciones,
    cursoActivo,
    modulos
  ]);

  // Módulo activo seleccionado automáticamente.
  const moduloActivo = useMemo(() => {
    return (modulos || []).find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  }, [modulos, moduloSeleccionadoId]);

  // 6. Detección automática del nombre del profesor a partir de Horarios o configuración.
  useEffect(() => {
    if (cursoSeleccionadoId && moduloSeleccionadoId && horarios.length > 0) {
      const horarioCoincidente = horarios.find(
        (h) => h.id_curso === cursoSeleccionadoId && h.id_modulo === moduloSeleccionadoId && h.profesor
      );
      if (horarioCoincidente && horarioCoincidente.profesor) {
        const p = horarioCoincidente.profesor.trim();
        if (p && !p.toLowerCase().includes('docente')) {
          setProfesor(p);
          return;
        }
      }
    }

    // Si no consta un nombre concreto en horarios y el campo está vacío, se asigna valor por defecto.
    setProfesor((prev) => (prev ? prev : 'Docente titular'));
  }, [cursoSeleccionadoId, moduloSeleccionadoId, horarios]);

  // 7. Consulta de los registros de Temporización para el curso activo.
  const cargarTemporizacionesCurso = useCallback(async () => {
    if (!cursoSeleccionadoId) {
      setTemporizaciones([]);
      return [];
    }

    try {
      const datos = await obtenerTemporizacion('*', (q) =>
        q.eq('id_curso', cursoSeleccionadoId).order('orden', { ascending: true })
      );
      setTemporizaciones(datos || []);
      return datos || [];
    } catch (err) {
      console.error('Error al cargar temporizaciones:', err);
      return [];
    }
  }, [cursoSeleccionadoId, obtenerTemporizacion]);

  useEffect(() => {
    if (cursoSeleccionadoId) {
      cargarTemporizacionesCurso();
    }
  }, [cursoSeleccionadoId, cargarTemporizacionesCurso]);

  // 8. Opciones de evaluación disponibles para el curso y módulo seleccionados.
  const evaluacionesDisponibles = useMemo(() => {
    const lista = (evaluaciones || []).filter((ev) => {
      const coincideCurso = ev.id_curso === cursoSeleccionadoId;
      const coincideModulo = !ev.id_modulo || ev.id_modulo === moduloSeleccionadoId;
      return coincideCurso && coincideModulo;
    });

    if (lista.length > 0) {
      return lista;
    }

    // Si no existen evaluaciones configuradas explícitamente en base de datos,
    // se proveen las 3 evaluaciones reglamentarias estándar con fechas por defecto.
    const anioInicio = anioSeleccionado || new Date().getFullYear();
    return [
      {
        id_evaluacion: '1eval',
        nombre: '1ª EVALUACIÓN',
        fecha_ini: `${anioInicio}-09-01`,
        fecha_fin: `${anioInicio}-12-22`
      },
      {
        id_evaluacion: '2eval',
        nombre: '2ª EVALUACIÓN',
        fecha_ini: `${anioInicio + 1}-01-08`,
        fecha_fin: `${anioInicio + 1}-03-31`
      },
      {
        id_evaluacion: '3eval',
        nombre: '3ª EVALUACIÓN',
        fecha_ini: `${anioInicio + 1}-04-01`,
        fecha_fin: `${anioInicio + 1}-06-23`
      }
    ];
  }, [evaluaciones, cursoSeleccionadoId, moduloSeleccionadoId, anioSeleccionado]);

  // Autoselección inicial de la evaluación activa.
  useEffect(() => {
    if (evaluacionesDisponibles.length > 0) {
      const existe = evaluacionesDisponibles.some((e) => e.id_evaluacion === evaluacionSeleccionadaId);
      if (!existe) {
        setEvaluacionSeleccionadaId(evaluacionesDisponibles[0].id_evaluacion);
      }
    }
  }, [evaluacionesDisponibles, evaluacionSeleccionadaId]);

  // Evaluación seleccionada activa.
  const evaluacionActiva = useMemo(() => {
    return (
      evaluacionesDisponibles.find((e) => e.id_evaluacion === evaluacionSeleccionadaId) ||
      evaluacionesDisponibles[0] ||
      null
    );
  }, [evaluacionesDisponibles, evaluacionSeleccionadaId]);

  // 9. Consolidación de las Unidades de Trabajo del módulo con sus fechas y estados de Temporización.
  const unidadesConsolidadas = useMemo(() => {
    if (!moduloSeleccionadoId || !unidadesTrabajo) return [];

    const utsDelModulo = unidadesTrabajo.filter((u) => u.id_modulo === moduloSeleccionadoId);
    const mapaTempoPorUt = new Map();
    (temporizaciones || []).forEach((t) => {
      mapaTempoPorUt.set(t.id_ut, t);
    });

    return utsDelModulo.map((ut) => {
      const temp = mapaTempoPorUt.get(ut.id_ut) || {};
      const orden = Number(temp.orden) || Number(ut.numero) || 1;
      const numUT = formatearNumeroUT(ut.numero || orden);
      const estado = temp.estado || 'Pendiente';
      const esCompletada = estado === 'Completada';

      return {
        id_ut: ut.id_ut,
        id_temporizacion: temp.id_temporizacion || null,
        numero: ut.numero,
        numUT,
        orden,
        nombre: ut.nombre || 'Unidad de Trabajo',
        nombreUT: ut.nombre || 'Unidad de Trabajo',
        descripcion: ut.descripcion || '',
        descripcionUT: ut.descripcion || '',
        fecha_ini_prevista: temp.fecha_ini_prevista || null,
        fecha_fin_prevista: temp.fecha_fin_prevista || null,
        fecha_ini_real: temp.fecha_ini_real || null,
        fecha_fin_real: temp.fecha_fin_real || null,
        estado,
        esCompletada,
        observaciones: temp.observaciones || ''
      };
    }).sort((a, b) => a.orden - b.orden);
  }, [moduloSeleccionadoId, unidadesTrabajo, temporizaciones]);

  // 10. Regla de Negocio: Cálculo de Rango y separación de Contenidos Programados vs Impartidos.
  // Se cruza la fecha de corte seleccionada y el rango de la evaluación activa.
  const fechaCorteISO = useMemo(() => {
    if (!fechaCorte) return '';
    return formatearFechaISO(fechaCorte);
  }, [fechaCorte]);

  const fechaCorteTexto = useMemo(() => {
    if (!fechaCorte) return '';
    const fechaEsp = formatearFechaEspanol(fechaCorte);
    return `Hasta ${fechaEsp}`;
  }, [fechaCorte]);

  // Contenidos Programados: Unidades cuya fecha_fin_prevista es <= fechaCorte o cae en el rango evaluativo.
  const contenidosProgramados = useMemo(() => {
    if (unidadesConsolidadas.length === 0) return [];

    // Si existen fechas previstas configuradas en las unidades, se filtra por la fecha de corte o evaluación.
    const tienenFechas = unidadesConsolidadas.some((u) => Boolean(u.fecha_fin_prevista));

    if (tienenFechas && fechaCorteISO) {
      const filtradas = unidadesConsolidadas.filter((u) => {
        if (!u.fecha_fin_prevista) return false;
        return u.fecha_fin_prevista <= fechaCorteISO;
      });

      // Si el filtro de corte devuelve elementos, se emplean; si no, se devuelve la primera unidad.
      if (filtradas.length > 0) return filtradas;
    }

    // Si no cuentan con fechas específicas o no hay coincidencias exactas, se muestran las unidades del bloque.
    return unidadesConsolidadas;
  }, [unidadesConsolidadas, fechaCorteISO]);

  // Contenidos Impartidos: Unidades programadas cuyo estado es 'Completada'.
  const contenidosImpartidos = useMemo(() => {
    return contenidosProgramados.filter((u) => u.esCompletada);
  }, [contenidosProgramados]);

  // Actualización sugerida de textos según el resultado del contraste.
  useEffect(() => {
    if (contenidosProgramados.length > 0) {
      if (contenidosImpartidos.length === contenidosProgramados.length) {
        setContenidosImpartidosTexto(
          'Durante este período se han impartido todos los contenidos programados con normalidad. No ha habido ningún problema ni se ha propuesto ninguna modificación.'
        );
      } else if (contenidosImpartidos.length > 0) {
        const nombres = contenidosImpartidos.map((u) => u.numUT).join(', ');
        setContenidosImpartidosTexto(
          `Durante este período se han impartido las unidades ${nombres}. El resto de contenidos programados continúan en desarrollo según lo planificado.`
        );
      } else {
        setContenidosImpartidosTexto(
          'Durante este período se ha comenzado el desarrollo de los contenidos programados según el ritmo curricular previsto.'
        );
      }
    }
  }, [contenidosProgramados, contenidosImpartidos]);

  // Recarga manual de todos los orígenes de datos.
  const recargar = useCallback(async () => {
    await cargarCatalogosBase();
    if (cursoSeleccionadoId) {
      await cargarTemporizacionesCurso();
    }
  }, [cargarCatalogosBase, cursoSeleccionadoId, cargarTemporizacionesCurso]);

  const cargando =
    cargandoCursos ||
    cargandoModulos ||
    cargandoTemporizacion ||
    cargandoUTs ||
    cargandoEvaluaciones ||
    cargandoHorarios ||
    cargandoImparte ||
    cargandoLocal;

  const error =
    errorCursos ||
    errorModulos ||
    errorTemporizacion ||
    errorUTs ||
    errorEvaluaciones ||
    errorHorarios ||
    errorImparte ||
    errorLocal;

  return {
    // Filtros y selectores
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    anioAcademicoTexto,
    cursos: cursosFiltrados,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoActivo,
    modulos,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloActivo,
    evaluaciones: evaluacionesDisponibles,
    evaluacionSeleccionadaId,
    setEvaluacionSeleccionadaId,
    evaluacionActiva,

    // Editor cualitativo y metadatos
    profesor,
    setProfesor,
    fechaCorte,
    setFechaCorte,
    fechaCorteTexto,
    observaciones,
    setObservaciones,
    contenidosImpartidosTexto,
    setContenidosImpartidosTexto,

    // Datos del informe de seguimiento
    todasLasUnidades: unidadesConsolidadas,
    contenidosProgramados,
    contenidosImpartidos,

    // Estados de comunicación
    cargando,
    error,
    recargar
  };
};

export default useInformeSeguimiento;
