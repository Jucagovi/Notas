import { supabase } from './supabaseClient.js';

// Se obtiene la estructura jerárquica de Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE) de un módulo para TreeTable
export const getArbolCriterios = async (moduloId) => {
  if (!moduloId) {
    return { data: [], error: null };
  }

  try {
    // Se consultan los resultados de aprendizaje asociados al módulo profesional
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('*')
      .eq('id_modulo', moduloId)
      .order('numero', { ascending: true });

    if (errorRA) {
      console.error(`Error al consultar RA para el módulo ${moduloId}:`, errorRA);
      return { data: [], error: errorRA.message };
    }

    if (!listaRA || listaRA.length === 0) {
      return { data: [], error: null };
    }

    const idsRA = listaRA.map((ra) => ra.id_ra);

    // Se consultan los criterios de evaluación correspondientes a dichos resultados de aprendizaje
    const { data: listaCE, error: errorCE } = await supabase
      .from('CE')
      .select('*')
      .in('id_ra', idsRA)
      .order('numero', { ascending: true });

    if (errorCE) {
      console.error('Error al consultar CE para los RA seleccionados:', errorCE);
      return { data: [], error: errorCE.message };
    }

    // Se transforma la estructura plana en nodos jerárquicos compatibles con el componente TreeTable de PrimeReact
    const arbolJerarquico = listaRA.map((ra) => {
      const cesDelRa = (listaCE || []).filter((ce) => ce.id_ra === ra.id_ra);

      return {
        key: `ra-${ra.id_ra}`,
        data: {
          id: ra.id_ra,
          id_ra: ra.id_ra,
          numero: ra.numero,
          nombre: ra.nombre,
          descripcion: ra.descripcion || '',
          tipo: 'RA',
          codigo: `RA ${ra.numero || ''}`
        },
        children: cesDelRa.map((ce) => ({
          key: `ce-${ce.id_ce}`,
          data: {
            id: ce.id_ce,
            id_ce: ce.id_ce,
            id_ra: ra.id_ra,
            numero: ce.numero,
            nombre: ce.nombre,
            descripcion: ce.descripcion || '',
            tipo: 'CE',
            codigo: `CE ${ce.numero || ''}`
          }
        }))
      };
    });

    return { data: arbolJerarquico, error: null };
  } catch (err) {
    console.error('Error inesperado en getArbolCriterios:', err);
    return { data: [], error: err.message || 'Error al obtener el árbol de criterios de evaluación.' };
  }
};

// Se guardan los pesos y asignaciones de una práctica borrando las asignaciones previas e insertando las nuevas
export const savePesoCriterios = async (practicaId, selecciones = []) => {
  if (!practicaId) {
    return { exito: false, error: 'Identificador de práctica requerido para guardar los pesos.' };
  }

  try {
    // Se eliminan primero las asignaciones previas de la práctica en la tabla trabajan
    const { error: errorEliminar } = await supabase
      .from('trabajan')
      .delete()
      .eq('id_practica', practicaId);

    if (errorEliminar) {
      console.error(`Error al eliminar asignaciones anteriores de la práctica ${practicaId}:`, errorEliminar);
      return { exito: false, error: errorEliminar.message };
    }

    // Si existen criterios seleccionados, se preparan e insertan los nuevos registros
    if (Array.isArray(selecciones) && selecciones.length > 0) {
      const registrosAInsertar = selecciones.map((sel) => {
        const porcentajeNum = parseInt(sel.porcentaje, 10);
        const porcentajeFinal = isNaN(porcentajeNum) ? 100 : Math.max(0, Math.min(100, porcentajeNum));

        return {
          id_practica: practicaId,
          id_ce: sel.id_ce,
          porcentaje: porcentajeFinal,
          descripcion: sel.descripcion || ''
        };
      });

      const { error: errorInsertar } = await supabase
        .from('trabajan')
        .insert(registrosAInsertar);

      if (errorInsertar) {
        console.error('Error al insertar nuevas asignaciones en la tabla trabajan:', errorInsertar);
        return { exito: false, error: errorInsertar.message };
      }
    }

    return { exito: true, error: null, totalGuardados: selecciones.length };
  } catch (err) {
    console.error('Error inesperado en savePesoCriterios:', err);
    return { exito: false, error: err.message || 'Error al persistir las asignaciones de criterios.' };
  }
};

// Se obtienen las asignaciones existentes en la tabla trabajan para una práctica determinada
export const obtenerAsignacionesPorPractica = async (practicaId) => {
  if (!practicaId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('trabajan')
      .select(`
        id_trabajan,
        id_ce,
        id_practica,
        porcentaje,
        descripcion,
        created_at
      `)
      .eq('id_practica', practicaId);

    if (error) {
      console.error(`Error al obtener asignaciones de la práctica ${practicaId}:`, error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerAsignacionesPorPractica:', err);
    return { data: [], error: err.message || 'Error al consultar asignaciones de la práctica.' };
  }
};

// Se obtienen todas las prácticas con información complementaria de su módulo profesional asociado
export const obtenerPracticasConModulo = async () => {
  try {
    const { data, error } = await supabase
      .from('Practicas')
      .select(`
        id_practica,
        nombre,
        numero,
        enunciado,
        descripcion,
        id_tipopractica,
        unidad,
        id_modulo,
        Modulos:id_modulo (
          id_modulo,
          nombre,
          siglas
        )
      `);

    if (error) {
      console.error('Error al consultar prácticas con módulo:', error);
      return { data: [], error: error.message };
    }

    // Se ordenan las prácticas de manera natural por numeración o nombre
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
    console.error('Error inesperado en obtenerPracticasConModulo:', err);
    return { data: [], error: err.message || 'Error al obtener la lista de prácticas.' };
  }
};

// Se obtienen las prácticas que han sido asignadas a alguna evaluación del módulo en el curso seleccionado
export const obtenerPracticasAsignadasEvaluacion = async (idCurso, idModulo) => {
  if (!idCurso || !idModulo) {
    return { data: [], error: null };
  }

  try {
    // 1. Se obtienen las evaluaciones asociadas al curso y módulo seleccionados
    const { data: evaluaciones, error: errorEv } = await supabase
      .from('Evaluaciones')
      .select('id_evaluacion')
      .eq('id_curso', idCurso)
      .eq('id_modulo', idModulo);

    if (errorEv) {
      console.error('Error al consultar evaluaciones para el curso y módulo:', errorEv);
      return { data: [], error: errorEv.message };
    }

    if (!evaluaciones || evaluaciones.length === 0) {
      return { data: [], error: null };
    }

    const idsEvaluaciones = evaluaciones.map((ev) => ev.id_evaluacion);

    // 2. Se consultan las prácticas vinculadas en evaluan para esas evaluaciones
    const { data: datosEvaluan, error: errorEvaluan } = await supabase
      .from('evaluan')
      .select(`
        id_practica,
        Practicas:id_practica (
          id_practica,
          nombre,
          numero,
          enunciado,
          descripcion,
          id_tipopractica,
          unidad,
          id_modulo,
          Modulos:id_modulo (
            id_modulo,
            nombre,
            siglas
          )
        )
      `)
      .in('id_evaluacion', idsEvaluaciones);

    if (errorEvaluan) {
      console.error('Error al consultar prácticas asignadas en evaluan:', errorEvaluan);
      return { data: [], error: errorEvaluan.message };
    }

    // 3. Se unifican los registros por id_practica para eliminar duplicados
    const mapaPracticas = new Map();
    (datosEvaluan || []).forEach((item) => {
      if (item.id_practica && item.Practicas && !mapaPracticas.has(item.id_practica)) {
        mapaPracticas.set(item.id_practica, item.Practicas);
      }
    });

    // 4. Se ordenan las prácticas de manera natural por numeración o nombre
    const listaOrdenada = Array.from(mapaPracticas.values()).sort((a, b) => {
      if (a.numero && b.numero) {
        return a.numero.toString().localeCompare(b.numero.toString(), undefined, { numeric: true });
      }
      if (a.numero) return -1;
      if (b.numero) return 1;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    return { data: listaOrdenada, error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerPracticasAsignadasEvaluacion:', err);
    return { data: [], error: err.message || 'Error al obtener las prácticas asignadas a evaluaciones.' };
  }
};
