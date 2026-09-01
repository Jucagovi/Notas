import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import usePesosEvaluacion from '../hooks/usePesosEvaluacion.js';
import PesosRAFiltros from '../components/pesosra/PesosRAFiltros.jsx';
import PesosRAResumen from '../components/pesosra/PesosRAResumen.jsx';
import PesosRATreeTabla from '../components/pesosra/PesosRATreeTabla.jsx';

// Página principal para la configuración de pesos y ponderación pedagógica de RA y CE por curso académico
const PesosRAPagina = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionado,
    arbolPesos,
    listaRA,
    listaCE,
    pesosRA,
    pesosCE,
    actualizarPesoRA,
    actualizarPesoCE,
    repartirEquitativamenteRA,
    repartirEquitativamenteCE,
    repartirEquitativamenteTodosCE,
    restablecerValores,
    guardarPonderacion,
    sumaTotalPesosRA,
    esSumaRABalanceada,
    estadoPorRA,
    rasConInconsistencias,
    esValidoGlobal,
    hayCambiosSinGuardar,
    cargando,
    cargandoArbol,
    guardando,
    recargar
  } = usePesosEvaluacion();

  return (
    <div className="page-container">
      {/* Cabecera principal con título descriptivo y acceso directo a la asignación de CE */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Ponderación de Resultados y Criterios (RA y CE)</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Defina el peso ponderado de cada Resultado de Aprendizaje en el módulo y la contribución porcentual de cada Criterio de Evaluación para el curso académico.
          </p>
        </div>

        <div className="flex align-items-center gap-2">
          {moduloSeleccionado && (
            <Tag
              severity={esValidoGlobal ? 'success' : 'danger'}
              icon={esValidoGlobal ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
              value={`Total RA: ${sumaTotalPesosRA}%`}
              className="text-sm px-3 py-2 font-bold"
            />
          )}

          <Button
            type="button"
            label="Asignar a Prácticas"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="small"
            severity="secondary"
            outlined
            onClick={() => navigate('/criterios')}
            tooltip="Ir a la pantalla de asignación de criterios a prácticas"
          />
        </div>
      </div>

      <Divider />

      {/* Selectores superiores de Curso Académico y Módulo Profesional */}
      <PesosRAFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        cursoSeleccionado={cursoSeleccionado}
        moduloSeleccionado={moduloSeleccionado}
        totalRA={listaRA.length}
        totalCE={listaCE.length}
        cargando={cargando}
        recargar={recargar}
      />

      {/* Contenido principal según el estado de selección */}
      {!moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">
              Seleccione un Módulo Profesional
            </h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un módulo profesional en el selector superior para visualizar y configurar la ponderación de sus Resultados de Aprendizaje y Criterios de Evaluación.
            </p>
          </div>
        </Card>
      ) : cargandoArbol ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-spin pi-spinner text-5xl text-primary" />
            <span className="text-muted font-semibold">
              Cargando estructura de RA, CE y ponderaciones guardadas...
            </span>
          </div>
        </Card>
      ) : listaRA.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-exclamation-triangle text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">
              No se han encontrado Resultados de Aprendizaje
            </h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              Este módulo profesional aún no tiene registrados Resultados de Aprendizaje (RA) en el sistema. Debe crearlos previamente en el panel de mantenimiento.
            </p>
            <Button
              label="Gestionar RA en Mantenimiento"
              icon="pi pi-plus"
              severity="primary"
              size="small"
              onClick={() => navigate('/herramientas/mantenimiento/ra')}
            />
          </div>
        </Card>
      ) : (
        <>
          {/* Panel de validación y barra de herramientas con feedback visual */}
          <PesosRAResumen
            sumaTotalPesosRA={sumaTotalPesosRA}
            esSumaRABalanceada={esSumaRABalanceada}
            rasConInconsistencias={rasConInconsistencias}
            esValidoGlobal={esValidoGlobal}
            hayCambiosSinGuardar={hayCambiosSinGuardar}
            guardando={guardando}
            repartirEquitativamenteRA={repartirEquitativamenteRA}
            repartirEquitativamenteTodosCE={repartirEquitativamenteTodosCE}
            repartirEquitativamenteCE={repartirEquitativamenteCE}
            restablecerValores={restablecerValores}
            guardarPonderacion={guardarPonderacion}
          />

          {/* Editor jerárquico con TreeTable de PrimeReact */}
          <PesosRATreeTabla
            arbolPesos={arbolPesos}
            pesosRA={pesosRA}
            pesosCE={pesosCE}
            estadoPorRA={estadoPorRA}
            actualizarPesoRA={actualizarPesoRA}
            actualizarPesoCE={actualizarPesoCE}
            repartirEquitativamenteCE={repartirEquitativamenteCE}
          />

          {/* Tarjeta pedagógica informativa con las directrices del modelo de evaluación */}
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 mt-3">
            <div className="flex align-items-start gap-2">
              <i className="pi pi-info-circle text-primary text-xl mt-1" />
              <div className="text-sm">
                <span className="font-bold block text-color mb-1">
                  Directrices pedagógicas de ponderación:
                </span>
                <ul className="m-0 pl-3 text-muted flex flex-column gap-1">
                  <li>
                    <strong>Nivel 1 (Resultados de Aprendizaje):</strong> La suma de los porcentajes de todos los RA debe equivaler exactamente al <strong>100%</strong> de la nota del módulo.
                  </li>
                  <li>
                    <strong>Nivel 2 (Criterios de Evaluación):</strong> Los Criterios de Evaluación asignados a cada RA deben sumar el <strong>100%</strong> de dicho Resultado de Aprendizaje.
                  </li>
                  <li>
                    <strong>Persistencia:</strong> Al pulsar <em>Guardar Ponderación</em>, los pesos se almacenan vinculados al curso académico seleccionado en las tablas <code>ra_curso</code> y <code>ce_curso</code>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PesosRAPagina;
