import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformeDificultad from '../../hooks/useInformeDificultad.js';
import InformeDificultadFiltros from '../../components/informes/InformeDificultadFiltros.jsx';
import InformeDificultadResumen from '../../components/informes/InformeDificultadResumen.jsx';
import InformeDificultadGrafico from '../../components/informes/InformeDificultadGrafico.jsx';

// Página principal del informe de análisis de dificultad de prácticas
const InformeDificultad = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    practicasDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    practicaSeleccionadaId,
    setPracticaSeleccionadaId,
    practicaSeleccionada,
    notasBrutas,
    estadisticas,
    distribucionRangos,
    datosGrafico,
    opcionesGrafico,
    chartRef,
    cargando,
    cargandoModulos,
    cargandoPracticas,
    exportandoPDF,
    error,
    recargar,
    descargarPDF
  } = useInformeDificultad();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Análisis de Dificultad de Prácticas</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Distribución de calificaciones, tasa de aprobados e histograma de frecuencias para evaluar la dificultad pedagógica de cada práctica.
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
            tooltip="Ir al módulo de calificación"
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
            disabled={!practicaSeleccionadaId || cargando || estadisticas.totalEvaluados === 0}
          />
        </div>
      </div>

      <Divider />

      {/* 2. Filtros contextuales en cascada: Curso -> Módulo -> Práctica */}
      <InformeDificultadFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        practicasDisponibles={practicasDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        practicaSeleccionadaId={practicaSeleccionadaId}
        setPracticaSeleccionadaId={setPracticaSeleccionadaId}
        cargando={cargando}
        cargandoModulos={cargandoModulos}
        cargandoPracticas={cargandoPracticas}
        exportandoPDF={exportandoPDF}
        totalNotas={notasBrutas.length}
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
          <span className="text-muted text-sm mt-3">Calculando distribución de notas e histograma...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso académico en el desplegable superior para iniciar el análisis pedagógico.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Módulo Profesional</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para ver el catálogo de prácticas impartidas.
            </p>
          </div>
        </Card>
      ) : !practicaSeleccionadaId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-chart-bar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione una Práctica</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione la práctica de la que desea analizar la dificultad y el histograma de calificaciones.
            </p>
          </div>
        </Card>
      ) : estadisticas.totalEvaluados === 0 ? (
        /* Tarjeta informativa cuando la práctica aún no tiene calificaciones entregadas */
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-exclamation-circle text-6xl text-orange-400" />
            <h3 className="text-xl font-bold text-color m-0">Sin calificaciones registradas</h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              La práctica <span className="font-semibold text-color">{practicaSeleccionada?.nombre || 'seleccionada'}</span> aún no cuenta con notas entregadas en la tabla de evaluación.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                label="Ir a Calificar Práctica"
                icon="pi pi-pencil"
                size="small"
                severity="primary"
                onClick={() =>
                  navigate('/calificar', {
                    state: {
                      idCurso: cursoSeleccionadoId,
                      idModulo: moduloSeleccionadoId,
                      idPractica: practicaSeleccionadaId
                    }
                  })
                }
              />
            </div>
          </div>
        </Card>
      ) : (
        /* Visualización completa del informe con resumen de 3 tarjetas y gráfico */
        <div className="flex flex-column gap-3">
          {/* 4. Panel de Resumen (Grid superior con 3 Cards) */}
          <InformeDificultadResumen
            estadisticas={estadisticas}
            practica={practicaSeleccionada}
          />

          {/* 5. Visualización Central: Gráfico Histogram Chart y tabla de frecuencias */}
          <InformeDificultadGrafico
            datosGrafico={datosGrafico}
            opcionesGrafico={opcionesGrafico}
            distribucionRangos={distribucionRangos}
            estadisticas={estadisticas}
            practica={practicaSeleccionada}
            chartRef={chartRef}
          />
        </div>
      )}
    </div>
  );
};

export default InformeDificultad;
