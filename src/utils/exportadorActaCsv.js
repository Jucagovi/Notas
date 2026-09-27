import Papa from 'papaparse';
import { getColorNota } from './coloresNota.js';

/**
 * exportarActaCSV - Genera y descarga un archivo CSV con la matriz de calificaciones por RA.
 *
 * Responsabilidad Única: Estructurar los datos de discentes, RAs y nota del módulo en formato tabular,
 * aplicar BOM para compatibilidad con Excel en castellano y disparar la descarga en el navegador.
 *
 * @param {Object} params
 * @param {Array<Object>} params.discentes - Lista de discentes con calificaciones por RA.
 * @param {Array<Object>} params.ras - Lista de Resultados de Aprendizaje del módulo.
 * @param {string} params.modoCalculo - Modo seleccionado ('continua' o 'final').
 * @param {Object} params.claseInfo - Datos de la clase activa (curso, centro, módulo).
 * @returns {boolean} Retorna true tras iniciar la descarga.
 */
export const exportarActaCSV = ({
  discentes = [],
  ras = [],
  modoCalculo = 'final',
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

    // Columnas para cada Resultado de Aprendizaje
    ras.forEach((ra) => {
      const calif = alumno.notasRA ? alumno.notasRA[ra.id_ra] : null;
      const nota = calif && calif.nota !== null && calif.nota !== undefined ? calif.nota : '?';
      const etiquetaColumna = `RA ${ra.numero} (${ra.peso || 0}%)`;
      fila[etiquetaColumna] = nota;
    });

    const notaModulo =
      modoCalculo === 'continua' ? alumno.notaContinua : alumno.notaFinal;

    const infoColor = getColorNota(notaModulo);

    fila['Nota'] =
      notaModulo !== null && notaModulo !== undefined ? notaModulo : '?';
    fila['Calificación'] =
      notaModulo !== null && notaModulo !== undefined
        ? infoColor.etiqueta
        : 'Sin calificar';
    fila['Modalidad'] =
      modoCalculo === 'continua' ? 'Evaluación Continua' : 'Evaluación Final';

    return fila;
  });

  // Se genera el contenido CSV delimitado por punto y coma (estándar europeo para Excel)
  const csv = Papa.unparse(filas, {
    delimiter: ';',
    header: true
  });

  // Se antepone el Byte Order Mark (BOM) UTF-8 para evitar problemas de tildes y caracteres en Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const nombreModulo = (claseInfo.moduloSiglas || 'modulo')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const modoTexto = modoCalculo === 'continua' ? 'continua' : 'final';

  link.setAttribute('href', url);
  link.setAttribute('download', `acta_evaluacion_ra_${nombreModulo}_${modoTexto}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

export default exportarActaCSV;
