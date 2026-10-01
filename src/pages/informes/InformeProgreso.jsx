import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SelectButton } from 'primereact/selectbutton';
import { Message } from 'primereact/message';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useMonitorCurricular from '../../hooks/useMonitorCurricular.js';
import {
  FiltrosProgreso,
  ResumenProgreso,
  LineaTiempoProgreso,
  GanttComparativoProgreso,
  TablaProgresoCurricular
} from '../../components/progreso/index.js';

// Opciones de visualización disponibles para alternar entre modalidades de informe.
const OPCIONES_VISTA = [
  { label: 'Línea de Tiempo', value: 'timeline', icon: 'pi pi-calendar' },
  { label: 'Diagrama Gantt', value: 'gantt', icon: 'pi pi-chart-bar' },
  { label: 'Tabla Detallada', value: 'tabla', icon: 'pi pi-table' }
];

/**
 * InformeProgreso - Página orquestadora del Caso de Uso 24 (Monitor de Desviación Curricular).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando los filtros de
 * Curso y Módulo, gestionando la obtención de datos a través de useMonitorCurricular y
 * coordinando la alternancia entre la Línea de Tiempo (Timeline), el diagrama de Gantt y la tabla.
 */
const InformeProgreso = () => {
  const location = useLocation();

  // Estados locales para los filtros seleccionados por el docente.
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Modalidad visual activa: 'timeline' (por defecto), 'gantt' o 'tabla'.
  const [modoVista, setModoVista] = useState('timeline');

  // Custom Hook especializado en el cruce de Temporizacion con Unidades de Trabajo y cálculo de desviaciones.
  const {
    cursoActivo,
    cursos,
    modulos,
    unidades,
    estadisticas,
    cargando,
    error,
    recargar
  } = useMonitorCurricular(cursoSeleccionadoId, moduloSeleccionadoId);

  // Autoselección inicial del curso a partir del estado de navegación o del primer curso disponible.
  useEffect(() => {
    const idCursoNav = location.state?.id_curso || location.state?.cursoId;
    if (idCursoNav) {
      setCursoSeleccionadoId(idCursoNav);
    } else if (!cursoSeleccionadoId && cursoActivo) {
      setCursoSeleccionadoId(cursoActivo.id_curso);
    }
  }, [location.state, cursoActivo, cursoSeleccionadoId]);

  // Autoselección del módulo a partir del estado de navegación o del primer módulo disponible.
  useEffect(() => {
    const idModuloNav = location.state?.id_modulo || location.state?.moduloId;
    if (idModuloNav) {
      setModuloSeleccionadoId(idModuloNav);
    } else if (!moduloSeleccionadoId && modulos && modulos.length > 0) {
      setModuloSeleccionadoId(modulos[0].id_modulo);
    }
  }, [location.state, modulos, moduloSeleccionadoId]);

  // Manejador del cambio de curso académico.
  const manejarCambioCurso = (nuevoIdCurso) => {
    setCursoSeleccionadoId(nuevoIdCurso);
  };

  // Manejador del cambio de módulo profesional.
  const manejarCambioModulo = (nuevoIdModulo) => {
    setModuloSeleccionadoId(nuevoIdModulo);
  };

  // Manejador de refresco de datos.
  const manejarRecargar = async () => {
    await recargar();
  };

  // Año de inicio numérico estimado para la cuadrícula del diagrama de Gantt.
  const anioInicioCurso = useMemo(() => {
    if (cursoActivo && cursoActivo.anyo) {
      const match = String(cursoActivo.anyo).match(/\b(20\d{2})\b/);
      if (match) return parseInt(match[1], 10);
    }
    return new Date().getFullYear();
  }, [cursoActivo]);

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera estándar de la página */}
      <HeaderPagina
        titulo="Progreso Curricular"
        descripcion="Monitor de desviación y seguimiento temporal: comprobación del ritmo de impartición frente a lo planificado mediante cronogramas interactivos."
      />

      {/* 2. Filtros de Curso y Módulo */}
      <FiltrosProgreso
        cursos={cursos}
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCambioCurso={manejarCambioCurso}
        modulos={modulos}
        moduloSeleccionadoId={moduloSeleccionadoId}
        onCambioModulo={manejarCambioModulo}
        cargando={cargando}
        onRecargar={manejarRecargar}
      />

      {/* 3. Mensaje informativo en caso de error en la consulta */}
      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full justify-content-start mb-3"
        />
      )}

      {/* 4. Renderizado condicional durante la carga inicial */}
      {cargando && unidades.length === 0 ? (
        <div className="w-full my-4">
          <CargadorSeccion cargando={true} tipo="tabla" filas={4} />
        </div>
      ) : !cursoSeleccionadoId || !moduloSeleccionadoId ? (
        <EstadoVacio
          mensaje="Selecciona un Curso y un Módulo"
          descripcion="Por favor, selecciona un curso académico y un módulo en los selectores superiores para consultar el progreso curricular."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : unidades.length === 0 ? (
        <EstadoVacio
          mensaje="Sin Unidades de Trabajo temporizadas"
          descripcion="Este módulo todavía no cuenta con fechas o unidades temporizadas para el curso seleccionado. Accede a la sección de Temporización para configurarlas."
          icono="pi pi-calendar-times"
          className="w-full my-4"
        />
      ) : (
        <div className="flex flex-column w-full">
          {/* 5. Panel de métricas KPI y balance de desviaciones */}
          <ResumenProgreso estadisticas={estadisticas} />

          {/* 6. Barra de herramientas para conmutar entre modalidades de visualización */}
          <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3">
            <span className="text-sm font-semibold text-700">
              Visualización del Cronograma:
            </span>
            <SelectButton
              value={modoVista}
              options={OPCIONES_VISTA}
              onChange={(e) => e.value && setModoVista(e.value)}
              className="p-buttonset-sm"
              aria-label="Seleccionar modo de visualización"
            />
          </div>

          {/* 7. Modalidad A: Línea de Tiempo de PrimeReact */}
          {modoVista === 'timeline' && (
            <LineaTiempoProgreso
              unidades={unidades}
              idCurso={cursoSeleccionadoId}
              idModulo={moduloSeleccionadoId}
            />
          )}

          {/* 8. Modalidad B: Diagrama de Gantt comparativo con solapamiento visual */}
          {modoVista === 'gantt' && (
            <GanttComparativoProgreso
              unidades={unidades}
              anioInicio={anioInicioCurso}
            />
          )}

          {/* 9. Modalidad C: Detalle Tabular utilizando TablaBase */}
          {modoVista === 'tabla' && (
            <TablaProgresoCurricular
              unidades={unidades}
              cargando={cargando}
              idCurso={cursoSeleccionadoId}
              idModulo={moduloSeleccionadoId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InformeProgreso;
