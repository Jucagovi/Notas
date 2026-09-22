// Constantes y funciones de utilidad para la gestión de horarios escolares.

// Días lectivos oficiales de la semana (Lunes a Viernes).
export const DIAS_SEMANA = [
  { dia: 1, nombre: 'Lunes', corto: 'Lun' },
  { dia: 2, nombre: 'Martes', corto: 'Mar' },
  { dia: 3, nombre: 'Miércoles', corto: 'Mié' },
  { dia: 4, nombre: 'Jueves', corto: 'Jue' },
  { dia: 5, nombre: 'Viernes', corto: 'Vie' }
];

// Plantilla predeterminada de tramos horarios habituales en centros educativos.
export const TRAMOS_PREDETERMINADOS = [
  { numero: 1, hora_inicio: '08:00:00', hora_fin: '08:55:00', descripcion: '1ª Hora' },
  { numero: 2, hora_inicio: '08:55:00', hora_fin: '09:50:00', descripcion: '2ª Hora' },
  { numero: 3, hora_inicio: '09:50:00', hora_fin: '10:45:00', descripcion: '3ª Hora' },
  { numero: 4, hora_inicio: '10:45:00', hora_fin: '11:15:00', descripcion: 'Recreo' },
  { numero: 5, hora_inicio: '11:15:00', hora_fin: '12:10:00', descripcion: '4ª Hora' },
  { numero: 6, hora_inicio: '12:10:00', hora_fin: '13:05:00', descripcion: '5ª Hora' },
  { numero: 7, hora_inicio: '13:05:00', hora_fin: '14:00:00', descripcion: '6ª Hora' }
];

// Formatea una cadena de hora de la base de datos al formato visual "HH:mm".
export const formatearHoraParaMostrar = (cadenaHora) => {
  if (!cadenaHora) return '';
  const partes = String(cadenaHora).trim().split(':');
  if (partes.length < 2) return String(cadenaHora);
  const horas = partes[0].padStart(2, '0');
  const minutos = partes[1].padStart(2, '0');
  return `${horas}:${minutos}`;
};

// Convierte una hora introducida por el usuario al formato time estándar de PostgreSQL "HH:mm:ss".
export const formatearHoraParaBD = (cadenaHora) => {
  if (!cadenaHora) return '';
  const limpia = String(cadenaHora).trim();
  const partes = limpia.split(':');
  if (partes.length === 2) {
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}:00`;
  }
  if (partes.length >= 3) {
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}:${partes[2].padStart(2, '0')}`;
  }
  return limpia;
};

// Comprueba si una cadena de texto tiene un formato de hora válido HH:mm o HH:mm:ss.
export const esHoraValida = (cadenaHora) => {
  if (!cadenaHora) return false;
  const patron = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
  return patron.test(String(cadenaHora).trim());
};

// Convierte una hora en formato "HH:mm" a minutos totales transcurridos desde las 00:00.
export const convertirHoraAMinutos = (cadenaHora) => {
  if (!cadenaHora) return 0;
  const partes = String(cadenaHora).trim().split(':');
  const horas = Number(partes[0]) || 0;
  const minutos = Number(partes[1]) || 0;
  return horas * 60 + minutos;
};

// Convierte una cantidad de minutos a cadena con formato "HH:mm:ss" o "HH:mm".
export const convertirMinutosAHora = (totalMinutos, conSegundos = true) => {
  const minutosPositivos = Math.max(0, totalMinutos);
  const horas = String(Math.floor(minutosPositivos / 60)).padStart(2, '0');
  const minutos = String(minutosPositivos % 60).padStart(2, '0');
  return conSegundos ? `${horas}:${minutos}:00` : `${horas}:${minutos}`;
};

// Determina si una sesión horaria corresponde a un descanso o recreo.
export const esSesionRecreo = (descripcion) => {
  if (!descripcion) return false;
  const texto = String(descripcion).toLowerCase();
  return texto.includes('recreo') || texto.includes('descanso') || texto.includes('patio');
};

/**
 * Calcula dinámicamente la secuencia de tramos horarios entre una hora de inicio y una hora de fin.
 * Admite la configuración opcional de dos recreos independientes con sus respectivas duraciones y posiciones.
 *
 * @param {Object} opciones
 * @param {string} [opciones.horaInicio='08:00'] - Hora inicial de la jornada en formato HH:mm.
 * @param {string} [opciones.horaFin='15:00'] - Hora final de la jornada en formato HH:mm (por defecto 15:00).
 * @param {number} [opciones.duracionSesionMinutos=55] - Duración de cada clase lectiva en minutos.
 * @param {Object} [opciones.recreo1] - Configuración del primer recreo ({ activo, duracionMinutos, posicion }).
 * @param {Object} [opciones.recreo2] - Configuración del segundo recreo ({ activo, duracionMinutos, posicion }).
 * @param {boolean} [opciones.incluirRecreo=true] - Retrocompatibilidad: indicador de recreo único.
 * @param {number} [opciones.duracionRecreoMinutos=30] - Retrocompatibilidad: duración de recreo único.
 * @param {number} [opciones.posicionRecreo=3] - Retrocompatibilidad: posición de recreo único.
 * @returns {Array<Object>} Lista ordenada de tramos calculados.
 */
export const calcularTramosPersonalizados = ({
  horaInicio = '08:00',
  horaFin = '15:00',
  duracionSesionMinutos = 55,
  recreo1 = null,
  recreo2 = null,
  incluirRecreo = true,
  duracionRecreoMinutos = 20,
  posicionRecreo = 3
}) => {
  if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
    return [];
  }

  const minutosInicio = convertirHoraAMinutos(horaInicio);
  const minutosFin = convertirHoraAMinutos(horaFin);

  if (minutosFin <= minutosInicio) {
    return [];
  }

  const duracionSesion = Math.max(20, Number(duracionSesionMinutos) || 55);

  // Normalización de la lista de recreos activos con sus duraciones y posiciones individuales.
  let listaRecreos = [];

  if (recreo1 || recreo2) {
    if (recreo1 && recreo1.activo) {
      listaRecreos.push({
        id: 'r1',
        posicion: Math.max(1, Number(recreo1.posicion) || 3),
        duracion: Math.max(5, Number(recreo1.duracionMinutos) || 20),
        etiqueta: '1er Recreo'
      });
    }
    if (recreo2 && recreo2.activo) {
      listaRecreos.push({
        id: 'r2',
        posicion: Math.max(1, Number(recreo2.posicion) || 6),
        duracion: Math.max(5, Number(recreo2.duracionMinutos) || 20),
        etiqueta: '2º Recreo'
      });
    }

    // Si solo hay un recreo activo en total, se nombra simplemente como "Recreo".
    if (listaRecreos.length === 1) {
      listaRecreos[0].etiqueta = 'Recreo';
    }
  } else if (incluirRecreo) {
    // Modo de retrocompatibilidad si se llamase con los argumentos clásicos.
    listaRecreos.push({
      id: 'r1',
      posicion: Math.max(1, Number(posicionRecreo) || 3),
      duracion: Math.max(5, Number(duracionRecreoMinutos) || 30),
      etiqueta: 'Recreo'
    });
  }

  // Se ordenan los recreos por la hora lectiva tras la que se intercalan.
  listaRecreos.sort((a, b) => a.posicion - b.posicion);

  const tramosCalculados = [];
  let minutoActual = minutosInicio;
  let ordenTramo = 1;
  let contadorLectivas = 0;
  const recreosInsertados = new Set();

  // Se generan tramos secuencialmente mientras quede margen en la jornada escolar.
  while (minutoActual + 15 <= minutosFin) {
    // Se verifica si tras la sesión actual corresponde intercalar algún recreo no insertado aún.
    const recreoPendiente = listaRecreos.find(
      (r) => r.posicion === contadorLectivas && !recreosInsertados.has(r.id)
    );

    if (recreoPendiente && contadorLectivas > 0) {
      const inicioRecreo = minutoActual;
      const finRecreo = Math.min(minutoActual + recreoPendiente.duracion, minutosFin);

      tramosCalculados.push({
        numero: ordenTramo++,
        hora_inicio: convertirMinutosAHora(inicioRecreo),
        hora_fin: convertirMinutosAHora(finRecreo),
        descripcion: recreoPendiente.etiqueta
      });

      minutoActual = finRecreo;
      recreosInsertados.add(recreoPendiente.id);
      continue;
    }

    // Se calcula la siguiente sesión lectiva.
    contadorLectivas++;
    const inicioSesion = minutoActual;
    let finSesion = minutoActual + duracionSesion;

    // Si el tiempo sobrante hasta el final de la jornada es muy pequeño, se ajusta al límite.
    if (minutosFin - finSesion < 20) {
      finSesion = minutosFin;
    }

    tramosCalculados.push({
      numero: ordenTramo++,
      hora_inicio: convertirMinutosAHora(inicioSesion),
      hora_fin: convertirMinutosAHora(finSesion),
      descripcion: `${contadorLectivas}ª Hora`
    });

    minutoActual = finSesion;
  }

  return tramosCalculados;
};
