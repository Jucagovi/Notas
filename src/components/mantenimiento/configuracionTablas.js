// Configuración técnica y visual de todas las tablas para las pantallas de mantenimiento

export const TABLAS_MAESTRAS = {
  ciclos: {
    slug: 'ciclos',
    nombreTabla: 'Ciclos',
    clavePrimaria: 'id_ciclo',
    titulo: 'Ciclos Formativos',
    singular: 'Ciclo',
    icono: 'pi pi-graduation-cap',
    descripcion: 'Gestión de titulaciones y ciclos formativos oficiales.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/ciclos',
    columnas: [
      { campo: 'siglas', encabezado: 'Siglas', ancho: '120px', ordenar: true, filtrar: true },
      { campo: 'nombre', encabezado: 'Nombre del Ciclo', ancho: '250px', ordenar: true, filtrar: true },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '350px', ordenar: false, filtrar: false }
    ],
    camposFormulario: [
      { campo: 'siglas', etiqueta: 'Siglas', tipo: 'texto', requerido: true, marcador: 'Ej: DAW, DAM, ASIR' },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: Desarrollo de Aplicaciones Web' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false, marcador: 'Detalles curriculares del ciclo' }
    ]
  },
  cursos: {
    slug: 'cursos',
    nombreTabla: 'Cursos',
    clavePrimaria: 'id_curso',
    titulo: 'Cursos Académicos',
    singular: 'Curso',
    icono: 'pi pi-calendar',
    descripcion: 'Años académicos y centros de impartición.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/cursos',
    columnas: [
      { campo: 'anyo', encabezado: 'Año Académico', ancho: '140px', ordenar: true, filtrar: true },
      { campo: 'nombre', encabezado: 'Nombre', ancho: '220px', ordenar: true, filtrar: true },
      { campo: 'centro', encabezado: 'Centro Educativo', ancho: '200px', ordenar: true, filtrar: true },
      { campo: 'fecha_inicio', encabezado: 'Fecha Inicio', ancho: '140px', ordenar: true, tipo: 'fecha' },
      { campo: 'fecha_fin', encabezado: 'Fecha Fin', ancho: '140px', ordenar: true, tipo: 'fecha' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '250px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'anyo', etiqueta: 'Año Académico', tipo: 'texto', requerido: true, marcador: 'Ej: 2024/2025' },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: Curso 2024-25 DAW' },
      { campo: 'centro', etiqueta: 'Centro Educativo', tipo: 'texto', requerido: true, marcador: 'Ej: IES Tecnológico' },
      { campo: 'fecha_inicio', etiqueta: 'Fecha Inicio', tipo: 'fecha', requerido: false },
      { campo: 'fecha_fin', etiqueta: 'Fecha Fin', tipo: 'fecha', requerido: false },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  modulos: {
    slug: 'modulos',
    nombreTabla: 'Modulos',
    clavePrimaria: 'id_modulo',
    titulo: 'Módulos Profesionales',
    singular: 'Módulo',
    icono: 'pi pi-book',
    descripcion: 'Asignaturas o módulos formativos de cada ciclo.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/modulos',
    tablasReferenciadas: [
      { tabla: 'Ciclos', clave: 'id_ciclo', campoTexto: 'nombre', campoAlternativo: 'siglas' }
    ],
    columnas: [
      { campo: 'siglas', encabezado: 'Siglas', ancho: '110px', ordenar: true, filtrar: true },
      { campo: 'nombre', encabezado: 'Nombre del Módulo', ancho: '260px', ordenar: true, filtrar: true },
      { campo: 'id_ciclo', encabezado: 'Ciclo Formativo', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Ciclos' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '300px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'siglas', etiqueta: 'Siglas', tipo: 'texto', requerido: true, marcador: 'Ej: DWES, PROG' },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: Desarrollo Web en Entorno Servidor' },
      { campo: 'id_ciclo', etiqueta: 'Ciclo Formativo', tipo: 'desplegable', requerido: false, tablaReferencia: 'Ciclos' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  'unidades-trabajo': {
    slug: 'unidades-trabajo',
    nombreTabla: 'Unidades_Trabajo',
    clavePrimaria: 'id_ut',
    titulo: 'Unidades de Trabajo',
    singular: 'Unidad de Trabajo',
    icono: 'pi pi-folder',
    descripcion: 'Unidades de trabajo y contenidos curriculares.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/unidades-trabajo',
    tablasReferenciadas: [
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre', campoAlternativo: 'siglas' }
    ],
    columnas: [
      { campo: 'numero', encabezado: 'Nº', ancho: '80px', ordenar: true, filtrar: true, tipo: 'numero' },
      { campo: 'nombre', encabezado: 'Nombre de la UT', ancho: '280px', ordenar: true, filtrar: true },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '320px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'numero', etiqueta: 'Número de UT', tipo: 'numero', requerido: true, min: 1, max: 100 },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: UT 1. Introducción al entorno' },
      { campo: 'id_modulo', etiqueta: 'Módulo Asociado', tipo: 'desplegable', requerido: true, tablaReferencia: 'Modulos' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  ra: {
    slug: 'ra',
    nombreTabla: 'RA',
    clavePrimaria: 'id_ra',
    titulo: 'Resultados de Aprendizaje (RA)',
    singular: 'Resultado de Aprendizaje',
    icono: 'pi pi-check-circle',
    descripcion: 'Resultados de aprendizaje oficiales del currículo.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/ra',
    tablasReferenciadas: [
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre', campoAlternativo: 'siglas' }
    ],
    columnas: [
      { campo: 'numero', encabezado: 'RA Nº', ancho: '90px', ordenar: true, filtrar: true, tipo: 'numero' },
      { campo: 'nombre', encabezado: 'Enunciado', ancho: '320px', ordenar: true, filtrar: true },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '300px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'numero', etiqueta: 'Número de RA', tipo: 'numero', requerido: true, min: 1, max: 20 },
      { campo: 'nombre', etiqueta: 'Enunciado / Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: RA 1. Desarrolla aplicaciones cliente' },
      { campo: 'id_modulo', etiqueta: 'Módulo Asociado', tipo: 'desplegable', requerido: true, tablaReferencia: 'Modulos' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  ce: {
    slug: 'ce',
    nombreTabla: 'CE',
    clavePrimaria: 'id_ce',
    titulo: 'Criterios de Evaluación (CE)',
    singular: 'Criterio de Evaluación',
    icono: 'pi pi-list-check',
    descripcion: 'Criterios de evaluación vinculados a cada RA.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/ce',
    tablasReferenciadas: [
      { tabla: 'RA', clave: 'id_ra', campoTexto: 'nombre', prefijo: 'RA' }
    ],
    columnas: [
      { campo: 'numero', encabezado: 'Código CE', ancho: '110px', ordenar: true, filtrar: true },
      { campo: 'nombre', encabezado: 'Enunciado', ancho: '320px', ordenar: true, filtrar: true },
      { campo: 'id_ra', encabezado: 'Resultado de Aprendizaje', ancho: '240px', tipo: 'relacion', tablaReferencia: 'RA' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '280px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'numero', etiqueta: 'Código / Número', tipo: 'texto', requerido: true, marcador: 'Ej: a, b, 1.a' },
      { campo: 'nombre', etiqueta: 'Enunciado del Criterio', tipo: 'texto', requerido: true, marcador: 'Ej: Se han identificado los elementos...' },
      { campo: 'id_ra', etiqueta: 'RA Asociado', tipo: 'desplegable', requerido: true, tablaReferencia: 'RA' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  practicas: {
    slug: 'practicas',
    nombreTabla: 'Practicas',
    clavePrimaria: 'id_practica',
    titulo: 'Banco de Prácticas Maestro',
    singular: 'Práctica',
    icono: 'pi pi-file-edit',
    descripcion: 'Repositorio maestro de actividades y ejercicios evaluables.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/practicas',
    tablasReferenciadas: [
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre', campoAlternativo: 'siglas' }
    ],
    columnas: [
      { campo: 'nombre', encabezado: 'Nombre de la Práctica', ancho: '260px', ordenar: true, filtrar: true },
      { campo: 'id_tipopractica', encabezado: 'Tipo', ancho: '130px', ordenar: true, filtrar: true },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '320px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'nombre', etiqueta: 'Nombre de la Práctica', tipo: 'texto', requerido: true, marcador: 'Ej: Práctica 1 - Maquetación CSS' },
      {
        campo: 'id_tipopractica',
        etiqueta: 'Tipo de Práctica',
        tipo: 'opciones_fijas',
        requerido: true,
        opciones: [
          { label: 'Individual', value: 'Individual' },
          { label: 'Grupal', value: 'Grupal' },
          { label: 'Examen', value: 'Examen' },
          { label: 'Proyecto', value: 'Proyecto' }
        ]
      },
      { campo: 'id_modulo', etiqueta: 'Módulo Asociado', tipo: 'desplegable', requerido: true, tablaReferencia: 'Modulos' },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  discentes: {
    slug: 'discentes',
    nombreTabla: 'Discentes',
    clavePrimaria: 'id_discente',
    titulo: 'Discentes (Alumnado)',
    singular: 'Discente',
    icono: 'pi pi-users',
    descripcion: 'Padrón de estudiantes registrados en la plataforma.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/discentes',
    columnas: [
      { campo: 'NIA', encabezado: 'NIA', ancho: '120px', ordenar: true, filtrar: true },
      { campo: 'apellidos', encabezado: 'Apellidos', ancho: '180px', ordenar: true, filtrar: true },
      { campo: 'nombre', encabezado: 'Nombre', ancho: '150px', ordenar: true, filtrar: true },
      { campo: 'correo', encabezado: 'Correo Electrónico', ancho: '220px', ordenar: true, filtrar: true },
      { campo: 'localidad', encabezado: 'Localidad', ancho: '140px', ordenar: true },
      { campo: 'activo', encabezado: 'Activo', ancho: '90px', tipo: 'booleano', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'NIA', etiqueta: 'NIA (Número de Identificación)', tipo: 'texto', requerido: false, marcador: 'Ej: 10458923' },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, marcador: 'Ej: Laura' },
      { campo: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto', requerido: true, marcador: 'Ej: Gómez Pérez' },
      { campo: 'correo', etiqueta: 'Correo Electrónico', tipo: 'texto', requerido: false, marcador: 'Ej: lgomez@instituto.es' },
      { campo: 'fecha_nac', etiqueta: 'Fecha de Nacimiento', tipo: 'fecha', requerido: false },
      { campo: 'localidad', etiqueta: 'Localidad', tipo: 'texto', requerido: false, marcador: 'Ej: Valencia' },
      { campo: 'activo', etiqueta: 'Estudiante en activo', tipo: 'booleano', predeterminado: true }
    ]
  },
  evaluaciones: {
    slug: 'evaluaciones',
    nombreTabla: 'Evaluaciones',
    clavePrimaria: 'id_evaluacion',
    titulo: 'Períodos de Evaluación',
    singular: 'Evaluación',
    icono: 'pi pi-calendar-plus',
    descripcion: 'Convocatorias trimestrales y finales.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/evaluaciones',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre', campoAlternativo: 'anyo' },
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre', campoAlternativo: 'siglas' }
    ],
    columnas: [
      { campo: 'nombre', encabezado: 'Evaluación', ancho: '180px', ordenar: true, filtrar: true },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '160px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'fecha_ini', encabezado: 'Fecha Inicio', ancho: '130px', tipo: 'fecha', ordenar: true },
      { campo: 'fecha_fin', encabezado: 'Fecha Fin', ancho: '130px', tipo: 'fecha', ordenar: true },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '220px', ordenar: false }
    ],
    camposFormulario: [
      {
        campo: 'nombre',
        etiqueta: 'Período de Evaluación',
        tipo: 'opciones_fijas',
        requerido: true,
        opciones: [
          { label: 'Primera Evaluación', value: 'Primera' },
          { label: 'Segunda Evaluación', value: 'Segunda' },
          { label: 'Tercera Evaluación', value: 'Tercera' },
          { label: 'Evaluación Final Ordinaria', value: 'Final' },
          { label: 'Evaluación Extraordinaria', value: 'Extraordinaria' }
        ]
      },
      { campo: 'id_curso', etiqueta: 'Curso Académico', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_modulo', etiqueta: 'Módulo Asociado', tipo: 'desplegable', requerido: true, tablaReferencia: 'Modulos' },
      { campo: 'fecha_ini', etiqueta: 'Fecha Inicio', tipo: 'fecha', requerido: false },
      { campo: 'fecha_fin', etiqueta: 'Fecha Fin', tipo: 'fecha', requerido: false },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'area_texto', requerido: false }
    ]
  },
  sesiones: {
    slug: 'sesiones',
    nombreTabla: 'Sesiones',
    clavePrimaria: 'id_sesion',
    titulo: 'Sesiones Horarias',
    singular: 'Sesión',
    icono: 'pi pi-clock',
    descripcion: 'Tramos y sesiones de clase configuradas para el horario.',
    esRelacion: false,
    rutaBase: '/herramientas/mantenimiento/sesiones',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre', campoAlternativo: 'anyo' }
    ],
    columnas: [
      { campo: 'numero', encabezado: 'Orden / Tramo', ancho: '120px', tipo: 'numero', ordenar: true, filtrar: true },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '180px', ordenar: true, filtrar: true },
      { campo: 'hora_inicio', encabezado: 'Hora Inicio', ancho: '130px', ordenar: true },
      { campo: 'hora_fin', encabezado: 'Hora Fin', ancho: '130px', ordenar: true },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Cursos' }
    ],
    camposFormulario: [
      { campo: 'numero', etiqueta: 'Número / Orden', tipo: 'numero', requerido: true, min: 1, max: 20 },
      { campo: 'descripcion', etiqueta: 'Descripción / Tramo', tipo: 'texto', requerido: false, marcador: 'Ej: 1ª Hora, Recreo' },
      { campo: 'hora_inicio', etiqueta: 'Hora Inicio', tipo: 'texto', requerido: true, marcador: 'Ej: 08:00:00' },
      { campo: 'hora_fin', etiqueta: 'Hora Fin', tipo: 'texto', requerido: true, marcador: 'Ej: 08:55:00' },
      { campo: 'id_curso', etiqueta: 'Curso Académico', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' }
    ]
  }
};

export const TABLAS_RELACIONES = {
  desarrollan: {
    slug: 'desarrollan',
    nombreTabla: 'desarrollan',
    clavePrimaria: 'id_desarrollan',
    titulo: 'Desarrollan (UT - RA)',
    singular: 'Vínculo UT-RA',
    icono: 'pi pi-sitemap',
    descripcion: 'Mapeo entre Unidades de Trabajo y Resultados de Aprendizaje.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/desarrollan',
    tablasReferenciadas: [
      { tabla: 'Unidades_Trabajo', clave: 'id_ut', campoTexto: 'nombre', campoAlternativo: 'numero' },
      { tabla: 'RA', clave: 'id_ra', campoTexto: 'nombre', campoAlternativo: 'numero' }
    ],
    columnas: [
      { campo: 'id_ut', encabezado: 'Unidad de Trabajo', ancho: '300px', tipo: 'relacion', tablaReferencia: 'Unidades_Trabajo', ordenar: true },
      { campo: 'id_ra', encabezado: 'Resultado de Aprendizaje', ancho: '300px', tipo: 'relacion', tablaReferencia: 'RA', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'id_ut', etiqueta: 'Unidad de Trabajo', tipo: 'desplegable', requerido: true, tablaReferencia: 'Unidades_Trabajo' },
      { campo: 'id_ra', etiqueta: 'Resultado de Aprendizaje', tipo: 'desplegable', requerido: true, tablaReferencia: 'RA' }
    ]
  },
  versiones: {
    slug: 'versiones',
    nombreTabla: 'Versiones',
    clavePrimaria: 'id_version',
    titulo: 'Versiones de Prácticas',
    singular: 'Versión',
    icono: 'pi pi-code',
    descripcion: 'Instancias y adaptaciones de prácticas por curso académico.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/versiones',
    tablasReferenciadas: [
      { tabla: 'Practicas', clave: 'id_practica', campoTexto: 'nombre' },
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'Unidades_Trabajo', clave: 'id_ut', campoTexto: 'nombre' },
      { tabla: 'Evaluaciones', clave: 'id_evaluacion', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'numero', encabezado: 'Versión', ancho: '100px', ordenar: true },
      { campo: 'id_practica', encabezado: 'Práctica Base', ancho: '220px', tipo: 'relacion', tablaReferencia: 'Practicas' },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '160px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_ut', encabezado: 'UT', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Unidades_Trabajo' },
      { campo: 'peso_evaluacion', encabezado: 'Peso %', ancho: '90px', tipo: 'numero', ordenar: true },
      { campo: 'enunciado', encabezado: 'Enunciado / Modificaciones', ancho: '260px', ordenar: false }
    ],
    camposFormulario: [
      { campo: 'id_practica', etiqueta: 'Práctica Base', tipo: 'desplegable', requerido: true, tablaReferencia: 'Practicas' },
      { campo: 'id_curso', etiqueta: 'Curso', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'numero', etiqueta: 'Número de Versión', tipo: 'texto', requerido: false, marcador: 'Ej: v1.0, 2024-v2' },
      { campo: 'id_ut', etiqueta: 'Unidad de Trabajo', tipo: 'desplegable', requerido: false, tablaReferencia: 'Unidades_Trabajo' },
      { campo: 'id_evaluacion', etiqueta: 'Evaluación Destino', tipo: 'desplegable', requerido: false, tablaReferencia: 'Evaluaciones' },
      { campo: 'peso_evaluacion', etiqueta: 'Peso en la Evaluación (%)', tipo: 'numero', requerido: false, min: 0, max: 100 },
      { campo: 'enunciado', etiqueta: 'Enunciado personalizado', tipo: 'area_texto', requerido: false }
    ]
  },
  temporizacion: {
    slug: 'temporizacion',
    nombreTabla: 'Temporizacion',
    clavePrimaria: 'id_temporizacion',
    titulo: 'Temporización de Unidades',
    singular: 'Temporización',
    icono: 'pi pi-calendar-times',
    descripcion: 'Planificación temporal de unidades curriculares por curso.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/temporizacion',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'Unidades_Trabajo', clave: 'id_ut', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'orden', encabezado: 'Orden', ancho: '80px', tipo: 'numero', ordenar: true },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '170px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_ut', encabezado: 'Unidad de Trabajo', ancho: '220px', tipo: 'relacion', tablaReferencia: 'Unidades_Trabajo' },
      { campo: 'fecha_ini_prevista', encabezado: 'Inicio Prev.', ancho: '130px', tipo: 'fecha', ordenar: true },
      { campo: 'fecha_fin_prevista', encabezado: 'Fin Prev.', ancho: '130px', tipo: 'fecha', ordenar: true },
      { campo: 'estado', encabezado: 'Estado', ancho: '120px', ordenar: true },
      { campo: 'observaciones', encabezado: 'Observaciones', ancho: '240px' }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_ut', etiqueta: 'Unidad de Trabajo', tipo: 'desplegable', requerido: true, tablaReferencia: 'Unidades_Trabajo' },
      { campo: 'orden', etiqueta: 'Orden de Impartición', tipo: 'numero', requerido: false, min: 1, max: 100 },
      { campo: 'nombre_alternativo', etiqueta: 'Nombre Alternativo', tipo: 'texto', requerido: false },
      { campo: 'fecha_ini_prevista', etiqueta: 'Fecha Inicio Prevista', tipo: 'fecha', requerido: false },
      { campo: 'fecha_fin_prevista', etiqueta: 'Fecha Fin Prevista', tipo: 'fecha', requerido: false },
      {
        campo: 'estado',
        etiqueta: 'Estado',
        tipo: 'opciones_fijas',
        requerido: false,
        opciones: [
          { label: 'Pendiente', value: 'Pendiente' },
          { label: 'En Progreso', value: 'En Progreso' },
          { label: 'Completada', value: 'Completada' }
        ]
      },
      { campo: 'observaciones', etiqueta: 'Observaciones', tipo: 'area_texto', requerido: false }
    ]
  },
  'ra-curso': {
    slug: 'ra-curso',
    nombreTabla: 'ra_curso',
    clavePrimaria: 'id_ra_curso',
    titulo: 'Ponderación RA por Curso',
    singular: 'Ponderación RA',
    icono: 'pi pi-chart-pie',
    descripcion: 'Pesos porcentuales de cada RA en el curso.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/ra-curso',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'RA', clave: 'id_ra', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'id_curso', encabezado: 'Curso', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_ra', encabezado: 'Resultado de Aprendizaje', ancho: '320px', tipo: 'relacion', tablaReferencia: 'RA' },
      { campo: 'peso', encabezado: 'Peso (%)', ancho: '110px', tipo: 'numero', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso Académico', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_ra', etiqueta: 'Resultado de Aprendizaje', tipo: 'desplegable', requerido: true, tablaReferencia: 'RA' },
      { campo: 'peso', etiqueta: 'Peso Porcentual (0-100)', tipo: 'numero', requerido: true, min: 0, max: 100 }
    ]
  },
  'ce-curso': {
    slug: 'ce-curso',
    nombreTabla: 'ce_curso',
    clavePrimaria: 'id_ce_curso',
    titulo: 'Ponderación CE por Curso',
    singular: 'Ponderación CE',
    icono: 'pi pi-percentage',
    descripcion: 'Pesos porcentuales de cada CE en el curso.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/ce-curso',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'CE', clave: 'id_ce', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'id_curso', encabezado: 'Curso', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_ce', encabezado: 'Criterio de Evaluación', ancho: '320px', tipo: 'relacion', tablaReferencia: 'CE' },
      { campo: 'peso', encabezado: 'Peso (%)', ancho: '110px', tipo: 'numero', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso Académico', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_ce', etiqueta: 'Criterio de Evaluación', tipo: 'desplegable', requerido: true, tablaReferencia: 'CE' },
      { campo: 'peso', etiqueta: 'Peso Porcentual (0-100)', tipo: 'numero', requerido: true, min: 0, max: 100 }
    ]
  },
  trabajan: {
    slug: 'trabajan',
    nombreTabla: 'trabajan',
    clavePrimaria: 'id_trabajan',
    titulo: 'Trabajan (CE - Versión)',
    singular: 'Cobertura de Criterio',
    icono: 'pi pi-sliders-h',
    descripcion: 'Ponderación de cobertura de cada CE por versión de práctica.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/trabajan',
    tablasReferenciadas: [
      { tabla: 'CE', clave: 'id_ce', campoTexto: 'nombre' },
      { tabla: 'Versiones', clave: 'id_version', campoTexto: 'numero' }
    ],
    columnas: [
      { campo: 'id_version', encabezado: 'Versión Práctica', ancho: '240px', tipo: 'relacion', tablaReferencia: 'Versiones' },
      { campo: 'id_ce', encabezado: 'Criterio Evaluado', ancho: '320px', tipo: 'relacion', tablaReferencia: 'CE' },
      { campo: 'porcentaje', encabezado: 'Porcentaje (%)', ancho: '130px', tipo: 'numero', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'id_version', etiqueta: 'Versión de Práctica', tipo: 'desplegable', requerido: true, tablaReferencia: 'Versiones' },
      { campo: 'id_ce', etiqueta: 'Criterio de Evaluación', tipo: 'desplegable', requerido: true, tablaReferencia: 'CE' },
      { campo: 'porcentaje', etiqueta: 'Porcentaje de Cobertura (0-100)', tipo: 'numero', requerido: true, min: 0, max: 100 }
    ]
  },
  imparte: {
    slug: 'imparte',
    nombreTabla: 'imparte',
    clavePrimaria: 'id_imparte',
    titulo: 'Imparte (Matrícula)',
    singular: 'Matrícula',
    icono: 'pi pi-id-card',
    descripcion: 'Asignación de alumnos matriculados por módulo y curso.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/imparte',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre' },
      { tabla: 'Discentes', clave: 'id_discente', campoTexto: 'apellidos', campoAlternativo: 'nombre' }
    ],
    columnas: [
      { campo: 'id_curso', encabezado: 'Curso', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Cursos' },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'id_discente', encabezado: 'Discente', ancho: '240px', tipo: 'relacion', tablaReferencia: 'Discentes' },
      { campo: 'notas', encabezado: 'Notas / Observaciones', ancho: '250px' }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_modulo', etiqueta: 'Módulo', tipo: 'desplegable', requerido: true, tablaReferencia: 'Modulos' },
      { campo: 'id_discente', etiqueta: 'Discente', tipo: 'desplegable', requerido: true, tablaReferencia: 'Discentes' },
      { campo: 'notas', etiqueta: 'Anotaciones', tipo: 'area_texto', requerido: false }
    ]
  },
  evaluan: {
    slug: 'evaluan',
    nombreTabla: 'evaluan',
    clavePrimaria: 'id_evaluan',
    titulo: 'Evalúan (Calificaciones)',
    singular: 'Calificación',
    icono: 'pi pi-calculator',
    descripcion: 'Registro directo de notas obtenidas por alumno en cada evaluación.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/evaluan',
    tablasReferenciadas: [
      { tabla: 'Versiones', clave: 'id_version', campoTexto: 'numero' },
      { tabla: 'Evaluaciones', clave: 'id_evaluacion', campoTexto: 'nombre' },
      { tabla: 'Discentes', clave: 'id_discente', campoTexto: 'apellidos', campoAlternativo: 'nombre' }
    ],
    columnas: [
      { campo: 'id_discente', encabezado: 'Discente', ancho: '230px', tipo: 'relacion', tablaReferencia: 'Discentes' },
      { campo: 'id_evaluacion', encabezado: 'Evaluación', ancho: '180px', tipo: 'relacion', tablaReferencia: 'Evaluaciones' },
      { campo: 'id_version', encabezado: 'Versión', ancho: '160px', tipo: 'relacion', tablaReferencia: 'Versiones' },
      { campo: 'nota', encabezado: 'Nota (0-100)', ancho: '120px', tipo: 'numero', ordenar: true }
    ],
    camposFormulario: [
      { campo: 'id_discente', etiqueta: 'Discente', tipo: 'desplegable', requerido: true, tablaReferencia: 'Discentes' },
      { campo: 'id_evaluacion', etiqueta: 'Evaluación', tipo: 'desplegable', requerido: true, tablaReferencia: 'Evaluaciones' },
      { campo: 'id_version', etiqueta: 'Versión de Práctica', tipo: 'desplegable', requerido: true, tablaReferencia: 'Versiones' },
      { campo: 'nota', etiqueta: 'Nota Numérica (0-100)', tipo: 'numero', requerido: true, min: 0, max: 100 }
    ]
  },
  festivos: {
    slug: 'festivos',
    nombreTabla: 'Calendario_Eventos',
    clavePrimaria: 'id_evento',
    titulo: 'Eventos del Calendario Escolar',
    singular: 'Evento',
    icono: 'pi pi-calendar',
    descripcion: 'Eventos, festivos y no lectivos del calendario escolar por curso.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/festivos',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'fecha_inicio', encabezado: 'Fecha Inicio', ancho: '140px', tipo: 'fecha', ordenar: true, filtrar: true },
      { campo: 'fecha_fin', encabezado: 'Fecha Fin', ancho: '140px', tipo: 'fecha', ordenar: true, filtrar: true },
      { campo: 'tipo_evento', encabezado: 'Tipo de Evento', ancho: '180px', tipo: 'texto', ordenar: true, filtrar: true },
      { campo: 'es_lectivo', encabezado: 'Lectivo', ancho: '100px', tipo: 'booleano', ordenar: true },
      { campo: 'descripcion', encabezado: 'Descripción', ancho: '240px', ordenar: true, filtrar: true },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Cursos' }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'fecha_inicio', etiqueta: 'Fecha Inicio', tipo: 'fecha', requerido: true },
      { campo: 'fecha_fin', etiqueta: 'Fecha Fin', tipo: 'fecha', requerido: true },
      { campo: 'tipo_evento', etiqueta: 'Tipo de Evento', tipo: 'texto', requerido: true, marcador: 'Ej: Festivo Nacional, Vacaciones' },
      { campo: 'es_lectivo', etiqueta: 'Es Lectivo', tipo: 'booleano', requerido: true },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: false, marcador: 'Ej: Fiesta Nacional, Navidad' }
    ]
  },
  horarios: {
    slug: 'horarios',
    nombreTabla: 'Horarios',
    clavePrimaria: 'id_horario',
    titulo: 'Cuadrícula de Horarios',
    singular: 'Horario',
    icono: 'pi pi-th-large',
    descripcion: 'Distribución semanal de módulos, grupos y aulas.',
    esRelacion: true,
    rutaBase: '/herramientas/relaciones/horarios',
    tablasReferenciadas: [
      { tabla: 'Cursos', clave: 'id_curso', campoTexto: 'nombre' },
      { tabla: 'Sesiones', clave: 'id_sesion', campoTexto: 'descripcion' },
      { tabla: 'Modulos', clave: 'id_modulo', campoTexto: 'nombre' }
    ],
    columnas: [
      { campo: 'dia_semana', encabezado: 'Día (1-7)', ancho: '100px', tipo: 'numero', ordenar: true },
      { campo: 'grupo', encabezado: 'Grupo', ancho: '120px', ordenar: true, filtrar: true },
      { campo: 'id_modulo', encabezado: 'Módulo', ancho: '200px', tipo: 'relacion', tablaReferencia: 'Modulos' },
      { campo: 'profesor', encabezado: 'Profesor', ancho: '160px', ordenar: true },
      { campo: 'aula', encabezado: 'Aula', ancho: '110px', ordenar: true },
      { campo: 'id_sesion', encabezado: 'Sesión', ancho: '160px', tipo: 'relacion', tablaReferencia: 'Sesiones' },
      { campo: 'id_curso', encabezado: 'Curso', ancho: '160px', tipo: 'relacion', tablaReferencia: 'Cursos' }
    ],
    camposFormulario: [
      { campo: 'id_curso', etiqueta: 'Curso', tipo: 'desplegable', requerido: true, tablaReferencia: 'Cursos' },
      { campo: 'id_sesion', etiqueta: 'Sesión / Tramo', tipo: 'desplegable', requerido: true, tablaReferencia: 'Sesiones' },
      {
        campo: 'dia_semana',
        etiqueta: 'Día de la Semana',
        tipo: 'opciones_fijas',
        requerido: true,
        opciones: [
          { label: 'Lunes', value: 1 },
          { label: 'Martes', value: 2 },
          { label: 'Miércoles', value: 3 },
          { label: 'Jueves', value: 4 },
          { label: 'Viernes', value: 5 }
        ]
      },
      { campo: 'grupo', etiqueta: 'Grupo', tipo: 'texto', requerido: true, marcador: 'Ej: 1º DAW, 2º DAM' },
      { campo: 'id_modulo', etiqueta: 'Módulo Asociado', tipo: 'desplegable', requerido: false, tablaReferencia: 'Modulos' },
      { campo: 'modulo_alt', etiqueta: 'Módulo Alternativo (si no está vinculado)', tipo: 'texto', requerido: false },
      { campo: 'profesor', etiqueta: 'Profesor', tipo: 'texto', requerido: false },
      { campo: 'aula', etiqueta: 'Aula', tipo: 'texto', requerido: false, marcador: 'Ej: Aula 102' }
    ]
  }
};

export const TODAS_LAS_TABLAS = {
  ...TABLAS_MAESTRAS,
  ...TABLAS_RELACIONES
};

// Obtiene la configuración de una tabla a partir de su slug o nombre técnico.
export const obtenerConfiguracionTabla = (slugONombre) => {
  if (!slugONombre) return null;
  const clave = slugONombre.toLowerCase();
  return TODAS_LAS_TABLAS[clave] || Object.values(TODAS_LAS_TABLAS).find(
    (t) => t.nombreTabla.toLowerCase() === clave || t.slug.toLowerCase() === clave
  ) || null;
};
