// Utilidades para el manejo, formateo y cálculo de fechas en el calendario académico.

// Formatea un objeto Date en cadena ISO con formato 'YYYY-MM-DD' usando la hora local.
export const formatearFechaISO = (fecha) => {
  if (!fecha) return '';
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return '';
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

// Convierte una cadena 'YYYY-MM-DD' en un objeto Date en hora local a las 00:00:00 para evitar desfases horarios.
export const parsearFechaISO = (cadenaFecha) => {
  if (!cadenaFecha) return null;
  if (cadenaFecha instanceof Date) return cadenaFecha;
  const partes = String(cadenaFecha).split('T')[0].split('-');
  if (partes.length !== 3) return null;
  const [anio, mes, dia] = partes.map(Number);
  if (isNaN(anio) || isNaN(mes) || isNaN(dia)) return null;
  return new Date(anio, mes - 1, dia, 0, 0, 0);
};

// Formatea una fecha en formato estándar español 'DD/MM/YYYY'.
export const formatearFechaEspanol = (fecha) => {
  if (!fecha) return '';
  const d = fecha instanceof Date ? fecha : parsearFechaISO(fecha);
  if (!d || isNaN(d.getTime())) return '';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

// Obtiene el nombre del día de la semana en castellano con la primera letra en mayúscula.
export const obtenerNombreDiaSemana = (fecha) => {
  if (!fecha) return '';
  const d = fecha instanceof Date ? fecha : parsearFechaISO(fecha);
  if (!d || isNaN(d.getTime())) return '';
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[d.getDay()];
};

// Comprueba si una fecha corresponde a sábado o domingo.
export const esFinDeSemana = (fecha) => {
  if (!fecha) return false;
  const d = fecha instanceof Date ? fecha : parsearFechaISO(fecha);
  if (!d || isNaN(d.getTime())) return false;
  const dia = d.getDay();
  return dia === 0 || dia === 6;
};

// Comprueba si dos fechas corresponden exactamente al mismo día natural.
export const sonMismaFecha = (fecha1, fecha2) => {
  if (!fecha1 || !fecha2) return false;
  const d1 = fecha1 instanceof Date ? fecha1 : parsearFechaISO(fecha1);
  const d2 = fecha2 instanceof Date ? fecha2 : parsearFechaISO(fecha2);
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Genera una lista de objetos Date entre dos fechas dadas de forma inclusiva.
export const generarRangoFechas = (fechaInicio, fechaFin, excluirFinesDeSemana = true) => {
  const inicio = fechaInicio instanceof Date ? new Date(fechaInicio.getTime()) : parsearFechaISO(fechaInicio);
  const fin = fechaFin instanceof Date ? new Date(fechaFin.getTime()) : parsearFechaISO(fechaFin);
  if (!inicio || !fin || isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio > fin) {
    return [];
  }

  const fechas = [];
  const actual = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), 0, 0, 0);
  const limite = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate(), 0, 0, 0);

  while (actual <= limite) {
    const copia = new Date(actual.getTime());
    if (!excluirFinesDeSemana || !esFinDeSemana(copia)) {
      fechas.push(copia);
    }
    actual.setDate(actual.getDate() + 1);
  }

  return fechas;
};

// Calcula los días lectivos netos, festivos y fines de semana entre el inicio y el fin del curso escolar.
export const calcularResumenLectivo = (fechaInicio, fechaFin, listaEventos = []) => {
  const inicio = fechaInicio instanceof Date ? fechaInicio : parsearFechaISO(fechaInicio);
  const fin = fechaFin instanceof Date ? fechaFin : parsearFechaISO(fechaFin);

  if (!inicio || !fin || inicio > fin) {
    return {
      diasNaturales: 0,
      diasFinSemana: 0,
      diasFestivosLaborables: 0,
      diasLectivos: 0,
      semanasLectivas: '0,0',
      totalNoLectivos: 0,
      totalExamenes: 0,
      totalEvaluaciones: 0
    };
  }

  // Se crea un conjunto con todas las fechas no lectivas (es_lectivo === false).
  // Se soportan tanto el formato antiguo { fecha } como el nuevo { fecha_inicio, fecha_fin, es_lectivo }.
  const conjuntoNoLectivos = new Set();
  let totalExamenes = 0;
  let totalEvaluaciones = 0;

  listaEventos.forEach((ev) => {
    if (!ev) return;

    // Conteo estadístico por tipo de evento lectivo.
    const tipo = String(ev.tipo_evento || '').toLowerCase();
    if (tipo.includes('examen')) totalExamenes += 1;
    if (tipo.includes('evalua')) totalEvaluaciones += 1;

    // Si tiene es_lectivo === true, no se marca como día festivo/no lectivo.
    if (ev.es_lectivo === true) {
      return;
    }

    if (ev.fecha_inicio && ev.fecha_fin) {
      const fIni = parsearFechaISO(ev.fecha_inicio);
      const fFin = parsearFechaISO(ev.fecha_fin);
      if (fIni && fFin && fIni <= fFin) {
        const cur = new Date(fIni.getTime());
        while (cur <= fFin) {
          // El mes de agosto (vacaciones legales) no se computa como festivo del curso escolar.
          if (cur.getMonth() !== 7) {
            conjuntoNoLectivos.add(formatearFechaISO(cur));
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
    } else if (ev.fecha) {
      const d = parsearFechaISO(ev.fecha);
      if (d && d.getMonth() !== 7) {
        conjuntoNoLectivos.add(typeof ev.fecha === 'string' ? ev.fecha : formatearFechaISO(ev.fecha));
      }
    } else if (typeof ev === 'string') {
      const d = parsearFechaISO(ev);
      if (d && d.getMonth() !== 7) {
        conjuntoNoLectivos.add(ev);
      }
    }
  });

  let diasNaturales = 0;
  let diasFinSemana = 0;
  let diasFestivosLaborables = 0;
  let diasLectivos = 0;

  const actual = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), 0, 0, 0);
  const limite = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate(), 0, 0, 0);

  while (actual <= limite) {
    diasNaturales += 1;
    const esFin = esFinDeSemana(actual);
    const cadenaActual = formatearFechaISO(actual);
    const esAgosto = actual.getMonth() === 7;

    // Agosto corresponde al periodo vacacional legal estival: no computa como día lectivo
    // ni como día festivo propio del curso escolar.
    if (esAgosto) {
      if (esFin) {
        diasFinSemana += 1;
      }
    } else if (esFin) {
      diasFinSemana += 1;
    } else if (conjuntoNoLectivos.has(cadenaActual)) {
      diasFestivosLaborables += 1;
    } else {
      diasLectivos += 1;
    }

    actual.setDate(actual.getDate() + 1);
  }

  // Formato numérico estándar en España utilizando la coma como separador decimal.
  const semanasLectivas = (diasLectivos / 5).toFixed(1).replace('.', ',');

  return {
    diasNaturales,
    diasFinSemana,
    diasFestivosLaborables,
    diasLectivos,
    semanasLectivas,
    totalNoLectivos: conjuntoNoLectivos.size,
    totalExamenes,
    totalEvaluaciones
  };
};

/**
 * Extrae el año inicial de un curso escolar (ej. "2024/2025" -> 2024).
 * En caso de no existir o no tener formato canónico, se deduce de su fecha oficial de inicio o fecha actual.
 *
 * @param {Object} curso - Objeto de curso con propiedades anyo y fecha_inicio.
 * @param {Date|string} [fechaInicio] - Fecha oficial de inicio de clases.
 * @returns {number} Año numérico de inicio.
 */
export const extraerAnioInicioCurso = (curso, fechaInicio = null) => {
  if (curso && curso.anyo) {
    const match = String(curso.anyo).match(/\b(20\d{2})\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  const fInicio = fechaInicio instanceof Date ? fechaInicio : parsearFechaISO(curso?.fecha_inicio);
  if (fInicio && !isNaN(fInicio.getTime())) {
    const anio = fInicio.getFullYear();
    const mes = fInicio.getMonth();
    return mes < 8 ? anio - 1 : anio;
  }

  const hoy = new Date();
  return hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
};

export default {
  formatearFechaISO,
  parsearFechaISO,
  formatearFechaEspanol,
  obtenerNombreDiaSemana,
  esFinDeSemana,
  sonMismaFecha,
  generarRangoFechas,
  calcularResumenLectivo,
  extraerAnioInicioCurso
};
