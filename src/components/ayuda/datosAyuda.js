// Definición de datos estáticos para la Guía de Inicio (Onboarding) y el Manual de Módulos Complejos

// Listado de los 6 pasos secuenciales del flujo inicial de configuración curricular
export const PASOS_GUIA_INICIO = [
  {
    numero: 1,
    titulo: 'Crear la Clase y Matricular Discentes',
    subtitulo: 'Vinculación de Curso, Módulo, Evaluaciones y Matrícula Inicial',
    icono: 'pi pi-building',
    ruta: '/clases?pestanya=crear',
    textoBoton: 'Abrir Asistente de Clases',
    descripcion:
      'El primer paso consiste en dar de alta la clase activa mediante el Asistente de Clases. En este flujo integrado se define el curso escolar (ej. 2024/2025), el ciclo y módulo correspondiente, se generan las evaluaciones oficiales del periodo lectivo y se inscriben los discentes en la tabla imparte.',
    tareas: [
      'Seleccionar o dar de alta el curso escolar con sus fechas límite oficiales.',
      'Asociar el ciclo formativo y el módulo profesional correspondiente.',
      'Configurar las evaluaciones del curso (1ª, 2ª, 3ª Evaluación y convocatoria Final).',
      'Matricular a los discentes asegurando que dispongan de su NIA oficial y correo electrónico institucional.'
    ],
    consejo:
      'El asistente de clases integra la selección curricular y la matrícula de alumnos en un único proceso. Cumplimentar el NIA en este momento evitará rechazos al exportar actas oficiales a ITACA.',
    tablas: ['Cursos', 'Modulos', 'Ciclos', 'Evaluaciones', 'Discentes', 'imparte']
  },
  {
    numero: 2,
    titulo: 'Crear el Calendario Escolar',
    subtitulo: 'Definición de Días Lectivos, Festivos y Periodos Vacacionales',
    icono: 'pi pi-calendar',
    ruta: '/planificacion/calendario-escolar',
    textoBoton: 'Ir a Calendario Escolar',
    descripcion:
      'Establece el calendario oficial del curso marcando los días lectivos y no lectivos. Esta configuración es indispensable para que el sistema calcule con exactitud las sesiones disponibles para cada Unidad de Trabajo.',
    tareas: [
      'Marcar los festivos locales, autonómicos y nacionales en el calendario visual.',
      'Definir los periodos vacacionales (Navidad, Pascua/Semana Santa) y jornadas pedagógicas.',
      'Comprobar que el cómputo total de días lectivos coincide con la normativa educativa vigente.'
    ],
    consejo:
      'Definir el calendario escolar antes de temporizar evita tener que recalcular manualmente las fechas de las unidades didácticas.',
    tablas: ['Calendario_Eventos', 'Cursos']
  },
  {
    numero: 3,
    titulo: 'Definir el Horario del Grupo y del Docente',
    subtitulo: 'Configuración de Tramos Horarios, Sesiones y Distribución Semanal',
    icono: 'pi pi-clock',
    ruta: '/planificacion/horarios',
    textoBoton: 'Ir a Gestión de Horarios',
    descripcion:
      'Estructura la cuadrícula semanal con las sesiones lectivas del módulo, especificando días de la semana, tramos de hora, aula asignada y grupo de estudiantes.',
    tareas: [
      'Generar los tramos de sesión horaria (hora de inicio y de fin de cada periodo lectivo).',
      'Asignar a cada casilla de la cuadrícula el módulo, aula y grupo correspondiente.',
      'Configurar las tareas complementarias no lectivas (guardias, tutorías, reuniones de departamento).'
    ],
    consejo:
      'Un horario bien parametrizado permite al generador de temporización proyectar las sesiones reales en las fechas exactas de clase.',
    tablas: ['Sesiones', 'Horarios', 'Modulos']
  },
  {
    numero: 4,
    titulo: 'Asignar Pesos de los Resultados de Aprendizaje (RA)',
    subtitulo: 'Ponderación Curricular de RA y Criterios de Evaluación (CE)',
    icono: 'pi pi-percentage',
    ruta: '/pesos-ra',
    textoBoton: 'Ir a Pesos RA y CE',
    descripcion:
      'Define el peso porcentual de cada Resultado de Aprendizaje en la nota final del módulo, y el peso de cada Criterio de Evaluación respecto a su RA padre para el curso seleccionado.',
    tareas: [
      'Establecer el porcentaje de cada RA verificando que la suma global alcance exactamente el 100%.',
      'Ponderar los Criterios de Evaluación (CE) para que sumen el 100% dentro de cada RA padre.',
      'Guardar la ponderación anual una vez que todos los indicadores de balanceo se muestren en verde.'
    ],
    consejo:
      'El sistema bloquea el guardado si la suma global o alguna de las sumas parciales no totaliza estrictamente el 100%.',
    tablas: ['RA', 'CE', 'ra_curso', 'ce_curso']
  },
  {
    numero: 5,
    titulo: 'Diseñar las Unidades de Trabajo (UT)',
    subtitulo: 'Estructuración del Temario y Cobertura Curricular',
    icono: 'pi pi-folder-open',
    ruta: '/unidades',
    textoBoton: 'Ir a Unidades de Trabajo',
    descripcion:
      'Organiza las unidades didácticas que componen la programación del módulo y asocia a cada una los Resultados de Aprendizaje que se desarrollarán en ella.',
    tareas: [
      'Dar de alta cada Unidad de Trabajo con su número secuencial, título y descripción.',
      'Vincular los Resultados de Aprendizaje (RA) asociados que se abordan en cada unidad.',
      'Comprobar que ningún Resultado de Aprendizaje curricular quede sin cobertura en las unidades.'
    ],
    consejo:
      'La vinculación correcta entre Unidades de Trabajo y RAs garantiza el cumplimiento del currículo oficial en las auditorías de seguimiento.',
    tablas: ['Unidades_Trabajo', 'desarrollan', 'RA']
  },
  {
    numero: 6,
    titulo: 'Crear la Temporización con el Asistente',
    subtitulo: 'Planificación Temporal de Fechas Previstas y Seguimiento de Avance',
    icono: 'pi pi-calendar-times',
    ruta: '/temporizacion',
    textoBoton: 'Ir al Asistente de Temporización',
    descripcion:
      'Instancia las Unidades de Trabajo en el curso actual fijando las fechas estimadas de impartición. Permite comparar la previsión inicial con la ejecución real y reordenar unidades.',
    tareas: [
      'Asignar las fechas previstas de inicio y fin para cada unidad didáctica.',
      'Reordenar las filas mediante arrastre (RowReorder) si se decide alterar la secuencia pedagógica.',
      'Actualizar durante el curso las fechas reales y el estado de avance (Pendiente, En Curso, Completada).'
    ],
    consejo:
      'La funcionalidad de arrastre de filas actualiza automáticamente el campo orden en la base de datos sin alterar el currículo base.',
    tablas: ['Temporizacion', 'Unidades_Trabajo', 'Cursos']
  }
];

// Listado de temas y preguntas técnicas para el Manual de Módulos Complejos
export const TEMAS_MANUAL_COMPLEJO = [
  {
    id: 'calculo-notas',
    categoria: 'Evaluación y Calificaciones',
    titulo: 'Cálculo criterial de notas',
    tituloLargo: '¿Cómo calcula el sistema la nota final de un alumno?',
    icono: 'pi pi-calculator',
    ruta: '/calificar',
    textoBoton: 'Ir a Calificar',
    resumen:
      'Detalle del modelo criterial en cascada, cálculo de notas por RA/CE y diferencia entre evaluación continua y final.',
    secciones: [
      {
        subtitulo: '1. Modelo Criterial en Cascada (LOMLOE / Formación Profesional)',
        texto:
          'El cálculo no se realiza mediante medias aritméticas directas entre exámenes, sino a través de una estructura de agregación competencial ponderada en cuatro niveles:',
        pasos: [
          'Actividades y Prácticas (Versiones): se evalúan con una nota numérica estricta entre 0 y 100.',
          'Cobertura de Criterios (trabajan): cada actividad evalúa uno o varios Criterios de Evaluación (CE) con un porcentaje asignado.',
          'Ponderación de Criterios en el RA (ce_curso): la nota del CE se pondera según el peso fijado para el curso.',
          'Ponderación de Resultados de Aprendizaje en el Módulo (ra_curso): cada RA aporta su porcentaje a la nota global.'
        ]
      },
      {
        subtitulo: '2. Evaluación Continua frente a Evaluación Final Oficial',
        texto:
          'El sistema soporta dos modos de cálculo adaptados al ritmo del curso escolar:',
        detalles: [
          {
            etiqueta: 'Evaluación Continua (Boletines Trimestrales)',
            descripcion:
              'Calcula la nota acumulada únicamente con los RA cuyos criterios han sido evaluados en su totalidad hasta la fecha. El resultado se reescala proporcionalmente a base 100 para no penalizar al alumno por contenidos que aún no se han impartido.'
          },
          {
            etiqueta: 'Evaluación Final Oficial (Acta)',
            descripcion:
              'Aplica la ponderación estricta del 100% sobre el currículo completo del módulo. Cualquier Resultado de Aprendizaje sin calificar computa con valor 0.'
          }
        ]
      },
      {
        subtitulo: '3. Escala Numérica y Código Cromático Institucional',
        texto:
          'Las calificaciones se expresan en números enteros de 0 a 100 y siguen estrictamente el estándar visual de notas del sistema:',
        escalas: [
          { rango: '0 - 49', texto: 'Suspenso', notaEjemplo: 35 },
          { rango: '50 - 59', texto: 'Suficiente', notaEjemplo: 55 },
          { rango: '60 - 69', texto: 'Bien', notaEjemplo: 65 },
          { rango: '70 - 89', texto: 'Notable', notaEjemplo: 80 },
          { rango: '90 - 100', texto: 'Sobresaliente', notaEjemplo: 95 }
        ]
      }
    ]
  },
  {
    id: 'exportacion-itaca',
    categoria: 'Integraciones Oficiales',
    titulo: 'Exportación oficial a ITACA',
    tituloLargo: '¿Cómo exportar a ITACA correctamente?',
    icono: 'pi pi-file-export',
    ruta: '/herramientas/exportador',
    textoBoton: 'Ir al Exportador Oficial',
    resumen:
      'Generación de archivos CSV con delimitador punto y coma y conversión de escala a la plataforma oficial de la Generalitat Valenciana.',
    secciones: [
      {
        subtitulo: '1. Requisitos Previos y Formato Oficial',
        texto:
          'ITACA (sistema de gestión educativa de la Generalitat Valenciana) exige un fichero con parámetros estrictos para la carga masiva de actas:',
        pasos: [
          'Todos los discentes deben tener asignado su NIA (Número de Identificación del Alumnado). Los alumnos sin NIA provocarán el rechazo íntegro del fichero.',
          'El delimitador de columnas debe ser exclusivamente el punto y coma (;).',
          'La codificación de texto del archivo debe ser UTF-8 sin marca de orden de bytes (BOM).'
        ]
      },
      {
        subtitulo: '2. Conversión Automática de Calificaciones',
        texto:
          'Dado que internamente el sistema trabaja con una escala de 0 a 100 y las actas oficiales de Formación Profesional en ITACA se registran de 1 a 10 en números enteros, el exportador realiza una traslación matemática normalizada con redondeo normativo antes de componer el archivo CSV.'
      },
      {
        subtitulo: '3. Procedimiento de Descarga',
        texto:
          'Para generar el archivo, acceda a Herramientas > Exportador Oficial > pestaña Exportar a ITACA. Seleccione el Curso, Módulo y Evaluación correspondiente y pulse Descargar CSV ITACA.'
      }
    ]
  },
  {
    id: 'exportacion-aules',
    categoria: 'Integraciones Oficiales',
    titulo: 'Exportación a Aules (Moodle)',
    tituloLargo: '¿Cómo exportar calificaciones a Aules (Moodle)?',
    icono: 'pi pi-cloud-upload',
    ruta: '/herramientas/exportador',
    textoBoton: 'Ir al Exportador Oficial',
    resumen:
      'Sincronización de notas de actividades con el libro de calificaciones de la plataforma Moodle mediante CSV delimitado por comas.',
    secciones: [
      {
        subtitulo: '1. Formato Requerido por Aules',
        texto:
          'A diferencia de ITACA, el libro de calificaciones de Aules (Moodle) utiliza el estándar internacional de importación de calificaciones:',
        pasos: [
          'Delimitador de campos por coma (,).',
          'Columna identificadora obligatoria basada en la Dirección de correo electrónico del alumno (correo corporativo institucional).',
          'Una columna por cada actividad o práctica seleccionada, conservando la nota en base 0-100.'
        ]
      },
      {
        subtitulo: '2. Selección Múltiple de Actividades',
        texto:
          'En la pestaña Exportar a Aules del Exportador Oficial, puede seleccionar simultáneamente varias actividades (Versiones) para consolidar sus notas en un único documento de carga.'
      }
    ]
  },
  {
    id: 'asistente-temporizacion',
    categoria: 'Planificación Didáctica',
    titulo: 'Temporización y seguimiento',
    tituloLargo: '¿Cómo funciona el Asistente de Temporización de Unidades?',
    icono: 'pi pi-calendar-times',
    ruta: '/temporizacion',
    textoBoton: 'Ir a Temporización',
    resumen:
      'Planificación temporal, reordenación interactiva de unidades con RowReorder y contraste entre previsión y ejecución real.',
    secciones: [
      {
        subtitulo: '1. Independencia entre Currículo Base e Instancia Temporal',
        texto:
          'La tabla Unidades_Trabajo define la programación teórica del módulo (número de unidad y título curricular). La tabla Temporizacion registra la planificación concreta para un curso escolar, lo que permite reutilizar el temario año tras año sin duplicar datos.'
      },
      {
        subtitulo: '2. Reordenación por Arrastre (RowReorder)',
        texto:
          'El docente puede reorganizar el orden secuencial de impartición arrastrando las filas en la tabla de temporización. La aplicación recalcula automáticamente el orden secuencial de todas las unidades afectadas y actualiza la base de datos en segundo plano.'
      },
      {
        subtitulo: '3. Seguimiento de Fechas Previstas frente a Reales',
        texto:
          'Cada unidad permite registrar tanto el intervalo previsto (fecha_ini_prevista y fecha_fin_prevista) como las fechas en que efectivamente se impartió en el aula, permitiendo identificar desviaciones y justificar modificaciones en la memoria anual.'
      }
    ]
  },
  {
    id: 'pesos-curriculares',
    categoria: 'Evaluación y Calificaciones',
    titulo: 'Pesos curriculares (RA y CE)',
    tituloLargo: '¿Cómo configurar y validar los Pesos Curriculares (RA y CE)?',
    icono: 'pi pi-sliders-h',
    ruta: '/pesos-ra',
    textoBoton: 'Ir a Pesos Curriculares',
    resumen:
      'Jerarquía de ponderaciones, bloqueo de seguridad al 100% y almacenamiento por curso escolar.',
    secciones: [
      {
        subtitulo: '1. Regla de Balanceo Obligatorio',
        texto:
          'Para garantizar la equidad y el rigor curricular, el sistema impone dos niveles de validación matemática en tiempo real:',
        pasos: [
          'Nivel Global (Módulo): la suma de los porcentajes de todos los Resultados de Aprendizaje debe totalizar exactamente 100%.',
          'Nivel Local (Por cada RA): la suma de los pesos de los Criterios de Evaluación subordinados a un RA debe totalizar exactamente 100%.'
        ]
      },
      {
        subtitulo: '2. Bloqueo de Seguridad',
        texto:
          'El botón de Guardar Ponderación permanece deshabilitado mientras exista algún desajuste numérico. La interfaz muestra indicadores cromáticos (verde cuando la suma es 100%, rojo en cualquier otro caso) en cada bloque jerárquico.'
      }
    ]
  },
  {
    id: 'taller-practicas',
    categoria: 'Evaluación y Calificaciones',
    titulo: 'Prácticas y Versiones anuales',
    tituloLargo: '¿Cuál es la diferencia entre Prácticas Maestras y Versiones Anuales?',
    icono: 'pi pi-briefcase',
    ruta: '/taller-practicas',
    textoBoton: 'Ir al Taller de Prácticas',
    resumen:
      'Estructura de catálogo reutilizable frente a actividades instanciadas por curso, evaluación y criterios asociados.',
    secciones: [
      {
        subtitulo: '1. Prácticas Maestras (Catálogo)',
        texto:
          'Representan el catálogo general de actividades didácticas vinculadas a un módulo formativo. Contienen la definición general, tipología (ej. Individual, Grupal, Reto) y descripción pedagógica sin ligarse a ningún año concreto.'
      },
      {
        subtitulo: '2. Versiones Anuales (Instancias de Curso)',
        texto:
          'Representan la ejecución de esa práctica en un curso escolar específico. Cada versión define el enunciado adaptado, el periodo de evaluación (1ª, 2ª o 3ª), la Unidad de Trabajo donde se imparte, el peso de evaluación y los Criterios de Evaluación evaluados en la tabla trabajan.'
      }
    ]
  },
  {
    id: 'herramientas-seguridad',
    categoria: 'Herramientas y Seguridad',
    titulo: 'Seguridad y clonado de cursos',
    tituloLargo: '¿Cómo funcionan las Copias de Seguridad y el Clonado de Cursos?',
    icono: 'pi pi-shield',
    ruta: '/herramientas/copias-seguridad',
    textoBoton: 'Ir a Copias de Seguridad',
    resumen:
      'Salvaguarda integral de datos en formato JSON/ZIP y duplicación de estructura curricular para arrancar un nuevo curso escolar.',
    secciones: [
      {
        subtitulo: '1. Copias de Seguridad Integrales',
        texto:
          'Permiten descargar una instantánea completa de la base de datos en formato JSON estructurado o paquete comprimido ZIP. Este archivo puede restaurarse en cualquier momento desde la sección de Copias de Seguridad.'
      },
      {
        subtitulo: '2. Asistente de Clonado de Curso',
        texto:
          'Al iniciar un nuevo año académico, el asistente de clonado duplica la estructura curricular del curso anterior (unidades didácticas, temporizaciones, ponderaciones de RA/CE y versiones de prácticas) sin trasladar notas ni datos sensibles de alumnos anteriores, ahorrando horas de configuración.'
      }
    ]
  },
  {
    id: 'visor-enlace-magico',
    categoria: 'Evaluación y Calificaciones',
    titulo: 'Visor del discente (Enlaces mágicos)',
    tituloLargo: '¿Cómo funciona el Visor del Discente y los Enlaces Mágicos?',
    icono: 'pi pi-link',
    ruta: '/discentes',
    textoBoton: 'Ir a Discentes',
    resumen:
      'Acceso privado y transparente de solo lectura para los alumnos sin requerir cuentas de usuario en la aplicación.',
    secciones: [
      {
        subtitulo: '1. Privacidad y Ausencia de Autenticación para Discentes',
        texto:
          'Los estudiantes no tienen cuentas de usuario con contraseña en el ERP. Para consultar sus calificaciones y retroalimentación, el docente puede generar un Enlace Mágico único y cifrado para cada alumno.'
      },
      {
        subtitulo: '2. Vista de Solo Lectura',
        texto:
          'A través de ese enlace, el discente accede a una vista pública de solo lectura que detalla su progreso competencial, desglose de notas por Criterio de Evaluación y las observaciones docentes registradas en sus actividades.'
      }
    ]
  }
];

// Categorías disponibles para el filtrado rápido en el Manual de Módulos Complejos
export const CATEGORIAS_MANUAL = [
  'Todas',
  'Evaluación y Calificaciones',
  'Integraciones Oficiales',
  'Planificación Didáctica',
  'Herramientas y Seguridad'
];
