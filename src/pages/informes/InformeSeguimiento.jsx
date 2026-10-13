import React, { useState } from 'react';
import { Message } from 'primereact/message';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useInformeSeguimiento from '../../hooks/useInformeSeguimiento.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import {
  FiltrosSeguimiento,
  EditorCualitativoSeguimiento,
  TablaVistaPreviaSeguimiento,
  BarraAccionesSeguimiento
} from '../../components/seguimiento/index.js';
import { exportarSeguimientoODT } from '../../utils/exportadorSeguimientoOdt.js';
import { exportarSeguimientoPDF } from '../../utils/exportadorSeguimientoPdf.js';

/**
 * InformeSeguimiento - Página contenedora y orquestadora del Caso de Uso 22
 * (Informe de Seguimiento de Programaciones).
 *
 * Responsabilidad Única: Actuar como orquestador conectando el Custom Hook
 * useInformeSeguimiento con los subcomponentes presentacionales en src/components/seguimiento,
 * gestionando las descargas en formatos oficiales (ODT libre y PDF) y el estado global.
 */
const InformeSeguimiento = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Estados de control para la generación asíncrona de archivos.
  const [exportandoOdt, setExportandoOdt] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  // Custom Hook especializado en el cálculo y cruce temporal del seguimiento de programación.
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    anioAcademicoTexto,
    cursos,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoActivo,
    moduloActivo,
    evaluacionActiva,
    profesor,
    setProfesor,
    fechaCorte,
    setFechaCorte,
    fechaCorteTexto,
    observaciones,
    setObservaciones,
    contenidosImpartidosTexto,
    setContenidosImpartidosTexto,
    contenidosProgramados,
    contenidosImpartidos,
    cargando,
    error,
    recargar
  } = useInformeSeguimiento();

  // Manejador de descarga en formato nativo editable OpenDocument Text (.odt).
  const manejarExportarOdt = async () => {
    try {
      setExportandoOdt(true);
      await exportarSeguimientoODT({
        profesor,
        anioAcademicoTexto,
        asignatura: moduloActivo?.nombre || 'Módulo',
        evaluacion: evaluacionActiva?.nombre || '1ª EVALUACIÓN',
        fechaCorteTexto,
        contenidosProgramados,
        contenidosImpartidosTexto,
        contenidosImpartidosListado: contenidosImpartidos,
        observaciones
      });
      mostrarExito('Documento editable ODT generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al generar el documento ODT:', err);
      mostrarError('No se pudo generar el documento editable ODT.');
    } finally {
      setExportandoOdt(false);
    }
  };

  // Manejador de descarga en formato PDF.
  const manejarExportarPdf = async () => {
    try {
      setExportandoPdf(true);
      await exportarSeguimientoPDF({
        profesor,
        anioAcademicoTexto,
        asignatura: moduloActivo?.nombre || 'Módulo',
        evaluacion: evaluacionActiva?.nombre || '1ª EVALUACIÓN',
        fechaCorteTexto,
        contenidosProgramados,
        contenidosImpartidosTexto,
        contenidosImpartidosListado: contenidosImpartidos,
        observaciones
      });
      mostrarExito('Informe en PDF generado y descargado con éxito.');
    } catch (err) {
      console.error('Error al generar el archivo PDF:', err);
      mostrarError('No se pudo generar el informe en PDF.');
    } finally {
      setExportandoPdf(false);
    }
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera estándar institucional */}
      <HeaderPagina
        titulo="Seguimiento de Programación"
        descripcion="Informe mensual de cumplimiento curricular: contraste de fechas planificadas frente al estado real de las Unidades de Trabajo con redacción cualitativa oficial."
      />

      {/* 2. Filtros de cabecera: Año académico y Curso (el módulo se resuelve automáticamente) */}
      <FiltrosSeguimiento
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={setAnioSeleccionado}
        cursos={cursos}
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCambioCurso={setCursoSeleccionadoId}
        moduloActivo={moduloActivo}
        profesor={profesor}
        onCambioProfesor={setProfesor}
        cargando={cargando}
      />

      {/* 3. Mensaje informativo en caso de incidencia de consulta */}
      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full justify-content-start mb-3"
        />
      )}

      {/* 4. Renderizado condicional según estado de los datos */}
      {cargando && (!cursos || cursos.length === 0) ? (
        <div className="w-full my-4">
          <CargadorSeccion cargando={true} tipo="tabla" filas={5} />
        </div>
      ) : !cursoSeleccionadoId ? (
        <EstadoVacio
          mensaje="Selecciona un Curso Escolar"
          descripcion="Por favor, escoge un año académico y un curso en los desplegables superiores para confeccionar el informe de seguimiento mensual."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : (
        <div className="flex flex-column w-full">
          {/* 5. Editor cualitativo de incidencias y fecha de corte */}
          <EditorCualitativoSeguimiento
            fechaCorte={fechaCorte}
            onCambioFechaCorte={setFechaCorte}
            observaciones={observaciones}
            onCambioObservaciones={setObservaciones}
            contenidosImpartidosTexto={contenidosImpartidosTexto}
            onCambioContenidosImpartidosTexto={setContenidosImpartidosTexto}
            deshabilitado={cargando}
          />

          {/* 6. Vista previa del documento emulando seguimiento.pdf y DataTable alternativo */}
          <TablaVistaPreviaSeguimiento
            profesor={profesor}
            grupo={cursoActivo?.nombre || 'Curso'}
            anioAcademicoTexto={anioAcademicoTexto}
            asignatura={moduloActivo?.nombre || 'Módulo'}
            evaluacion={evaluacionActiva?.nombre || '1ª EVALUACIÓN'}
            fechaCorteTexto={fechaCorteTexto}
            contenidosProgramados={contenidosProgramados}
            contenidosImpartidosTexto={contenidosImpartidosTexto}
            contenidosImpartidos={contenidosImpartidos}
            observaciones={observaciones}
            cargando={cargando}
          />

          {/* 7. Barra de botones destacados de exportación (ODT nativo y PDF) */}
          <BarraAccionesSeguimiento
            onExportarOdt={manejarExportarOdt}
            onExportarPdf={manejarExportarPdf}
            onRecargar={recargar}
            exportandoOdt={exportandoOdt}
            exportandoPdf={exportandoPdf}
            deshabilitado={cargando}
          />
        </div>
      )}
    </div>
  );
};

export default InformeSeguimiento;
