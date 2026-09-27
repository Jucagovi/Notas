import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import {
  FiltrosCriterios,
  BarraProgresoCobertura,
  SelectorTarjetasPracticas,
  TablaArbolCriterios
} from '../components/criterios/index.js';
import useAniosAcademicos from '../hooks/useAniosAcademicos.js';
import useClases from '../hooks/useClases.js';
import useMapeoCriterios from '../hooks/useMapeoCriterios.js';
import useGlobalToast from '../hooks/useGlobalToast.js';

/**
 * CriteriosPagina - Página orquestadora del caso de uso 11 (Cobertura de Criterios de Evaluación y Mapeo Jerárquico).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y estados para la vinculación
 * jerárquica de actividades programadas (Versiones) a Criterios de Evaluación (CE) y Resultados de Aprendizaje (RA),
 * gestionando el flujo: Año Académico -> Clase -> Versiones en tarjetas -> Árbol TreeTable de cobertura con id_version.
 */
const CriteriosPagina = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Consulta y control del Año Académico activo
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios
  } = useAniosAcademicos();

  // Consulta consolidada de clases filtradas por el año académico escolar
  const {
    clases,
    cargando: cargandoClases
  } = useClases(anioSeleccionado);

  // Estado local para la clase seleccionada actualmente
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Autoselección de la primera clase disponible al variar el año escolar o listado de clases
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

  // Se extraen los datos de la clase activa (su curso y su módulo curricular)
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Estado local para la versión activa seleccionada para mapeo
  const [idVersionSeleccionada, setIdVersionSeleccionada] = useState(null);

  // Custom Hook para la gestión jerárquica de criterios y persistencia transaccional con id_version
  const {
    versiones,
    arbolNodos,
    idVersionActiva,
    setIdVersionActiva,
    hayCambios,
    cargando: cargandoCriterios,
    guardando,
    error: errorCriterios,
    metricasGlobales,
    obtenerArbolCriterios,
    seleccionarNodo,
    actualizarPorcentaje,
    restablecerArbol,
    guardarMapeo
  } = useMapeoCriterios(idCursoActivo, idModuloActivo, idVersionSeleccionada);

  // Al cambiar la clase activa, se recargan los criterios del módulo y versiones del curso
  useEffect(() => {
    if (idCursoActivo && idModuloActivo) {
      obtenerArbolCriterios(idCursoActivo, idModuloActivo);
      setIdVersionSeleccionada(null);
    }
  }, [idCursoActivo, idModuloActivo, obtenerArbolCriterios]);

  // Autoselección de la primera versión disponible al cargar el listado de versiones de la clase
  useEffect(() => {
    if (versiones && versiones.length > 0) {
      const existeVersion = versiones.some((v) => v.id_version === idVersionSeleccionada);
      if (!existeVersion) {
        const primeraVersionId = versiones[0].id_version;
        setIdVersionSeleccionada(primeraVersionId);
        setIdVersionActiva(primeraVersionId);
      }
    } else {
      setIdVersionSeleccionada(null);
      setIdVersionActiva(null);
    }
  }, [versiones, idVersionSeleccionada, setIdVersionActiva]);

  // Manejador al cambiar manualmente el año académico
  const manejarCambioAnio = (nuevoAnio) => {
    if (nuevoAnio === anioSeleccionado) return;
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
    setIdVersionSeleccionada(null);
  };

  // Manejador al cambiar manualmente la clase seleccionada
  const manejarCambioClase = (nuevoIdClase) => {
    if (nuevoIdClase === claseSeleccionadaId) return;
    setClaseSeleccionadaId(nuevoIdClase);
    setIdVersionSeleccionada(null);
  };

  // Manejador al pulsar sobre una tarjeta de versión
  const manejarSeleccionarVersion = (idVersion) => {
    if (idVersion === idVersionSeleccionada) return;
    setIdVersionSeleccionada(idVersion);
    setIdVersionActiva(idVersion);
  };

  // Datos de la versión activa seleccionada
  const versionActiva = useMemo(() => {
    if (!idVersionSeleccionada || !versiones) return null;
    return versiones.find((v) => v.id_version === idVersionSeleccionada) || null;
  }, [versiones, idVersionSeleccionada]);

  // Persistencia transaccional del mapeo de la versión activa con notificación Toast
  const manejarGuardarMapeo = async () => {
    if (!idVersionSeleccionada) return;

    const resultado = await guardarMapeo(idVersionSeleccionada);

    if (resultado.ok) {
      mostrarExito(
        `Se han vinculado correctamente ${resultado.total} Criterios de Evaluación a la versión seleccionada.`,
        'Mapeo guardado'
      );
    } else {
      mostrarError(
        resultado.error || 'No se ha podido guardar el mapeo de criterios.',
        'Error de guardado'
      );
    }
  };

  // Renderizado condicional del cuerpo principal según el estado de las clases y criterios
  const renderizarCuerpo = () => {
    if (cargandoClases || cargandoCriterios) {
      return (
        <CargadorSeccion
          texto="Cargando configuración de la clase y criterios curriculares..."
          altura="20rem"
        />
      );
    }

    if (!clases || clases.length === 0) {
      return (
        <EstadoVacio
          icono="pi pi-building"
          mensaje="No hay clases en este año académico"
          descripcion="No existen clases configuradas para el año escolar seleccionado. Puedes registrar una clase o cambiar el año académico."
          botonTexto="Ir a Gestión de Clases"
          onAccion={() => navigate('/clases')}
        />
      );
    }

    return (
      <>
        {/* Componente ProgressBar grueso y métricas de balance cuantitativo */}
        <BarraProgresoCobertura
          metricas={metricasGlobales}
          nombrePracticaActiva={versionActiva?.nombre || versionActiva?.nombrePractica}
        />

        {/* Listado de versiones de la clase en formato de tarjetas interactivas */}
        <SelectorTarjetasPracticas
          versiones={versiones}
          idVersionActiva={idVersionSeleccionada}
          onSeleccionarVersion={manejarSeleccionarVersion}
          disabled={guardando}
          onNuevaPractica={() => navigate('/taller-practicas')}
        />

        {/* Tabla Jerárquica TreeTable con selección en cascada y sliders de porcentaje */}
        <TablaArbolCriterios
          arbolNodos={arbolNodos}
          versionActiva={versionActiva}
          onSeleccionarNodo={seleccionarNodo}
          onActualizarPorcentaje={actualizarPorcentaje}
          onGuardar={manejarGuardarMapeo}
          onRestablecer={restablecerArbol}
          hayCambios={hayCambios}
          guardando={guardando}
          cargando={cargandoCriterios}
        />
      </>
    );
  };

  return (
    <div className="flex flex-column w-full">
      {/* Cabecera estándar de la página */}
      <HeaderPagina
        titulo="Cobertura CE"
        descripcion="Vinculación rápida de actividades programadas de la clase a Criterios de Evaluación (CE) y definición de porcentajes de cobertura curricular."
      />

      {/* Filtros superiores contextuales: Año Académico y Clase */}
      <FiltrosCriterios
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={manejarCambioAnio}
        cargandoAnios={cargandoAnios}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={manejarCambioClase}
        cargandoClases={cargandoClases}
        disabled={guardando}
      />

      {/* Contenido interactivo principal */}
      {renderizarCuerpo()}
    </div>
  );
};

export default CriteriosPagina;
