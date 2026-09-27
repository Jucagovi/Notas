import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useFiltrosRadar from '../../hooks/useFiltrosRadar.js';
import useRadarCompetencias from '../../hooks/useRadarCompetencias.js';
import {
  FiltrosRadarCompetencias,
  GraficoRadarCompetencias,
  PanelMetricasRadar,
  TablaDesgloseRA
} from '../../components/radar/index.js';

/**
 * InformeCompetencia - Página orquestadora del Caso de Uso 12.5 (Mapa de Competencias Individual).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador según el patrón Contenedor-Presentacional,
 * coordinando los filtros jerárquicos (Año Académico -> Clase -> Discente) a través de useFiltrosRadar,
 * obteniendo el cruce relacional de notas por RA mediante useRadarCompetencias, y delegando
 * el renderizado visual en los subcomponentes presentacionales especializados tratando los cursos
 * conceptualmente como clases.
 */
const InformeCompetencia = () => {
  // 1. Hook para la gestión de filtros contextuales en cascada
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    clases,
    claseSeleccionadaId,
    setClaseSeleccionadaId,
    claseActiva,
    idCursoActivo,
    idModuloActivo,
    discentes,
    discenteSeleccionadoId,
    setDiscenteSeleccionadoId,
    discenteActivo,
    cargando: cargandoFiltros,
    recargar: recargarFiltros
  } = useFiltrosRadar();

  // 2. Hook para la obtención del rendimiento en Resultados de Aprendizaje
  const {
    ras,
    metricas,
    cargando: cargandoRadar,
    error: errorRadar,
    recargar: recargarRadar
  } = useRadarCompetencias(
    discenteSeleccionadoId,
    idModuloActivo,
    idCursoActivo
  );

  // Manejador consolidado para recargar todos los datos
  const manejarRecargar = async () => {
    await recargarFiltros();
    if (discenteSeleccionadoId && idModuloActivo) {
      await recargarRadar();
    }
  };

  return (
    <div className="p-3 md:p-4">
      {/* Cabecera institucional de la página */}
      <HeaderPagina
        titulo="Competencia Individual (Gráfico de Radar)"
        descripcion="Visualización del rendimiento competencial por Resultado de Aprendizaje para detectar fortalezas y debilidades en la clase."
      />

      {/* Barra de filtros contextuales en cascada */}
      <FiltrosRadarCompetencias
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={setAnioSeleccionado}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={setClaseSeleccionadaId}
        discentes={discentes}
        discenteId={discenteSeleccionadoId}
        onCambioDiscente={setDiscenteSeleccionadoId}
        cargando={cargandoFiltros}
        onRecargar={manejarRecargar}
      />

      {/* Gestión de estados vacíos y feedback interactivo */}
      {!anioSeleccionado ? (
        <EstadoVacio
          mensaje="Selecciona un año académico"
          descripcion="Escoge el año lectivo para cargar las clases disponibles."
          icono="pi pi-calendar"
        />
      ) : !claseSeleccionadaId ? (
        <EstadoVacio
          mensaje="Selecciona una clase"
          descripcion="Escoge una clase para cargar sus Resultados de Aprendizaje y el alumnado matriculado."
          icono="pi pi-building"
        />
      ) : !discenteSeleccionadoId ? (
        <EstadoVacio
          mensaje="Selecciona un discente"
          descripcion="Elige un alumno de la clase para generar su mapa de competencias en gráfico de radar."
          icono="pi pi-user"
        />
      ) : cargandoRadar ? (
        <div className="surface-card p-6 border-round-xl border-1 surface-border shadow-1 my-3">
          <CargadorSeccion texto="Calculando calificaciones por Resultado de Aprendizaje..." />
        </div>
      ) : errorRadar ? (
        <EstadoVacio
          mensaje="Error al calcular competencias"
          descripcion={errorRadar}
          icono="pi pi-exclamation-triangle"
        />
      ) : ras.length === 0 ? (
        <EstadoVacio
          mensaje="Sin Resultados de Aprendizaje"
          descripcion="No se encontraron Resultados de Aprendizaje registrados o evaluados para la clase seleccionada."
          icono="pi pi-compass"
        />
      ) : (
        <>
          {/* Panel de métricas e indicadores de rendimiento */}
          <PanelMetricasRadar
            metricas={metricas}
            discente={discenteActivo}
            clase={claseActiva}
          />

          {/* Gráfico de Radar de competencias individual */}
          <GraficoRadarCompetencias
            ras={ras}
            discente={discenteActivo}
            clase={claseActiva}
            cargando={cargandoRadar}
            altura="380px"
          />

          {/* Tabla de respaldo con el desglose numérico exacto de cada RA */}
          <TablaDesgloseRA
            ras={ras}
            cargando={cargandoRadar}
          />
        </>
      )}
    </div>
  );
};

export default InformeCompetencia;
