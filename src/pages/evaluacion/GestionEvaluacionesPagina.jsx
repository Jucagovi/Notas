import React, { useState, useEffect } from 'react';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import EstadoVacio from '../../components/common/EstadoVacio.jsx';
import useCursos from '../../hooks/useCursos.js';
import useEvaluaciones from '../../hooks/useEvaluaciones.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import {
  FiltroCursoEvaluaciones,
  BandejaPendientesTarjetas,
  TablaEvaluaciones
} from '../../components/evaluaciones/index.js';

/**
 * GestionEvaluacionesPagina - Página orquestadora del Caso de Uso 05 (Gestión de Evaluaciones).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y estados para la asignación
 * manual de prácticas mediante tarjetas interactivas de bandeja de pendientes y visualización en
 * DataTable sin paginación con orden reglamentario estricto (Primera, Segunda, Tercera, Final y Extraordinaria).
 */
const GestionEvaluacionesPagina = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useGlobalToast();

  // 1. Hook para consulta del catálogo de Cursos Académicos.
  const {
    datos: cursos,
    cargando: cargandoCursos,
    obtenerDatos: recargarCursos
  } = useCursos();

  // Estado local para el curso activo seleccionado.
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);

  // Autoselección del primer curso disponible tras la carga inicial.
  useEffect(() => {
    if (cursos && cursos.length > 0 && !cursoSeleccionadoId) {
      setCursoSeleccionadoId(cursos[0].id_curso);
    }
  }, [cursos, cursoSeleccionadoId]);

  // 2. Custom Hook especializado para la gestión de Evaluaciones y Bandeja de Pendientes.
  const {
    evaluaciones,
    versionesHuerfanas,
    asignarPracticaAEvaluacion,
    desasignarPracticaDeEvaluacion,
    cargando: cargandoEvaluaciones,
    guardando,
    recargar: recargarEvaluaciones
  } = useEvaluaciones(cursoSeleccionadoId);

  // Manejador del cambio de curso.
  const manejarCambioCurso = (nuevoIdCurso) => {
    setCursoSeleccionadoId(nuevoIdCurso);
  };

  // Manejador para asignar una práctica desde la bandeja de pendientes a una evaluación específica.
  const manejarAsignarPractica = async (idVersion, idEvaluacion) => {
    const evaluacionDestino = (evaluaciones || []).find(
      (e) => e.id_evaluacion === idEvaluacion
    );
    const nombreEvaluacion = evaluacionDestino?.nombre || 'la evaluación';

    const exito = await asignarPracticaAEvaluacion(idVersion, idEvaluacion);
    if (exito) {
      mostrarExito(`Práctica asignada a ${nombreEvaluacion}.`);
    } else {
      mostrarError('Ocurrió un error al asignar la práctica a la evaluación.');
    }
  };

  // Manejador para desasignar una práctica desde la tabla de evaluaciones.
  const manejarDesasignarPractica = async (idVersion) => {
    const exito = await desasignarPracticaDeEvaluacion(idVersion);
    if (exito) {
      mostrarInfo('Práctica desasignada. Ha regresado a la bandeja de pendientes.');
    } else {
      mostrarError('Ocurrió un error al desasignar la práctica.');
    }
  };

  // Recarga unificada de catálogos.
  const manejarRecargar = async () => {
    await Promise.all([recargarCursos(), recargarEvaluaciones()]);
    mostrarInfo('Catálogo de evaluaciones y prácticas actualizado.');
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera principal estandarizada */}
      <HeaderPagina
        titulo="Gestión de Evaluaciones"
        descripcion="Asignación manual de actividades a las evaluaciones del curso mediante bandeja de pendientes y cálculo de cobertura curricular en tiempo real."
      />

      {/* 2. Barra superior con SelectorCurso y botón de actualización de datos */}
      <FiltroCursoEvaluaciones
        cursos={cursos}
        cursoSeleccionadoId={cursoSeleccionadoId}
        onCursoChange={manejarCambioCurso}
        cargandoCursos={cargandoCursos}
        totalHuerfanas={versionesHuerfanas.length}
        onRecargar={manejarRecargar}
        guardando={guardando}
      />

      {/* 3. Estados vacíos o renderizado principal */}
      {!cursoSeleccionadoId && (
        <EstadoVacio
          mensaje="Selecciona un Curso"
          descripcion="Por favor, selecciona un curso lectivo en el selector superior para listar y gestionar sus períodos de evaluación."
          icono="pi pi-building"
          className="w-full my-4"
        />
      )}

      {cursoSeleccionadoId && (
        <div className="flex flex-column w-full">
          {/* Área superior: Bandeja de Pendientes (Prácticas sin Asignar como Tarjetas) */}
          <BandejaPendientesTarjetas
            versionesHuerfanas={versionesHuerfanas}
            evaluaciones={evaluaciones}
            onAsignar={manejarAsignarPractica}
            guardando={guardando}
          />

          {/* Área inferior: DataTable de Evaluaciones con Prácticas Asignadas y Cobertura Curricular */}
          <TablaEvaluaciones
            evaluaciones={evaluaciones}
            cargando={cargandoEvaluaciones}
            onDesasignarPractica={manejarDesasignarPractica}
            guardando={guardando}
          />
        </div>
      )}
    </div>
  );
};

export default GestionEvaluacionesPagina;
