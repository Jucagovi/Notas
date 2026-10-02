import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import FiltrosTemporizacion from '../../components/temporizacion/FiltrosTemporizacion.jsx';
import GestorTemporizacion from '../../components/temporizacion/GestorTemporizacion.jsx';
import DialogoPropuestaTemporizacion from '../../components/temporizacion/DialogoPropuestaTemporizacion.jsx';
import useAniosAcademicos from '../../hooks/useAniosAcademicos.js';
import useClases from '../../hooks/useClases.js';
import useTemporizacion from '../../hooks/useTemporizacion.js';
import usePropuestaTemporizacion from '../../hooks/usePropuestaTemporizacion.js';
import useCalendarioEscolar from '../../hooks/useCalendarioEscolar.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import { confirmarBorrado } from '../../components/common/ModalConfirmacion.jsx';

/**
 * TemporizacionPagina - Página orquestadora del caso de uso 19 (Temporización y Seguimiento de Unidades).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y estados para la planificación
 * temporal de las Unidades de Trabajo de un módulo durante la clase seleccionada en el año académico activo.
 */
const TemporizacionPagina = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();
  const location = useLocation();

  // Consulta y control del selector de años académicos con denominación completa (ej. 2026/2027).
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // Estado local para la clase seleccionada.
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Consulta consolidada de clases filtradas por el año académico seleccionado en el primer desplegable.
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Se autoselecciona la clase recibida por navegación o la primera disponible cuando se actualiza el listado.
  useEffect(() => {
    if (clases && clases.length > 0) {
      // Se comprueba si se ha recibido un módulo preseleccionado a través del estado de navegación.
      const idModuloNav = location.state?.idModulo || location.state?.moduloId || location.state?.id_modulo;
      const idCursoNav = location.state?.idCurso || location.state?.cursoId || location.state?.id_curso;

      if (idModuloNav) {
        const claseCoincidente = clases.find(
          (c) => c.id_modulo === idModuloNav && (!idCursoNav || c.id_curso === idCursoNav)
        ) || clases.find((c) => c.id_modulo === idModuloNav);

        if (claseCoincidente) {
          setClaseSeleccionadaId(claseCoincidente.id);
          return;
        }
      }

      const existeClase = clases.some((c) => c.id === claseSeleccionadaId);
      if (!existeClase) {
        setClaseSeleccionadaId(clases[0].id);
      }
    } else {
      setClaseSeleccionadaId(null);
    }
  }, [clases, claseSeleccionadaId, location.state]);

  // Se identifica la clase activa y se extraen los identificadores de curso y módulo asociados.
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const cursoSeleccionadoId = claseActiva?.id_curso || null;
  const moduloSeleccionadoId = claseActiva?.id_modulo || null;
  const idModuloFlexible = claseActiva?.id_modulo_flexible || claseActiva?.id_modulo_flexibilizado || null;

  // Hook orquestador principal para la lógica de temporización y seguimiento de la clase.
  const {
    temporizaciones,
    setTemporizaciones,
    estadisticas,
    cargando: cargandoTemporizacion,
    guardando,
    recargar: recargarTemporizacion,
    actualizarTemporizacion,
    actualizarCampoEnLinea,
    reordenarTemporizaciones,
    restablecerOrdenOriginal,
    aplicarPropuestaFechas,
    borrarTemporizacionCompleta
  } = useTemporizacion(cursoSeleccionadoId, moduloSeleccionadoId);

  // Hook especializado para la propuesta automática de temporización según pesos de RA y calendario.
  const {
    propuesta,
    cargando: cargandoPropuesta,
    error: errorPropuesta,
    generarPropuesta
  } = usePropuestaTemporizacion();

  // Consulta especializada del calendario escolar del curso y cálculo de días lectivos (soporta flexibilización).
  const {
    diasClase,
    conjuntoNoLectivos,
    anioInicio,
    fechaInicioPeriodo,
    fechaFinPeriodo,
    recargar: recargarCalendario
  } = useCalendarioEscolar(cursoSeleccionadoId, moduloSeleccionadoId, anioSeleccionado, idModuloFlexible);

  // Control de apertura del diálogo modal de la propuesta de temporización.
  const [modalPropuestaVisible, setModalPropuestaVisible] = useState(false);

  // Manejo de la reordenación interactiva de filas mediante Drag & Drop nativo.
  const manejarReordenar = async (filasReordenadas) => {
    const respuesta = await reordenarTemporizaciones(filasReordenadas);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Orden de impartición actualizado correctamente.');
    }
  };

  // Manejo de la apertura y cálculo de la propuesta de temporización.
  const manejarAbrirPropuesta = async () => {
    setModalPropuestaVisible(true);
    const resultado = await generarPropuesta({
      idCurso: cursoSeleccionadoId,
      idModulo: moduloSeleccionadoId,
      idModuloFlexible,
      temporizaciones,
      anioSeleccionado
    });
    if (!resultado && errorPropuesta) {
      mostrarError(errorPropuesta);
    }
  };

  // Manejo de la confirmación de la propuesta: traslada las fechas calculadas a las fechas previstas.
  const manejarAceptarPropuesta = async (unidadesPropuestas) => {
    const respuesta = await aplicarPropuestaFechas(unidadesPropuestas);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Propuesta de temporización aplicada y guardada correctamente.');
      setModalPropuestaVisible(false);
    }
  };

  // Propagación reactiva instantánea de fechas modificadas desde el calendario interactivo.
  const manejarCambioEnVivo = (unidadesModificadas) => {
    const mapaNuevas = new Map();
    unidadesModificadas.forEach((u) => {
      mapaNuevas.set(u.id_temporizacion, {
        fecha_ini_prevista: u.fecha_ini_prevista,
        fecha_fin_prevista: u.fecha_fin_prevista
      });
    });

    setTemporizaciones((prev) =>
      prev.map((t) => {
        const mod = mapaNuevas.get(t.id_temporizacion);
        return mod ? { ...t, ...mod } : t;
      })
    );
  };

  // Manejo del guardado de fechas desde la sección integrada de calendario en la página.
  const manejarGuardarFechasCalendario = async (unidadesModificadas) => {
    const respuesta = await aplicarPropuestaFechas(unidadesModificadas);
    if (respuesta?.error) {
      mostrarError(respuesta.error);
    } else {
      mostrarExito('Fechas de temporización guardadas correctamente en la base de datos.');
    }
  };

  // Manejo del borrado completo de la temporización con confirmación previa.
  const manejarBorrarTemporizacion = () => {
    confirmarBorrado({
      header: 'Borrar Temporización Completa',
      message: '¿Deseas eliminar por completo la temporización planificada para esta clase? Se borrarán todas las fechas previstas y el calendario quedará en blanco.',
      acceptLabel: 'Borrar',
      rejectLabel: 'Cancelar',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      onAceptar: async () => {
        const respuesta = await borrarTemporizacionCompleta();
        if (respuesta?.error) {
          mostrarError(respuesta.error);
        } else {
          mostrarExito('Temporización eliminada por completo.');
        }
      }
    });
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

  // Recarga unificada de todos los orígenes de datos.
  const manejarRecargar = async () => {
    await Promise.all([
      recargarAnios(),
      recargarClases(),
      recargarTemporizacion(),
      recargarCalendario()
    ]);
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

  // Comprobación de que la clase activa se encuentra debidamente resuelta.
  const parametrosListos = Boolean(cursoSeleccionadoId && moduloSeleccionadoId);

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Temporización"
        descripcion="Planificación temporal, estimación de fechas previstas y seguimiento de la ejecución real por clase."
      />

      {/* 2. Barra de filtros de año académico y clase con botones de control */}
      <FiltrosTemporizacion
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onAnioChange={setAnioSeleccionado}
        cargandoAnios={cargandoAnios}
        claseSeleccionadaId={claseSeleccionadaId}
        onClaseChange={setClaseSeleccionadaId}
        clases={clases}
        cargandoClases={cargandoClases}
        onRecargar={manejarRecargar}
        onRestablecerOrden={manejarRestablecerOrden}
        onAbrirPropuesta={manejarAbrirPropuesta}
        onBorrarTemporizacion={manejarBorrarTemporizacion}
        cargando={cargandoTemporizacion}
        guardando={guardando}
        totalUnidades={temporizaciones.length}
      />

      {/* 3. Contenedor principal de temporización o estados informativos */}
      {!parametrosListos ? (
        <EstadoVacio
          mensaje="Selecciona un Año Académico y una Clase"
          descripcion="Por favor, selecciona un año académico y una clase en los desplegables superiores para comenzar la temporización."
          icono="pi pi-filter"
          className="w-full my-4"
        />
      ) : temporizaciones.length === 0 && !cargandoTemporizacion ? (
        <EstadoVacio
          mensaje="No hay Unidades de Trabajo en esta Clase"
          descripcion="Esta clase todavía no cuenta con unidades didácticas definidas en el currículo base. Dirígete a la sección de Unidades de Trabajo para agregarlas."
          icono="pi pi-folder-open"
          className="w-full my-4"
        />
      ) : (
        <GestorTemporizacion
          temporizaciones={temporizaciones}
          estadisticas={estadisticas}
          diasClase={diasClase}
          conjuntoNoLectivos={conjuntoNoLectivos}
          fechaInicioPeriodo={fechaInicioPeriodo}
          fechaFinPeriodo={fechaFinPeriodo}
          anioInicio={anioInicio}
          cargando={cargandoTemporizacion}
          guardando={guardando}
          onReordenar={manejarReordenar}
          onActualizarCampo={manejarActualizarCampo}
          onActualizarTemporizacion={manejarActualizarTemporizacion}
          onGuardarFechas={manejarGuardarFechasCalendario}
          onCambioEnVivo={manejarCambioEnVivo}
        />
      )}

      {/* 4. Diálogo modal de la propuesta automática de temporización */}
      <DialogoPropuestaTemporizacion
        visible={modalPropuestaVisible}
        onOcultar={() => setModalPropuestaVisible(false)}
        propuesta={propuesta}
        cargando={cargandoPropuesta}
        guardando={guardando}
        onAceptarPropuesta={manejarAceptarPropuesta}
      />
    </div>
  );
};

export default TemporizacionPagina;
