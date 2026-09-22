import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import useGlobalToast from './useGlobalToast.js';
import {
  formatearFechaISO,
  parsearFechaISO,
  generarRangoFechas,
  calcularResumenLectivo,
  extraerAnioInicioCurso
} from '../utils/fechas.js';

// Hook personalizado para orquestar la gestión del calendario escolar, fechas límite del curso y festivos.
const useCalendarioEscolar = (cursoId) => {
  const [cursoActual, setCursoActual] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [festivos, setFestivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [haCambiado, setHaCambiado] = useState(false);

  // Notificaciones globales para feedback de usuario.
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Instancias aisladas del hook genérico useDatos para aislar Supabase.
  const {
    obtenerDatos: obtenerCursos,
    actualizar: actualizarCurso
  } = useDatos('Cursos');

  const {
    obtenerDatos: obtenerFestivos,
    insertar: insertarFestivos,
    eliminar: eliminarFestivos
  } = useDatos('Festivos');

  // Carga inicial y sincronización de las fechas del curso y los festivos asociados.
  // Se depende estrictamente de cursoId para evitar bucles infinitos de re-renderizado.
  const cargarCalendario = useCallback(async () => {
    if (!cursoId) {
      setCursoActual(null);
      setFechaInicio(null);
      setFechaFin(null);
      setFestivos([]);
      setHaCambiado(false);
      return;
    }

    setCargando(true);
    try {
      // 1. Se obtienen los datos del curso seleccionado.
      const cursosDb = await obtenerCursos('*', (consulta) =>
        consulta.eq('id_curso', cursoId)
      );

      const cursoEncontrado = cursosDb && cursosDb.length > 0 ? cursosDb[0] : null;
      setCursoActual(cursoEncontrado);

      if (cursoEncontrado) {
        setFechaInicio(parsearFechaISO(cursoEncontrado.fecha_inicio));
        setFechaFin(parsearFechaISO(cursoEncontrado.fecha_fin));
      } else {
        setFechaInicio(null);
        setFechaFin(null);
      }

      // 2. Se obtienen los días festivos registrados para dicho curso.
      const festivosDb = await obtenerFestivos('*', (consulta) =>
        consulta.eq('id_curso', cursoId).order('fecha', { ascending: true })
      );

      const festivosMapeados = (festivosDb || []).map((f) => ({
        id_festivo: f.id_festivo,
        fecha: f.fecha,
        fechaObj: parsearFechaISO(f.fecha),
        descripcion: f.descripcion || ''
      }));

      setFestivos(festivosMapeados);
      setHaCambiado(false);
    } catch (err) {
      console.error('Error al cargar la configuración del calendario escolar:', err);
      mostrarError('No se pudieron cargar los festivos ni las fechas del curso seleccionado.');
    } finally {
      setCargando(false);
    }
  }, [cursoId]);

  // Se sincroniza únicamente cuando cambia el identificador del curso seleccionado.
  useEffect(() => {
    cargarCalendario();
  }, [cargarCalendario]);

  // Manejador del cambio en la fecha oficial de inicio del curso.
  const manejarCambioFechaInicio = useCallback((nuevaFecha) => {
    setFechaInicio(nuevaFecha);
    setHaCambiado(true);
  }, []);

  // Manejador del cambio en la fecha oficial de fin del curso.
  const manejarCambioFechaFin = useCallback((nuevaFecha) => {
    setFechaFin(nuevaFecha);
    setHaCambiado(true);
  }, []);

  // Sincroniza la selección múltiple del Calendar interactivo de PrimeReact conservando descripciones previas.
  const actualizarFechasCalendario = useCallback((arrayFechas) => {
    const seleccionadas = Array.isArray(arrayFechas) ? arrayFechas : [];

    setFestivos((prev) => {
      // Se genera un mapa de descripciones existentes indexadas por su cadena ISO.
      const mapaDescripciones = new Map();
      prev.forEach((f) => {
        mapaDescripciones.set(f.fecha, f.descripcion);
      });

      // Se construye la nueva lista de festivos sin duplicados y ordenados cronológicamente.
      return seleccionadas
        .filter((d) => d instanceof Date && !isNaN(d.getTime()))
        .map((d) => {
          const iso = formatearFechaISO(d);
          return {
            fecha: iso,
            fechaObj: parsearFechaISO(iso),
            descripcion: mapaDescripciones.get(iso) || ''
          };
        })
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    });

    setHaCambiado(true);
  }, []);

  // Actualiza la descripción textual de un día festivo determinado.
  const actualizarDescripcionFestivo = useCallback((fechaISO, nuevaDescripcion) => {
    setFestivos((prev) =>
      prev.map((f) => (f.fecha === fechaISO ? { ...f, descripcion: nuevaDescripcion } : f))
    );
    setHaCambiado(true);
  }, []);

  // Conmuta la condición de festivo de un día concreto (lo añade si no existe o lo elimina si ya está marcado).
  const conmutarFestivo = useCallback((fechaDate, descripcion = '') => {
    if (!fechaDate || !(fechaDate instanceof Date) || isNaN(fechaDate.getTime())) return;
    const iso = formatearFechaISO(fechaDate);

    setFestivos((prev) => {
      const existe = prev.some((f) => f.fecha === iso);
      if (existe) {
        return prev.filter((f) => f.fecha !== iso);
      } else {
        const nuevoFestivo = {
          fecha: iso,
          fechaObj: parsearFechaISO(iso),
          descripcion: descripcion || ''
        };
        return [...prev, nuevoFestivo].sort((a, b) => a.fecha.localeCompare(b.fecha));
      }
    });

    setHaCambiado(true);
  }, []);

  // Agrega un festivo individual por su objeto Date.
  const agregarFestivo = useCallback((fechaDate, descripcion = '') => {
    if (!fechaDate || !(fechaDate instanceof Date) || isNaN(fechaDate.getTime())) return;
    const iso = formatearFechaISO(fechaDate);

    setFestivos((prev) => {
      if (prev.some((f) => f.fecha === iso)) return prev;
      const nuevoFestivo = {
        fecha: iso,
        fechaObj: parsearFechaISO(iso),
        descripcion: descripcion || ''
      };
      return [...prev, nuevoFestivo].sort((a, b) => a.fecha.localeCompare(b.fecha));
    });

    setHaCambiado(true);
  }, []);

  // Elimina un festivo por su fecha ISO.
  const eliminarFestivo = useCallback((fechaISO) => {
    setFestivos((prev) => prev.filter((f) => f.fecha !== fechaISO));
    setHaCambiado(true);
  }, []);

  // Agrega un rango completo de fechas como festivos (por ejemplo: vacaciones navideñas o Semana Santa).
  const agregarRangoFestivos = useCallback(
    (desde, hasta, descripcion = '', soloLaborables = true) => {
      const fechasNuevas = generarRangoFechas(desde, hasta, soloLaborables);
      if (fechasNuevas.length === 0) return;

      setFestivos((prev) => {
        const mapa = new Map();
        prev.forEach((f) => mapa.set(f.fecha, f.descripcion));

        fechasNuevas.forEach((d) => {
          const iso = formatearFechaISO(d);
          const descActual = mapa.get(iso);
          mapa.set(iso, descripcion || descActual || '');
        });

        return Array.from(mapa.entries())
          .map(([fecha, desc]) => ({
            fecha,
            fechaObj: parsearFechaISO(fecha),
            descripcion: desc
          }))
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
      });

      setHaCambiado(true);
    },
    []
  );

  // Vacía todos los días festivos seleccionados para el curso.
  const limpiarFestivos = useCallback(() => {
    setFestivos([]);
    setHaCambiado(true);
  }, []);

  // Copia festivos registrados desde otro curso hacia el curso actual con opciones de ajuste.
  const copiarFestivosDesdeCurso = useCallback(
    async (cursoOrigenId, opciones = {}) => {
      const {
        reemplazar = true,
        ajustarAnio = true,
        copiarLimites = false,
        cursoOrigenObj = null
      } = opciones;

      if (!cursoOrigenId) {
        mostrarAdvertencia('Debe seleccionar un curso de origen para copiar sus festivos.');
        return false;
      }

      setCargando(true);
      try {
        // 1. Se obtienen los festivos del curso de origen seleccionado.
        const festivosOrigenDb = await obtenerFestivos('*', (consulta) =>
          consulta.eq('id_curso', cursoOrigenId).order('fecha', { ascending: true })
        );

        if (!festivosOrigenDb || festivosOrigenDb.length === 0) {
          mostrarAdvertencia('El curso de origen seleccionado no contiene días festivos registrados.');
          return false;
        }

        // 2. Se calcula el desfase en años si se solicita ajustar fechas entre cursos distintos.
        let desfaseAnios = 0;
        if (ajustarAnio) {
          const anioDestino = extraerAnioInicioCurso(cursoActual, fechaInicio);
          let anioOrigen = anioDestino;

          if (cursoOrigenObj) {
            anioOrigen = extraerAnioInicioCurso(cursoOrigenObj, parsearFechaISO(cursoOrigenObj.fecha_inicio));
          } else {
            const cursosDb = await obtenerCursos('*', (q) => q.eq('id_curso', cursoOrigenId));
            if (cursosDb && cursosDb.length > 0) {
              anioOrigen = extraerAnioInicioCurso(cursosDb[0], parsearFechaISO(cursosDb[0].fecha_inicio));
            }
          }

          desfaseAnios = anioDestino - anioOrigen;
        }

        // 3. Se mapean las fechas ajustando el año si existiera desfase.
        const festivosMapeados = festivosOrigenDb.map((f) => {
          let fechaFinalISO = f.fecha;
          if (desfaseAnios !== 0) {
            const partes = f.fecha.split('-');
            const nuevoAnio = parseInt(partes[0], 10) + desfaseAnios;
            const mes = partes[1];
            let dia = partes[2];
            // Control de año bisiesto si la fecha original fuera 29 de febrero
            if (mes === '02' && dia === '29') {
              const esBisiesto = (nuevoAnio % 4 === 0 && nuevoAnio % 100 !== 0) || nuevoAnio % 400 === 0;
              if (!esBisiesto) dia = '28';
            }
            fechaFinalISO = `${nuevoAnio}-${mes}-${dia}`;
          }

          return {
            fecha: fechaFinalISO,
            fechaObj: parsearFechaISO(fechaFinalISO),
            descripcion: f.descripcion || ''
          };
        });

        // 4. Se actualiza la colección de festivos en el estado según el modo elegido.
        setFestivos((prev) => {
          if (reemplazar) {
            return festivosMapeados.sort((a, b) => a.fecha.localeCompare(b.fecha));
          }

          const mapa = new Map();
          prev.forEach((item) => mapa.set(item.fecha, item.descripcion));
          festivosMapeados.forEach((item) => {
            if (!mapa.has(item.fecha) || !mapa.get(item.fecha)) {
              mapa.set(item.fecha, item.descripcion);
            }
          });

          return Array.from(mapa.entries())
            .map(([fecha, desc]) => ({
              fecha,
              fechaObj: parsearFechaISO(fecha),
              descripcion: desc
            }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
        });

        // 5. Se copian las fechas de inicio y fin si el usuario lo ha marcado.
        if (copiarLimites) {
          let datosOrigen = cursoOrigenObj;
          if (!datosOrigen) {
            const cursosDb = await obtenerCursos('*', (q) => q.eq('id_curso', cursoOrigenId));
            if (cursosDb && cursosDb.length > 0) datosOrigen = cursosDb[0];
          }

          if (datosOrigen) {
            if (datosOrigen.fecha_inicio) {
              const fi = parsearFechaISO(datosOrigen.fecha_inicio);
              if (desfaseAnios !== 0 && fi) {
                fi.setFullYear(fi.getFullYear() + desfaseAnios);
              }
              setFechaInicio(fi);
            }
            if (datosOrigen.fecha_fin) {
              const ff = parsearFechaISO(datosOrigen.fecha_fin);
              if (desfaseAnios !== 0 && ff) {
                ff.setFullYear(ff.getFullYear() + desfaseAnios);
              }
              setFechaFin(ff);
            }
          }
        }

        setHaCambiado(true);
        mostrarExito(`Se han copiado ${festivosMapeados.length} días festivos al calendario. Recuerde pulsar en 'Guardar Calendario' para consolidar.`);
        return true;
      } catch (err) {
        console.error('Error al copiar festivos de otro curso:', err);
        mostrarError('Ocurrió un error al copiar los festivos del curso seleccionado.');
        return false;
      } finally {
        setCargando(false);
      }
    },
    [cursoActual, fechaInicio, obtenerFestivos, obtenerCursos, mostrarExito, mostrarError, mostrarAdvertencia]
  );

  // Guarda en la base de datos las fechas límite del curso y consolida la tabla de festivos.
  const guardarCalendario = useCallback(async () => {
    if (!cursoId) {
      mostrarAdvertencia('Debe seleccionar un curso académico para guardar su calendario.');
      return false;
    }

    if (!fechaInicio || !fechaFin) {
      mostrarAdvertencia('Debe indicar tanto la fecha de inicio como la de fin del curso lectivo.');
      return false;
    }

    if (fechaInicio > fechaFin) {
      mostrarAdvertencia('La fecha de inicio no puede ser posterior a la fecha de fin del curso.');
      return false;
    }

    setGuardando(true);
    try {
      const fechaIniISO = formatearFechaISO(fechaInicio);
      const fechaFinISO = formatearFechaISO(fechaFin);

      // 1. Se actualizan las fechas de inicio y fin en la tabla Cursos.
      const resultadoCurso = await actualizarCurso('id_curso', cursoId, {
        fecha_inicio: fechaIniISO,
        fecha_fin: fechaFinISO
      });

      if (!resultadoCurso) {
        throw new Error('No se pudo actualizar el rango de fechas del curso académico.');
      }

      // 2. Se eliminan los festivos previos del curso en la tabla Festivos.
      await eliminarFestivos('id_curso', cursoId);

      // 3. Se inserta masivamente el nuevo conjunto de días festivos con su descripción.
      if (festivos.length > 0) {
        const registrosAInsertar = festivos.map((f) => ({
          id_curso: cursoId,
          fecha: f.fecha,
          descripcion: f.descripcion?.trim() || null
        }));

        const resultadoInsertar = await insertarFestivos(registrosAInsertar);
        if (!resultadoInsertar) {
          throw new Error('No se pudieron registrar los nuevos festivos en la base de datos.');
        }
      }

      setHaCambiado(false);
      mostrarExito('Calendario escolar consolidado y guardado correctamente.');
      return true;
    } catch (err) {
      console.error('Error al guardar el calendario escolar:', err);
      mostrarError('Ocurrió un error al guardar el calendario escolar en la base de datos.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [cursoId, fechaInicio, fechaFin, festivos, actualizarCurso, eliminarFestivos, insertarFestivos, mostrarExito, mostrarError, mostrarAdvertencia]);

  // Array de objetos Date directamente utilizable por la prop value del componente Calendar.
  const fechasSeleccionadas = useMemo(() => {
    return festivos.map((f) => f.fechaObj).filter(Boolean);
  }, [festivos]);

  // Resumen cuantitativo de días lectivos y festivos entre inicio y fin de curso.
  const resumenLectivo = useMemo(() => {
    return calcularResumenLectivo(fechaInicio, fechaFin, festivos);
  }, [fechaInicio, fechaFin, festivos]);

  return {
    cursoActual,
    fechaInicio,
    fechaFin,
    festivos,
    fechasSeleccionadas,
    resumenLectivo,
    cargando,
    guardando,
    haCambiado,
    setFechaInicio: manejarCambioFechaInicio,
    setFechaFin: manejarCambioFechaFin,
    actualizarFechasCalendario,
    actualizarDescripcionFestivo,
    conmutarFestivo,
    agregarFestivo,
    eliminarFestivo,
    agregarRangoFestivos,
    limpiarFestivos,
    copiarFestivosDesdeCurso,
    guardarCalendario,
    recargarCalendario: cargarCalendario
  };
};

export default useCalendarioEscolar;
