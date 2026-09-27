import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import useAniosAcademicos from '../hooks/useAniosAcademicos.js';
import useClases from '../hooks/useClases.js';
import useCalificador from '../hooks/useCalificador.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import {
  FiltrosCalificar,
  ResumenCalificaciones,
  TablaCalificaciones,
  DialogoSinEvaluacion
} from '../components/calificar/index.js';

/**
 * CalificarPagina - Página orquestadora del caso de uso 06 (Calificación de Actividades).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador coordinando los filtros jerárquicos
 * (Año académico -> Clase -> Versiones), disparar la carga de alumnos matriculados y sus notas,
 * avisar mediante modal interactivo en caso de actividad sin evaluación asignada, y delegar
 * el guardado automático mediante el hook useCalificador.
 */
const CalificarPagina = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();
  const location = useLocation();
  const estadoNavegacion = location.state;
  const estadoProcesadoRef = useRef(false);

  // 1. Consulta y control del Año Académico activo
  const {
    anios,
    anioSeleccionado,
    setAnioSeleccionado,
    cargando: cargandoAnios,
    recargar: recargarAnios
  } = useAniosAcademicos();

  // 2. Consulta de clases filtradas estrictamente por el año académico activo
  const {
    clases,
    cargando: cargandoClases,
    recargar: recargarClases
  } = useClases(anioSeleccionado);

  // Estados locales para la selección activa de Clase y Versión (Actividad)
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [versionSeleccionadaId, setVersionSeleccionadaId] = useState(null);

  // Estados locales para las versiones de la clase activa y modal de aviso
  const [versiones, setVersiones] = useState([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(false);
  const [dialogoAvisoVisible, setDialogoAvisoVisible] = useState(false);

  // 3. Hook especializado para la gestión y persistencia de calificaciones
  const {
    discentes,
    setDiscentes,
    cargando: cargandoDiscentes,
    guardando,
    obtenerVersionesPorClase,
    obtenerDiscentesConNotas,
    guardarNota
  } = useCalificador();

  // Autoselección de la clase disponible considerando el estado de navegación
  useEffect(() => {
    if (clases && clases.length > 0) {
      // Si se navega desde el informe con curso y módulo, se preselecciona dicha clase
      const claveObjetivo =
        estadoNavegacion?.id_curso && estadoNavegacion?.id_modulo && !estadoProcesadoRef.current
          ? `${estadoNavegacion.id_curso}_${estadoNavegacion.id_modulo}`
          : null;

      if (claveObjetivo && clases.some((c) => c.id === claveObjetivo)) {
        setClaseSeleccionadaId(claveObjetivo);
        return;
      }

      const existeClase = clases.some((c) => c.id === claseSeleccionadaId);
      if (!existeClase) {
        setClaseSeleccionadaId(clases[0].id);
      }
    } else {
      setClaseSeleccionadaId(null);
    }
  }, [clases, claseSeleccionadaId, estadoNavegacion]);

  // Se extraen los datos de la clase activa (curso y módulo)
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId || !clases) return null;
    return clases.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clases, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Carga de versiones de actividades cuando cambia la clase activa
  useEffect(() => {
    let cancelado = false;

    setVersionSeleccionadaId(null);
    setVersiones([]);
    setDiscentes([]);

    if (!idCursoActivo || !idModuloActivo) {
      setCargandoVersiones(false);
      return;
    }

    const cargar = async () => {
      setCargandoVersiones(true);
      try {
        const resultado = await obtenerVersionesPorClase(idCursoActivo, idModuloActivo);
        if (!cancelado) {
          setVersiones(resultado || []);

          if (resultado && resultado.length > 0) {
            // Se preselecciona la versión recibida por estado si existe, o la primera por defecto
            const versionObjetivo =
              estadoNavegacion?.id_version && !estadoProcesadoRef.current
                ? resultado.find((v) => v.id_version === estadoNavegacion.id_version) || resultado[0]
                : resultado[0];

            estadoProcesadoRef.current = true;
            setVersionSeleccionadaId(versionObjetivo.id_version);

            // Si la versión no tiene evaluación asociada, se informa al docente con el diálogo modal
            if (!versionObjetivo.id_evaluacion && !versionObjetivo.evaluacionNombre) {
              setDialogoAvisoVisible(true);
            }

            await obtenerDiscentesConNotas(
              versionObjetivo.id_version,
              versionObjetivo.id_evaluacion,
              idCursoActivo,
              idModuloActivo
            );
          }
        }
      } catch (err) {
        console.error('Error al cargar versiones de la clase:', err);
        if (!cancelado) {
          setVersiones([]);
        }
      } finally {
        if (!cancelado) {
          setCargandoVersiones(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [
    idCursoActivo,
    idModuloActivo,
    obtenerVersionesPorClase,
    obtenerDiscentesConNotas,
    setDiscentes,
    estadoNavegacion
  ]);

  // Manejador del cambio manual de año académico
  const manejarCambioAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
    setClaseSeleccionadaId(null);
    setVersionSeleccionadaId(null);
    setVersiones([]);
    setDiscentes([]);
  };

  // Manejador del cambio manual de clase
  const manejarCambioClase = (nuevoIdClase) => {
    setClaseSeleccionadaId(nuevoIdClase);
  };

  // Manejador del cambio de versión seleccionada en el desplegable
  const manejarCambioVersion = async (nuevoIdVersion) => {
    setVersionSeleccionadaId(nuevoIdVersion);

    if (!nuevoIdVersion) {
      setDiscentes([]);
      return;
    }

    const versionEncontrada = versiones.find((v) => v.id_version === nuevoIdVersion);
    if (versionEncontrada) {
      // Si la versión carece de evaluación, se alerta al docente mediante el modal
      if (!versionEncontrada.id_evaluacion && !versionEncontrada.evaluacionNombre) {
        setDialogoAvisoVisible(true);
      }

      if (idCursoActivo && idModuloActivo) {
        await obtenerDiscentesConNotas(
          versionEncontrada.id_version,
          versionEncontrada.id_evaluacion,
          idCursoActivo,
          idModuloActivo
        );
      }
    }
  };

  // Objeto de la versión actualmente seleccionada
  const versionActiva = useMemo(() => {
    if (!versionSeleccionadaId || !versiones) return null;
    return versiones.find((v) => v.id_version === versionSeleccionadaId) || null;
  }, [versiones, versionSeleccionadaId]);

  // Manejador del guardado automático de nota por discente
  const manejarGuardarNota = async (idDiscente, nuevaNota) => {
    if (!versionActiva) return false;

    const { error } = await guardarNota(
      versionActiva.id_version,
      versionActiva.id_evaluacion,
      idDiscente,
      nuevaNota
    );

    if (error) {
      mostrarError(error.message || 'Error al guardar la calificación en la base de datos.');
      return false;
    }

    // Feedback visual silencioso confirmando el guardado automático
    mostrarExito('Nota guardada con éxito.');
    return true;
  };

  // Recarga unificada de todos los datos en cascada
  const manejarRecargar = async () => {
    await Promise.all([recargarAnios(), recargarClases()]);
    if (idCursoActivo && idModuloActivo) {
      setCargandoVersiones(true);
      try {
        const vers = await obtenerVersionesPorClase(idCursoActivo, idModuloActivo);
        setVersiones(vers || []);
        if (versionSeleccionadaId && versionActiva) {
          await obtenerDiscentesConNotas(
            versionActiva.id_version,
            versionActiva.id_evaluacion,
            idCursoActivo,
            idModuloActivo
          );
        }
      } finally {
        setCargandoVersiones(false);
      }
    }
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Calificar Actividades"
        descripcion="Calificación rápida y tabular de discentes por actividad práctica con guardado automático."
      />

      {/* 2. Barra de filtros contextuales (Año académico -> Clase -> Versiones) */}
      <FiltrosCalificar
        anios={anios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={manejarCambioAnio}
        cargandoAnios={cargandoAnios}
        clases={clases}
        claseSeleccionadaId={claseSeleccionadaId}
        onClaseChange={manejarCambioClase}
        cargandoClases={cargandoClases}
        versiones={versiones}
        versionSeleccionadaId={versionSeleccionadaId}
        onVersionChange={manejarCambioVersion}
        cargandoVersiones={cargandoVersiones}
        onRecargar={manejarRecargar}
      />

      {/* 3. Estados vacíos contextuales según la cascada de selección */}
      {!claseSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Clase"
          descripcion="Por favor, selecciona un año escolar y una clase en los desplegables superiores para comenzar."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {claseSeleccionadaId && versiones.length === 0 && !cargandoVersiones && (
        <EstadoVacio
          mensaje="Sin Actividades Configuradas"
          descripcion="La clase seleccionada no cuenta con versiones de prácticas vinculadas en este curso. Puedes configurarlas en el Taller de Prácticas."
          icono="pi pi-bookmark"
          className="w-full my-4"
        />
      )}

      {claseSeleccionadaId && versiones.length > 0 && !versionSeleccionadaId && (
        <EstadoVacio
          mensaje="Selecciona una Versión"
          descripcion="Elige una actividad o versión en el desplegable superior para cargar la tabla de notas de los alumnos."
          icono="pi pi-pencil"
          className="w-full my-4"
        />
      )}

      {/* 4. Zona principal de calificación cuando hay una versión activa */}
      {versionSeleccionadaId && versionActiva && (
        <div className="flex flex-column w-full">
          <ResumenCalificaciones
            discentes={discentes}
            version={versionActiva}
            onMostrarAviso={() => setDialogoAvisoVisible(true)}
          />

          <TablaCalificaciones
            discentes={discentes}
            cargando={cargandoDiscentes}
            guardando={guardando}
            onGuardarNota={manejarGuardarNota}
            onError={mostrarError}
          />
        </div>
      )}

      {/* 5. Diálogo modal de advertencia para actividades sin evaluación */}
      <DialogoSinEvaluacion
        visible={dialogoAvisoVisible}
        onHide={() => setDialogoAvisoVisible(false)}
        version={versionActiva}
      />
    </div>
  );
};

export default CalificarPagina;
