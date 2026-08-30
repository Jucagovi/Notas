import { supabase } from './supabaseClient.js';

// Definición descriptiva y metadatos de todas las tablas principales de la base de datos
export const TABLAS_SISTEMA = [
  {
    id: 'Ciclos',
    nombre: 'Ciclos Formativos',
    descripcion: 'Ciclos de Formación Profesional impartidos en el centro educativo.',
    icono: 'pi pi-graduation-cap',
    color: '#1174c0',
    orden: 1
  },
  {
    id: 'Cursos',
    nombre: 'Cursos Académicos',
    descripcion: 'Años lectivos y grupos académicos registrados.',
    icono: 'pi pi-calendar',
    color: '#0ea5e9',
    orden: 2
  },
  {
    id: 'Discentes',
    nombre: 'Discentes (Alumnado)',
    descripcion: 'Expediente, datos de contacto y estado del alumnado.',
    icono: 'pi pi-users',
    color: '#10b981',
    orden: 3
  },
  {
    id: 'Modulos',
    nombre: 'Módulos Profesionales',
    descripcion: 'Asignaturas y materias curriculares de cada ciclo formativo.',
    icono: 'pi pi-book',
    color: '#8b5cf6',
    orden: 4
  },
  {
    id: 'Evaluaciones',
    nombre: 'Evaluaciones',
    descripcion: 'Periodos y convocatorias de evaluación por curso y módulo.',
    icono: 'pi pi-calendar-plus',
    color: '#f59e0b',
    orden: 5
  },
  {
    id: 'Practicas',
    nombre: 'Prácticas y Tareas',
    descripcion: 'Actividades evaluables, enunciados y unidades didácticas.',
    icono: 'pi pi-file-edit',
    color: '#ec4899',
    orden: 6
  },
  {
    id: 'RA',
    nombre: 'Resultados de Aprendizaje (RA)',
    descripcion: 'Resultados de aprendizaje y competencias de cada módulo.',
    icono: 'pi pi-check-circle',
    color: '#6366f1',
    orden: 7
  },
  {
    id: 'CE',
    nombre: 'Criterios de Evaluación (CE)',
    descripcion: 'Criterios de evaluación asociados a cada resultado de aprendizaje.',
    icono: 'pi pi-list-check',
    color: '#14b8a6',
    orden: 8
  },
  {
    id: 'evaluan',
    nombre: 'Calificaciones (Evalúan)',
    descripcion: 'Calificaciones y notas obtenidas por los discentes en las evaluaciones.',
    icono: 'pi pi-star',
    color: '#eab308',
    orden: 9
  },
  {
    id: 'imparte',
    nombre: 'Matriculaciones (Imparte)',
    descripcion: 'Relación de matrícula de discentes en cursos y módulos académicos.',
    icono: 'pi pi-id-card',
    color: '#06b6d4',
    orden: 10
  },
  {
    id: 'trabajan',
    nombre: 'Ponderaciones CE (Trabajan)',
    descripcion: 'Ponderaciones porcentuales de los criterios en cada práctica evaluable.',
    icono: 'pi pi-percentage',
    color: '#a855f7',
    orden: 11
  }
];

// Se genera una marca de tiempo formateada para el nombre de archivo (YYYY-MM-DD_HH-mm-ss)
export const generarMarcaTiempo = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  return `${anio}-${mes}-${dia}_${horas}-${minutos}-${segundos}`;
};

// Se genera un archivo JSON en memoria y se dispara la descarga directa en el navegador
export const descargarJSON = (datos, nombreArchivo) => {
  const contenido = typeof datos === 'string' ? datos : JSON.stringify(datos, null, 2);
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
};

// Se realiza la consulta de todos los registros de una tabla específica en Supabase
export const obtenerTabla = async (nombreTabla) => {
  try {
    const { data, error } = await supabase
      .from(nombreTabla)
      .select('*');

    if (error) {
      console.error(`Error al consultar la tabla ${nombreTabla} en Supabase:`, error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error(`Error inesperado al exportar la tabla ${nombreTabla}:`, err);
    throw err;
  }
};

// Funciones individuales de consulta para cada tabla del esquema
export const getCiclos = () => obtenerTabla('Ciclos');
export const getCursos = () => obtenerTabla('Cursos');
export const getDiscentes = () => obtenerTabla('Discentes');
export const getEvaluaciones = () => obtenerTabla('Evaluaciones');
export const getModulos = () => obtenerTabla('Modulos');
export const getPracticas = () => obtenerTabla('Practicas');
export const getRA = () => obtenerTabla('RA');
export const getCE = () => obtenerTabla('CE');
export const getEvaluan = () => obtenerTabla('evaluan');
export const getImparte = () => obtenerTabla('imparte');
export const getTrabajan = () => obtenerTabla('trabajan');

// Alias en castellano para compatibilidad y consistencia
export const obtenerCiclos = getCiclos;
export const obtenerCursos = getCursos;
export const obtenerDiscentes = getDiscentes;
export const obtenerEvaluaciones = getEvaluaciones;
export const obtenerModulos = getModulos;
export const obtenerPracticas = getPracticas;
export const obtenerRA = getRA;
export const obtenerCE = getCE;
export const obtenerEvaluan = getEvaluan;
export const obtenerImparte = getImparte;
export const obtenerTrabajan = getTrabajan;

// Se obtiene la copia de seguridad completa ejecutando todas las consultas en paralelo mediante Promise.all
export const getCopiaCompleta = async () => {
  const promesas = TABLAS_SISTEMA.map(async (tabla) => {
    const registros = await obtenerTabla(tabla.id);
    return { id: tabla.id, registros };
  });

  const resultados = await Promise.all(promesas);

  // Se construye el objeto consolidado con metadatos y el contenido de cada tabla
  const tablasContenido = {};
  let totalRegistros = 0;

  resultados.forEach(({ id, registros }) => {
    tablasContenido[id] = registros;
    totalRegistros += registros.length;
  });

  const copiaSeguridad = {
    metadatos: {
      aplicacion: 'Control de Notas',
      tipo: 'backup_completo',
      version: '1.0',
      fecha_exportacion: new Date().toISOString(),
      total_tablas: TABLAS_SISTEMA.length,
      total_registros: totalRegistros
    },
    tablas: tablasContenido
  };

  return copiaSeguridad;
};

// Alias en castellano para la obtención completa
export const obtenerCopiaCompleta = getCopiaCompleta;
