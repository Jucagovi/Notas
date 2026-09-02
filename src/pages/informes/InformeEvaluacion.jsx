import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformeEvaluacion from '../../hooks/useInformeEvaluacion.js';
import InformeEvaluacionFiltros from '../../components/informes/InformeEvaluacionFiltros.jsx';
import InformeEvaluacionResumen from '../../components/informes/InformeEvaluacionResumen.jsx';
import InformeEvaluacionTabla from '../../components/informes/InformeEvaluacionTabla.jsx';

// Página principal del informe de Acta de Evaluación Oficial (Boletín) de un módulo profesional
const InformeEvaluacion = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    filasActa,
    filasFiltradas,
    evaluaciones,
    estadisticas,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    exportandoPDF,
    exportandoCSV,
    recargar,
    descargarCSV,
    descargarPDF
  } = useInformeEvaluacion();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column gap-1">
        <h1 className="page-title m-0">Acta por trimestres</h1>
        <p className="text-muted m-0 text-sm">
          Cálculo de la nota trimestral normalizada por Resultados de Aprendizaje (RA) para todos los discentes matriculados en el módulo.
        </p>
      </div>

      <Divider />

      {/* 2. Filtros superiores y barra de herramientas */}
      <InformeEvaluacionFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
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
          <span className="text-muted text-sm mt-3">Calculando calificaciones ponderadas y compilando acta oficial...</span>
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
              Seleccione el módulo profesional para generar y visualizar su acta oficial de calificaciones.
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
          <InformeEvaluacionResumen
            estadisticas={estadisticas}
            modulo={moduloSeleccionado}
            totalEvaluaciones={evaluaciones.length}
          />

          {/* 5. Tabla pivote de calificaciones por evaluación */}
          <InformeEvaluacionTabla
            filas={filasFiltradas}
            evaluaciones={evaluaciones}
            estadisticas={estadisticas}
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
};

export default InformeEvaluacion;
