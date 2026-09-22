import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import useGlobalToast from './useGlobalToast.js';
import {
  TRAMOS_PREDETERMINADOS,
  formatearHoraParaBD,
  esHoraValida
} from '../components/horarios/constantesHorarios.js';

/**
 * useHorarios - Custom Hook para la gestión integral de sesiones y cuadrícula de horarios semanales.
 *
 * Responsabilidad Única: Aislar la comunicación con Supabase mediante useDatos para administrar
 * los tramos horarios (tabla Sesiones) y la cuadrícula lectiva (tabla Horarios), ofreciendo operaciones
 * CRUD, cálculo de grupos y filtrado del horario personal del docente.
 *
 * @param {string|null} cursoId - Identificador del curso académico seleccionado.
 * @param {boolean} [autoCargar=true] - Indicador para disparar la carga automática.
 */
const useHorarios = (cursoId, autoCargar = true) => {
  const [sesiones, setSesiones] = useState([]);
  const [todasSesiones, setTodasSesiones] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Notificaciones globales del sistema.
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Acceso desacoplado a las tablas requeridas mediante useDatos.
  const {
    obtenerDatos: obtenerSesionesDb,
    insertar: insertarSesionDb,
    actualizar: actualizarSesionDb,
    eliminar: eliminarSesionDb
  } = useDatos('Sesiones');

  const {
    obtenerDatos: obtenerHorariosDb,
    insertar: insertarHorarioDb,
    actualizar: actualizarHorarioDb,
    eliminar: eliminarHorarioDb
  } = useDatos('Horarios');

  const {
    obtenerDatos: obtenerModulosDb
  } = useDatos('Modulos');

  // Carga inicial y sincronización de sesiones, horarios y módulos.
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      // 1. Se obtienen los módulos curriculares registrados en el sistema.
      const datosModulos = await obtenerModulosDb('*', (consulta) =>
        consulta.order('siglas', { ascending: true })
      );
      setModulos(datosModulos || []);

      // 2. Se obtienen todas las sesiones horarias para permitir mapeo entre cursos.
      const datosSesiones = await obtenerSesionesDb('*', (consulta) =>
        consulta.order('numero', { ascending: true })
      );
      const listaSesiones = datosSesiones || [];
      setTodasSesiones(listaSesiones);

      if (cursoId) {
        setSesiones(listaSesiones.filter((s) => s.id_curso === cursoId));
      } else {
        setSesiones([]);
      }

      // 3. Se obtienen los registros del horario semanal (todas las asignaciones y tareas no lectivas).
      const datosHorarios = await obtenerHorariosDb('*');
      setHorarios(datosHorarios || []);
    } catch (err) {
      console.error('Error al cargar la información de horarios:', err);
      mostrarError('No se pudo cargar la información de los horarios.', 'Error de carga');
    } finally {
      setCargando(false);
    }
  }, [cursoId, obtenerModulosDb, obtenerSesionesDb, obtenerHorariosDb, mostrarError]);

  useEffect(() => {
    if (autoCargar) {
      recargar();
    }
  }, [cursoId, autoCargar, recargar]);

  // Lista de horarios asignados específicamente al curso académico seleccionado.
  const horariosCurso = useMemo(() => {
    if (!cursoId) return [];
    return horarios.filter((h) => h.id_curso === cursoId);
  }, [horarios, cursoId]);

  // Lista única de grupos existentes registrados en los horarios del curso actual.
  const grupos = useMemo(() => {
    const conjunto = new Set();
    horariosCurso.forEach((item) => {
      if (item.grupo && typeof item.grupo === 'string' && item.grupo.trim() !== '') {
        conjunto.add(item.grupo.trim());
      }
    });
    return Array.from(conjunto).sort((a, b) => a.localeCompare(b, 'es'));
  }, [horariosCurso]);

  // Mapa asociativo de módulos indexados por id_modulo para resolución inmediata de siglas y nombres.
  const mapaModulos = useMemo(() => {
    const mapa = new Map();
    modulos.forEach((m) => {
      mapa.set(m.id_modulo, m);
    });
    return mapa;
  }, [modulos]);

  // Mapa asociativo de sesiones horarias indexadas por id_sesion.
  const mapaSesiones = useMemo(() => {
    const mapa = new Map();
    todasSesiones.forEach((s) => {
      mapa.set(s.id_sesion, s);
    });
    return mapa;
  }, [todasSesiones]);

  // Determina si un registro de horario pertenece al horario del docente titular (clase o tarea no lectiva).
  const esClaseDelDocente = useCallback((item) => {
    if (!item) return false;
    // Si no tiene id_curso vinculado, es una tarea no lectiva propia del docente (Guardia, Reunión, Tutoría).
    if (item.id_curso === null || !item.id_curso) return true;
    // Si tiene un id_modulo vinculado, se considera clase impartida por el docente titular.
    if (item.id_modulo) return true;
    // Si el texto del profesor hace referencia explícita al docente titular.
    if (item.profesor && typeof item.profesor === 'string') {
      const texto = item.profesor.trim().toLowerCase();
      if (texto.includes('docente') || texto === 'yo' || texto === 'titular') {
        return true;
      }
    }
    return false;
  }, []);

  // Horario semanal global del docente titular que consolida clases lectivas y tareas no lectivas.
  const horarioDocente = useMemo(() => {
    return horarios.filter(esClaseDelDocente);
  }, [horarios, esClaseDelDocente]);

  // Resumen cuantitativo de la carga horaria semanal del docente desglosada por tipo de actividad.
  const resumenDocente = useMemo(() => {
    const clasesLectivas = horarioDocente.filter((h) => h.id_curso !== null && Boolean(h.id_curso));
    const tareasNoLectivas = horarioDocente.filter((h) => h.id_curso === null || !h.id_curso);

    const horasLectivas = clasesLectivas.length;
    const horasNoLectivas = tareasNoLectivas.length;
    const horasTotales = horasLectivas + horasNoLectivas;

    const gruposDistintos = new Set(
      clasesLectivas.map((h) => h.grupo).filter(Boolean)
    ).size;

    const modulosDistintos = new Set(
      clasesLectivas
        .map((h) => h.id_modulo || h.modulo_alt)
        .filter(Boolean)
    ).size;

    return {
      horasLectivas,
      horasNoLectivas,
      horasTotales,
      gruposDistintos,
      modulosDistintos
    };
  }, [horarioDocente]);

  // ==========================================
  // GESTIÓN DE SESIONES / TRAMOS HORARIOS
  // ==========================================

  // Inserción de un nuevo tramo horario en el curso actual.
  const crearSesion = useCallback(
    async ({ numero, hora_inicio, hora_fin, descripcion }) => {
      if (!cursoId) {
        mostrarAdvertencia('Debes seleccionar un curso académico.', 'Validación');
        return null;
      }

      if (!numero || isNaN(Number(numero))) {
        mostrarAdvertencia('El número de tramo debe ser un valor numérico.', 'Validación');
        return null;
      }

      if (!esHoraValida(hora_inicio) || !esHoraValida(hora_fin)) {
        mostrarAdvertencia('Las horas de inicio y fin deben tener formato válido (HH:mm).', 'Validación');
        return null;
      }

      setGuardando(true);
      try {
        const nuevaSesion = {
          id_curso: cursoId,
          numero: Number(numero),
          hora_inicio: formatearHoraParaBD(hora_inicio),
          hora_fin: formatearHoraParaBD(hora_fin),
          descripcion: descripcion ? String(descripcion).trim() : null
        };

        const resultado = await insertarSesionDb(nuevaSesion);
        if (resultado && resultado.length > 0) {
          const insertada = resultado[0];
          setSesiones((prev) =>
            [...prev, insertada].sort((a, b) => a.numero - b.numero)
          );
          mostrarExito('Tramo horario creado correctamente.');
          return insertada;
        }
        return null;
      } catch (err) {
        console.error('Error al crear la sesión horaria:', err);
        mostrarError('No se pudo crear el tramo horario.', 'Error de guardado');
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [cursoId, insertarSesionDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // Actualización de campos de un tramo horario existente (soporta edición en celda de DataTable).
  const actualizarSesion = useCallback(
    async (idSesion, cambios) => {
      if (!idSesion) return false;

      // Validación opcional de horas si vienen incluidas en los cambios.
      if (cambios.hora_inicio && !esHoraValida(cambios.hora_inicio)) {
        mostrarAdvertencia('La hora de inicio no es válida.', 'Validación');
        return false;
      }
      if (cambios.hora_fin && !esHoraValida(cambios.hora_fin)) {
        mostrarAdvertencia('La hora de finalización no es válida.', 'Validación');
        return false;
      }

      const datosLimpios = { ...cambios };
      if (datosLimpios.hora_inicio) {
        datosLimpios.hora_inicio = formatearHoraParaBD(datosLimpios.hora_inicio);
      }
      if (datosLimpios.hora_fin) {
        datosLimpios.hora_fin = formatearHoraParaBD(datosLimpios.hora_fin);
      }
      if (datosLimpios.numero !== undefined) {
        datosLimpios.numero = Number(datosLimpios.numero);
      }

      try {
        const resultado = await actualizarSesionDb('id_sesion', idSesion, datosLimpios);
        if (resultado) {
          setSesiones((prev) =>
            prev
              .map((s) => (s.id_sesion === idSesion ? { ...s, ...datosLimpios } : s))
              .sort((a, b) => a.numero - b.numero)
          );
          mostrarExito('Tramo horario actualizado correctamente.');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al actualizar el tramo horario:', err);
        mostrarError('No se pudo actualizar el tramo horario.', 'Error');
        return false;
      }
    },
    [actualizarSesionDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // Eliminación de un tramo horario y limpieza reactiva de los registros dependientes en memoria.
  const eliminarSesion = useCallback(
    async (idSesion) => {
      if (!idSesion) return false;
      try {
        const exito = await eliminarSesionDb('id_sesion', idSesion);
        if (exito) {
          setSesiones((prev) => prev.filter((s) => s.id_sesion !== idSesion));
          setHorarios((prev) => prev.filter((h) => h.id_sesion !== idSesion));
          mostrarExito('Tramo horario eliminado correctamente.');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al eliminar el tramo horario:', err);
        mostrarError('No se pudo eliminar el tramo horario.', 'Error');
        return false;
      }
    },
    [eliminarSesionDb, mostrarExito, mostrarError]
  );

  // Generación de tramos predeterminados o personalizados a partir de un rango horario.
  const generarSesionesPredeterminadas = useCallback(
    async (tramosPersonalizados = null) => {
      if (!cursoId) {
        mostrarAdvertencia('Selecciona primero un curso académico.', 'Validación');
        return false;
      }

      const plantilla = Array.isArray(tramosPersonalizados) && tramosPersonalizados.length > 0
        ? tramosPersonalizados
        : TRAMOS_PREDETERMINADOS;

      setGuardando(true);
      try {
        // Se limpian primero las sesiones previas del curso si ya existían para evitar inconsistencias.
        if (sesiones.length > 0) {
          for (const s of sesiones) {
            await eliminarSesionDb('id_sesion', s.id_sesion);
          }
        }

        const tramosAInsertar = plantilla.map((tramo) => ({
          id_curso: cursoId,
          numero: Number(tramo.numero),
          hora_inicio: formatearHoraParaBD(tramo.hora_inicio),
          hora_fin: formatearHoraParaBD(tramo.hora_fin),
          descripcion: tramo.descripcion ? String(tramo.descripcion).trim() : null
        }));

        const resultado = await insertarSesionDb(tramosAInsertar);
        if (resultado && resultado.length > 0) {
          setSesiones(resultado.sort((a, b) => a.numero - b.numero));
          mostrarExito('Se han generado los tramos horarios correctamente.');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al generar tramos horarios:', err);
        mostrarError('No se pudieron generar los tramos horarios.', 'Error');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cursoId, sesiones, eliminarSesionDb, insertarSesionDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // Clona la configuración de tramos horarios desde otro curso académico previo.
  const clonarSesionesDeCurso = useCallback(
    async (cursoOrigenId) => {
      if (!cursoId) {
        mostrarAdvertencia('Selecciona primero un curso de destino.', 'Validación');
        return false;
      }
      if (!cursoOrigenId || cursoOrigenId === cursoId) {
        mostrarAdvertencia('Selecciona un curso de origen diferente.', 'Validación');
        return false;
      }

      setGuardando(true);
      try {
        // Se consultan los tramos existentes en el curso de origen.
        const sesionesOrigen = await obtenerSesionesDb('*', (consulta) =>
          consulta.eq('id_curso', cursoOrigenId).order('numero', { ascending: true })
        );

        if (!sesionesOrigen || sesionesOrigen.length === 0) {
          mostrarAdvertencia(
            'El curso de origen seleccionado no tiene tramos horarios configurados.',
            'Sin tramos'
          );
          return false;
        }

        // Si el curso actual ya cuenta con sesiones, se limpian previamente para evitar solapamientos.
        if (sesiones.length > 0) {
          for (const s of sesiones) {
            await eliminarSesionDb('id_sesion', s.id_sesion);
          }
        }

        // Se preparan los nuevos registros de sesiones para el curso actual.
        const nuevosTramos = sesionesOrigen.map((s) => ({
          id_curso: cursoId,
          numero: Number(s.numero),
          hora_inicio: s.hora_inicio,
          hora_fin: s.hora_fin,
          descripcion: s.descripcion
        }));

        const resultado = await insertarSesionDb(nuevosTramos);
        if (resultado && resultado.length > 0) {
          setSesiones(resultado.sort((a, b) => a.numero - b.numero));
          mostrarExito(`Se han clonado ${resultado.length} tramos horarios correctamente.`);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al clonar los tramos horarios:', err);
        mostrarError('No se pudieron clonar los tramos horarios del curso seleccionado.', 'Error');
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [cursoId, sesiones, obtenerSesionesDb, eliminarSesionDb, insertarSesionDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // ==========================================
  // GESTIÓN DE HORARIOS / CUADRÍCULA LECTIVA
  // ==========================================

  // Guarda o actualiza una asignación lectiva para un tramo, día y grupo específicos.
  const guardarClaseHorario = useCallback(
    async ({
      id_horario,
      id_curso,
      id_sesion,
      dia_semana,
      grupo,
      es_mi_clase,
      id_modulo,
      modulo_alt,
      profesor,
      aula
    }) => {
      const cursoObjetivoId = id_curso || cursoId;
      if (!cursoObjetivoId) {
        mostrarAdvertencia('Debes seleccionar un curso académico.', 'Validación');
        return null;
      }
      if (!id_sesion) {
        mostrarAdvertencia('Debes especificar la sesión horaria.', 'Validación');
        return null;
      }
      if (!dia_semana || dia_semana < 1 || dia_semana > 7) {
        mostrarAdvertencia('Debes indicar un día de la semana válido.', 'Validación');
        return null;
      }
      if (!grupo || String(grupo).trim() === '') {
        mostrarAdvertencia('Debes indicar el nombre del grupo.', 'Validación');
        return null;
      }

      setGuardando(true);
      try {
        const grupoNormalizado = String(grupo).trim();

        // Preparación del objeto conforme al esquema de la base de datos.
        const registroAGuardar = {
          id_curso: cursoObjetivoId,
          id_sesion,
          dia_semana: Number(dia_semana),
          grupo: grupoNormalizado,
          id_modulo: es_mi_clase ? id_modulo || null : null,
          modulo_alt: es_mi_clase ? null : (modulo_alt ? String(modulo_alt).trim() : null),
          profesor: es_mi_clase ? 'Docente titular' : (profesor ? String(profesor).trim() : null),
          aula: aula ? String(aula).trim() : null
        };

        // Se localiza si ya existía un registro para esa celda mediante id_horario o por unicidad.
        const existente = id_horario
          ? horarios.find((h) => h.id_horario === id_horario)
          : horarios.find(
              (h) =>
                h.id_curso === cursoObjetivoId &&
                h.id_sesion === id_sesion &&
                Number(h.dia_semana) === Number(dia_semana) &&
                h.grupo.toLowerCase() === grupoNormalizado.toLowerCase()
            );

        if (existente && existente.id_horario) {
          // Se actualiza el registro preexistente.
          const resActualizar = await actualizarHorarioDb(
            'id_horario',
            existente.id_horario,
            registroAGuardar
          );
          if (resActualizar) {
            setHorarios((prev) =>
              prev.map((h) =>
                h.id_horario === existente.id_horario
                  ? { ...h, ...registroAGuardar }
                  : h
              )
            );
            mostrarExito('Clase actualizada en el horario correctamente.');
            return { ...existente, ...registroAGuardar };
          }
        } else {
          // Se inserta una nueva asignación lectiva.
          const resInsertar = await insertarHorarioDb(registroAGuardar);
          if (resInsertar && resInsertar.length > 0) {
            const nueva = resInsertar[0];
            setHorarios((prev) => [...prev, nueva]);
            mostrarExito('Clase asignada al horario correctamente.');
            return nueva;
          }
        }
        return null;
      } catch (err) {
        console.error('Error al guardar la clase en el horario:', err);
        mostrarError('No se pudo guardar la clase en el horario.', 'Error de guardado');
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [cursoId, horarios, actualizarHorarioDb, insertarHorarioDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // Inserción o actualización de tareas no lectivas (Guardias, Reuniones, Tutorías) sin id_curso ni id_modulo.
  const guardarTareaNoLectiva = useCallback(
    async ({ id_horario, id_sesion, dia_semana, nombreTarea, aula }) => {
      if (!id_sesion) {
        mostrarAdvertencia('Debes especificar la sesión horaria.', 'Validación');
        return null;
      }
      if (!dia_semana || dia_semana < 1 || dia_semana > 7) {
        mostrarAdvertencia('Debes indicar un día de la semana válido.', 'Validación');
        return null;
      }
      if (!nombreTarea || String(nombreTarea).trim() === '') {
        mostrarAdvertencia('Debes indicar el nombre de la tarea no lectiva.', 'Validación');
        return null;
      }

      setGuardando(true);
      try {
        const registroAGuardar = {
          id_curso: null,
          id_sesion,
          dia_semana: Number(dia_semana),
          grupo: 'Docente',
          id_modulo: null,
          modulo_alt: String(nombreTarea).trim(),
          profesor: 'Docente titular',
          aula: aula ? String(aula).trim() : null
        };

        const existente = id_horario
          ? horarios.find((h) => h.id_horario === id_horario)
          : horarios.find(
              (h) =>
                (h.id_curso === null || !h.id_curso) &&
                h.id_sesion === id_sesion &&
                Number(h.dia_semana) === Number(dia_semana)
            );

        if (existente && existente.id_horario) {
          const resActualizar = await actualizarHorarioDb(
            'id_horario',
            existente.id_horario,
            registroAGuardar
          );
          if (resActualizar) {
            setHorarios((prev) =>
              prev.map((h) =>
                h.id_horario === existente.id_horario
                  ? { ...h, ...registroAGuardar }
                  : h
              )
            );
            mostrarExito('Tarea no lectiva actualizada correctamente.');
            return { ...existente, ...registroAGuardar };
          }
        } else {
          const resInsertar = await insertarHorarioDb(registroAGuardar);
          if (resInsertar && resInsertar.length > 0) {
            const nueva = resInsertar[0];
            setHorarios((prev) => [...prev, nueva]);
            mostrarExito('Tarea no lectiva asignada al horario correctamente.');
            return nueva;
          }
        }
        return null;
      } catch (err) {
        console.error('Error al guardar la tarea no lectiva:', err);
        mostrarError('No se pudo guardar la tarea no lectiva.', 'Error de guardado');
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [horarios, actualizarHorarioDb, insertarHorarioDb, mostrarAdvertencia, mostrarExito, mostrarError]
  );

  // Eliminación de una tarea no lectiva del horario.
  const eliminarTareaNoLectiva = useCallback(
    async (idHorario) => {
      if (!idHorario) return false;
      try {
        const exito = await eliminarHorarioDb('id_horario', idHorario);
        if (exito) {
          setHorarios((prev) => prev.filter((h) => h.id_horario !== idHorario));
          mostrarExito('Tarea no lectiva eliminada del horario.');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al eliminar la tarea no lectiva:', err);
        mostrarError('No se pudo eliminar la tarea no lectiva.', 'Error');
        return false;
      }
    },
    [eliminarHorarioDb, mostrarExito, mostrarError]
  );

  // Eliminación de una asignación lectiva para vaciar una celda horaria.
  const eliminarClaseHorario = useCallback(
    async (idHorario) => {
      if (!idHorario) return false;
      try {
        const exito = await eliminarHorarioDb('id_horario', idHorario);
        if (exito) {
          setHorarios((prev) => prev.filter((h) => h.id_horario !== idHorario));
          mostrarExito('Clase eliminada del horario correctamente.');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al eliminar la clase del horario:', err);
        mostrarError('No se pudo eliminar la clase del horario.', 'Error');
        return false;
      }
    },
    [eliminarHorarioDb, mostrarExito, mostrarError]
  );

  // ==========================================
  // SINERGIAS CON OTROS MÓDULOS DEL SISTEMA
  // ==========================================

  // Cálculo del número de horas lectivas semanales para un módulo y grupo (sinergia temporización inteligente).
  const obtenerHorasSemanalesModulo = useCallback(
    (idModulo, grupo = null) => {
      if (!idModulo) return 0;
      return horarios.filter((h) => {
        // Se consultan estrictamente registros con id_curso válido, ignorando tareas no lectivas generales.
        if (!h.id_curso) return false;
        const coincideModulo = h.id_modulo === idModulo;
        const coincideGrupo = grupo ? h.grupo === grupo : true;
        return coincideModulo && coincideGrupo;
      }).length;
    },
    [horarios]
  );

  // Clases y tareas no lectivas del docente para un día de la semana (sinergia Dashboard Agenda Semanal).
  const obtenerHorarioDocenteDia = useCallback(
    (diaSemana) => {
      return horarioDocente
        .filter((h) => Number(h.dia_semana) === Number(diaSemana))
        .sort((a, b) => {
          const sesA = mapaSesiones.get(a.id_sesion) || sesiones.find((s) => s.id_sesion === a.id_sesion);
          const sesB = mapaSesiones.get(b.id_sesion) || sesiones.find((s) => s.id_sesion === b.id_sesion);
          const ordenA = sesA ? sesA.numero : 0;
          const ordenB = sesB ? sesB.numero : 0;
          return ordenA - ordenB;
        });
    },
    [horarioDocente, sesiones, mapaSesiones]
  );

  return {
    sesiones,
    todasSesiones,
    horarios,
    horariosCurso,
    modulos,
    grupos,
    mapaModulos,
    mapaSesiones,
    horarioDocente,
    resumenDocente,
    cargando,
    guardando,
    recargar,
    crearSesion,
    actualizarSesion,
    eliminarSesion,
    generarSesionesPredeterminadas,
    clonarSesionesDeCurso,
    guardarClaseHorario,
    eliminarClaseHorario,
    guardarTareaNoLectiva,
    eliminarTareaNoLectiva,
    obtenerHorasSemanalesModulo,
    obtenerHorarioDocenteDia,
    esClaseDelDocente
  };
};

export default useHorarios;
