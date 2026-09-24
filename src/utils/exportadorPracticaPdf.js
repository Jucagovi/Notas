import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * exportarPracticaPDF - Genera y descarga un documento PDF maquetado con el enunciado de una versión de práctica.
 *
 * Responsabilidad Única: Renderizar una plantilla de examen/práctica limpia con membrete institucional,
 * datos curriculares, espacio para datos del discente y el enunciado enriquecido en formato imprimible.
 *
 * @param {Object} params
 * @param {Object} params.practica - Datos maestros de la práctica.
 * @param {Object} params.version - Versión seleccionada con su enunciado en formato HTML.
 * @param {Object} [params.modulo] - Módulo profesional al que pertenece la práctica.
 * @param {Object} [params.curso] - Curso escolar asociado a la versión.
 * @param {Object} [params.unidadTrabajo] - Unidad de trabajo asociada si existe.
 * @param {Object} [params.evaluacion] - Período de evaluación asociado si existe.
 * @returns {Promise<boolean>} Promesa que resuelve a true al completar la exportación.
 */
export const exportarPracticaPDF = async ({
  practica,
  version,
  modulo = null,
  curso = null,
  unidadTrabajo = null,
  evaluacion = null
}) => {
  if (!practica || !version) {
    throw new Error('Se requieren los datos de la práctica y de la versión para exportar a PDF.');
  }

  // Se crea un contenedor temporal invisible para maquetar el documento antes de la captura.
  const contenedor = document.createElement('div');
  contenedor.id = 'documento-impresion-practica';
  contenedor.style.position = 'fixed';
  contenedor.style.left = '-9999px';
  contenedor.style.top = '0';
  contenedor.style.width = '794px'; // Ancho A4 en píxeles a 96 DPI estándar
  contenedor.style.padding = '40px';
  contenedor.style.backgroundColor = '#ffffff';
  contenedor.style.color = '#0f172a';
  contenedor.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  contenedor.style.fontSize = '14px';
  contenedor.style.lineHeight = '1.6';
  contenedor.style.boxSizing = 'border-box';

  // Se extraen valores textuales para la cabecera del documento.
  const nombreModulo = modulo ? `${modulo.siglas ? modulo.siglas + ' - ' : ''}${modulo.nombre}` : 'Módulo Formativo';
  const nombreCurso = curso ? `${curso.nombre} (${curso.anyo})` : 'Curso Académico';
  const etiquetaUT = unidadTrabajo ? `UT ${unidadTrabajo.numero}: ${unidadTrabajo.nombre}` : 'General / Sin UT específica';
  const etiquetaEvaluacion = evaluacion ? evaluacion.nombre : 'Sin evaluación específica';
  const pesoTexto = version.peso_evaluacion !== undefined && version.peso_evaluacion !== null
    ? `${version.peso_evaluacion}%`
    : 'No especificado';
  const tipoPractica = practica.id_tipopractica || 'Individual';
  const contenidoEnunciado = version.enunciado && version.enunciado.trim().length > 0
    ? version.enunciado
    : '<p><em>No se ha redactado ningún enunciado para esta versión de la práctica.</em></p>';

  // Se monta la estructura HTML del examen / enunciado.
  contenedor.innerHTML = `
    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #2563eb; letter-spacing: 0.5px;">
            Documento Didáctico y Rúbrica
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0;">
            ${practica.nombre}
          </h1>
          <div style="font-size: 13px; color: #475569; font-weight: 500;">
            ${nombreModulo}
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
            Versión: ${version.numero || '1.0'}
          </span>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
            ${nombreCurso}
          </div>
        </div>
      </div>
    </div>

    <!-- Metadatos de la actividad -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 8px; column-gap: 16px; font-size: 12px;">
        <div>
          <strong style="color: #475569;">Unidad de Trabajo:</strong>
          <span style="color: #0f172a; margin-left: 6px;">${etiquetaUT}</span>
        </div>
        <div>
          <strong style="color: #475569;">Modalidad:</strong>
          <span style="color: #0f172a; margin-left: 6px;">${tipoPractica}</span>
        </div>
        <div>
          <strong style="color: #475569;">Evaluación:</strong>
          <span style="color: #0f172a; margin-left: 6px;">${etiquetaEvaluacion}</span>
        </div>
        <div>
          <strong style="color: #475569;">Peso en Evaluación:</strong>
          <span style="color: #0f172a; margin-left: 6px;">${pesoTexto}</span>
        </div>
      </div>
      ${practica.descripcion ? `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569;">
          <strong>Descripción general:</strong> ${practica.descripcion}
        </div>
      ` : ''}
    </div>

    <!-- Casilla para datos de entrega del discente -->
    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; background-color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
        <div style="flex: 1; margin-right: 20px;">
          <strong style="color: #334155;">Nombre del Discente:</strong>
          <span style="display: inline-block; width: 65%; border-bottom: 1px dotted #94a3b8; margin-left: 8px;">&nbsp;</span>
        </div>
        <div style="width: 140px; margin-right: 16px;">
          <strong style="color: #334155;">Fecha:</strong>
          <span style="display: inline-block; width: 55%; border-bottom: 1px dotted #94a3b8; margin-left: 6px;">&nbsp;</span>
        </div>
        <div style="width: 120px; text-align: right;">
          <strong style="color: #334155;">Nota:</strong>
          <span style="display: inline-block; width: 50px; border-bottom: 1px dotted #94a3b8; margin-left: 6px;">&nbsp;</span>
        </div>
      </div>
    </div>

    <!-- Cuerpo del enunciado -->
    <div style="margin-top: 10px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 16px;">
        Enunciado y Requerimientos de la Actividad
      </h2>
      <div class="cuerpo-enunciado-html" style="font-size: 13px; line-height: 1.65; color: #1e293b;">
        ${contenidoEnunciado}
      </div>
    </div>

    <!-- Pie del documento -->
    <div style="margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8;">
      <span>Control de Notas - Sistema de Gestión Docente</span>
      <span>Generado el ${new Date().toLocaleDateString('es-ES')}</span>
    </div>
  `;

  document.body.appendChild(contenedor);

  try {
    // Se captura el contenedor generado con factor de escala 2 para garantizar nitidez de fuentes.
    const lienzo = await html2canvas(contenedor, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imagenData = lienzo.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const anchoPagina = 210; // mm
    const altoPagina = 297; // mm
    const margen = 12; // mm
    const anchoImprimible = anchoPagina - margen * 2;
    const altoImprimible = altoPagina - margen * 2;

    const altoImagenMm = (lienzo.height * anchoImprimible) / lienzo.width;

    // Si el contenido cabe en una sola página, se inserta directamente.
    if (altoImagenMm <= altoImprimible) {
      pdf.addImage(imagenData, 'JPEG', margen, margen, anchoImprimible, altoImagenMm);
    } else {
      // Manejo de paginación para contenidos extensos que desbordan una página A4.
      let alturaRestanteMm = altoImagenMm;
      let posicionY = margen;

      while (alturaRestanteMm > 0) {
        pdf.addImage(imagenData, 'JPEG', margen, posicionY, anchoImprimible, altoImagenMm);
        alturaRestanteMm -= altoImprimible;
        if (alturaRestanteMm > 0) {
          pdf.addPage();
          posicionY -= altoImprimible;
        }
      }
    }

    // Se sanea el nombre de archivo para evitar caracteres inválidos en el sistema operativo.
    const nombreLimpio = practica.nombre
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .substring(0, 35);
    const versionLimpia = (version.numero || 'v1')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    pdf.save(`practica_${nombreLimpio}_${versionLimpia}.pdf`);
    return true;
  } catch (error) {
    console.error('Error al exportar la práctica a formato PDF:', error);
    throw error;
  } finally {
    // Se remueve el elemento temporal del DOM.
    if (contenedor && contenedor.parentNode) {
      contenedor.parentNode.removeChild(contenedor);
    }
  }
};

export default exportarPracticaPDF;
