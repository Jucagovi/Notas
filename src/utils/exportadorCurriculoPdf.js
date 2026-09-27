import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * exportarCurriculoPDF - Genera y descarga el documento oficial del currículo (RA y CE) en PDF.
 *
 * Responsabilidad Única: Renderizar una ficha curricular estructurada y paginada en A4 vertical
 * utilizando jsPDF y jspdf-autotable, con membrete oficial, metadatos del ciclo formativo y módulo,
 * y desglose jerárquico diferenciando los Resultados de Aprendizaje de los Criterios de Evaluación.
 *
 * @param {Object} params
 * @param {Object|null} [params.ciclo] - Datos del ciclo formativo seleccionado.
 * @param {Object|null} [params.modulo] - Datos del módulo profesional seleccionado.
 * @param {Array<Object>} [params.ras=[]] - Lista de Resultados de Aprendizaje ordenados.
 * @param {Array<Object>} [params.ces=[]] - Lista de Criterios de Evaluación asociados.
 * @returns {Promise<boolean>} Resuelve a true al completarse la descarga del documento.
 */
export const exportarCurriculoPDF = async ({
  ciclo = null,
  modulo = null,
  ras = [],
  ces = []
}) => {
  if (!modulo || ras.length === 0) {
    throw new Error('Se requiere un módulo con Resultados de Aprendizaje para exportar el currículo.');
  }

  // 1. Inicialización del documento PDF en orientación vertical A4 (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const anchoPagina = 210;
  const altoPagina = 297;
  const margen = 14;

  const nombreCiclo = ciclo
    ? `${ciclo.siglas ? `${ciclo.siglas} - ` : ''}${ciclo.nombre}`
    : 'Ciclo Formativo';
  const nombreModulo = modulo
    ? `${modulo.siglas ? `${modulo.siglas} - ` : ''}${modulo.nombre}`
    : 'Módulo Profesional';

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // 2. Cabecera institucional del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CURRÍCULO OFICIAL', margen, margen + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Catálogo Oficial de Resultados de Aprendizaje y Criterios de Evaluación', margen, margen + 9);

  // Fecha y etiqueta de emisión a la derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Fecha de emisión: ${fechaHoy}`, anchoPagina - margen, margen + 4, { align: 'right' });

  // Cuadro informativo con metadatos del ciclo y módulo
  const posYMetadatos = margen + 14;
  const altoCajaMetadatos = 18;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margen, posYMetadatos, anchoPagina - margen * 2, altoCajaMetadatos, 2, 2, 'FD');

  // Línea 1 de metadatos: Ciclo
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ciclo Formativo:', margen + 4, posYMetadatos + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(nombreCiclo, margen + 28, posYMetadatos + 6);

  // Línea 2 de metadatos: Módulo y totales
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Módulo:', margen + 4, posYMetadatos + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(nombreModulo, margen + 28, posYMetadatos + 12);

  // Totales curriculares a la derecha dentro de la caja
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const textoTotales = `Total RAs: ${ras.length}  |  Total CEs: ${ces.length}`;
  doc.text(textoTotales, anchoPagina - margen - 4, posYMetadatos + 12, { align: 'right' });

  // 3. Preparación de columnas y filas para jspdf-autotable
  const columnasEncabezado = [
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Descripción Oficial', dataKey: 'descripcion' }
  ];

  const filas = [];

  // Se recorren los Resultados de Aprendizaje insertando el RA padre seguido de sus CEs
  ras.forEach((ra) => {
    const criteriosDelRa = ces
      .filter((ce) => ce.id_ra === ra.id_ra)
      .sort((a, b) => Number(a.numero) - Number(b.numero));

    const codigoRa = (ra.nombre || `RA${ra.numero}`).trim();
    const descripcionRa = (ra.descripcion || '').trim();

    // Fila del Resultado de Aprendizaje (nodo padre destacado)
    filas.push({
      codigo: codigoRa,
      descripcion: descripcionRa || codigoRa,
      esRA: true
    });

    // Filas hijas de los Criterios de Evaluación
    criteriosDelRa.forEach((ce) => {
      const codigoCe = (ce.nombre || `CE${ce.numero}`).trim();
      const descripcionCe = (ce.descripcion || '').trim();

      filas.push({
        codigo: `  ${codigoCe}`,
        descripcion: descripcionCe || codigoCe,
        esRA: false
      });
    });
  });

  // 4. Renderizado de la tabla estructurada con paginación automática
  const inicioTablaY = posYMetadatos + altoCajaMetadatos + 5;

  autoTable(doc, {
    startY: inicioTablaY,
    columns: columnasEncabezado,
    body: filas,
    theme: 'grid',
    margin: { left: margen, right: margen, bottom: 15 },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.8,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      textColor: [30, 41, 59], // slate-800
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 64, 175], // blue-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      fontSize: 8.5
    },
    columnStyles: {
      codigo: { cellWidth: 26, fontStyle: 'bold' },
      descripcion: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      // Estilización diferenciada para las filas de Resultados de Aprendizaje
      if (data.section === 'body') {
        const filaOriginal = data.row.raw;
        if (filaOriginal && filaOriginal.esRA) {
          data.cell.styles.fillColor = [241, 245, 249]; // slate-100
          data.cell.styles.textColor = [15, 23, 42]; // slate-900
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.textColor = [51, 65, 85]; // slate-700
          if (data.column.dataKey === 'codigo') {
            data.cell.styles.textColor = [30, 64, 175]; // azul sutil para el código del CE
            data.cell.styles.fontStyle = 'normal';
          }
        }
      }
    },
    didDrawPage: () => {
      // Pie de página estandarizado con número de página
      const numPagina = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Currículo Oficial - ${nombreModulo}`,
        margen,
        altoPagina - 8
      );
      doc.text(
        `Página ${numPagina}`,
        anchoPagina - margen,
        altoPagina - 8,
        { align: 'right' }
      );
    }
  });

  // 5. Descarga del archivo generado
  const moduloSiglasLimpias = (modulo?.siglas || 'modulo')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  doc.save(`curriculo_oficial_${moduloSiglasLimpias}.pdf`);
  return true;
};

export default exportarCurriculoPDF;
