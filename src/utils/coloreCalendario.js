// Utilidad para la gestión y asignación de colores de los eventos del Calendario Escolar.

// Definición canónica de los 6 tipos de eventos del calendario y su paleta cromática estandarizada.
export const TIPOS_EVENTO = {
  FESTIVO_NACIONAL: {
    id: 'festivo_nacional',
    tipo: 'Festivo Nacional',
    color: '#ef4444', // Rojo
    colorFondo: '#fee2e2',
    colorTexto: '#ffffff',
    colorBorde: '#dc2626',
    esLectivo: false,
    descripcion: 'Festivo de ámbito nacional (no lectivo)'
  },
  FESTIVO_LOCAL: {
    id: 'festivo_local',
    tipo: 'Festivo Local',
    color: '#eab308', // Amarillo
    colorFondo: '#fef9c3',
    colorTexto: '#000000',
    colorBorde: '#ca8a04',
    esLectivo: false,
    descripcion: 'Festivo autonómico o local (no lectivo)'
  },
  VACACIONES: {
    id: 'vacaciones',
    tipo: 'Vacaciones',
    color: '#3b82f6', // Azul
    colorFondo: '#dbeafe',
    colorTexto: '#ffffff',
    colorBorde: '#2563eb',
    esLectivo: false,
    descripcion: 'Periodo de vacaciones escolares (no lectivo)'
  },
  EVALUACION: {
    id: 'evaluacion',
    tipo: 'Evaluación',
    color: '#86efac', // Verde Claro
    colorFondo: '#dcfce7',
    colorTexto: '#14532d',
    colorBorde: '#4ade80',
    esLectivo: true,
    descripcion: 'Sesión de evaluación ordinaria o final (lectivo)'
  },
  EXAMEN: {
    id: 'examen',
    tipo: 'Examen',
    color: '#f97316', // Naranja
    colorFondo: '#ffedd5',
    colorTexto: '#ffffff',
    colorBorde: '#ea580c',
    esLectivo: true,
    descripcion: 'Prueba objetiva o examen parcial/final (lectivo)'
  },
  ANOTACION: {
    id: 'anotacion',
    tipo: 'Anotación / Excursión',
    color: '#a855f7', // Morado
    colorFondo: '#f3e8ff',
    colorTexto: '#ffffff',
    colorBorde: '#9333ea',
    esLectivo: true,
    descripcion: 'Anotación pedagógica, excursión o actividad complementaria (lectivo)'
  }
};

// Lista plana de tipos de evento para iteraciones en selectores y paletas.
export const LISTA_TIPOS_EVENTO = Object.values(TIPOS_EVENTO);

/**
 * Normaliza y busca la configuración correspondiente a un tipo de evento.
 *
 * @param {string} tipoEvento - Nombre o identificador del tipo de evento.
 * @returns {Object} Configuración cromática y de lectividad.
 */
export const obtenerConfiguracionTipoEvento = (tipoEvento) => {
  if (!tipoEvento) return null;
  const texto = String(tipoEvento).trim().toLowerCase();

  // Búsqueda por nombre exacto o coincidencia de palabras clave.
  if (texto.includes('nacional')) return TIPOS_EVENTO.FESTIVO_NACIONAL;
  if (texto.includes('local') || texto.includes('autonómico') || texto.includes('autonomico')) return TIPOS_EVENTO.FESTIVO_LOCAL;
  if (texto.includes('vacaci')) return TIPOS_EVENTO.VACACIONES;
  if (texto.includes('evalua')) return TIPOS_EVENTO.EVALUACION;
  if (texto.includes('examen') || texto.includes('prueba')) return TIPOS_EVENTO.EXAMEN;
  if (texto.includes('anota') || texto.includes('excurs')) return TIPOS_EVENTO.ANOTACION;

  const coincidencia = LISTA_TIPOS_EVENTO.find(
    (t) => t.tipo.toLowerCase() === texto
  );

  return coincidencia || {
    tipo: tipoEvento,
    color: '#64748b',
    colorFondo: '#f1f5f9',
    colorTexto: '#ffffff',
    colorBorde: '#475569',
    esLectivo: true,
    descripcion: tipoEvento
  };
};

/**
 * Devuelve el color principal en hexadecimal asignado a un tipo de evento.
 *
 * @param {string} tipoEvento - Nombre del tipo de evento.
 * @returns {string} Código hexadecimal de color.
 */
export const obtenerColorEvento = (tipoEvento) => {
  const config = obtenerConfiguracionTipoEvento(tipoEvento);
  return config ? config.color : '#64748b';
};

/**
 * Determina si el tipo de evento es lectivo según la especificación del negocio.
 *
 * @param {string} tipoEvento - Nombre del tipo de evento.
 * @returns {boolean} True si es lectivo, false si es no lectivo.
 */
export const esEventoLectivo = (tipoEvento) => {
  const config = obtenerConfiguracionTipoEvento(tipoEvento);
  return config ? config.esLectivo : true;
};

/**
 * Devuelve el color de texto óptimo para contrastar con el fondo del evento.
 *
 * @param {string} tipoEvento - Nombre del tipo de evento.
 * @returns {string} Código hexadecimal de color de texto.
 */
export const obtenerColorTextoEvento = (tipoEvento) => {
  const config = obtenerConfiguracionTipoEvento(tipoEvento);
  return config ? config.colorTexto : '#ffffff';
};

export default {
  TIPOS_EVENTO,
  LISTA_TIPOS_EVENTO,
  obtenerConfiguracionTipoEvento,
  obtenerColorEvento,
  esEventoLectivo,
  obtenerColorTextoEvento
};
