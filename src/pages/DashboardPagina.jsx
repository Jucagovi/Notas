import React from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import useDashboard from "../hooks/useDashboard.js";
import HeaderPagina from "../components/common/HeaderPagina.jsx";
import SelectorCurso from "../components/common/SelectorCurso.jsx";
import CargadorSeccion from "../components/common/CargadorSeccion.jsx";
import {
  WidgetAgendaHoy,
  WidgetMapaTactico,
  WidgetRadarCobertura,
  WidgetDetectorSobrecarga,
  WidgetAlertas,
  WidgetProgresoCurricular,
  WidgetAccesosRapidos,
  TarjetaKpiPendientes,
} from "../components/dashboard/index.js";

/**
 * DashboardPagina - Página contenedora y orquestadora del Centro de Mando Analítico del Docente.
 *
 * Responsabilidad Única: Actuar como orquestador de datos consumiendo el Custom Hook agregador
 * useDashboard y delegar el renderizado visual a los widgets presentacionales especializados
 * organizados en una cuadrícula responsiva PrimeFlex estilo bento box.
 */
const DashboardPagina = () => {
  const {
    cursos,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    modulos,
    moduloRadarId,
    setModuloRadarId,
    agendaHoy,
    mapaTactico,
    radarCobertura,
    detectorSobrecarga,
    alertas,
    progresoCurricular,
    conteoCalificacionesPendientes,
    cargando,
    error,
    recargar,
    fechaHoyStr,
  } = useDashboard();

  // Bloque de acciones en la cabecera de la página: selector de curso y botón de refresco.
  const accionesCabecera = (
    <div className='flex align-items-center gap-2 flex-wrap w-full md:w-auto'>
      <div className='w-14rem md:w-18rem'>
        <SelectorCurso
          value={cursoSeleccionadoId}
          options={cursos}
          onChange={(e) => setCursoSeleccionadoId(e.value)}
          placeholder='Seleccionar curso activo...'
          className='p-inputtext-sm w-full'
        />
      </div>
      <Button
        icon='pi pi-refresh'
        onClick={recargar}
        loading={cargando}
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
        descripcion='Panel de control estratégico: agenda operativa, mapa táctico, balance de carga y auditoría legal.'
        acciones={accionesCabecera}
      />

      {/* Notificación en caso de error en la sincronización */}
      {error && (
        <Message
          severity='error'
          text={error}
          className='w-full justify-content-start'
        />
      )}

      {/* Renderizado condicional durante el estado de carga */}
      {cargando ? (
        <div className='flex flex-column gap-3'>
          <CargadorSeccion cargando={true} tipo='tarjetas' columnas={3} />
          <CargadorSeccion cargando={true} tipo='tarjetas' columnas={2} />
        </div>
      ) : (
        /* Cuadrícula responsiva estilo bento box con PrimeFlex */
        <div className='grid'>
          {/* Fila 1: Operativa diaria, mapa táctico y alertas inmediatas */}
          <div className='col-12 lg:col-4'>
            {/* <WidgetAgendaHoy agenda={agendaHoy} fechaHoy={fechaHoyStr} /> */}
          </div>

          <div className='col-12 md:col-6 lg:col-4'>
            {/* <WidgetMapaTactico modulosTacticos={mapaTactico} /> */}
          </div>

          <div className='col-12 md:col-6 lg:col-4 flex flex-column gap-3'>
            {/* <TarjetaKpiPendientes
              conteo={conteoCalificacionesPendientes}
              cargando={cargando}
            /> */}
            {/* <WidgetAlertas alertas={alertas} /> */}
          </div>

          {/* Fila 2: Auditoría legal (radar) y barras de progreso curricular */}
          <div className='col-12 lg:col-6'>
            {/* <WidgetRadarCobertura
              radarData={radarCobertura}
              modulos={modulos}
              moduloSeleccionadoId={moduloRadarId}
              onCambiarModulo={setModuloRadarId}
            /> */}
          </div>

          <div className='col-12 lg:col-6'>
            {/* <WidgetProgresoCurricular progresoModulos={progresoCurricular} /> */}
          </div>

          {/* Fila 3: Balanceador predictivo de sobrecarga y accesos directos */}
          <div className='col-12 lg:col-7'>
            {/* <WidgetDetectorSobrecarga detector={detectorSobrecarga} /> */}
          </div>

          <div className='col-12 lg:col-5'>
            {/* <WidgetAccesosRapidos /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPagina;
