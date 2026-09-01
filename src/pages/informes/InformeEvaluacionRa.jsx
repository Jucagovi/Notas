import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformeEvaluacionRa from '../../hooks/useInformeEvaluacionRa.js';
import InformeEvaluacionRaFiltros from '../../components/informes/InformeEvaluacionRaFiltros.jsx';
import InformeEvaluacionRaResumen from '../../components/informes/InformeEvaluacionRaResumen.jsx';
import InformeEvaluacionRaTabla from '../../components/informes/InformeEvaluacionRaTabla.jsx';
import DialogoDetalleDiscenteRA from '../../components/informes/DialogoDetalleDiscenteRA.jsx';

// Página principal del informe de Acta de Evaluación por Resultados de Aprendizaje (RA)
const InformeEvaluacionRa = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    filasActa,
    filasFiltradas,
    listaRA,
    estadisticas,
    soloCompletos,
    conmutarModoEvaluacion,
    terminoBusqueda,
    setTerminoBusqueda,
    campoOrden,
    direccionOrden,
    alternarOrdenacion,
    cambiarPesoRA,
    guardandoPeso,
    cargando,
    cargandoModulos,
    exportandoPDF,
    exportandoCSV,
    detalleModal,
    abrirDetalleDiscenteRA,
    cerrarDetalleDiscenteRA,
    recargar,
    descargarCSV,
    descargarPDF
  } = useInformeEvaluacionRa();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column gap-1">
        <h1 className="page-title m-0">Acta de Evaluación por Resultados de Aprendizaje (RA)</h1>
        <p className="text-muted m-0 text-sm">
          Cálculo de la nota final del módulo ponderando las calificaciones obtenidas en cada Resultado de Aprendizaje según los pesos configurados en el curso escolar.
        </p>
      </div>

      <Divider />

      {/* 2. Filtros superiores y barra de herramientas */}
      <InformeEvaluacionRaFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        campoOrden={campoOrden}
        direccionOrden={direccionOrden}
        alternarOrdenacion={alternarOrdenacion}
        soloCompletos={soloCompletos}
        conmutarModoEvaluacion={conmutarModoEvaluacion}
        cargando={cargando}
        cargandoModulos={cargandoModulos}
        exportandoCSV={exportandoCSV}
        exportandoPDF={exportandoPDF}
        recargar={recargar}
        descargarCSV={descargarCSV}
        descargarPDF={descargarPDF}
        totalFilas={filasActa.length}
        totalFiltradas={filasFiltradas.length}
      />

      {/* 3. Contenido condicional según el estado de la selección */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Calculando notas ponderadas de RA y compilando el acta oficial...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso en el desplegable superior para consultar las actas de evaluación de sus módulos.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Módulo Profesional</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para generar y visualizar su acta de evaluación por Resultados de Aprendizaje.
            </p>
          </div>
        </Card>
      ) : filasActa.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-users text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">No se encontraron discentes matriculados</h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              El módulo seleccionado no cuenta con alumnos matriculados en la tabla imparte para este curso.
            </p>
            <Button
              label="Gestionar Clases y Matrícula"
              icon="pi pi-building"
              severity="secondary"
              size="small"
              onClick={() => navigate('/clases')}
            />
          </div>
        </Card>
      ) : (
        <>
          {/* 4. Tarjetas resumen de indicadores clave (KPI) */}
          <InformeEvaluacionRaResumen
            estadisticas={estadisticas}
            modulo={moduloSeleccionado}
            soloCompletos={soloCompletos}
          />

          {/* 5. Tabla pivote de calificaciones por Resultados de Aprendizaje */}
          <InformeEvaluacionRaTabla
            filas={filasFiltradas}
            listaRA={listaRA}
            estadisticas={estadisticas}
            soloCompletos={soloCompletos}
            cargando={cargando}
            guardandoPeso={guardandoPeso}
            onVerDetalleRA={abrirDetalleDiscenteRA}
            onGuardarPesoRA={cambiarPesoRA}
          />

          {/* 6. Diálogo modal con desglose de CEs y prácticas por RA */}
          <DialogoDetalleDiscenteRA
            visible={detalleModal.visible}
            onHide={cerrarDetalleDiscenteRA}
            discente={detalleModal.discente}
            ra={detalleModal.ra}
            detalle={detalleModal.detalle}
          />
        </>
      )}
    </div>
  );
};

export default InformeEvaluacionRa;
