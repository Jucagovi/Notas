import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * exportarCalendarioPDF - Genera y descarga un informe en PDF del calendario anual global en una sola página A4 apaisada.
 *
 * Responsabilidad Única: Capturar mediante lienzo virtual el contenedor del calendario y su leyenda oficial,
 * aplicando factor de escala restrictivo para asegurar que se imprima en una única página.
 *
 * @param {Object} params
 * @param {HTMLElement} params.elemento - Elemento del DOM que engloba el calendario y la leyenda.
 * @param {number} [params.anioSeleccionado] - Año numérico inicial (ej. 2024).
 * @param {string} [params.anyoLabel] - Etiqueta textual del año académico (ej. "2024/2025").
 * @returns {Promise<boolean>} Promesa que resuelve a true si la descarga finalizó con éxito.
 */
export const exportarCalendarioPDF = async ({
  elemento,
  anioSeleccionado = new Date().getFullYear(),
  anyoLabel = ''
}) => {
  if (!elemento) {
    throw new Error('No se encontró el elemento contenedor para la impresión del calendario.');
  }

  // Se captura el elemento visual a escala óptima con colores oscuros forzados para garantizar legibilidad.
  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      const elClonado = clonedDoc.getElementById('bloque-impresion-calendario');
      if (!elClonado) return;

      // 1. Se fuerza fondo blanco general y se redefinen variables CSS del tema.
      elClonado.style.backgroundColor = '#ffffff';
      elClonado.style.color = '#0f172a';
      elClonado.style.setProperty('--text-color', '#0f172a');
      elClonado.style.setProperty('--text-color-secondary', '#475569');
      elClonado.style.setProperty('--surface-card', '#ffffff');
      elClonado.style.setProperty('--surface-border', '#cbd5e1');
      elClonado.style.setProperty('--surface-50', '#f8fafc');

      // 2. Se ocultan los botones interactivos de navegación no pertinentes en soporte impreso.
      const botones = elClonado.querySelectorAll('.fc-button, button, .p-button');
      botones.forEach((btn) => {
        btn.style.display = 'none';
      });

      // 3. Se asegura que las tarjetas principales tengan fondo blanco, borde de 1px nítido y radio de 12px.
      const tarjetas = elClonado.querySelectorAll('.surface-card');
      tarjetas.forEach((c) => {
        c.style.setProperty('background-color', '#ffffff', 'important');
        c.style.setProperty('color', '#0f172a', 'important');
        c.style.setProperty('border', '1px solid #cbd5e1', 'important');
        c.style.setProperty('border-radius', '12px', 'important');
        c.style.setProperty('box-shadow', 'none', 'important');
      });

      // 4. Se asegura que la cuadrícula anual de doce meses se mantenga en 3 columnas y sin borde exterior propio.
      const multiMonth = elClonado.querySelector('.fc-multimonth');
      if (multiMonth) {
        multiMonth.style.setProperty('grid-template-columns', 'repeat(3, 1fr)', 'important');
        multiMonth.style.setProperty('gap', '0.5rem', 'important');
        multiMonth.style.setProperty('border', 'none', 'important');
        multiMonth.style.setProperty('box-shadow', 'none', 'important');
        multiMonth.style.setProperty('outline', 'none', 'important');
      }

      // 5. Los contenedores de cada mes (.fc-multimonth-month) tendrán el mismo grosor de borde (1px solid),
      // apariencia, color (#cbd5e1) y radio (12px) que el contenedor que contiene a todos los meses.
      const meses = elClonado.querySelectorAll('.fc-multimonth-month');
      meses.forEach((m) => {
        m.style.setProperty('background-color', '#ffffff', 'important');
        m.style.setProperty('border', '1px solid #cbd5e1', 'important');
        m.style.setProperty('border-radius', '12px', 'important');
        m.style.setProperty('box-shadow', 'none', 'important');
        m.style.setProperty('outline', 'none', 'important');
        m.style.setProperty('padding', '0.35rem 0.5rem', 'important');
      });

      // 5. Se fuerza color oscuro en títulos, encabezados de columnas y números de día.
      const titulos = elClonado.querySelectorAll('.fc-toolbar-title, .fc-multimonth-title');
      titulos.forEach((t) => {
        t.style.color = '#0f172a';
      });

      const cabecerasDias = elClonado.querySelectorAll('.fc-col-header-cell-cushion, th');
      cabecerasDias.forEach((th) => {
        th.style.color = '#334155';
      });

      const numerosDias = elClonado.querySelectorAll('.fc-daygrid-day-number');
      numerosDias.forEach((num) => {
        if (!num.closest('.fc-day-today')) {
          num.style.color = '#1e293b';
        }
      });

      // 6. Se ajustan los textos de la leyenda para garantizar su lectura sobre fondo blanco.
      const textosLeyenda = elClonado.querySelectorAll('.text-800, .text-900, .text-700');
      textosLeyenda.forEach((txt) => {
        txt.style.color = '#0f172a';
      });
      const textosSecundarios = elClonado.querySelectorAll('.text-600, .text-500');
      textosSecundarios.forEach((txt) => {
        txt.style.color = '#475569';
      });

      // 7. Se elimina la preposición 'de' del nombre de los meses y fechas (ej. "septiembre de 2026" -> "septiembre 2026").
      const limpiarPreposicionDe = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str
          .replace(/\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/gi, '$1 $2')
          .replace(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})\b/gi, '$1 $2');
      };

      const walker = clonedDoc.createTreeWalker(elClonado, NodeFilter.SHOW_TEXT, null);
      let nodoTexto;
      while ((nodoTexto = walker.nextNode())) {
        if (nodoTexto.nodeValue && /\bde\b/i.test(nodoTexto.nodeValue)) {
          nodoTexto.nodeValue = limpiarPreposicionDe(nodoTexto.nodeValue);
        }
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Configuración de página A4 vertical (Portrait): 210 mm de ancho por 297 mm de alto.
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const anchoPagina = 210;
  const altoPagina = 297;
  const margen = 10;
  const anchoDisponible = anchoPagina - margen * 2;
  const altoDisponible = altoPagina - margen * 2 - 16;

  // Cabecera superior institucional del documento.
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.text('CALENDARIO ESCOLAR - MASTER PLANNER', margen, margen + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);

  const etiquetaAnio = anyoLabel || `${anioSeleccionado}/${anioSeleccionado + 1}`;
  const textoSubtitulo = `Curso Académico ${etiquetaAnio} (01/09/${anioSeleccionado} al 31/08/${anioSeleccionado + 1})`;
  pdf.text(textoSubtitulo, margen, margen + 9);

  // Cálculo del ratio de escalado para asegurar estrictamente 1 página vertical.
  const proporcionImagen = canvas.width / canvas.height;
  let anchoFinal = anchoDisponible;
  let altoFinal = anchoFinal / proporcionImagen;

  if (altoFinal > altoDisponible) {
    altoFinal = altoDisponible;
    anchoFinal = altoFinal * proporcionImagen;
  }

  // Centrado horizontal en la página.
  const posX = margen + (anchoDisponible - anchoFinal) / 2;
  const posY = margen + 12;

  pdf.addImage(imgData, 'JPEG', posX, posY, anchoFinal, altoFinal, undefined, 'FAST');

  // Pie de página con fecha de emisión.
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(
    `Documento generado el ${fechaGeneracion} - Sistema de Control de Notas`,
    margen,
    altoPagina - 5
  );

  pdf.save(`calendario_escolar_${anioSeleccionado}_${anioSeleccionado + 1}.pdf`);
  return true;
};

export default exportarCalendarioPDF;
