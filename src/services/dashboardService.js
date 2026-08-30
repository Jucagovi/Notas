// Datos simulados estructurados para cuando la base de datos aún no contiene registros
export const DATOS_MOCK_DISCENTES = [
  {
    id_discente: '11111111-1111-4111-a111-111111111111',
    nombre: 'Alejandro',
    apellidos: 'García Fernández',
    NIA: 'NIA-2024-001',
    correo: 'alejandro.garcia@centroeducativo.es',
    localidad: 'Valencia',
    imagen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '22222222-2222-4222-a222-222222222222',
    nombre: 'Lucía',
    apellidos: 'Martínez Ruiz',
    NIA: 'NIA-2024-002',
    correo: 'lucia.martinez@centroeducativo.es',
    localidad: 'Torrent',
    imagen: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '33333333-3333-4333-a333-333333333333',
    nombre: 'Carlos',
    apellidos: 'Navarro Gómez',
    NIA: 'NIA-2024-003',
    correo: 'carlos.navarro@centroeducativo.es',
    localidad: 'Paterna',
    imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '44444444-4444-4444-a444-444444444444',
    nombre: 'Elena',
    apellidos: 'Sánchez López',
    NIA: 'NIA-2024-004',
    correo: 'elena.sanchez@centroeducativo.es',
    localidad: 'Valencia',
    imagen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '55555555-5555-4555-a555-555555555555',
    nombre: 'Hugo',
    apellidos: 'Pérez Torres',
    NIA: 'NIA-2024-005',
    correo: 'hugo.perez@centroeducativo.es',
    localidad: 'Alzira',
    imagen: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '66666666-6666-4666-a666-666666666666',
    nombre: 'María',
    apellidos: 'Vázquez Romero',
    NIA: 'NIA-2024-006',
    correo: 'maria.vazquez@centroeducativo.es',
    localidad: 'Sagunto',
    imagen: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '77777777-7777-4777-a777-777777777777',
    nombre: 'Javier',
    apellidos: 'Molina Castro',
    NIA: 'NIA-2024-007',
    correo: 'javier.molina@centroeducativo.es',
    localidad: 'Mislata',
    imagen: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    activo: true
  },
  {
    id_discente: '88888888-8888-4888-a888-888888888888',
    nombre: 'Sara',
    apellidos: 'Ibáñez Ortíz',
    NIA: 'NIA-2024-008',
    correo: 'sara.ibanez@centroeducativo.es',
    localidad: 'Gandia',
    imagen: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    activo: true
  }
];

export const DATOS_MOCK_MODULOS = [
  { id_modulo: 'mod-1', nombre: 'Desarrollo Web en Entorno Cliente', siglas: 'DWEC' },
  { id_modulo: 'mod-2', nombre: 'Desarrollo Web en Entorno Servidor', siglas: 'DWES' },
  { id_modulo: 'mod-3', nombre: 'Diseño de Interfaces Web', siglas: 'DIW' },
  { id_modulo: 'mod-4', nombre: 'Despliegue de Aplicaciones Web', siglas: 'DAW' },
  { id_modulo: 'mod-5', nombre: 'Empresa e Iniciativa Emprendedora', siglas: 'EIE' }
];

export const DATOS_MOCK_CALIFICACIONES = [
  // Alejandro (Buen estudiante: notable)
  { id_discente: '11111111-1111-4111-a111-111111111111', id_modulo: 'mod-1', nota: 85 },
  { id_discente: '11111111-1111-4111-a111-111111111111', id_modulo: 'mod-2', nota: 78 },
  { id_discente: '11111111-1111-4111-a111-111111111111', id_modulo: 'mod-3', nota: 92 },
  { id_discente: '11111111-1111-4111-a111-111111111111', id_modulo: 'mod-4', nota: 70 },
  { id_discente: '11111111-1111-4111-a111-111111111111', id_modulo: 'mod-5', nota: 88 },

  // Lucía (Excelente: sobresalientes)
  { id_discente: '22222222-2222-4222-a222-222222222222', id_modulo: 'mod-1', nota: 95 },
  { id_discente: '22222222-2222-4222-a222-222222222222', id_modulo: 'mod-2', nota: 90 },
  { id_discente: '22222222-2222-4222-a222-222222222222', id_modulo: 'mod-3', nota: 96 },
  { id_discente: '22222222-2222-4222-a222-222222222222', id_modulo: 'mod-4', nota: 91 },
  { id_discente: '22222222-2222-4222-a222-222222222222', id_modulo: 'mod-5', nota: 94 },

  // Carlos (En riesgo crítico: 3 suspensos, media 41)
  { id_discente: '33333333-3333-4333-a333-333333333333', id_modulo: 'mod-1', nota: 35 },
  { id_discente: '33333333-3333-4333-a333-333333333333', id_modulo: 'mod-2', nota: 40 },
  { id_discente: '33333333-3333-4333-a333-333333333333', id_modulo: 'mod-3', nota: 52 },
  { id_discente: '33333333-3333-4333-a333-333333333333', id_modulo: 'mod-4', nota: 30 },
  { id_discente: '33333333-3333-4333-a333-333333333333', id_modulo: 'mod-5', nota: 50 },

  // Elena (Aprobados y notables)
  { id_discente: '44444444-4444-4444-a444-444444444444', id_modulo: 'mod-1', nota: 68 },
  { id_discente: '44444444-4444-4444-a444-444444444444', id_modulo: 'mod-2', nota: 72 },
  { id_discente: '44444444-4444-4444-a444-444444444444', id_modulo: 'mod-3', nota: 80 },
  { id_discente: '44444444-4444-4444-a444-444444444444', id_modulo: 'mod-4', nota: 65 },
  { id_discente: '44444444-4444-4444-a444-444444444444', id_modulo: 'mod-5', nota: 74 },

  // Hugo (En riesgo: 2 suspensos)
  { id_discente: '55555555-5555-4555-a555-555555555555', id_modulo: 'mod-1', nota: 42 },
  { id_discente: '55555555-5555-4555-a555-555555555555', id_modulo: 'mod-2', nota: 48 },
  { id_discente: '55555555-5555-4555-a555-555555555555', id_modulo: 'mod-3', nota: 60 },
  { id_discente: '55555555-5555-4555-a555-555555555555', id_modulo: 'mod-4', nota: 55 },
  { id_discente: '55555555-5555-4555-a555-555555555555', id_modulo: 'mod-5', nota: 62 },

  // María (Media notable)
  { id_discente: '66666666-6666-4666-a666-666666666666', id_modulo: 'mod-1', nota: 75 },
  { id_discente: '66666666-6666-4666-a666-666666666666', id_modulo: 'mod-2', nota: 82 },
  { id_discente: '66666666-6666-4666-a666-666666666666', id_modulo: 'mod-3', nota: 70 },
  { id_discente: '66666666-6666-4666-a666-666666666666', id_modulo: 'mod-4', nota: 85 },
  { id_discente: '66666666-6666-4666-a666-666666666666', id_modulo: 'mod-5', nota: 78 },

  // Javier (En riesgo: media baja 46 y 2 suspensos)
  { id_discente: '77777777-7777-4777-a777-777777777777', id_modulo: 'mod-1', nota: 45 },
  { id_discente: '77777777-7777-4777-a777-777777777777', id_modulo: 'mod-2', nota: 38 },
  { id_discente: '77777777-7777-4777-a777-777777777777', id_modulo: 'mod-3', nota: 50 },
  { id_discente: '77777777-7777-4777-a777-777777777777', id_modulo: 'mod-4', nota: 51 },
  { id_discente: '77777777-7777-4777-a777-777777777777', id_modulo: 'mod-5', nota: 49 },

  // Sara (Aprobados altos)
  { id_discente: '88888888-8888-4888-a888-888888888888', id_modulo: 'mod-1', nota: 64 },
  { id_discente: '88888888-8888-4888-a888-888888888888', id_modulo: 'mod-2', nota: 69 },
  { id_discente: '88888888-8888-4888-a888-888888888888', id_modulo: 'mod-3', nota: 73 },
  { id_discente: '88888888-8888-4888-a888-888888888888', id_modulo: 'mod-4', nota: 62 },
  { id_discente: '88888888-8888-4888-a888-888888888888', id_modulo: 'mod-5', nota: 80 }
];

// Función de procesamiento puro que computa todas las estadísticas agregadas del Dashboard
export const procesarEstadisticas = (listaDiscentes = [], listaModulos = [], listaCalificaciones = [], esMock = false) => {
  const totalAlumnos = listaDiscentes.length;
  const totalModulos = listaModulos.length;

  // Filtrado de calificaciones válidas numéricamente
  const calificacionesValidas = listaCalificaciones.filter(
    (item) => item.nota !== null && item.nota !== undefined && !isNaN(Number(item.nota))
  );

  const totalCalificaciones = calificacionesValidas.length;

  // Cálculo de Nota Media Global
  let notaMediaGlobal = 0;
  if (totalCalificaciones > 0) {
    const sumaNotas = calificacionesValidas.reduce((acc, curr) => acc + Number(curr.nota), 0);
    notaMediaGlobal = Number((sumaNotas / totalCalificaciones).toFixed(2));
  }

  // Distribución de calificaciones y cálculo de aprobados
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
  const tasaAprobados = totalCalificaciones > 0
    ? Number(((totalAprobadas / totalCalificaciones) * 100).toFixed(2))
    : 0;

  // Cálculo de media por módulo / asignatura
  const modulosMap = new Map();
  listaModulos.forEach((mod) => {
    modulosMap.set(mod.id_modulo, {
      id_modulo: mod.id_modulo,
      nombre: mod.nombre || 'Sin nombre',
      siglas: mod.siglas || mod.nombre || 'MOD',
      suma: 0,
      total: 0
    });
  });

  calificacionesValidas.forEach((calif) => {
    const moduloId = calif.id_modulo || (calif.Practicas && calif.Practicas.id_modulo);
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
    media: m.total > 0 ? Number((m.suma / m.total).toFixed(2)) : 0,
    totalCalificaciones: m.total
  }));

  // Identificación de alumnos en riesgo (alumnos con media < 50 o con más de 1 suspenso)
  const alumnosRiesgoList = [];

  listaDiscentes.forEach((alumno) => {
    const notasAlumno = calificacionesValidas.filter((c) => c.id_discente === alumno.id_discente);
    if (notasAlumno.length === 0) return;

    const sumaAlumno = notasAlumno.reduce((acc, c) => acc + Number(c.nota), 0);
    const mediaAlumno = Number((sumaAlumno / notasAlumno.length).toFixed(2));
    const suspensosAlumno = notasAlumno.filter((c) => Number(c.nota) < 50).length;

    // Regla de riesgo: media menor a 50 o más de 1 asignatura/evaluación suspensa
    if (mediaAlumno < 50 || suspensosAlumno > 1) {
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
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        nombreCompleto: `${alumno.nombre} ${alumno.apellidos}`,
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

  // Se ordenan los alumnos en riesgo por mayor número de suspensos y menor media
  alumnosRiesgoList.sort((a, b) => b.suspensos - a.suspensos || a.media - b.media);

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
    esMock,
    tieneDatos: totalAlumnos > 0 && totalCalificaciones > 0
  };
};

// Función auxiliar para generar estadísticas a partir de datos simulados
export const procesarEstadisticasConMock = () => {
  return procesarEstadisticas(
    DATOS_MOCK_DISCENTES,
    DATOS_MOCK_MODULOS,
    DATOS_MOCK_CALIFICACIONES,
    true
  );
};

export default {
  procesarEstadisticas,
  procesarEstadisticasConMock,
  DATOS_MOCK_DISCENTES,
  DATOS_MOCK_MODULOS,
  DATOS_MOCK_CALIFICACIONES
};
