import { supabase } from './supabaseClient.js';

// Se procesan y computan las métricas estadísticas del panel de control a partir de los datos de la base de datos
export const procesarEstadisticas = (
  arg1 = [],
  arg2 = [],
  arg3 = [],
  arg4 = [],
  arg5 = [],
  arg6 = null
) => {
  // Se normalizan los argumentos admitiendo tanto formato de objeto como parámetros posicionales
  let listaDiscentes = [];
  let listaModulos = [];
  let listaCalificaciones = [];
  let listaEvaluaciones = [];
  let listaImparte = [];
  let idCurso = null;

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    listaDiscentes = Array.isArray(arg1.listaDiscentes) ? arg1.listaDiscentes : [];
    listaModulos = Array.isArray(arg1.listaModulos) ? arg1.listaModulos : [];
    listaCalificaciones = Array.isArray(arg1.listaCalificaciones) ? arg1.listaCalificaciones : [];
    listaEvaluaciones = Array.isArray(arg1.listaEvaluaciones) ? arg1.listaEvaluaciones : [];
    listaImparte = Array.isArray(arg1.listaImparte) ? arg1.listaImparte : [];
    idCurso = arg1.idCurso || null;
  } else {
    listaDiscentes = Array.isArray(arg1) ? arg1 : [];
    listaModulos = Array.isArray(arg2) ? arg2 : [];
    listaCalificaciones = Array.isArray(arg3) ? arg3 : [];
    listaEvaluaciones = Array.isArray(arg4) ? arg4 : [];
    listaImparte = Array.isArray(arg5) ? arg5 : [];
    idCurso = arg6 || null;
  }

  // Se filtran las evaluaciones correspondientes al curso seleccionado
  const evaluacionesFiltradas = idCurso
    ? listaEvaluaciones.filter((ev) => ev && ev.id_curso === idCurso)
    : listaEvaluaciones;

  const conjuntoIdsEvaluaciones = new Set(
    evaluacionesFiltradas.map((ev) => ev.id_evaluacion).filter(Boolean)
  );

  // Se crea un mapa auxiliar para relacionar cada evaluación con su módulo
  const mapaEvaluacionModulo = new Map();
  (listaEvaluaciones || []).forEach((ev) => {
    if (ev && ev.id_evaluacion && ev.id_modulo) {
      mapaEvaluacionModulo.set(ev.id_evaluacion, ev.id_modulo);
    }
  });

  // Se filtran los registros de asignación docente y matrículas en la tabla imparte
  const imparteFiltrado = idCurso
    ? listaImparte.filter((imp) => imp && imp.id_curso === idCurso)
    : listaImparte;

  const conjuntoIdsDiscentesImparte = new Set(
    imparteFiltrado.map((imp) => imp.id_discente).filter(Boolean)
  );
  const conjuntoIdsModulosImparte = new Set(
    imparteFiltrado.map((imp) => imp.id_modulo).filter(Boolean)
  );

  // Se determinan los módulos activos correspondientes al curso seleccionado
  const conjuntoIdsModulosCurso = idCurso
    ? new Set([
        ...conjuntoIdsModulosImparte,
        ...evaluacionesFiltradas.map((ev) => ev.id_modulo).filter(Boolean)
      ])
    : null;

  const modulosFiltrados = idCurso
    ? listaModulos.filter((m) => m && conjuntoIdsModulosCurso.has(m.id_modulo))
    : listaModulos;

  const totalModulos = modulosFiltrados.length;

  // Se filtran las calificaciones que pertenecen al curso y contienen un valor numérico válido
  const calificacionesFiltradas = listaCalificaciones.filter((item) => {
    if (!item) return false;

    if (idCurso) {
      const esDelCurso =
        (item.Evaluaciones && item.Evaluaciones.id_curso === idCurso) ||
        (item.id_evaluacion && conjuntoIdsEvaluaciones.has(item.id_evaluacion)) ||
        item.id_curso === idCurso;

      if (!esDelCurso) return false;
    }

    return (
      item.nota !== null &&
      item.nota !== undefined &&
      item.nota !== '' &&
      !isNaN(Number(item.nota))
    );
  });

  const totalCalificaciones = calificacionesFiltradas.length;

  // Se determinan los discentes matriculados o evaluados en el curso seleccionado
  let discentesFiltrados = [];
  if (idCurso) {
    const conjuntoIdsDiscentesCurso = new Set([
      ...conjuntoIdsDiscentesImparte,
      ...calificacionesFiltradas.map((c) => c.id_discente).filter(Boolean)
    ]);
    discentesFiltrados = listaDiscentes.filter(
      (d) => d && conjuntoIdsDiscentesCurso.has(d.id_discente)
    );
  } else {
    discentesFiltrados = listaDiscentes;
  }

  const totalAlumnos = discentesFiltrados.length;

  // Se calcula la nota media global de las calificaciones analizadas
  let notaMediaGlobal = null;
  if (totalCalificaciones > 0) {
    const sumaNotas = calificacionesFiltradas.reduce(
      (acumulador, actual) => acumulador + Number(actual.nota),
      0
    );
    notaMediaGlobal = Number((sumaNotas / totalCalificaciones).toFixed(2));
  }

  // Se contabiliza la distribución de calificaciones por tramos oficiales
  let suspensos = 0;
  let aprobados = 0;
  let notables = 0;
  let sobresalientes = 0;

  calificacionesFiltradas.forEach((calif) => {
    const nota = Number(calif.nota);
    if (nota < 50) {
      suspensos += 1;
    } else if (nota < 70) {
      aprobados += 1;
    } else if (nota < 90) {
      notables += 1;
    } else {
      sobresalientes += 1;
    }
  });

  const totalAprobadas = aprobados + notables + sobresalientes;
  const tasaAprobados =
    totalCalificaciones > 0
      ? Number(((totalAprobadas / totalCalificaciones) * 100).toFixed(2))
      : null;

  // Se inicializa el mapa de notas medias por módulo
  const modulosMap = new Map();
  modulosFiltrados.forEach((mod) => {
    if (mod && mod.id_modulo) {
      modulosMap.set(mod.id_modulo, {
        id_modulo: mod.id_modulo,
        nombre: mod.nombre || 'Sin nombre',
        siglas: mod.siglas || mod.nombre || 'MOD',
        suma: 0,
        total: 0
      });
    }
  });

  calificacionesFiltradas.forEach((calif) => {
    const moduloId =
      calif.id_modulo ||
      (calif.Practicas && calif.Practicas.id_modulo) ||
      (calif.Evaluaciones && calif.Evaluaciones.id_modulo) ||
      mapaEvaluacionModulo.get(calif.id_evaluacion);

    if (moduloId && modulosMap.has(moduloId)) {
      const itemMod = modulosMap.get(moduloId);
      itemMod.suma += Number(calif.nota);
      itemMod.total += 1;
    }
  });

  const mediasPorModulo = Array.from(modulosMap.values()).map((m) => ({
    id_modulo: m.id_modulo,
    nombre: m.nombre,
    siglas: m.siglas,
    media: m.total > 0 ? Number((m.suma / m.total).toFixed(2)) : null,
    totalCalificaciones: m.total
  }));

  // Se identifican discentes en situación de riesgo dentro del ámbito del curso analizado
  const alumnosRiesgoList = [];

  discentesFiltrados.forEach((alumno) => {
    if (!alumno || !alumno.id_discente) return;

    const notasAlumno = calificacionesFiltradas.filter(
      (c) => c.id_discente === alumno.id_discente
    );

    // Si el alumno no tiene calificaciones registradas en el curso, se omite de la alerta
    if (notasAlumno.length === 0) return;

    const sumaAlumno = notasAlumno.reduce(
      (acumulador, c) => acumulador + Number(c.nota),
      0
    );
    const mediaAlumno = Number((sumaAlumno / notasAlumno.length).toFixed(2));

    // Se agrupan las notas por módulo para contabilizar asignaturas suspensas
    const notasPorModulo = new Map();
    notasAlumno.forEach((c) => {
      const moduloId =
        c.id_modulo ||
        (c.Practicas && c.Practicas.id_modulo) ||
        (c.Evaluaciones && c.Evaluaciones.id_modulo) ||
        mapaEvaluacionModulo.get(c.id_evaluacion);

      if (moduloId) {
        if (!notasPorModulo.has(moduloId)) {
          notasPorModulo.set(moduloId, []);
        }
        notasPorModulo.get(moduloId).push(Number(c.nota));
      }
    });

    let modulosSuspensos = 0;
    notasPorModulo.forEach((notasMod) => {
      const sumaMod = notasMod.reduce((acc, val) => acc + val, 0);
      const mediaMod = sumaMod / notasMod.length;
      if (mediaMod < 50) {
        modulosSuspensos += 1;
      }
    });

    const practicasSuspensas = notasAlumno.filter(
      (c) => Number(c.nota) < 50
    ).length;

    const suspensos = notasPorModulo.size > 0 ? modulosSuspensos : practicasSuspensas;

    if (mediaAlumno < 50 || suspensos >= 2) {
      let nivelRiesgo = 'Moderado';
      let severidadBadge = 'warning';

      if (mediaAlumno < 40 || suspensos >= 3) {
        nivelRiesgo = 'Crítico';
        severidadBadge = 'danger';
      } else if (suspensos >= 2) {
        nivelRiesgo = 'Alto';
        severidadBadge = 'danger';
      }

      alumnosRiesgoList.push({
        id_discente: alumno.id_discente,
        nombre: alumno.nombre || '',
        apellidos: alumno.apellidos || '',
        nombreCompleto: `${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim(),
        nia: alumno.NIA || 'Sin NIA',
        correo: alumno.correo || 'No informado',
        localidad: alumno.localidad || 'Desconocida',
        imagen: alumno.imagen || null,
        media: mediaAlumno,
        suspensos,
        totalEvaluadas: notasAlumno.length,
        nivelRiesgo,
        severidadBadge
      });
    }
  });

  // Se ordenan los discentes en riesgo de mayor a menor gravedad académica
  alumnosRiesgoList.sort(
    (a, b) => b.suspensos - a.suspensos || a.media - b.media
  );

  return {
    totalAlumnos,
    totalModulos,
    totalCalificaciones,
    notaMediaGlobal,
    tasaAprobados,
    distribucion: {
      suspensos,
      aprobados,
      notables,
      sobresalientes
    },
    mediasPorModulo,
    alumnosEnRiesgo: alumnosRiesgoList,
    tieneDatos: totalCalificaciones > 0,
    idCurso
  };
};

// Se consultan todas las tablas necesarias de Supabase para alimentar el panel de control
export const obtenerDatosCompletosDashboard = async () => {
  try {
    const [
      { data: cursos, error: errCursos },
      { data: discentes, error: errDiscentes },
      { data: modulos, error: errModulos },
      { data: evaluaciones, error: errEvaluaciones },
      { data: imparte, error: errImparte },
      { data: evaluan, error: errEvaluan }
    ] = await Promise.all([
      supabase.from('Cursos').select('*'),
      supabase.from('Discentes').select('*'),
      supabase.from('Modulos').select('*'),
      supabase.from('Evaluaciones').select('id_evaluacion, id_curso, id_modulo, nombre'),
      supabase.from('imparte').select('id_imparte, id_curso, id_modulo, id_discente'),
      supabase.from('evaluan').select('*, Practicas(id_modulo), Evaluaciones(id_curso, id_modulo)')
    ]);

    if (errCursos) throw errCursos;
    if (errDiscentes) throw errDiscentes;
    if (errModulos) throw errModulos;
    if (errEvaluaciones) throw errEvaluaciones;
    if (errImparte) throw errImparte;
    if (errEvaluan) throw errEvaluan;

    return {
      cursos: cursos || [],
      discentes: discentes || [],
      modulos: modulos || [],
      evaluaciones: evaluaciones || [],
      imparte: imparte || [],
      evaluan: evaluan || [],
      error: null
    };
  } catch (error) {
    console.error('Error al obtener datos completos del dashboard desde Supabase:', error);
    return {
      cursos: [],
      discentes: [],
      modulos: [],
      evaluaciones: [],
      imparte: [],
      evaluan: [],
      error: error.message || 'Error al obtener datos de Supabase'
    };
  }
};

export default {
  procesarEstadisticas,
  obtenerDatosCompletosDashboard
};
