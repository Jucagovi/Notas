// Configuración de elementos y rutas del menú de navegación de la aplicación

// Elementos del submenú Clases
export const ELEMENTOS_CLASES = [
  {
    label: 'Crear Clase',
    icon: 'pi pi-plus-circle',
    to: '/clases?pestanya=crear'
  },
  {
    label: 'Modificar Clase',
    icon: 'pi pi-pencil',
    to: '/clases?pestanya=modificar'
  },
  {
    label: 'Eliminar Clase',
    icon: 'pi pi-trash',
    to: '/clases?pestanya=eliminar'
  }
];

// Elementos del submenú Planificación
export const ELEMENTOS_PLANIFICACION = [
  { label: 'Calendario escolar', icon: 'pi pi-calendar', to: '/planificacion/calendario-escolar' },
  { label: 'Horario', icon: 'pi pi-clock', to: '/planificacion/horarios' },
  { label: 'Unidades de trabajo', icon: 'pi pi-folder-open', to: '/unidades' },
  { label: 'Temporización', icon: 'pi pi-calendar-times', to: '/temporizacion' }
];

// Elementos del submenú Evaluación
export const ELEMENTOS_EVALUACION = [
  { label: 'Asignación RA', icon: 'pi pi-file-edit', to: '/practicas' },
  { label: 'Asignación pesos', icon: 'pi pi-percentage', to: '/pesos' },
  { label: 'Pesos RA y CE', icon: 'pi pi-sliders-h', to: '/pesos-ra' },
  { label: 'Asignación CE', icon: 'pi pi-check-square', to: '/criterios' },
  { label: 'Acta evaluación RA', icon: 'pi pi-table', to: '/informes/acta-evaluacion-ra' },
  { label: 'Acta por trimestres', icon: 'pi pi-file-edit', to: '/informes/evaluacion-modulo' }
];

// Elementos del submenú Informes
export const ELEMENTOS_INFORMES = [
  { label: 'Listado de informes', icon: 'pi pi-list', to: '/informes' },
  { label: 'Acta evaluación RA', icon: 'pi pi-table', to: '/informes/acta-evaluacion-ra' },
  { label: 'Acta por trimestres', icon: 'pi pi-file-edit', to: '/informes/evaluacion-modulo' },
  { label: 'Competencia individual', icon: 'pi pi-compass', to: '/informes/competencia' },
  { label: 'Auditoría Cobertura CE', icon: 'pi pi-verified', to: '/informes/cobertura-ce' },
  { label: 'Calificaciones pendientes', icon: 'pi pi-clock', to: '/informes/calificaciones-pendientes' },
  { label: 'Análisis dificultad', icon: 'pi pi-chart-bar', to: '/informes/dificultad' }
];

// Elementos de mantenimiento y utilidades dentro del submenú Herramientas
export const ELEMENTOS_HERRAMIENTAS = [
  {
    label: 'Copia de seguridad',
    icon: 'pi pi-database',
    to: '/herramientas/copias-seguridad'
  },
  {
    label: 'Importación de datos',
    icon: 'pi pi-file-import',
    to: '/herramientas/importacion'
  },
  {
    label: 'Clonado curso',
    icon: 'pi pi-copy',
    to: '/herramientas/clonado-curso'
  },
  // Tablas maestras
  {
    label: 'Ciclos',
    icon: 'pi pi-graduation-cap',
    to: '/herramientas/mantenimiento/ciclos'
  },
  {
    label: 'Cursos',
    icon: 'pi pi-calendar',
    to: '/herramientas/mantenimiento/cursos'
  },
  {
    label: 'Módulos',
    icon: 'pi pi-book',
    to: '/herramientas/mantenimiento/modulos'
  },
  {
    label: 'Unidades de Trabajo',
    icon: 'pi pi-folder',
    to: '/herramientas/mantenimiento/unidades-trabajo'
  },
  {
    label: 'RA (Resultados)',
    icon: 'pi pi-check-circle',
    to: '/herramientas/mantenimiento/ra'
  },
  {
    label: 'CE (Criterios)',
    icon: 'pi pi-list-check',
    to: '/herramientas/mantenimiento/ce'
  },
  {
    label: 'Prácticas',
    icon: 'pi pi-file-edit',
    to: '/herramientas/mantenimiento/practicas'
  },
  {
    label: 'Discentes',
    icon: 'pi pi-users',
    to: '/herramientas/mantenimiento/discentes'
  },
  {
    label: 'Evaluaciones',
    icon: 'pi pi-calendar-plus',
    to: '/herramientas/mantenimiento/evaluaciones'
  },
  {
    label: 'Sesiones',
    icon: 'pi pi-clock',
    to: '/herramientas/mantenimiento/sesiones'
  },
  // Tablas de relación o sensibles
  {
    label: 'Desarrollan',
    icon: 'pi pi-sitemap',
    to: '/herramientas/relaciones/desarrollan'
  },
  {
    label: 'Versiones',
    icon: 'pi pi-code',
    to: '/herramientas/relaciones/versiones'
  },
  {
    label: 'Temporización',
    icon: 'pi pi-calendar-times',
    to: '/herramientas/relaciones/temporizacion'
  },
  {
    label: 'RA por Curso',
    icon: 'pi pi-chart-pie',
    to: '/herramientas/relaciones/ra-curso'
  },
  {
    label: 'CE por Curso',
    icon: 'pi pi-percentage',
    to: '/herramientas/relaciones/ce-curso'
  },
  {
    label: 'Trabajan',
    icon: 'pi pi-sliders-h',
    to: '/herramientas/relaciones/trabajan'
  },
  {
    label: 'Imparte',
    icon: 'pi pi-id-card',
    to: '/herramientas/relaciones/imparte'
  },
  {
    label: 'Evalúan',
    icon: 'pi pi-calculator',
    to: '/herramientas/relaciones/evaluan'
  },
  {
    label: 'Festivos',
    icon: 'pi pi-sun',
    to: '/herramientas/relaciones/festivos'
  },
  {
    label: 'Horarios',
    icon: 'pi pi-th-large',
    to: '/herramientas/relaciones/horarios'
  }
];

// Elementos principales de la barra de navegación lateral
export const NAV_ITEMS = [
  { label: 'Panel de control', icon: 'pi pi-home', to: '/panel-control' },
  { label: 'Discentes', icon: 'pi pi-users', to: '/discentes' },
  {
    label: 'Clases',
    icon: 'pi pi-building',
    to: '/clases',
    esDesplegable: true,
    subItems: ELEMENTOS_CLASES
  },
  {
    label: 'Planificación',
    icon: 'pi pi-calendar-times',
    to: '/planificacion',
    esDesplegable: true,
    subItems: ELEMENTOS_PLANIFICACION
  },
  {
    label: 'Evaluación',
    icon: 'pi pi-calendar-plus',
    to: '/evaluacion',
    esDesplegable: true,
    subItems: ELEMENTOS_EVALUACION
  },
  { label: 'Calificar', icon: 'pi pi-pencil', to: '/calificar' },
  {
    label: 'Informes',
    icon: 'pi pi-chart-bar',
    to: '/informes',
    esDesplegable: true,
    subItems: ELEMENTOS_INFORMES
  },
  {
    label: 'Herramientas',
    icon: 'pi pi-wrench',
    to: '/herramientas',
    esDesplegable: true,
    subItems: ELEMENTOS_HERRAMIENTAS
  },
  { label: 'Acerca de', icon: 'pi pi-info-circle', to: '/acercaDe' }
];
