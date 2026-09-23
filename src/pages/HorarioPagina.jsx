import React, { useState, useEffect, useMemo } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import CabeceraHorarios from '../components/horarios/CabeceraHorarios.jsx';
import TablaTramosHorarios from '../components/horarios/TablaTramosHorarios.jsx';
import CuadriculaHorarioGrupo from '../components/horarios/CuadriculaHorarioGrupo.jsx';
import CuadriculaMiHorario from '../components/horarios/CuadriculaMiHorario.jsx';
import useCursos from '../hooks/useCursos.js';
import useHorarios from '../hooks/useHorarios.js';
import { extraerAnioInicioCurso } from '../utils/fechas.js';

/**
 * HorarioPagina - Página orquestadora del caso de uso 30 (Gestión de Horarios y Disponibilidad).
 *
 * Responsabilidad Única: Actuar como orquestador contenedor de datos y vistas para coordinar la
 * definición de tramos horarios, la plantilla semanal por cursos y el horario consolidado
 * del docente titular filtrado por año académico mediante un Dropdown en la cabecera general.
 */
const HorarioPagina = () => {
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [pestanyaActiva, setPestanyaActiva] = useState(0);

  // Se obtienen los cursos académicos disponibles en el centro mediante el hook correspondiente.
  const { datos: cursos, cargando: cargandoCursos } = useCursos();

  // Se calculan los años académicos únicos con formato visual YYYY/YYYY+1 (ej. 2026 -> "2026/2027").
  const opcionesAnios = useMemo(() => {
    const aniosRegistrados = new Set();
    const lista = [];

    (cursos || []).forEach((c) => {
      const anioInicio = extraerAnioInicioCurso(c);
      if (anioInicio && !aniosRegistrados.has(anioInicio)) {
        aniosRegistrados.add(anioInicio);
        lista.push({
          label: `${anioInicio}/${anioInicio + 1}`,
          value: anioInicio
        });
      }
    });

    // Ordenación descendente por año de inicio (años más recientes primero).
    lista.sort((a, b) => b.value - a.value);

    // En caso de que no existan cursos dados de alta todavía, se provee el año escolar actual como respaldo.
    if (lista.length === 0) {
      const hoy = new Date();
      const anioBase = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
      lista.push(
        { label: `${anioBase}/${anioBase + 1}`, value: anioBase },
        { label: `${anioBase + 1}/${anioBase + 2}`, value: anioBase + 1 }
      );
    }

    return lista;
  }, [cursos]);

  // Se autoselecciona el primer año académico disponible si no hay ninguno seleccionado.
  useEffect(() => {
    if (!anioSeleccionado && opcionesAnios.length > 0) {
      setAnioSeleccionado(opcionesAnios[0].value);
    }
  }, [opcionesAnios, anioSeleccionado]);

  // Cursos filtrados estrictamente por el año académico seleccionado en el Dropdown superior.
  const cursosFiltrados = useMemo(() => {
    if (!cursos || cursos.length === 0) return [];
    if (!anioSeleccionado) return cursos;
    return cursos.filter((c) => extraerAnioInicioCurso(c) === anioSeleccionado);
  }, [cursos, anioSeleccionado]);

  // Sincronización del curso seleccionado con los cursos pertenecientes al año académico activo.
  useEffect(() => {
    if (cursosFiltrados.length > 0) {
      const existeEnAnio = cursosFiltrados.some((c) => c.id_curso === cursoSeleccionadoId);
      if (!existeEnAnio) {
        setCursoSeleccionadoId(cursosFiltrados[0].id_curso);
      }
    } else {
      setCursoSeleccionadoId(null);
    }
  }, [cursosFiltrados, cursoSeleccionadoId]);

  // Hook especializado que aísla la carga y persistencia de sesiones y horarios con Supabase.
  const {
    sesiones,
    todasSesiones,
    horariosCurso,
    modulos,
    mapaModulos,
    mapaSesiones,
    horarioDocente,
    cargando: cargandoHorarios,
    guardando,
    crearSesion,
    actualizarSesion,
    eliminarSesion,
    generarSesionesPredeterminadas,
    clonarSesionesDeCurso,
    guardarClaseHorario,
    eliminarClaseHorario,
    guardarTareaNoLectiva,
    eliminarTareaNoLectiva
  } = useHorarios(cursoSeleccionadoId);

  // Horario docente filtrado para incluir tareas personales y clases de cursos del año escolar activo.
  const horarioDocenteFiltrado = useMemo(() => {
    const idsCursosValidos = new Set(cursosFiltrados.map((c) => c.id_curso));
    return horarioDocente.filter((h) => {
      // 1. Si tiene id_curso directo (clase de módulo), se comprueba que pertenezca al año activo.
      if (h.id_curso) {
        return idsCursosValidos.has(h.id_curso);
      }
      // 2. Si no tiene id_curso directo (tarea personal del docente), se valida mediante el curso de su sesión.
      const sesionAsociada = mapaSesiones?.get(h.id_sesion);
      if (sesionAsociada?.id_curso) {
        return idsCursosValidos.has(sesionAsociada.id_curso);
      }
      return false;
    });
  }, [horarioDocente, cursosFiltrados, mapaSesiones]);

  // Métricas cuantitativas del horario docente correspondientes al año escolar activo.
  const resumenDocenteFiltrado = useMemo(() => {
    const clasesLectivas = horarioDocenteFiltrado.filter((h) => {
      const esClaseCurricular = h.id_curso !== null && Boolean(h.id_curso);
      const esTareaPersonalLectiva =
        (!h.id_curso || h.id_curso === null) &&
        Boolean(h.es_lectiva || (h.grupo && h.grupo.toLowerCase().includes('lectiva')));
      return esClaseCurricular || esTareaPersonalLectiva;
    });

    const tareasNoLectivas = horarioDocenteFiltrado.filter((h) => {
      const esTareaPersonal = !h.id_curso || h.id_curso === null;
      const esTareaPersonalLectiva = Boolean(
        h.es_lectiva || (h.grupo && h.grupo.toLowerCase().includes('lectiva'))
      );
      return esTareaPersonal && !esTareaPersonalLectiva;
    });

    const horasLectivas = clasesLectivas.length;
    const horasNoLectivas = tareasNoLectivas.length;
    const horasTotales = horasLectivas + horasNoLectivas;

    const gruposDistintos = new Set(
      clasesLectivas
        .filter((h) => h.id_curso && h.grupo && !h.grupo.toLowerCase().startsWith('docente'))
        .map((h) => h.grupo)
        .filter(Boolean)
    ).size;

    return {
      horasLectivas,
      horasNoLectivas,
      horasTotales,
      gruposDistintos
    };
  }, [horarioDocenteFiltrado]);

  const estaCargando = cargandoCursos || cargandoHorarios;

  return (
    <div className="flex flex-column w-full gap-4 pb-5">
      {/* Cabecera general de la página con Dropdown de año académico */}
      <CabeceraHorarios
        anioSeleccionado={anioSeleccionado}
        opcionesAnios={opcionesAnios}
        onCambiarAnio={setAnioSeleccionado}
        cargando={cargandoCursos}
      />

      {/* Estado de carga inicial mientras se recuperan los cursos */}
      {cargandoCursos && !cursoSeleccionadoId ? (
        <CargadorSeccion tipo="formulario" filas={2} />
      ) : cursos.length === 0 ? (
        <EstadoVacio
          mensaje="No existen cursos académicos"
          descripcion="Para configurar la plantilla horaria es necesario registrar previamente un curso académico en el sistema."
          icono="pi pi-calendar-times"
        />
      ) : (
        /* Layout principal estructurado en 3 pestañas funcionales */
        <div className="surface-card border-round shadow-1">
          <TabView
            activeIndex={pestanyaActiva}
            onTabChange={(e) => setPestanyaActiva(e.index)}
          >
            {/* Pestaña 1: Mi Horario Docente (Global) */}
            <TabPanel
              header="Mi Horario Docente (Global)"
              leftIcon="pi pi-calendar mr-2"
            >
              <CuadriculaMiHorario
                sesiones={sesiones.length > 0 ? sesiones : todasSesiones.filter((s) => s.id_curso === cursoSeleccionadoId)}
                horarioDocente={horarioDocenteFiltrado}
                mapaModulos={mapaModulos}
                mapaSesiones={mapaSesiones}
                resumenDocente={resumenDocenteFiltrado}
                onGuardarTareaNoLectiva={guardarTareaNoLectiva}
                onEliminarTareaNoLectiva={eliminarTareaNoLectiva}
                onIrAGrupos={() => setPestanyaActiva(1)}
                onIrATramos={() => setPestanyaActiva(2)}
                guardando={guardando}
              />
            </TabPanel>

            {/* Pestaña 2: Horario por Cursos */}
            <TabPanel
              header="Horario por Cursos"
              leftIcon="pi pi-th-large mr-2"
            >
              <CuadriculaHorarioGrupo
                cursos={cursosFiltrados}
                cursoId={cursoSeleccionadoId}
                onSeleccionarCurso={setCursoSeleccionadoId}
                sesiones={sesiones}
                horarios={horariosCurso}
                modulos={modulos}
                mapaModulos={mapaModulos}
                onGuardarClase={guardarClaseHorario}
                onEliminarClase={eliminarClaseHorario}
                onIrATramos={() => setPestanyaActiva(2)}
                guardando={guardando}
              />
            </TabPanel>

            {/* Pestaña 3: Configuración de Tramos */}
            <TabPanel
              header="Configuración de Tramos"
              leftIcon="pi pi-clock mr-2"
            >
              <TablaTramosHorarios
                sesiones={sesiones}
                onCrearTramo={crearSesion}
                onActualizarTramo={actualizarSesion}
                onEliminarTramo={eliminarSesion}
                onGenerarPredeterminados={generarSesionesPredeterminadas}
                onClonarTramos={clonarSesionesDeCurso}
                cursos={cursosFiltrados}
                cursoId={cursoSeleccionadoId}
                cargando={estaCargando}
                guardando={guardando}
              />
            </TabPanel>
          </TabView>
        </div>
      )}
    </div>
  );
};

export default HorarioPagina;
