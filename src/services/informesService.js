import { supabase } from './supabaseClient.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNota } from '../utils/formatters.js';
import { getColorNota } from '../utils/coloresNota.js';
import { ordenarEvaluaciones } from './evaluacionService.js';

// Se obtienen los datos de cobertura curricular de un módulo profesional y sus asignaciones en la tabla trabajan
export const obtenerDatosCoberturaCurricular = async (idModulo, idCurso = null) => {
  if (!idModulo) {
    return { data: null, error: 'Identificador de módulo no proporcionado.' };
  }

  try {
    // 1. Se obtiene la información del módulo profesional seleccionado
    const { data: modulo, error: errorModulo } = await supabase
      .from('Modulos')
      .select('id_modulo, nombre, siglas, descripcion, id_ciclo')
      .eq('id_modulo', idModulo)
      .single();

    if (errorModulo) {
      console.error(`Error al consultar el módulo ${idModulo}:`, errorModulo);
      return { data: null, error: errorModulo.message };
    }

    // 2. Se obtienen los Resultados de Aprendizaje (RA) asociados al módulo ordenados por número
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('id_ra, nombre, numero, descripcion, id_modulo')
      .eq('id_modulo', idModulo)
      .order('numero', { ascending: true });

    if (errorRA) {
      console.error(`Error al consultar los RA del módulo ${idModulo}:`, errorRA);
      return { data: null, error: errorRA.message };
    }

    if (!listaRA || listaRA.length === 0) {
      return {
        data: {
          modulo,
          listaRA: [],
          listaCE: [],
          listaTrabajan: [],
          evaluacionesCurso: []
        },
        error: null
      };
    }

    const idsRA = listaRA.map((ra) => ra.id_ra);

    // 3. Se obtienen los Criterios de Evaluación (CE) pertenecientes a dichos Resultados de Aprendizaje
    const { data: listaCE, error: errorCE } = await supabase
      .from('CE')
      .select('id_ce, nombre, numero, descripcion, id_ra')
      .in('id_ra', idsRA)
      .order('numero', { ascending: true });

    if (errorCE) {
      console.error('Error al consultar los CE asociados a los RA:', errorCE);
      return { data: null, error: errorCE.message };
    }

    const idsCE = (listaCE || []).map((ce) => ce.id_ce);

    // 4. Se consultan las vinculaciones en la tabla trabajan para los CE obtenidos junto con los datos de sus prácticas
    let listaTrabajan = [];
    if (idsCE.length > 0) {
      const { data: datosTrabajan, error: errorTrabajan } = await supabase
        .from('trabajan')
        .select(`
          id_trabajan,
          id_ce,
          id_practica,
          porcentaje,
          descripcion,
          Practicas:id_practica (
            id_practica,
            nombre,
            numero,
            enunciado,
            descripcion,
            id_tipopractica,
            unidad,
            id_modulo
          )
        `)
        .in('id_ce', idsCE);

      if (errorTrabajan) {
        console.error('Error al consultar asignaciones en trabajan:', errorTrabajan);
        return { data: null, error: errorTrabajan.message };
      }

      listaTrabajan = datosTrabajan || [];
    }

    // 5. Si se especifica un curso, se consultan las evaluaciones registradas para contextualizar las prácticas
    let evaluacionesCurso = [];
    if (idCurso) {
      const { data: datosEvaluaciones, error: errorEvaluaciones } = await supabase
        .from('Evaluaciones')
        .select(`
          id_evaluacion,
          nombre,
          fecha_ini,
          fecha_fin,
          id_curso,
          id_modulo
        `)
        .eq('id_curso', idCurso)
        .eq('id_modulo', idModulo)
        .order('created_at', { ascending: true });

      if (errorEvaluaciones) {
        console.error('Error al consultar evaluaciones del curso:', errorEvaluaciones);
      } else {
        evaluacionesCurso = datosEvaluaciones || [];
      }
    }

    return {
      data: {
        modulo,
        listaRA: listaRA || [],
        listaCE: listaCE || [],
        listaTrabajan,
        evaluacionesCurso
      },
      error: null
    };
  } catch (err) {
    console.error('Error inesperado en obtenerDatosCoberturaCurricular:', err);
    return {
      data: null,
      error: err.message || 'Error al obtener los datos de cobertura curricular.'
    };
  }
};

// Limpia y normaliza el texto de un Resultado de Aprendizaje evitando duplicidades de numeración
export const formatearTextoRA = (ra) => {
  if (!ra) return '';
  const num = ra.numero ?? ra.ra_numero ?? '';
  const prefijo = num !== '' && num !== null && num !== undefined ? `RA${num}` : 'RA';

  const rawNombre = (ra.nombre || ra.ra_nombre || '').trim();
  const rawDesc = (ra.descripcion || ra.ra_descripcion || '').trim();

  // Se eliminan prefijos redundantes como 'RA 1', 'RA1', 'RA 4 -', 'RA 1:', etc.
  const limpiar = (str) =>
    str
      .replace(/^RA\s*\d+[\s:.-]*/gi, '')
      .replace(/^[\s:.-]+/, '')
      .trim();

  const nombreLimpio = limpiar(rawNombre);
  const descLimpia = limpiar(rawDesc);

  let cuerpo = '';
  if (nombreLimpio && descLimpia) {
    if (descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase())) {
      cuerpo = descLimpia;
    } else if (nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())) {
      cuerpo = nombreLimpio;
    } else {
      cuerpo = `${nombreLimpio} ${descLimpia}`;
    }
  } else {
    cuerpo = descLimpia || nombreLimpio || '';
  }

  // Se eliminan guiones o caracteres separadores sobrantes al inicio del cuerpo
  cuerpo = cuerpo.replace(/^[\s:.-]+/, '').trim();

  return cuerpo ? `${prefijo} ${cuerpo}` : prefijo;
};

// Limpia y normaliza el texto de un Criterio de Evaluación evitando duplicidades de numeración
export const formatearTextoCE = (ce) => {
  if (!ce) return '';
  const num = ce.numero ?? ce.ce_numero ?? '';
  const prefijo = num !== '' && num !== null && num !== undefined ? `CE${num}` : 'CE';

  const rawNombre = (ce.nombre || ce.ce_nombre || '').trim();
  const rawDesc = (ce.descripcion || ce.ce_descripcion || '').trim();

  // Se eliminan prefijos redundantes como 'CE 1.1', 'CE1.1', 'CE 1.1 -', 'a)', etc.
  const limpiar = (str) =>
    str
      .replace(/^CE\s*[\d.]+[\s:.-]*/gi, '')
      .replace(/^[a-z]\s*[).-]\s*/gi, '')
      .replace(/^[\s:.-]+/, '')
      .trim();

  const nombreLimpio = limpiar(rawNombre);
  const descLimpia = limpiar(rawDesc);

  let cuerpo = '';
  if (nombreLimpio && descLimpia) {
    if (descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase())) {
      cuerpo = descLimpia;
    } else if (nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())) {
      cuerpo = nombreLimpio;
    } else {
      cuerpo = `${nombreLimpio} ${descLimpia}`;
    }
  } else {
    cuerpo = descLimpia || nombreLimpio || '';
  }

  // Se eliminan guiones o caracteres separadores sobrantes al inicio del cuerpo
  cuerpo = cuerpo.replace(/^[\s:.-]+/, '').trim();

  return cuerpo ? `${prefijo} ${cuerpo}` : prefijo;
};

// Se genera y descarga un informe formal en formato PDF con la auditoría de cobertura de criterios de evaluación
export const exportarInformeCoberturaPDF = ({
  modulo,
  curso,
  estadisticas,
  filasCE = []
}) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margenIzquierdo = 15;
    const margenDerecho = 195;
    const anchoUtil = margenDerecho - margenIzquierdo;
    let posicionY = 18;

    // Encabezado institucional superior
    doc.setFillColor(30, 41, 59); // Fondo pizarra oscuro
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AUDITORÍA DE COBERTURA CURRICULAR', margenIzquierdo, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Control de Calidad Académica y Ponderación de Criterios de Evaluación', margenIzquierdo, 18);

    doc.setFontSize(8);
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, margenDerecho, 18, { align: 'right' });

    posicionY = 36;

    // Tarjeta de metadatos del informe (Curso y Módulo profesional)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 22, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CURSO ACADÉMICO:', margenIzquierdo + 4, posicionY + 7);
    doc.setFont('helvetica', 'normal');
    const textoCurso = curso ? `${curso.nombre || ''} (${curso.anyo || curso.centro || ''})` : 'Todos los cursos';
    doc.text(textoCurso, margenIzquierdo + 42, posicionY + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO PROFESIONAL:', margenIzquierdo + 4, posicionY + 15);
    doc.setFont('helvetica', 'normal');
    const textoModulo = modulo ? `${modulo.nombre || ''} ${modulo.siglas ? `(${modulo.siglas})` : ''}` : 'Módulo no especificado';
    doc.text(textoModulo, margenIzquierdo + 48, posicionY + 15);

    posicionY += 28;

    // Resumen de indicadores clave KPI
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumen Ejecutivo de Cobertura Curricular', margenIzquierdo, posicionY);
    posicionY += 4;

    const anchoCajaKPI = anchoUtil / 5;
    const altoCajaKPI = 14;

    const kpis = [
      { titulo: 'Total Criterios', valor: estadisticas?.totalCE || 0, color: [100, 116, 139] },
      { titulo: '100% Cubiertos', valor: estadisticas?.ceCompletos || 0, color: [22, 163, 74] },
      { titulo: 'Incompletos (<100%)', valor: estadisticas?.ceIncompletos || 0, color: [220, 38, 38] },
      { titulo: 'Sin Cubrir (0%)', valor: estadisticas?.ceSinCubrir || 0, color: [148, 163, 184] },
      { titulo: 'Sobrecobertura (>100%)', valor: estadisticas?.ceExcedidos || 0, color: [220, 38, 38] }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margenIzquierdo + idx * anchoCajaKPI;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, posicionY, anchoCajaKPI - 2, altoCajaKPI, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.titulo, x + (anchoCajaKPI - 2) / 2, posicionY + 4.5, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(String(kpi.valor), x + (anchoCajaKPI - 2) / 2, posicionY + 11, { align: 'center' });
    });

    posicionY += altoCajaKPI + 8;

    // Tabla detallada de Criterios de Evaluación agrupada por Resultado de Aprendizaje
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Desglose de Criterios por Resultado de Aprendizaje (RA)', margenIzquierdo, posicionY);
    posicionY += 4;

    // Encabezado de la tabla
    doc.setFillColor(51, 65, 85);
    doc.rect(margenIzquierdo, posicionY, anchoUtil, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Criterio de Evaluación (CE)', margenIzquierdo + 3, posicionY + 4.8);
    doc.text('Prácticas Asociadas (% de cobertura)', margenIzquierdo + 85, posicionY + 4.8);
    doc.text('Total', margenDerecho - 4, posicionY + 4.8, { align: 'right' });
    posicionY += 7;

    let raActualId = null;

    (filasCE || []).forEach((fila) => {
      // Salto de página automático si se alcanza el límite inferior
      if (posicionY > 265) {
        doc.addPage();
        posicionY = 20;

        // Repetición del encabezado de tabla en la nueva página
        doc.setFillColor(51, 65, 85);
        doc.rect(margenIzquierdo, posicionY, anchoUtil, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Criterio de Evaluación (CE)', margenIzquierdo + 3, posicionY + 4.8);
        doc.text('Prácticas Asociadas (% de cobertura)', margenIzquierdo + 85, posicionY + 4.8);
        doc.text('Total', margenDerecho - 4, posicionY + 4.8, { align: 'right' });
        posicionY += 7;
      }

      // Se imprime la cabecera del grupo RA si cambia
      if (fila.id_ra !== raActualId) {
        raActualId = fila.id_ra;
        doc.setFillColor(226, 232, 240);
        doc.rect(margenIzquierdo, posicionY, anchoUtil, 6, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const textoRA = formatearTextoRA({
          numero: fila.ra_numero,
          nombre: fila.ra_nombre,
          descripcion: fila.ra_descripcion
        });
        doc.text(textoRA, margenIzquierdo + 3, posicionY + 4.2);
        posicionY += 6;
      }

      // Se calculan las líneas de texto para el nombre y las prácticas
      const textoCE = formatearTextoCE({
        numero: fila.ce_numero,
        nombre: fila.ce_nombre,
        descripcion: fila.ce_descripcion
      });
      const lineasCE = doc.splitTextToSize(textoCE, 78);

      const textoPracticas = fila.practicas_texto || 'Sin prácticas asignadas';
      const lineasPracticas = doc.splitTextToSize(textoPracticas, 70);

      const totalLineas = Math.max(lineasCE.length, lineasPracticas.length, 1);
      const altoFila = Math.max(7, totalLineas * 4 + 2);

      // Fondo alternado para filas
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margenIzquierdo, posicionY, anchoUtil, altoFila, 'FD');

      // Texto de CE
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(lineasCE, margenIzquierdo + 3, posicionY + 4);

      // Texto de Prácticas
      if (!fila.practicas || fila.practicas.length === 0) {
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'italic');
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(lineasPracticas, margenIzquierdo + 85, posicionY + 4);

      // Porcentaje Total e Indicador de Color
      const total = fila.porcentaje_total || 0;
      doc.setFont('helvetica', 'bold');
      if (total === 100) {
        doc.setTextColor(22, 163, 74); // Verde
      } else if (total === 0) {
        doc.setTextColor(148, 163, 184); // Gris
      } else {
        doc.setTextColor(220, 38, 38); // Rojo
      }

      let etiquetaTotal = `${total}%`;
      if (total === 100) etiquetaTotal = '100% OK';
      else if (total === 0) etiquetaTotal = '0% Vacío';
      else if (total < 100) etiquetaTotal = `${total}% Incompl.`;
      else etiquetaTotal = `${total}% Exced.`;

      doc.text(etiquetaTotal, margenDerecho - 4, posicionY + 4.5, { align: 'right' });

      posicionY += altoFila;
    });

    // Paginación y pie de página en cada hoja
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} - Sistema de Control de Notas y Gestión Curricular`,
        margenIzquierdo,
        290
      );
      doc.text(
        'Documento generado automáticamente para auditoría docente',
        margenDerecho,
        290,
        { align: 'right' }
      );
    }

    // Nombre seguro para la descarga del archivo PDF
    const siglasLimpias = (modulo?.siglas || modulo?.nombre || 'Modulo')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    const nombreArchivo = `Auditoria_Cobertura_${siglasLimpias}.pdf`;

    doc.save(nombreArchivo);
    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar informe de cobertura a PDF:', err);
    return { exito: false, error: err.message || 'Error al generar el archivo PDF.' };
  }
};

// Se obtienen las calificaciones pendientes de una evaluación cruzando discentes matriculados, prácticas y notas nulas en evaluan
export const getPendientesPorEvaluacion = async (evaluacionId) => {
  if (!evaluacionId) {
    return { data: [], error: 'Identificador de evaluación no proporcionado.' };
  }

  try {
    // 1. Se obtiene la información de la evaluación seleccionada junto con su curso y módulo asociados
    const { data: evaluacion, error: errorEvaluacion } = await supabase
      .from('Evaluaciones')
      .select(`
        id_evaluacion,
        nombre,
        fecha_ini,
        fecha_fin,
        descripcion,
        id_curso,
        id_modulo,
        Cursos:id_curso (
          id_curso,
          nombre,
          anyo,
          centro
        ),
        Modulos:id_modulo (
          id_modulo,
          nombre,
          siglas
        )
      `)
      .eq('id_evaluacion', evaluacionId)
      .single();

    if (errorEvaluacion) {
      console.error(`Error al consultar la evaluación ${evaluacionId}:`, errorEvaluacion);
      return { data: [], error: errorEvaluacion.message };
    }

    if (!evaluacion) {
      return { data: [], error: 'Evaluación no encontrada.' };
    }

    const idCurso = evaluacion.id_curso;
    const idModulo = evaluacion.id_modulo;

    // 2. Se obtienen los alumnos matriculados en el módulo asociado a la evaluación a través de la tabla imparte
    let discentesMatriculados = [];
    if (idCurso && idModulo) {
      const { data: datosImparte, error: errorImparte } = await supabase
        .from('imparte')
        .select(`
          id_imparte,
          id_discente,
          Discentes:id_discente (
            id_discente,
            nombre,
            apellidos,
            NIA,
            correo,
            localidad,
            imagen,
            activo
          )
        `)
        .eq('id_curso', idCurso)
        .eq('id_modulo', idModulo);

      if (errorImparte) {
        console.error('Error al consultar alumnos matriculados en imparte:', errorImparte);
      } else if (datosImparte && datosImparte.length > 0) {
        discentesMatriculados = datosImparte
          .filter((item) => item.Discentes !== null)
          .map((item) => item.Discentes);
      }
    }

    // Si no existen discentes matriculados en imparte, se consultan los discentes activos como mecanismo de respaldo
    if (discentesMatriculados.length === 0) {
      const { data: todosDiscentes, error: errorDiscentes } = await supabase
        .from('Discentes')
        .select('id_discente, nombre, apellidos, NIA, correo, localidad, imagen, activo')
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (errorDiscentes) {
        console.error('Error al consultar catálogo general de discentes:', errorDiscentes);
      } else {
        discentesMatriculados = todosDiscentes || [];
      }
    }

    // 3. Se obtienen todas las calificaciones y prácticas registradas en evaluan para esta evaluación
    const { data: registrosEvaluan, error: errorEvaluan } = await supabase
      .from('evaluan')
      .select(`
        id_evaluan,
        id_practica,
        id_evaluacion,
        id_discente,
        nota,
        peso,
        Practicas:id_practica (
          id_practica,
          nombre,
          numero,
          enunciado,
          descripcion,
          id_tipopractica,
          unidad,
          id_modulo
        ),
        Discentes:id_discente (
          id_discente,
          nombre,
          apellidos,
          NIA,
          correo,
          localidad,
          imagen,
          activo
        )
      `)
      .eq('id_evaluacion', evaluacionId);

    if (errorEvaluan) {
      console.error('Error al consultar calificaciones en evaluan para la evaluación:', errorEvaluan);
      return { data: [], error: errorEvaluan.message };
    }

    // 4. Se extraen las prácticas únicas asignadas a esta evaluación
    const practicasMap = new Map();
    (registrosEvaluan || []).forEach((reg) => {
      if (reg.id_practica && reg.Practicas && !practicasMap.has(reg.id_practica)) {
        practicasMap.set(reg.id_practica, reg.Practicas);
      }
    });

    const listaPracticas = Array.from(practicasMap.values()).sort((a, b) => {
      const pA = a || {};
      const pB = b || {};
      if (pA.numero && pB.numero) {
        return pA.numero.toString().localeCompare(pB.numero.toString(), undefined, { numeric: true });
      }
      if (pA.numero) return -1;
      if (pB.numero) return 1;
      return (pA.nombre || '').localeCompare(pB.nombre || '');
    });

    // Si no existen prácticas vinculadas a la evaluación, no hay notas pendientes de registrar
    if (listaPracticas.length === 0) {
      return {
        data: [],
        error: null,
        metadatos: {
          evaluacion,
          totalDiscentes: discentesMatriculados.length,
          totalPracticas: 0,
          totalPendientes: 0
        }
      };
    }

    // 5. Se indexan las notas existentes en un mapa con clave `${id_practica}_${id_discente}`
    const mapaEvaluan = new Map();
    (registrosEvaluan || []).forEach((reg) => {
      if (reg.id_practica && reg.id_discente) {
        const clave = `${reg.id_practica}_${reg.id_discente}`;
        mapaEvaluan.set(clave, reg);
      }
    });

    // 6. Se integran también discentes registrados directamente en evaluan que no figuraban en imparte
    const mapaTodosDiscentes = new Map();
    discentesMatriculados.forEach((d) => mapaTodosDiscentes.set(d.id_discente, d));
    (registrosEvaluan || []).forEach((reg) => {
      if (reg.id_discente && reg.Discentes && !mapaTodosDiscentes.has(reg.id_discente)) {
        mapaTodosDiscentes.set(reg.id_discente, reg.Discentes);
      }
    });

    const listaDiscentesEvaluacion = Array.from(mapaTodosDiscentes.values());

    // 7. Se cruzan los discentes con las prácticas para detectar combinaciones sin nota
    const listaPendientes = [];

    listaDiscentesEvaluacion.forEach((discente) => {
      listaPracticas.forEach((practica) => {
        const clave = `${practica.id_practica}_${discente.id_discente}`;
        const registroExistente = mapaEvaluan.get(clave);

        // Se considera pendiente cuando el registro no existe o el campo nota es nulo
        const esNotaNula =
          !registroExistente ||
          registroExistente.nota === null ||
          registroExistente.nota === undefined ||
          registroExistente.nota === '';

        if (esNotaNula) {
          const numPractica = practica.numero ? `P${practica.numero}` : '';
          const nombrePracticaCompleto = practica.numero
            ? `Práctica ${practica.numero}: ${practica.nombre || 'Sin título'}`
            : practica.nombre || 'Práctica sin título';

          listaPendientes.push({
            id_fila: `${evaluacionId}_${practica.id_practica}_${discente.id_discente}`,
            id_evaluan: registroExistente?.id_evaluan || null,
            id_evaluacion: evaluacionId,
            nombreEvaluacion: evaluacion.nombre || 'Evaluación',
            evaluacion,
            id_curso: idCurso,
            nombreCurso: evaluacion.Cursos?.nombre || '',
            id_modulo: idModulo,
            nombreModulo: evaluacion.Modulos?.nombre || '',
            siglasModulo: evaluacion.Modulos?.siglas || '',
            id_practica: practica.id_practica,
            numeroPractica: practica.numero || '',
            codigoPractica: numPractica,
            nombrePractica: practica.nombre || 'Sin título',
            textoPractica: nombrePracticaCompleto,
            practica,
            id_discente: discente.id_discente,
            nombreDiscente: discente.nombre || '',
            apellidosDiscente: discente.apellidos || '',
            nombreCompletoDiscente: `${discente.nombre || ''} ${discente.apellidos || ''}`.trim(),
            discenteNia: discente.NIA || '',
            discenteCorreo: discente.correo || '',
            discenteImagen: discente.imagen || null,
            discente,
            peso: registroExistente?.peso || 100
          });
        }
      });
    });

    // Se ordenan por defecto por apellidos del discente y número de práctica
    listaPendientes.sort((a, b) => {
      const compApellidos = (a.apellidosDiscente || '').localeCompare(b.apellidosDiscente || '');
      if (compApellidos !== 0) return compApellidos;
      return (a.nombrePractica || '').localeCompare(b.nombrePractica || '');
    });

    return {
      data: listaPendientes,
      error: null,
      metadatos: {
        evaluacion,
        totalDiscentes: listaDiscentesEvaluacion.length,
        totalPracticas: listaPracticas.length,
        totalPendientes: listaPendientes.length
      }
    };
  } catch (err) {
    console.error('Error inesperado en getPendientesPorEvaluacion:', err);
    return {
      data: [],
      error: err.message || 'Error al obtener las calificaciones pendientes.'
    };
  }
};

// Se genera y descarga un informe en formato PDF con las calificaciones pendientes de una evaluación
export const exportarInformePendientesPDF = ({
  evaluacion,
  curso,
  modulo,
  pendientes = []
}) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margenIzquierdo = 15;
    const margenDerecho = 195;
    const anchoUtil = margenDerecho - margenIzquierdo;
    let posicionY = 18;

    // Encabezado institucional superior
    doc.setFillColor(30, 41, 59); // Fondo pizarra oscuro
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CONTROL DE CALIFICACIONES PENDIENTES', margenIzquierdo, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Auditoría y Detección de Evaluaciones Incompletas por Discente', margenIzquierdo, 18);

    doc.setFontSize(8);
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, margenDerecho, 18, { align: 'right' });

    posicionY = 36;

    // Tarjeta de metadatos del informe (Curso, Módulo y Evaluación)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 26, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CURSO ACADÉMICO:', margenIzquierdo + 4, posicionY + 6.5);
    doc.setFont('helvetica', 'normal');
    const textoCurso = curso ? `${curso.nombre || ''} (${curso.anyo || curso.centro || ''})` : evaluacion?.Cursos?.nombre || 'No especificado';
    doc.text(textoCurso, margenIzquierdo + 42, posicionY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO:', margenIzquierdo + 4, posicionY + 14);
    doc.setFont('helvetica', 'normal');
    const textoModulo = modulo ? `${modulo.nombre || ''} ${modulo.siglas ? `(${modulo.siglas})` : ''}` : evaluacion?.Modulos?.nombre || 'No especificado';
    doc.text(textoModulo, margenIzquierdo + 42, posicionY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('EVALUACIÓN:', margenIzquierdo + 4, posicionY + 21.5);
    doc.setFont('helvetica', 'normal');
    const textoEvaluacion = evaluacion?.nombre || 'Evaluación general';
    doc.text(textoEvaluacion, margenIzquierdo + 42, posicionY + 21.5);

    posicionY += 32;

    // Resumen de estado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumen de Calificaciones Pendientes', margenIzquierdo, posicionY);
    posicionY += 4;

    const totalPendientes = pendientes.length;
    const anchoCaja = anchoUtil / 3;
    const altoCaja = 13;

    // Cajas de resumen
    const kpis = [
      { titulo: 'Total Pendientes', valor: totalPendientes, color: totalPendientes > 0 ? [234, 88, 12] : [22, 163, 74] },
      { titulo: 'Estado de Actas', valor: totalPendientes === 0 ? 'COMPLETAS' : 'INCOMPLETAS', color: totalPendientes === 0 ? [22, 163, 74] : [220, 38, 38] },
      { titulo: 'Evaluación', valor: textoEvaluacion, color: [51, 65, 85] }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margenIzquierdo + idx * anchoCaja;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, posicionY, anchoCaja - 2, altoCaja, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.titulo, x + (anchoCaja - 2) / 2, posicionY + 4.5, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(String(kpi.valor), x + (anchoCaja - 2) / 2, posicionY + 10, { align: 'center' });
    });

    posicionY += altoCaja + 8;

    if (totalPendientes === 0) {
      // Mensaje de éxito en PDF
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 20, 2, 2, 'FD');

      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('¡Todo al día! No hay calificaciones pendientes para esta evaluación.', margenIzquierdo + anchoUtil / 2, posicionY + 11.5, { align: 'center' });
    } else {
      // Tabla detallada de calificaciones pendientes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Detalle de Registros Pendientes por Discente y Práctica', margenIzquierdo, posicionY);
      posicionY += 4;

      // Encabezado de la tabla
      doc.setFillColor(51, 65, 85);
      doc.rect(margenIzquierdo, posicionY, anchoUtil, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Discente (Nombre y NIA)', margenIzquierdo + 3, posicionY + 4.8);
      doc.text('Práctica sin Calificar', margenIzquierdo + 85, posicionY + 4.8);
      doc.text('Evaluación', margenDerecho - 4, posicionY + 4.8, { align: 'right' });
      posicionY += 7;

      pendientes.forEach((fila, idx) => {
        if (posicionY > 265) {
          doc.addPage();
          posicionY = 20;

          // Repetición de encabezado en nueva página
          doc.setFillColor(51, 65, 85);
          doc.rect(margenIzquierdo, posicionY, anchoUtil, 7, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('Discente (Nombre y NIA)', margenIzquierdo + 3, posicionY + 4.8);
          doc.text('Práctica sin Calificar', margenIzquierdo + 85, posicionY + 4.8);
          doc.text('Evaluación', margenDerecho - 4, posicionY + 4.8, { align: 'right' });
          posicionY += 7;
        }

        const altoFila = 7;
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.setDrawColor(241, 245, 249);
        doc.rect(margenIzquierdo, posicionY, anchoUtil, altoFila, 'FD');

        // Discente
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const textoDiscente = `${fila.nombreCompletoDiscente || ''} ${fila.discenteNia ? `(${fila.discenteNia})` : ''}`.trim();
        doc.text(textoDiscente.substring(0, 48), margenIzquierdo + 3, posicionY + 4.8);

        // Práctica
        doc.setTextColor(234, 88, 12);
        doc.setFont('helvetica', 'bold');
        const textoPractica = fila.textoPractica || fila.nombrePractica || 'Práctica';
        doc.text(textoPractica.substring(0, 45), margenIzquierdo + 85, posicionY + 4.8);

        // Evaluación
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text((fila.nombreEvaluacion || '').substring(0, 25), margenDerecho - 4, posicionY + 4.8, { align: 'right' });

        posicionY += altoFila;
      });
    }

    // Pie de página en cada hoja
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} - Sistema de Control de Notas`,
        margenIzquierdo,
        290
      );
      doc.text(
        'Documento de control docente de calificaciones pendientes',
        margenDerecho,
        290,
        { align: 'right' }
      );
    }

    const nombreArchivo = `Calificaciones_Pendientes_${(evaluacion?.nombre || 'Evaluacion').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(nombreArchivo);
    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar informe de pendientes a PDF:', err);
    return { exito: false, error: err.message || 'Error al generar el archivo PDF.' };
  }
};

// Se obtiene un resumen estadístico global de calificaciones pendientes para el panel principal
export const obtenerResumenCalificacionesPendientes = async () => {
  try {
    const { data: evaluaciones, error: errorEv } = await supabase
      .from('Evaluaciones')
      .select(`
        id_evaluacion,
        nombre,
        id_curso,
        id_modulo,
        Cursos:id_curso ( id_curso, nombre ),
        Modulos:id_modulo ( id_modulo, nombre, siglas )
      `);

    if (errorEv) {
      console.error('Error al consultar evaluaciones para resumen de pendientes:', errorEv);
      return { totalPendientes: 0, evaluacionesAfectadas: 0, desglose: [] };
    }

    const { data: registrosEvaluan, error: errorEval } = await supabase
      .from('evaluan')
      .select('id_evaluacion, id_practica, id_discente, nota')
      .is('nota', null);

    if (errorEval) {
      console.error('Error al consultar registros nulos en evaluan:', errorEval);
      return { totalPendientes: 0, evaluacionesAfectadas: 0, desglose: [] };
    }

    const totalPendientes = (registrosEvaluan || []).length;
    const mapaEvaluaciones = new Map();

    (evaluaciones || []).forEach((ev) => {
      mapaEvaluaciones.set(ev.id_evaluacion, {
        id_evaluacion: ev.id_evaluacion,
        nombre: ev.nombre,
        curso: ev.Cursos?.nombre || '',
        modulo: ev.Modulos?.siglas || ev.Modulos?.nombre || '',
        pendientes: 0
      });
    });

    (registrosEvaluan || []).forEach((reg) => {
      if (reg.id_evaluacion && mapaEvaluaciones.has(reg.id_evaluacion)) {
        mapaEvaluaciones.get(reg.id_evaluacion).pendientes += 1;
      }
    });

    const desglose = Array.from(mapaEvaluaciones.values()).filter((e) => e.pendientes > 0);

    return {
      totalPendientes,
      evaluacionesAfectadas: desglose.length,
      desglose
    };
  } catch (err) {
    console.error('Error inesperado en obtenerResumenCalificacionesPendientes:', err);
    return { totalPendientes: 0, evaluacionesAfectadas: 0, desglose: [] };
  }
};

// Se obtienen las calificaciones numéricas válidas de una práctica para el análisis de distribución y dificultad
export const getDistribucionNotas = async (practicaId) => {
  if (!practicaId) {
    return { data: [], error: 'Identificador de práctica no proporcionado.' };
  }

  try {
    const { data, error } = await supabase
      .from('evaluan')
      .select('nota')
      .eq('id_practica', practicaId)
      .not('nota', 'is', null);

    if (error) {
      console.error(`Error al consultar la distribución de notas para la práctica ${practicaId}:`, error);
      return { data: [], error: error.message };
    }

    // Se extraen exclusivamente los valores numéricos válidos del campo nota
    const notas = (data || [])
      .map((reg) => reg.nota)
      .filter((n) => n !== null && n !== undefined && !isNaN(n))
      .map((n) => Number(n));

    return { data: notas, error: null };
  } catch (err) {
    console.error('Error inesperado en getDistribucionNotas:', err);
    return { data: [], error: err.message || 'Error al obtener la distribución de notas de la práctica.' };
  }
};

// Se genera y descarga un informe en formato PDF con el análisis de dificultad e histograma de la práctica
export const exportarInformeDificultadPDF = ({
  practica,
  modulo,
  curso,
  estadisticas,
  distribucionRangos = [],
  imagenGrafico = null
}) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margenIzquierdo = 15;
    const margenDerecho = 195;
    const anchoUtil = margenDerecho - margenIzquierdo;
    let posicionY = 18;

    // Encabezado institucional superior
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ANÁLISIS DE DIFICULTAD DE PRÁCTICAS', margenIzquierdo, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Distribución de Calificaciones, Tasa de Aprobados y Diagnóstico Pedagógico', margenIzquierdo, 18);

    doc.setFontSize(8);
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, margenDerecho, 18, { align: 'right' });

    posicionY = 34;

    // Tarjeta de metadatos del informe (Curso, Módulo y Práctica)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 24, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CURSO ACADÉMICO:', margenIzquierdo + 4, posicionY + 6);
    doc.setFont('helvetica', 'normal');
    const textoCurso = curso ? `${curso.nombre || ''} (${curso.anyo || curso.centro || ''})` : 'Todos los cursos';
    doc.text(textoCurso, margenIzquierdo + 42, posicionY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO:', margenIzquierdo + 4, posicionY + 13);
    doc.setFont('helvetica', 'normal');
    const textoModulo = modulo ? `${modulo.nombre || ''} ${modulo.siglas ? `(${modulo.siglas})` : ''}` : 'No especificado';
    doc.text(textoModulo, margenIzquierdo + 42, posicionY + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('PRÁCTICA:', margenIzquierdo + 4, posicionY + 20);
    doc.setFont('helvetica', 'normal');
    const textoPractica = practica
      ? `${practica.numero ? `Práctica ${practica.numero}: ` : ''}${practica.nombre || 'Sin título'}`
      : 'Práctica no especificada';
    doc.text(textoPractica, margenIzquierdo + 42, posicionY + 20);

    posicionY += 29;

    // Resumen de indicadores clave KPI (Grid de 3 tarjetas)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumen Estadístico y Diagnóstico', margenIzquierdo, posicionY);
    posicionY += 4;

    const anchoCaja = anchoUtil / 3;
    const altoCaja = 15;

    const kpis = [
      {
        titulo: 'Nota Media',
        valor: estadisticas?.totalEvaluados > 0 ? `${estadisticas?.media?.toFixed(2)} / 100` : 'Sin datos',
        subtitulo: `${estadisticas?.totalEvaluados || 0} alumnos evaluados`,
        color: [59, 130, 246]
      },
      {
        titulo: 'Tasa de Aprobados',
        valor: estadisticas?.totalEvaluados > 0 ? `${estadisticas?.tasaAprobados?.toFixed(1)}%` : 'Sin datos',
        subtitulo: `${estadisticas?.aprobados || 0} de ${estadisticas?.totalEvaluados || 0} aptos (>= 50)`,
        color: (estadisticas?.tasaAprobados || 0) >= 50 ? [22, 163, 74] : [220, 38, 38]
      },
      {
        titulo: 'Diagnóstico Pedagógico',
        valor: estadisticas?.diagnostico || 'Sin datos',
        subtitulo: estadisticas?.diagnosticoDescripcion || 'Distribución de calificaciones',
        color: estadisticas?.diagnostico === 'Muy Fácil'
          ? [59, 130, 246]
          : estadisticas?.diagnostico === 'Adecuada'
          ? [22, 163, 74]
          : [220, 38, 38]
      }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margenIzquierdo + idx * anchoCaja;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, posicionY, anchoCaja - 2, altoCaja, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.titulo, x + (anchoCaja - 2) / 2, posicionY + 4, { align: 'center' });

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(String(kpi.valor), x + (anchoCaja - 2) / 2, posicionY + 9, { align: 'center' });

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.subtitulo, x + (anchoCaja - 2) / 2, posicionY + 13, { align: 'center' });
    });

    posicionY += altoCaja + 7;

    // Inserción de la imagen del gráfico del Histograma si está disponible
    if (imagenGrafico) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Histograma de Distribución de Frecuencias', margenIzquierdo, posicionY);
      posicionY += 3.5;

      const altoImagen = 68;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, altoImagen, 2, 2, 'FD');

      doc.addImage(imagenGrafico, 'PNG', margenIzquierdo + 1, posicionY + 1, anchoUtil - 2, altoImagen - 2);
      posicionY += altoImagen + 7;
    }

    // Tabla de distribución de frecuencias por rangos (con salto de página preventivo)
    if (posicionY + 65 > 275) {
      doc.addPage();
      posicionY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Distribución de Frecuencias por Rango de Calificación', margenIzquierdo, posicionY);
    posicionY += 4;

    // Encabezado de la tabla
    doc.setFillColor(51, 65, 85);
    doc.rect(margenIzquierdo, posicionY, anchoUtil, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Rango de Notas (0 - 100)', margenIzquierdo + 3, posicionY + 4.5);
    doc.text('Nivel Académico', margenIzquierdo + 65, posicionY + 4.5);
    doc.text('Nº Alumnos', margenIzquierdo + 125, posicionY + 4.5);
    doc.text('Porcentaje (%)', margenDerecho - 4, posicionY + 4.5, { align: 'right' });
    posicionY += 6.5;

    distribucionRangos.forEach((rango, idx) => {
      const altoFila = 5.8;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margenIzquierdo, posicionY, anchoUtil, altoFila, 'FD');

      // Rango
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(rango.rango, margenIzquierdo + 3, posicionY + 4.1);

      // Nivel
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(rango.etiquetaNivel || '', margenIzquierdo + 65, posicionY + 4.1);

      // Frecuencia
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(rango.frecuencia), margenIzquierdo + 125, posicionY + 4.1);

      // Porcentaje
      const pct = estadisticas?.totalEvaluados > 0
        ? ((rango.frecuencia / estadisticas.totalEvaluados) * 100).toFixed(1)
        : '0.0';
      doc.text(`${pct}%`, margenDerecho - 4, posicionY + 4.1, { align: 'right' });

      posicionY += altoFila;
    });

    // Pie de página en cada hoja
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} - Sistema de Control de Notas`,
        margenIzquierdo,
        290
      );
      doc.text(
        'Documento de análisis pedagógico y dificultad de prácticas',
        margenDerecho,
        290,
        { align: 'right' }
      );
    }

    const nombreArchivo = `Dificultad_Practica_${(practica?.nombre || 'Practica').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(nombreArchivo);
    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar informe de dificultad a PDF:', err);
    return { exito: false, error: err.message || 'Error al generar el archivo PDF.' };
  }
};

// Se obtienen los datos completos para el acta oficial de evaluación de un módulo profesional
export const getDatosActa = async (moduloId, cursoId = null) => {
  if (!moduloId) {
    return { data: null, error: 'Identificador de módulo no proporcionado.' };
  }

  try {
    // 1. Se obtiene la información del módulo profesional seleccionado
    const { data: modulo, error: errorModulo } = await supabase
      .from('Modulos')
      .select('id_modulo, nombre, siglas, descripcion, id_ciclo')
      .eq('id_modulo', moduloId)
      .single();

    if (errorModulo) {
      console.error(`Error al consultar el módulo ${moduloId}:`, errorModulo);
      return { data: null, error: errorModulo.message };
    }

    // 2. Se obtiene la información del curso académico si se especificó
    let curso = null;
    if (cursoId) {
      const { data: datosCurso, error: errorCurso } = await supabase
        .from('Cursos')
        .select('id_curso, nombre, anyo, centro, descripcion')
        .eq('id_curso', cursoId)
        .maybeSingle();

      if (!errorCurso && datosCurso) {
        curso = datosCurso;
      }
    }

    // 3. Se obtienen los discentes matriculados en el módulo y curso mediante la tabla imparte
    let discentes = [];
    let consultaImparte = supabase
      .from('imparte')
      .select(`
        id_imparte,
        id_curso,
        id_modulo,
        id_discente,
        Discentes:id_discente (
          id_discente,
          nombre,
          apellidos,
          NIA,
          correo,
          localidad,
          imagen,
          activo
        )
      `)
      .eq('id_modulo', moduloId);

    if (cursoId) {
      consultaImparte = consultaImparte.eq('id_curso', cursoId);
    }

    const { data: datosImparte, error: errorImparte } = await consultaImparte;

    if (errorImparte) {
      console.error('Error al consultar discentes en imparte para el acta:', errorImparte);
    } else if (datosImparte && datosImparte.length > 0) {
      const mapaDiscentes = new Map();
      datosImparte.forEach((item) => {
        if (item.Discentes && item.Discentes.id_discente) {
          mapaDiscentes.set(item.Discentes.id_discente, item.Discentes);
        }
      });
      discentes = Array.from(mapaDiscentes.values());
    }

    // Si no se encontraron discentes en imparte, se consultan los discentes activos como respaldo
    if (discentes.length === 0) {
      const { data: todosDiscentes, error: errorTodosDiscentes } = await supabase
        .from('Discentes')
        .select('id_discente, nombre, apellidos, NIA, correo, localidad, imagen, activo')
        .eq('activo', true)
        .order('apellidos', { ascending: true });

      if (!errorTodosDiscentes && todosDiscentes) {
        discentes = todosDiscentes;
      }
    }

    // 4. Se obtienen las evaluaciones asociadas al módulo (y curso si aplica)
    let consultaEvaluaciones = supabase
      .from('Evaluaciones')
      .select(`
        id_evaluacion,
        nombre,
        fecha_ini,
        fecha_fin,
        descripcion,
        id_tipoevaluacion,
        id_curso,
        id_modulo,
        created_at
      `)
      .eq('id_modulo', moduloId);

    if (cursoId) {
      consultaEvaluaciones = consultaEvaluaciones.eq('id_curso', cursoId);
    }

    const { data: datosEvaluaciones, error: errorEvaluaciones } = await consultaEvaluaciones;

    if (errorEvaluaciones) {
      console.error('Error al consultar evaluaciones para el acta:', errorEvaluaciones);
      return { data: null, error: errorEvaluaciones.message };
    }

    const evaluacionesOrdenadas = ordenarEvaluaciones(datosEvaluaciones || []);
    const idsEvaluaciones = evaluacionesOrdenadas.map((e) => e.id_evaluacion);

    // 5. Se obtienen las prácticas asociadas al módulo
    const { data: practicas, error: errorPracticas } = await supabase
      .from('Practicas')
      .select('id_practica, nombre, numero, enunciado, descripcion, id_tipopractica, unidad, id_modulo')
      .eq('id_modulo', moduloId);

    if (errorPracticas) {
      console.error('Error al consultar prácticas para el acta:', errorPracticas);
    }

    // 6. Se obtienen los registros de calificaciones de la tabla evaluan
    let registrosEvaluan = [];
    if (idsEvaluaciones.length > 0) {
      const { data: datosEvaluan, error: errorEvaluan } = await supabase
        .from('evaluan')
        .select(`
          id_evaluan,
          id_practica,
          id_evaluacion,
          id_discente,
          nota,
          peso,
          Discentes:id_discente (
            id_discente,
            nombre,
            apellidos,
            NIA,
            correo,
            imagen,
            activo
          )
        `)
        .in('id_evaluacion', idsEvaluaciones);

      if (errorEvaluan) {
        console.error('Error al consultar calificaciones en evaluan para el acta:', errorEvaluan);
        return { data: null, error: errorEvaluan.message };
      }

      registrosEvaluan = datosEvaluan || [];
    }

    // Se incorporan discentes que tengan registros en evaluan aunque no figuren en imparte
    const mapaTodosDiscentes = new Map();
    discentes.forEach((d) => mapaTodosDiscentes.set(d.id_discente, d));

    registrosEvaluan.forEach((reg) => {
      if (reg.id_discente && reg.Discentes && !mapaTodosDiscentes.has(reg.id_discente)) {
        mapaTodosDiscentes.set(reg.id_discente, reg.Discentes);
      }
    });

    const listaFinalDiscentes = Array.from(mapaTodosDiscentes.values()).sort((a, b) => {
      const apeA = (a.apellidos || '').toLowerCase();
      const apeB = (b.apellidos || '').toLowerCase();
      const compApe = apeA.localeCompare(apeB);
      if (compApe !== 0) return compApe;
      return (a.nombre || '').toLowerCase().localeCompare((b.nombre || '').toLowerCase());
    });

    return {
      data: {
        modulo,
        curso,
        discentes: listaFinalDiscentes,
        evaluaciones: evaluacionesOrdenadas,
        practicas: practicas || [],
        evaluan: registrosEvaluan
      },
      error: null
    };
  } catch (err) {
    console.error('Error inesperado en getDatosActa:', err);
    return { data: null, error: err.message || 'Error al obtener datos del acta de evaluación.' };
  }
};

// Se transforma la estructura de datos crudos en un array plano para el componente DataTable del acta
export const transformarDatosActa = (datosCrudos) => {
  if (!datosCrudos) {
    return { filas: [], evaluaciones: [], estadisticas: null };
  }

  const { modulo, curso, discentes = [], evaluaciones = [], evaluan = [] } = datosCrudos;

  // Se indexan las calificaciones de evaluan por id_discente e id_evaluacion
  const mapaCalificaciones = new Map();

  evaluan.forEach((reg) => {
    if (reg.id_discente && reg.id_evaluacion) {
      const clave = `${reg.id_discente}_${reg.id_evaluacion}`;
      if (!mapaCalificaciones.has(clave)) {
        mapaCalificaciones.set(clave, []);
      }
      mapaCalificaciones.get(clave).push(reg);
    }
  });

  // Se construye cada fila correspondiente a un discente matriculado
  const filas = discentes.map((discente) => {
    const notas = {};
    const notasDetalle = {};
    let sumaNotasValidas = 0;
    let evaluacionesCalificadas = 0;

    evaluaciones.forEach((ev) => {
      const clave = `${discente.id_discente}_${ev.id_evaluacion}`;
      const registros = mapaCalificaciones.get(clave) || [];

      // Se comprueba si existen calificaciones numéricas registradas
      const registrosCalificados = registros.filter(
        (r) => r.nota !== null && r.nota !== undefined && r.nota !== '' && !isNaN(r.nota)
      );

      if (registrosCalificados.length === 0) {
        notas[ev.id_evaluacion] = null;
        notasDetalle[ev.id_evaluacion] = {
          nota: null,
          totalPracticas: registros.length,
          practicasCalificadas: 0,
          ponderacionCorrecta: false
        };
      } else {
        // Se calcula la suma ponderada: multiplicar cada nota por su peso y dividirlo entre 100
        let sumaPonderada = 0;
        let sumaPesos = 0;

        registros.forEach((reg) => {
          const peso = Number(reg.peso) || 0;
          const notaVal = reg.nota !== null && reg.nota !== undefined && reg.nota !== '' ? Number(reg.nota) : 0;
          sumaPonderada += (notaVal * peso) / 100;
          sumaPesos += peso;
        });

        const notaFinalPonderada = Math.round(sumaPonderada * 100) / 100;

        notas[ev.id_evaluacion] = notaFinalPonderada;
        notasDetalle[ev.id_evaluacion] = {
          nota: notaFinalPonderada,
          totalPracticas: registros.length,
          practicasCalificadas: registrosCalificados.length,
          sumaPesos,
          ponderacionCorrecta: sumaPesos === 100
        };

        sumaNotasValidas += notaFinalPonderada;
        evaluacionesCalificadas += 1;
      }
    });

    const mediaDiscente = evaluacionesCalificadas > 0
      ? Math.round((sumaNotasValidas / evaluacionesCalificadas) * 100) / 100
      : null;

    return {
      id_discente: discente.id_discente,
      nombre: discente.nombre || '',
      apellidos: discente.apellidos || '',
      nombreCompleto: `${discente.apellidos || ''}, ${discente.nombre || ''}`.replace(/^,\s*/, '').trim(),
      nombreCompletoDirecto: `${discente.nombre || ''} ${discente.apellidos || ''}`.trim(),
      NIA: discente.NIA || '',
      correo: discente.correo || '',
      imagen: discente.imagen || null,
      activo: discente.activo !== false,
      notas,
      notasDetalle,
      media: mediaDiscente,
      evaluacionesCalificadas,
      discente
    };
  });

  // Se calculan las estadísticas globales por evaluación
  const estadisticasPorEvaluacion = {};
  evaluaciones.forEach((ev) => {
    const notasEvaluacion = filas
      .map((f) => f.notas[ev.id_evaluacion])
      .filter((n) => n !== null && n !== undefined && !isNaN(n));

    const totalEvaluados = notasEvaluacion.length;
    if (totalEvaluados === 0) {
      estadisticasPorEvaluacion[ev.id_evaluacion] = {
        totalEvaluados: 0,
        media: null,
        aprobados: 0,
        suspensos: 0,
        tasaAprobados: 0
      };
    } else {
      const suma = notasEvaluacion.reduce((acc, n) => acc + n, 0);
      const media = Math.round((suma / totalEvaluados) * 100) / 100;
      const aprobados = notasEvaluacion.filter((n) => n >= 50).length;
      const suspensos = totalEvaluados - aprobados;
      const tasaAprobados = Math.round((aprobados / totalEvaluados) * 1000) / 10;

      estadisticasPorEvaluacion[ev.id_evaluacion] = {
        totalEvaluados,
        media,
        aprobados,
        suspensos,
        tasaAprobados
      };
    }
  });

  // Estadísticas generales del módulo
  const todasLasMedias = filas.map((f) => f.media).filter((m) => m !== null);
  const mediaGlobalModulo = todasLasMedias.length > 0
    ? Math.round((todasLasMedias.reduce((acc, m) => acc + m, 0) / todasLasMedias.length) * 100) / 100
    : null;

  const totalAprobadosGlobal = todasLasMedias.filter((m) => m >= 50).length;
  const tasaAprobadosGlobal = todasLasMedias.length > 0
    ? Math.round((totalAprobadosGlobal / todasLasMedias.length) * 1000) / 10
    : 0;

  return {
    filas,
    evaluaciones,
    modulo,
    curso,
    estadisticas: {
      totalDiscentes: filas.length,
      totalEvaluaciones: evaluaciones.length,
      porEvaluacion: estadisticasPorEvaluacion,
      mediaGlobal: mediaGlobalModulo,
      tasaAprobadosGlobal,
      totalAprobadosGlobal
    }
  };
};

// Se genera y descarga el archivo CSV con las calificaciones del acta de evaluación
export const exportarActaCSV = ({ modulo, curso, evaluaciones = [], filas = [] }) => {
  try {
    const encabezados = ['NIA', 'Apellidos', 'Nombre'];
    evaluaciones.forEach((ev) => {
      encabezados.push(ev.nombre || 'Evaluación');
    });
    encabezados.push('Nota Media');

    const filasCSV = filas.map((fila) => {
      const filaDatos = [
        fila.NIA || '',
        fila.apellidos || '',
        fila.nombre || ''
      ];

      evaluaciones.forEach((ev) => {
        const nota = fila.notas[ev.id_evaluacion];
        filaDatos.push(nota !== null && nota !== undefined ? formatNota(nota) : '?');
      });

      filaDatos.push(fila.media !== null && fila.media !== undefined ? formatNota(fila.media) : '?');
      return filaDatos;
    });

    const contenidoCSV = [
      encabezados.join(';'),
      ...filasCSV.map((f) =>
        f
          .map((campo) => {
            const str = String(campo).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(';')
      )
    ].join('\r\n');

    // Se añade el BOM UTF-8 (\uFEFF) para compatibilidad con Microsoft Excel
    const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const siglasModulo = (modulo?.siglas || modulo?.nombre || 'Modulo').replace(/[^a-zA-Z0-9]/g, '_');
    const nombreCurso = (curso?.nombre || 'Curso').replace(/[^a-zA-Z0-9]/g, '_');
    const nombreArchivo = `Acta_Evaluacion_${siglasModulo}_${nombreCurso}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar acta a CSV:', err);
    return { exito: false, error: err.message || 'Error al exportar a CSV.' };
  }
};

// Se genera y descarga el documento PDF oficial del acta de evaluación del módulo con autoTable en formato vertical
export const exportarActaPDF = ({ modulo, curso, evaluaciones = [], filas = [], estadisticas = null }) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const anchoPagina = 210;
    const margenIzquierdo = 14;
    const margenDerecho = anchoPagina - 14;
    const anchoUtil = margenDerecho - margenIzquierdo;
    let posicionY = 14;

    // Encabezado institucional superior
    doc.setFillColor(30, 41, 59); // Fondo pizarra oscuro
    doc.rect(0, 0, anchoPagina, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ACTA OFICIAL DE EVALUACIÓN', margenIzquierdo, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Boletín de Calificaciones Ponderadas por Periodo de Evaluación', margenIzquierdo, 17);

    doc.setFontSize(7.5);
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, margenDerecho, 17, { align: 'right' });

    posicionY = 32;

    // Tarjeta de metadatos del informe (Curso y Módulo)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 22, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CURSO ACADÉMICO:', margenIzquierdo + 4, posicionY + 6.5);
    doc.setFont('helvetica', 'normal');
    const textoCurso = curso ? `${curso.nombre || ''} (${curso.anyo || curso.centro || ''})` : 'Todos los cursos';
    doc.text(textoCurso, margenIzquierdo + 38, posicionY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO:', margenIzquierdo + 4, posicionY + 14.5);
    doc.setFont('helvetica', 'normal');
    const textoModulo = modulo ? `${modulo.nombre || ''} ${modulo.siglas ? `(${modulo.siglas})` : ''}` : 'Módulo no especificado';
    doc.text(textoModulo, margenIzquierdo + 38, posicionY + 14.5);

    // Métricas en la cabecera derecha
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DISCENTES:', margenDerecho - 45, posicionY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(filas.length), margenDerecho - 8, posicionY + 6.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('EVALUACIONES:', margenDerecho - 45, posicionY + 14.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(evaluaciones.length), margenDerecho - 8, posicionY + 14.5, { align: 'right' });

    posicionY += 28;

    // Preparación de columnas y filas para jsPDF AutoTable (sin columna NIA)
    const encabezadosColumnas = ['#', 'Apellidos y Nombre'];
    evaluaciones.forEach((ev) => {
      encabezadosColumnas.push(ev.nombre || 'Evaluación');
    });
    encabezadosColumnas.push('Media');

    const cuerpoTabla = filas.map((fila, index) => {
      const filaCuerpo = [
        String(index + 1),
        fila.nombreCompleto || fila.nombreCompletoDirecto || ''
      ];

      evaluaciones.forEach((ev) => {
        const nota = fila.notas[ev.id_evaluacion];
        filaCuerpo.push(nota !== null && nota !== undefined ? formatNota(nota) : '?');
      });

      filaCuerpo.push(fila.media !== null && fila.media !== undefined ? formatNota(fila.media) : '?');
      return filaCuerpo;
    });

    // Fila de pie de tabla con medias del grupo
    const pieTabla = [];
    if (estadisticas && estadisticas.porEvaluacion) {
      const filaMedia = ['', 'MEDIA DEL GRUPO'];
      evaluaciones.forEach((ev) => {
        const stat = estadisticas.porEvaluacion[ev.id_evaluacion];
        filaMedia.push(stat?.media !== null && stat?.media !== undefined ? formatNota(stat.media) : '-');
      });
      filaMedia.push(estadisticas.mediaGlobal !== null && estadisticas.mediaGlobal !== undefined ? formatNota(estadisticas.mediaGlobal) : '-');
      pieTabla.push(filaMedia);

      const filaAprobados = ['', 'TASA APROBADOS (%)'];
      evaluaciones.forEach((ev) => {
        const stat = estadisticas.porEvaluacion[ev.id_evaluacion];
        filaAprobados.push(stat?.totalEvaluados > 0 ? `${stat.tasaAprobados}%` : '-');
      });
      filaAprobados.push(estadisticas.tasaAprobadosGlobal !== undefined ? `${estadisticas.tasaAprobadosGlobal}%` : '-');
      pieTabla.push(filaAprobados);
    }

    // Configuración y dibujo de la tabla con autoTable
    autoTable(doc, {
      startY: posicionY,
      head: [encabezadosColumnas],
      body: cuerpoTabla,
      foot: pieTabla.length > 0 ? pieTabla : undefined,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [51, 65, 85]
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center'
      },
      footStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        // Formato visual y coloreado según el valor numérico de la nota (índice >= 2)
        if (data.section === 'body' && data.column.index >= 2) {
          const valor = data.cell.raw;
          if (valor === '?') {
            data.cell.styles.textColor = [148, 163, 184]; // Gris para nota sin calificar
            data.cell.styles.fontStyle = 'italic';
            data.cell.styles.halign = 'center';
          } else {
            const num = parseFloat(String(valor).replace(',', '.'));
            data.cell.styles.halign = 'center';
            data.cell.styles.fontStyle = 'bold';

            if (!isNaN(num)) {
              if (num < 50) {
                data.cell.styles.textColor = [220, 38, 38]; // Rojo para suspenso
              } else if (num < 70) {
                data.cell.styles.textColor = [234, 88, 12]; // Naranja / Bien
              } else if (num < 90) {
                data.cell.styles.textColor = [22, 163, 74]; // Verde / Notable
              } else {
                data.cell.styles.textColor = [37, 99, 235]; // Azul / Sobresaliente
              }
            }
          }
        }
      },
      margin: { left: margenIzquierdo, right: margenIzquierdo }
    });

    // Paginación en el pie de página en cada hoja generada
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} - Sistema de Control de Notas`,
        margenIzquierdo,
        288
      );
    }

    const siglasModulo = (modulo?.siglas || modulo?.nombre || 'Modulo').replace(/[^a-zA-Z0-9]/g, '_');
    const nombreCurso = (curso?.nombre || 'Curso').replace(/[^a-zA-Z0-9]/g, '_');
    const nombreArchivo = `Acta_Evaluacion_${siglasModulo}_${nombreCurso}.pdf`;

    doc.save(nombreArchivo);
    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar acta de evaluación a PDF:', err);
    return { exito: false, error: err.message || 'Error al generar el documento PDF.' };
  }
};

// Se obtienen los datos de rendimiento competencial de un discente para el gráfico de radar cruzando evaluan y trabajan
export const getRadarCompetencias = async (moduloId, discenteId) => {
  if (!moduloId || !discenteId) {
    return { data: null, error: 'Identificadores de módulo y discente obligatorios.' };
  }

  try {
    // 1. Se obtiene la información del módulo profesional
    const { data: modulo, error: errorModulo } = await supabase
      .from('Modulos')
      .select('id_modulo, nombre, siglas, descripcion, id_ciclo')
      .eq('id_modulo', moduloId)
      .single();

    if (errorModulo) {
      console.error(`Error al consultar el módulo ${moduloId}:`, errorModulo);
      return { data: null, error: errorModulo.message };
    }

    // 2. Se obtiene la información del discente
    const { data: discente, error: errorDiscente } = await supabase
      .from('Discentes')
      .select('id_discente, nombre, apellidos, NIA, correo, localidad, imagen, activo')
      .eq('id_discente', discenteId)
      .single();

    if (errorDiscente) {
      console.error(`Error al consultar el discente ${discenteId}:`, errorDiscente);
      return { data: null, error: errorDiscente.message };
    }

    // 3. Se obtienen los Resultados de Aprendizaje (RA) del módulo ordenados por número
    const { data: listaRA, error: errorRA } = await supabase
      .from('RA')
      .select('id_ra, nombre, numero, descripcion, id_modulo')
      .eq('id_modulo', moduloId)
      .order('numero', { ascending: true });

    if (errorRA) {
      console.error(`Error al consultar los RA del módulo ${moduloId}:`, errorRA);
      return { data: null, error: errorRA.message };
    }

    if (!listaRA || listaRA.length === 0) {
      return {
        data: {
          modulo,
          discente,
          listaRA: [],
          estadisticas: {
            totalRA: 0,
            raEvaluados: 0,
            mediaGlobal: null,
            raSuperados: 0,
            raNoSuperados: 0,
            tasaSuperados: 0,
            raMasFuerte: null,
            raMasDebil: null
          }
        },
        error: null
      };
    }

    const idsRA = listaRA.map((ra) => ra.id_ra);

    // 4. Se obtienen los Criterios de Evaluación (CE) vinculados a dichos RA
    const { data: listaCE, error: errorCE } = await supabase
      .from('CE')
      .select('id_ce, nombre, numero, descripcion, id_ra')
      .in('id_ra', idsRA)
      .order('numero', { ascending: true });

    if (errorCE) {
      console.error('Error al consultar los CE vinculados a los RA:', errorCE);
      return { data: null, error: errorCE.message };
    }

    const idsCE = (listaCE || []).map((ce) => ce.id_ce);

    // 5. Se obtienen las asignaciones en la tabla trabajan para dichos CE junto con datos de las prácticas
    let listaTrabajan = [];
    if (idsCE.length > 0) {
      const { data: datosTrabajan, error: errorTrabajan } = await supabase
        .from('trabajan')
        .select(`
          id_trabajan,
          id_ce,
          id_practica,
          porcentaje,
          descripcion,
          Practicas:id_practica (
            id_practica,
            nombre,
            numero,
            enunciado,
            descripcion,
            id_tipopractica,
            unidad,
            id_modulo
          )
        `)
        .in('id_ce', idsCE);

      if (errorTrabajan) {
        console.error('Error al consultar asignaciones en la tabla trabajan:', errorTrabajan);
        return { data: null, error: errorTrabajan.message };
      }

      listaTrabajan = datosTrabajan || [];
    }

    // 6. Se obtienen las calificaciones del discente en la tabla evaluan
    const idsPracticas = Array.from(
      new Set(listaTrabajan.map((t) => t.id_practica).filter(Boolean))
    );

    let listaEvaluan = [];
    if (idsPracticas.length > 0) {
      const { data: datosEvaluan, error: errorEvaluan } = await supabase
        .from('evaluan')
        .select(`
          id_evaluan,
          id_practica,
          id_evaluacion,
          id_discente,
          nota,
          peso
        `)
        .eq('id_discente', discenteId)
        .in('id_practica', idsPracticas);

      if (errorEvaluan) {
        console.error('Error al consultar calificaciones en la tabla evaluan:', errorEvaluan);
        return { data: null, error: errorEvaluan.message };
      }

      listaEvaluan = datosEvaluan || [];
    }

    // Se indexan las notas del discente por id_practica
    const mapaNotasPractica = new Map();
    listaEvaluan.forEach((ev) => {
      if (ev.id_practica && ev.nota !== null && ev.nota !== undefined && ev.nota !== '' && !isNaN(ev.nota)) {
        // Se preserva la calificación válida para la práctica
        mapaNotasPractica.set(ev.id_practica, Number(ev.nota));
      }
    });

    // 7. Se calcula la nota de cada Criterio de Evaluación (CE)
    const mapaCEConNotas = new Map();

    (listaCE || []).forEach((ce) => {
      const asignacionesDelCE = listaTrabajan.filter((t) => t.id_ce === ce.id_ce);
      const totalAsignaciones = asignacionesDelCE.length;

      let sumaPonderada = 0;
      let sumaPorcentajesEvaluados = 0;
      let totalPorcentajeAsignado = 0;
      const detallePracticas = [];

      asignacionesDelCE.forEach((asig) => {
        const porcentaje = Number(asig.porcentaje) || 0;
        totalPorcentajeAsignado += porcentaje;

        const notaPractica = mapaNotasPractica.has(asig.id_practica)
          ? mapaNotasPractica.get(asig.id_practica)
          : null;

        const infoPractica = asig.Practicas || {};

        detallePracticas.push({
          id_practica: asig.id_practica,
          nombrePractica: infoPractica.nombre || 'Práctica',
          numeroPractica: infoPractica.numero || '',
          porcentaje,
          nota: notaPractica
        });

        if (notaPractica !== null) {
          sumaPonderada += (notaPractica * porcentaje);
          sumaPorcentajesEvaluados += porcentaje;
        }
      });

      // Se calcula la nota del CE normalizada respecto al porcentaje evaluado
      let notaCE = null;
      if (sumaPorcentajesEvaluados > 0) {
        notaCE = Math.round((sumaPonderada / sumaPorcentajesEvaluados) * 100) / 100;
      }

      mapaCEConNotas.set(ce.id_ce, {
        ...ce,
        nota: notaCE,
        totalPracticas: totalAsignaciones,
        practicasCalificadas: detallePracticas.filter((p) => p.nota !== null).length,
        porcentajeCobertura: totalPorcentajeAsignado,
        practicas: detallePracticas
      });
    });

    // 8. Se calcula la nota de cada Resultado de Aprendizaje (RA) promediando sus CE
    let sumaNotasRA = 0;
    let raEvaluadosCount = 0;
    let raSuperadosCount = 0;
    let raNoSuperadosCount = 0;

    const listaRAEstructurada = listaRA.map((ra) => {
      const cesDelRA = (listaCE || [])
        .filter((ce) => ce.id_ra === ra.id_ra)
        .map((ce) => mapaCEConNotas.get(ce.id_ce))
        .filter(Boolean);

      const cesCalificados = cesDelRA.filter((ce) => ce.nota !== null && ce.nota !== undefined);

      let notaRA = null;
      if (cesCalificados.length > 0) {
        const sumaCE = cesCalificados.reduce((acum, item) => acum + item.nota, 0);
        notaRA = Math.round((sumaCE / cesCalificados.length) * 100) / 100;

        sumaNotasRA += notaRA;
        raEvaluadosCount += 1;

        if (notaRA >= 50) {
          raSuperadosCount += 1;
        } else {
          raNoSuperadosCount += 1;
        }
      }

      const numRA = ra.numero ?? '';
      const codigoRA = numRA !== '' ? `RA ${numRA}` : 'RA';

      return {
        id_ra: ra.id_ra,
        numero: ra.numero,
        codigo: codigoRA,
        nombre: ra.nombre,
        descripcion: ra.descripcion || '',
        textoCompleto: formatearTextoRA(ra),
        nota: notaRA,
        totalCE: cesDelRA.length,
        ceEvaluados: cesCalificados.length,
        criterios: cesDelRA
      };
    });

    // 9. Se determinan las competencias más fuertes y más débiles
    const raConNota = listaRAEstructurada.filter((ra) => ra.nota !== null);

    let raMasFuerte = null;
    let raMasDebil = null;

    if (raConNota.length > 0) {
      const ordenadosDesc = [...raConNota].sort((a, b) => b.nota - a.nota);
      raMasFuerte = ordenadosDesc[0];
      raMasDebil = ordenadosDesc[ordenadosDesc.length - 1];
    }

    const mediaGlobal = raEvaluadosCount > 0
      ? Math.round((sumaNotasRA / raEvaluadosCount) * 100) / 100
      : null;

    const estadisticas = {
      totalRA: listaRAEstructurada.length,
      raEvaluados: raEvaluadosCount,
      mediaGlobal,
      raSuperados: raSuperadosCount,
      raNoSuperados: raNoSuperadosCount,
      tasaSuperados: raEvaluadosCount > 0
        ? Math.round((raSuperadosCount / raEvaluadosCount) * 100)
        : 0,
      raMasFuerte,
      raMasDebil
    };

    return {
      data: {
        modulo,
        discente,
        listaRA: listaRAEstructurada,
        estadisticas
      },
      error: null
    };
  } catch (err) {
    console.error('Error inesperado en getRadarCompetencias:', err);
    return {
      data: null,
      error: err.message || 'Error al compilar el informe radar de competencias.'
    };
  }
};

// Se genera y descarga un informe formal en PDF con el mapa competencial en radar y la tabla de respaldo
export const exportarInformeCompetenciasPDF = ({
  modulo,
  curso,
  discente,
  listaRA = [],
  estadisticas = null,
  imagenGrafico = null
}) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margenIzquierdo = 15;
    const margenDerecho = 195;
    const anchoUtil = margenDerecho - margenIzquierdo;
    let posicionY = 18;

    // Encabezado institucional superior
    doc.setFillColor(30, 41, 59); // Fondo pizarra oscuro
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('MAPA COMPETENCIAL INDIVIDUAL (RADAR)', margenIzquierdo, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Evaluación del Rendimiento Curricular por Resultados de Aprendizaje', margenIzquierdo, 18);

    doc.setFontSize(8);
    const fechaEmision = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaEmision}`, margenDerecho, 18, { align: 'right' });

    posicionY = 35;

    // Tarjeta de metadatos del discente, módulo y curso
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margenIzquierdo, posicionY, anchoUtil, 24, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('DISCENTE:', margenIzquierdo + 4, posicionY + 6);
    doc.setFont('helvetica', 'normal');
    const textoDiscente = discente
      ? `${discente.apellidos || ''}, ${discente.nombre || ''}${discente.NIA ? ` (NIA: ${discente.NIA})` : ''}`
      : 'Discente no especificado';
    doc.text(textoDiscente, margenIzquierdo + 30, posicionY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('MÓDULO:', margenIzquierdo + 4, posicionY + 13);
    doc.setFont('helvetica', 'normal');
    const textoModulo = modulo
      ? `${modulo.nombre || ''} ${modulo.siglas ? `(${modulo.siglas})` : ''}`
      : 'Módulo no especificado';
    doc.text(textoModulo, margenIzquierdo + 30, posicionY + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('CURSO:', margenIzquierdo + 4, posicionY + 20);
    doc.setFont('helvetica', 'normal');
    const textoCurso = curso
      ? `${curso.nombre || ''} (${curso.anyo || curso.centro || ''})`
      : 'Curso no especificado';
    doc.text(textoCurso, margenIzquierdo + 30, posicionY + 20);

    posicionY += 29;

    // Indicadores KPI ejecutivos
    const anchoKPI = anchoUtil / 4;
    const altoKPI = 14;

    const kpis = [
      {
        titulo: 'Media Competencial',
        valor: estadisticas?.mediaGlobal !== null && estadisticas?.mediaGlobal !== undefined
          ? `${formatNota(estadisticas.mediaGlobal)}/100`
          : 'Sin notas',
        color: estadisticas?.mediaGlobal >= 50 ? [22, 163, 74] : [220, 38, 38]
      },
      {
        titulo: 'RAs Superados',
        valor: `${estadisticas?.raSuperados || 0} de ${estadisticas?.totalRA || 0}`,
        color: [37, 99, 235]
      },
      {
        titulo: 'Competencia Fuerte',
        valor: estadisticas?.raMasFuerte
          ? `${estadisticas.raMasFuerte.codigo} (${formatNota(estadisticas.raMasFuerte.nota)})`
          : '-',
        color: [22, 163, 74]
      },
      {
        titulo: 'Área de Mejora',
        valor: estadisticas?.raMasDebil
          ? `${estadisticas.raMasDebil.codigo} (${formatNota(estadisticas.raMasDebil.nota)})`
          : '-',
        color: [220, 38, 38]
      }
    ];

    kpis.forEach((kpi, idx) => {
      const x = margenIzquierdo + idx * anchoKPI;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, posicionY, anchoKPI - 2, altoKPI, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.titulo, x + (anchoKPI - 2) / 2, posicionY + 4.5, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(String(kpi.valor), x + (anchoKPI - 2) / 2, posicionY + 11, { align: 'center' });
    });

    posicionY += altoKPI + 6;

    // Inserción del Gráfico de Radar si está disponible
    if (imagenGrafico) {
      try {
        const anchoGrafico = 100;
        const altoGrafico = 65;
        const centroX = margenIzquierdo + (anchoUtil - anchoGrafico) / 2;

        doc.addImage(imagenGrafico, 'PNG', centroX, posicionY, anchoGrafico, altoGrafico);
        posicionY += altoGrafico + 4;
      } catch (errImg) {
        console.error('Error al insertar imagen del gráfico en PDF:', errImg);
      }
    }

    // Tabla de Respaldo con el desglose numérico de cada Resultado de Aprendizaje
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Desglose Competencial por Resultado de Aprendizaje', margenIzquierdo, posicionY + 3);
    posicionY += 5;

    const filasTabla = (listaRA || []).map((ra) => {
      const notaStr = ra.nota !== null && ra.nota !== undefined ? formatNota(ra.nota) : 'Sin calificar';
      const infoColor = getColorNota(ra.nota);

      return [
        ra.codigo || `RA ${ra.numero || ''}`,
        ra.nombre || ra.descripcion || 'Resultado de Aprendizaje',
        `${ra.ceEvaluados || 0} / ${ra.totalCE || 0} CE`,
        notaStr,
        infoColor.label
      ];
    });

    autoTable(doc, {
      startY: posicionY,
      head: [['Código', 'Resultado de Aprendizaje (RA)', 'Criterios Evaluados', 'Nota Media', 'Nivel']],
      body: filasTabla,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 32 },
        3: { halign: 'center', fontStyle: 'bold', cellWidth: 24 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 30 }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 3 || data.column.index === 4) {
            const fila = listaRA[data.row.index];
            if (fila) {
              const info = getColorNota(fila.nota);
              if (fila.nota === null || fila.nota === undefined) {
                data.cell.styles.textColor = [148, 163, 184];
                data.cell.styles.fontStyle = 'italic';
              } else if (fila.nota < 50) {
                data.cell.styles.textColor = [220, 38, 38];
              } else if (fila.nota < 60) {
                data.cell.styles.textColor = [234, 88, 12];
              } else if (fila.nota < 70) {
                data.cell.styles.textColor = [202, 138, 4];
              } else if (fila.nota < 90) {
                data.cell.styles.textColor = [22, 163, 74];
              } else {
                data.cell.styles.textColor = [37, 99, 235];
              }
            }
          }
        }
      },
      margin: { left: margenIzquierdo, right: margenIzquierdo }
    });

    // Paginación y pie de página
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${totalPaginas} - Sistema de Control de Notas`,
        margenIzquierdo,
        288
      );
      doc.text(
        'Informe competencial individual generado automáticamente',
        margenDerecho,
        288,
        { align: 'right' }
      );
    }

    const apellidosLimpios = (discente?.apellidos || 'Discente').replace(/[^a-zA-Z0-9]/g, '_');
    const siglasModulo = (modulo?.siglas || modulo?.nombre || 'Modulo').replace(/[^a-zA-Z0-9]/g, '_');
    const nombreArchivo = `Radar_Competencias_${apellidosLimpios}_${siglasModulo}.pdf`;

    doc.save(nombreArchivo);
    return { exito: true, error: null };
  } catch (err) {
    console.error('Error al exportar informe de competencias a PDF:', err);
    return { exito: false, error: err.message || 'Error al generar el archivo PDF.' };
  }
};




