import React, { useState, useEffect, useMemo } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import FiltrosCurriculo from '../components/unidades/FiltrosCurriculo.jsx';
import GestorCurriculo from '../components/GestorCurriculo.jsx';
import useClases from '../hooks/useClases.js';
import useGestorCurriculo from '../hooks/useGestorCurriculo.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import { formatearNumeroUT } from '../utils/formatoUT.js';

/**
 * UnidadesPagina - Página orquestadora del caso de uso 18 (Gestor de Unidades de Trabajo y Asignación de Actividades).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y vistas para coordinar la
 * definición de Unidades de Trabajo (UT) asociadas a una clase (que encapsula su módulo profesional)
 * y la asignación ágil de actividades en un espacio estructurado en dos columnas.
 */
const UnidadesPagina = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Estado local para la selección activa de la clase.
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Estados locales para el control del diálogo modal de creación/edición de UT.
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [unidadEdicion, setUnidadEdicion] = useState(null);

  // Consulta consolidada de clases a través del Custom Hook especializado.
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases();

  // Se autoselecciona la primera clase disponible cuando se completa la carga inicial.
  useEffect(() => {
    if (!claseSeleccionadaId && clases && clases.length > 0) {
      setClaseSeleccionadaId(clases[0].id);
    } else if (
      claseSeleccionadaId &&
      clases &&
      clases.length > 0 &&
      !clases.some((c) => c.id === claseSeleccionadaId)
    ) {
      setClaseSeleccionadaId(clases[0].id);
    }
  }, [clases, claseSeleccionadaId]);

  // Se extraen los datos de la clase activa (su curso y su módulo asociado).
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Hook orquestador principal para la lógica curricular y asignación de actividades.
  const {
    unidades,
    versiones,
    listaRAs,
    relacionesDesarrollan,
    actividadesHuerfanas,
    totalVersiones,
    cargando: cargandoCurriculo,
    guardando,
    siguienteNumeroUT,
    recargar: recargarCurriculo,
    crearUnidadTrabajo,
    actualizarUnidadTrabajo,
    eliminarUnidadTrabajo,
    asignarActividadUT,
    desvincularActividad
  } = useGestorCurriculo(idCursoActivo, idModuloActivo);

  // Apertura del modal para la creación de una nueva unidad didáctica.
  const manejarAbrirCrear = () => {
    setUnidadEdicion(null);
    setDialogoVisible(true);
  };

  // Apertura del modal para la edición de una unidad didáctica existente.
  const manejarAbrirEditar = (unidad) => {
    setUnidadEdicion(unidad);
    setDialogoVisible(true);
  };

  // Cierre del diálogo modal de formulario.
  const manejarCerrarDialogo = () => {
    setDialogoVisible(false);
    setUnidadEdicion(null);
  };

  // Asignación de una actividad a una UT informando al usuario mediante Toast.
  const manejarAsignarActividad = async (idVersion, idUtDestino) => {
    const exito = await asignarActividadUT(idVersion, idUtDestino);
    if (exito) {
      if (idUtDestino) {
        const utDestino = unidades.find((u) => u.id_ut === idUtDestino);
        const etiqueta = utDestino ? formatearNumeroUT(utDestino.numero) : 'unidad de trabajo';
        mostrarExito(`Actividad asignada a la ${etiqueta}.`);
      } else {
        mostrarExito('Actividad desvinculada de la unidad de trabajo.');
      }
    } else {
      mostrarError('No se ha podido actualizar la asignación de la actividad.');
    }
  };

  // Desvinculación de una actividad informando al usuario mediante Toast.
  const manejarDesvincularActividad = async (idVersion) => {
    const exito = await desvincularActividad(idVersion);
    if (exito) {
      mostrarExito('Actividad eliminada de la unidad de trabajo.');
    } else {
      mostrarError('No se ha podido desvincular la actividad.');
    }
  };

  // Función unificada para refrescar clases y datos curriculares.
  const manejarRecargar = async () => {
    await Promise.all([recargarClases(), recargarCurriculo()]);
  };

  const datosListos = Boolean(claseSeleccionadaId && idModuloActivo);

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página con enfoque de Clase */}
      <HeaderPagina
        titulo="Gestor de Unidades de Trabajo"
        descripcion="Estructuración del currículo por unidades didácticas y asignación ágil de actividades planificadas para cada clase."
      />

      {/* 2. Barra de filtros de clase e indicadores numéricos */}
      <FiltrosCurriculo
        claseSeleccionadaId={claseSeleccionadaId}
        onClaseChange={setClaseSeleccionadaId}
        clases={clases}
        cargandoClases={cargandoClases}
        onNuevaUT={manejarAbrirCrear}
        onRecargar={manejarRecargar}
        cargando={cargandoCurriculo}
        totalUTs={unidades.length}
        totalHuerfanas={actividadesHuerfanas.length}
        totalVersiones={totalVersiones}
      />

      {/* 3. Contenedor principal de dos columnas o estado de selección pendiente */}
      {!datosListos ? (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona una clase en el desplegable superior para comenzar a gestionar sus unidades didácticas y actividades."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : (
        <GestorCurriculo
          unidades={unidades}
          versiones={versiones}
          listaRAs={listaRAs}
          relacionesDesarrollan={relacionesDesarrollan}
          siguienteNumeroUT={siguienteNumeroUT}
          cargando={cargandoCurriculo}
          guardando={guardando}
          onCrearUT={crearUnidadTrabajo}
          onActualizarUT={actualizarUnidadTrabajo}
          onEliminarUT={eliminarUnidadTrabajo}
          onAsignarActividad={manejarAsignarActividad}
          onDesvincularActividad={manejarDesvincularActividad}
          dialogoVisible={dialogoVisible}
          unidadEdicion={unidadEdicion}
          onAbrirCrear={manejarAbrirCrear}
          onAbrirEditar={manejarAbrirEditar}
          onCerrarDialogo={manejarCerrarDialogo}
        />
      )}
    </div>
  );
};

export default UnidadesPagina;
