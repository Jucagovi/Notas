import React, { useState } from 'react';
import { Message } from 'primereact/message';
import useDashboardStats from '../hooks/useDashboardStats.js';
import useAlertasTempranas from '../hooks/useAlertasTempranas.js';
import CabeceraPanel from '../components/dashboard/CabeceraPanel.jsx';
import TarjetasKpi from '../components/dashboard/TarjetasKpi.jsx';
import GraficoBarrasModulos from '../components/dashboard/GraficoBarrasModulos.jsx';
import GraficoDistribucionNotas from '../components/dashboard/GraficoDistribucionNotas.jsx';
import TablaAlumnosRiesgo from '../components/dashboard/TablaAlumnosRiesgo.jsx';
import EstadoCargaDashboard from '../components/dashboard/EstadoCargaDashboard.jsx';

// Componente principal de la página Panel de control que actúa como orquestador de datos y vistas.
const PanelControl = () => {
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);

  // Se obtienen las métricas estadísticas globales mediante el hook personalizado.
  const {
    cursos,
    totalDiscentes,
    totalCursos,
    totalModulos,
    notaMediaGlobal,
    tasaAprobados,
    totalAprobados,
    totalSuspensos,
    tieneCalificaciones,
    tieneDatos,
    datosGraficoModulos,
    datosGraficoDistribucion,
    cargando: cargandoStats,
    error: errorStats,
    recargar: recargarStats
  } = useDashboardStats(cursoSeleccionadoId);

  // Se obtienen las alertas tempranas de discentes en riesgo en el curso seleccionado.
  const {
    alertas,
    cargando: cargandoAlertas,
    error: errorAlertas,
    recargar: recargarAlertas
  } = useAlertasTempranas(cursoSeleccionadoId);

  // Función para refrescar manualmente todos los datos del panel.
  const manejarActualizar = () => {
    recargarStats();
    recargarAlertas();
  };

  const estaCargando = cargandoStats || cargandoAlertas;

  return (
    <div className="w-full flex flex-column gap-3">
      {/* 1. Cabecera con selector de curso y botón de actualización */}
      <CabeceraPanel
        cursos={cursos}
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCambiarCurso={setCursoSeleccionadoId}
        onActualizar={manejarActualizar}
        cargando={estaCargando}
      />

      {/* 2. Notificación en caso de error en la consulta */}
      {errorStats && (
        <Message
          severity="error"
          text={errorStats}
          className="w-full justify-content-start"
        />
      )}

      {/* 3. Renderizado condicional según estado de carga y disponibilidad de datos */}
      {estaCargando ? (
        <EstadoCargaDashboard />
      ) : !tieneDatos ? (
        <div className="mt-2">
          <Message
            severity="info"
            text="Aún no hay datos suficientes para mostrar estadísticas. Comienza configurando un curso y añadiendo calificaciones."
            className="w-full justify-content-start p-3"
          />
        </div>
      ) : (
        <>
          {/* Sección Superior: Tarjetas de indicadores clave (KPIs) */}
          <TarjetasKpi
            totalDiscentes={totalDiscentes}
            totalModulos={totalModulos}
            notaMediaGlobal={notaMediaGlobal}
            tasaAprobados={tasaAprobados}
            totalAprobados={totalAprobados}
            totalSuspensos={totalSuspensos}
          />

          {/* Sección Central: Gráficos de barras y doughnut */}
          <div className="grid mt-1">
            <div className="col-12 lg:col-7">
              <GraficoBarrasModulos datos={datosGraficoModulos} />
            </div>
            <div className="col-12 lg:col-5">
              <GraficoDistribucionNotas
                datos={datosGraficoDistribucion}
                tieneCalificaciones={tieneCalificaciones}
              />
            </div>
          </div>

          {/* Sección Inferior: Alertas tempranas de discentes en riesgo */}
          <div className="mt-2">
            <TablaAlumnosRiesgo
              alertas={alertas}
              cargando={cargandoAlertas}
              error={errorAlertas}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PanelControl;
