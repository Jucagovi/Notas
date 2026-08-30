import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import useInformePendientes from '../../hooks/useInformePendientes.js';
import InformePendientesFiltros from '../../components/informes/InformePendientesFiltros.jsx';
import InformePendientesTabla from '../../components/informes/InformePendientesTabla.jsx';

// Página principal del informe de control de calificaciones pendientes
const InformePendientes = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    evaluacionesDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    moduloSeleccionado,
    evaluacionSeleccionadaId,
    setEvaluacionSeleccionadaId,
    evaluacionSeleccionada,
    listaPendientes,
    totalPendientesOriginal,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    cargandoModulos,
    cargandoEvaluaciones,
    exportandoPDF,
    error,
    recargar,
    irACalificar,
    descargarPDF
  } = useInformePendientes();

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Control de Calificaciones Pendientes</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Detección de discentes con prácticas sin calificar en convocatorias evaluativas para prevenir el cierre de actas con notas vacías.
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
            tooltip="Ir al módulo de calificación de prácticas"
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
            disabled={cargando || !evaluacionSeleccionadaId}
          />
        </div>
      </div>

      <Divider />

      {/* 2. Filtros contextuales en cascada: Curso -> Módulo -> Evaluación */}
      <InformePendientesFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        evaluacionesDisponibles={evaluacionesDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        evaluacionSeleccionadaId={evaluacionSeleccionadaId}
        setEvaluacionSeleccionadaId={setEvaluacionSeleccionadaId}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        totalPendientes={totalPendientesOriginal}
        totalFiltrados={listaPendientes.length}
        cargando={cargando}
        cargandoModulos={cargandoModulos}
        cargandoEvaluaciones={cargandoEvaluaciones}
        exportandoPDF={exportandoPDF}
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
          <span className="text-muted text-sm mt-3">Consultando actas y calificaciones en Supabase...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso académico en el desplegable superior para comenzar la auditoría de calificaciones.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Módulo Profesional</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para inspeccionar sus convocatorias evaluativas.
            </p>
          </div>
        </Card>
      ) : !evaluacionSeleccionadaId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-clock text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione una Evaluación</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija la evaluación o convocatoria de la que desea verificar las notas pendientes de los discentes.
            </p>
          </div>
        </Card>
      ) : totalPendientesOriginal === 0 ? (
        /* 4. Mensaje de Éxito requerido cuando no hay notas pendientes */
        <div className="flex flex-column gap-3">
          <div className="surface-card p-6 border-round shadow-1 text-center border-1 surface-border">
            <div className="flex flex-column align-items-center justify-content-center gap-3">
              <div
                className="flex align-items-center justify-content-center border-round-circle"
                style={{ width: '4.5rem', height: '4.5rem', backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
              >
                <i className="pi pi-check-circle text-green-600 text-4xl" />
              </div>

              <Message
                severity="success"
                text="¡Todo al día! No hay calificaciones pendientes para esta evaluación."
                className="w-full text-base font-bold shadow-1"
                style={{ padding: '1rem' }}
              />

              <p className="text-muted text-sm max-w-30rem m-0 mt-2">
                Todos los discentes matriculados en{' '}
                <span className="font-semibold text-color">
                  {moduloSeleccionado?.nombre || 'el módulo'}
                </span>{' '}
                cuentan con nota registrada en las prácticas asignadas a{' '}
                <span className="font-semibold text-color">
                  {evaluacionSeleccionada?.nombre || 'esta evaluación'}
                </span>. Las actas están listas para su emisión.
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  label="Ver Calificaciones en Calificar"
                  icon="pi pi-pencil"
                  size="small"
                  severity="secondary"
                  outlined
                  onClick={() =>
                    navigate('/calificar', {
                      state: {
                        idCurso: cursoSeleccionadoId,
                        idModulo: moduloSeleccionadoId,
                        idEvaluacion: evaluacionSeleccionadaId
                      }
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 5. Tabla DataTable con calificaciones pendientes */
        <div className="flex flex-column gap-3">
          <InformePendientesTabla
            filas={listaPendientes}
            cargando={cargando}
            alCalificar={irACalificar}
          />
        </div>
      )}
    </div>
  );
};

export default InformePendientes;
