import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import FiltrosPesos from '../components/pesos/FiltrosPesos.jsx';
import ResumenPonderacion from '../components/pesos/ResumenPonderacion.jsx';
import TablaArbolPesos from '../components/pesos/TablaArbolPesos.jsx';
import useCursos from '../hooks/useCursos.js';
import useModulos from '../hooks/useModulos.js';
import useDatos from '../hooks/useDatos.js';
import usePesosCurriculares from '../hooks/usePesosCurriculares.js';
import useGlobalToast from '../hooks/useGlobalToast.js';

/**
 * Función auxiliar para verificar si un registro pertenece al curso académico actual (septiembre 2026 - agosto 2027).
 *
 * @param {Object} curso - Registro de la tabla Cursos representativo de la clase.
 * @returns {boolean} - Verdadero si corresponde al período lectivo 2026-2027.
 */
const perteneceAlCursoAcademicoActual = (curso) => {
  if (!curso) return false;

  // 1. Filtrado por año escolar textual canónico (ej: '2026-2027', '2026/2027', '2026')
  if (curso.anyo && String(curso.anyo).includes('2026')) {
    return true;
  }

  // 2. Filtrado por fecha oficial de inicio lectivo
  if (curso.fecha_inicio) {
    const fInicio = new Date(curso.fecha_inicio);
    if (!isNaN(fInicio.getTime())) {
      if (fInicio >= new Date('2026-09-01') && fInicio <= new Date('2027-08-31')) {
        return true;
      }
    }
  }

  // 3. Filtrado por fecha de creación en base de datos
  if (curso.created_at) {
    const fCreacion = new Date(curso.created_at);
    if (!isNaN(fCreacion.getTime())) {
      if (
        fCreacion >= new Date('2026-09-01T00:00:00Z') &&
        fCreacion <= new Date('2027-08-31T23:59:59Z')
      ) {
        return true;
      }
    }
  }

  return false;
};

/**
 * PesosRAPagina - Página orquestadora del caso de uso 16 (Configuración de Pesos Curriculares RA y CE).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y estados para la ponderación
 * de Resultados de Aprendizaje y Criterios de Evaluación por clase, delegando la presentación
 * en subcomponentes especializados y gestionando las notificaciones y advertencias globales.
 */
const PesosRAPagina = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarInfo, mostrarAdvertencia } = useGlobalToast();

  // Estados locales para la selección de la clase activa.
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);

  // Consulta de entidades maestras y relaciones para formar el listado de clases.
  const cursos = useCursos();
  const modulos = useModulos();
  const imparte = useDatos('imparte');
  const evaluaciones = useDatos('Evaluaciones');

  // Se cargan las relaciones imparte y evaluaciones al montar el componente.
  useEffect(() => {
    imparte.obtenerDatos('id_curso, id_modulo');
    evaluaciones.obtenerDatos('id_curso, id_modulo');
  }, []);

  // Construcción consolidada de las clases disponibles filtrando exclusivamente las del curso actual.
  const clasesDisponibles = useMemo(() => {
    const mapa = new Map();
    // Se filtran estrictamente las clases creadas durante el curso académico actual (septiembre 2026 a agosto 2027).
    const listaCursosActuales = (cursos.datos || []).filter(perteneceAlCursoAcademicoActual);
    const idsCursosValidos = new Set(listaCursosActuales.map((c) => c.id_curso));
    const listaModulos = modulos.datos || [];

    // Se consideran únicamente los módulos vinculados a través de clases ya creadas (Evaluaciones o imparte).
    const relaciones = [
      ...(evaluaciones.datos || []),
      ...(imparte.datos || [])
    ];

    relaciones.forEach((rel) => {
      if (rel.id_curso && rel.id_modulo && idsCursosValidos.has(rel.id_curso)) {
        const clave = `${rel.id_curso}_${rel.id_modulo}`;
        if (!mapa.has(clave)) {
          const c = listaCursosActuales.find((item) => item.id_curso === rel.id_curso);
          const m = listaModulos.find((item) => item.id_modulo === rel.id_modulo);
          if (c && m) {
            mapa.set(clave, {
              id: clave,
              id_curso: rel.id_curso,
              id_modulo: rel.id_modulo,
              cursoNombre: c.nombre,
              moduloSiglas: m.siglas,
              moduloNombre: m.nombre,
              etiqueta: `${c.nombre} — ${m.siglas}: ${m.nombre}`
            });
          }
        }
      }
    });

    return Array.from(mapa.values());
  }, [cursos.datos, modulos.datos, imparte.datos, evaluaciones.datos]);

  // Selección automática de la primera clase disponible tras finalizar la carga inicial.
  useEffect(() => {
    if (!claseSeleccionadaId && clasesDisponibles.length > 0) {
      setClaseSeleccionadaId(clasesDisponibles[0].id);
    } else if (
      claseSeleccionadaId &&
      clasesDisponibles.length > 0 &&
      !clasesDisponibles.some((c) => c.id === claseSeleccionadaId)
    ) {
      setClaseSeleccionadaId(clasesDisponibles[0].id);
    } else if (clasesDisponibles.length === 0) {
      setClaseSeleccionadaId(null);
    }
  }, [clasesDisponibles, claseSeleccionadaId]);

  // Se extraen los identificadores de curso y módulo de la clase seleccionada.
  const claseActiva = useMemo(() => {
    return clasesDisponibles.find((c) => c.id === claseSeleccionadaId) || null;
  }, [clasesDisponibles, claseSeleccionadaId]);

  const idCursoActivo = claseActiva?.id_curso || null;
  const idModuloActivo = claseActiva?.id_modulo || null;

  // Custom Hook orquestador para la consulta y mutación de pesos curriculares de la clase.
  const {
    arbolNodos,
    estadisticas,
    cargando: cargandoPesos,
    guardando,
    hayCambios,
    actualizarPesoRA,
    actualizarPesoCE,
    distribuirPesosEquitativamente,
    distribuirPesosCEEquitativamente,
    guardarPesos,
    restablecerPesos,
    recargar
  } = usePesosCurriculares(idCursoActivo, idModuloActivo);

  // Manejo de la acción de guardado con feedback contextual adaptado al estado del balance.
  const manejarGuardar = async () => {
    const respuesta = await guardarPesos();

    if (respuesta?.ok) {
      if (estadisticas.todoEquilibrado) {
        mostrarExito(
          'Ponderaciones de la clase guardadas con éxito y balanceadas al 100%.',
          'Ponderación Guardada'
        );
      } else {
        mostrarInfo(
          'Ponderaciones de la clase guardadas como borrador. Recuerda completar el balanceo al 100% antes de emitir actas finales.',
          'Borrador Guardado'
        );
      }
    } else {
      mostrarError(
        respuesta?.error || 'Ocurrió un error al persistir los pesos curriculares de la clase.',
        'Error al Guardar'
      );
    }
  };

  // Manejo del reparto automático equitativo con notificación al usuario.
  const manejarDistribuirEquitativo = () => {
    distribuirPesosEquitativamente();
    mostrarInfo(
      'Se han distribuido los pesos al 100% de forma equitativa entre todos los RA y CE de la clase. Pulse "Guardar Ponderación" para confirmar.',
      'Reparto Equitativo'
    );
  };

  // Manejo del restablecimiento de valores.
  const manejarRestablecer = () => {
    restablecerPesos();
    mostrarAdvertencia(
      'Se han descartado los cambios en edición y restablecido los valores guardados de la clase.',
      'Cambios Descartados'
    );
  };

  const cargandoClases = cursos.cargando || modulos.cargando;

  return (
    <div className="flex flex-column w-full">
      {/* Cabecera estándar de la página */}
      <HeaderPagina
        titulo="Pesos RA y CE"
        descripcion="Definición jerárquica de la ponderación porcentual de los Resultados de Aprendizaje en la nota final del módulo y de los Criterios de Evaluación dentro de cada RA para la clase seleccionada."
      />

      {/* Barra superior de filtros y controles contextuales */}
      <FiltrosPesos
        claseSeleccionadaId={claseSeleccionadaId}
        onClaseChange={setClaseSeleccionadaId}
        clases={clasesDisponibles}
        cargandoClases={cargandoClases}
        onDistribuirEquitativo={manejarDistribuirEquitativo}
        onRestablecer={manejarRestablecer}
        onRecargar={recargar}
        onGuardar={manejarGuardar}
        cargando={cargandoPesos}
        guardando={guardando}
        hayCambios={hayCambios}
        totalRA={estadisticas.totalRA}
      />

      {/* Animación Skeleton durante la consulta inicial */}
      {cargandoPesos && arbolNodos.length === 0 ? (
        <CargadorSeccion tipo="tabla" filas={6} columnas={4} />
      ) : claseSeleccionadaId && arbolNodos.length > 0 ? (
        <>
          {/* Panel de validación y retroalimentación visual de coherencia */}
          <ResumenPonderacion
            estadisticas={estadisticas}
            hayCambios={hayCambios}
          />

          {/* Editor jerárquico principal en formato TreeTable */}
          <TablaArbolPesos
            arbolNodos={arbolNodos}
            claseId={claseSeleccionadaId}
            onActualizarPesoRA={actualizarPesoRA}
            onActualizarPesoCE={actualizarPesoCE}
            onDistribuirCE={distribuirPesosCEEquitativamente}
            cargando={cargandoPesos}
            guardando={guardando}
            sumaPesosRA={estadisticas.sumaPesosRA}
          />
        </>
      ) : claseSeleccionadaId && arbolNodos.length === 0 && !cargandoPesos ? (
        <TablaArbolPesos
          arbolNodos={[]}
          claseId={claseSeleccionadaId}
          cargando={false}
          guardando={false}
          sumaPesosRA={0}
        />
      ) : (
        /* Estado vacío si no hay ninguna clase seleccionada o no existen clases creadas en el curso actual */
        <EstadoVacio
          icono="pi pi-sliders-h"
          mensaje={
            clasesDisponibles.length === 0
              ? 'No hay clases creadas en el curso actual'
              : 'Seleccione una clase'
          }
          descripcion={
            clasesDisponibles.length === 0
              ? 'No se han encontrado clases ni módulos configurados para el curso académico 2026-2027 (septiembre 2026 a agosto 2027). Debe crear una clase previamente desde la sección de Clases.'
              : 'Elija una clase en el selector superior para visualizar y configurar las ponderaciones curriculares de sus Resultados de Aprendizaje y Criterios.'
          }
          botonLabel={clasesDisponibles.length === 0 ? 'Crear Clase' : undefined}
          botonIcono="pi pi-plus"
          onAccion={clasesDisponibles.length === 0 ? () => navigate('/clases?pestanya=crear') : undefined}
        />
      )}
    </div>
  );
};

export default PesosRAPagina;
