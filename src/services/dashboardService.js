// Se procesan y computan las métricas estadísticas globales del Dashboard a partir de datos reales de la base de datos
export const procesarEstadisticas = (
  listaDiscentes = [],
  listaModulos = [],
  listaCalificaciones = []
) => {
  const totalAlumnos = Array.isArray(listaDiscentes) ? listaDiscentes.length : 0;
  const totalModulos = Array.isArray(listaModulos) ? listaModulos.length : 0;

  // Se filtran únicamente los registros con calificación numérica válida
  const calificacionesValidas = Array.isArray(listaCalificaciones)
    ? listaCalificaciones.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item.nota !== null &&
          item.nota !== undefined &&
          item.nota !== '' &&
          !isNaN(Number(item.nota))
      )
    : [];

  const totalCalificaciones = calificacionesValidas.length;

  // Se calcula la nota media global de todas las calificaciones registradas en el sistema
  let notaMediaGlobal = null;
  if (totalCalificaciones > 0) {
    const sumaNotas = calificacionesValidas.reduce(
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

  calificacionesValidas.forEach((calif) => {
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

  // Se calculan las medias por cada módulo o asignatura registrada
  const modulosMap = new Map();
  if (Array.isArray(listaModulos)) {
    listaModulos.forEach((mod) => {
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
  }

  calificacionesValidas.forEach((calif) => {
    const moduloId =
      calif.id_modulo ||
      (calif.Practicas && calif.Practicas.id_modulo) ||
      (calif.Evaluaciones && calif.Evaluaciones.id_modulo);

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

  // Se identifican discentes en situación de riesgo académico (media inferior a 50 o 2 o más asignaturas suspensas)
  const alumnosRiesgoList = [];

  if (Array.isArray(listaDiscentes)) {
    listaDiscentes.forEach((alumno) => {
      if (!alumno || !alumno.id_discente) return;

      const notasAlumno = calificacionesValidas.filter(
        (c) => c.id_discente === alumno.id_discente
      );

      // Si el alumno no tiene calificaciones registradas, no se clasifica en riesgo
      if (notasAlumno.length === 0) return;

      const sumaAlumno = notasAlumno.reduce(
        (acumulador, c) => acumulador + Number(c.nota),
        0
      );
      const mediaAlumno = Number((sumaAlumno / notasAlumno.length).toFixed(2));
      const suspensosAlumno = notasAlumno.filter(
        (c) => Number(c.nota) < 50
      ).length;

      if (mediaAlumno < 50 || suspensosAlumno >= 2) {
        let nivelRiesgo = 'Moderado';
        let severidadBadge = 'warning';

        if (mediaAlumno < 40 || suspensosAlumno >= 3) {
          nivelRiesgo = 'Crítico';
          severidadBadge = 'danger';
        } else if (suspensosAlumno >= 2) {
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
          suspensos: suspensosAlumno,
          totalEvaluadas: notasAlumno.length,
          nivelRiesgo,
          severidadBadge
        });
      }
    });
  }

  // Se ordenan los discentes en riesgo de mayor a menor gravedad
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
    tieneDatos: totalCalificaciones > 0
  };
};

export default {
  procesarEstadisticas
};
