import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { obtenerLimitesSemana, sonMismaSemana } from '../utils/fechas.js';

/**
 * useDashboardAgenda - Custom Hook para la agenda semanal curricular global del panel de control.
 *
 * Responsabilidad Única: Consultar las tablas Temporizacion, Unidades_Trabajo, Modulos y Cursos
 * mediante el hook genérico useDatos, determinar los límites de la semana lectiva actual
 * y filtrar todas las unidades cuyo intervalo de impartición se solapa con dicha semana,
 * abarcando todas las clases del centro docente sin limitar a un curso individual.
 *
 * @param {string|null} [idCurso=null] - Identificador opcional del curso para filtrado específico.
 * @param {Date|string|null} [fechaInicial=null] - Fecha inicial opcional para la navegación semanal.
 */
const useDashboardAgenda = (idCurso = null, fechaInicial = null) => {
  // Estado que almacena la fecha de referencia para la semana visualizada.
  const [fechaReferencia, setFechaReferencia] = useState(
    fechaInicial instanceof Date ? fechaInicial : new Date()
  );

  // Instancias aisladas de useDatos para cada tabla requerida.
  const {
    obtenerDatos: obtenerTemporizacion,
    cargando: cargandoTemporizacion,
    error: errorTemporizacion
  } = useDatos('Temporizacion');

  const {
    obtenerDatos: obtenerUT,
    cargando: cargandoUT,
    error: errorUT
  } = useDatos('Unidades_Trabajo');

  const {
    obtenerDatos: obtenerModulos,
    cargando: cargandoModulos,
    error: errorModulos
  } = useDatos('Modulos');

  const {
    obtenerDatos: obtenerCursos,
    cargando: cargandoCursos,
    error: errorCursos
  } = useDatos('Cursos');

  // Estados locales para los datos en crudo.
  const [datosTemporizacion, setDatosTemporizacion] = useState([]);
  const [datosUT, setDatosUT] = useState([]);
  const [datosModulos, setDatosModulos] = useState([]);
  const [datosCursos, setDatosCursos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Cálculo de los límites temporales (lunes a domingo) de la semana en curso.
  const limitesSemana = useMemo(() => {
    return obtenerLimitesSemana(fechaReferencia);
  }, [fechaReferencia]);

  // Indicador de si la semana visualizada se corresponde con la semana real en curso.
  const esSemanaActual = useMemo(() => {
    return sonMismaSemana(fechaReferencia, new Date());
  }, [fechaReferencia]);

  // Carga unificada de colecciones de datos desde Supabase para todas las clases.
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      // Se solicitan en paralelo los datos de temporización con sólo las columnas imprescindibles.
      const [tempos, uts, modulos, cursos] = await Promise.all([
        obtenerTemporizacion(
          'id_temporizacion, id_ut, id_curso, orden, estado, nombre_alternativo, fecha_ini_prevista, fecha_fin_prevista, fecha_ini_real, fecha_fin_real, observaciones',
          (consulta) => {
            let c = consulta;
            if (idCurso) c = c.eq('id_curso', idCurso);
            return c.order('orden', { ascending: true });
          }
        ),
        // UT: se omiten campos de texto extensos como descripción.
        obtenerUT('id_ut, id_modulo, numero, nombre', (consulta) =>
          consulta.order('numero', { ascending: true })
        ),
        // Modulos: sólo siglas, denominación y ciclo.
        obtenerModulos('id_modulo, siglas, nombre, id_ciclo', (consulta) =>
          consulta.order('siglas', { ascending: true })
        ),
        // Cursos: sólo identificador y nombre oficial del curso escolar.
        obtenerCursos('id_curso, nombre', (consulta) =>
          consulta.order('nombre', { ascending: true })
        )
      ]);

      setDatosTemporizacion(tempos || []);
      setDatosUT(uts || []);
      setDatosModulos(modulos || []);
      setDatosCursos(cursos || []);
    } catch (err) {
      console.error('Error al obtener la agenda semanal curricular global:', err);
      setError('No se pudieron recuperar los contenidos de la agenda semanal.');
    } finally {
      setCargando(false);
    }
  }, [idCurso, obtenerTemporizacion, obtenerUT, obtenerModulos, obtenerCursos]);

  // Ejecución de la carga de datos al inicializar o modificar el filtro.
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Procesamiento y agrupación de unidades de trabajo por módulo profesional.
  const modulosConAgenda = useMemo(() => {
    if (!datosTemporizacion.length || !datosUT.length || !datosModulos.length) {
      return [];
    }

    const { lunesISO, domingoISO } = limitesSemana;

    // Se indexan las unidades de trabajo, los módulos y los cursos por identificador único.
    const mapaUT = new Map(datosUT.map((u) => [u.id_ut, u]));
    const mapaModulos = new Map(datosModulos.map((m) => [m.id_modulo, m]));
    const mapaCursos = new Map(datosCursos.map((c) => [c.id_curso, c]));

    // Mapa agrupador: id_modulo -> objeto agrupador con sus unidades coincidentes.
    const mapaAgrupado = new Map();

    datosTemporizacion.forEach((temp) => {
      // Se determinan las fechas efectivas de impartición de la unidad.
      // Si la unidad ya ha comenzado (fecha_ini_real), se priorizan las fechas reales.
      const fInicio = temp.fecha_ini_real || temp.fecha_ini_prevista;
      const fFin = temp.fecha_fin_real || temp.fecha_fin_prevista || fInicio;

      // Si no constan fechas programadas, no es posible evaluar el solapamiento.
      if (!fInicio || !fFin) {
        return;
      }

      // Condición de solapamiento de dos intervalos [A, B] y [C, D]: A <= D y B >= C.
      const seSolapaConSemana = fInicio <= domingoISO && fFin >= lunesISO;
      if (!seSolapaConSemana) {
        return;
      }

      // Se resuelve la información curricular de la unidad didáctica.
      const ut = mapaUT.get(temp.id_ut);
      if (!ut) {
        return;
      }

      // Se resuelve el módulo profesional al que pertenece la unidad didáctica.
      const modulo = mapaModulos.get(ut.id_modulo);
      if (!modulo) {
        return;
      }

      // Se resuelve el curso escolar al que pertenece la temporización.
      const curso = mapaCursos.get(temp.id_curso);
      const cursoNombre = curso ? curso.nombre : '';

      // Se inicializa el grupo del módulo si aún no se ha registrado.
      if (!mapaAgrupado.has(modulo.id_modulo)) {
        mapaAgrupado.set(modulo.id_modulo, {
          id_modulo: modulo.id_modulo,
          nombre: modulo.nombre,
          siglas: modulo.siglas || '',
          descripcion: modulo.descripcion || '',
          id_ciclo: modulo.id_ciclo,
          id_curso: temp.id_curso,
          cursoNombre,
          unidades: []
        });
      }

      // Se incorpora la unidad temporizada al catálogo del módulo.
      mapaAgrupado.get(modulo.id_modulo).unidades.push({
        id_temporizacion: temp.id_temporizacion,
        id_ut: ut.id_ut,
        id_curso: temp.id_curso,
        cursoNombre,
        numero: ut.numero,
        nombre: ut.nombre,
        nombre_alternativo: temp.nombre_alternativo,
        estado: temp.estado || 'Pendiente',
        orden: temp.orden,
        fecha_ini_prevista: temp.fecha_ini_prevista,
        fecha_fin_prevista: temp.fecha_fin_prevista,
        fecha_ini_real: temp.fecha_ini_real,
        fecha_fin_real: temp.fecha_fin_real,
        fechaInicioEfectiva: fInicio,
        fechaFinEfectiva: fFin,
        observaciones: temp.observaciones
      });
    });

    // Se ordenan los módulos alfabéticamente por siglas o denominación.
    const resultado = Array.from(mapaAgrupado.values());
    resultado.sort((a, b) =>
      (a.siglas || a.nombre).localeCompare(b.siglas || b.nombre)
    );

    // Se ordenan las unidades dentro de cada módulo por su orden secuencial o número oficial.
    resultado.forEach((mod) => {
      mod.unidades.sort((a, b) => {
        const ordenA = Number(a.orden) || Number(a.numero) || 0;
        const ordenB = Number(b.orden) || Number(b.numero) || 0;
        return ordenA - ordenB;
      });
    });

    return resultado;
  }, [datosTemporizacion, datosUT, datosModulos, datosCursos, limitesSemana]);

  // Conteo total de unidades didácticas activas durante la semana de impartición.
  const totalUnidadesSemana = useMemo(() => {
    return modulosConAgenda.reduce(
      (acumulado, mod) => acumulado + mod.unidades.length,
      0
    );
  }, [modulosConAgenda]);

  // Desplazamiento a la semana anterior (restando 7 días naturales).
  const irSemanaAnterior = useCallback(() => {
    setFechaReferencia((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() - 7);
      return nueva;
    });
  }, []);

  // Desplazamiento a la semana siguiente (sumando 7 días naturales).
  const irSemanaSiguiente = useCallback(() => {
    setFechaReferencia((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() + 7);
      return nueva;
    });
  }, []);

  // Restablecimiento a la semana actual del calendario.
  const irSemanaActual = useCallback(() => {
    setFechaReferencia(new Date());
  }, []);

  return {
    modulosConAgenda,
    totalUnidadesSemana,
    cargando: cargando || cargandoTemporizacion || cargandoUT || cargandoModulos || cargandoCursos,
    error: error || errorTemporizacion || errorUT || errorModulos || errorCursos,
    recargar: cargarDatos,
    fechaReferencia,
    fechaInicioSemanaISO: limitesSemana.lunesISO,
    fechaFinSemanaISO: limitesSemana.domingoISO,
    fechaInicioSemanaEspanol: limitesSemana.lunesEspanol,
    fechaFinSemanaEspanol: limitesSemana.domingoEspanol,
    esSemanaActual,
    irSemanaAnterior,
    irSemanaSiguiente,
    irSemanaActual,
    modulos: datosModulos
  };
};

export default useDashboardAgenda;
