import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { obtenerAgendaHoy } from '../utils/calculosDashboard.js';
import { formatearFechaISO } from '../utils/fechas.js';

/**
 * useDashboard - Custom Hook Agregador optimizado para la operativa diaria del docente.
 *
 * Responsabilidad Única: Orquestar la obtención de datos estricta y mínima necesaria
 * para la agenda diaria de hoy (Horarios y Sesiones), reutilizando el catálogo
 * de módulos profesionales provisto por la agenda semanal para erradicar consultas redundantes
 * y reducir a mínimos el consumo de red en el panel de control.
 *
 * @param {Array<Object>} [modulosExternos=[]] - Catálogo de módulos provisto externamente.
 */
const useDashboard = (modulosExternos = []) => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Instancias aisladas del hook genérico useDatos estrictamente para el horario diario.
  const hookSesiones = useDatos('Sesiones');
  const hookHorarios = useDatos('Horarios');

  // Estados locales para almacenar la instantánea de datos cargados en paralelo.
  const [datosSesiones, setDatosSesiones] = useState([]);
  const [datosHorarios, setDatosHorarios] = useState([]);

  // Determinación de la fecha actual y día lectivo en España (Lunes = 1 a Domingo = 7).
  const ahora = useMemo(() => new Date(), []);
  const fechaHoyStr = useMemo(() => formatearFechaISO(ahora), [ahora]);
  const diaSemanaHoy = useMemo(() => {
    const diaJS = ahora.getDay();
    return diaJS === 0 ? 7 : diaJS; // Conversión al estándar español: Lunes es 1 y Domingo es 7.
  }, [ahora]);

  // Carga paralela optimizada: sólo las columnas imprescindibles de sesiones y horarios de hoy.
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [sesiones, horarios] = await Promise.all([
        // Sesiones: únicamente identificador, número de orden e intervalo horario.
        hookSesiones.obtenerDatos(
          'id_sesion, numero, hora_inicio, hora_fin',
          (q) => q.order('numero', { ascending: true })
        ),
        // Horarios: clases y actividades del día actual para el horario del docente.
        hookHorarios.obtenerDatos(
          'id_horario, dia_semana, id_sesion, id_modulo, modulo_alt, grupo, aula, profesor, id_curso',
          (q) => q.eq('dia_semana', diaSemanaHoy)
        )
      ]);

      setDatosSesiones(sesiones || []);
      setDatosHorarios(horarios || []);
    } catch (err) {
      console.error('Error al orquestar las consultas del dashboard:', err);
      setError('No se pudieron recuperar los datos operativos del panel de control.');
    } finally {
      setCargando(false);
    }
  }, [
    diaSemanaHoy,
    hookSesiones.obtenerDatos,
    hookHorarios.obtenerDatos
  ]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Agenda del Día: operativa diaria exclusivamente con las horas del horario docente.
  const agendaHoy = useMemo(() => {
    return obtenerAgendaHoy(
      diaSemanaHoy,
      fechaHoyStr,
      datosHorarios,
      datosSesiones,
      [],
      modulosExternos
    );
  }, [
    diaSemanaHoy,
    fechaHoyStr,
    datosHorarios,
    datosSesiones,
    modulosExternos
  ]);

  return {
    agendaHoy,
    cargando,
    error,
    recargar,
    fechaHoyStr
  };
};

export default useDashboard;
