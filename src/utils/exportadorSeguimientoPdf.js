import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * exportarSeguimientoPDF - Genera y descarga un documento oficial PDF replicando con exactitud
 * el estilo y maquetación de la ficha de seguimiento curricular mostrada en seguimiento.pdf.
 *
 * Responsabilidad Única: Renderizar el documento vectorial en A4 vertical con jsPDF y jspdf-autotable,
 * ajustando la cuadrícula a las dimensiones de la página completa y mostrando el año académico
 * en la cabecera en lugar de la denominación repetida del grupo.
 *
 * @param {Object} params - Parámetros de datos del informe.
 * @param {string} params.profesor - Nombre completo del docente titular.
 * @param {string} params.anioAcademicoTexto - Denominación del año académico (ej. '2026/2027').
 * @param {string} params.asignatura - Nombre del módulo o asignatura.
 * @param {string} params.evaluacion - Denominación de la evaluación (ej. '1ª EVALUACIÓN').
 * @param {string} params.fechaCorteTexto - Cadena de fecha de corte (ej. 'Hasta 30/09/2025').
 * @param {Array<Object>} params.contenidosProgramados - Lista de Unidades de Trabajo programadas.
 * @param {string} params.contenidosImpartidosTexto - Resumen cualitativo de contenidos impartidos.
 * @param {Array<Object>} [params.contenidosImpartidosListado=[]] - Lista de Unidades de Trabajo impartidas.
 * @param {string} params.observaciones - Redacción de observaciones e incidencias.
 * @returns {Promise<boolean>} Resuelve a true al completarse la descarga del documento.
 */
export const exportarSeguimientoPDF = async ({
  profesor = '',
  anioAcademicoTexto = '2026/2027',
  asignatura = '',
  evaluacion = '1ª EVALUACIÓN',
  fechaCorteTexto = '',
  contenidosProgramados = [],
  contenidosImpartidosTexto = '',
  contenidosImpartidosListado = [],
  observaciones = ''
}) => {
  // Inicialización de jsPDF en orientación vertical A4 (210 x 297 mm).
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margen = 15;
  const anchoUtil = 210 - margen * 2; // 180 mm

  // Texto formateado de la celda superior izquierda sustituyendo el grupo por el año académico.
  const textoMetadatos = [
    `PROFESOR: ${profesor || 'Docente titular'}`,
    `AÑO ACADÉMICO: ${anioAcademicoTexto || '2026/2027'}`,
    `ASIGNATURA:`,
    `${asignatura || 'Módulo profesional'}`
  ].join('\n');

  // Texto formateado de la celda superior derecha con el período de corte.
  const textoPeriodo = [
    `${evaluacion || '1ª EVALUACIÓN'}`,
    `${fechaCorteTexto ? (fechaCorteTexto.startsWith('Hasta') ? fechaCorteTexto : `Hasta ${fechaCorteTexto}`) : 'Período ordinario'}`
  ].join('\n');

  // Texto formateado de los contenidos programados.
  const lineasProgramados = ['CONTENIDOS PROGRAMADOS:\n'];
  if (contenidosProgramados.length === 0) {
    lineasProgramados.push('No constan unidades programadas para este período.');
  } else {
    contenidosProgramados.forEach((ut) => {
      const num = ut.numUT ? `${ut.numUT}. ` : '';
      lineasProgramados.push(`${num}${ut.nombreUT || ut.nombre || 'Unidad de Trabajo'}`);
      if (ut.descripcionUT || ut.descripcion) {
        lineasProgramados.push(`   ${ut.descripcionUT || ut.descripcion}`);
      }
    });
  }
  const textoProgramados = lineasProgramados.join('\n');

  // Texto formateado de los contenidos impartidos.
  const lineasImpartidos = ['CONTENIDOS IMPARTIDOS:\n'];
  if (contenidosImpartidosTexto && contenidosImpartidosTexto.trim() !== '') {
    lineasImpartidos.push(contenidosImpartidosTexto.trim());
  }
  if (contenidosImpartidosListado.length > 0) {
    lineasImpartidos.push('\nUnidades completadas:');
    contenidosImpartidosListado.forEach((ut) => {
      const num = ut.numUT ? `${ut.numUT}. ` : '';
      lineasImpartidos.push(`• ${num}${ut.nombreUT || ut.nombre || 'Unidad de Trabajo'}`);
    });
  } else if (!contenidosImpartidosTexto) {
    lineasImpartidos.push('Durante este período no se han registrado unidades como completadas.');
  }
  const textoImpartidos = lineasImpartidos.join('\n');

  // Texto de la fila de observaciones.
  const textoObservaciones = [
    'Observaciones:',
    observaciones && observaciones.trim() !== ''
      ? observaciones.trim()
      : 'El curso avanza de forma correcta y sin incidentes.'
  ].join('\n');

  // Cálculo proporcional de alturas para que la tabla llene armoniosamente la página A4.
  // Altura útil total: 297 - 30 = 267 mm.
  // Se asignan alturas mínimas garantizando que el diseño ocupe la página manteniendo el marco.
  const minAlturaCabecera = 34;
  const minAlturaContenidos = 150;
  const minAlturaObservaciones = 48;

  // Construcción de la tabla mediante jspdf-autotable ajustada al marco de la página completa.
  autoTable(doc, {
    startY: margen,
    margin: { top: margen, bottom: margen, left: margen, right: margen },
    theme: 'plain',
    tableWidth: anchoUtil,
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: [15, 23, 42],
      lineColor: [0, 0, 0],
      lineWidth: 0.35,
      cellPadding: 4.5,
      overflow: 'linebreak'
    },
    body: [
      // Fila 1: Cabecera con datos docentes y período de evaluación.
      [
        {
          content: textoMetadatos,
          styles: {
            fontStyle: 'normal',
            cellWidth: anchoUtil * 0.58,
            minCellHeight: minAlturaCabecera
          }
        },
        {
          content: textoPeriodo,
          styles: {
            fontStyle: 'bold',
            fillColor: [226, 232, 240], // Fondo gris suave #e2e8f0 idéntico al PDF original.
            cellWidth: anchoUtil * 0.42,
            minCellHeight: minAlturaCabecera
          }
        }
      ],
      // Fila 2: Contenidos programados frente a contenidos impartidos ajustados a la página.
      [
        {
          content: textoProgramados,
          styles: {
            fontStyle: 'normal',
            cellWidth: anchoUtil * 0.58,
            minCellHeight: minAlturaContenidos
          }
        },
        {
          content: textoImpartidos,
          styles: {
            fontStyle: 'normal',
            cellWidth: anchoUtil * 0.42,
            minCellHeight: minAlturaContenidos
          }
        }
      ],
      // Fila 3: Observaciones a ancho completo.
      [
        {
          content: textoObservaciones,
          colSpan: 2,
          styles: {
            fontStyle: 'normal',
            cellWidth: anchoUtil,
            minCellHeight: minAlturaObservaciones
          }
        }
      ]
    ]
  });

  // Generación y descarga directa del archivo PDF en el navegador.
  const nombreLimpioModulo = (asignatura || 'Modulo').replace(/[^a-zA-Z0-9_-]/g, '_');
  const anioLimpio = String(anioAcademicoTexto || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const nombreArchivo = `Seguimiento_${nombreLimpioModulo}_${anioLimpio}.pdf`;

  doc.save(nombreArchivo);
  return true;
};

export default exportarSeguimientoPDF;
