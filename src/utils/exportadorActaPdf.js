import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getColorNota } from './coloresNota.js';

/**
 * exportarActaPDF - Genera y descarga un documento PDF oficial con el Acta de Evaluación por RA en una sola página.
 *
 * Responsabilidad Única: Renderizar una maqueta formal de acta académica ajustada en una única página (A4 landscape)
 * con metadatos del curso, tabla compacta de calificaciones por Resultados de Aprendizaje,
 * estadísticas de grupo y cuadro de firmas.
 *
 * @param {Object} params
 * @param {Array<Object>} params.discentes - Lista de discentes con calificaciones por RA.
 * @param {Array<Object>} params.ras - Lista de Resultados de Aprendizaje del módulo.
 * @param {string} params.modoCalculo - Modo seleccionado: 'continua' o 'final'.
 * @param {Object} params.claseInfo - Datos de la clase activa (curso, centro, módulo).
 * @param {string} params.anioLectivo - Denominación completa del año escolar (ej. '2026/2027').
 * @returns {Promise<boolean>} Resuelve a true al completarse la descarga.
 */
export const exportarActaPDF = async ({
  discentes = [],
  ras = [],
  modoCalculo = 'final',
  claseInfo = {},
  anioLectivo = ''
}) => {
  if (!discentes || discentes.length === 0) {
    throw new Error('No hay alumnos para incluir en el acta oficial.');
  }

  // Se crea un contenedor temporal invisible dimensionado para A4 apaisado compacto
  const contenedor = document.createElement('div');
  contenedor.id = 'documento-impresion-acta';
  contenedor.style.position = 'fixed';
  contenedor.style.left = '-9999px';
  contenedor.style.top = '0';
  contenedor.style.width = '1122px'; // Ancho A4 apaisado a 96 DPI estándar
  contenedor.style.padding = '20px 28px';
  contenedor.style.backgroundColor = '#ffffff';
  contenedor.style.color = '#0f172a';
  contenedor.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  contenedor.style.fontSize = '11px';
  contenedor.style.lineHeight = '1.35';
  contenedor.style.boxSizing = 'border-box';

  const nombreModulo = claseInfo.moduloNombre
    ? `${claseInfo.moduloSiglas ? `${claseInfo.moduloSiglas} - ` : ''}${claseInfo.moduloNombre}`
    : 'Módulo Profesional';
  const nombreCurso = claseInfo.cursoNombre || 'Curso Académico';
  const nombreCentro = claseInfo.cursoCentro || 'Centro Docente';
  const modalidadTexto =
    modoCalculo === 'continua'
      ? 'Evaluación Continua (Reescalado temporal al 100%)'
      : 'Evaluación Final Ordinaria (Ponderación curricular oficial)';

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Estadísticas cuantitativas del grupo
  let aprobados = 0;
  let suspensos = 0;
  let sumaNotas = 0;
  let alumnosEvaluados = 0;

  discentes.forEach((d) => {
    const nota = modoCalculo === 'continua' ? d.notaContinua : d.notaFinal;
    if (nota !== null && nota !== undefined) {
      alumnosEvaluados++;
      sumaNotas += nota;
      if (nota >= 50) {
        aprobados++;
      } else {
        suspensos++;
      }
    }
  });

  const mediaGrupo =
    alumnosEvaluados > 0 ? (sumaNotas / alumnosEvaluados).toFixed(1) : '-';

  // Filas compactas de discentes en la tabla
  const filasDiscentesHtml = discentes
    .map((alumno, index) => {
      const notaModulo =
        modoCalculo === 'continua' ? alumno.notaContinua : alumno.notaFinal;
      const infoColorModulo = getColorNota(notaModulo);

      const celdasRaHtml = ras
        .map((ra) => {
          const calif = alumno.notasRA ? alumno.notasRA[ra.id_ra] : null;
          const nota = calif && calif.nota !== null && calif.nota !== undefined ? calif.nota : null;
          const infoColor = getColorNota(nota);

          if (nota === null) {
            return `<td style="text-align: center; color: #94a3b8; font-weight: 700; border: 1px solid #cbd5e1; padding: 3px 4px; font-size: 10.5px;">?</td>`;
          }

          return `
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 3px 4px;">
              <span style="display: inline-block; background-color: ${infoColor.hex}; color: #ffffff; font-weight: 700; padding: 1px 5px; border-radius: 3px; font-size: 10px;">
                ${nota}
              </span>
            </td>
          `;
        })
        .join('');

      // Nota del módulo sin fondo de color, aplicando el color semántico directamente con tamaño igual al resto
      const notaModuloTexto =
        notaModulo !== null
          ? `<span style="color: ${infoColorModulo.hex}; font-weight: 700; font-size: 10px;">${notaModulo}</span>`
          : `<span style="color: #94a3b8; font-weight: 700; font-size: 10px;">?</span>`;

      const etiquetaCualitativa =
        notaModulo !== null ? infoColorModulo.etiqueta : 'Sin calificar';

      const fondoFila = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${fondoFila};">
          <td style="text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; padding: 3px 4px; color: #64748b; font-size: 10px;">
            ${index + 1}
          </td>
          <td style="border: 1px solid #cbd5e1; vertical-align: middle; padding: 3px 6px; font-weight: 600; color: #1e293b; white-space: nowrap; font-size: 10.5px;">
            ${alumno.apellidos}, ${alumno.nombre}
          </td>
          <td style="text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; padding: 3px 4px; font-family: monospace; font-size: 10px; color: #475569;">
            ${alumno.nia || alumno.NIA || '-'}
          </td>
          ${celdasRaHtml}
          <td style="text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; padding: 3px 6px;">
            ${notaModuloTexto}
          </td>
          <td style="text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; padding: 3px 6px; font-size: 10px; color: #334155; font-weight: 500;">
            ${etiquetaCualitativa}
          </td>
        </tr>
      `;
    })
    .join('');

  // Encabezados de columnas de RA compactos y centrados
  const encabezadosRaHtml = ras
    .map(
      (ra) => `
        <th style="border: 1px solid #cbd5e1; padding: 4px 3px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e293b; font-size: 10px; font-weight: 700;">
          <div>RA ${ra.numero}</div>
          <div style="font-size: 9px; color: #64748b; font-weight: 400;">(${ra.peso || 0}%)</div>
        </th>
      `
    )
    .join('');

  // Maquetación integral del documento sin línea divisoria en cabecera ni texto de Conselleria
  contenedor.innerHTML = `
    <!-- Cabecera institucional limpia sin línea divisoria ni texto de Conselleria -->
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">
            ACTA OFICIAL DE EVALUACIÓN POR RESULTADOS DE APRENDIZAJE
          </h1>
          <div style="font-size: 12px; color: #475569; font-weight: 600;">
            ${nombreModulo}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; padding: 2px 8px; font-weight: 700; font-size: 10.5px;">
            Curso Escolar ${anioLectivo || ''}
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">
            ${nombreCentro}
          </div>
        </div>
      </div>
    </div>

    <!-- Metadatos de la convocatoria -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 10px; margin-bottom: 8px; font-size: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <div>
          <strong style="color: #475569;">Curso/Grupo:</strong>
          <span style="color: #0f172a; margin-left: 4px;">${nombreCurso}</span>
        </div>
        <div>
          <strong style="color: #475569;">Modalidad:</strong>
          <span style="color: #0f172a; margin-left: 4px;">${modalidadTexto}</span>
        </div>
        <div>
          <strong style="color: #475569;">Fecha de emisión:</strong>
          <span style="color: #0f172a; margin-left: 4px;">${fechaHoy}</span>
        </div>
      </div>
    </div>

    <!-- Tabla oficial de calificaciones reajustada y compacta con cabeceras centradas -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10.5px;">
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; padding: 4px 3px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e293b; width: 28px;">Nº</th>
          <th style="border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e293b; min-width: 160px;">Discente</th>
          <th style="border: 1px solid #cbd5e1; padding: 4px 4px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e293b; width: 68px;">NIA</th>
          ${encabezadosRaHtml}
          <th style="border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e3a8a; font-weight: 800; width: 65px;">
            Nota
          </th>
          <th style="border: 1px solid #cbd5e1; padding: 4px 6px; text-align: center; vertical-align: middle; background-color: #f1f5f9; color: #1e293b; width: 95px;">
            Calificación
          </th>
        </tr>
      </thead>
      <tbody>
        ${filasDiscentesHtml}
      </tbody>
    </table>

    <!-- Estadísticas y Cuadro de firmas compacto -->
    <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 14px; align-items: flex-start; margin-top: 8px;">
      <!-- Estadísticas del grupo -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-size: 10px;">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">
          Resumen Estadístico del Grupo
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div><strong style="color: #64748b;">Matriculados:</strong> ${discentes.length}</div>
          <div><strong style="color: #64748b;">Evaluados:</strong> ${alumnosEvaluados}</div>
          <div><strong style="color: #16a34a;">Aprobados (≥50):</strong> ${aprobados}</div>
          <div><strong style="color: #dc2626;">Suspensos (&lt;50):</strong> ${suspensos}</div>
          <div style="grid-column: span 2; margin-top: 2px; padding-top: 3px; border-top: 1px dashed #cbd5e1;">
            <strong style="color: #1e293b;">Calificación Media del Grupo:</strong>
            <span style="font-weight: 800; color: #1e40af; margin-left: 5px;">${mediaGrupo} / 100</span>
          </div>
        </div>
      </div>

      <!-- Diligencia de firmas -->
      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; background-color: #ffffff;">
        <div style="font-size: 9.5px; color: #64748b; margin-bottom: 14px; text-align: right;">
          En ____________________, a ${fechaHoy}
        </div>
        <div style="display: flex; justify-content: space-around; text-align: center; font-size: 10px;">
          <div style="width: 45%;">
            <div style="border-top: 1px solid #94a3b8; padding-top: 3px; margin-top: 16px;">
              <strong>El/La Profesor/a del Módulo</strong>
            </div>
          </div>
          <div style="width: 45%;">
            <div style="border-top: 1px solid #94a3b8; padding-top: 3px; margin-top: 16px;">
              <strong>Vº Bº Jefatura de Estudios</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pie de página compacto -->
    <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8;">
      <span>Control de Notas — Acta Oficial de Evaluación por RA</span>
      <span>Documento administrativo generado conforme a la normativa vigente</span>
    </div>
  `;

  document.body.appendChild(contenedor);

  try {
    const lienzo = await html2canvas(contenedor, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imagenData = lienzo.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const anchoPagina = 297; // mm A4 landscape
    const altoPagina = 210; // mm A4 landscape
    const margen = 8; // mm margen exterior
    const anchoImprimible = anchoPagina - margen * 2;
    const altoImprimible = altoPagina - margen * 2;

    const altoImagenMm = (lienzo.height * anchoImprimible) / lienzo.width;

    // Se garantiza que el documento se presente estrictamente en una única página A4 apaisada
    if (altoImagenMm > altoImprimible) {
      const escala = altoImprimible / altoImagenMm;
      const anchoEscalado = anchoImprimible * escala;
      const offsetX = margen + (anchoImprimible - anchoEscalado) / 2;
      pdf.addImage(imagenData, 'JPEG', offsetX, margen, anchoEscalado, altoImprimible);
    } else {
      pdf.addImage(imagenData, 'JPEG', margen, margen, anchoImprimible, altoImagenMm);
    }

    const nombreLimpio = (claseInfo.moduloSiglas || 'modulo')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const modoLimpio = modoCalculo === 'continua' ? 'continua' : 'final';

    pdf.save(`acta_evaluacion_ra_${nombreLimpio}_${modoLimpio}.pdf`);
    return true;
  } catch (err) {
    console.error('Error al exportar el acta oficial a PDF:', err);
    throw err;
  } finally {
    if (contenedor && contenedor.parentNode) {
      contenedor.parentNode.removeChild(contenedor);
    }
  }
};

export default exportarActaPDF;
