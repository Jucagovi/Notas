import { supabase } from './supabaseClient.js';

// Se obtiene la estructura jerárquica de RA y CE de un módulo cruzada con los pesos guardados en ra_curso y ce_curso para un curso
export const obtenerArbolPesosModuloCurso = async (idCurso, idModulo) => {
  if (!idCurso || !idModulo) {
    return { data: [], listaRA: [], listaCE: [], error: null };
  }

  try {
    // 1. Se consultan los resultados de aprendizaje del módulo profesional
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('*')
      .eq('id_modulo', idModulo)
      .order('numero', { ascending: true });

    if (errorRA) {
      console.error(`Error al consultar RA para el módulo ${idModulo}:`, errorRA);
      return { data: [], listaRA: [], listaCE: [], error: errorRA.message };
    }

    if (!listaRA || listaRA.length === 0) {
      return { data: [], listaRA: [], listaCE: [], error: null };
    }

    const idsRA = listaRA.map((ra) => ra.id_ra);

    // 2. Se consultan los criterios de evaluación correspondientes a dichos resultados de aprendizaje
    const { data: listaCE, error: errorCE } = await supabase
      .from('CE')
      .select('*')
      .in('id_ra', idsRA)
      .order('numero', { ascending: true });

    if (errorCE) {
      console.error('Error al consultar CE para los RA del módulo:', errorCE);
      return { data: [], listaRA: [], listaCE: [], error: errorCE.message };
    }

    const idsCE = (listaCE || []).map((ce) => ce.id_ce);

    // 3. Se consultan los pesos registrados en ra_curso para este curso académico
    const { data: datosRaCurso, error: errorRaCurso } = await supabase
      .from('ra_curso')
      .select('*')
      .eq('id_curso', idCurso)
      .in('id_ra', idsRA);

    if (errorRaCurso) {
      console.error('Error al consultar pesos en ra_curso:', errorRaCurso);
      return { data: [], listaRA: [], listaCE: [], error: errorRaCurso.message };
    }

    // 4. Se consultan los pesos registrados en ce_curso para este curso académico
    let datosCeCurso = [];
    if (idsCE.length > 0) {
      const { data: ceCursoRes, error: errorCeCurso } = await supabase
        .from('ce_curso')
        .select('*')
        .eq('id_curso', idCurso)
        .in('id_ce', idsCE);

      if (errorCeCurso) {
        console.error('Error al consultar pesos en ce_curso:', errorCeCurso);
        return { data: [], listaRA: [], listaCE: [], error: errorCeCurso.message };
      }
      datosCeCurso = ceCursoRes || [];
    }

    // Se construyen mapas para acceso rápido a los pesos registrados
    const mapaPesosRA = new Map((datosRaCurso || []).map((item) => [item.id_ra, item]));
    const mapaPesosCE = new Map(datosCeCurso.map((item) => [item.id_ce, item]));

    // 5. Se transforma la estructura plana en nodos jerárquicos compatibles con TreeTable de PrimeReact
    const arbolJerarquico = listaRA.map((ra) => {
      const cesDelRa = (listaCE || []).filter((ce) => ce.id_ra === ra.id_ra);
      const registroRaCurso = mapaPesosRA.get(ra.id_ra);
      const pesoRA = registroRaCurso?.peso !== undefined && registroRaCurso?.peso !== null
        ? Number(registroRaCurso.peso)
        : 0;

      return {
        key: `ra-${ra.id_ra}`,
        data: {
          id: ra.id_ra,
          id_ra: ra.id_ra,
          numero: ra.numero,
          nombre: ra.nombre,
          descripcion: ra.descripcion || '',
          tipo: 'RA',
          codigo: `RA ${ra.numero || ''}`,
          peso: pesoRA,
          id_ra_curso: registroRaCurso?.id_ra_curso || null,
          totalCE: cesDelRa.length
        },
        children: cesDelRa.map((ce) => {
          const registroCeCurso = mapaPesosCE.get(ce.id_ce);
          const pesoCE = registroCeCurso?.peso !== undefined && registroCeCurso?.peso !== null
            ? Number(registroCeCurso.peso)
            : 0;

          return {
            key: `ce-${ce.id_ce}`,
            data: {
              id: ce.id_ce,
              id_ce: ce.id_ce,
              id_ra: ra.id_ra,
              numero: ce.numero,
              nombre: ce.nombre,
              descripcion: ce.descripcion || '',
              tipo: 'CE',
              codigo: `CE ${ce.numero || ''}`,
              peso: pesoCE,
              id_ce_curso: registroCeCurso?.id_ce_curso || null
            }
          };
        })
      };
    });

    return {
      data: arbolJerarquico,
      listaRA: listaRA || [],
      listaCE: listaCE || [],
      error: null
    };
  } catch (err) {
    console.error('Error inesperado en obtenerArbolPesosModuloCurso:', err);
    return {
      data: [],
      listaRA: [],
      listaCE: [],
      error: err.message || 'Error al obtener la estructura de pesos del módulo.'
    };
  }
};

// Se guardan de forma masiva los pesos de RA y CE para un curso y módulo en las tablas ra_curso y ce_curso
export const guardarPesosEvaluacion = async ({ idCurso, idModulo, pesosRA = {}, pesosCE = {} }) => {
  if (!idCurso || !idModulo) {
    return {
      exito: false,
      error: 'Se requiere indicar el curso y el módulo para guardar la ponderación.'
    };
  }

  try {
    // 1. Se obtienen los identificadores de RA y CE correspondientes al módulo
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('id_ra')
      .eq('id_modulo', idModulo);

    if (errorRA) {
      console.error('Error al obtener RA para guardar ponderaciones:', errorRA);
      return { exito: false, error: errorRA.message };
    }

    const idsRA = (listaRA || []).map((ra) => ra.id_ra);

    let idsCE = [];
    if (idsRA.length > 0) {
      const { data: listaCE, error: errorCE } = await supabase
        .from('CE')
        .select('id_ce')
        .in('id_ra', idsRA);

      if (errorCE) {
        console.error('Error al obtener CE para guardar ponderaciones:', errorCE);
        return { exito: false, error: errorCE.message };
      }
      idsCE = (listaCE || []).map((ce) => ce.id_ce);
    }

    // 2. Se eliminan las ponderaciones previas de este módulo y curso en ra_curso y ce_curso
    if (idsRA.length > 0) {
      const { error: errorDelRA } = await supabase
        .from('ra_curso')
        .delete()
        .eq('id_curso', idCurso)
        .in('id_ra', idsRA);

      if (errorDelRA) {
        console.error('Error al eliminar registros previos en ra_curso:', errorDelRA);
        return { exito: false, error: errorDelRA.message };
      }
    }

    if (idsCE.length > 0) {
      const { error: errorDelCE } = await supabase
        .from('ce_curso')
        .delete()
        .eq('id_curso', idCurso)
        .in('id_ce', idsCE);

      if (errorDelCE) {
        console.error('Error al eliminar registros previos en ce_curso:', errorDelCE);
        return { exito: false, error: errorDelCE.message };
      }
    }

    // 3. Se preparan los nuevos registros a insertar en ra_curso
    const registrosRA = idsRA.map((id_ra) => {
      const pesoValor = parseInt(pesosRA[id_ra], 10);
      const pesoFinal = isNaN(pesoValor) ? 0 : Math.max(0, Math.min(100, pesoValor));
      return {
        id_curso: idCurso,
        id_ra,
        peso: pesoFinal
      };
    });

    if (registrosRA.length > 0) {
      const { error: errorInsRA } = await supabase
        .from('ra_curso')
        .insert(registrosRA);

      if (errorInsRA) {
        console.error('Error al insertar nuevos registros en ra_curso:', errorInsRA);
        return { exito: false, error: errorInsRA.message };
      }
    }

    // 4. Se preparan los nuevos registros a insertar en ce_curso
    const registrosCE = idsCE.map((id_ce) => {
      const pesoValor = parseInt(pesosCE[id_ce], 10);
      const pesoFinal = isNaN(pesoValor) ? 0 : Math.max(0, Math.min(100, pesoValor));
      return {
        id_curso: idCurso,
        id_ce,
        peso: pesoFinal
      };
    });

    if (registrosCE.length > 0) {
      const { error: errorInsCE } = await supabase
        .from('ce_curso')
        .insert(registrosCE);

      if (errorInsCE) {
        console.error('Error al insertar nuevos registros en ce_curso:', errorInsCE);
        return { exito: false, error: errorInsCE.message };
      }
    }

    return {
      exito: true,
      error: null,
      totalRA: registrosRA.length,
      totalCE: registrosCE.length
    };
  } catch (err) {
    console.error('Error inesperado en guardarPesosEvaluacion:', err);
    return {
      exito: false,
      error: err.message || 'Error al persistir la ponderación en la base de datos.'
    };
  }
};

// Función auxiliar para calcular una distribución equitativa de pesos que sume exactamente el 100%
export const calcularDistribucionEquitativa = (totalElementos) => {
  if (!totalElementos || totalElementos <= 0) return [];

  const base = Math.floor(100 / totalElementos);
  const resto = 100 % totalElementos;

  // Se asigna la base y se reparte el resto entre los primeros elementos para garantizar la suma exacta de 100
  return Array.from({ length: totalElementos }, (_, indice) => {
    return indice < resto ? base + 1 : base;
  });
};
