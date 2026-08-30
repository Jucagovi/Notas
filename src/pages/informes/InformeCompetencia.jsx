import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformeCompetencias from '../../hooks/useInformeCompetencias.js';
import InformeCompetenciaFiltros from '../../components/informes/InformeCompetenciaFiltros.jsx';
import InformeCompetenciaResumen from '../../components/informes/InformeCompetenciaResumen.jsx';
import InformeCompetenciaGrafico from '../../components/informes/InformeCompetenciaGrafico.jsx';
import InformeCompetenciaTabla from '../../components/informes/InformeCompetenciaTabla.jsx';

// Página principal para el informe de mapa competencial individual en gráfico de radar
const InformeCompetencia = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    discentesDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    discenteSeleccionadoId,
    setDiscenteSeleccionadoId,
    discenteSeleccionado,
    listaRA,
    estadisticas,
    datosGraficoRadar,
    opcionesGraficoRadar,
    chartRef,
    cargando,
    cargandoModulos,
    cargandoDiscentes,
    exportandoPDF,
    error,
    recargar,
    descargarPDF
  } = useInformeCompetencias();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Mapa de Competencias Individual (Radar)</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Visualización del rendimiento competencial de un discente mediante gráfico de radar para identificar fortalezas y áreas de mejora por Resultados de Aprendizaje.
          </p>
        </div>

        <div className="flex align-items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            label="Calificar Prácticas"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            outlined
            className="white-space-nowrap px-3"
            style={{ minWidth: '170px' }}
            onClick={() => navigate('/calificar')}
            tooltip="Ir al módulo de calificaciones"
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
            disabled={!discenteSeleccionadoId || cargando || listaRA.length === 0}
          />
        </div>
      </div>

      <Divider />

      {/* 2. Filtros contextuales en cascada: Curso -> Módulo -> Discente */}
      <InformeCompetenciaFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        discentesDisponibles={discentesDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        discenteSeleccionadoId={discenteSeleccionadoId}
        setDiscenteSeleccionadoId={setDiscenteSeleccionadoId}
        cargando={cargando}
        cargandoModulos={cargandoModulos}
        cargandoDiscentes={cargandoDiscentes}
        exportandoPDF={exportandoPDF}
        totalRA={listaRA.length}
        recargar={recargar}
        descargarPDF={descargarPDF}
      />

      {/* Mensaje de error si la consulta falló */}
      {error && (
        <Message
          severity="error"
          text={`Error al consultar la base de datos: ${error}`}
          className="w-full mb-3"
        />
      )}

      {/* 3. Contenido condicional según el estado de selección */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Calculando notas ponderadas de Resultados de Aprendizaje y Criterios...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso académico en el desplegable superior para iniciar el análisis competencial.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Módulo Profesional</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para cargar el catálogo de discentes matriculados y sus Resultados de Aprendizaje.
            </p>
          </div>
        </Card>
      ) : !discenteSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-user text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Discente</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el alumno cuyo perfil competencial y gráfico de radar desea visualizar.
            </p>
          </div>
        </Card>
      ) : listaRA.length === 0 ? (
        /* Tarjeta informativa cuando el módulo no tiene Resultados de Aprendizaje configurados */
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-exclamation-circle text-6xl text-orange-400" />
            <h3 className="text-xl font-bold text-color m-0">Sin Resultados de Aprendizaje configurados</h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              El módulo <span className="font-semibold text-color">{moduloSeleccionado?.nombre || 'seleccionado'}</span> no cuenta con Resultados de Aprendizaje (RA) dados de alta en el sistema.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                label="Gestionar Criterios y RA"
                icon="pi pi-check-square"
                size="small"
                severity="primary"
                onClick={() => navigate('/criterios')}
              />
            </div>
          </div>
        </Card>
      ) : (
        /* Visualización completa del informe con resumen de 4 tarjetas, gráfico Radar y Tabla de Respaldo */
        <div className="flex flex-column gap-3">
          {/* 4. Panel de Resumen (Grid superior con 4 Cards de KPI) */}
          <InformeCompetenciaResumen
            estadisticas={estadisticas}
            discente={discenteSeleccionado}
            modulo={moduloSeleccionado}
          />

          {/* 5. Gráfico de Radar competencial */}
          <InformeCompetenciaGrafico
            datosGraficoRadar={datosGraficoRadar}
            opcionesGraficoRadar={opcionesGraficoRadar}
            listaRA={listaRA}
            estadisticas={estadisticas}
            discente={discenteSeleccionado}
            modulo={moduloSeleccionado}
            chartRef={chartRef}
          />

          {/* 6. Tabla de Respaldo con desglose numérico exacto de cada RA y sus CE */}
          <InformeCompetenciaTabla
            listaRA={listaRA}
            cargando={cargando}
          />
        </div>
      )}
    </div>
  );
};

export default InformeCompetencia;
