import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import {
  crearClaseCompleta,
  obtenerModulosPorCiclo,
  EVALUACIONES_REGLAMENTARIAS
} from '../services/cursoSetupService.js';

// Hook personalizado para gestionar el asistente de creación y configuración de clases
const useCursoSetup = () => {
  // Se utilizan instancias de useDatos para cada tabla según la regla de arquitectura
  const {
    datos: cursos,
    cargando: cargandoCursos,
    error: errorCursos,
    obtenerDatos: obtenerCursos
  } = useDatos('Cursos');

  const {
    datos: ciclos,
    cargando: cargandoCiclos,
    error: errorCiclos,
    obtenerDatos: obtenerCiclos
  } = useDatos('Ciclos');

  const {
    datos: discentes,
    cargando: cargandoDiscentes,
    error: errorDiscentes,
    obtenerDatos: obtenerDiscentes
  } = useDatos('Discentes');

  const [modulosCiclo, setModulosCiclo] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Se cargan los datos iniciales necesarios para el asistente
  const cargarDatosAsistente = useCallback(async () => {
    await Promise.all([
      obtenerCursos('*'),
      obtenerCiclos('*'),
      obtenerDiscentes('*')
    ]);
  }, [obtenerCursos, obtenerCiclos, obtenerDiscentes]);

  useEffect(() => {
    cargarDatosAsistente();
  }, [cargarDatosAsistente]);

  // Se filtran los discentes que están en estado activo
  const discentesActivos = (discentes || []).filter((d) => d.activo !== false);

  // Se obtienen los módulos correspondientes a un ciclo seleccionado
  const cargarModulosPorCiclo = useCallback(async (idCiclo) => {
    if (!idCiclo) {
      setModulosCiclo([]);
      return [];
    }
    setCargandoModulos(true);
    try {
      const { data, error } = await obtenerModulosPorCiclo(idCiclo);
      if (error) throw new Error(error);
      const resultado = data || [];
      setModulosCiclo(resultado);
      return resultado;
    } catch (err) {
      console.error('Error al cargar módulos del ciclo:', err);
      setModulosCiclo([]);
      return [];
    } finally {
      setCargandoModulos(false);
    }
  }, []);

  // Se procesa la creación completa de la clase a través del servicio
  const ejecutarCreacionClase = useCallback(async (parametros) => {
    setGuardando(true);
    setErrorOperacion(null);
    try {
      const respuesta = await crearClaseCompleta(parametros);
      if (!respuesta.exito) {
        throw new Error(respuesta.error || 'Error al guardar la clase.');
      }
      // Se recargan los cursos en caso de que se haya creado uno nuevo
      await obtenerCursos('*');
      return respuesta;
    } catch (err) {
      console.error('Error al ejecutar la creación de la clase:', err);
      setErrorOperacion(err.message || 'Error en la creación de la clase.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [obtenerCursos]);

  const cargando = cargandoCursos || cargandoCiclos || cargandoDiscentes;
  const error = errorCursos || errorCiclos || errorDiscentes || errorOperacion;

  return {
    cursos,
    ciclos,
    discentesActivos,
    modulosCiclo,
    evaluacionesReglamentarias: EVALUACIONES_REGLAMENTARIAS,
    cargando,
    cargandoModulos,
    guardando,
    error,
    cargarModulosPorCiclo,
    ejecutarCreacionClase,
    recargar: cargarDatosAsistente
  };
};

export default useCursoSetup;
