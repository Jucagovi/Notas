import React, { useState, useEffect } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import FiltrosCurriculo from '../components/unidades/FiltrosCurriculo.jsx';
import GestorCurriculo from '../components/GestorCurriculo.jsx';
import useCursos from '../hooks/useCursos.js';
import useModulos from '../hooks/useModulos.js';
import useGestorCurriculo from '../hooks/useGestorCurriculo.js';
import useGlobalToast from '../hooks/useGlobalToast.js';

/**
 * UnidadesPagina - Página orquestadora del caso de uso 18 (Gestor de Unidades de Trabajo y Asignación de Actividades).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y vistas para coordinar la
 * definición de Unidades de Trabajo (UT) asociadas a un módulo y la asignación interactiva
 * de actividades (Versiones) para el curso escolar seleccionado.
 */
const UnidadesPagina = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Estados locales para la selección activa de curso, módulo y tipo de vista.
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('visual');

  // Estados locales para el control del diálogo modal de creación/edición de UT.
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [unidadEdicion, setUnidadEdicion] = useState(null);

  // Consulta de los cursos académicos y módulos profesionales disponibles.
  const { datos: cursos, cargando: cargandoCursos } = useCursos();
  const { datos: modulos, cargando: cargandoModulos } = useModulos();

  // Se autoselecciona el primer curso disponible cuando se completa la carga inicial.
  useEffect(() => {
    if (!cursoSeleccionadoId && cursos && cursos.length > 0) {
      setCursoSeleccionadoId(cursos[0].id_curso);
    }
  }, [cursos, cursoSeleccionadoId]);

  // Se autoselecciona el primer módulo disponible cuando se completa la carga inicial.
  useEffect(() => {
    if (!moduloSeleccionadoId && modulos && modulos.length > 0) {
      setModuloSeleccionadoId(modulos[0].id_modulo);
    }
  }, [modulos, moduloSeleccionadoId]);

  // Hook orquestador principal para la lógica curricular y asignación de actividades.
  const {
    unidades,
    actividadesHuerfanas,
    totalVersiones,
    cargando: cargandoCurriculo,
    guardando,
    siguienteNumeroUT,
    recargar,
    crearUnidadTrabajo,
    actualizarUnidadTrabajo,
    eliminarUnidadTrabajo,
    asignarActividadUT,
    desvincularActividad
  } = useGestorCurriculo(cursoSeleccionadoId, moduloSeleccionadoId);

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

  // Asignación de una actividad informando al usuario mediante Toast.
  const manejarAsignarActividad = async (idVersion, idUtDestino) => {
    const exito = await asignarActividadUT(idVersion, idUtDestino);
    if (exito) {
      if (idUtDestino) {
        const utDestino = unidades.find((u) => u.id_ut === idUtDestino);
        const etiqueta = utDestino ? `UT ${utDestino.numero}` : 'unidad de trabajo';
        mostrarExito(`Actividad asignada a la ${etiqueta}.`);
      } else {
        mostrarExito('Actividad desvinculada y devuelta a huérfanas.');
      }
    } else {
      mostrarError('No se ha podido actualizar la asignación de la actividad.');
    }
  };

  // Desvinculación de una actividad informando al usuario mediante Toast.
  const manejarDesvincularActividad = async (idVersion) => {
    const exito = await desvincularActividad(idVersion);
    if (exito) {
      mostrarExito('Actividad desvinculada correctamente.');
    } else {
      mostrarError('No se ha podido desvincular la actividad.');
    }
  };

  const datosListosParaCurriculo = Boolean(cursoSeleccionadoId && moduloSeleccionadoId);

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Gestor de Unidades de Trabajo"
        descripcion="Estructuración del currículo por unidades didácticas y asignación ágil de actividades planificadas a cada unidad."
      />

      {/* 2. Barra de filtros de curso y módulo, cambio de vista y disparadores */}
      <FiltrosCurriculo
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCursoChange={setCursoSeleccionadoId}
        cursos={cursos}
        cargandoCursos={cargandoCursos}
        moduloSeleccionadoId={moduloSeleccionadoId}
        onModuloChange={setModuloSeleccionadoId}
        modulos={modulos}
        cargandoModulos={cargandoModulos}
        onNuevaUT={manejarAbrirCrear}
        onRecargar={recargar}
        cargando={cargandoCurriculo}
        totalUTs={unidades.length}
        totalHuerfanas={actividadesHuerfanas.length}
        totalVersiones={totalVersiones}
        vistaActiva={vistaActiva}
        onVistaChange={setVistaActiva}
      />

      {/* 3. Contenedor principal de gestión curricular o estado de selección pendiente */}
      {!datosListosParaCurriculo ? (
        <EstadoVacio
          mensaje="Selecciona un Curso y Módulo"
          descripcion="Por favor, selecciona un curso académico y un módulo profesional en los desplegables superiores para comenzar a gestionar las unidades didácticas y sus actividades."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : (
        <GestorCurriculo
          unidades={unidades}
          actividadesHuerfanas={actividadesHuerfanas}
          siguienteNumeroUT={siguienteNumeroUT}
          cargando={cargandoCurriculo}
          guardando={guardando}
          vista={vistaActiva}
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
