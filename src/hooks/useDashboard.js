import { useState, useEffect, useCallback, useMemo } from "react";
import useDatos from "./useDatos.js";
import {
  obtenerAgendaHoy,
  calcularMapaTactico,
  calcularRadarCobertura,
  calcularDetectorSobrecarga,
  calcularAlertasInmediatas,
  calcularProgresoCurricular,
  calcularConteoCalificacionesPendientes,
} from "../utils/calculosDashboard.js";
import { formatearFechaISO } from "../utils/fechas.js";

/**
 * useDashboard - Custom Hook Agregador para el Centro de Mando Analítico del Docente.
 *
 * Responsabilidad Única: Orquestar en paralelo las consultas a las tablas core del sistema
 * (Cursos, Módulos, Sesiones, Horarios, Calendario, UTs, Temporización, Prácticas, Versiones,
 * Evaluaciones, Calificaciones y Matrícula) y coordinar el cálculo de los 6 motores analíticos
 * requeridos en el Caso de Uso 01.
 *
 * @param {string|null} [cursoInicialId=null] - Identificador opcional del curso preseleccionado.
 */
const useDashboard = (cursoInicialId = null) => {
  const [cursoSeleccionadoId, setCursoSeleccionadoId] =
    useState(cursoInicialId);
  const [moduloRadarId, setModuloRadarId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Instancias aisladas del hook genérico useDatos para cada tabla requerida.
  const hookCursos = useDatos("Cursos");
  const hookModulos = useDatos("Modulos");
  const hookCiclos = useDatos("Ciclos");
  const hookSesiones = useDatos("Sesiones");
  const hookHorarios = useDatos("Horarios");
  const hookCalendario = useDatos("Calendario_Eventos");
  const hookUT = useDatos("Unidades_Trabajo");
  const hookTemporizacion = useDatos("Temporizacion");
  const hookPracticas = useDatos("Practicas");
  const hookVersiones = useDatos("Versiones");
  const hookTrabajan = useDatos("trabajan");
  const hookRA = useDatos("RA");
  const hookCE = useDatos("CE");
  const hookEvaluaciones = useDatos("Evaluaciones");
  const hookEvaluan = useDatos("evaluan");
  const hookImparte = useDatos("imparte");

  // Estados locales para almacenar la instantánea de datos cargados en paralelo.
  const [datosCursos, setDatosCursos] = useState([]);
  const [datosModulos, setDatosModulos] = useState([]);
  const [datosCiclos, setDatosCiclos] = useState([]);
  const [datosSesiones, setDatosSesiones] = useState([]);
  const [datosHorarios, setDatosHorarios] = useState([]);
  const [datosCalendario, setDatosCalendario] = useState([]);
  const [datosUT, setDatosUT] = useState([]);
  const [datosTemporizacion, setDatosTemporizacion] = useState([]);
  const [datosPracticas, setDatosPracticas] = useState([]);
  const [datosVersiones, setDatosVersiones] = useState([]);
  const [datosTrabajan, setDatosTrabajan] = useState([]);
  const [datosRA, setDatosRA] = useState([]);
  const [datosCE, setDatosCE] = useState([]);
  const [datosEvaluaciones, setDatosEvaluaciones] = useState([]);
  const [datosEvaluan, setDatosEvaluan] = useState([]);
  const [datosImparte, setDatosImparte] = useState([]);

  // Determinación de la fecha actual y día lectivo en España (Lunes = 1 a Domingo = 7).
  const ahora = useMemo(() => new Date(), []);
  const fechaHoyStr = useMemo(() => formatearFechaISO(ahora), [ahora]);
  const diaSemanaHoy = useMemo(() => {
    const diaJS = ahora.getDay();
    return diaJS === 0 ? 7 : diaJS; // Conversión al estándar español: Lunes es 1 y Domingo es 7.
  }, [ahora]);

  // Carga paralela masiva (Promise.all) de todas las colecciones necesarias.
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [
        cursos,
        modulos,
        ciclos,
        sesiones,
        horarios,
        calendario,
        unidades,
        temporizaciones,
        practicas,
        versiones,
        trabajan,
        ras,
        ces,
        evaluaciones,
        evaluan,
        imparte,
      ] = await Promise.all([
        hookCursos.obtenerDatos("*", (q) =>
          q.order("nombre", { ascending: true }),
        ),
        hookModulos.obtenerDatos("*", (q) =>
          q.order("siglas", { ascending: true }),
        ),
        hookCiclos.obtenerDatos("*"),
        hookSesiones.obtenerDatos("*", (q) =>
          q.order("numero", { ascending: true }),
        ),
        hookHorarios.obtenerDatos("*"),
        hookCalendario.obtenerDatos("*", (q) =>
          q.order("fecha_inicio", { ascending: true }),
        ),
        hookUT.obtenerDatos("*", (q) => q.order("numero", { ascending: true })),
        hookTemporizacion.obtenerDatos("*", (q) =>
          q.order("orden", { ascending: true }),
        ),
        hookPracticas.obtenerDatos("*"),
        hookVersiones.obtenerDatos("*"),
        hookTrabajan.obtenerDatos("*"),
        hookRA.obtenerDatos("*", (q) => q.order("numero", { ascending: true })),
        hookCE.obtenerDatos("*", (q) => q.order("numero", { ascending: true })),
        hookEvaluaciones.obtenerDatos("*"),
        hookEvaluan.obtenerDatos("*"),
        hookImparte.obtenerDatos("*"),
      ]);

      setDatosCursos(cursos || []);
      setDatosModulos(modulos || []);
      setDatosCiclos(ciclos || []);
      setDatosSesiones(sesiones || []);
      setDatosHorarios(horarios || []);
      setDatosCalendario(calendario || []);
      setDatosUT(unidades || []);
      setDatosTemporizacion(temporizaciones || []);
      setDatosPracticas(practicas || []);
      setDatosVersiones(versiones || []);
      setDatosTrabajan(trabajan || []);
      setDatosRA(ras || []);
      setDatosCE(ces || []);
      setDatosEvaluaciones(evaluaciones || []);
      setDatosEvaluan(evaluan || []);
      setDatosImparte(imparte || []);

      // Se selecciona automáticamente el primer curso si no hay ninguno seleccionado.
      if (!cursoSeleccionadoId && cursos && cursos.length > 0) {
        setCursoSeleccionadoId(cursos[0].id_curso);
      }

      // Se selecciona automáticamente el primer módulo para el radar de cobertura.
      if (!moduloRadarId && modulos && modulos.length > 0) {
        setModuloRadarId(modulos[0].id_modulo);
      }
    } catch (err) {
      console.error("Error al orquestar las consultas del dashboard:", err);
      setError(
        "No se pudieron recuperar los datos analíticos del panel de control.",
      );
    } finally {
      setCargando(false);
    }
  }, [
    cursoSeleccionadoId,
    moduloRadarId,
    hookCursos.obtenerDatos,
    hookModulos.obtenerDatos,
    hookCiclos.obtenerDatos,
    hookSesiones.obtenerDatos,
    hookHorarios.obtenerDatos,
    hookCalendario.obtenerDatos,
    hookUT.obtenerDatos,
    hookTemporizacion.obtenerDatos,
    hookPracticas.obtenerDatos,
    hookVersiones.obtenerDatos,
    hookTrabajan.obtenerDatos,
    hookRA.obtenerDatos,
    hookCE.obtenerDatos,
    hookEvaluaciones.obtenerDatos,
    hookEvaluan.obtenerDatos,
    hookImparte.obtenerDatos,
  ]);

  useEffect(() => {
    //recargar();
  }, [recargar]);

  // Curso actualmente activo.
  const cursoActivo = useMemo(() => {
    return datosCursos.find((c) => c.id_curso === cursoSeleccionadoId) || null;
  }, [datosCursos, cursoSeleccionadoId]);

  // Módulos asociados al curso activo (o todos si no hay filtro de matrícula específico).
  const modulosCurso = useMemo(() => {
    if (!cursoSeleccionadoId) return datosModulos;
    const idsModulosEvaluacion = new Set(
      datosEvaluaciones
        .filter((ev) => ev.id_curso === cursoSeleccionadoId && ev.id_modulo)
        .map((ev) => ev.id_modulo),
    );
    const idsModulosImparte = new Set(
      datosImparte
        .filter((imp) => imp.id_curso === cursoSeleccionadoId && imp.id_modulo)
        .map((imp) => imp.id_modulo),
    );
    const idsModulosHorario = new Set(
      datosHorarios
        .filter((h) => h.id_curso === cursoSeleccionadoId && h.id_modulo)
        .map((h) => h.id_modulo),
    );

    const conjunto = new Set([
      ...idsModulosEvaluacion,
      ...idsModulosImparte,
      ...idsModulosHorario,
    ]);
    if (conjunto.size === 0) return datosModulos;
    return datosModulos.filter((m) => conjunto.has(m.id_modulo));
  }, [
    datosModulos,
    datosEvaluaciones,
    datosImparte,
    datosHorarios,
    cursoSeleccionadoId,
  ]);

  // Si cambia la lista de módulos y el módulo del radar ya no es válido, se ajusta.
  useEffect(() => {
    if (
      modulosCurso.length > 0 &&
      (!moduloRadarId ||
        !modulosCurso.some((m) => m.id_modulo === moduloRadarId))
    ) {
      setModuloRadarId(modulosCurso[0].id_modulo);
    }
  }, [modulosCurso, moduloRadarId]);

  // 1. Agenda del Día: operativa diaria con timeline y eventos cruzados.
  const agendaHoy = useMemo(() => {
    return obtenerAgendaHoy(
      diaSemanaHoy,
      fechaHoyStr,
      datosHorarios,
      datosSesiones,
      datosCalendario,
      datosModulos,
    );
  }, [
    diaSemanaHoy,
    fechaHoyStr,
    datosHorarios,
    datosSesiones,
    datosCalendario,
    datosModulos,
  ]);

  // 2. Mapa Táctico: estado actual de avance y próxima unidad por módulo.
  const mapaTactico = useMemo(() => {
    return calcularMapaTactico(
      cursoSeleccionadoId,
      datosTemporizacion,
      datosUT,
      modulosCurso,
      datosCiclos,
      datosHorarios,
      fechaHoyStr,
    );
  }, [
    cursoSeleccionadoId,
    datosTemporizacion,
    datosUT,
    modulosCurso,
    datosCiclos,
    datosHorarios,
    fechaHoyStr,
  ]);

  // 3. Radar de Cobertura: auditoría legal de RA y detección de áreas huérfanas.
  const radarCobertura = useMemo(() => {
    return calcularRadarCobertura(
      moduloRadarId,
      modulosCurso,
      datosPracticas,
      datosVersiones,
      datosTrabajan,
      datosRA,
      datosCE,
    );
  }, [
    moduloRadarId,
    modulosCurso,
    datosPracticas,
    datosVersiones,
    datosTrabajan,
    datosRA,
    datosCE,
  ]);

  // 4. Detector de Sobrecarga: escáner predictivo para los próximos 15 días.
  const detectorSobrecarga = useMemo(() => {
    return calcularDetectorSobrecarga(
      datosCalendario,
      datosEvaluaciones,
      datosVersiones,
      datosPracticas,
      fechaHoyStr,
    );
  }, [
    datosCalendario,
    datosEvaluaciones,
    datosVersiones,
    datosPracticas,
    fechaHoyStr,
  ]);

  // 5. Alertas Inmediatas: anomalías, prácticas sin corregir y desfases.
  const alertas = useMemo(() => {
    return calcularAlertasInmediatas(
      datosVersiones,
      datosEvaluan,
      datosImparte,
      datosTemporizacion,
      modulosCurso,
      fechaHoyStr,
    );
  }, [
    datosVersiones,
    datosEvaluan,
    datosImparte,
    datosTemporizacion,
    modulosCurso,
    fechaHoyStr,
  ]);

  // 6. Progreso Curricular: barras comparativas de avance real versus teórico.
  const progresoCurricular = useMemo(() => {
    return calcularProgresoCurricular(
      cursoSeleccionadoId,
      modulosCurso,
      datosTemporizacion,
      datosUT,
      fechaHoyStr,
    );
  }, [
    cursoSeleccionadoId,
    modulosCurso,
    datosTemporizacion,
    datosUT,
    fechaHoyStr,
  ]);

  // 7. Conteo global de calificaciones pendientes para la tarjeta KPI
  const conteoCalificacionesPendientes = useMemo(() => {
    return calcularConteoCalificacionesPendientes(
      cursoSeleccionadoId,
      datosVersiones,
      datosEvaluan,
      datosImparte,
    );
  }, [cursoSeleccionadoId, datosVersiones, datosEvaluan, datosImparte]);

  return {
    cursos: datosCursos,
    cursoActivo,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    modulos: modulosCurso,
    moduloRadarId,
    setModuloRadarId,
    agendaHoy,
    mapaTactico,
    radarCobertura,
    detectorSobrecarga,
    alertas,
    progresoCurricular,
    conteoCalificacionesPendientes,
    cargando,
    error,
    recargar,
    fechaHoyStr,
  };
};

export default useDashboard;
