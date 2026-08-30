import React from "react";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import useInformeDiscente from "../hooks/useInformeDiscente.js";
import DiscentesLista from "../components/discentes/DiscentesLista.jsx";
import DiscenteDetalleCabecera from "../components/discentes/DiscenteDetalleCabecera.jsx";
import DiscenteModulosTabs from "../components/discentes/DiscenteModulosTabs.jsx";

// Componente de página principal para el módulo de Discentes e informe interactivo 360º
const DiscentesPagina = () => {
  const {
    listaDiscentes,
    discenteSeleccionadoId,
    cursoSeleccionadoId,
    historial,
    cargandoLista,
    cargandoHistorial,
    guardandoNotaId,
    error,
    seleccionarDiscente,
    limpiarSeleccion,
    cambiarCurso,
    guardarNota,
    cambiarEstadoDiscente,
    recargarLista,
    recargarHistorial,
  } = useInformeDiscente();

  return (
    <div className='page-container p-2'>
      {/* Cabecera y título principal de la vista */}
      <div className='flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-2'>
        <div>
          <h1 className='page-title m-0'>
            {discenteSeleccionadoId
              ? "Ficha e informe del discente"
              : "Expedientes de discentes"}
          </h1>
          <p className='text-muted m-0 mt-1 text-sm'>
            {discenteSeleccionadoId
              ? "Informe 360º del rendimiento académico, seguimiento por materias, desglose de calificaciones y evolución gráfica."
              : "Listado completo del alumnado con buscador integrado y acceso a la ficha integral interactiva."}
          </p>
        </div>
      </div>

      <Divider />

      {/* Alerta de error si ocurre algún fallo de comunicación */}
      {error && !historial && (
        <div className='mb-3'>
          <Message
            severity='warn'
            text={`Aviso de consulta: ${error}. Se suministran datos complementarios para continuar la navegación.`}
            className='w-full'
          />
        </div>
      )}

      {/* Vista condicional: Listado general de alumnos o Detalle 360º del discente */}
      {!discenteSeleccionadoId ? (
        <DiscentesLista
          discentes={listaDiscentes}
          cargando={cargandoLista}
          alSeleccionarDiscente={seleccionarDiscente}
          alCambiarEstado={cambiarEstadoDiscente}
          alRecargar={recargarLista}
        />
      ) : cargandoHistorial ? (
        <div className='flex flex-column gap-3'>
          {/* Skeleton para la cabecera de detalle */}
          <div className='surface-card p-4 border-round shadow-1'>
            <div className='flex justify-content-between align-items-center mb-3'>
              <Skeleton width='120px' height='2rem' />
              <Skeleton width='140px' height='2.5rem' />
            </div>
            <div className='flex align-items-center gap-3'>
              <Skeleton shape='circle' size='4.5rem' />
              <div className='flex-1'>
                <Skeleton width='250px' height='1.8rem' className='mb-2' />
                <Skeleton width='400px' height='1rem' />
              </div>
            </div>
          </div>

          {/* Skeleton para el selector de curso independiente */}
          <div className='surface-card p-3 border-round shadow-1'>
            <Skeleton width='100%' height='3rem' borderRadius='6px' />
          </div>

          {/* Skeleton para las tarjetas KPI */}
          <div className='grid'>
            <div className='col-12 sm:col-6 lg:col-3'>
              <Skeleton width='100%' height='100px' borderRadius='8px' />
            </div>
            <div className='col-12 sm:col-6 lg:col-3'>
              <Skeleton width='100%' height='100px' borderRadius='8px' />
            </div>
            <div className='col-12 sm:col-6 lg:col-3'>
              <Skeleton width='100%' height='100px' borderRadius='8px' />
            </div>
            <div className='col-12 sm:col-6 lg:col-3'>
              <Skeleton width='100%' height='100px' borderRadius='8px' />
            </div>
          </div>

          {/* Skeleton para el TabView con KPIs, gráficos y tabla */}
          <div className='surface-card p-4 border-round shadow-1'>
            <Skeleton width='300px' height='2.5rem' className='mb-3' />
            <div className='grid mb-3'>
              <div className='col-12 sm:col-6 lg:col-3'>
                <Skeleton width='100%' height='80px' borderRadius='8px' />
              </div>
              <div className='col-12 sm:col-6 lg:col-3'>
                <Skeleton width='100%' height='80px' borderRadius='8px' />
              </div>
              <div className='col-12 sm:col-6 lg:col-3'>
                <Skeleton width='100%' height='80px' borderRadius='8px' />
              </div>
              <div className='col-12 sm:col-6 lg:col-3'>
                <Skeleton width='100%' height='80px' borderRadius='8px' />
              </div>
            </div>
            <div className='grid mb-3'>
              <div className='col-12 lg:col-7'>
                <Skeleton width='100%' height='260px' borderRadius='8px' />
              </div>
              <div className='col-12 lg:col-5'>
                <Skeleton width='100%' height='260px' borderRadius='8px' />
              </div>
            </div>
            <Skeleton width='100%' height='220px' borderRadius='8px' />
          </div>
        </div>
      ) : historial ? (
        <div className='flex flex-column gap-4'>
          {/* 1. Cabecera con datos del discente, selector de curso y KPIs globales */}
          <DiscenteDetalleCabecera
            discente={historial.discente}
            cursoSeleccionado={historial.curso}
            cursosDisponibles={historial.cursosDisponibles}
            cursoSeleccionadoId={cursoSeleccionadoId}
            estadisticas={historial.estadisticasGlobales}
            alVolver={limpiarSeleccion}
            alCambiarCurso={cambiarCurso}
            alRecargar={recargarHistorial}
          />

          {/* 2. Navegación por módulos (TabView), métricas del módulo, gráficos específicos y evaluaciones con edición en celda */}
          <DiscenteModulosTabs
            modulos={historial.modulos}
            alGuardarNota={guardarNota}
            guardandoNotaId={guardandoNotaId}
          />
        </div>
      ) : (
        <div className='surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center'>
          <i className='pi pi-exclamation-circle text-4xl text-orange-500 mb-2' />
          <h3 className='text-lg font-bold m-0 mb-2 text-color'>
            No se encontró el historial del discente
          </h3>
          <p className='text-muted text-xs m-0 mb-3'>
            El identificador seleccionado no contiene datos registrados en el
            sistema.
          </p>
          <Button
            label='Volver al listado'
            icon='pi pi-arrow-left'
            size='small'
            onClick={limpiarSeleccion}
          />
        </div>
      )}
    </div>
  );
};

export default DiscentesPagina;
