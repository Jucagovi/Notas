import { supabase } from './supabaseClient.js';

// Se obtienen las prácticas asignadas a un periodo de evaluación concreto
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
          id_tipopractica,
          enunciado,
          descripcion
        )
      `)
      .eq('id_evaluacion', idEvaluacion);

    if (error) {
      console.error('Error al consultar prácticas de la evaluación en evaluan:', error);
      return { data: [], error: error.message };
    }

    // Se extrae la lista única de prácticas vinculadas a la evaluación
    const practicasMap = new Map();
    (data || []).forEach((item) => {
      if (item.id_practica && !practicasMap.has(item.id_practica)) {
        const registrosPractica = (data || []).filter((reg) => reg.id_practica === item.id_practica);
        const calificados = registrosPractica.filter((reg) => reg.nota !== null && reg.nota !== undefined && reg.id_discente).length;
        const totalAlumnos = registrosPractica.filter((reg) => reg.id_discente).length;

        practicasMap.set(item.id_practica, {
          id_practica: item.id_practica,
          practica: item.Practicas,
          peso: item.peso || 100,
          totalAlumnos,
          totalCalificados: calificados
        });
      }
    });

    // Se ordenan las prácticas por número o nombre de forma natural
    const listaPracticas = Array.from(practicasMap.values()).sort((a, b) => {
      const pA = a.practica || {};
      const pB = b.practica || {};
      if (pA.numero && pB.numero) {
        return pA.numero.toString().localeCompare(pB.numero.toString(), undefined, { numeric: true });
      }
      if (pA.numero) return -1;
      if (pB.numero) return 1;
      return (pA.nombre || '').localeCompare(pB.nombre || '');
    });

    return { data: listaPracticas, error: null };
  } catch (err) {
    console.error('Error inesperado en obtenerPracticasEvaluacion:', err);
    return { data: [], error: err.message || 'Error al obtener prácticas de la evaluación.' };
  }
};

// Se obtienen los discentes matriculados en una clase cruzados con sus calificaciones en evaluan para una práctica
export const getDiscentesPorPractica = async ({ idEvaluacion, idPractica, idCurso, idModulo }) => {
  if (!idEvaluacion || !idPractica) {
    return { data: [], error: 'Identificadores de evaluación y práctica obligatorios.' };
  }

  try {
    // 1. Se obtienen los discentes matriculados en la clase a través de la tabla imparte
    let discentesMatriculados = [];
    if (idCurso && idModulo) {
      const { data: datosImparte, error: errorImparte } = await supabase
        .from('imparte')
        .select(`
          id_imparte,
          id_discente,
          Discentes:id_discente (
            id_discente,
            nombre,
            apellidos,
            NIA,
            correo,
            localidad,
            imagen,
            activo
          )
        `)
        .eq('id_curso', idCurso)
        .eq('id_modulo', idModulo);

      if (errorImparte) {
        console.error('Error al consultar discentes en imparte:', errorImparte);
      } else if (datosImparte && datosImparte.length > 0) {
        discentesMatriculados = datosImparte
          .filter((item) => item.Discentes !== null)
          .map((item) => item.Discentes);
      }
    }

    // Si no hay discentes matriculados por imparte, se obtienen todos los discentes activos
    if (discentesMatriculados.length === 0) {
      const { data: todosDiscentes, error: errorDiscentes } = await supabase
        .from('Discentes')
        .select('id_discente, nombre, apellidos, NIA, correo, localidad, imagen, activo')
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (errorDiscentes) {
        console.error('Error al consultar catálogo general de discentes:', errorDiscentes);
      } else {
        discentesMatriculados = todosDiscentes || [];
      }
    }

    // 2. Se obtienen las calificaciones existentes en la tabla evaluan para esta evaluación y práctica
    const { data: notasEvaluan, error: errorEvaluan } = await supabase
      .from('evaluan')
      .select(`
        id_evaluan,
        id_evaluacion,
        id_practica,
        id_discente,
        nota,
        peso,
        Discentes:id_discente (
          id_discente,
          nombre,
          apellidos,
          NIA,
          correo,
          localidad,
          imagen,
          activo
        )
      `)
      .eq('id_evaluacion', idEvaluacion)
      .eq('id_practica', idPractica);

    if (errorEvaluan) {
      console.error('Error al consultar calificaciones en evaluan:', errorEvaluan);
      throw errorEvaluan;
    }

    // 3. Se mapean los registros de notas existentes indexados por id_discente
    const mapaNotas = new Map();
    (notasEvaluan || []).forEach((reg) => {
      if (reg.id_discente) {
        mapaNotas.set(reg.id_discente, reg);
      }
    });

    // 4. Se cruzan los discentes matriculados con sus calificaciones
    const mapaDiscentesFinal = new Map();

    discentesMatriculados.forEach((d) => {
      const registroNota = mapaNotas.get(d.id_discente);
      mapaDiscentesFinal.set(d.id_discente, {
        id_discente: d.id_discente,
        nombre: d.nombre,
        apellidos: d.apellidos,
        nombreCompleto: `${d.nombre} ${d.apellidos}`,
        NIA: d.NIA || '',
        correo: d.correo || '',
        imagen: d.imagen || null,
        activo: d.activo !== false,
        id_evaluan: registroNota?.id_evaluan || null,
        id_evaluacion: idEvaluacion,
        id_practica: idPractica,
        nota: registroNota?.nota !== undefined ? registroNota.nota : null,
        peso: registroNota?.peso || 100
      });
    });

    // Se incorporan también discentes que figuren en evaluan aunque no estuviesen en imparte
    (notasEvaluan || []).forEach((reg) => {
      if (reg.id_discente && !mapaDiscentesFinal.has(reg.id_discente)) {
        const disc = reg.Discentes || {};
        mapaDiscentesFinal.set(reg.id_discente, {
          id_discente: reg.id_discente,
          nombre: disc.nombre || 'Desconocido',
          apellidos: disc.apellidos || '',
          nombreCompleto: `${disc.nombre || ''} ${disc.apellidos || ''}`.trim(),
          NIA: disc.NIA || '',
          correo: disc.correo || '',
          imagen: disc.imagen || null,
          activo: disc.activo !== false,
          id_evaluan: reg.id_evaluan,
          id_evaluacion: idEvaluacion,
          id_practica: idPractica,
          nota: reg.nota !== undefined ? reg.nota : null,
          peso: reg.peso || 100
        });
      }
    });

    const listaFinal = Array.from(mapaDiscentesFinal.values());

    // Se ordenan los discentes por apellidos y nombre
    listaFinal.sort((a, b) => {
      const apeA = a.apellidos || '';
      const apeB = b.apellidos || '';
      const comparacion = apeA.localeCompare(apeB);
      if (comparacion !== 0) return comparacion;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    return { data: listaFinal, error: null };
  } catch (err) {
    console.error('Error inesperado en getDiscentesPorPractica:', err);
    return { data: [], error: err.message || 'Error al obtener los discentes con calificaciones.' };
  }
};

// Se guarda o actualiza la nota de un discente en una práctica y evaluación en la tabla evaluan
export const guardarNotaPractica = async ({
  idEvaluacion,
  idPractica,
  idDiscente,
  nota,
  idEvaluan = null,
  peso = 100
}) => {
  if (!idEvaluacion || !idPractica || !idDiscente) {
    return {
      exito: false,
      error: 'Parámetros obligatorios incompletos (evaluación, práctica y discente).'
    };
  }

  // Se normaliza el valor de la nota (entero entre 0 y 100, o null si está vacía)
  let notaFinal = null;
  if (nota !== null && nota !== undefined && nota !== '') {
    const num = parseInt(nota, 10);
    if (isNaN(num) || num < 0 || num > 100) {
      return {
        exito: false,
        error: 'La nota debe ser un número entero comprendido entre 0 y 100.'
      };
    }
    notaFinal = num;
  }

  try {
    // Si ya se dispone del identificador de fila en evaluan, se ejecuta una actualización directa
    if (idEvaluan) {
      const { data, error: errorUpdate } = await supabase
        .from('evaluan')
        .update({
          nota: notaFinal,
          peso: parseInt(peso, 10) || 100
        })
        .eq('id_evaluan', idEvaluan)
        .select()
        .single();

      if (errorUpdate) {
        console.error('Error al actualizar nota en evaluan:', errorUpdate);
        throw errorUpdate;
      }

      return {
        exito: true,
        data,
        idEvaluan: data.id_evaluan,
        nota: data.nota,
        mensaje: notaFinal !== null ? `Nota guardada: ${notaFinal}` : 'Calificación eliminada'
      };
    }

    // Si no se dispone de idEvaluan, se comprueba si ya existe un registro en la base de datos
    const { data: existente, error: errorBusqueda } = await supabase
      .from('evaluan')
      .select('id_evaluan')
      .eq('id_evaluacion', idEvaluacion)
      .eq('id_practica', idPractica)
      .eq('id_discente', idDiscente)
      .maybeSingle();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
      console.error('Error al verificar registro previo en evaluan:', errorBusqueda);
    }

    if (existente && existente.id_evaluan) {
      // Se actualiza el registro existente
      const { data, error: errorUpdate } = await supabase
        .from('evaluan')
        .update({
          nota: notaFinal,
          peso: parseInt(peso, 10) || 100
        })
        .eq('id_evaluan', existente.id_evaluan)
        .select()
        .single();

      if (errorUpdate) throw errorUpdate;

      return {
        exito: true,
        data,
        idEvaluan: data.id_evaluan,
        nota: data.nota,
        mensaje: notaFinal !== null ? `Nota guardada: ${notaFinal}` : 'Calificación eliminada'
      };
    }

    // Se inserta un nuevo registro en la tabla evaluan
    const { data, error: errorInsert } = await supabase
      .from('evaluan')
      .insert({
        id_evaluacion: idEvaluacion,
        id_practica: idPractica,
        id_discente: idDiscente,
        nota: notaFinal,
        peso: parseInt(peso, 10) || 100
      })
      .select()
      .single();

    if (errorInsert) {
      console.error('Error al insertar registro en evaluan:', errorInsert);
      throw errorInsert;
    }

    return {
      exito: true,
      data,
      idEvaluan: data.id_evaluan,
      nota: data.nota,
      mensaje: notaFinal !== null ? `Nota guardada: ${notaFinal}` : 'Calificación registrada'
    };
  } catch (err) {
    console.error('Error al guardar nota en evaluan:', err);
    return {
      exito: false,
      error: err.message || 'Error al persistir la calificación en la base de datos.'
    };
  }
};

// Se guardan calificaciones de múltiples discentes en una sola operación por lotes
export const guardarNotasLote = async ({ idEvaluacion, idPractica, calificaciones = [] }) => {
  if (!idEvaluacion || !idPractica || !Array.isArray(calificaciones) || calificaciones.length === 0) {
    return { exito: false, error: 'Parámetros o listado de calificaciones vacío.' };
  }

  try {
    const promesas = calificaciones.map((item) =>
      guardarNotaPractica({
        idEvaluacion,
        idPractica,
        idDiscente: item.id_discente,
        nota: item.nota,
        idEvaluan: item.id_evaluan,
        peso: item.peso || 100
      })
    );

    const resultados = await Promise.all(promesas);
    const fallos = resultados.filter((r) => !r.exito);

    if (fallos.length > 0) {
      return {
        exito: false,
        error: `Falló el guardado de ${fallos.length} calificaciones.`,
        resultados
      };
    }

    return {
      exito: true,
      mensaje: `Se han actualizado ${calificaciones.length} calificaciones con éxito.`
    };
  } catch (err) {
    console.error('Error inesperado en guardarNotasLote:', err);
    return { exito: false, error: err.message || 'Error al guardar el lote de notas.' };
  }
};

export default {
  obtenerPracticasEvaluacion,
  getDiscentesPorPractica,
  guardarNotaPractica,
  guardarNotasLote
};
