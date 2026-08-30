import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import usePesos from '../hooks/usePesos.js';
import PesosFiltros from '../components/pesos/PesosFiltros.jsx';
import PesosProgressBar from '../components/pesos/PesosProgressBar.jsx';
import PesosTabla from '../components/pesos/PesosTabla.jsx';

// Página principal para la asignación y balanceo porcentual de pesos de prácticas por evaluación
const PesosPagina = () => {
  const navigate = useNavigate();

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
    practicas,
    sumaTotalPesos,
    pesoRestante,
    estadoBalanceo,
    esGuardable,
    hayCambiosSinGuardar,
    cargando,
    cargandoPracticas,
    guardando,
    actualizarPeso,
    repartirEquitativamente,
    restablecerValores,
    guardarBalanceo,
    recargar
  } = usePesos();

  return (
    <div className="page-container">
      {/* Cabecera principal de la página con título estandarizado y acceso directo */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Asignación de Pesos de Evaluación</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Configure el peso porcentual de cada práctica sobre la calificación final de la evaluación garantizando una suma exacta del 100%.
          </p>
        </div>

        <div className="flex align-items-center gap-2">
          {evaluacionSeleccionada && (
            <Tag
              severity={estadoBalanceo === 'valido' ? 'success' : estadoBalanceo === 'excedido' ? 'danger' : 'warning'}
              icon={estadoBalanceo === 'valido' ? 'pi pi-check' : 'pi pi-info-circle'}
              value={`Total: ${sumaTotalPesos}%`}
              className="text-sm px-3 py-2 font-bold"
            />
          )}
          <Button
            type="button"
            label="Ir a Calificar"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="small"
            severity="secondary"
            outlined
            onClick={() => navigate('/calificar')}
            tooltip="Ir a la pantalla de calificación de prácticas"
          />
        </div>
      </div>

      <Divider />

      {/* Selectores superiores de filtro por Curso, Módulo y Evaluación */}
      <PesosFiltros
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
        totalPracticas={practicas.length}
        cargando={cargando}
        recargar={recargar}
      />

      {/* Contenido principal según el estado de selección */}
      {!evaluacionSeleccionadaId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar-plus text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">
              Seleccione una Evaluación
            </h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Utilice los desplegables superiores para seleccionar el curso académico, módulo y periodo de evaluación que desea ponderar.
            </p>
          </div>
        </Card>
      ) : cargandoPracticas ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-spin pi-spinner text-5xl text-primary" />
            <span className="text-muted font-semibold">
              Cargando prácticas y pesos de la evaluación...
            </span>
          </div>
        </Card>
      ) : practicas.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-file-excel text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">
              No hay prácticas vinculadas a esta evaluación
            </h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              Para poder asignar pesos, primero debe vincular las prácticas correspondientes a este periodo de evaluación.
            </p>
            <Button
              label="Ir a Asignación de Prácticas"
              icon="pi pi-file-edit"
              severity="primary"
              size="small"
              onClick={() => navigate('/practicas')}
            />
          </div>
        </Card>
      ) : (
        <>
          {/* Indicador visual grueso de progreso y estado del 100% */}
          <PesosProgressBar
            sumaTotalPesos={sumaTotalPesos}
            pesoRestante={pesoRestante}
            estadoBalanceo={estadoBalanceo}
            totalPracticas={practicas.length}
          />

          {/* Tabla de asignación de pesos de las prácticas con InputNumber */}
          <PesosTabla
            practicas={practicas}
            actualizarPeso={actualizarPeso}
            repartirEquitativamente={repartirEquitativamente}
            restablecerValores={restablecerValores}
            guardarBalanceo={guardarBalanceo}
            sumaTotalPesos={sumaTotalPesos}
            esGuardable={esGuardable}
            hayCambiosSinGuardar={hayCambiosSinGuardar}
            guardando={guardando}
            cargando={cargandoPracticas}
          />

          {/* Tarjeta informativa y reglas de ponderación */}
          <div className="surface-card p-3 border-round border-1 surface-border shadow-1 mt-3">
            <div className="flex align-items-start gap-2">
              <i className="pi pi-info-circle text-primary text-xl mt-1" />
              <div className="text-sm">
                <span className="font-bold block text-color mb-1">
                  Reglas de ponderación y persistencia:
                </span>
                <ul className="m-0 pl-3 text-muted flex flex-column gap-1">
                  <li>
                    El botón <strong>Guardar Balanceo</strong> se habilitará exclusivamente cuando la suma total de los pesos sea exactamente igual al <strong>100%</strong>.
                  </li>
                  <li>
                    Al guardar, los pesos configurados se aplicarán de forma masiva a todos los discentes evaluados en cada práctica correspondiente a este periodo.
                  </li>
                  <li>
                    Puede utilizar la función <strong>Repartir Equitativamente</strong> para calcular automáticamente una distribución homogénea que sume el 100%.
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

export default PesosPagina;
