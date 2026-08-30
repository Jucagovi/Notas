import React from 'react';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import useCalificar from '../hooks/useCalificar.js';
import CalificarFiltros from '../components/calificar/CalificarFiltros.jsx';
import PracticasSelector from '../components/calificar/PracticasSelector.jsx';
import TablaCalificaciones from '../components/calificar/TablaCalificaciones.jsx';

// Componente principal para el módulo de calificación masiva de prácticas
const CalificarPagina = () => {
  const {
    cursos,
    modulosDisponibles,
    todasEvaluaciones,
    evaluacionesFiltradas,
    evaluacionSeleccionada,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    practicasEvaluacion,
    practicaSeleccionadaId,
    practicaSeleccionada,
    seleccionarPractica,
    discentesNotas,
    estadisticas,
    cargando,
    cargandoDiscentes,
    guardandoIds,
    erroresFilas,
    guardarNota,
    calificarMasivo,
    recargar
  } = useCalificar();

  return (
    <div className="page-container">
      {/* Cabecera principal del módulo de Calificar */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Calificar Prácticas</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Entrada de calificaciones rápida y tabular para los discentes en las prácticas asignadas a cada evaluación.
          </p>
        </div>
      </div>

      <Divider />

      {/* Barra superior de selección y filtros contextuales */}
      <CalificarFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        evaluacionesFiltradas={evaluacionesFiltradas}
        todasEvaluaciones={todasEvaluaciones}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        evaluacionSeleccionadaId={evaluacionSeleccionadaId}
        seleccionarEvaluacion={seleccionarEvaluacion}
        evaluacionSeleccionada={evaluacionSeleccionada}
        practicasEvaluacion={practicasEvaluacion}
        cargando={cargando}
        recargar={recargar}
      />

      {/* Contenido principal según el estado de selección */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Cargando datos del periodo de evaluación...</span>
        </div>
      ) : !evaluacionSeleccionadaId ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <i className="pi pi-pencil text-6xl text-primary mb-3" />
          <h3 className="text-xl font-bold m-0 mb-2">Seleccione una Evaluación</h3>
          <p className="text-muted text-sm m-0 max-w-28rem mb-3">
            Elija el curso académico, módulo y convocatoria evaluativa en los filtros superiores para desplegar las prácticas y calificar a los alumnos.
          </p>
        </div>
      ) : (
        <div className="flex flex-column gap-3">
          {/* Selector interactivo de prácticas de la evaluación */}
          <PracticasSelector
            practicas={practicasEvaluacion}
            practicaSeleccionadaId={practicaSeleccionadaId}
            alSeleccionarPractica={seleccionarPractica}
            cargando={cargando}
          />

          {/* Tabla de calificaciones cuando hay una práctica activa seleccionada */}
          {practicaSeleccionadaId ? (
            <TablaCalificaciones
              discentes={discentesNotas}
              practica={practicaSeleccionada}
              estadisticas={estadisticas}
              guardandoIds={guardandoIds}
              erroresFilas={erroresFilas}
              alGuardarNota={guardarNota}
              alCalificarMasivo={calificarMasivo}
              cargando={cargandoDiscentes}
            />
          ) : (
            practicasEvaluacion.length > 0 && (
              <div className="surface-card p-5 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
                <i className="pi pi-file-edit text-4xl text-primary mb-2" />
                <h4 className="text-base font-bold m-0 mb-1">Seleccione una práctica</h4>
                <p className="text-muted text-xs m-0">
                  Haga clic en una de las prácticas mostradas arriba para cargar la lista de discentes y asentar notas.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CalificarPagina;
