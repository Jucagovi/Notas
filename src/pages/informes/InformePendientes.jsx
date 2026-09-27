import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useInformePendientes from '../../hooks/useInformePendientes.js';
import {
  FiltrosPendientes,
  BarraAccionesPendientes,
  VistaPorPracticas,
  VistaPorDiscentes,
  MensajeSinPendientes,
  ResumenPendientes
} from '../../components/pendientes/index.js';

/**
 * InformePendientes - Página orquestadora del Informe de Calificaciones Pendientes (Caso de Uso 12.3).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando los filtros simplificados
 * (Año Académico y Clase), gestionar la consulta de notas pendientes en cualquier evaluación a través de
 * useInformePendientes, y coordinar la conmutación entre la vista por prácticas y la vista por discentes.
 */
const InformePendientes = () => {
  const navigate = useNavigate();

  // Modalidad activa de visualización: 'practicas' (agrupado por actividades) o 'discentes' (agrupado por alumnos)
  const [modoVista, setModoVista] = useState('practicas');

  // 1. Consulta y control del Año Académico activo (selecciona el año más reciente por defecto)
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Consulta de clases filtradas por el año académico seleccionado
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Estado local para la clase seleccionada por el usuario (espera su acción)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // 3. Custom Hook especializado para el cruce relacional y agrupaciones
  const {
    pendientes,
    practicasAgrupadas,
    discentesAgrupados,
    cargando: cargandoPendientes,
    error: errorPendientes,
    obtenerPendientesPorClase,
    limpiarPendientes
  } = useInformePendientes();

  // Se extraen los datos de la clase activa seleccionada
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Consulta automática de pendientes en cualquier evaluación al seleccionar una clase
  useEffect(() => {
    if (idCursoActivo && idModuloActivo) {
      obtenerPendientesPorClase(idCursoActivo, idModuloActivo);
    } else {
      limpiarPendientes();
    }
  }, [idCursoActivo, idModuloActivo, obtenerPendientesPorClase, limpiarPendientes]);

  // Manejador del cambio de Año Académico
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
    limpiarPendientes();
  };

  // Manejador del cambio de Clase
  const manejarCambioClase = (nuevoIdClase) => {
    setClaseSeleccionadaId(nuevoIdClase);
  };

  // Manejador de recarga de datos
  const manejarRecargar = async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
    if (idCursoActivo && idModuloActivo) {
      await obtenerPendientesPorClase(idCursoActivo, idModuloActivo);
    }
  };

  // Manejador para navegar al calificador parametrizando la clase, evaluación y versión
  const manejarCalificar = useCallback(
    (item) => {
      if (!item) return;

      navigate('/evaluaciones/calificar', {
        state: {
          id_curso: item.id_curso || idCursoActivo,
          id_modulo: item.id_modulo || idModuloActivo,
          id_evaluacion: item.id_evaluacion || null,
          id_version: item.id_version
        }
      });
    },
    [navigate, idCursoActivo, idModuloActivo]
  );

  // Manejador para navegar a la sección adecuada (Taller de Prácticas) cuando una actividad no tiene evaluación
  const manejarAsignarEvaluacion = useCallback(
    (item) => {
      if (!item) return;

      navigate('/taller-practicas', {
        state: {
          id_curso: item.id_curso || idCursoActivo,
          id_modulo: item.id_modulo || idModuloActivo,
          id_practica: item.id_practica || null,
          id_version: item.id_version
        }
      });
    },
    [navigate, idCursoActivo, idModuloActivo]
  );

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Calificaciones Pendientes"
        descripcion="Control de notas vacías para prevenir el cierre de actas con actividades sin evaluar en la clase."
      />

      {/* 2. Filtros Contextuales Simplificados (Año Académico y Clase) */}
      <FiltrosPendientes
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

      {/* 3. Estado previo a la selección interactiva de una clase */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona un año escolar y una clase en los selectores superiores para consultar las calificaciones pendientes."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {/* 4. Indicador de carga durante la consulta de notas pendientes */}
      {claseSeleccionadaId && cargandoPendientes && (
        <div className="w-full my-4">
          <CargadorSeccion cargando={true} tipo="tabla" filas={4} />
        </div>
      )}

      {/* 5. Mensaje de éxito grande y verde si no hay ninguna nota pendiente en la clase */}
      {claseSeleccionadaId && !cargandoPendientes && pendientes.length === 0 && (
        <MensajeSinPendientes />
      )}

      {/* 6. Visualización de los datos agrupados cuando existen calificaciones pendientes */}
      {claseSeleccionadaId && !cargandoPendientes && pendientes.length > 0 && (
        <div className="flex flex-column w-full">
          {/* Panel con tarjetas resumen de métricas */}
          <ResumenPendientes
            pendientes={pendientes}
            claseInfo={claseActiva}
          />

          {/* Barra de herramientas con los dos botones de alternancia situados a la derecha */}
          <BarraAccionesPendientes
            modoVista={modoVista}
            onCambioModo={setModoVista}
            totalPendientes={pendientes.length}
            totalGrupos={
              modoVista === 'practicas'
                ? practicasAgrupadas.length
                : discentesAgrupados.length
            }
          />

          {/* Modalidad A: Agrupados por prácticas con acordeón inicialmente colapsado */}
          {modoVista === 'practicas' && (
            <VistaPorPracticas
              practicas={practicasAgrupadas}
              onCalificar={manejarCalificar}
              onAsignarEvaluacion={manejarAsignarEvaluacion}
            />
          )}

          {/* Modalidad B: Agrupados por discentes con acordeón inicialmente colapsado */}
          {modoVista === 'discentes' && (
            <VistaPorDiscentes
              discentes={discentesAgrupados}
              onCalificar={manejarCalificar}
              onAsignarEvaluacion={manejarAsignarEvaluacion}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InformePendientes;
