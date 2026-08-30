import { supabase } from './supabaseClient.js';

// Se obtienen las prácticas asociadas a una evaluación específica junto con sus pesos registrados en evaluan
export const obtenerPracticasEvaluacion = async (idEvaluacion) => {
  if (!idEvaluacion) {
    return { data: [], error: null };
  }

  try {
    // Se consultan los registros de la tabla evaluan para la evaluación seleccionada incluyendo los datos de la práctica
    const { data, error } = await supabase
      .from('evaluan')
      .select(`
        id_evaluan,
        id_practica,
        id_evaluacion,
        id_discente,
        peso,
        Practicas:id_practica (
          id_practica,
          nombre,
          numero,
          unidad,
          enunciado,
          descripcion,
          id_tipopractica
        )
      `)
      .eq('id_evaluacion', idEvaluacion);

    if (error) {
      console.error('Error al obtener prácticas de la evaluación desde la tabla evaluan:', error);
      return { data: [], error: error.message };
    }

    // Se unifican los registros por id_practica para obtener la lista consolidada de prácticas únicas de la evaluación
    const mapaPracticas = new Map();

    (data || []).forEach((item) => {
      if (item.id_practica && !mapaPracticas.has(item.id_practica)) {
        const infoPractica = item.Practicas || {};
        mapaPracticas.set(item.id_practica, {
          id_practica: item.id_practica,
          nombre: infoPractica.nombre || 'Práctica sin título',
          numero: infoPractica.numero || '',
          unidad: infoPractica.unidad || '',
          enunciado: infoPractica.enunciado || '',
          descripcion: infoPractica.descripcion || '',
          id_tipopractica: infoPractica.id_tipopractica || '',
          peso: item.peso !== null && item.peso !== undefined ? Number(item.peso) : 0,
          totalDiscentes: 0,
          registrosIds: []
        });
      }

      if (item.id_practica) {
        const registro = mapaPracticas.get(item.id_practica);
        registro.totalDiscentes += 1;
        registro.registrosIds.push(item.id_evaluan);
      }
    });

    // Se ordenan las prácticas de manera natural por su numeración o nombre
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
    console.error('Error inesperado en obtenerPracticasEvaluacion:', err);
    return { data: [], error: err.message || 'Error al consultar las prácticas de la evaluación.' };
  }
};

// Se actualiza de forma masiva el peso de cada práctica en la tabla evaluan para todos los discentes de la evaluación
export const actualizarPesosEvaluacion = async (idEvaluacion, pesosPracticas) => {
  if (!idEvaluacion || !Array.isArray(pesosPracticas) || pesosPracticas.length === 0) {
    return { exito: false, error: 'Parámetros no válidos para la actualización masiva de pesos.' };
  }

  try {
    // Se ejecutan las operaciones de actualización concurrentes para cada práctica de la evaluación
    const promesas = pesosPracticas.map((item) => {
      const pesoValor = parseInt(item.peso, 10);
      const pesoFinal = isNaN(pesoValor) ? 0 : Math.max(0, Math.min(100, pesoValor));

      return supabase
        .from('evaluan')
        .update({ peso: pesoFinal })
        .eq('id_evaluacion', idEvaluacion)
        .eq('id_practica', item.id_practica);
    });

    const resultados = await Promise.all(promesas);

    // Se verifica si ocurrió algún error en alguna de las actualizaciones
    for (const respuesta of resultados) {
      if (respuesta.error) {
        console.error('Error al actualizar el peso de una práctica en evaluan:', respuesta.error);
        return { exito: false, error: respuesta.error.message };
      }
    }

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error inesperado en actualizarPesosEvaluacion:', err);
    return { exito: false, error: err.message || 'Error al persistir la asignación de pesos en la base de datos.' };
  }
};

// Función auxiliar para calcular una distribución equitativa de pesos que sume exactamente el 100%
export const calcularDistribucionEquitativa = (totalPracticas) => {
  if (!totalPracticas || totalPracticas <= 0) return [];

  const base = Math.floor(100 / totalPracticas);
  const resto = 100 % totalPracticas;

  // Se asigna la base y se reparte el resto entre las primeras prácticas para garantizar la suma exacta de 100
  return Array.from({ length: totalPracticas }, (_, indice) => {
    return indice < resto ? base + 1 : base;
  });
};
