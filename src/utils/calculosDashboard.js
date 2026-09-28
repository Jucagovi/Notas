import { formatearFechaEspanol, parsearFechaISO } from './fechas.js';

/**
 * Utilidades puras para el cálculo y agregación analítica de datos del Dashboard.
 *
 * Responsabilidad Única: Procesar y cruzar colecciones de datos del sistema escolar
 * (horarios, calendarios, temporizaciones, evaluaciones y calificaciones) para alimentar
 * los widgets presentacionales sin sobrecargar el renderizado de React.
 */

/**
 * Obtiene la agenda diaria cruzando el horario del docente con el calendario escolar.
 *
 * @param {number} diaSemana - Día de la semana (1: Lunes a 7: Domingo).
 * @param {string} fechaHoyStr - Cadena de fecha actual en formato ISO 'YYYY-MM-DD'.
 * @param {Array<Object>} horarios - Lista de asignaciones horarias.
 * @param {Array<Object>} sesiones - Lista de tramos horarios ordenados.
 * @param {Array<Object>} eventosCalendario - Eventos del calendario escolar.
 * @param {Array<Object>} modulos - Catálogo de módulos profesionales.
 * @returns {Object} - Datos consolidados de la agenda para el día actual.
 */
export const obtenerAgendaHoy = (
  diaSemana,
  fechaHoyStr,
  horarios = [],
  sesiones = [],
  eventosCalendario = [],
  modulos = []
) => {
  // Mapa asociativo de módulos para resolución inmediata de siglas y denominaciones.
  const mapaModulos = new Map();
  (modulos || []).forEach((m) => {
    mapaModulos.set(m.id_modulo, m);
  });

  // Mapa asociativo de sesiones horarias por identificador.
  const mapaSesiones = new Map();
  (sesiones || []).forEach((s) => {
    mapaSesiones.set(s.id_sesion, s);
  });

  // Se filtran las horas asignadas al horario del docente para este día de la semana.
  const clasesDocente = (horarios || []).filter((h) => {
    if (Number(h.dia_semana) !== Number(diaSemana)) return false;

    // Si tiene profesor especificado y es de un compañero, se descarta.
    if (h.profesor && typeof h.profesor === 'string') {
      const p = h.profesor.trim().toLowerCase();
      if (p && !p.includes('docente') && p !== 'yo' && p !== 'titular') {
        return false;
      }
    }

    // Se consideran todas las horas de su horario (módulos lectivos o tareas/módulos alternativos).
    return Boolean(h.id_modulo || h.modulo_alt || h.grupo || h.id_sesion);
  });

  // Se ordenan las sesiones cronológicamente según el número de tramo horario.
  clasesDocente.sort((a, b) => {
    const sesA = mapaSesiones.get(a.id_sesion);
    const sesB = mapaSesiones.get(b.id_sesion);
    const ordenA = sesA ? Number(sesA.numero) : 0;
    const ordenB = sesB ? Number(sesB.numero) : 0;
    return ordenA - ordenB;
  });

  // Se estructuran los elementos del horario para el componente Timeline de PrimeReact.
  const items = clasesDocente.map((c) => {
    const sesion = mapaSesiones.get(c.id_sesion);
    const modulo = c.id_modulo ? mapaModulos.get(c.id_modulo) : null;
    const horaInicio = sesion?.hora_inicio ? String(sesion.hora_inicio).slice(0, 5) : '--:--';
    const horaFin = sesion?.hora_fin ? String(sesion.hora_fin).slice(0, 5) : '--:--';

    const esClaseCurricular = Boolean(modulo || c.id_modulo);
    const titulo = modulo
      ? `${modulo.siglas} - ${modulo.nombre}`
      : (c.modulo_alt || c.grupo || 'Actividad docente');

    return {
      id: c.id_horario,
      horaInicio,
      horaFin,
      horaTexto: `${horaInicio} - ${horaFin}`,
      titulo,
      siglas: modulo?.siglas || c.grupo || 'DOC',
      grupo: c.grupo || '',
      aula: c.aula || '',
      esClaseCurricular,
      icono: esClaseCurricular ? 'pi pi-book' : 'pi pi-clock'
    };
  });

  return {
    esFestivo: false,
    eventoEspecial: null,
    items,
    totalSesionesHoy: items.length
  };
};

/**
 * Calcula la posición actual del temario y el siguiente hito formativo para cada módulo activo.
 *
 * @param {string|null} cursoId - Identificador del curso académico activo.
 * @param {Array<Object>} temporizaciones - Registros de planificación de Unidades de Trabajo.
 * @param {Array<Object>} unidadesTrabajo - Catálogo general de Unidades de Trabajo.
 * @param {Array<Object>} modulos - Módulos del centro escolar.
 * @param {Array<Object>} ciclos - Ciclos formativos.
 * @param {Array<Object>} horarios - Horarios semanales para el cálculo de sesiones restantes.
 * @param {string} fechaHoyStr - Cadena de fecha actual en formato ISO.
 * @returns {Array<Object>} - Lista de tarjetas tácticas por módulo.
 */
export const calcularMapaTactico = (
  cursoId,
  temporizaciones = [],
  unidadesTrabajo = [],
  modulos = [],
  ciclos = [],
  horarios = [],
  fechaHoyStr = ''
) => {
  // Mapa de ciclos para resolución de siglas.
  const mapaCiclos = new Map();
  (ciclos || []).forEach((c) => {
    mapaCiclos.set(c.id_ciclo, c);
  });

  // Se agrupan las Unidades de Trabajo por módulo.
  const mapaUTsPorModulo = new Map();
  (unidadesTrabajo || []).forEach((ut) => {
    if (!mapaUTsPorModulo.has(ut.id_modulo)) {
      mapaUTsPorModulo.set(ut.id_modulo, []);
    }
    mapaUTsPorModulo.get(ut.id_modulo).push(ut);
  });

  // Se filtran las temporizaciones correspondientes al curso activo si se ha especificado.
  const tempsFiltradas = cursoId
    ? (temporizaciones || []).filter((t) => t.id_curso === cursoId)
    : (temporizaciones || []);

  const mapaTempsPorUt = new Map();
  tempsFiltradas.forEach((t) => {
    mapaTempsPorUt.set(t.id_ut, t);
  });

  // Cálculo de sesiones semanales asignadas a cada módulo según el horario docente.
  const mapaHorasSemanalesModulo = new Map();
  (horarios || []).forEach((h) => {
    if (h.id_modulo) {
      const actual = mapaHorasSemanalesModulo.get(h.id_modulo) || 0;
      mapaHorasSemanalesModulo.set(h.id_modulo, actual + 1);
    }
  });

  const resultado = [];

  (modulos || []).forEach((modulo) => {
    const utsDelModulo = mapaUTsPorModulo.get(modulo.id_modulo) || [];
    if (utsDelModulo.length === 0) return;

    // Se asocian las unidades con sus datos de temporización y se ordenan.
    const utsConTemp = utsDelModulo.map((ut) => {
      const temp = mapaTempsPorUt.get(ut.id_ut);
      return {
        ...ut,
        orden: temp ? Number(temp.orden) : Number(ut.numero),
        estado: temp?.estado || 'Pendiente',
        fecha_ini_prevista: temp?.fecha_ini_prevista || null,
        fecha_fin_prevista: temp?.fecha_fin_prevista || null,
        fecha_ini_real: temp?.fecha_ini_real || null,
        fecha_fin_real: temp?.fecha_fin_real || null
      };
    });

    utsConTemp.sort((a, b) => a.orden - b.orden);

    // Se localiza la Unidad de Trabajo actualmente en desarrollo.
    let indiceActual = utsConTemp.findIndex((u) => u.estado === 'En Curso');
    if (indiceActual === -1) {
      // Si ninguna está 'En Curso', se toma la primera 'Pendiente'.
      indiceActual = utsConTemp.findIndex((u) => u.estado === 'Pendiente');
    }
    if (indiceActual === -1) {
      // Si todas están completadas, se selecciona la última de la programación.
      indiceActual = utsConTemp.length - 1;
    }

    const utActual = utsConTemp[indiceActual];
    const utProxima = indiceActual + 1 < utsConTemp.length ? utsConTemp[indiceActual + 1] : null;

    // Estimación de sesiones lectivas restantes para finalizar la unidad actual.
    const sesionesSemanales = mapaHorasSemanalesModulo.get(modulo.id_modulo) || 3;
    let sesionesRestantes = 2; // Valor estimado predeterminado.

    if (utActual.fecha_fin_prevista && fechaHoyStr) {
      const hoy = parsearFechaISO(fechaHoyStr);
      const fin = parsearFechaISO(utActual.fecha_fin_prevista);
      if (hoy && fin && fin > hoy) {
        const diffTiempo = fin.getTime() - hoy.getTime();
        const diasRestantes = Math.max(1, Math.round(diffTiempo / (1000 * 60 * 60 * 24)));
        const semanasRestantes = diasRestantes / 7;
        sesionesRestantes = Math.max(1, Math.round(semanasRestantes * sesionesSemanales));
      } else if (hoy && fin && fin <= hoy) {
        sesionesRestantes = 1;
      }
    }

    const ciclo = mapaCiclos.get(modulo.id_ciclo);

    resultado.push({
      id_modulo: modulo.id_modulo,
      siglas: modulo.siglas || 'MOD',
      nombre: modulo.nombre,
      cicloSiglas: ciclo?.siglas || '',
      utActual: {
        id_ut: utActual.id_ut,
        numero: utActual.numero,
        nombre: utActual.nombre,
        orden: utActual.orden,
        estado: utActual.estado,
        sesionesRestantes,
        fechaFinPrevista: utActual.fecha_fin_prevista ? formatearFechaEspanol(utActual.fecha_fin_prevista) : null
      },
      utProxima: utProxima ? {
        id_ut: utProxima.id_ut,
        numero: utProxima.numero,
        nombre: utProxima.nombre,
        orden: utProxima.orden
      } : null
    });
  });

  return resultado;
};

/**
 * Calcula la cobertura legal de Resultados de Aprendizaje para el gráfico de radar.
 *
 * @param {string|null} idModuloSeleccionado - Identificador del módulo a inspeccionar.
 * @param {Array<Object>} modulos - Catálogo de módulos.
 * @param {Array<Object>} practicas - Prácticas formativas registradas.
 * @param {Array<Object>} versiones - Versiones creadas de las prácticas.
 * @param {Array<Object>} trabajan - Relación entre versiones y Criterios de Evaluación.
 * @param {Array<Object>} todosRA - Resultados de Aprendizaje.
 * @param {Array<Object>} todosCE - Criterios de Evaluación.
 * @returns {Object} - Estructura de datos para el Chart Radar de PrimeReact y aviso de huérfanos.
 */
export const calcularRadarCobertura = (
  idModuloSeleccionado,
  modulos = [],
  practicas = [],
  versiones = [],
  trabajan = [],
  todosRA = [],
  todosCE = []
) => {
  // Determinación del módulo a auditar.
  const moduloId = idModuloSeleccionado || (modulos.length > 0 ? modulos[0].id_modulo : null);
  const moduloActual = (modulos || []).find((m) => m.id_modulo === moduloId) || null;

  if (!moduloId) {
    return {
      moduloSeleccionado: null,
      chartData: null,
      areasHuerfanas: [],
      totalRAs: 0,
      totalCubiertos: 0,
      porcentajeGlobal: 0
    };
  }

  // Se filtran los Resultados de Aprendizaje del módulo.
  const rasModulo = (todosRA || [])
    .filter((ra) => ra.id_modulo === moduloId)
    .sort((a, b) => Number(a.numero) - Number(b.numero));

  // Se obtienen los Criterios de Evaluación asociados a los RAs del módulo.
  const idsRaModulo = new Set(rasModulo.map((ra) => ra.id_ra));
  const cesModulo = (todosCE || []).filter((ce) => idsRaModulo.has(ce.id_ra));

  // Mapa de CEs por cada RA.
  const mapaCEsPorRA = new Map();
  cesModulo.forEach((ce) => {
    if (!mapaCEsPorRA.has(ce.id_ra)) {
      mapaCEsPorRA.set(ce.id_ra, []);
    }
    mapaCEsPorRA.get(ce.id_ra).push(ce);
  });

  // Prácticas y versiones pertenecientes al módulo.
  const practicasModulo = (practicas || []).filter((p) => p.id_modulo === moduloId);
  const idsPracticasModulo = new Set(practicasModulo.map((p) => p.id_practica));
  const versionesModulo = (versiones || []).filter((v) => idsPracticasModulo.has(v.id_practica));
  const idsVersionesModulo = new Set(versionesModulo.map((v) => v.id_version));

  // Se acumulan los porcentajes trabajados para cada Criterio de Evaluación.
  const mapaPorcentajePorCE = new Map();
  (trabajan || []).forEach((t) => {
    if (idsVersionesModulo.has(t.id_version) && t.id_ce) {
      const valorPrevio = mapaPorcentajePorCE.get(t.id_ce) || 0;
      const incremento = Number(t.porcentaje) || 100;
      mapaPorcentajePorCE.set(t.id_ce, Math.min(100, valorPrevio + incremento));
    }
  });

  // Se calcula la cobertura porcentual media para cada RA.
  const labels = [];
  const valores = [];
  const areasHuerfanas = [];
  let sumaPorcentajesRA = 0;

  rasModulo.forEach((ra) => {
    const cesDelRA = mapaCEsPorRA.get(ra.id_ra) || [];
    const codigo = `RA${ra.numero || '?'}`;
    labels.push(codigo);

    if (cesDelRA.length === 0) {
      valores.push(0);
      areasHuerfanas.push({
        codigo,
        nombre: ra.nombre || ra.descripcion || 'Sin descripción',
        motivo: 'No tiene Criterios de Evaluación asignados.'
      });
      return;
    }

    let sumaCEs = 0;
    cesDelRA.forEach((ce) => {
      const porcentajeCE = mapaPorcentajePorCE.get(ce.id_ce) || 0;
      sumaCEs += porcentajeCE;
    });

    const porcentajeRA = Math.min(100, Math.round(sumaCEs / cesDelRA.length));
    valores.push(porcentajeRA);
    sumaPorcentajesRA += porcentajeRA;

    if (porcentajeRA === 0) {
      areasHuerfanas.push({
        codigo,
        nombre: ra.nombre || ra.descripcion || 'Sin descripción',
        motivo: 'Ninguna práctica asignada cubre sus criterios.'
      });
    }
  });

  const totalRAs = rasModulo.length;
  const totalCubiertos = valores.filter((v) => v > 0).length;
  const porcentajeGlobal = totalRAs > 0 ? Math.round(sumaPorcentajesRA / totalRAs) : 0;

  // Configuración de datos para el Radar Chart de Chart.js.
  const chartData = {
    labels: labels.length > 0 ? labels : ['Sin RA'],
    datasets: [
      {
        label: '% Cobertura Curricular',
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#2563eb',
        data: valores.length > 0 ? valores : [0]
      }
    ]
  };

  return {
    moduloSeleccionado: moduloActual,
    chartData,
    areasHuerfanas,
    totalRAs,
    totalCubiertos,
    porcentajeGlobal
  };
};

/**
 * Escáner predictivo que analiza hitos, pruebas y entregas en los próximos 15 días.
 *
 * @param {Array<Object>} calendarioEventos - Eventos escolares programados.
 * @param {Array<Object>} evaluaciones - Evaluaciones del curso.
 * @param {Array<Object>} versiones - Versiones de actividades prácticas.
 * @param {Array<Object>} practicas - Prácticas formativas.
 * @param {string} fechaHoyStr - Cadena de fecha actual en formato ISO.
 * @returns {Object} - Diagnóstico de sobrecarga y advertencias preventivas.
 */
export const calcularDetectorSobrecarga = (
  calendarioEventos = [],
  evaluaciones = [],
  versiones = [],
  practicas = [],
  fechaHoyStr = ''
) => {
  const hoy = parsearFechaISO(fechaHoyStr) || new Date();
  const limite = new Date(hoy.getTime());
  limite.setDate(limite.getDate() + 15);

  const limiteStr = limite.toISOString().split('T')[0];

  // Mapa de denominaciones de prácticas para enriquecer las entregas.
  const mapaPracticas = new Map();
  (practicas || []).forEach((p) => {
    mapaPracticas.set(p.id_practica, p);
  });

  const hitosProximos = [];

  // 1. Exámenes o pruebas registrados en Calendario_Eventos dentro de la ventana de 15 días.
  (calendarioEventos || []).forEach((e) => {
    const fIni = e.fecha_inicio;
    if (fIni >= fechaHoyStr && fIni <= limiteStr) {
      const tipo = (e.tipo_evento || '').toLowerCase();
      const desc = (e.descripcion || '').toLowerCase();
      const esPruebaOExamen = tipo.includes('examen') || tipo.includes('evalua') || desc.includes('examen') || desc.includes('prueba');

      if (esPruebaOExamen) {
        hitosProximos.push({
          id: e.id_evento,
          fecha: fIni,
          fechaFormateada: formatearFechaEspanol(fIni),
          tipo: 'Examen / Prueba',
          titulo: e.descripcion || e.tipo_evento,
          icono: 'pi pi-file-edit',
          severidad: 'danger'
        });
      }
    }
  });

  // 2. Evaluaciones oficiales programadas en la ventana temporal.
  (evaluaciones || []).forEach((ev) => {
    const fechaObj = ev.fecha_fin || ev.fecha_ini;
    if (fechaObj && fechaObj >= fechaHoyStr && fechaObj <= limiteStr) {
      hitosProximos.push({
        id: ev.id_evaluacion,
        fecha: fechaObj,
        fechaFormateada: formatearFechaEspanol(fechaObj),
        tipo: 'Cierre Evaluación',
        titulo: `Cierre: ${ev.nombre}`,
        icono: 'pi pi-calendar-times',
        severidad: 'warning'
      });
    }
  });

  // Se ordenan los hitos por orden cronológico.
  hitosProximos.sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Se agrupan los hitos en bloques semanales de 7 días para detectar acumulaciones.
  const semana1 = hitosProximos.filter((h) => {
    const d = parsearFechaISO(h.fecha);
    if (!d) return false;
    const difDias = (d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return difDias >= 0 && difDias < 7;
  });

  const semana2 = hitosProximos.filter((h) => {
    const d = parsearFechaISO(h.fecha);
    if (!d) return false;
    const difDias = (d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return difDias >= 7 && difDias <= 15;
  });

  const maxHitosSemana = Math.max(semana1.length, semana2.length);

  // Determinación del nivel de riesgo.
  let nivelAlerta = 'baja';
  let mensajeAlerta = 'Distribución equilibrada de hitos y entregas en los próximos 15 días.';

  if (maxHitosSemana > 3) {
    nivelAlerta = 'critica';
    mensajeAlerta = `Alerta Crítica: se concentran ${maxHitosSemana} pruebas o entregas en una misma semana. Se recomienda reprogramar fechas antes de colapsar al alumnado.`;
  } else if (maxHitosSemana >= 2) {
    nivelAlerta = 'moderada';
    mensajeAlerta = `Aviso: se concentran ${maxHitosSemana} hitos en la misma semana. Conviene vigilar la carga de estudio.`;
  }

  return {
    nivelAlerta,
    mensajeAlerta,
    totalHitos: hitosProximos.length,
    hitosProximos,
    resumenSemanas: [
      { etiqueta: 'Próximos 7 días', total: semana1.length },
      { etiqueta: 'Siguiente semana (Días 8-15)', total: semana2.length }
    ]
  };
};

/**
 * Analiza anomalías y genera avisos prioritarios de atención inmediata.
 *
 * @param {Array<Object>} versiones - Versiones de prácticas asignadas.
 * @param {Array<Object>} evaluan - Calificaciones registradas en la base de datos.
 * @param {Array<Object>} imparte - Matrícula de discentes por curso y módulo.
 * @param {Array<Object>} temporizaciones - Unidades temporizadas.
 * @param {Array<Object>} modulos - Módulos del sistema.
 * @param {string} fechaHoyStr - Cadena de fecha actual en formato ISO.
 * @returns {Array<Object>} - Lista de alertas prioritarias.
 */
export const calcularAlertasInmediatas = (
  versiones = [],
  evaluan = [],
  imparte = [],
  temporizaciones = [],
  modulos = [],
  fechaHoyStr = ''
) => {
  const alertas = [];

  // Mapa de nombres de módulos.
  const mapaModulos = new Map();
  (modulos || []).forEach((m) => {
    mapaModulos.set(m.id_modulo, m);
  });

  // 1. Detección de prácticas sin calificar.
  // Versiones asignadas a evaluación con discentes matriculados que carecen de registro de nota.
  const versionesAsignadas = (versiones || []).filter((v) => Boolean(v.id_evaluacion));
  const mapaCalificacionesPorVersion = new Map();
  (evaluan || []).forEach((ev) => {
    if (ev.id_version && ev.nota !== null && ev.nota !== undefined) {
      const cuenta = mapaCalificacionesPorVersion.get(ev.id_version) || 0;
      mapaCalificacionesPorVersion.set(ev.id_version, cuenta + 1);
    }
  });

  const totalDiscentesMatriculados = (imparte || []).length;
  let versionesPendientesCount = 0;

  versionesAsignadas.forEach((v) => {
    const notasRegistradas = mapaCalificacionesPorVersion.get(v.id_version) || 0;
    if (totalDiscentesMatriculados > 0 && notasRegistradas < totalDiscentesMatriculados) {
      versionesPendientesCount++;
    }
  });

  if (versionesPendientesCount > 0) {
    alertas.push({
      id: 'alerta-practicas-sin-calificar',
      tipo: 'calificacion',
      titulo: 'Prácticas sin calificar',
      descripcion: `Existen ${versionesPendientesCount} actividades con entregas pendientes de calificación en el cuaderno.`,
      severidad: 'warning',
      icono: 'pi pi-pencil',
      ruta: '/calificar',
      accionTexto: 'Calificar'
    });
  }

  // 2. Detección de desfase en la temporización (Unidades con fecha fin prevista vencida que siguen sin completarse).
  const hoyStr = fechaHoyStr || new Date().toISOString().split('T')[0];
  const utsAtrasadas = (temporizaciones || []).filter((t) => {
    return t.fecha_fin_prevista && t.fecha_fin_prevista < hoyStr && t.estado !== 'Completada';
  });

  if (utsAtrasadas.length > 0) {
    alertas.push({
      id: 'alerta-retraso-temporizacion',
      tipo: 'temporizacion',
      titulo: 'Desfase en la temporización',
      descripcion: `${utsAtrasadas.length} Unidades de Trabajo han superado su fecha límite prevista y no constan como completadas.`,
      severidad: 'danger',
      icono: 'pi pi-calendar-times',
      ruta: '/temporizacion',
      accionTexto: 'Revisar'
    });
  }

  // 3. Alumnos con calificaciones críticas (media < 50).
  const notasPorAlumno = new Map();
  (evaluan || []).forEach((ev) => {
    if (ev.id_discente && ev.nota !== null && ev.nota !== undefined) {
      if (!notasPorAlumno.has(ev.id_discente)) {
        notasPorAlumno.set(ev.id_discente, []);
      }
      notasPorAlumno.get(ev.id_discente).push(Number(ev.nota));
    }
  });

  let alumnosEnRiesgo = 0;
  notasPorAlumno.forEach((notas) => {
    if (notas.length > 0) {
      const media = notas.reduce((acc, n) => acc + n, 0) / notas.length;
      if (media < 50) {
        alumnosEnRiesgo++;
      }
    }
  });

  if (alumnosEnRiesgo > 0) {
    alertas.push({
      id: 'alerta-alumnos-riesgo',
      tipo: 'discentes',
      titulo: 'Atención a la diversidad / Riesgo',
      descripcion: `${alumnosEnRiesgo} discentes presentan una media de calificaciones en zona de suspenso (< 50).`,
      severidad: 'danger',
      icono: 'pi pi-exclamation-triangle',
      ruta: '/evaluacion/cuaderno',
      accionTexto: 'Ver cuaderno'
    });
  }

  return alertas;
};

/**
 * Calcula las barras comparativas de avance real versus progreso teórico por módulo.
 *
 * @param {string|null} cursoId - Identificador del curso activo.
 * @param {Array<Object>} modulos - Módulos registrados.
 * @param {Array<Object>} temporizaciones - Temporizaciones del curso.
 * @param {Array<Object>} unidadesTrabajo - Catálogo de UTs.
 * @param {string} fechaHoyStr - Cadena de fecha actual en formato ISO.
 * @returns {Array<Object>} - Avance por cada módulo profesional.
 */
export const calcularProgresoCurricular = (
  cursoId,
  modulos = [],
  temporizaciones = [],
  unidadesTrabajo = [],
  fechaHoyStr = ''
) => {
  const hoyStr = fechaHoyStr || new Date().toISOString().split('T')[0];

  // Agrupación de UTs por módulo.
  const mapaUTsPorModulo = new Map();
  (unidadesTrabajo || []).forEach((ut) => {
    if (!mapaUTsPorModulo.has(ut.id_modulo)) {
      mapaUTsPorModulo.set(ut.id_modulo, []);
    }
    mapaUTsPorModulo.get(ut.id_modulo).push(ut);
  });

  // Temporizaciones correspondientes al curso activo.
  const tempsFiltradas = cursoId
    ? (temporizaciones || []).filter((t) => t.id_curso === cursoId)
    : (temporizaciones || []);

  const mapaTempsPorUt = new Map();
  tempsFiltradas.forEach((t) => {
    mapaTempsPorUt.set(t.id_ut, t);
  });

  const resultado = [];

  (modulos || []).forEach((modulo) => {
    const uts = mapaUTsPorModulo.get(modulo.id_modulo) || [];
    if (uts.length === 0) return;

    const totalUTs = uts.length;
    let completadas = 0;
    let teoricasHastaHoy = 0;

    uts.forEach((ut) => {
      const temp = mapaTempsPorUt.get(ut.id_ut);
      if (temp?.estado === 'Completada') {
        completadas++;
      }
      if (temp?.fecha_fin_prevista && temp.fecha_fin_prevista <= hoyStr) {
        teoricasHastaHoy++;
      }
    });

    const avanceReal = Math.round((completadas / totalUTs) * 100);
    // Si no hay fechas definidas, se utiliza una aproximación proporcional estándar.
    const avanceTeorico = Math.round((teoricasHastaHoy / totalUTs) * 100);

    const diferencia = avanceReal - avanceTeorico;
    let estado = 'en_tiempo';
    let estadoTexto = 'Al día';
    let estadoColor = 'success';

    if (diferencia >= 10) {
      estado = 'adelantado';
      estadoTexto = 'Adelantado';
      estadoColor = 'info';
    } else if (diferencia <= -10) {
      estado = 'retrasado';
      estadoTexto = 'Con retraso';
      estadoColor = 'danger';
    }

    resultado.push({
      id_modulo: modulo.id_modulo,
      siglas: modulo.siglas || 'MOD',
      nombre: modulo.nombre,
      totalUTs,
      completadas,
      avanceReal,
      avanceTeorico,
      estado,
      estadoTexto,
      estadoColor
    });
  });

  return resultado;
};

/**
 * Calcula el recuento total de calificaciones pendientes en el curso seleccionado.
 * Cruza las actividades asignadas a evaluación con los alumnos matriculados y verifica
 * cuáles no tienen registro de nota en la tabla evaluan.
 *
 * @param {string|null} cursoId - Identificador del curso activo.
 * @param {Array<Object>} versiones - Lista de versiones de actividades.
 * @param {Array<Object>} evaluan - Lista de calificaciones registradas.
 * @param {Array<Object>} imparte - Lista de matrículas de la clase.
 * @returns {number} Número de calificaciones pendientes detectadas.
 */
export const calcularConteoCalificacionesPendientes = (
  cursoId,
  versiones = [],
  evaluan = [],
  imparte = []
) => {
  // Se filtran las versiones que poseen evaluación asignada en el curso indicado
  const versionesEvaluables = (versiones || []).filter((v) => {
    if (!v.id_evaluacion) return false;
    return cursoId ? v.id_curso === cursoId : true;
  });

  if (versionesEvaluables.length === 0) return 0;

  // Se extraen las matrículas correspondientes al curso activo
  const matriculasCurso = (imparte || []).filter((m) => {
    return cursoId ? m.id_curso === cursoId : true;
  });

  const idsDiscentes = [
    ...new Set(matriculasCurso.map((m) => m.id_discente).filter(Boolean))
  ];

  if (idsDiscentes.length === 0) return 0;

  // Conjunto de identificadores de pares alumno-actividad con calificación registrada
  const calificacionesRegistradas = new Set();
  (evaluan || []).forEach((ev) => {
    if (ev.id_discente && ev.id_version && ev.nota !== null && ev.nota !== undefined) {
      calificacionesRegistradas.add(`${ev.id_discente}_${ev.id_version}`);
    }
  });

  let totalPendientes = 0;
  versionesEvaluables.forEach((version) => {
    idsDiscentes.forEach((idDiscente) => {
      if (!calificacionesRegistradas.has(`${idDiscente}_${version.id_version}`)) {
        totalPendientes++;
      }
    });
  });

  return totalPendientes;
};
