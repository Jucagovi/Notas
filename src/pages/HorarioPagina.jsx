import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import CabeceraHorarios from '../components/horarios/CabeceraHorarios.jsx';
import TablaTramosHorarios from '../components/horarios/TablaTramosHorarios.jsx';
import CuadriculaHorarioGrupo from '../components/horarios/CuadriculaHorarioGrupo.jsx';
import CuadriculaMiHorario from '../components/horarios/CuadriculaMiHorario.jsx';
import useCursos from '../hooks/useCursos.js';
import useHorarios from '../hooks/useHorarios.js';

/**
 * HorarioPagina - Página orquestadora del caso de uso 30 (Gestión de Horarios y Disponibilidad).
 *
 * Responsabilidad Única: Actuar como orquestador contenedor de datos y vistas para coordinar la
 * definición de tramos horarios, la plantilla semanal por grupos escolares y el horario consolidado
 * del docente titular organizado en un layout con TabView.
 */
const HorarioPagina = () => {
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [pestanyaActiva, setPestanyaActiva] = useState(0);

  // Se obtienen los cursos académicos disponibles en el centro mediante el hook correspondiente.
  const { datos: cursos, cargando: cargandoCursos } = useCursos();

  // Autoselección del primer curso académico disponible al completar la carga.
  useEffect(() => {
    if (!cursoSeleccionadoId && cursos && cursos.length > 0) {
      setCursoSeleccionadoId(cursos[0].id_curso);
    }
  }, [cursos, cursoSeleccionadoId]);

  // Hook especializado que aísla la carga y persistencia de sesiones y horarios con Supabase.
  const {
    sesiones,
    todasSesiones,
    horariosCurso,
    modulos,
    mapaModulos,
    mapaSesiones,
    horarioDocente,
    resumenDocente,
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

  const estaCargando = cargandoCursos || cargandoHorarios;

  return (
    <div className="flex flex-column w-full gap-4 pb-5">
      {/* Cabecera general de la página con selector de curso */}
      <CabeceraHorarios
        cursos={cursos}
        cursoId={cursoSeleccionadoId}
        onCambiarCurso={setCursoSeleccionadoId}
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
                horarioDocente={horarioDocente}
                mapaModulos={mapaModulos}
                mapaSesiones={mapaSesiones}
                resumenDocente={resumenDocente}
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
                cursos={cursos}
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
                cursos={cursos}
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
