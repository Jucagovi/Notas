import { useState, useEffect, useCallback } from "react";
import useDatos from "./useDatos.js";
import { procesarEstadisticas } from "../services/dashboardService.js";

// Estado inicial para las estadísticas agregadas del panel de control
const ESTADISTICAS_INICIALES = {
  totalAlumnos: 0,
  totalModulos: 0,
  totalCalificaciones: 0,
  notaMediaGlobal: null,
  tasaAprobados: null,
  distribucion: {
    suspensos: 0,
    aprobados: 0,
    notables: 0,
    sobresalientes: 0,
  },
  mediasPorModulo: [],
  alumnosEnRiesgo: [],
  tieneDatos: false,
};

// Hook específico del Dashboard que consume exclusivamente el hook genérico useDatos para acceder a Supabase
const useDashboard = () => {
  // Se inicializan los hooks useDatos para cada una de las tablas requeridas
  const {
    obtenerDatos: obtenerDiscentes,
    cargando: cargandoDiscentes,
    error: errorDiscentes,
  } = useDatos("Discentes");

  const {
    obtenerDatos: obtenerModulos,
    cargando: cargandoModulos,
    error: errorModulos,
  } = useDatos("Modulos");

  const {
    obtenerDatos: obtenerEvaluan,
    cargando: cargandoEvaluan,
    error: errorEvaluan,
  } = useDatos("evaluan");

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [estadisticas, setEstadisticas] = useState(ESTADISTICAS_INICIALES);

  // Función para coordinar la carga de datos a través de los métodos proporcionados por useDatos
  const cargarEstadisticas = useCallback(async () => {
    try {
      // Se obtienen los datos de cada tabla mediante las funciones expuestas por useDatos
      const [discentesBD, modulosBD, evaluanBD] = await Promise.all([
        obtenerDiscentes("*"),
        obtenerModulos("*"),
        obtenerEvaluan("*, Practicas(id_modulo)"),
      ]);

      // Se procesan las métricas estadísticas únicamente con los registros reales de Supabase
      const stats = procesarEstadisticas(
        discentesBD || [],
        modulosBD || [],
        evaluanBD || []
      );
      setEstadisticas(stats);
    } catch (err) {
      console.error(
        "Error al coordinar la obtención de datos en useDashboard:",
        err
      );
      setEstadisticas(ESTADISTICAS_INICIALES);
    } finally {
      setCargandoInicial(false);
    }
  }, [obtenerDiscentes, obtenerModulos, obtenerEvaluan]);

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Estado consolidado de carga y errores provenientes de useDatos
  const cargando =
    cargandoInicial || cargandoDiscentes || cargandoModulos || cargandoEvaluan;
  const error = errorDiscentes || errorModulos || errorEvaluan;

  return {
    estadisticas,
    cargando,
    error,
    recargarEstadisticas: cargarEstadisticas,
  };
};

export default useDashboard;
