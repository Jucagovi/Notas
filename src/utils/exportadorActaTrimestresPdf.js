import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getColorNota } from './coloresNota.js';

/**
 * exportarActaTrimestresPDF - Genera y descarga el documento oficial de Acta por Trimestres en formato PDF.
 *
 * Responsabilidad Única: Renderizar el informe oficial de calificaciones trimestrales utilizando
 * jsPDF y jspdf-autotable en formato apaisado (A4 landscape) con membrete administrativo,
 * matriz de evaluaciones coloreada por calificación, cuadro estadístico del grupo y diligencia de firmas.
 *
 * @param {Object} params
 * @param {Array<Object>} params.discentes - Lista de discentes con calificaciones por evaluación.
 * @param {Array<Object>} params.evaluaciones - Lista de evaluaciones normativas ordenadas.
 * @param {Object} params.claseInfo - Datos de la clase activa (curso, centro, módulo).
 * @param {string} params.anioLectivo - Denominación textual del año escolar (ej. '2026/2027').
 * @returns {Promise<boolean>} Resuelve a true al completarse la descarga del documento.
 */
export const exportarActaTrimestresPDF = async ({
  discentes = [],
  evaluaciones = [],
  claseInfo = {},
  anioLectivo = ''
}) => {
  if (!discentes || discentes.length === 0) {
    throw new Error('No hay alumnos para incluir en el acta oficial.');
  }

  // 1. Inicialización del documento PDF en orientación apaisada A4 (297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const anchoPagina = 297;
  const altoPagina = 210;
  const margen = 12;

  const nombreModulo = claseInfo.moduloNombre
    ? `${claseInfo.moduloSiglas ? `${claseInfo.moduloSiglas} - ` : ''}${claseInfo.moduloNombre}`
    : 'Módulo Profesional';
  const nombreCurso = claseInfo.cursoNombre || 'Curso Académico';
  const nombreCentro = claseInfo.cursoCentro || 'Centro Docente';

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // 2. Cabecera institucional del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('ACTA OFICIAL DE EVALUACIÓN POR TRIMESTRES', margen, margen + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(nombreModulo, margen, margen + 9);

  // Cuadro superior derecho con el curso escolar y centro
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 175); // blue-800
  const textoCursoEscolar = `Curso Escolar ${anioLectivo || ''}`;
  doc.text(textoCursoEscolar, anchoPagina - margen, margen + 4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(nombreCentro, anchoPagina - margen, margen + 9, { align: 'right' });

  // Cuadro informativo con metadatos de la convocatoria
  const posYMetadatos = margen + 13;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margen, posYMetadatos, anchoPagina - margen * 2, 7.5, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Curso / Grupo: `, margen + 3, posYMetadatos + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreCurso, margen + 24, posYMetadatos + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de emisión: `, margen + 115, posYMetadatos + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(fechaHoy, margen + 142, posYMetadatos + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Alumnos: `, margen + 210, posYMetadatos + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${discentes.length}`, margen + 232, posYMetadatos + 5);

  // 3. Preparación de columnas y filas para jspdf-autotable
  const columnasEncabezado = [
    { header: 'Nº', dataKey: 'numero' },
    { header: 'Discente (Apellidos, Nombre)', dataKey: 'discente' },
    { header: 'NIA', dataKey: 'nia' }
  ];

  evaluaciones.forEach((ev) => {
    columnasEncabezado.push({
      header: ev.nombre,
      dataKey: ev.id_evaluacion
    });
  });

  const filasDatos = discentes.map((alumno, index) => {
    const fila = {
      numero: (index + 1).toString(),
      discente: alumno.nombreCompleto || `${alumno.apellidos || ''}, ${alumno.nombre || ''}`.trim(),
      nia: alumno.nia || alumno.NIA || '-'
    };

    evaluaciones.forEach((ev) => {
      const nota = alumno.notas ? alumno.notas[ev.id_evaluacion] : null;
      fila[ev.id_evaluacion] = nota !== null && nota !== undefined ? String(nota) : '?';
    });

    return fila;
  });

  // 4. Renderizado de la tabla con estilos oficiales y coloreado de calificaciones
  const inicioTablaY = posYMetadatos + 11;

  autoTable(doc, {
    startY: inicioTablaY,
    columns: columnasEncabezado,
    body: filasDatos,
    theme: 'grid',
    margin: { left: margen, right: margen },
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [203, 213, 225], // slate-300
      lineWidth: 0.2,
      textColor: [30, 41, 59] // slate-800
    },
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 8.5
    },
    columnStyles: {
      numero: { halign: 'center', cellWidth: 10 },
      discente: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
      nia: { halign: 'center', cellWidth: 24 }
    },
    didParseCell: (data) => {
      // Se centran las columnas dinámicas correspondientes a evaluaciones
      if (data.section === 'body' && data.column.dataKey !== 'numero' && data.column.dataKey !== 'discente' && data.column.dataKey !== 'nia') {
        data.cell.styles.halign = 'center';
        data.cell.styles.fontStyle = 'bold';

        const textoCelda = data.cell.raw;
        const nota = Number(textoCelda);

        if (!isNaN(nota) && textoCelda !== '?') {
          const colorInfo = getColorNota(nota);
          // Se convierte el hexadecimal a componentes RGB
          const hex = colorInfo.hex.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          data.cell.styles.textColor = [r, g, b];
        } else {
          data.cell.styles.textColor = [148, 163, 184]; // slate-400
        }
      }
    }
  });

  // 5. Estadísticas resumidas del grupo al pie de la tabla
  const posFinTablaY = doc.lastAutoTable.finalY + 5;

  // Se calculan las estadísticas sobre la última evaluación evaluada o general
  let totalEvaluados = 0;
  let totalAprobados = 0;
  let totalSuspensos = 0;
  let sumaNotas = 0;

  discentes.forEach((alumno) => {
    // Se toma la última nota válida de las evaluaciones
    let ultimaNota = null;
    for (let i = evaluaciones.length - 1; i >= 0; i--) {
      const idEv = evaluaciones[i].id_evaluacion;
      if (alumno.notas && alumno.notas[idEv] !== null && alumno.notas[idEv] !== undefined) {
        ultimaNota = alumno.notas[idEv];
        break;
      }
    }

    if (ultimaNota !== null) {
      totalEvaluados++;
      sumaNotas += ultimaNota;
      if (ultimaNota >= 50) {
        totalAprobados++;
      } else {
        totalSuspensos++;
      }
    }
  });

  const mediaGrupo = totalEvaluados > 0 ? (sumaNotas / totalEvaluados).toFixed(1) : '-';

  // Si queda poco espacio en la página, se agrega una página nueva para estadísticas y firmas
  if (posFinTablaY > altoPagina - 35) {
    doc.addPage();
  }

  const posYBloqueFinal = doc.internal.getCurrentPageInfo().pageNumber > 1 ? margen + 10 : posFinTablaY;

  // Cuadro de estadísticas
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margen, posYBloqueFinal, 110, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RESUMEN ESTADÍSTICO DEL GRUPO', margen + 3, posYBloqueFinal + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Matriculados: ${discentes.length}`, margen + 3, posYBloqueFinal + 9);
  doc.text(`Evaluados: ${totalEvaluados}`, margen + 40, posYBloqueFinal + 9);
  doc.text(`Aprobados (>=50): ${totalAprobados}`, margen + 3, posYBloqueFinal + 13.5);
  doc.text(`Suspensos (<50): ${totalSuspensos}`, margen + 40, posYBloqueFinal + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`Calificación Media Global: ${mediaGrupo} / 100`, margen + 3, posYBloqueFinal + 18.5);

  // Cuadro de firmas reglamentarias
  const anchoFirmas = 150;
  const posXFirmas = anchoPagina - margen - anchoFirmas;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(posXFirmas, posYBloqueFinal, anchoFirmas, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`En ____________________, a ${fechaHoy}`, posXFirmas + anchoFirmas - 4, posYBloqueFinal + 4, { align: 'right' });

  // Líneas para firma
  const anchoColFirma = anchoFirmas / 2 - 10;
  const posYLinea = posYBloqueFinal + 17;

  doc.setDrawColor(148, 163, 184);
  doc.line(posXFirmas + 10, posYLinea, posXFirmas + 10 + anchoColFirma, posYLinea);
  doc.line(posXFirmas + anchoFirmas / 2 + 5, posYLinea, posXFirmas + anchoFirmas - 10, posYLinea);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('El/La Profesor/a del Módulo', posXFirmas + 10 + anchoColFirma / 2, posYLinea + 3.5, { align: 'center' });
  doc.text('Vº Bº Jefatura de Estudios', posXFirmas + anchoFirmas / 2 + 5 + anchoColFirma / 2, posYLinea + 3.5, { align: 'center' });

  // Pie de página administrativo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Control de Notas — Acta Oficial de Evaluación por Trimestres', margen, altoPagina - 5);
  doc.text('Documento oficial generado para Jefatura de Estudios conforme a la normativa vigente', anchoPagina - margen, altoPagina - 5, { align: 'right' });

  // 6. Descarga del archivo
  const nombreLimpio = (claseInfo.moduloSiglas || 'modulo')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const cursoLimpio = (claseInfo.cursoNombre || 'curso')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  doc.save(`acta_trimestres_${nombreLimpio}_${cursoLimpio}.pdf`);
  return true;
};

export default exportarActaTrimestresPDF;
