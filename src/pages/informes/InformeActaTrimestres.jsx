import React, { useState, useMemo } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useInformeActa from '../../hooks/useInformeActa.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import {
  FiltrosActaTrimestres,
  BarraHerramientasTrimestres,
  ResumenActaTrimestres,
  TablaActaTrimestres
} from '../../components/actatrimestres/index.js';
import { exportarActaTrimestresPDF } from '../../utils/exportadorActaTrimestresPdf.js';
import { exportarActaTrimestresCSV } from '../../utils/exportadorActaTrimestresCsv.js';

/**
 * InformeActaTrimestres - Página orquestadora del Caso de Uso 12.2 (Informe Acta por Trimestres).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando los filtros jerárquicos de año
 * escolar y clase, consumir el hook useInformeActa para el cálculo normalizado de las calificaciones
 * trimestrales de los discentes matriculados y coordinar la exportación oficial a CSV y PDF.
 */
const InformeActaTrimestres = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // 1. Consulta y control del Año Académico activo (selecciona el más reciente por defecto)
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Consulta de clases filtradas por el año académico activo
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Estado local para la clase seleccionada por el docente (espera su acción)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Estados locales para las operaciones de exportación
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoCsv, setExportandoCsv] = useState(false);

  // Se extraen los datos de la clase activa seleccionada
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // 3. Custom Hook especializado para el cálculo y pivote del acta trimestral
  const {
    discentes,
    evaluaciones,
    cargando: cargandoActa,
    error: errorActa,
    recargar: recargarActa
  } = useInformeActa(idCursoActivo, idModuloActivo);

  // Manejador del cambio manual de año académico en el desplegable
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
  };

  // Manejador del cambio de clase
  const manejarCambioClase = (nuevoIdClase) => {
    setClaseSeleccionadaId(nuevoIdClase);
  };

  // Manejador de la recarga global de datos
  const manejarRecargar = async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
    if (idCursoActivo && idModuloActivo) {
      await recargarActa();
    }
  };

  // Etiqueta formateada del año lectivo (ej. '2026/2027')
  const anioLectivoTexto = useMemo(() => {
    const encontrado = anios.find((a) => a.value === anioSeleccionado);
    return encontrado ? encontrado.label : (claseActiva?.anioCompleto || '');
  }, [anios, anioSeleccionado, claseActiva]);

  // Manejador de exportación oficial a PDF
  const manejarExportarPdf = async () => {
    if (!discentes || discentes.length === 0) {
      mostrarError('No hay calificaciones de alumnos disponibles para exportar.');
      return;
    }

    setExportandoPdf(true);
    try {
      await exportarActaTrimestresPDF({
        discentes,
        evaluaciones,
        claseInfo: claseActiva || {},
        anioLectivo: anioLectivoTexto
      });
      mostrarExito('Acta oficial de trimestres descargada en formato PDF con éxito.');
    } catch (err) {
      console.error('Error al generar el PDF del acta por trimestres:', err);
      mostrarError('No se ha podido generar el documento PDF del acta.');
    } finally {
      setExportandoPdf(false);
    }
  };

  // Manejador de exportación a CSV
  const manejarExportarCsv = () => {
    if (!discentes || discentes.length === 0) {
      mostrarError('No hay calificaciones de alumnos disponibles para exportar.');
      return;
    }

    setExportandoCsv(true);
    try {
      exportarActaTrimestresCSV({
        discentes,
        evaluaciones,
        claseInfo: claseActiva || {}
      });
      mostrarExito('Matriz de calificaciones exportada a archivo CSV con éxito.');
    } catch (err) {
      console.error('Error al generar el archivo CSV:', err);
      mostrarError('No se ha podido generar el archivo CSV.');
    } finally {
      setExportandoCsv(false);
    }
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Acta por Trimestres"
        descripcion="Informe oficial de evaluación por trimestres con calificaciones ponderadas de cada convocatoria para todos los discentes matriculados."
      />

      {/* 2. Filtros Contextuales (Año Académico y Curso/Clase) */}
      <FiltrosActaTrimestres
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={manejarCambioAnio}
        cargandoAnios={cargandoAnios}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={manejarCambioClase}
        cargandoClases={cargandoClases}
        onRecargar={manejarRecargar}
      />

      {/* 3. Estado inicial si el docente aún no ha seleccionado una clase */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona un año escolar y una clase en los selectores superiores para consultar el acta por trimestres."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {/* 4. Estado si la clase seleccionada no cuenta con alumnos matriculados */}
      {claseSeleccionadaId && !cargandoActa && discentes.length === 0 && (
        <EstadoVacio
          mensaje="Sin Alumnos Matriculados"
          descripcion="La clase seleccionada no tiene discentes matriculados en la tabla imparte para este módulo profesional."
          icono="pi pi-users"
          className="w-full my-4"
        />
      )}

      {/* 5. Zona principal de datos cuando existe una clase activa con discentes */}
      {claseSeleccionadaId && (cargandoActa || discentes.length > 0) && (
        <div className="flex flex-column w-full">
          {/* Barra de herramientas con botones de exportación ubicados a la derecha */}
          <BarraHerramientasTrimestres
            onExportarPdf={manejarExportarPdf}
            onExportarCsv={manejarExportarCsv}
            exportandoPdf={exportandoPdf}
            exportandoCsv={exportandoCsv}
            deshabilitado={cargandoActa || discentes.length === 0}
          />

          {/* Panel con tarjetas resumen de métricas e indicadores rápidos */}
          <ResumenActaTrimestres
            discentes={discentes}
            evaluaciones={evaluaciones}
            claseInfo={claseActiva || {}}
          />

          {/* Tabla dinámica (Pivot Table) de calificaciones por trimestre */}
          <TablaActaTrimestres
            discentes={discentes}
            evaluaciones={evaluaciones}
            cargando={cargandoActa}
          />
        </div>
      )}
    </div>
  );
};

export default InformeActaTrimestres;
