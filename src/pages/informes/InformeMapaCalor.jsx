import React from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useFiltrosMapaCalor from '../../hooks/useFiltrosMapaCalor.js';
import useMapaCalor from '../../hooks/useMapaCalor.js';
import {
  FiltrosMapaCalor,
  PanelAlertasMapaCalor,
  LeyendaMapaCalor,
  TablaMapaCalor
} from '../../components/mapacalor/index.js';

/**
 * InformeMapaCalor - Página orquestadora del Caso de Uso 12.6 (Mapa de Calor Curricular).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador según el patrón Contenedor-Presentacional,
 * coordinando los filtros jerárquicos (Año Académico -> Clase) a través de useFiltrosMapaCalor,
 * obteniendo la matriz plana de Resultados de Aprendizaje mediante useMapaCalor,
 * y delegando el renderizado visual en los subcomponentes presentacionales especializados.
 */
const InformeMapaCalor = () => {
  // 1. Hook para la gestión de filtros contextuales (Año Académico y Clase).
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    clases,
    claseSeleccionadaId,
    setClaseSeleccionadaId,
    idCursoActivo,
    idModuloActivo,
    cargando: cargandoFiltros,
    recargar: recargarFiltros
  } = useFiltrosMapaCalor();

  // 2. Hook para el cruce matricial de calificaciones por Resultados de Aprendizaje.
  const {
    columnas,
    filas,
    resumenColumnas,
    metricasGlobales,
    cargando: cargandoMatriz,
    error: errorMatriz,
    recargar: recargarMatriz
  } = useMapaCalor(idCursoActivo, idModuloActivo);

  // Manejador consolidado para recargar todos los datos de la vista.
  const manejarRecargar = async () => {
    await recargarFiltros();
    if (idCursoActivo && idModuloActivo) {
      await recargarMatriz();
    }
  };

  return (
    <div className="p-3 md:p-4">
      {/* Cabecera institucional de la página */}
      <HeaderPagina
        titulo="Mapa de Calor Curricular (Puntos Ciegos)"
        descripcion="Matriz visual de alto contraste que cruza los discentes de la clase con los Resultados de Aprendizaje para detectar anomalías individuales y pedagógicas."
      />

      {/* Barra de filtros contextuales */}
      <FiltrosMapaCalor
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={setAnioSeleccionado}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={setClaseSeleccionadaId}
        cargando={cargandoFiltros || cargandoMatriz}
        onRecargar={manejarRecargar}
      />

      {/* Gestión reactiva de estados vacíos y feedback interactivo */}
      {!anioSeleccionado ? (
        <EstadoVacio
          mensaje="Selecciona un año académico"
          descripcion="Escoge el año lectivo para cargar las clases disponibles."
          icono="pi pi-calendar"
        />
      ) : !claseSeleccionadaId ? (
        <EstadoVacio
          mensaje="Selecciona una clase"
          descripcion="Escoge una clase para generar la matriz del mapa de calor curricular."
          icono="pi pi-building"
        />
      ) : cargandoMatriz ? (
        <div className="surface-card p-6 border-round-xl border-1 surface-border shadow-1 my-3">
          <CargadorSeccion texto="Generando matriz de alta densidad del mapa de calor..." />
        </div>
      ) : errorMatriz ? (
        <EstadoVacio
          mensaje="Error al generar el mapa de calor"
          descripcion={errorMatriz}
          icono="pi pi-exclamation-triangle"
        />
      ) : columnas.length === 0 ? (
        <EstadoVacio
          mensaje="Sin Resultados de Aprendizaje disponibles"
          descripcion="No se encontraron Resultados de Aprendizaje configurados para esta clase."
          icono="pi pi-info-circle"
        />
      ) : filas.length === 0 ? (
        <EstadoVacio
          mensaje="Sin discentes matriculados"
          descripcion="No constan discentes matriculados en la clase seleccionada."
          icono="pi pi-users"
        />
      ) : (
        <>
          {/* Panel de alertas analíticas rápidas: puntos ciegos y discentes en riesgo */}
          <PanelAlertasMapaCalor
            metricas={metricasGlobales}
            resumenColumnas={resumenColumnas}
            filas={filas}
          />

          {/* Leyenda de escala cromática y guía analítica horizontal/vertical */}
          <LeyendaMapaCalor />

          {/* Matriz tabular de alta densidad con celdas de calor y discentes congelados */}
          <TablaMapaCalor
            filas={filas}
            columnas={columnas}
            resumenColumnas={resumenColumnas}
            cargando={cargandoMatriz}
          />
        </>
      )}
    </div>
  );
};

export default InformeMapaCalor;
