import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import useCriterios from '../hooks/useCriterios.js';
import CriteriosFiltros from '../components/criterios/CriteriosFiltros.jsx';
import CriteriosTreeTabla from '../components/criterios/CriteriosTreeTabla.jsx';
import CriteriosResumen from '../components/criterios/CriteriosResumen.jsx';

// Página principal para el mapeo de prácticas a Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE)
const CriteriosPagina = () => {
  const navigate = useNavigate();

  const {
    cursos,
    modulosDisponibles,
    practicasDisponibles,
    practicaSeleccionada,
    practicaSeleccionadaId,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    seleccionarPractica,
    arbolCriterios,
    seleccionesCE,
    cargando,
    cargandoPracticas,
    guardando,
    hayCambiosSinGuardar,
    estadisticas,
    alternarSeleccionRA,
    alternarSeleccionCE,
    actualizarPorcentajeCE,
    marcarTodosLosCriterios,
    desmarcarTodosLosCriterios,
    restablecerSelecciones,
    guardarAsignaciones,
    recargar
  } = useCriterios();

  return (
    <div className="page-container">
      {/* Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Asignación de Criterios de Evaluación</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Mapeo jerárquico de Prácticas a Criterios de Evaluación (CE) y Resultados de Aprendizaje (RA) con definición de porcentajes de cobertura.
          </p>
        </div>

        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            label="Ir a Asignación de Pesos"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="small"
            severity="secondary"
            outlined
            onClick={() => navigate('/pesos')}
            tooltip="Configurar el peso porcentual de cada práctica en las evaluaciones"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      <Divider />

      {/* Selector principal de práctica y filtros de módulo y curso */}
      <CriteriosFiltros
        cursos={cursos}
        modulosDisponibles={modulosDisponibles}
        practicasDisponibles={practicasDisponibles}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        moduloSeleccionadoId={moduloSeleccionadoId}
        setModuloSeleccionadoId={setModuloSeleccionadoId}
        practicaSeleccionadaId={practicaSeleccionadaId}
        seleccionarPractica={seleccionarPractica}
        practicaSeleccionada={practicaSeleccionada}
        totalCEs={estadisticas.totalCEs}
        totalSeleccionados={estadisticas.totalSeleccionados}
        marcarTodosLosCriterios={marcarTodosLosCriterios}
        desmarcarTodosLosCriterios={desmarcarTodosLosCriterios}
        restablecerSelecciones={restablecerSelecciones}
        hayCambiosSinGuardar={hayCambiosSinGuardar}
        cargando={cargando}
        cargandoPracticas={cargandoPracticas}
        recargar={recargar}
      />

      {/* Contenido principal según el estado de selección */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Cargando datos y árbol de criterios...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">
              Seleccione un Curso Académico
            </h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso en el desplegable superior para cargar los módulos profesionales que se imparten en dicho curso.
            </p>
          </div>
        </Card>
      ) : !moduloSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-book text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">
              Seleccione un Módulo Profesional
            </h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Seleccione el módulo profesional para visualizar las prácticas asignadas a sus periodos de evaluación.
            </p>
          </div>
        </Card>
      ) : practicasDisponibles.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-file-excel text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">
              No hay prácticas asignadas a evaluaciones en este módulo
            </h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              Para poder mapear criterios de evaluación, primero debe asignar las prácticas a alguna evaluación de este curso y módulo.
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
      ) : !practicaSeleccionadaId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-file-edit text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">
              Seleccione una Práctica a Mapear
            </h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija una de las prácticas asignadas para definir qué Criterios de Evaluación y Resultados de Aprendizaje cubre.
            </p>
          </div>
        </Card>
      ) : arbolCriterios.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-exclamation-circle text-6xl text-warning" />
            <h3 className="text-xl font-bold text-color m-0">
              No hay Criterios de Evaluación configurados
            </h3>
            <p className="text-muted text-sm max-w-30rem m-0">
              El módulo profesional asociado a esta práctica no dispone de Resultados de Aprendizaje (RA) ni Criterios de Evaluación (CE) registrados en el sistema.
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
          {/* Tabla Jerárquica con PrimeReact TreeTable */}
          <CriteriosTreeTabla
            arbolCriterios={arbolCriterios}
            seleccionesCE={seleccionesCE}
            alternarSeleccionRA={alternarSeleccionRA}
            alternarSeleccionCE={alternarSeleccionCE}
            actualizarPorcentajeCE={actualizarPorcentajeCE}
          />

          {/* Barra inferior de resumen y botón Guardar peso */}
          <CriteriosResumen
            practicaSeleccionada={practicaSeleccionada}
            estadisticas={estadisticas}
            hayCambiosSinGuardar={hayCambiosSinGuardar}
            guardando={guardando}
            guardarAsignaciones={guardarAsignaciones}
          />
        </>
      )}
    </div>
  );
};

export default CriteriosPagina;
