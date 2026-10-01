import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { parsearFechaISO, formatearFechaISO, extraerAnioInicioCurso } from '../utils/fechas.js';
import { formatearNumeroUT } from '../utils/formatoUT.js';

/**
 * Custom Hook para el monitor de desviación curricular y análisis de progreso temporal.
 *
 * Responsabilidad Única: Centralizar la obtención de registros de la tabla Temporizacion
 * cruzados con las Unidades_Trabajo y Modulos del curso activo, calculando la desviación
 * entre la fecha límite prevista y la fecha actual según las reglas del Caso de Uso 24.
 *
 * @param {string|null} [idCursoSeleccionado=null] - Identificador único opcional del curso.
 * @param {string|null} [idModuloSeleccionado=null] - Identificador único opcional del módulo.
 */
const useMonitorCurricular = (idCursoSeleccionado = null, idModuloSeleccionado = null) => {
  // Instancias aisladas del hook genérico useDatos para cada tabla requerida.
  const {
    obtenerDatos: obtenerTemporizacion,
    cargando: cargandoTemporizacion,
    error: errorTemporizacion
  } = useDatos('Temporizacion');

  const {
    obtenerDatos: obtenerUTs,
    cargando: cargandoUTs,
    error: errorUTs
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

  const {
    obtenerDatos: obtenerImparte,
    cargando: cargandoImparte,
    error: errorImparte
  } = useDatos('imparte');

  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [imparte, setImparte] = useState([]);
  const [temporizaciones, setTemporizaciones] = useState([]);
  const [unidadesTrabajo, setUnidadesTrabajo] = useState([]);
  const [cargandoLocal, setCargandoLocal] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Carga unificada de catálogos base y relaciones.
  const cargarDatosBase = useCallback(async () => {
    setCargandoLocal(true);
    setErrorOperacion(null);
    try {
      const [datosCursos, datosModulos, datosImparte, datosUTs] = await Promise.all([
        obtenerCursos('*', (q) => q.order('anyo', { ascending: false })),
        obtenerModulos('*', (q) => q.order('nombre', { ascending: true })),
        obtenerImparte('id_curso, id_modulo'),
        obtenerUTs('*', (q) => q.order('numero', { ascending: true }))
      ]);

      setCursos(datosCursos || []);
      setModulos(datosModulos || []);
      setImparte(datosImparte || []);
      setUnidadesTrabajo(datosUTs || []);
      return { cursos: datosCursos, modulos: datosModulos, imparte: datosImparte, uts: datosUTs };
    } catch (err) {
      console.error('Error al cargar datos base para el monitor curricular:', err);
      const mensaje = err?.message || 'Error al obtener la información base.';
      setErrorOperacion(mensaje);
      return null;
    } finally {
      setCargandoLocal(false);
    }
  }, [obtenerCursos, obtenerModulos, obtenerImparte, obtenerUTs]);

  // Determinación reactiva del curso activo cuando no se proporciona explícitamente.
  const cursoActivo = useMemo(() => {
    if (idCursoSeleccionado) {
      return (cursos || []).find((c) => c.id_curso === idCursoSeleccionado) || null;
    }
    if (!cursos || cursos.length === 0) return null;

    // Se prioriza el curso más reciente calculado a partir del año de inicio.
    const ordenados = [...cursos].sort((a, b) => {
      const anioA = extraerAnioInicioCurso(a);
      const anioB = extraerAnioInicioCurso(b);
      return anioB - anioA;
    });

    return ordenados[0] || null;
  }, [cursos, idCursoSeleccionado]);

  const idCursoEfectivo = cursoActivo?.id_curso || idCursoSeleccionado || null;

  // Consulta de los registros de temporización correspondientes al curso activo.
  const cargarTemporizacionesCurso = useCallback(async () => {
    if (!idCursoEfectivo) {
      setTemporizaciones([]);
      return [];
    }

    try {
      const datosTempo = await obtenerTemporizacion('*', (q) =>
        q.eq('id_curso', idCursoEfectivo).order('orden', { ascending: true })
      );
      setTemporizaciones(datosTempo || []);
      return datosTempo || [];
    } catch (err) {
      console.error('Error al cargar temporizaciones del curso:', err);
      const mensaje = err?.message || 'Error al obtener las temporizaciones.';
      setErrorOperacion(mensaje);
      return [];
    }
  }, [idCursoEfectivo, obtenerTemporizacion]);

  // Carga inicial y reactiva al variar el curso seleccionado.
  useEffect(() => {
    cargarDatosBase();
  }, [cargarDatosBase]);

  useEffect(() => {
    if (idCursoEfectivo) {
      cargarTemporizacionesCurso();
    }
  }, [idCursoEfectivo, cargarTemporizacionesCurso]);

  // Fecha actual de referencia normalizada a las 00:00:00 locales.
  const fechaHoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fechaHoyStr = useMemo(() => formatearFechaISO(fechaHoy), [fechaHoy]);

  // Cálculo detallado de la desviación de cada Unidad de Trabajo temporizada.
  const unidadesConDesviacion = useMemo(() => {
    if (!temporizaciones || temporizaciones.length === 0 || !unidadesTrabajo) {
      return [];
    }

    const mapaUT = new Map((unidadesTrabajo || []).map((u) => [u.id_ut, u]));
    const mapaModulos = new Map((modulos || []).map((m) => [m.id_modulo, m]));

    return temporizaciones.map((temp) => {
      const ut = mapaUT.get(temp.id_ut) || {};
      const modulo = mapaModulos.get(ut.id_modulo) || {};
      const estado = temp.estado || 'Pendiente';
      const esCompletada = estado === 'Completada';
      const fFinPrev = parsearFechaISO(temp.fecha_fin_prevista);
      const fIniPrev = parsearFechaISO(temp.fecha_ini_prevista);
      const fFinReal = parsearFechaISO(temp.fecha_fin_real);
      const fIniReal = parsearFechaISO(temp.fecha_ini_real);

      let enRetraso = false;
      let enTiempo = true;
      let diasRetraso = 0;
      let textoDesviacion = 'En tiempo';
      let severidad = 'success';
      let icono = 'pi pi-check-circle';
      let colorReal = '#22c55e'; // Verde de éxito cuando la unidad progresa a tiempo.

      if (!fFinPrev) {
        // En ausencia de fecha fin prevista no es viable computar retraso.
        textoDesviacion = 'Sin fecha prevista';
        severidad = 'info';
        icono = 'pi pi-calendar-times';
        enRetraso = false;
        enTiempo = false;
        colorReal = '#9ca3af';
      } else if (esCompletada) {
        // Si ya está completada, se comprueba si la fecha fin real superó la prevista.
        if (fFinReal && fFinReal > fFinPrev) {
          const diffMs = fFinReal.getTime() - fFinPrev.getTime();
          diasRetraso = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          enRetraso = true;
          enTiempo = false;
          textoDesviacion = `Retraso de ${diasRetraso} ${diasRetraso === 1 ? 'día' : 'días'}`;
          severidad = 'danger';
          icono = 'pi pi-exclamation-triangle';
          colorReal = '#ef4444'; // Rojo cuando hubo demora en la finalización.
        } else {
          textoDesviacion = 'En tiempo';
          severidad = 'success';
          icono = 'pi pi-check-circle';
          enRetraso = false;
          enTiempo = true;
          colorReal = '#22c55e';
        }
      } else {
        // Algoritmo Caso de Uso 24: se resta fecha_fin_prevista de la fecha actual.
        // Si el resultado es positivo y la UT no está 'Completada', se genera la alerta de retraso.
        const diffMs = fechaHoy.getTime() - fFinPrev.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDias > 0) {
          enRetraso = true;
          enTiempo = false;
          diasRetraso = diffDias;
          textoDesviacion = `Retraso de ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
          severidad = 'danger';
          icono = 'pi pi-exclamation-triangle';
          colorReal = '#ef4444'; // Rojo por desfase temporal no resuelto.
        } else {
          enRetraso = false;
          enTiempo = true;
          textoDesviacion = 'En tiempo';
          severidad = 'success';
          icono = 'pi pi-check-circle';
          colorReal = '#22c55e';
        }
      }

      return {
        ...temp,
        unidad_trabajo: ut,
        modulo,
        id_modulo: ut.id_modulo || null,
        numUT: formatearNumeroUT(ut.numero || temp.orden),
        nombreUT: ut.nombre || 'Unidad de Trabajo',
        descripcionUT: ut.descripcion || '',
        esCompletada,
        enRetraso,
        enTiempo,
        diasRetraso,
        textoDesviacion,
        severidad,
        icono,
        colorReal,
        fIniPrev,
        fFinPrev,
        fIniReal,
        fFinReal
      };
    });
  }, [temporizaciones, unidadesTrabajo, modulos, fechaHoy]);

  // Filtrado de las unidades si se ha solicitado un módulo concreto.
  const unidadesFiltradas = useMemo(() => {
    if (!idModuloSeleccionado) return unidadesConDesviacion;
    return unidadesConDesviacion.filter((u) => u.id_modulo === idModuloSeleccionado);
  }, [unidadesConDesviacion, idModuloSeleccionado]);

  // Agrupación y cálculo por cada módulo que el docente imparte en el curso activo.
  const modulosMonitor = useMemo(() => {
    if (!idCursoEfectivo) return [];

    // Se determinan los módulos impartidos en este curso a través de la tabla imparte o temporizaciones.
    const idsModulosImpartidos = new Set();

    (imparte || []).forEach((rel) => {
      if (rel.id_curso === idCursoEfectivo && rel.id_modulo) {
        idsModulosImpartidos.add(rel.id_modulo);
      }
    });

    // Como salvaguarda complementaria se incorporan módulos presentes en las temporizaciones.
    unidadesConDesviacion.forEach((u) => {
      if (u.id_modulo) {
        idsModulosImpartidos.add(u.id_modulo);
      }
    });

    const mapaModulos = new Map((modulos || []).map((m) => [m.id_modulo, m]));

    const resultado = [];

    idsModulosImpartidos.forEach((idMod) => {
      const mod = mapaModulos.get(idMod);
      if (!mod) return;

      const unidadesMod = unidadesConDesviacion.filter((u) => u.id_modulo === idMod);
      const totalUTs = unidadesMod.length;
      const completadas = unidadesMod.filter((u) => u.esCompletada).length;
      const enCurso = unidadesMod.filter((u) => u.estado === 'En Curso').length;
      const pendientes = unidadesMod.filter((u) => u.estado === 'Pendiente').length;
      const conRetraso = unidadesMod.filter((u) => u.enRetraso).length;
      const porcentajeAvance = totalUTs > 0 ? Math.round((completadas / totalUTs) * 100) : 0;

      // Determinación de la Unidad de Trabajo activa según fecha actual y estado.
      // 1. Se prioriza una unidad expresamente en estado 'En Curso'.
      let utActiva = unidadesMod.find((u) => u.estado === 'En Curso') || null;

      // 2. Si no consta en curso, se busca una unidad cuyo rango previsto incluya la fecha de hoy.
      if (!utActiva) {
        utActiva = unidadesMod.find((u) => {
          if (!u.fecha_ini_prevista || !u.fecha_fin_prevista) return false;
          return u.fecha_ini_prevista <= fechaHoyStr && fechaHoyStr <= u.fecha_fin_prevista;
        }) || null;
      }

      // 3. Si ninguna coincide con hoy, se selecciona la primera unidad no completada.
      if (!utActiva) {
        utActiva = unidadesMod.find((u) => !u.esCompletada) || null;
      }

      // 4. Si todas están completadas o no hay no completadas, se toma la última de la secuencia.
      if (!utActiva && unidadesMod.length > 0) {
        utActiva = unidadesMod[unidadesMod.length - 1];
      }

      // Desviación de la unidad activa para el termómetro curricular del dashboard.
      const desviacionActiva = utActiva
        ? {
            enRetraso: utActiva.enRetraso,
            enTiempo: utActiva.enTiempo,
            diasRetraso: utActiva.diasRetraso,
            texto: utActiva.textoDesviacion,
            severidad: utActiva.severidad,
            icono: utActiva.icono
          }
        : {
            enRetraso: false,
            enTiempo: true,
            diasRetraso: 0,
            texto: 'Sin unidades activas',
            severidad: 'info',
            icono: 'pi pi-info-circle'
          };

      resultado.push({
        id_modulo: mod.id_modulo,
        id_curso: idCursoEfectivo,
        siglas: mod.siglas || '',
        nombre: mod.nombre || '',
        totalUTs,
        completadas,
        enCurso,
        pendientes,
        conRetraso,
        porcentajeAvance,
        utActiva,
        desviacion: desviacionActiva,
        unidades: unidadesMod
      });
    });

    // Ordenación alfabética por denominación de módulo.
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return resultado;
  }, [idCursoEfectivo, imparte, unidadesConDesviacion, modulos, fechaHoyStr]);

  // Resumen estadístico general del alcance actual.
  const estadisticas = useMemo(() => {
    const unidades = unidadesFiltradas;
    const total = unidades.length;
    const completadas = unidades.filter((u) => u.esCompletada).length;
    const enCurso = unidades.filter((u) => u.estado === 'En Curso').length;
    const pendientes = unidades.filter((u) => u.estado === 'Pendiente').length;
    const conRetraso = unidades.filter((u) => u.enRetraso).length;
    const enTiempo = unidades.filter((u) => u.enTiempo).length;
    const porcentajeProgreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return {
      total,
      completadas,
      enCurso,
      pendientes,
      conRetraso,
      enTiempo,
      porcentajeProgreso
    };
  }, [unidadesFiltradas]);

  // Recarga unificada de todos los orígenes del monitor curricular.
  const recargar = useCallback(async () => {
    await cargarDatosBase();
    if (idCursoEfectivo) {
      await cargarTemporizacionesCurso();
    }
  }, [cargarDatosBase, idCursoEfectivo, cargarTemporizacionesCurso]);

  const cargando =
    cargandoTemporizacion ||
    cargandoUTs ||
    cargandoModulos ||
    cargandoCursos ||
    cargandoImparte ||
    cargandoLocal;

  const error =
    errorTemporizacion ||
    errorUTs ||
    errorModulos ||
    errorCursos ||
    errorImparte ||
    errorOperacion;

  return {
    cursoActivo,
    cursos,
    modulos,
    unidades: unidadesFiltradas,
    todasLasUnidades: unidadesConDesviacion,
    modulosMonitor,
    estadisticas,
    fechaHoyStr,
    cargando,
    error,
    recargar
  };
};

export default useMonitorCurricular;
