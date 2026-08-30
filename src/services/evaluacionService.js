import { supabase } from './supabaseClient.js';

// Mapa de ponderación numérica para la ordenación canónica de periodos de evaluación
const MAPA_ORDEN_EVALUACIONES = {
  'primera': 1,
  '1': 1,
  '1ª': 1,
  '1a': 1,
  'primero': 1,
  'segunda': 2,
  '2': 2,
  '2ª': 2,
  '2a': 2,
  'segundo': 2,
  'tercera': 3,
  '3': 3,
  '3ª': 3,
  '3a': 3,
  'tercero': 3,
  'final': 4,
  'ordinaria': 4,
  'final ordinaria': 4,
  'extraordinaria': 5,
  'recuperacion': 5,
  'recuperación': 5,
  'extra': 5
};

// Se determina la posición ordinal de una evaluación a partir de su nombre
export const obtenerOrdenEvaluacion = (nombre) => {
  if (!nombre) return 99;
  const normalizado = String(nombre).trim().toLowerCase();

  if (MAPA_ORDEN_EVALUACIONES[normalizado] !== undefined) {
    return MAPA_ORDEN_EVALUACIONES[normalizado];
  }

  for (const [clave, orden] of Object.entries(MAPA_ORDEN_EVALUACIONES)) {
    if (normalizado.includes(clave)) {
      return orden;
    }
  }

  return 99;
};

// Se ordenan las evaluaciones en el orden cronológico estándar: Primera, Segunda, Final, Extraordinaria
export const ordenarEvaluaciones = (evaluaciones = []) => {
  return [...(evaluaciones || [])].sort((a, b) => {
    const ordenA = obtenerOrdenEvaluacion(a?.nombre);
    const ordenB = obtenerOrdenEvaluacion(b?.nombre);

    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    if (a?.fecha_ini && b?.fecha_ini) {
      return new Date(a.fecha_ini).getTime() - new Date(b.fecha_ini).getTime();
    }

    return (a?.nombre || '').localeCompare(b?.nombre || '');
  });
};

// Se obtienen todas las evaluaciones registradas con información detallada de sus cursos y módulos asociados
export const obtenerEvaluacionesConDetalle = async () => {
  try {
    const { data, error } = await supabase
      .from('Evaluaciones')
      .select(`
        id_evaluacion,
        nombre,
        fecha_ini,
        fecha_fin,
        descripcion,
        id_tipoevaluacion,
        id_curso,
        id_modulo,
        created_at,
        Cursos:id_curso (
          id_curso,
          nombre,
          anyo,
          centro
        ),
        Modulos:id_modulo (
          id_modulo,
          nombre,
          siglas
        )
      `)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return { data: ordenarEvaluaciones(data), error: null };
    }

    // Si falló la consulta anidada o vino vacía por relación de claves foráneas, se obtienen las tablas de forma independiente
    const [respEv, respCursos, respModulos] = await Promise.all([
      supabase.from('Evaluaciones').select('*').order('created_at', { ascending: true }),
      supabase.from('Cursos').select('id_curso, nombre, anyo, centro'),
      supabase.from('Modulos').select('id_modulo, nombre, siglas')
    ]);

    if (respEv.error) {
      console.error('Error al consultar tabla Evaluaciones:', respEv.error);
      return { data: [], error: respEv.error.message };
    }

    const mapaCursos = new Map((respCursos.data || []).map((c) => [c.id_curso, c]));
    const mapaModulos = new Map((respModulos.data || []).map((m) => [m.id_modulo, m]));

    const combinadas = (respEv.data || []).map((ev) => ({
      ...ev,
      Cursos: mapaCursos.get(ev.id_curso) || null,
      Modulos: mapaModulos.get(ev.id_modulo) || null
    }));

    return { data: ordenarEvaluaciones(combinadas), error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerEvaluacionesConDetalle:', err);
    return { data: [], error: err.message || 'Error al consultar evaluaciones.' };
  }
};

// Se obtienen los módulos asociados a un curso específico a partir de las clases impartidas o las evaluaciones
export const obtenerModulosPorCurso = async (idCurso) => {
  if (!idCurso) return { data: [], error: null };
  try {
    // Se consultan los módulos presentes en la tabla imparte para el curso indicado
    const { data: datosImparte, error: errorImparte } = await supabase
      .from('imparte')
      .select('id_modulo, Modulos:id_modulo ( id_modulo, nombre, siglas, descripcion )')
      .eq('id_curso', idCurso);

    if (errorImparte) {
      console.error('Error al consultar módulos por curso en imparte:', errorImparte);
    }

    // Se obtienen también los módulos de las evaluaciones registradas para este curso
    const { data: datosEvaluaciones, error: errorEvaluaciones } = await supabase
      .from('Evaluaciones')
      .select('id_modulo, Modulos:id_modulo ( id_modulo, nombre, siglas, descripcion )')
      .eq('id_curso', idCurso);

    if (errorEvaluaciones) {
      console.error('Error al consultar módulos en Evaluaciones:', errorEvaluaciones);
    }

    // Se unifican los módulos eliminando duplicados mediante un mapa por id_modulo
    const modulosMap = new Map();

    (datosImparte || []).forEach((item) => {
      if (item.Modulos && item.Modulos.id_modulo) {
        modulosMap.set(item.Modulos.id_modulo, item.Modulos);
      }
    });

    (datosEvaluaciones || []).forEach((item) => {
      if (item.Modulos && item.Modulos.id_modulo) {
        modulosMap.set(item.Modulos.id_modulo, item.Modulos);
      }
    });

    return { data: Array.from(modulosMap.values()), error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerModulosPorCurso:', err);
    return { data: [], error: err.message || 'Error al obtener módulos del curso.' };
  }
};

// Se obtienen las prácticas asociadas a un módulo específico
export const obtenerPracticasPorModulo = async (idModulo) => {
  if (!idModulo) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('Practicas')
      .select('*')
      .eq('id_modulo', idModulo);

    if (error) {
      console.error(`Error al obtener prácticas del módulo ${idModulo}:`, error);
      return { data: [], error: error.message };
    }

    // Se ordenan de forma natural por número o nombre en JavaScript
    const practicasOrdenadas = [...(data || [])].sort((a, b) => {
      if (a.numero && b.numero) {
        return a.numero.toString().localeCompare(b.numero.toString(), undefined, { numeric: true });
      }
      if (a.numero) return -1;
      if (b.numero) return 1;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    return { data: practicasOrdenadas, error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerPracticasPorModulo:', err);
    return { data: [], error: err.message || 'Error al consultar prácticas.' };
  }
};

// Se obtienen todas las prácticas registradas en el sistema
export const obtenerTodasLasPracticas = async () => {
  try {
    const { data, error } = await supabase
      .from('Practicas')
      .select('*');

    if (error) {
      console.error('Error al consultar todas las prácticas:', error);
      return { data: [], error: error.message };
    }

    const practicasOrdenadas = [...(data || [])].sort((a, b) => {
      if (a.numero && b.numero) {
        return a.numero.toString().localeCompare(b.numero.toString(), undefined, { numeric: true });
      }
      if (a.numero) return -1;
      if (b.numero) return 1;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    return { data: practicasOrdenadas, error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerTodasLasPracticas:', err);
    return { data: [], error: err.message || 'Error al consultar prácticas.' };
  }
};

// Se obtienen los resultados de aprendizaje (RA) de un módulo junto con sus criterios de evaluación (CE)
export const obtenerEstructuraRAModulo = async (idModulo) => {
  if (!idModulo) return { data: [], error: null };
  try {
    // Se obtienen los RA del módulo
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('*')
      .eq('id_modulo', idModulo)
      .order('numero', { ascending: true });

    if (errorRA) {
      console.error('Error al obtener RA del módulo:', errorRA);
      return { data: [], error: errorRA.message };
    }

    if (!listaRA || listaRA.length === 0) {
      return { data: [], error: null };
    }

    const idsRA = listaRA.map((ra) => ra.id_ra);

    // Se obtienen los CE correspondientes a los RA del módulo
    const { data: listaCE, error: errorCE } = await supabase
      .from('CE')
      .select('*')
      .in('id_ra', idsRA)
      .order('numero', { ascending: true });

    if (errorCE) {
      console.error('Error al obtener CE para los RA:', errorCE);
      return { data: [], error: errorCE.message };
    }

    // Se agrupan los CE dentro de cada RA
    const estructura = listaRA.map((ra) => {
      const cesDelRA = (listaCE || []).filter((ce) => ce.id_ra === ra.id_ra);
      return {
        ...ra,
        criterios: cesDelRA
      };
    });

    return { data: estructura, error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerEstructuraRAModulo:', err);
    return { data: [], error: err.message || 'Error al obtener estructura de RA y CE.' };
  }
};

// Se obtienen todas las asignaciones de la tabla trabajan asociadas a las prácticas o CE de un módulo
export const obtenerAsignacionesTrabajanModulo = async (idModulo) => {
  if (!idModulo) return { data: [], error: null };
  try {
    // Se obtienen primero los identificadores de prácticas del módulo
    const { data: practicasModulo, error: errorPracticas } = await supabase
      .from('Practicas')
      .select('id_practica')
      .eq('id_modulo', idModulo);

    if (errorPracticas) {
      console.error('Error al obtener identificadores de prácticas del módulo:', errorPracticas);
      return { data: [], error: errorPracticas.message };
    }

    const idsPracticas = (practicasModulo || []).map((p) => p.id_practica);
    if (idsPracticas.length === 0) {
      return { data: [], error: null };
    }

    // Se consultan las asignaciones en la tabla trabajan incluyendo la información de la práctica y el CE
    const { data: asignaciones, error: errorAsignaciones } = await supabase
      .from('trabajan')
      .select(`
        id_trabajan,
        id_ce,
        id_practica,
        porcentaje,
        descripcion,
        created_at,
        Practicas:id_practica (
          id_practica,
          nombre,
          numero,
          unidad
        ),
        CE:id_ce (
          id_ce,
          nombre,
          numero,
          id_ra
        )
      `)
      .in('id_practica', idsPracticas);

    if (errorAsignaciones) {
      console.error('Error al consultar asignaciones de la tabla trabajan:', errorAsignaciones);
      return { data: [], error: errorAsignaciones.message };
    }

    return { data: asignaciones || [], error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerAsignacionesTrabajanModulo:', err);
    return { data: [], error: err.message || 'Error al obtener asignaciones de trabajo.' };
  }
};

// Se inserta o actualiza una asignación en la tabla trabajan (cobertura de una práctica en un CE)
export const guardarAsignacionTrabajan = async ({ id_ce, id_practica, porcentaje, descripcion = '' }) => {
  try {
    // Se comprueba si ya existe una asignación previa entre este CE y la práctica
    const { data: existente, error: errorBusqueda } = await supabase
      .from('trabajan')
      .select('id_trabajan')
      .eq('id_ce', id_ce)
      .eq('id_practica', id_practica)
      .maybeSingle();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
      console.error('Error al verificar asignación existente en trabajan:', errorBusqueda);
    }

    let resultado;
    if (existente && existente.id_trabajan) {
      // Se actualiza la asignación existente
      const { data, error: errorUpdate } = await supabase
        .from('trabajan')
        .update({
          porcentaje: parseInt(porcentaje, 10),
          descripcion: descripcion || ''
        })
        .eq('id_trabajan', existente.id_trabajan)
        .select(`
          id_trabajan,
          id_ce,
          id_practica,
          porcentaje,
          descripcion,
          created_at,
          Practicas:id_practica (
            id_practica,
            nombre,
            numero,
            unidad
          ),
          CE:id_ce (
            id_ce,
            nombre,
            numero,
            id_ra
          )
        `)
        .single();

      if (errorUpdate) throw errorUpdate;
      resultado = data;
    } else {
      // Se crea una nueva asignación en la tabla trabajan
      const { data, error: errorInsert } = await supabase
        .from('trabajan')
        .insert({
          id_ce,
          id_practica,
          porcentaje: parseInt(porcentaje, 10),
          descripcion: descripcion || ''
        })
        .select(`
          id_trabajan,
          id_ce,
          id_practica,
          porcentaje,
          descripcion,
          created_at,
          Practicas:id_practica (
            id_practica,
            nombre,
            numero,
            unidad
          ),
          CE:id_ce (
            id_ce,
            nombre,
            numero,
            id_ra
          )
        `)
        .single();

      if (errorInsert) throw errorInsert;
      resultado = data;
    }

    return { data: resultado, error: null };
  } catch (err) {
    console.error('Error al guardar asignación en trabajan:', err);
    return { data: null, error: err.message || 'Error al guardar la asignación del criterio.' };
  }
};

// Se elimina una asignación de la tabla trabajan
export const eliminarAsignacionTrabajan = async (idTrabajan) => {
  try {
    const { error } = await supabase
      .from('trabajan')
      .delete()
      .eq('id_trabajan', idTrabajan);

    if (error) {
      console.error('Error al eliminar registro de trabajan:', error);
      return { exito: false, error: error.message };
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error inesperado en eliminarAsignacionTrabajan:', err);
    return { exito: false, error: err.message || 'Error al eliminar la asignación.' };
  }
};

// Se obtienen las prácticas vinculadas a una evaluación mediante la tabla evaluan
export const obtenerPracticasEvaluacion = async (idEvaluacion) => {
  if (!idEvaluacion) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('evaluan')
      .select(`
        id_evaluan,
        id_practica,
        id_evaluacion,
        id_discente,
        nota,
        peso,
        Practicas:id_practica (
          id_practica,
          nombre,
          numero,
          unidad,
          id_tipopractica
        )
      `)
      .eq('id_evaluacion', idEvaluacion);

    if (error) {
      console.error('Error al consultar prácticas de la evaluación en evaluan:', error);
      return { data: [], error: error.message };
    }

    // Se extrae la lista única de prácticas asociadas a la evaluación
    const practicasMap = new Map();
    (data || []).forEach((item) => {
      if (item.id_practica && !practicasMap.has(item.id_practica)) {
        practicasMap.set(item.id_practica, {
          id_practica: item.id_practica,
          practica: item.Practicas,
          peso: item.peso || 100,
          registrosCount: (data || []).filter((reg) => reg.id_practica === item.id_practica).length
        });
      }
    });

    return { data: Array.from(practicasMap.values()), error: null, totalRegistros: (data || []).length };
  } catch (err) {
    console.error('Error inesperado en obtenerPracticasEvaluacion:', err);
    return { data: [], error: err.message || 'Error al obtener prácticas de la evaluación.' };
  }
};

// Se vincula una práctica a una evaluación creando registros en evaluan para todos los discentes del curso y módulo
export const vincularPracticaAEvaluacion = async ({ idPractica, idEvaluacion, idCurso, idModulo, peso = 100 }) => {
  if (!idPractica || !idEvaluacion) {
    return { exito: false, error: 'Faltan parámetros requeridos para vincular la práctica a la evaluación.' };
  }
  try {
    // Se obtienen los discentes matriculados en la clase
    let discentesIds = [];
    if (idCurso && idModulo) {
      const { data: discentesImparte, error: errorImparte } = await supabase
        .from('imparte')
        .select('id_discente')
        .eq('id_curso', idCurso)
        .eq('id_modulo', idModulo);

      if (!errorImparte && discentesImparte && discentesImparte.length > 0) {
        discentesIds = discentesImparte.map((d) => d.id_discente).filter(Boolean);
      }
    }

    // Si no hay discentes matriculados específicamente, se obtienen todos los discentes
    if (discentesIds.length === 0) {
      const { data: todosDiscentes } = await supabase
        .from('Discentes')
        .select('id_discente');

      discentesIds = (todosDiscentes || []).map((d) => d.id_discente).filter(Boolean);
    }

    // Si no hay discentes registrados en la BD, se asigna como plantilla general
    if (discentesIds.length === 0) {
      discentesIds = [null];
    }

    // Se comprueban los registros ya existentes en evaluan para evitar duplicidades
    const { data: existentes } = await supabase
      .from('evaluan')
      .select('id_discente')
      .eq('id_evaluacion', idEvaluacion)
      .eq('id_practica', idPractica);

    const discentesYaAsignados = new Set((existentes || []).map((e) => e.id_discente));
    const discentesFaltantes = discentesIds.filter((id) => !discentesYaAsignados.has(id));

    if (discentesFaltantes.length === 0) {
      return { exito: true, mensaje: 'La práctica ya se encuentra vinculada a la evaluación.' };
    }

    const registrosAInsertar = discentesFaltantes.map((idDiscente) => ({
      id_evaluacion: idEvaluacion,
      id_practica: idPractica,
      id_discente: idDiscente,
      peso: parseInt(peso, 10) || 100,
      nota: null
    }));

    const { data: insertados, error: errorInsercion } = await supabase
      .from('evaluan')
      .insert(registrosAInsertar)
      .select();

    if (errorInsercion) {
      console.error('Error al insertar en la tabla evaluan:', errorInsercion);
      return { exito: false, error: errorInsercion.message };
    }

    return {
      exito: true,
      registrosCreados: insertados?.length || 0,
      mensaje: `Práctica vinculada a la evaluación.`
    };
  } catch (err) {
    console.error('Error inesperado en vincularPracticaAEvaluacion:', err);
    return { exito: false, error: err.message || 'Error al vincular práctica a la evaluación.' };
  }
};

// Se desvincula una práctica de una evaluación eliminando sus registros correspondientes en evaluan
export const desvincularPracticaDeEvaluacion = async ({ idPractica, idEvaluacion }) => {
  if (!idPractica || !idEvaluacion) {
    return { exito: false, error: 'Faltan parámetros requeridos para desvincular la práctica.' };
  }
  try {
    const { error } = await supabase
      .from('evaluan')
      .delete()
      .eq('id_evaluacion', idEvaluacion)
      .eq('id_practica', idPractica);

    if (error) {
      console.error('Error al eliminar registros de evaluan:', error);
      return { exito: false, error: error.message };
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error inesperado en desvincularPracticaDeEvaluacion:', err);
    return { exito: false, error: err.message || 'Error al desvincular la práctica.' };
  }
};

// Se vinculan múltiples prácticas a una evaluación en una sola operación
export const vincularMultiplesPracticasAEvaluacion = async ({ idsPracticas = [], idEvaluacion, idCurso, idModulo, peso = 100 }) => {
  if (!idsPracticas || idsPracticas.length === 0 || !idEvaluacion) {
    return { exito: false, error: 'Faltan parámetros requeridos para vincular las prácticas.' };
  }
  try {
    // Se obtienen los discentes matriculados en la clase
    let discentesIds = [];
    if (idCurso && idModulo) {
      const { data: discentesImparte, error: errorImparte } = await supabase
        .from('imparte')
        .select('id_discente')
        .eq('id_curso', idCurso)
        .eq('id_modulo', idModulo);

      if (!errorImparte && discentesImparte && discentesImparte.length > 0) {
        discentesIds = discentesImparte.map((d) => d.id_discente).filter(Boolean);
      }
    }

    // Si no hay discentes matriculados en imparte, se obtienen todos los discentes
    if (discentesIds.length === 0) {
      const { data: todosDiscentes } = await supabase
        .from('Discentes')
        .select('id_discente');

      discentesIds = (todosDiscentes || []).map((d) => d.id_discente).filter(Boolean);
    }

    if (discentesIds.length === 0) {
      discentesIds = [null];
    }

    // Se consultan los registros ya existentes en evaluan para evitar duplicados
    const { data: existentes, error: errorExistentes } = await supabase
      .from('evaluan')
      .select('id_discente, id_practica')
      .eq('id_evaluacion', idEvaluacion)
      .in('id_practica', idsPracticas);

    if (errorExistentes) {
      console.error('Error al consultar registros existentes en evaluan:', errorExistentes);
    }

    const asignadosSet = new Set(
      (existentes || []).map((e) => `${e.id_practica}_${e.id_discente}`)
    );

    const registrosAInsertar = [];
    idsPracticas.forEach((idPractica) => {
      discentesIds.forEach((idDiscente) => {
        const clave = `${idPractica}_${idDiscente}`;
        if (!asignadosSet.has(clave)) {
          registrosAInsertar.push({
            id_evaluacion: idEvaluacion,
            id_practica: idPractica,
            id_discente: idDiscente,
            peso: parseInt(peso, 10) || 100,
            nota: null
          });
        }
      });
    });

    if (registrosAInsertar.length === 0) {
      return { exito: true, mensaje: 'Todas las prácticas seleccionadas ya estaban vinculadas.' };
    }

    const { data: insertados, error: errorInsercion } = await supabase
      .from('evaluan')
      .insert(registrosAInsertar)
      .select();

    if (errorInsercion) {
      console.error('Error al insertar registros por lotes en evaluan:', errorInsercion);
      return { exito: false, error: errorInsercion.message };
    }

    return {
      exito: true,
      registrosCreados: insertados?.length || 0,
      mensaje: `Se han vinculado ${idsPracticas.length} prácticas a la evaluación.`
    };
  } catch (err) {
    console.error('Error inesperado en vincularMultiplesPracticasAEvaluacion:', err);
    return { exito: false, error: err.message || 'Error al vincular prácticas por lotes.' };
  }
};

// Se desvinculan múltiples prácticas de una evaluación en una sola operación
export const desvincularMultiplesPracticasDeEvaluacion = async ({ idsPracticas = [], idEvaluacion }) => {
  if (!idsPracticas || idsPracticas.length === 0 || !idEvaluacion) {
    return { exito: false, error: 'Faltan parámetros requeridos para desvincular las prácticas.' };
  }
  try {
    const { error } = await supabase
      .from('evaluan')
      .delete()
      .eq('id_evaluacion', idEvaluacion)
      .in('id_practica', idsPracticas);

    if (error) {
      console.error('Error al eliminar registros por lotes en evaluan:', error);
      return { exito: false, error: error.message };
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error inesperado en desvincularMultiplesPracticasDeEvaluacion:', err);
    return { exito: false, error: err.message || 'Error al desvincular prácticas por lotes.' };
  }
};
