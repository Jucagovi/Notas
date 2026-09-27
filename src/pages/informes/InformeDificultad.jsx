import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useInformeDificultad from '../../hooks/useInformeDificultad.js';
import {
  FiltrosDificultad,
  TarjetasPracticas,
  PanelResumenDificultad,
  HistogramaDificultad,
  GraficoDonutNiveles
} from '../../components/dificultad/index.js';

/**
 * InformeDificultad - Página orquestadora del Caso de Uso 12.4 (Análisis de Dificultad e Histograma).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando los filtros jerárquicos
 * (Año Académico por defecto y Clase ordenada de más reciente a más antigua), consultar las actividades
 * de la clase mediante useInformeDificultad, desplegar las tarjetas interactivas de prácticas y coordinar
 * el cálculo de la media, tasa de aprobados, diagnóstico y el histograma en deciles.
 */
const InformeDificultad = () => {
  // 1. Consulta y control del Año Académico activo (selecciona el más reciente por defecto)
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Consulta de las clases correspondientes al año escolar activo
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Estado local para la clase seleccionada por el usuario (espera su acción)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Estado local para la versión/práctica seleccionada para el histograma
  const [versionSeleccionadaId, setVersionSeleccionadaId] = useState(null);

  // 3. Custom Hook especializado para actividades y calificaciones de evaluan
  const {
    versiones,
    notas,
    cargandoVersiones,
    cargandoNotas,
    error: errorInforme,
    obtenerVersionesPorClase,
    obtenerDistribucionNotas,
    limpiarDatos,
    limpiarNotas
  } = useInformeDificultad();

  // Extracción de los metadatos de la clase activa seleccionada
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Consulta automática de las versiones al seleccionar una clase
  useEffect(() => {
    if (idCursoActivo && idModuloActivo) {
      setVersionSeleccionadaId(null);
      limpiarNotas();
      obtenerVersionesPorClase(idCursoActivo, idModuloActivo);
    } else {
      setVersionSeleccionadaId(null);
      limpiarDatos();
    }
  }, [idCursoActivo, idModuloActivo, obtenerVersionesPorClase, limpiarDatos, limpiarNotas]);

  // Consulta automática de calificaciones al seleccionar una versión específica
  useEffect(() => {
    if (versionSeleccionadaId) {
      obtenerDistribucionNotas(versionSeleccionadaId);
    } else {
      limpiarNotas();
    }
  }, [versionSeleccionadaId, obtenerDistribucionNotas, limpiarNotas]);

  // Versión seleccionada actualmente
  const versionActiva = useMemo(() => {
    if (!versionSeleccionadaId || !versiones) return null;
    return versiones.find((v) => v.id_version === versionSeleccionadaId) || null;
  }, [versiones, versionSeleccionadaId]);

  const nombreActividadActiva = useMemo(() => {
    if (!versionActiva) return '';
    return `${versionActiva.nombrePractica} (${versionActiva.numeroVersion})`;
  }, [versionActiva]);

  // Manejador del cambio de Año Académico
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
    setVersionSeleccionadaId(null);
    limpiarDatos();
  };

  // Manejador del cambio de Clase
  const manejarCambioClase = (nuevoIdClase) => {
    setClaseSeleccionadaId(nuevoIdClase);
    setVersionSeleccionadaId(null);
    limpiarNotas();
  };

  // Manejador de selección de una versión de práctica
  const manejarSeleccionarVersion = (idVersion) => {
    setVersionSeleccionadaId(idVersion);
  };

  // Manejador para recargar la información
  const manejarRecargar = async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
    if (idCursoActivo && idModuloActivo) {
      const vers = await obtenerVersionesPorClase(idCursoActivo, idModuloActivo);
      if (versionSeleccionadaId && vers.some((v) => v.id_version === versionSeleccionadaId)) {
        await obtenerDistribucionNotas(versionSeleccionadaId);
      }
    }
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Análisis de Dificultad"
        descripcion="Histograma de frecuencias y distribución de calificaciones por actividad para evaluar la dificultad pedagógica."
      />

      {/* 2. Filtros Contextuales (Año Académico y Clase) */}
      <FiltrosDificultad
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={manejarCambioAnio}
        cargandoAnios={cargandoAnios}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={manejarCambioClase}
        cargandoClases={cargandoClases}
        onRecargar={manejarRecargar}
      />

      {/* 3. Estado previo a seleccionar una clase */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona una clase en el desplegable superior para examinar el catálogo de actividades y su nivel de dificultad."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {/* 4. Indicador de carga de actividades */}
      {claseSeleccionadaId && cargandoVersiones && (
        <div className="w-full my-4">
          <CargadorSeccion cargando={true} tipo="tarjeta" filas={4} />
        </div>
      )}

      {/* 5. Catálogo de actividades en formato tarjetas (sin enunciado) */}
      {claseSeleccionadaId && !cargandoVersiones && (
        <TarjetasPracticas
          versiones={versiones}
          versionSeleccionadaId={versionSeleccionadaId}
          onSeleccionarVersion={manejarSeleccionarVersion}
        />
      )}

      {/* 6. Mensaje previo a seleccionar una actividad si hay actividades disponibles */}
      {claseSeleccionadaId && !cargandoVersiones && versiones.length > 0 && !versionSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Actividad"
          descripcion="Haz clic en cualquiera de las tarjetas de práctica superiores para calcular su histograma de frecuencias y métricas de dificultad."
          icono="pi pi-chart-bar"
          className="w-full my-4"
        />
      )}

      {/* 7. Indicador de carga durante la consulta de notas de la actividad */}
      {versionSeleccionadaId && cargandoNotas && (
        <div className="w-full my-4">
          <CargadorSeccion cargando={true} tipo="tabla" filas={4} />
        </div>
      )}

      {/* 8. Panel de Resumen (3 Cards) e Histograma de frecuencias para la actividad seleccionada */}
      {versionSeleccionadaId && !cargandoNotas && (
        <div className="flex flex-column w-full">
          {/* Panel con las 3 tarjetas: Nota Media, Tasa de Aprobados y Diagnóstico Automático */}
          <PanelResumenDificultad notas={notas} />

          {/* Visualización a dos columnas: Histograma de deciles y Donut de niveles normativos oficiales */}
          <div className="grid">
            <div className="col-12 xl:col-7">
              <HistogramaDificultad
                notas={notas}
                nombreActividad={nombreActividadActiva}
              />
            </div>
            <div className="col-12 xl:col-5">
              <GraficoDonutNiveles
                notas={notas}
                nombreActividad={nombreActividadActiva}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeDificultad;
