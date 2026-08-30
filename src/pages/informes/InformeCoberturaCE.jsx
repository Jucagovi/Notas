import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformeCoberturaCE from '../../hooks/useInformeCoberturaCE.js';
import InformeCoberturaFiltros from '../../components/informes/InformeCoberturaFiltros.jsx';
import InformeCoberturaResumen from '../../components/informes/InformeCoberturaResumen.jsx';
import InformeCoberturaTabla from '../../components/informes/InformeCoberturaTabla.jsx';

// Página principal del informe de auditoría de cobertura curricular de Criterios de Evaluación
const InformeCoberturaCE = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    filasCE,
    filasFiltradas,
    estadisticas,
    filtroEstado,
    setFiltroEstado,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    exportandoPDF,
    recargar,
    descargarPDF
  } = useInformeCoberturaCE();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Auditoría de Cobertura Curricular (CE)</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Validación de que todos los Criterios de Evaluación (CE) del módulo cuenten con prácticas cuya cobertura sume exactamente el 100%.
          </p>
        </div>

        <div className="flex align-items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            label="Asignación CE"
            icon="pi pi-check-square"
            size="small"
            severity="secondary"
            outlined
            className="white-space-nowrap px-3"
            style={{ minWidth: '150px' }}
            onClick={() => navigate('/criterios')}
            tooltip="Ir a la pantalla de asignación y ponderación de criterios"
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            type="button"
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            size="small"
            severity="primary"
            className="white-space-nowrap px-3"
            style={{ minWidth: '145px' }}
            onClick={descargarPDF}
            loading={exportandoPDF}
            disabled={cargando || filasCE.length === 0}
          />
        </div>
      </div>

      <Divider />

      {/* 2. Filtros superiores de curso y módulo */}
      <InformeCoberturaFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        cargando={cargando}
        cargandoModulos={cargandoModulos}
        exportandoPDF={exportandoPDF}
        recargar={recargar}
        descargarPDF={descargarPDF}
        totalFilas={filasCE.length}
        totalFiltradas={filasFiltradas.length}
      />

      {/* 3. Contenido condicional según el estado de la consulta */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Calculando cobertura curricular y asignaciones...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso en el desplegable superior para auditar los módulos profesionales impartidos.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Módulo Profesional</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para inspeccionar la cobertura de sus Criterios de Evaluación.
            </p>
          </div>
        </Card>
      ) : filasCE.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-exclamation-circle text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">No hay Criterios de Evaluación registrados</h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              El módulo profesional seleccionado no dispone de Resultados de Aprendizaje (RA) ni Criterios de Evaluación (CE) dados de alta en el sistema.
            </p>
            <Button
              label="Gestionar Criterios en Mantenimiento"
              icon="pi pi-list-check"
              severity="secondary"
              size="small"
              onClick={() => navigate('/herramientas/mantenimiento/ce')}
            />
          </div>
        </Card>
      ) : (
        <>
          {/* 4. Tarjetas KPI y barra de cumplimiento */}
          <InformeCoberturaResumen
            estadisticas={estadisticas}
            modulo={moduloSeleccionado}
          />

          {/* 5. Tabla DataTable agrupada por Resultado de Aprendizaje */}
          <InformeCoberturaTabla
            filas={filasFiltradas}
            todasLasFilas={filasCE}
            cargando={cargando}
          />
        </>
      )}
    </div>
  );
};

export default InformeCoberturaCE;
