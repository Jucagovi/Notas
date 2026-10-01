import React from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import useDashboard from "../hooks/useDashboard.js";
import useModulos from "../hooks/useModulos.js";
import useMonitorCurricular from "../hooks/useMonitorCurricular.js";
import HeaderPagina from "../components/common/HeaderPagina.jsx";
import CargadorSeccion from "../components/common/CargadorSeccion.jsx";
import WidgetAgendaHoy from "../components/dashboard/WidgetAgendaHoy.jsx";
import WidgetAgendaEscolar from "../components/dashboard/WidgetAgendaEscolar.jsx";
import WidgetTermometroCurricular from "../components/dashboard/WidgetTermometroCurricular.jsx";
import WidgetAccesosRapidos from "../components/dashboard/WidgetAccesosRapidos.jsx";

/**
 * DashboardPagina - Página contenedora y orquestadora del Panel de Control.
 *
 * Responsabilidad Única: Actuar como orquestador consumiendo los Custom Hooks
 * optimizados (useDashboard, useModulos y useMonitorCurricular) y estructurar la vista
 * integrando la agenda operativa, el termómetro curricular de desviaciones y los accesos rápidos.
 */
const DashboardPagina = () => {
  // Catálogo de módulos profesionales para enriquecer la agenda diaria.
  const { datos: datosModulos } = useModulos();

  // Custom Hook para la agenda diaria operativa del docente.
  const {
    agendaHoy,
    cargando: cargandoDashboard,
    error: errorDashboard,
    recargar: recargarDashboard,
    fechaHoyStr,
  } = useDashboard(datosModulos);

  // Custom Hook para el monitor de desviación curricular (Caso de Uso 24).
  const {
    modulosMonitor,
    cargando: cargandoMonitor,
    recargar: recargarMonitor
  } = useMonitorCurricular();

  // Recarga manual de los datos del panel de control.
  const manejarRecargar = async () => {
    await Promise.all([recargarDashboard(), recargarMonitor()]);
  };

  // Bloque de acciones en la cabecera de la página con botón de refresco.
  const accionesCabecera = (
    <div className='flex align-items-center gap-2'>
      <Button
        icon='pi pi-refresh'
        onClick={manejarRecargar}
        loading={cargandoDashboard || cargandoMonitor}
        rounded
        text
        severity='secondary'
        tooltip='Actualizar datos'
        tooltipOptions={{ position: "bottom" }}
        aria-label='Actualizar datos del panel'
      />
    </div>
  );

  return (
    <div className='flex flex-column w-full gap-3'>
      {/* Cabecera estándar de la página */}
      <HeaderPagina
        titulo='Centro de Mando Analítico'
        descripcion='Panel de control estratégico: agenda operativa diaria, planificación escolar semanal de todas las clases y accesos rápidos.'
        acciones={accionesCabecera}
      />

      {/* Notificación en caso de error en la sincronización */}
      {errorDashboard && (
        <Message
          severity='error'
          text={errorDashboard}
          className='w-full justify-content-start'
        />
      )}

      {/* Renderizado condicional durante el estado de carga inicial */}
      {cargandoDashboard && cargandoMonitor ? (
        <div className='flex flex-column gap-3'>
          <CargadorSeccion cargando={true} tipo='tarjetas' columnas={2} />
        </div>
      ) : (
        <div className='flex flex-column gap-3 w-full'>
          {/* Fila 1: Dos columnas con los anchos establecidos (Agenda de Hoy a la izquierda y Agenda Escolar a la derecha) */}
          <div className='grid'>
            {/* Columna 1: Agenda de Hoy alineada a la izquierda */}
            <div className='col-12 md:col-5 lg:col-4 xl:col-4'>
              <WidgetAgendaHoy agenda={agendaHoy} fechaHoy={fechaHoyStr} />
            </div>

            {/* Columna 2: Agenda Escolar interactiva con FullCalendar mostrando la semana */}
            <div className='col-12 md:col-7 lg:col-8 xl:col-8'>
              <WidgetAgendaEscolar />
            </div>
          </div>

          {/* Fila 2: Termómetro Curricular para monitorizar desviaciones de unidades (Caso de Uso 24) */}
          <div className='w-full'>
            <WidgetTermometroCurricular
              modulos={modulosMonitor}
              cargando={cargandoMonitor}
            />
          </div>

          {/* Fila 3: Widget Accesos Rápidos mostrando todas las tarjetas en una sola línea */}
          <div className='w-full'>
            <WidgetAccesosRapidos />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPagina;
