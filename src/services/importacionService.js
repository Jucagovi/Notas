import Papa from 'papaparse';
import { supabase } from './supabaseClient.js';

// Configuración de las tablas principales del sistema disponibles para importación masiva
export const TABLAS_IMPORTACION = [
  {
    id: 'Discentes',
    nombre: 'Discentes (Alumnado)',
    descripcion: 'Expedientes de alumnos con NIA, nombres, apellidos, contacto y fecha de nacimiento.',
    icono: 'pi pi-users',
    color: '#10b981',
    clavePrimaria: 'id_discente',
    columnas: [
      {
        campo: 'nombre',
        etiqueta: 'Nombre',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Nombre de pila del estudiante.',
        ejemplo: 'Elena'
      },
      {
        campo: 'apellidos',
        etiqueta: 'Apellidos',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Apellidos completos del estudiante.',
        ejemplo: 'García Pérez'
      },
      {
        campo: 'NIA',
        etiqueta: 'NIA',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Número de Identificación del Alumno.',
        ejemplo: '10847291'
      },
      {
        campo: 'correo',
        etiqueta: 'Correo Electrónico',
        tipo: 'email',
        requerido: false,
        descripcion: 'Dirección de correo electrónico válida.',
        ejemplo: 'elena.garcia@educa.es'
      },
      {
        campo: 'fecha_nac',
        etiqueta: 'Fecha de Nacimiento',
        tipo: 'fecha',
        requerido: false,
        descripcion: 'Fecha en formato AAAA-MM-DD o DD/MM/AAAA.',
        ejemplo: '2004-03-15'
      },
      {
        campo: 'localidad',
        etiqueta: 'Localidad',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Municipio o ciudad de residencia.',
        ejemplo: 'Valencia'
      },
      {
        campo: 'imagen',
        etiqueta: 'URL Imagen',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Enlace web a la fotografía o avatar del alumno.',
        ejemplo: 'https://ejemplo.es/fotos/elena.jpg'
      },
      {
        campo: 'activo',
        etiqueta: 'Estado Activo',
        tipo: 'booleano',
        requerido: false,
        defecto: true,
        descripcion: 'Estado de matrícula (true/false, si/no, 1/0).',
        ejemplo: 'true'
      }
    ],
    filasEjemplo: [
      {
        nombre: 'Elena',
        apellidos: 'García Pérez',
        NIA: '10847291',
        correo: 'elena.garcia@educa.es',
        fecha_nac: '2004-03-15',
        localidad: 'Valencia',
        imagen: '',
        activo: 'true'
      },
      {
        nombre: 'Marcos',
        apellidos: 'López Ramos',
        NIA: '10847292',
        correo: 'marcos.lopez@educa.es',
        fecha_nac: '2003-11-20',
        localidad: 'Castellón',
        imagen: '',
        activo: 'true'
      }
    ]
  },
  {
    id: 'Modulos',
    nombre: 'Módulos Profesionales',
    descripcion: 'Asignaturas curriculares con nombre, siglas, descripción y ciclo formativo.',
    icono: 'pi pi-book',
    color: '#8b5cf6',
    clavePrimaria: 'id_modulo',
    columnas: [
      {
        campo: 'siglas',
        etiqueta: 'Siglas',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Código o siglas abreviadas del módulo profesional.',
        ejemplo: 'DWEC'
      },
      {
        campo: 'nombre',
        etiqueta: 'Nombre del Módulo',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Nombre completo oficial de la materia formativa.',
        ejemplo: 'Desarrollo Web en Entorno Cliente'
      },
      {
        campo: 'descripcion',
        etiqueta: 'Descripción',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Resumen o contenido del módulo.',
        ejemplo: 'Programación JavaScript, frameworks reactivos y single page apps.'
      },
      {
        campo: 'id_ciclo',
        etiqueta: 'ID Ciclo (UUID)',
        tipo: 'uuid',
        requerido: false,
        descripcion: 'Identificador UUID del ciclo formativo al que pertenece.',
        ejemplo: ''
      }
    ],
    filasEjemplo: [
      {
        siglas: 'DWEC',
        nombre: 'Desarrollo Web en Entorno Cliente',
        descripcion: 'Programación JavaScript, componentes y frameworks reactivos.',
        id_ciclo: ''
      },
      {
        siglas: 'DWES',
        nombre: 'Desarrollo Web en Entorno Servidor',
        descripcion: 'Bases de datos, arquitecturas API y servicios backend.',
        id_ciclo: ''
      }
    ]
  },
  {
    id: 'Practicas',
    nombre: 'Prácticas y Tareas',
    descripcion: 'Actividades evaluables con número, enunciado, unidad y tipología.',
    icono: 'pi pi-file-edit',
    color: '#ec4899',
    clavePrimaria: 'id_practica',
    columnas: [
      {
        campo: 'nombre',
        etiqueta: 'Título de la Práctica',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Nombre descriptivo de la actividad evaluable.',
        ejemplo: 'Práctica 1 - Maquetación y componentes PrimeReact'
      },
      {
        campo: 'numero',
        etiqueta: 'Número/Código',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Código o número identificativo de la tarea.',
        ejemplo: 'P01'
      },
      {
        campo: 'id_tipopractica',
        etiqueta: 'Tipo de Práctica',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Categoría de la práctica (ej. Individual, Grupal, Examen).',
        ejemplo: 'Individual'
      },
      {
        campo: 'unidad',
        etiqueta: 'Unidad Didáctica',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Unidad temática o tema asociado.',
        ejemplo: 'UD1'
      },
      {
        campo: 'enunciado',
        etiqueta: 'Enunciado',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Enunciado o descripción detallada de la práctica.',
        ejemplo: 'Crear una interfaz interactiva implementando DataTable de PrimeReact.'
      },
      {
        campo: 'descripcion',
        etiqueta: 'Descripción/Criterios',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Observaciones o especificaciones de entrega.',
        ejemplo: 'Se valorará la separación de capas y uso de hooks.'
      },
      {
        campo: 'id_modulo',
        etiqueta: 'ID Módulo (UUID)',
        tipo: 'uuid',
        requerido: false,
        descripcion: 'Identificador UUID del módulo profesional vinculado.',
        ejemplo: ''
      }
    ],
    filasEjemplo: [
      {
        nombre: 'Práctica 1 - Componentes PrimeReact',
        numero: 'P01',
        id_tipopractica: 'Individual',
        unidad: 'UD1',
        enunciado: 'Construir el formulario de importación masiva.',
        descripcion: 'Entrega en formato comprimido.',
        id_modulo: ''
      },
      {
        nombre: 'Práctica 2 - Integración Supabase',
        numero: 'P02',
        id_tipopractica: 'Individual',
        unidad: 'UD2',
        enunciado: 'Implementar servicios y custom hooks para la base de datos.',
        descripcion: 'Manejo de estados asíncronos y errores.',
        id_modulo: ''
      }
    ]
  },
  {
    id: 'Ciclos',
    nombre: 'Ciclos Formativos',
    descripcion: 'Ciclos de Formación Profesional impartidos en el centro educativo.',
    icono: 'pi pi-graduation-cap',
    color: '#1174c0',
    clavePrimaria: 'id_ciclo',
    columnas: [
      {
        campo: 'siglas',
        etiqueta: 'Siglas',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Siglas oficiales del ciclo.',
        ejemplo: 'DAW'
      },
      {
        campo: 'nombre',
        etiqueta: 'Nombre del Ciclo',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Denominación completa del título de FP.',
        ejemplo: 'Desarrollo de Aplicaciones Web'
      },
      {
        campo: 'descripcion',
        etiqueta: 'Descripción',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Detalle o nivel del ciclo formativo.',
        ejemplo: 'Grado Superior de Formación Profesional'
      }
    ],
    filasEjemplo: [
      {
        siglas: 'DAW',
        nombre: 'Desarrollo de Aplicaciones Web',
        descripcion: 'Ciclo formativo de grado superior en desarrollo web.'
      },
      {
        siglas: 'DAM',
        nombre: 'Desarrollo de Aplicaciones Multiplataforma',
        descripcion: 'Ciclo formativo de grado superior en aplicaciones multiplataforma.'
      }
    ]
  },
  {
    id: 'Cursos',
    nombre: 'Cursos Académicos',
    descripcion: 'Años lectivos y grupos académicos del centro.',
    icono: 'pi pi-calendar',
    color: '#0ea5e9',
    clavePrimaria: 'id_curso',
    columnas: [
      {
        campo: 'nombre',
        etiqueta: 'Nombre del Grupo',
        tipo: 'texto',
        requerido: true,
        descripcion: 'Identificador del grupo o curso lectivo.',
        ejemplo: '2º DAW'
      },
      {
        campo: 'centro',
        etiqueta: 'Centro Educativo',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Nombre o código del instituto o centro.',
        ejemplo: 'IES Tecnológico'
      },
      {
        campo: 'anyo',
        etiqueta: 'Año Académico',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Periodo lectivo del curso.',
        ejemplo: '2026/2027'
      },
      {
        campo: 'descripcion',
        etiqueta: 'Descripción',
        tipo: 'texto',
        requerido: false,
        descripcion: 'Observaciones del grupo académico.',
        ejemplo: 'Turno de tarde presencial.'
      }
    ],
    filasEjemplo: [
      {
        nombre: '2º DAW',
        centro: 'IES Tecnológico',
        anyo: '2026/2027',
        descripcion: 'Turno de tarde presencial.'
      },
      {
        nombre: '1º DAW',
        centro: 'IES Tecnológico',
        anyo: '2026/2027',
        descripcion: 'Turno de mañana presencial.'
      }
    ]
  }
];

// Se obtiene la configuración detallada de una tabla a partir de su identificador
export const obtenerConfiguracionTabla = (idTabla) => {
  return TABLAS_IMPORTACION.find((t) => t.id === idTabla) || TABLAS_IMPORTACION[0];
};

// Se obtiene la cadena formateada de cabeceras de la tabla según el delimitador especificado
export const obtenerEsquemaCabeceras = (idTabla, delimitador = ',') => {
  const config = obtenerConfiguracionTabla(idTabla);
  if (!config || !config.columnas) return '';
  const delim = delimitador || ',';
  return config.columnas.map((c) => c.campo).join(delim);
};

// Se genera y descarga en el navegador una plantilla CSV vacía (únicamente con las cabeceras)
export const descargarPlantillaVaciaCSV = (idTabla, delimitador = ',') => {
  const config = obtenerConfiguracionTabla(idTabla);
  if (!config) return false;

  const delim = delimitador || ',';
  const cabeceras = config.columnas.map((c) => c.campo);

  // Se genera el contenido CSV con solo la fila de cabeceras
  const textoCSV = cabeceras.join(delim) + '\n';

  // Se añade el indicador BOM UTF-8 para compatibilidad con hojas de cálculo (Excel, Calc)
  const contenidoConBOM = '\uFEFF' + textoCSV;
  const blob = new Blob([contenidoConBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `plantilla_vacia_${idTabla.toLowerCase()}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  return true;
};

// Se genera y descarga en el navegador una plantilla CSV para la tabla seleccionada con datos de muestra
export const descargarPlantillaCSV = (idTabla, delimitador = ',') => {
  const config = obtenerConfiguracionTabla(idTabla);
  if (!config) return false;

  const delim = delimitador || ',';
  const cabeceras = config.columnas.map((c) => c.campo);
  const datosCSV = config.filasEjemplo || [];

  // Se realiza la conversión a formato CSV utilizando papaparse
  const textoCSV = Papa.unparse({
    fields: cabeceras,
    data: datosCSV
  }, {
    delimiter: delim,
    quotes: true
  });

  // Se añade el indicador BOM UTF-8 para garantizar compatibilidad con hojas de cálculo (Excel, Calc)
  const contenidoConBOM = '\uFEFF' + textoCSV;
  const blob = new Blob([contenidoConBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `plantilla_${idTabla.toLowerCase()}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  return true;
};

// Se normaliza y valida una cadena de fecha hacia el formato estándar de Postgres (AAAA-MM-DD)
export const normalizarFechaPostgres = (valorFecha) => {
  if (!valorFecha) return null;

  const texto = String(valorFecha).trim();
  if (!texto) return null;

  // Formato ISO: AAAA-MM-DD o AAAA/MM/DD
  const patronISO = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
  const coincidenciaISO = texto.match(patronISO);
  if (coincidenciaISO) {
    const anio = parseInt(coincidenciaISO[1], 10);
    const mes = String(parseInt(coincidenciaISO[2], 10)).padStart(2, '0');
    const dia = String(parseInt(coincidenciaISO[3], 10)).padStart(2, '0');
    if (parseInt(mes, 10) >= 1 && parseInt(mes, 10) <= 12 && parseInt(dia, 10) >= 1 && parseInt(dia, 10) <= 31) {
      return `${anio}-${mes}-${dia}`;
    }
  }

  // Formato estándar español: DD/MM/AAAA o DD-MM-AAAA
  const patronEspanol = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
  const coincidenciaEspanol = texto.match(patronEspanol);
  if (coincidenciaEspanol) {
    const dia = String(parseInt(coincidenciaEspanol[1], 10)).padStart(2, '0');
    const mes = String(parseInt(coincidenciaEspanol[2], 10)).padStart(2, '0');
    const anio = parseInt(coincidenciaEspanol[3], 10);
    if (parseInt(mes, 10) >= 1 && parseInt(mes, 10) <= 12 && parseInt(dia, 10) >= 1 && parseInt(dia, 10) <= 31) {
      return `${anio}-${mes}-${dia}`;
    }
  }

  // Se intenta evaluar mediante el objeto Date nativo
  const objetoFecha = new Date(texto);
  if (!isNaN(objetoFecha.getTime())) {
    const anio = objetoFecha.getFullYear();
    const mes = String(objetoFecha.getMonth() + 1).padStart(2, '0');
    const dia = String(objetoFecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  return null;
};

// Se normaliza un valor booleano a partir de representaciones habituales en castellano e inglés
export const normalizarBooleano = (valor, valorDefecto = true) => {
  if (valor === undefined || valor === null || valor === '') {
    return valorDefecto;
  }
  if (typeof valor === 'boolean') {
    return valor;
  }

  const texto = String(valor).trim().toLowerCase();
  if (['true', '1', 'si', 'sí', 's', 'verdadero', 'activo', 'yes', 'y'].includes(texto)) {
    return true;
  }
  if (['false', '0', 'no', 'n', 'falso', 'inactivo'].includes(texto)) {
    return false;
  }

  return valorDefecto;
};

// Se valida el formato de una dirección de correo electrónico
export const validarCorreo = (correo) => {
  if (!correo) return true;
  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patronCorreo.test(String(correo).trim());
};

// Se valida la estructura de un identificador UUID versión 4
export const validarUUID = (uuid) => {
  if (!uuid) return true;
  const patronUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return patronUUID.test(String(uuid).trim());
};

// Se realiza el parseo de texto CSV utilizando papaparse con detección de delimitadores
export const parsearCSV = (textoCSV, delimitadorPersonalizado = '') => {
  return new Promise((resolve) => {
    if (!textoCSV || typeof textoCSV !== 'string' || !textoCSV.trim()) {
      resolve({ filas: [], errores: ['El texto CSV proporcionado se encuentra vacío.'] });
      return;
    }

    Papa.parse(textoCSV, {
      header: true,
      skipEmptyLines: 'greedy',
      delimiter: delimitadorPersonalizado || '',
      transformHeader: (cabecera) => cabecera.trim(),
      complete: (resultados) => {
        const erroresPapa = (resultados.errors || []).map((e) => `Línea ${e.row || '?'}: ${e.message}`);
        resolve({
          filas: resultados.data || [],
          errores: erroresPapa,
          meta: resultados.meta
        });
      },
      error: (err) => {
        resolve({
          filas: [],
          errores: [err.message || 'Error al parsear el archivo CSV.']
        });
      }
    });
  });
};

// Se normalizan y validan exhaustivamente los registros leídos del CSV contra el esquema de la tabla
export const validarRegistrosCSV = (filasLeidas, idTabla) => {
  const config = obtenerConfiguracionTabla(idTabla);
  if (!config) {
    return {
      total: 0,
      validos: 0,
      invalidos: 0,
      filas: []
    };
  }

  const filasProcesadas = [];
  let totalValidos = 0;
  let totalInvalidos = 0;

  // Lista de campos auto-generados que deben descartarse obligatoriamente
  const camposAutogenerados = [
    'id_discente',
    'id_modulo',
    'id_practica',
    'id_ciclo',
    'id_curso',
    'id_ra',
    'id_ce',
    'id_evaluacion',
    'id_evaluan',
    'id_imparte',
    'id_trabajan',
    'created_at'
  ];

  filasLeidas.forEach((filaOriginal, indice) => {
    const erroresFila = [];
    const datosNormalizados = {};
    const datosVistaPrevia = {};

    // Se construye un diccionario con claves en minúsculas para tolerancia a variaciones en cabeceras
    const mapaFila = {};
    Object.keys(filaOriginal).forEach((clave) => {
      const claveNormalizada = clave.trim().toLowerCase();
      mapaFila[claveNormalizada] = filaOriginal[clave];
    });

    // Se itera sobre cada columna esperada de la tabla
    config.columnas.forEach((columna) => {
      const campo = columna.campo;
      const campoLower = campo.toLowerCase();

      // Se busca el valor en la fila leída
      let valorCrudo = mapaFila[campoLower];
      if (valorCrudo === undefined) {
        // Se busca por coincidencia exacta si no se halló en minúsculas
        valorCrudo = filaOriginal[campo];
      }

      const valorLimpio = typeof valorCrudo === 'string' ? valorCrudo.trim() : valorCrudo;
      datosVistaPrevia[campo] = valorLimpio !== undefined && valorLimpio !== null ? valorLimpio : '';

      // Validación de campo requerido
      if (columna.requerido) {
        if (valorLimpio === undefined || valorLimpio === null || valorLimpio === '') {
          erroresFila.push(`El campo "${columna.etiqueta}" es obligatorio.`);
          return;
        }
      }

      // Normalización según el tipo de dato especificado
      if (valorLimpio === undefined || valorLimpio === null || valorLimpio === '') {
        if (columna.defecto !== undefined) {
          datosNormalizados[campo] = columna.defecto;
        } else {
          datosNormalizados[campo] = null;
        }
        return;
      }

      switch (columna.tipo) {
        case 'email':
          if (!validarCorreo(valorLimpio)) {
            erroresFila.push(`El correo "${valorLimpio}" no tiene un formato válido.`);
          } else {
            datosNormalizados[campo] = String(valorLimpio).toLowerCase();
          }
          break;

        case 'fecha': {
          const fechaFormateada = normalizarFechaPostgres(valorLimpio);
          if (!fechaFormateada) {
            erroresFila.push(`La fecha "${valorLimpio}" no es válida (use AAAA-MM-DD o DD/MM/AAAA).`);
          } else {
            datosNormalizados[campo] = fechaFormateada;
          }
          break;
        }

        case 'booleano':
          datosNormalizados[campo] = normalizarBooleano(valorLimpio, columna.defecto ?? true);
          break;

        case 'uuid':
          if (!validarUUID(valorLimpio)) {
            erroresFila.push(`El identificador UUID "${valorLimpio}" no tiene un formato válido.`);
          } else {
            datosNormalizados[campo] = valorLimpio;
          }
          break;

        case 'numero': {
          const num = Number(String(valorLimpio).replace(',', '.'));
          if (isNaN(num)) {
            erroresFila.push(`El campo "${columna.etiqueta}" debe ser un número válido.`);
          } else {
            datosNormalizados[campo] = num;
          }
          break;
        }

        case 'texto':
        default:
          datosNormalizados[campo] = String(valorLimpio);
          break;
      }
    });

    // Se eliminan explícitamente los campos autogenerados de la carga para no causar colisiones de claves primarias
    camposAutogenerados.forEach((campoAuto) => {
      if (campoAuto === config.clavePrimaria) {
        delete datosNormalizados[campoAuto];
      }
    });

    const esValido = erroresFila.length === 0;
    if (esValido) {
      totalValidos += 1;
    } else {
      totalInvalidos += 1;
    }

    filasProcesadas.push({
      indice: indice + 1,
      esValido,
      errores: erroresFila,
      datosOriginales: filaOriginal,
      datosVistaPrevia,
      datosNormalizados
    });
  });

  return {
    total: filasProcesadas.length,
    validos: totalValidos,
    invalidos: totalInvalidos,
    filas: filasProcesadas
  };
};

// Se ejecuta la inserción masiva directa en Supabase mediante supabase.from(tabla).insert(array)
export const insertarRegistrosMasivos = async (idTabla, registrosLimpios) => {
  try {
    if (!registrosLimpios || registrosLimpios.length === 0) {
      return {
        exito: false,
        insertados: 0,
        mensaje: 'No hay registros válidos para insertar.'
      };
    }

    const { data, error } = await supabase
      .from(idTabla)
      .insert(registrosLimpios)
      .select();

    if (error) {
      console.error(`Error al insertar masivamente en la tabla ${idTabla}:`, error);
      return {
        exito: false,
        insertados: 0,
        error: error.message || 'Error en la base de datos de Supabase.'
      };
    }

    return {
      exito: true,
      insertados: data ? data.length : registrosLimpios.length,
      datos: data
    };
  } catch (err) {
    console.error(`Error inesperado en inserción masiva para la tabla ${idTabla}:`, err);
    return {
      exito: false,
      insertados: 0,
      error: err.message || 'Error desconocido durante la inserción masiva.'
    };
  }
};

export default {
  TABLAS_IMPORTACION,
  obtenerConfiguracionTabla,
  obtenerEsquemaCabeceras,
  descargarPlantillaCSV,
  descargarPlantillaVaciaCSV,
  normalizarFechaPostgres,
  normalizarBooleano,
  validarCorreo,
  validarUUID,
  parsearCSV,
  validarRegistrosCSV,
  insertarRegistrosMasivos
};
