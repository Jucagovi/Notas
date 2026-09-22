// Configuración de las tablas maestras disponibles para la importación masiva por CSV

export const TABLAS_IMPORTACION = {
  Discentes: {
    nombreTabla: 'Discentes',
    etiqueta: 'Discentes (Estudiantes)',
    descripcion: 'Carga masiva del censo de estudiantes en el sistema.',
    icono: 'pi pi-users',
    campos: [
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { campo: 'apellidos', etiqueta: 'Apellidos', tipo: 'texto', requerido: true },
      { campo: 'NIA', etiqueta: 'NIA', tipo: 'texto', requerido: false },
      { campo: 'correo', etiqueta: 'Correo Electrónico', tipo: 'correo', requerido: false },
      { campo: 'fecha_nac', etiqueta: 'Fecha de Nacimiento', tipo: 'fecha', requerido: false },
      { campo: 'localidad', etiqueta: 'Localidad', tipo: 'texto', requerido: false },
      { campo: 'activo', etiqueta: 'Activo', tipo: 'booleano', requerido: false, predeterminado: true }
    ],
    ejemploPlantilla: {
      nombre: 'Laura',
      apellidos: 'Gómez Pérez',
      NIA: '10458923',
      correo: 'lgomez@instituto.es',
      fecha_nac: '2005-03-15',
      localidad: 'Valencia',
      activo: 'true'
    }
  },
  Cursos: {
    nombreTabla: 'Cursos',
    etiqueta: 'Cursos Académicos',
    descripcion: 'Carga masiva de cursos y años académicos.',
    icono: 'pi pi-calendar',
    campos: [
      { campo: 'anyo', etiqueta: 'Año Académico', tipo: 'texto', requerido: true },
      { campo: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { campo: 'centro', etiqueta: 'Centro Educativo', tipo: 'texto', requerido: true },
      { campo: 'fecha_inicio', etiqueta: 'Fecha Inicio', tipo: 'fecha', requerido: false },
      { campo: 'fecha_fin', etiqueta: 'Fecha Fin', tipo: 'fecha', requerido: false },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: false }
    ],
    ejemploPlantilla: {
      anyo: '2024/2025',
      nombre: '1º DAW Mañana',
      centro: 'IES Tecnológico',
      fecha_inicio: '2024-09-08',
      fecha_fin: '2025-06-20',
      descripcion: 'Curso formativo de Desarrollo de Aplicaciones Web'
    }
  },
  Ciclos: {
    nombreTabla: 'Ciclos',
    etiqueta: 'Ciclos Formativos',
    descripcion: 'Carga masiva de ciclos formativos oficiales.',
    icono: 'pi pi-graduation-cap',
    campos: [
      { campo: 'siglas', etiqueta: 'Siglas', tipo: 'texto', requerido: true },
      { campo: 'nombre', etiqueta: 'Nombre del Ciclo', tipo: 'texto', requerido: true },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: false }
    ],
    ejemploPlantilla: {
      siglas: 'DAW',
      nombre: 'Desarrollo de Aplicaciones Web',
      descripcion: 'Ciclo formativo de grado superior de desarrollo web'
    }
  },
  Practicas: {
    nombreTabla: 'Practicas',
    etiqueta: 'Prácticas (Banco Maestro)',
    descripcion: 'Carga masiva de actividades y ejercicios en el banco maestro.',
    icono: 'pi pi-file-edit',
    campos: [
      { campo: 'nombre', etiqueta: 'Nombre de la Práctica', tipo: 'texto', requerido: true },
      { campo: 'id_tipopractica', etiqueta: 'Tipo de Práctica (Individual/Grupal/Examen/Proyecto)', tipo: 'texto', requerido: true },
      { campo: 'id_modulo', etiqueta: 'ID Módulo (UUID)', tipo: 'texto', requerido: true },
      { campo: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: false }
    ],
    ejemploPlantilla: {
      nombre: 'Práctica 1 - Maquetación CSS',
      id_tipopractica: 'Individual',
      id_modulo: '00000000-0000-0000-0000-000000000001',
      descripcion: 'Diseño responsive con PrimeFlex'
    }
  },
  Versiones: {
    nombreTabla: 'Versiones',
    etiqueta: 'Versiones de Prácticas',
    descripcion: 'Carga masiva de adaptaciones de actividades asociadas a cursos académicos.',
    icono: 'pi pi-code',
    campos: [
      { campo: 'numero', etiqueta: 'Número / Código Versión', tipo: 'texto', requerido: false },
      { campo: 'id_practica', etiqueta: 'ID Práctica (UUID)', tipo: 'texto', requerido: true },
      { campo: 'id_curso', etiqueta: 'ID Curso (UUID)', tipo: 'texto', requerido: true },
      { campo: 'id_ut', etiqueta: 'ID UT (UUID)', tipo: 'texto', requerido: false },
      { campo: 'id_evaluacion', etiqueta: 'ID Evaluación (UUID)', tipo: 'texto', requerido: false },
      { campo: 'peso_evaluacion', etiqueta: 'Peso Evaluación (%)', tipo: 'numero', requerido: false },
      { campo: 'enunciado', etiqueta: 'Enunciado Personalizado', tipo: 'texto', requerido: false }
    ],
    ejemploPlantilla: {
      numero: '1.0',
      id_practica: '00000000-0000-0000-0000-000000000001',
      id_curso: '00000000-0000-0000-0000-000000000002',
      id_ut: '',
      id_evaluacion: '',
      peso_evaluacion: 20,
      enunciado: 'Implementación del catálogo de componentes'
    }
  }
};

// Devuelve el listado estructurado para los componentes de selección
export const OPCIONES_TABLAS_IMPORTACION = Object.values(TABLAS_IMPORTACION).map((t) => ({
  label: t.etiqueta,
  value: t.nombreTabla,
  descripcion: t.descripcion,
  icono: t.icono
}));
