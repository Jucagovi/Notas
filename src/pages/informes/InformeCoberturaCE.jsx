import React, { useState, useEffect, useMemo } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../../components/common/CargadorSeccion.jsx';
import {
  FiltrosCobertura,
  ResumenCobertura,
  AcordeonCoberturaCe
} from '../../components/coberturace/index.js';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useInformeCobertura from '../../hooks/useInformeCobertura.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';

/**
 * InformeCoberturaCE - Página orquestadora del Caso de Uso 12.1 (Informe de Auditoría de Cobertura Curricular).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando la selección de Año Académico
 * (obtenido de Cursos en formato YYYY/YYYY+1) y la selección de Curso/Clase mediante botones,
 * coordinando la carga curricular y renderizando la vista de acordeón inicialmente colapsada con tarjetas
 * de actividades e indicadores visuales Tag normalizados.
 */
const InformeCoberturaCE = () => {
  const { mostrarError } = useGlobalToast();

  // 1. Consulta y control del Año Académico activo
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

  // Estado local para almacenar la clase seleccionada por el docente
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Si cambia el año o listado de clases, se valida o autoselecciona la primera clase disponible
  useEffect(() => {
    if (clases && clases.length > 0) {
      const existeClase = clases.some((c) => c.id === claseSeleccionadaId);
      if (!existeClase) {
        setClaseSeleccionadaId(clases[0].id);
      }
    } else {
      setClaseSeleccionadaId(null);
    }
  }, [clases, claseSeleccionadaId]);

  // Se extraen los datos de la clase activa seleccionada
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // 3. Consulta y consolidación analítica de la cobertura de CE para el curso y módulo seleccionados
  const {
    datos,
    ras,
    metricas,
    cargando: cargandoInforme,
    error: errorInforme,
    recargar: recargarInforme
  } = useInformeCobertura(idCursoActivo, idModuloActivo);

  // Manejador del cambio manual de año escolar
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
  };

  // Manejador del cambio de clase mediante clic en los botones
  const manejarCambioClase = (nuevoIdClase) => {
    setClaseSeleccionadaId(nuevoIdClase);
  };

  // Notificación de errores en caso de fallo en la consulta
  useEffect(() => {
    if (errorInforme) {
      mostrarError(errorInforme);
    }
  }, [errorInforme, mostrarError]);

  // Recarga global de filtros e informe
  const manejarRecargar = async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
    if (idCursoActivo && idModuloActivo) {
      await recargarInforme();
    }
  };

  const cargandoGlobal = cargandoAnios || cargandoClases || cargandoInforme;

  return (
    <div className="flex flex-column w-full pb-6">
      {/* Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Auditoría de Cobertura Curricular (CE)"
        descripcion="Informe de auditoría para validar que todos los Criterios de Evaluación tengan asignadas actividades con una cobertura acumulada del 100%."
      />

      {/* Barra superior con selector de Año Académico y botones de Curso/Clase */}
      <FiltrosCobertura
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={manejarCambioAnio}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={manejarCambioClase}
        cargando={cargandoGlobal}
        onRecargar={manejarRecargar}
      />

      {/* Estado: El docente no ha seleccionado ninguna clase */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase o Curso"
          descripcion="Haz clic en uno de los botones superiores correspondientes a tu curso para consultar la auditoría de cobertura curricular."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {/* Estado: Cargando datos iniciales del informe para la clase seleccionada */}
      {claseSeleccionadaId && cargandoInforme && ras.length === 0 && (
        <CargadorSeccion texto="Auditando cobertura curricular de criterios de evaluación..." />
      )}

      {/* Estado: Clase seleccionada pero el módulo no posee RAs o CEs registrados en la base de datos */}
      {claseSeleccionadaId && !cargandoInforme && ras.length === 0 && (
        <EstadoVacio
          mensaje="Sin Criterios de Evaluación"
          descripcion="El módulo formativo de la clase seleccionada no cuenta con Resultados de Aprendizaje o Criterios de Evaluación definidos en el currículo."
          icono="pi pi-list"
          className="w-full my-4"
        />
      )}

      {/* Zona principal con datos cargados */}
      {/* Zona principal con datos cargados: Métricas analíticas y Acordeón jerárquico */}
      {claseSeleccionadaId && ras.length > 0 && (
        <div className="flex flex-column w-full">
          {/* Tarjetas resumen analíticas */}
          <ResumenCobertura metricas={metricas} />

          {/* Vista jerárquica de RAs inicialmente colapsados con tarjetas de actividades */}
          <AcordeonCoberturaCe ras={ras} />
        </div>
      )}
    </div>
  );
};

export default InformeCoberturaCE;
