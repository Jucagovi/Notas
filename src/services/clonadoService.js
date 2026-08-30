import { supabase } from './supabaseClient.js';

// Lista de evaluaciones reglamentarias obligatorias que deben crearse para cada módulo en un curso
export const EVALUACIONES_REGLAMENTARIAS = [
  { nombre: 'Primera', descripcion: 'Primera Evaluación Ordinaria' },
  { nombre: 'Segunda', descripcion: 'Segunda Evaluación Ordinaria' },
  { nombre: 'Final', descripcion: 'Evaluación Ordinaria Final' },
  { nombre: 'Extraordinaria', descripcion: 'Evaluación Extraordinaria' }
];

// Se calcula el siguiente año lectivo a partir del año actual incrementando los números de año
export const calcularSiguienteAnyo = (anyoActual) => {
  if (!anyoActual || typeof anyoActual !== 'string') {
    const anioActual = new Date().getFullYear();
    return `${anioActual}/${anioActual + 1}`;
  }

  const anyoTrim = anyoActual.trim();

  // Se comprueba el patrón de cuatro dígitos con separador (ej. 2025/2026 o 2025-2026)
  const patronCuatroDigitos = anyoTrim.match(/^(\d{4})([/-])(\d{4})$/);
  if (patronCuatroDigitos) {
    const inicio = parseInt(patronCuatroDigitos[1], 10) + 1;
    const separador = patronCuatroDigitos[2];
    const fin = parseInt(patronCuatroDigitos[3], 10) + 1;
    return `${inicio}${separador}${fin}`;
  }

  // Se comprueba el patrón de cuatro dígitos y dos dígitos (ej. 2025/26 o 2025-26)
  const patronCuatroYDos = anyoTrim.match(/^(\d{4})([/-])(\d{2})$/);
  if (patronCuatroYDos) {
    const inicio = parseInt(patronCuatroYDos[1], 10) + 1;
    const separador = patronCuatroYDos[2];
    const fin = (parseInt(patronCuatroYDos[3], 10) + 1) % 100;
    const finFormateado = fin.toString().padStart(2, '0');
    return `${inicio}${separador}${finFormateado}`;
  }

  // Se comprueba el patrón de dos dígitos y dos dígitos (ej. 25/26 o 25-26)
  const patronDosYDos = anyoTrim.match(/^(\d{2})([/-])(\d{2})$/);
  if (patronDosYDos) {
    const inicio = (parseInt(patronDosYDos[1], 10) + 1) % 100;
    const separador = patronDosYDos[2];
    const fin = (parseInt(patronDosYDos[3], 10) + 1) % 100;
    return `${inicio.toString().padStart(2, '0')}${separador}${fin.toString().padStart(2, '0')}`;
  }

  // Se comprueba el año único de 4 dígitos (ej. 2025)
  const patronAnioUnico = anyoTrim.match(/^(\d{4})$/);
  if (patronAnioUnico) {
    return String(parseInt(patronAnioUnico[1], 10) + 1);
  }

  // Se incrementan todas las apariciones de años de 4 dígitos encontradas en la cadena
  const aniosEncontrados = anyoTrim.match(/(\d{4})/g);
  if (aniosEncontrados && aniosEncontrados.length > 0) {
    let resultado = anyoTrim;
    aniosEncontrados.forEach((anio) => {
      const siguiente = String(parseInt(anio, 10) + 1);
      resultado = resultado.replace(anio, siguiente);
    });
    return resultado;
  }

  const anioActual = new Date().getFullYear();
  return `${anioActual}/${anioActual + 1}`;
};

// Se sugiere un nombre predeterminado para el nuevo curso actualizando el año dentro del título
export const sugerirNombreNuevoCurso = (nombreOriginal, anyoOriginal, nuevoAnyo) => {
  if (!nombreOriginal) return '';
  let sugerencia = String(nombreOriginal).trim();

  // Si contiene el año original explícito, se sustituye por el nuevo
  if (anyoOriginal && sugerencia.includes(anyoOriginal.trim())) {
    return sugerencia.replace(anyoOriginal.trim(), nuevoAnyo);
  }

  // Se busca si hay años de 4 dígitos en el nombre para incrementarlos
  const aniosEncontrados = sugerencia.match(/(\d{4})/g);
  if (aniosEncontrados && aniosEncontrados.length > 0) {
    aniosEncontrados.forEach((anio) => {
      const siguiente = String(parseInt(anio, 10) + 1);
      sugerencia = sugerencia.replace(anio, siguiente);
    });
    return sugerencia;
  }

  // Si no contiene año, se añade el nuevo año al final si no estuviese ya
  if (nuevoAnyo && !sugerencia.includes(nuevoAnyo)) {
    return `${sugerencia} ${nuevoAnyo}`;
  }

  return sugerencia;
};

// Se sugiere una descripción actualizada para el nuevo curso
export const sugerirDescripcionNuevoCurso = (descripcionOriginal, anyoOriginal, nuevoAnyo) => {
  if (!descripcionOriginal) {
    return nuevoAnyo ? `Curso académico ${nuevoAnyo}` : '';
  }

  let descripcion = String(descripcionOriginal).trim();

  if (anyoOriginal && descripcion.includes(anyoOriginal.trim())) {
    return descripcion.replace(anyoOriginal.trim(), nuevoAnyo);
  }

  const aniosEncontrados = descripcion.match(/(\d{4})/g);
  if (aniosEncontrados && aniosEncontrados.length > 0) {
    aniosEncontrados.forEach((anio) => {
      const siguiente = String(parseInt(anio, 10) + 1);
      descripcion = descripcion.replace(anio, siguiente);
    });
  }

  return descripcion;
};

// Se ordenan los cursos de modo que el año académico más reciente quede en primer lugar
export const ordenarCursosPorReciente = (cursos = []) => {
  return [...(cursos || [])].sort((a, b) => {
    const anyoA = (a.anyo || '').trim();
    const anyoB = (b.anyo || '').trim();

    if (anyoA && anyoB && anyoA !== anyoB) {
      // Se ordenan los años de forma descendente (el más reciente primero)
      return anyoB.localeCompare(anyoA, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (anyoA && !anyoB) return -1;
    if (!anyoA && anyoB) return 1;

    // Si los años coinciden, se comprueba la fecha de creación descendente
    if (a.created_at && b.created_at) {
      const diffFecha = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (diffFecha !== 0) return diffFecha;
    }

    return (a.nombre || '').localeCompare(b.nombre || '');
  });
};

// Se obtienen todos los cursos académicos registrados en la base de datos ordenados por recencia
export const obtenerCursosDisponibles = async () => {
  try {
    const { data, error } = await supabase
      .from('Cursos')
      .select('id_curso, nombre, anyo, centro, descripcion, created_at')
      .order('anyo', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener cursos disponibles:', error);
      throw error;
    }

    return { data: ordenarCursosPorReciente(data || []), error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerCursosDisponibles:', err);
    return { data: [], error: err.message || 'Error al obtener la lista de cursos.' };
  }
};

// Se obtienen los módulos únicos asociados a un curso identificados a través de imparte o Evaluaciones
export const obtenerModulosDeCurso = async (idCurso) => {
  if (!idCurso) return { data: [], error: null };

  try {
    // 1. Se consultan los módulos presentes en la tabla imparte para el curso origen
    const { data: datosImparte, error: errorImparte } = await supabase
      .from('imparte')
      .select('id_modulo')
      .eq('id_curso', idCurso);

    if (errorImparte) {
      console.error('Error al consultar módulos en imparte para curso origen:', errorImparte);
      throw errorImparte;
    }

    // 2. Se consultan los módulos presentes en la tabla Evaluaciones para el curso origen
    const { data: datosEvaluaciones, error: errorEvaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_modulo, nombre')
      .eq('id_curso', idCurso);

    if (errorEvaluaciones) {
      console.error('Error al consultar módulos en Evaluaciones para curso origen:', errorEvaluaciones);
      throw errorEvaluaciones;
    }

    // 3. Se extraen los identificadores únicos de los módulos asociados
    const idsModulosUnicos = new Set();

    (datosImparte || []).forEach((item) => {
      if (item.id_modulo) idsModulosUnicos.add(item.id_modulo);
    });

    (datosEvaluaciones || []).forEach((item) => {
      if (item.id_modulo) idsModulosUnicos.add(item.id_modulo);
    });

    const listaIds = Array.from(idsModulosUnicos);

    if (listaIds.length === 0) {
      return { data: [], error: null };
    }

    // 4. Se obtienen los datos completos de los módulos junto con la información de su ciclo formativo
    const { data: modulosDetalle, error: errorModulos } = await supabase
      .from('Modulos')
      .select(`
        id_modulo,
        nombre,
        siglas,
        descripcion,
        id_ciclo,
        Ciclos:id_ciclo (
          id_ciclo,
          nombre,
          siglas
        )
      `)
      .in('id_modulo', listaIds)
      .order('nombre', { ascending: true });

    if (errorModulos) {
      console.error('Error al obtener datos detallados de los módulos:', errorModulos);
      throw errorModulos;
    }

    return { data: modulosDetalle || [], error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerModulosDeCurso:', err);
    return { data: [], error: err.message || 'Error al obtener los módulos del curso seleccionado.' };
  }
};

// Se orquesta el proceso secuencial de clonado de curso y generación de evaluaciones reglamentarias
export const clonarCurso = async (cursoOrigenId, datosNuevoCurso) => {
  if (!cursoOrigenId) {
    return { exito: false, error: 'Debe seleccionar un curso de origen para realizar la clonación.' };
  }

  if (!datosNuevoCurso || !datosNuevoCurso.nombre || !datosNuevoCurso.nombre.trim()) {
    return { exito: false, error: 'El nombre del nuevo curso es obligatorio.' };
  }

  let cursoCreado = null;

  try {
    // Paso 1: Se obtienen los módulos asociados al curso original para validar su existencia
    const { data: modulosAsociados, error: errorModulos } = await obtenerModulosDeCurso(cursoOrigenId);

    if (errorModulos) {
      throw new Error(`Error al leer los módulos del curso origen: ${errorModulos}`);
    }

    // Paso 2: Se inserta el nuevo registro en la tabla Cursos
    const registroCurso = {
      nombre: datosNuevoCurso.nombre.trim(),
      centro: (datosNuevoCurso.centro || '').trim(),
      anyo: (datosNuevoCurso.anyo || '').trim(),
      descripcion: (datosNuevoCurso.descripcion || '').trim()
    };

    const { data: cursoInsertado, error: errorInsertarCurso } = await supabase
      .from('Cursos')
      .insert([registroCurso])
      .select();

    if (errorInsertarCurso) {
      console.error('Error al insertar nuevo registro en Cursos:', errorInsertarCurso);
      throw new Error(`Error al insertar en la tabla Cursos: ${errorInsertarCurso.message || errorInsertarCurso}`);
    }

    if (!cursoInsertado || cursoInsertado.length === 0) {
      console.error('No se devolvió el registro tras la inserción en Cursos');
      throw new Error('No se pudo confirmar la creación del nuevo curso en la tabla Cursos.');
    }

    cursoCreado = cursoInsertado[0];
    const nuevoCursoId = cursoCreado.id_curso;

    // Paso 3: Por cada módulo asociado al curso original, se crean los 4 registros en Evaluaciones
    const evaluacionesAInsertar = [];

    (modulosAsociados || []).forEach((modulo) => {
      EVALUACIONES_REGLAMENTARIAS.forEach((evalReg) => {
        evaluacionesAInsertar.push({
          id_curso: nuevoCursoId,
          id_modulo: modulo.id_modulo,
          nombre: evalReg.nombre,
          descripcion: evalReg.descripcion
        });
      });
    });

    let evaluacionesCreadas = [];

    if (evaluacionesAInsertar.length > 0) {
      const { data: evInsertadas, error: errorInsertarEvaluaciones } = await supabase
        .from('Evaluaciones')
        .insert(evaluacionesAInsertar)
        .select();

      if (errorInsertarEvaluaciones) {
        console.error('Error al insertar evaluaciones para el curso clonado:', errorInsertarEvaluaciones);

        // Se intenta limpiar el curso creado para evitar dejar registros inconsistentes
        try {
          await supabase.from('Cursos').delete().eq('id_curso', nuevoCursoId);
        } catch (errorLimpieza) {
          console.warn('No se pudo revertir la creación del curso tras fallo en evaluaciones:', errorLimpieza);
        }

        throw new Error(`Falló la creación de las evaluaciones: ${errorInsertarEvaluaciones.message}`);
      }

      evaluacionesCreadas = evInsertadas || [];
    }

    return {
      exito: true,
      cursoCreado,
      totalModulos: (modulosAsociados || []).length,
      modulos: modulosAsociados || [],
      totalEvaluaciones: evaluacionesCreadas.length,
      evaluaciones: evaluacionesCreadas,
      error: null
    };
  } catch (err) {
    console.error('Error en clonarCurso:', err);
    return {
      exito: false,
      cursoCreado: null,
      totalModulos: 0,
      totalEvaluaciones: 0,
      error: err.message || 'Ocurrió un error durante la clonación del curso.'
    };
  }
};

export default {
  EVALUACIONES_REGLAMENTARIAS,
  calcularSiguienteAnyo,
  sugerirNombreNuevoCurso,
  sugerirDescripcionNuevoCurso,
  ordenarCursosPorReciente,
  obtenerCursosDisponibles,
  obtenerModulosDeCurso,
  clonarCurso
};
