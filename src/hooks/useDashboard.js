import { useState, useEffect, useCallback } from "react";
import useDatos from "./useDatos.js";
import {
  procesarEstadisticas,
  procesarEstadisticasConMock,
} from "../services/dashboardService.js";

// Hook específico del Dashboard que consume exclusivamente el hook genérico useDatos para acceder a Supabase.
const useDashboard = () => {
  // Se inicializan los hooks useDatos para cada una de las entidades requeridas.
  // Se crea diferentes estados para cada una de las solicitudes (utilizando useDatos.js).
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
  const [origenDatos, setOrigenDatos] = useState("cargando");
  const [estadisticas, setEstadisticas] = useState({
    totalAlumnos: 0,
    totalModulos: 0,
    totalCalificaciones: 0,
    notaMediaGlobal: 0,
    tasaAprobados: 0,
    distribucion: {
      suspensos: 0,
      aprobados: 0,
      notables: 0,
      sobresalientes: 0,
    },
    mediasPorModulo: [],
    alumnosEnRiesgo: [],
    esMock: false,
    tieneDatos: false,
  });

  // Función para coordinar la carga de datos a través de los métodos proporcionados por useDatos.
  const cargarEstadisticas = useCallback(async () => {
    try {
      // Se obtienen los datos de cada tabla mediante las funciones expuestas por useDatos.
      const [discentesBD, modulosBD, evaluanBD] = await Promise.all([
        obtenerDiscentes("*"),
        obtenerModulos("*"),
        obtenerEvaluan("*, Practicas(id_modulo)"),
      ]);

      const hayDatosReales =
        Array.isArray(discentesBD) &&
        discentesBD.length > 0 &&
        Array.isArray(evaluanBD) &&
        evaluanBD.length > 0;

      if (hayDatosReales) {
        // Se procesan las estadísticas con los datos reales obtenidos de Supabase a través de useDatos.
        const stats = procesarEstadisticas(
          discentesBD,
          modulosBD || [],
          evaluanBD,
          false,
        );
        setEstadisticas(stats);
        setOrigenDatos("supabase");
      } else {
        // Si no existen registros suficientes en Supabase, se utilizan datos de respaldo.
        const statsMock = procesarEstadisticasConMock();
        setEstadisticas(statsMock);
        setOrigenDatos("mock");
      }
    } catch (err) {
      console.error(
        "Error al coordinar la obtención de datos en useDashboard:",
        err,
      );
      const statsMock = procesarEstadisticasConMock();
      setEstadisticas(statsMock);
      setOrigenDatos("mock_fallback");
    } finally {
      setCargandoInicial(false);
    }
  }, [obtenerDiscentes, obtenerModulos, obtenerEvaluan]);

  // Carga inicial al montar el componente de forma asíncrona.
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarEstadisticas();
    }, 0);

    return () => clearTimeout(timer);
  }, [cargarEstadisticas]);

  // Estado consolidado de carga y errores provenientes de useDatos.
  const cargando =
    cargandoInicial || cargandoDiscentes || cargandoModulos || cargandoEvaluan;
  const error = errorDiscentes || errorModulos || errorEvaluan;

  return {
    estadisticas,
    cargando,
    error,
    origenDatos,
    recargarEstadisticas: cargarEstadisticas,
  };
};

export default useDashboard;
