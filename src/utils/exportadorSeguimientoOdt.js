import JSZip from 'jszip';

/**
 * Escapa caracteres especiales para XML seguro.
 *
 * @param {string} texto - Cadena de texto a sanear.
 * @returns {string} Texto saneado con entidades XML.
 */
const escaparXml = (texto) => {
  if (!texto) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * exportarSeguimientoODT - Construye y descarga un documento editable nativo
 * en formato OpenDocument Text (.odt - estándar OASIS / ISO/IEC 26300).
 *
 * Responsabilidad Única: Generar el paquete ZIP con la especificación completa ODT
 * (mimetype sin compresión, manifest.xml, meta.xml, styles.xml y content.xml),
 * maquetando la tabla formal de seguimiento con bordes y celdas idénticas al informe oficial.
 *
 * @param {Object} params - Parámetros del informe.
 * @param {string} params.profesor - Nombre completo del docente titular.
 * @param {string} params.anioAcademicoTexto - Denominación del año académico (ej. '2026/2027').
 * @param {string} params.asignatura - Denominación oficial del módulo profesional.
 * @param {string} params.evaluacion - Denominación de la evaluación (ej. '1ª EVALUACIÓN').
 * @param {string} params.fechaCorteTexto - Cadena de fecha de corte (ej. 'Hasta 30/09/2025').
 * @param {Array<Object>} params.contenidosProgramados - Lista de Unidades de Trabajo programadas.
 * @param {string} params.contenidosImpartidosTexto - Resumen cualitativo de contenidos impartidos.
 * @param {Array<Object>} [params.contenidosImpartidosListado=[]] - Lista de Unidades de Trabajo impartidas.
 * @param {string} params.observaciones - Observaciones e incidencias redactadas por el docente.
 * @returns {Promise<boolean>} Resuelve a true al completarse la descarga del archivo ODT.
 */
export const exportarSeguimientoODT = async ({
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
  const zip = new JSZip();

  // 1. Archivo mimetype: debe ser el primer archivo y almacenarse sin compresión.
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });

  // 2. Archivo META-INF/manifest.xml: declaración de las partes del paquete OpenDocument.
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  zip.file('META-INF/manifest.xml', manifestXml);

  // 3. Archivo meta.xml con metadatos del documento.
  const fechaIso = new Date().toISOString();
  const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.2">
  <office:meta>
    <dc:title>Informe de Seguimiento de Programación</dc:title>
    <dc:description>Informe mensual de cumplimiento curricular y seguimiento de Unidades de Trabajo.</dc:description>
    <dc:creator>Control de Notas</dc:creator>
    <meta:creation-date>${fechaIso}</meta:creation-date>
  </office:meta>
</office:document-meta>`;
  zip.file('meta.xml', metaXml);

  // 4. Archivo styles.xml: configuración de página A4 con márgenes de 1.5 cm.
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:paragraph-properties fo:line-height="125%"/>
      <style:text-properties fo:font-name="Liberation Sans" fo:font-size="10pt" fo:color="#0f172a"/>
    </style:default-style>
  </office:styles>
  <office:automatic-styles>
    <style:page-layout style:name="pmA4">
      <style:page-layout-properties fo:page-width="21.0cm" fo:page-height="29.7cm" fo:margin-top="1.5cm" fo:margin-bottom="1.5cm" fo:margin-left="1.5cm" fo:margin-right="1.5cm" style:print-orientation="portrait"/>
    </style:page-layout>
  </office:automatic-styles>
  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pmA4"/>
  </office:master-styles>
</office:document-styles>`;
  zip.file('styles.xml', stylesXml);

  // 5. Construcción de párrafos de Contenidos Programados para content.xml.
  let xmlProgramados = `<text:p text:style-name="TextoNegrita">CONTENIDOS PROGRAMADOS:</text:p>`;
  if (contenidosProgramados.length === 0) {
    xmlProgramados += `<text:p text:style-name="TextoItalica">No constan unidades programadas para este período.</text:p>`;
  } else {
    contenidosProgramados.forEach((ut) => {
      const num = ut.numUT ? `${escaparXml(ut.numUT)}. ` : '';
      const nombre = escaparXml(ut.nombreUT || ut.nombre || 'Unidad de Trabajo');
      xmlProgramados += `<text:p text:style-name="TextoSubtituloUT">${num}${nombre}</text:p>`;
      if (ut.descripcionUT || ut.descripcion) {
        xmlProgramados += `<text:p text:style-name="TextoDetalleUT">${escaparXml(ut.descripcionUT || ut.descripcion)}</text:p>`;
      }
    });
  }

  // 6. Construcción de párrafos de Contenidos Impartidos para content.xml.
  let xmlImpartidos = `<text:p text:style-name="TextoNegrita">CONTENIDOS IMPARTIDOS:</text:p>`;
  if (contenidosImpartidosTexto && contenidosImpartidosTexto.trim() !== '') {
    xmlImpartidos += `<text:p text:style-name="TextoNormal">${escaparXml(contenidosImpartidosTexto.trim())}</text:p>`;
  }
  if (contenidosImpartidosListado.length > 0) {
    xmlImpartidos += `<text:p text:style-name="TextoNegrita">Unidades completadas:</text:p>`;
    contenidosImpartidosListado.forEach((ut) => {
      const num = ut.numUT ? `${escaparXml(ut.numUT)}. ` : '';
      const nombre = escaparXml(ut.nombreUT || ut.nombre || 'Unidad de Trabajo');
      xmlImpartidos += `<text:p text:style-name="TextoItemCompletado">• ${num}${nombre}</text:p>`;
    });
  } else if (!contenidosImpartidosTexto) {
    xmlImpartidos += `<text:p text:style-name="TextoItalica">Durante este período no se han registrado unidades como completadas.</text:p>`;
  }

  // 7. Archivo content.xml con la cuadrícula institucional ODT.
  const fechaCorteFmt = fechaCorteTexto
    ? (fechaCorteTexto.startsWith('Hasta') ? fechaCorteTexto : `Hasta ${fechaCorteTexto}`)
    : 'Período ordinario';

  const textoObsFinal = observaciones && observaciones.trim() !== ''
    ? observaciones.trim()
    : 'El curso avanza de forma correcta y sin incidentes.';

  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="TablaSeguimiento" style:family="table">
      <style:table-properties style:width="18.0cm" table:align="margins"/>
    </style:style>
    <style:style style:name="ColumnaProg" style:family="table-column">
      <style:table-column-properties style:column-width="10.2cm"/>
    </style:style>
    <style:style style:name="ColumnaImp" style:family="table-column">
      <style:table-column-properties style:column-width="7.8cm"/>
    </style:style>
    <style:style style:name="CeldaNormal" style:family="table-cell">
      <style:table-cell-properties fo:padding="0.28cm" fo:border="0.04cm solid #000000"/>
    </style:style>
    <style:style style:name="CeldaGris" style:family="table-cell">
      <style:table-cell-properties fo:padding="0.28cm" fo:border="0.04cm solid #000000" fo:background-color="#e2e8f0"/>
    </style:style>
    <style:style style:name="TextoNegrita" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.12cm"/>
      <style:text-properties fo:font-weight="bold" fo:font-size="10pt"/>
    </style:style>
    <style:style style:name="TextoNormal" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.12cm"/>
      <style:text-properties fo:font-size="10pt"/>
    </style:style>
    <style:style style:name="TextoItalica" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.12cm"/>
      <style:text-properties fo:font-style="italic" fo:font-size="9.5pt" fo:color="#64748b"/>
    </style:style>
    <style:style style:name="TextoSubtituloUT" style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.10cm" fo:margin-bottom="0.05cm"/>
      <style:text-properties fo:font-weight="bold" fo:font-size="10pt"/>
    </style:style>
    <style:style style:name="TextoDetalleUT" style:family="paragraph">
      <style:paragraph-properties fo:margin-left="0.45cm" fo:margin-bottom="0.15cm"/>
      <style:text-properties fo:font-size="9pt" fo:color="#475569"/>
    </style:style>
    <style:style style:name="TextoItemCompletado" style:family="paragraph">
      <style:paragraph-properties fo:margin-left="0.25cm" fo:margin-bottom="0.08cm"/>
      <style:text-properties fo:font-size="9.5pt"/>
    </style:style>
    <style:style style:name="TextoTituloEvaluacion" style:family="paragraph">
      <style:paragraph-properties fo:margin-bottom="0.12cm"/>
      <style:text-properties fo:font-weight="bold" fo:font-size="11pt"/>
    </style:style>
    <style:style style:name="SpanNegrita" style:family="text">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      <table:table table:name="TablaSeguimiento" table:style-name="TablaSeguimiento">
        <table:table-column table:style-name="ColumnaProg"/>
        <table:table-column table:style-name="ColumnaImp"/>

        <!-- Fila 1: Cabecera con datos docentes y evaluación -->
        <table:table-row>
          <table:table-cell table:style-name="CeldaNormal" office:value-type="string">
            <text:p text:style-name="TextoNormal"><text:span text:style-name="SpanNegrita">PROFESOR: </text:span>${escaparXml(profesor || 'Docente titular')}</text:p>
            <text:p text:style-name="TextoNormal"><text:span text:style-name="SpanNegrita">AÑO ACADÉMICO: </text:span>${escaparXml(anioAcademicoTexto)}</text:p>
            <text:p text:style-name="TextoNegrita">ASIGNATURA:</text:p>
            <text:p text:style-name="TextoNormal">${escaparXml(asignatura || 'Módulo profesional')}</text:p>
          </table:table-cell>
          <table:table-cell table:style-name="CeldaGris" office:value-type="string">
            <text:p text:style-name="TextoTituloEvaluacion">${escaparXml(evaluacion || '1ª EVALUACIÓN')}</text:p>
            <text:p text:style-name="TextoNegrita">${escaparXml(fechaCorteFmt)}</text:p>
          </table:table-cell>
        </table:table-row>

        <!-- Fila 2: Contenidos Programados vs Impartidos -->
        <table:table-row>
          <table:table-cell table:style-name="CeldaNormal" office:value-type="string">
            ${xmlProgramados}
          </table:table-cell>
          <table:table-cell table:style-name="CeldaNormal" office:value-type="string">
            ${xmlImpartidos}
          </table:table-cell>
        </table:table-row>

        <!-- Fila 3: Observaciones a ancho completo -->
        <table:table-row>
          <table:table-cell table:style-name="CeldaNormal" table:number-columns-spanned="2" office:value-type="string">
            <text:p text:style-name="TextoNegrita">Observaciones:</text:p>
            <text:p text:style-name="TextoNormal">${escaparXml(textoObsFinal)}</text:p>
          </table:table-cell>
          <table:covered-table-cell/>
        </table:table-row>
      </table:table>
    </office:text>
  </office:body>
</office:document-content>`;
  zip.file('content.xml', contentXml);

  // 8. Generación del Blob del archivo .odt y descarga en el navegador.
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text'
  });

  const nombreLimpioModulo = (asignatura || 'Modulo').replace(/[^a-zA-Z0-9_-]/g, '_');
  const anioLimpio = String(anioAcademicoTexto || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const nombreArchivo = `Seguimiento_${nombreLimpioModulo}_${anioLimpio}.odt`;

  const urlDescarga = window.URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = urlDescarga;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  window.URL.revokeObjectURL(urlDescarga);

  return true;
};

export default exportarSeguimientoODT;
