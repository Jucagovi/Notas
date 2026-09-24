import React, { useState, useEffect } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import FiltrosTemporizacion from '../../components/temporizacion/FiltrosTemporizacion.jsx';
import GestorTemporizacion from '../../components/GestorTemporizacion.jsx';
import useCursos from '../../hooks/useCursos.js';
import useModulos from '../../hooks/useModulos.js';
import useTemporizacion from '../../hooks/useTemporizacion.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import { confirmarBorrado } from '../../components/common/ModalConfirmacion.jsx';

/**
 * TemporizacionPagina - Página orquestadora del caso de uso 19 (Temporización y Seguimiento de Unidades).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y estados para la planificación
 * temporal de las Unidades de Trabajo de un módulo durante un curso escolar seleccionado.
 */
const TemporizacionPagina = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useGlobalToast();

  // Estados locales para la selección activa de curso y módulo.
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

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

  // Hook orquestador principal para la lógica de temporización y seguimiento.
  const {
    temporizaciones,
    estadisticas,
    cargando: cargandoTemporizacion,
    guardando,
    recargar,
    actualizarTemporizacion,
    actualizarCampoEnLinea,
    reordenarTemporizaciones,
    restablecerOrdenOriginal
  } = useTemporizacion(cursoSeleccionadoId, moduloSeleccionadoId);

  // Manejo de la reordenación interactiva de filas mediante Drag & Drop nativo.
  const manejarReordenar = async (filasReordenadas) => {
    const respuesta = await reordenarTemporizaciones(filasReordenadas);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Orden de impartición actualizado correctamente.');
    }
  };

  // Manejo de la actualización en línea de un campo individual (fechas o estado).
  const manejarActualizarCampo = async (idTemporizacion, campo, valor) => {
    const respuesta = await actualizarCampoEnLinea(idTemporizacion, campo, valor);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Dato actualizado correctamente.');
    }
  };

  // Manejo del guardado completo desde el diálogo modal de edición.
  const manejarActualizarTemporizacion = async (idTemporizacion, valores) => {
    const respuesta = await actualizarTemporizacion(idTemporizacion, valores);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Temporización guardada con éxito.');
    }
    return respuesta;
  };

  // Solicitud de confirmación antes de restablecer el orden curricular original.
  const manejarRestablecerOrden = () => {
    confirmarBorrado({
      header: 'Restablecer Orden Curricular',
      message: '¿Deseas restablecer el orden de impartición de todas las unidades a su numeración curricular oficial (1, 2, 3...)? Esta acción reescribirá la secuencia actual.',
      acceptLabel: 'Restablecer',
      rejectLabel: 'Cancelar',
      icon: 'pi pi-sort-numeric-down',
      acceptClassName: 'p-button-primary',
      onAceptar: async () => {
        const respuesta = await restablecerOrdenOriginal();
        if (respuesta?.error) {
          mostrarError(respuesta.error);
        } else {
          mostrarExito('Orden curricular restablecido correctamente.');
        }
      }
    });
  };

  // Comprobación de que ambos selectores han sido determinados.
  const parametrosListos = Boolean(cursoSeleccionadoId && moduloSeleccionadoId);

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Temporización"
        descripcion="Planificación temporal, estimación de fechas previstas y seguimiento de la ejecución real por curso académico."
      />

      {/* 2. Barra de filtros de curso y módulo con botones de control */}
      <FiltrosTemporizacion
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCursoChange={setCursoSeleccionadoId}
        cursos={cursos}
        cargandoCursos={cargandoCursos}
        moduloSeleccionadoId={moduloSeleccionadoId}
        onModuloChange={setModuloSeleccionadoId}
        modulos={modulos}
        cargandoModulos={cargandoModulos}
        onRecargar={recargar}
        onRestablecerOrden={manejarRestablecerOrden}
        cargando={cargandoTemporizacion}
        guardando={guardando}
        totalUnidades={temporizaciones.length}
      />

      {/* 3. Contenedor principal de temporización o estados informativos */}
      {!parametrosListos ? (
        <EstadoVacio
          mensaje="Selecciona un Curso y Módulo"
          descripcion="Por favor, selecciona un curso académico y un módulo profesional en los desplegables superiores para comenzar la temporización."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : temporizaciones.length === 0 && !cargandoTemporizacion ? (
        <EstadoVacio
          mensaje="No hay Unidades de Trabajo en este Módulo"
          descripcion="Este módulo profesional todavía no cuenta con unidades didácticas definidas en el currículo base. Dirígete a la sección de Unidades de Trabajo para agregarlas."
          icono="pi pi-folder-open"
          className="w-full my-4"
        />
      ) : (
        <GestorTemporizacion
          temporizaciones={temporizaciones}
          estadisticas={estadisticas}
          cargando={cargandoTemporizacion}
          guardando={guardando}
          onReordenar={manejarReordenar}
          onActualizarCampo={manejarActualizarCampo}
          onActualizarTemporizacion={manejarActualizarTemporizacion}
        />
      )}
    </div>
  );
};

export default TemporizacionPagina;
