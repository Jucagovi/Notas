import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import useGlobalToast from './useGlobalToast.js';
import {
  formatearFechaISO,
  parsearFechaISO,
  calcularResumenLectivo,
  generarRangoFechas
} from '../utils/fechas.js';
import {
  esEventoLectivo
} from '../utils/coloreCalendario.js';

/**
 * useCalendario - Custom Hook para orquestar la gestión unificada del Calendario Escolar Global.
 *
 * Responsabilidad Única: Gestionar los eventos globales en la tabla Calendario_Eventos (con id_curso null),
 * filtrados por año académico escolar (desde el 1 de septiembre del año seleccionado hasta el 31 de agosto
 * del año siguiente), garantizando que los eventos afecten a todos los cursos y clases por igual.
 *
 * @param {number} anioSeleccionado - Año de inicio del curso académico (ej. 2024 para el curso 2024/2025).
 */
export const useCalendario = (anioSeleccionado) => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Notificaciones visuales globales del sistema.
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Instancia aislada del hook genérico useDatos para Calendario_Eventos.
  const {
    obtenerDatos: obtenerEventosDb,
    insertar: insertarEventosDb,
    actualizar: actualizarEventoDb,
    eliminar: eliminarEventoDb
  } = useDatos('Calendario_Eventos');

  // Fechas límites del año académico escolar seleccionado (1 de septiembre a 31 de agosto).
  const fechaInicioPeriodo = useMemo(() => {
    return `${anioSeleccionado}-09-01`;
  }, [anioSeleccionado]);

  const fechaFinPeriodo = useMemo(() => {
    return `${anioSeleccionado + 1}-08-31`;
  }, [anioSeleccionado]);

  // Carga y sincronización de los eventos globales correspondientes al marco temporal anual.
  const cargarCalendario = useCallback(async () => {
    if (!anioSeleccionado) {
      setEventos([]);
      return;
    }

    setCargando(true);
    try {
      // Se consultan los eventos que intersecan con el año escolar (1 sept año actual - 31 ago año siguiente).
      const eventosDb = await obtenerEventosDb('*', (consulta) =>
        consulta
          .lte('fecha_inicio', fechaFinPeriodo)
          .gte('fecha_fin', fechaInicioPeriodo)
          .order('fecha_inicio', { ascending: true })
      );

      const eventosMapeados = (eventosDb || []).map((e) => ({
        id_evento: e.id_evento,
        id_curso: null, // Siempre nulo al ser eventos globales que afectan a todos los cursos.
        fecha_inicio: e.fecha_inicio,
        fecha_fin: e.fecha_fin || e.fecha_inicio,
        tipo_evento: e.tipo_evento,
        descripcion: e.descripcion || '',
        es_lectivo: Boolean(e.es_lectivo)
      }));

      setEventos(eventosMapeados);
    } catch (err) {
      console.error('Error al cargar los eventos globales del calendario:', err);
      mostrarError('No se pudieron recuperar los eventos del calendario escolar.');
    } finally {
      setCargando(false);
    }
  }, [anioSeleccionado, fechaInicioPeriodo, fechaFinPeriodo]);

  // Se recargan los eventos al cambiar el año académico escolar activo.
  useEffect(() => {
    cargarCalendario();
  }, [cargarCalendario]);

  /**
   * Agrega un nuevo evento global en Calendario_Eventos con id_curso fijado a null.
   *
   * @param {Object} nuevoEvento - Datos del evento (fecha_inicio, fecha_fin, tipo_evento, descripcion, es_lectivo).
   */
  const agregarEvento = useCallback(async (nuevoEvento) => {
    const fechaIniISO = typeof nuevoEvento.fecha_inicio === 'string'
      ? nuevoEvento.fecha_inicio
      : formatearFechaISO(nuevoEvento.fecha_inicio);

    const fechaFinISO = nuevoEvento.fecha_fin
      ? (typeof nuevoEvento.fecha_fin === 'string' ? nuevoEvento.fecha_fin : formatearFechaISO(nuevoEvento.fecha_fin))
      : fechaIniISO;

    const tipo = nuevoEvento.tipo_evento || 'Festivo Nacional';
    const esLectivo = nuevoEvento.es_lectivo !== undefined
      ? Boolean(nuevoEvento.es_lectivo)
      : esEventoLectivo(tipo);

    const registroAInsertar = {
      id_curso: null, // Los eventos son únicos y globales; id_curso es explícitamente null.
      fecha_inicio: fechaIniISO,
      fecha_fin: fechaFinISO,
      tipo_evento: tipo,
      descripcion: (nuevoEvento.descripcion || '').trim(),
      es_lectivo: esLectivo
    };

    setGuardando(true);
    try {
      const resultado = await insertarEventosDb([registroAInsertar]);
      const insertado = resultado && resultado.length > 0 ? resultado[0] : registroAInsertar;

      setEventos((prev) => [...prev, insertado]);
      mostrarExito(`Evento "${tipo}" añadido al calendario escolar.`);
      return insertado;
    } catch (err) {
      console.error('Error al insertar el evento global en el calendario:', err);
      mostrarError('No se pudo registrar el evento en el calendario escolar.');
      return null;
    } finally {
      setGuardando(false);
    }
  }, [insertarEventosDb, mostrarExito, mostrarError]);

  /**
   * Actualiza un evento existente en Calendario_Eventos.
   *
   * @param {string} idEvento - Identificador del evento.
   * @param {Object} cambios - Campos a actualizar.
   */
  const actualizarEvento = useCallback(async (idEvento, cambios) => {
    if (!idEvento) return false;

    setGuardando(true);
    try {
      const datosActualizar = { ...cambios, id_curso: null };
      if (cambios.fecha_inicio && typeof cambios.fecha_inicio !== 'string') {
        datosActualizar.fecha_inicio = formatearFechaISO(cambios.fecha_inicio);
      }
      if (cambios.fecha_fin && typeof cambios.fecha_fin !== 'string') {
        datosActualizar.fecha_fin = formatearFechaISO(cambios.fecha_fin);
      }
      if (cambios.tipo_evento && cambios.es_lectivo === undefined) {
        datosActualizar.es_lectivo = esEventoLectivo(cambios.tipo_evento);
      }
      if (cambios.descripcion !== undefined) {
        datosActualizar.descripcion = (cambios.descripcion || '').trim();
      }

      await actualizarEventoDb(idEvento, datosActualizar);

      setEventos((prev) =>
        prev.map((e) => (e.id_evento === idEvento ? { ...e, ...datosActualizar } : e))
      );

      mostrarExito('Evento actualizado con éxito.');
      return true;
    } catch (err) {
      console.error('Error al actualizar el evento del calendario:', err);
      mostrarError('No se pudo actualizar el evento en la base de datos.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [actualizarEventoDb, mostrarExito, mostrarError]);

  /**
   * Elimina un evento de Calendario_Eventos.
   *
   * @param {string} idEvento - Identificador del evento a eliminar.
   */
  const eliminarEvento = useCallback(async (idEvento) => {
    if (!idEvento) return false;

    setGuardando(true);
    try {
      await eliminarEventoDb('id_evento', idEvento);
      setEventos((prev) => prev.filter((e) => e.id_evento !== idEvento));
      mostrarExito('Evento eliminado del calendario escolar.');
      return true;
    } catch (err) {
      console.error('Error al eliminar el evento:', err);
      mostrarError('No se pudo eliminar el evento de la base de datos.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [eliminarEventoDb, mostrarExito, mostrarError]);

  /**
   * Elimina los eventos registrados en el año escolar seleccionado.
   */
  const limpiarEventos = useCallback(async () => {
    setGuardando(true);
    try {
      // Se eliminan individualmente los eventos cargados en este periodo escolar.
      for (const ev of eventos) {
        await eliminarEventoDb('id_evento', ev.id_evento);
      }
      setEventos([]);
      mostrarExito('Se han eliminado todos los eventos de este año escolar.');
      return true;
    } catch (err) {
      console.error('Error al limpiar los eventos del año escolar:', err);
      mostrarError('No se pudieron eliminar los eventos del año escolar.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [eventos, eliminarEventoDb, mostrarExito, mostrarError]);

  /**
   * Añade un intervalo temporal como evento global continuo (con id_curso null).
   *
   * @param {Date|string} desde - Fecha inicial del intervalo.
   * @param {Date|string} hasta - Fecha final del intervalo.
   * @param {string} tipoEvento - Tipo de evento asignado.
   * @param {string} descripcion - Motivo o descripción.
   * @param {boolean} soloLaborables - Si debe omitir fines de semana.
   */
  const agregarRangoEventos = useCallback(async (desde, hasta, tipoEvento, descripcion = '', soloLaborables = true) => {
    const fDesde = desde instanceof Date ? desde : parsearFechaISO(desde);
    const fHasta = hasta instanceof Date ? hasta : parsearFechaISO(hasta);

    if (!fDesde || !fHasta || fDesde > fHasta) {
      mostrarError('El rango de fechas proporcionado no es válido.');
      return false;
    }

    const tipo = tipoEvento || 'Vacaciones';
    const esLectivo = esEventoLectivo(tipo);

    setGuardando(true);
    try {
      let registrosAInsertar = [];

      if (!soloLaborables) {
        registrosAInsertar.push({
          id_curso: null, // Eventos globales compartidos.
          fecha_inicio: formatearFechaISO(fDesde),
          fecha_fin: formatearFechaISO(fHasta),
          tipo_evento: tipo,
          descripcion: descripcion.trim(),
          es_lectivo: esLectivo
        });
      } else {
        const diasLaborables = generarRangoFechas(fDesde, fHasta, true);
        if (diasLaborables.length === 0) {
          mostrarAdvertencia('No se encontraron días laborables dentro del rango seleccionado.');
          setGuardando(false);
          return false;
        }

        let bloqueInicio = diasLaborables[0];
        let bloqueFin = diasLaborables[0];

        for (let i = 1; i < diasLaborables.length; i++) {
          const actual = diasLaborables[i];
          const anterior = diasLaborables[i - 1];

          const difTiempo = actual.getTime() - anterior.getTime();
          const difDias = Math.round(difTiempo / (1000 * 60 * 60 * 24));

          if (difDias === 1) {
            bloqueFin = actual;
          } else {
            registrosAInsertar.push({
              id_curso: null,
              fecha_inicio: formatearFechaISO(bloqueInicio),
              fecha_fin: formatearFechaISO(bloqueFin),
              tipo_evento: tipo,
              descripcion: descripcion.trim(),
              es_lectivo: esLectivo
            });
            bloqueInicio = actual;
            bloqueFin = actual;
          }
        }

        registrosAInsertar.push({
          id_curso: null,
          fecha_inicio: formatearFechaISO(bloqueInicio),
          fecha_fin: formatearFechaISO(bloqueFin),
          tipo_evento: tipo,
          descripcion: descripcion.trim(),
          es_lectivo: esLectivo
        });
      }

      const insertados = await insertarEventosDb(registrosAInsertar);
      setEventos((prev) => [...prev, ...(insertados || registrosAInsertar)]);
      mostrarExito(`Periodo "${tipo}" incorporado al calendario global.`);
      return true;
    } catch (err) {
      console.error('Error al insertar el rango de eventos globales:', err);
      mostrarError('No se pudo añadir el periodo al calendario escolar.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [insertarEventosDb, mostrarExito, mostrarError, mostrarAdvertencia]);

  // Cálculo del resumen lectivo para el periodo escolar (1 sept al 31 ago).
  const resumenLectivo = useMemo(() => {
    return calcularResumenLectivo(fechaInicioPeriodo, fechaFinPeriodo, eventos);
  }, [fechaInicioPeriodo, fechaFinPeriodo, eventos]);

  return {
    eventos,
    fechaInicioPeriodo,
    fechaFinPeriodo,
    resumenLectivo,
    cargando,
    guardando,
    cargarCalendario,
    agregarEvento,
    actualizarEvento,
    eliminarEvento,
    limpiarEventos,
    agregarRangoEventos
  };
};

export default useCalendario;
