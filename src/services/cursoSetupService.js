import { supabase } from './supabaseClient.js';

// Lista de evaluaciones reglamentarias obligatorias que deben crearse para cada módulo en un curso
export const EVALUACIONES_REGLAMENTARIAS = [
  { nombre: 'Primera', descripcion: 'Primera Evaluación Ordinaria' },
  { nombre: 'Segunda', descripcion: 'Segunda Evaluación Ordinaria' },
  { nombre: 'Tercera', descripcion: 'Tercera Evaluación Ordinaria' },
  { nombre: 'Final Ordinaria', descripcion: 'Evaluación Ordinaria Final' },
  { nombre: 'Extraordinaria', descripcion: 'Evaluación Extraordinaria' }
];

// Se generan las 5 evaluaciones reglamentarias en la base de datos para un curso y módulo específicos
export const generarEvaluaciones = async (cursoId, moduloId) => {
  try {
    // Se verifica si ya existen evaluaciones registradas para esta combinación de curso y módulo
    const { data: evaluacionesExistentes, error: errorConsulta } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion, nombre')
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (errorConsulta) {
      console.error('Error al consultar evaluaciones existentes:', errorConsulta);
      throw errorConsulta;
    }

    const nombresExistentes = new Set((evaluacionesExistentes || []).map((ev) => ev.nombre));

    // Se filtran únicamente los periodos que no hayan sido creados previamente
    const evaluacionesAInsertar = EVALUACIONES_REGLAMENTARIAS.filter(
      (ev) => !nombresExistentes.has(ev.nombre)
    ).map((ev) => ({
      id_curso: cursoId,
      id_modulo: moduloId,
      nombre: ev.nombre,
      descripcion: ev.descripcion
    }));

    if (evaluacionesAInsertar.length === 0) {
      return { data: evaluacionesExistentes, error: null };
    }

    const { data, error: errorInsercion } = await supabase
      .from('Evaluaciones')
      .insert(evaluacionesAInsertar)
      .select();

    if (errorInsercion) {
      console.error('Error al insertar evaluaciones reglamentarias:', errorInsercion);
      throw errorInsercion;
    }

    const todasEvaluaciones = [...(evaluacionesExistentes || []), ...(data || [])];
    return { data: todasEvaluaciones, error: null };
  } catch (err) {
    console.error('Error en generarEvaluaciones:', err);
    return { data: null, error: err.message || 'Error al generar evaluaciones reglamentarias.' };
  }
};

// Se eliminan en cascada todos los registros vinculados a un curso en todas las tablas afectadas
export const eliminarCurso = async (cursoId) => {
  try {
    // 1. Se obtienen todas las evaluaciones asociadas al curso para poder limpiar las notas en evaluan
    const { data: evaluaciones, error: errorEvaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion')
      .eq('id_curso', cursoId);

    if (errorEvaluaciones) {
      console.error('Error al consultar evaluaciones para eliminar curso:', errorEvaluaciones);
      throw errorEvaluaciones;
    }

    const idsEvaluaciones = (evaluaciones || []).map((ev) => ev.id_evaluacion);

    // 2. Se obtienen las prácticas asociadas a las evaluaciones del curso para limpiar la tabla trabajan
    if (idsEvaluaciones.length > 0) {
      const { data: registrosEvaluan } = await supabase
        .from('evaluan')
        .select('id_practica')
        .in('id_evaluacion', idsEvaluaciones);

      const idsPracticas = Array.from(
        new Set((registrosEvaluan || []).map((r) => r.id_practica).filter(Boolean))
      );

      if (idsPracticas.length > 0) {
        await supabase
          .from('trabajan')
          .delete()
          .in('id_practica', idsPracticas);
      }

      // Se eliminan las notas en la tabla evaluan asociadas a las evaluaciones encontradas
      const { error: errorEvaluan } = await supabase
        .from('evaluan')
        .delete()
        .in('id_evaluacion', idsEvaluaciones);

      if (errorEvaluan) {
        console.error('Error al eliminar registros en evaluan para el curso:', errorEvaluan);
        throw errorEvaluan;
      }
    }

    // 3. Se eliminan las evaluaciones asociadas al curso
    const { error: errorBorrarEvaluaciones } = await supabase
      .from('Evaluaciones')
      .delete()
      .eq('id_curso', cursoId);

    if (errorBorrarEvaluaciones) {
      console.error('Error al eliminar registros en Evaluaciones para el curso:', errorBorrarEvaluaciones);
      throw errorBorrarEvaluaciones;
    }

    // 4. Se eliminan las asignaciones en la tabla imparte
    const { error: errorImparte } = await supabase
      .from('imparte')
      .delete()
      .eq('id_curso', cursoId);

    if (errorImparte) {
      console.error('Error al eliminar registros en imparte para el curso:', errorImparte);
      throw errorImparte;
    }

    // 5. Finalmente se elimina el registro principal en la tabla Cursos
    const { error: errorCurso } = await supabase
      .from('Cursos')
      .delete()
      .eq('id_curso', cursoId);

    if (errorCurso) {
      console.error('Error al eliminar registro en Cursos:', errorCurso);
      throw errorCurso;
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error en eliminarCurso:', err);
    return { exito: false, error: err.message || 'Error durante la eliminación del curso.' };
  }
};

// Se eliminan en cascada los registros asociados a una clase específica (binomio curso y módulo)
export const eliminarClase = async (cursoId, moduloId) => {
  try {
    // 1. Se localizan las evaluaciones del módulo en el curso seleccionado
    const { data: evaluaciones, error: errorEvaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion')
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (errorEvaluaciones) {
      console.error('Error al consultar evaluaciones de la clase:', errorEvaluaciones);
      throw errorEvaluaciones;
    }

    const idsEvaluaciones = (evaluaciones || []).map((ev) => ev.id_evaluacion);

    // 2. Se obtienen las prácticas vinculadas a dichas evaluaciones y se eliminan sus relaciones en trabajan y evaluan
    if (idsEvaluaciones.length > 0) {
      const { data: registrosEvaluan, error: errorConsultarEvaluan } = await supabase
        .from('evaluan')
        .select('id_practica')
        .in('id_evaluacion', idsEvaluaciones);

      if (errorConsultarEvaluan) {
        console.error('Error al consultar prácticas asociadas a evaluaciones de la clase:', errorConsultarEvaluan);
        throw errorConsultarEvaluan;
      }

      const idsPracticas = Array.from(
        new Set((registrosEvaluan || []).map((r) => r.id_practica).filter(Boolean))
      );

      // Se eliminan las vinculaciones entre prácticas y criterios en la tabla trabajan
      if (idsPracticas.length > 0) {
        const { error: errorTrabajan } = await supabase
          .from('trabajan')
          .delete()
          .in('id_practica', idsPracticas);

        if (errorTrabajan) {
          console.error('Error al eliminar vinculaciones en trabajan para las prácticas de la clase:', errorTrabajan);
          throw errorTrabajan;
        }
      }

      // Se eliminan las calificaciones en evaluan correspondientes a dichas evaluaciones
      const { error: errorEvaluan } = await supabase
        .from('evaluan')
        .delete()
        .in('id_evaluacion', idsEvaluaciones);

      if (errorEvaluan) {
        console.error('Error al eliminar notas de la clase en evaluan:', errorEvaluan);
        throw errorEvaluan;
      }
    }

    // 3. Se eliminan las evaluaciones vinculadas a esta clase
    const { error: errorBorrarEvaluaciones } = await supabase
      .from('Evaluaciones')
      .delete()
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (errorBorrarEvaluaciones) {
      console.error('Error al eliminar evaluaciones de la clase:', errorBorrarEvaluaciones);
      throw errorBorrarEvaluaciones;
    }

    // 4. Se eliminan los registros de matriculación en imparte para este curso y módulo
    const { error: errorImparte } = await supabase
      .from('imparte')
      .delete()
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (errorImparte) {
      console.error('Error al eliminar matriculaciones de la clase en imparte:', errorImparte);
      throw errorImparte;
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error en eliminarClase:', err);
    return { exito: false, error: err.message || 'Error al eliminar la clase.' };
  }
};

// Se crea una nueva clase completa dando de alta o asociando el curso, matriculando discentes y generando evaluaciones
export const crearClaseCompleta = async ({
  cursoId = null,
  nuevoCurso = null,
  moduloId,
  discentesIds = []
}) => {
  try {
    let idCursoFinal = cursoId;

    // 1. Si no se especificó un curso existente y se proporcionaron datos de nuevo curso, se crea
    if (!idCursoFinal && nuevoCurso) {
      const { data: cursoCreado, error: errorCrearCurso } = await supabase
        .from('Cursos')
        .insert({
          nombre: nuevoCurso.nombre || '',
          anyo: nuevoCurso.anyo || '',
          centro: nuevoCurso.centro || '',
          descripcion: nuevoCurso.descripcion || ''
        })
        .select()
        .single();

      if (errorCrearCurso) {
        console.error('Error al crear nuevo curso:', errorCrearCurso);
        throw errorCrearCurso;
      }

      idCursoFinal = cursoCreado.id_curso;
    }

    if (!idCursoFinal) {
      throw new Error('Debe especificar un curso existente o los datos para crear uno nuevo.');
    }

    if (!moduloId) {
      throw new Error('Debe seleccionar un módulo para la clase.');
    }

    // 2. Se generan automáticamente las 4 evaluaciones reglamentarias
    const resEvaluaciones = await generarEvaluaciones(idCursoFinal, moduloId);
    if (resEvaluaciones.error) {
      console.warn('Aviso al generar evaluaciones:', resEvaluaciones.error);
    }

    // 3. Se matriculan los discentes seleccionados en la tabla imparte
    let discentesMatriculados = [];
    if (Array.isArray(discentesIds) && discentesIds.length > 0) {
      // Se evitan duplicados comprobando registros ya existentes en imparte
      const { data: yaMatriculados } = await supabase
        .from('imparte')
        .select('id_discente')
        .eq('id_curso', idCursoFinal)
        .eq('id_modulo', moduloId);

      const matriculadosSet = new Set((yaMatriculados || []).map((m) => m.id_discente));
      const discentesNuevos = discentesIds.filter((id) => !matriculadosSet.has(id));

      if (discentesNuevos.length > 0) {
        const registrosImparte = discentesNuevos.map((idDiscente) => ({
          id_curso: idCursoFinal,
          id_modulo: moduloId,
          id_discente: idDiscente
        }));

        const { data: insertados, error: errorImparte } = await supabase
          .from('imparte')
          .insert(registrosImparte)
          .select();

        if (errorImparte) {
          console.error('Error al matricular discentes en imparte:', errorImparte);
          throw errorImparte;
        }

        discentesMatriculados = insertados || [];
      }
    }

    return {
      exito: true,
      idCurso: idCursoFinal,
      idModulo: moduloId,
      totalDiscentesMatriculados: discentesMatriculados.length,
      evaluacionesGeneradas: resEvaluaciones.data || [],
      error: null
    };
  } catch (err) {
    console.error('Error en crearClaseCompleta:', err);
    return {
      exito: false,
      error: err.message || 'Ocurrió un fallo al crear y configurar la clase.'
    };
  }
};

// Se obtienen todas las clases estructuradas a partir de los datos en imparte, Evaluaciones, Cursos y Modulos
export const obtenerClases = async () => {
  try {
    // Se consultan los cursos
    const { data: cursos, error: errCursos } = await supabase
      .from('Cursos')
      .select('id_curso, nombre, anyo, centro, descripcion')
      .order('nombre', { ascending: true });

    if (errCursos) throw errCursos;

    // Se consultan los módulos junto con la información de su ciclo
    const { data: modulos, error: errModulos } = await supabase
      .from('Modulos')
      .select('id_modulo, nombre, siglas, id_ciclo, Ciclos(id_ciclo, nombre, siglas)')
      .order('nombre', { ascending: true });

    if (errModulos) throw errModulos;

    // Se consultan las relaciones en imparte para conocer discentes por clase
    const { data: imparte, error: errImparte } = await supabase
      .from('imparte')
      .select('id_imparte, id_curso, id_modulo, id_discente');

    if (errImparte) throw errImparte;

    // Se consultan las evaluaciones para asociarlas a las clases
    const { data: evaluaciones, error: errEvaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion, id_curso, id_modulo, nombre');

    if (errEvaluaciones) throw errEvaluaciones;

    const mapaCursos = new Map((cursos || []).map((c) => [c.id_curso, c]));
    const mapaModulos = new Map((modulos || []).map((m) => [m.id_modulo, m]));

    // Se agrupan los registros únicos de clases (binomio curso-módulo)
    const mapaClases = new Map();

    // Se agregan clases detectadas desde la tabla imparte
    (imparte || []).forEach((item) => {
      if (!item.id_curso || !item.id_modulo) return;
      const clave = `${item.id_curso}_${item.id_modulo}`;
      if (!mapaClases.has(clave)) {
        mapaClases.set(clave, {
          clave,
          id_curso: item.id_curso,
          id_modulo: item.id_modulo,
          discentesIds: new Set()
        });
      }
      if (item.id_discente) {
        mapaClases.get(clave).discentesIds.add(item.id_discente);
      }
    });

    // Se agregan clases detectadas desde la tabla Evaluaciones
    (evaluaciones || []).forEach((ev) => {
      if (!ev.id_curso || !ev.id_modulo) return;
      const clave = `${ev.id_curso}_${ev.id_modulo}`;
      if (!mapaClases.has(clave)) {
        mapaClases.set(clave, {
          clave,
          id_curso: ev.id_curso,
          id_modulo: ev.id_modulo,
          discentesIds: new Set()
        });
      }
    });

    // Se construye el array formateado de clases para el listado y selectores
    const listaClases = Array.from(mapaClases.values()).map((c) => {
      const curso = mapaCursos.get(c.id_curso) || { nombre: 'Curso no encontrado', anyo: '', centro: '' };
      const modulo = mapaModulos.get(c.id_modulo) || { nombre: 'Módulo no encontrado', siglas: '', Ciclos: null };
      const ciclo = modulo.Ciclos || null;

      const nombreClase = `${curso.nombre}${curso.anyo ? ` (${curso.anyo})` : ''} - ${modulo.siglas || modulo.nombre}`;
      const etiquetaDetallada = `${nombreClase}${ciclo ? ` [${ciclo.siglas || ciclo.nombre}]` : ''}`;

      return {
        id: c.clave,
        clave: c.clave,
        id_curso: c.id_curso,
        id_modulo: c.id_modulo,
        nombre: nombreClase,
        etiquetaDetallada,
        curso,
        modulo,
        ciclo,
        totalDiscentes: c.discentesIds.size
      };
    });

    // Se ordenan las clases por nombre
    listaClases.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return { data: listaClases, error: null };
  } catch (err) {
    console.error('Error en obtenerClases:', err);
    return { data: [], error: err.message || 'Error al obtener la lista de clases.' };
  }
};

// Se obtienen los discentes matriculados en una clase específica
export const obtenerDiscentesDeClase = async (cursoId, moduloId) => {
  try {
    const { data, error } = await supabase
      .from('imparte')
      .select('id_imparte, id_discente, Discentes(id_discente, nombre, apellidos, NIA, correo, localidad, imagen, activo)')
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (error) {
      console.error('Error al obtener discentes de la clase:', error);
      throw error;
    }

    const discentes = (data || [])
      .filter((item) => item.Discentes !== null)
      .map((item) => ({
        id_imparte: item.id_imparte,
        ...item.Discentes,
        nombreCompleto: `${item.Discentes.nombre} ${item.Discentes.apellidos}`
      }));

    // Se ordenan los discentes por apellidos y nombre
    discentes.sort((a, b) => a.apellidos.localeCompare(b.apellidos));

    return { data: discentes, error: null };
  } catch (err) {
    console.error('Error en obtenerDiscentesDeClase:', err);
    return { data: [], error: err.message || 'Error al obtener discentes de la clase.' };
  }
};

// Se matricula a uno o varios discentes en una clase existente
export const matricularDiscentesEnClase = async (cursoId, moduloId, discentesIds = []) => {
  try {
    if (!cursoId || !moduloId || discentesIds.length === 0) {
      return { data: [], error: null };
    }

    // Se verifica si alguno ya está matriculado para evitar duplicados
    const { data: existentes, error: errExistentes } = await supabase
      .from('imparte')
      .select('id_discente')
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    if (errExistentes) throw errExistentes;

    const setExistentes = new Set((existentes || []).map((e) => e.id_discente));
    const nuevosIds = discentesIds.filter((id) => !setExistentes.has(id));

    if (nuevosIds.length === 0) {
      return { data: [], error: null, mensaje: 'Todos los discentes seleccionados ya estaban matriculados.' };
    }

    const filasAInsertar = nuevosIds.map((idDiscente) => ({
      id_curso: cursoId,
      id_modulo: moduloId,
      id_discente: idDiscente
    }));

    const { data, error } = await supabase
      .from('imparte')
      .insert(filasAInsertar)
      .select();

    if (error) {
      console.error('Error al matricular discentes en imparte:', error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error en matricularDiscentesEnClase:', err);
    return { data: null, error: err.message || 'Error al matricular discentes.' };
  }
};

// Se desmatricula a un discente de una clase y se eliminan sus notas asociadas en evaluan
export const desmatricularDiscenteDeClase = async (cursoId, moduloId, discenteId) => {
  try {
    // 1. Se obtienen las evaluaciones de la clase para limpiar sus notas en evaluan
    const { data: evaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion')
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId);

    const idsEvaluaciones = (evaluaciones || []).map((ev) => ev.id_evaluacion);

    if (idsEvaluaciones.length > 0) {
      const { error: errEvaluan } = await supabase
        .from('evaluan')
        .delete()
        .eq('id_discente', discenteId)
        .in('id_evaluacion', idsEvaluaciones);

      if (errEvaluan) {
        console.warn('Aviso al limpiar notas en evaluan para discente desmatriculado:', errEvaluan);
      }
    }

    // 2. Se elimina la fila en imparte
    const { error: errImparte } = await supabase
      .from('imparte')
      .delete()
      .eq('id_curso', cursoId)
      .eq('id_modulo', moduloId)
      .eq('id_discente', discenteId);

    if (errImparte) {
      console.error('Error al desmatricular discente en imparte:', errImparte);
      throw errImparte;
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error en desmatricularDiscenteDeClase:', err);
    return { exito: false, error: err.message || 'Error al desmatricular al discente.' };
  }
};

// Se obtienen los módulos de un ciclo formativo
export const obtenerModulosPorCiclo = async (cicloId = null) => {
  try {
    let consulta = supabase
      .from('Modulos')
      .select('id_modulo, nombre, siglas, descripcion, id_ciclo')
      .order('nombre', { ascending: true });

    if (cicloId) {
      consulta = consulta.eq('id_ciclo', cicloId);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error en obtenerModulosPorCiclo:', err);
    return { data: [], error: err.message || 'Error al obtener módulos.' };
  }
};

export default {
  EVALUACIONES_REGLAMENTARIAS,
  generarEvaluaciones,
  eliminarCurso,
  eliminarClase,
  crearClaseCompleta,
  obtenerClases,
  obtenerDiscentesDeClase,
  matricularDiscentesEnClase,
  desmatricularDiscenteDeClase,
  obtenerModulosPorCiclo
};
