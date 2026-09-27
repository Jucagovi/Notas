import Papa from 'papaparse';

/**
 * exportarActaTrimestresCSV - Genera y descarga un archivo CSV con la matriz de calificaciones por trimestre.
 *
 * Responsabilidad Única: Estructurar los datos tabulares de discentes y evaluaciones,
 * anteponer el Byte Order Mark (BOM) UTF-8 para compatibilidad directa con Microsoft Excel en castellano
 * y disparar la descarga en el navegador.
 *
 * @param {Object} params
 * @param {Array<Object>} params.discentes - Lista de discentes con calificaciones por evaluación.
 * @param {Array<Object>} params.evaluaciones - Lista de evaluaciones normativas ordenadas.
 * @param {Object} params.claseInfo - Datos de la clase activa (curso, centro, módulo).
 * @returns {boolean} Retorna true tras iniciar la descarga.
 */
export const exportarActaTrimestresCSV = ({
  discentes = [],
  evaluaciones = [],
  claseInfo = {}
}) => {
  if (!discentes || discentes.length === 0) {
    throw new Error('No hay alumnos para exportar a CSV.');
  }

  const filas = discentes.map((alumno) => {
    const fila = {
      Apellidos: alumno.apellidos || '',
      Nombre: alumno.nombre || '',
      NIA: alumno.nia || alumno.NIA || ''
    };

    // Columnas dinámicas correspondientes a cada evaluación
    evaluaciones.forEach((ev) => {
      const nota = alumno.notas ? alumno.notas[ev.id_evaluacion] : null;
      fila[ev.nombre] = nota !== null && nota !== undefined ? nota : '?';
    });

    return fila;
  });

  // Se genera el contenido CSV delimitado por punto y coma (estándar europeo para Excel en español)
  const csv = Papa.unparse(filas, {
    delimiter: ';',
    header: true
  });

  // Se antepone el Byte Order Mark (BOM) UTF-8 para evitar incidencias con tildes y caracteres especiales
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const nombreModulo = (claseInfo.moduloSiglas || 'modulo')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const nombreCurso = (claseInfo.cursoNombre || 'curso')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  link.setAttribute('href', url);
  link.setAttribute('download', `acta_trimestres_${nombreModulo}_${nombreCurso}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

export default exportarActaTrimestresCSV;
