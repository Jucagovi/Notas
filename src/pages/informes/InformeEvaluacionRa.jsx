import React, { useState, useMemo } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useInformeActaRA from '../../hooks/useInformeActaRA.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import {
  FiltrosActaRa,
  BarraHerramientasActa,
  ResumenActaRa,
  TablaActaRa
} from '../../components/actara/index.js';
import { exportarActaPDF } from '../../utils/exportadorActaPdf.js';
import { exportarActaCSV } from '../../utils/exportadorActaCsv.js';

/**
 * InformeEvaluacionRa - Página orquestadora del Caso de Uso 17 (Acta de Evaluación por RA).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando los filtros jerárquicos de año
 * y clase, consumir el hook useInformeActaRA para obtener las calificaciones de los discentes en cada RA,
 * gestionar el conmutador de cálculo (Evaluación Continua vs Evaluación Final) y coordinar las exportaciones
 * oficiales a formatos PDF y CSV.
 */
const InformeEvaluacionRa = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // 1. Consulta y control del Año Académico activo
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

  // Estado local para almacenar la clase seleccionada por el usuario (espera su acción)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Estado local para el modo de cálculo: 'final' (por defecto al ser acta oficial) o 'continua'
  const [modoCalculo, setModoCalculo] = useState('final');

  // Estados locales para los procesos de exportación
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoCsv, setExportandoCsv] = useState(false);

  // Se extraen los datos de la clase activa seleccionada
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // 3. Custom Hook especializado para el cruce de calificaciones por RA
  const {
    discentes,
    ras,
    cargando: cargandoActa,
    error: errorActa,
    recargar: recargarActa
  } = useInformeActaRA(idCursoActivo, idModuloActivo);

  // Manejador del cambio manual de año académico en el desplegable
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
  };

  // Manejador del cambio manual de clase
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
      await exportarActaPDF({
        discentes,
        ras,
        modoCalculo,
        claseInfo: claseActiva || {},
        anioLectivo: anioLectivoTexto
      });
      mostrarExito('Acta oficial descargada en formato PDF con éxito.');
    } catch (err) {
      console.error('Error al generar el PDF del acta:', err);
      mostrarError('No se ha podido generar el documento PDF del acta.');
    } finally {
      setExportandoPdf(false);
    }
  };

  // Manejador de exportación tabular a CSV
  const manejarExportarCsv = () => {
    if (!discentes || discentes.length === 0) {
      mostrarError('No hay calificaciones de alumnos disponibles para exportar.');
      return;
    }

    setExportandoCsv(true);
    try {
      exportarActaCSV({
        discentes,
        ras,
        modoCalculo,
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
        titulo="Acta de Evaluación por RA"
        descripcion="Informe oficial definitivo que detalla la calificación competencial de cada discente en cada Resultado de Aprendizaje."
      />

      {/* 2. Filtros Contextuales (Año Académico y Curso/Clase) */}
      <FiltrosActaRa
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

      {/* 3. Estado inicial si el usuario no ha seleccionado una clase */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona un año escolar y una clase en los selectores superiores para consultar el acta de evaluación."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {/* 4. Estado si la clase no cuenta con discentes matriculados */}
      {claseSeleccionadaId && !cargandoActa && discentes.length === 0 && (
        <EstadoVacio
          mensaje="Sin Alumnos Matriculados"
          descripcion="La clase seleccionada no tiene discentes matriculados en la tabla imparte para este módulo formativo."
          icono="pi pi-users"
          className="w-full my-4"
        />
      )}

      {/* 5. Zona principal de datos cuando hay una clase activa con discentes */}
      {claseSeleccionadaId && (cargandoActa || discentes.length > 0) && (
        <div className="flex flex-column w-full">
          {/* Barra de herramientas con conmutador de modos y botones de exportación */}
          <BarraHerramientasActa
            modoCalculo={modoCalculo}
            onCambioModo={setModoCalculo}
            onExportarPdf={manejarExportarPdf}
            onExportarCsv={manejarExportarCsv}
            exportandoPdf={exportandoPdf}
            exportandoCsv={exportandoCsv}
            deshabilitado={cargandoActa || discentes.length === 0}
          />

          {/* Panel resumen curricular y metodológico */}
          <ResumenActaRa
            discentes={discentes}
            ras={ras}
            modoCalculo={modoCalculo}
            claseInfo={claseActiva || {}}
          />

          {/* Tabla dinámica (Pivot Table) de calificaciones por RA */}
          <TablaActaRa
            discentes={discentes}
            ras={ras}
            modoCalculo={modoCalculo}
            cargando={cargandoActa}
          />
        </div>
      )}
    </div>
  );
};

export default InformeEvaluacionRa;
