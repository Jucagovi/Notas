import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';

/**
 * Custom Hook para la planificación y seguimiento temporal de las Unidades de Trabajo de un módulo.
 *
 * Responsabilidad Única: Centralizar la consulta, ordenación secuencial, sincronización de
 * instancias de temporización y mutaciones de fechas y estados, consumiendo el hook genérico useDatos.
 *
 * @param {string|null} idCurso - Identificador único de la clase / curso escolar.
 * @param {string|null} idModulo - Identificador único del módulo profesional.
 */
const useTemporizacion = (idCurso = null, idModulo = null) => {
  // Se inicializa el hook genérico useDatos para la tabla de relación Temporizacion.
  const {
    datos: datosTemporizacion,
    cargando: cargandoTemporizacion,
    error: errorTemporizacion,
    obtenerDatos: obtenerTemporizacion,
    insertar: insertarTemporizacion,
    actualizar: actualizarTemporizacionEnHook,
    setDatos: setDatosTemporizacion
  } = useDatos('Temporizacion');

  // Se inicializa el hook genérico useDatos para consultar las Unidades de Trabajo del módulo.
  const {
    datos: datosUTs,
    cargando: cargandoUTs,
    error: errorUTs,
    obtenerDatos: obtenerUTs
  } = useDatos('Unidades_Trabajo');

  const [temporizaciones, setTemporizaciones] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Consulta de las Unidades de Trabajo base correspondientes al módulo seleccionado.
  const cargarUnidadesBase = useCallback(async () => {
    if (!idModulo) return [];
    return await obtenerUTs('*', (consulta) =>
      consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
    );
  }, [idModulo, obtenerUTs]);

  // Consulta y sincronización de las instancias de temporización vinculando la clase y el módulo.
  const cargarDatos = useCallback(async () => {
    if (!idCurso || !idModulo) {
      setTemporizaciones([]);
      setErrorOperacion(null);
      return [];
    }

    try {
      setErrorOperacion(null);

      // 1. Se obtienen las unidades de trabajo curriculares del módulo.
      const unidades = await cargarUnidadesBase();
      if (!unidades || unidades.length === 0) {
        setTemporizaciones([]);
        return [];
      }

      const listaIdsUT = unidades.map((u) => u.id_ut);

      // 2. Se obtienen los registros existentes de temporización para la clase activa.
      const registrosTemporizacion = await obtenerTemporizacion('*', (consulta) =>
        consulta.eq('id_curso', idCurso).in('id_ut', listaIdsUT).order('orden', { ascending: true })
      );

      const mapaTemporizacionPorUt = new Map();
      (registrosTemporizacion || []).forEach((reg) => {
        mapaTemporizacionPorUt.set(reg.id_ut, reg);
      });

      // 3. Se identifican unidades curriculares que carezcan de registro en la clase para crearlas.
      const unidadesFaltantes = unidades.filter((u) => !mapaTemporizacionPorUt.has(u.id_ut));

      if (unidadesFaltantes.length > 0) {
        // Se calcula el orden consecutivo para las nuevas inserciones.
        const maxOrdenActual = (registrosTemporizacion || []).reduce(
          (max, reg) => Math.max(max, Number(reg.orden) || 0),
          0
        );

        for (let i = 0; i < unidadesFaltantes.length; i += 1) {
          const ut = unidadesFaltantes[i];
          const nuevoRegistro = {
            id_curso: idCurso,
            id_ut: ut.id_ut,
            orden: maxOrdenActual > 0 ? maxOrdenActual + i + 1 : ut.numero,
            estado: 'Pendiente',
            nombre_alternativo: null,
            observaciones: null,
            fecha_ini_prevista: null,
            fecha_fin_prevista: null,
            fecha_ini_real: null,
            fecha_fin_real: null
          };

          const insercion = await insertarTemporizacion(nuevoRegistro);
          if (insercion && insercion[0]) {
            mapaTemporizacionPorUt.set(ut.id_ut, insercion[0]);
          }
        }
      }

      // 4. Se construye la estructura consolidada fusionando los datos curriculares y temporales.
      const resultadoConsolidado = unidades.map((ut) => {
        const temp = mapaTemporizacionPorUt.get(ut.id_ut) || {};
        return {
          id_temporizacion: temp.id_temporizacion || null,
          id_ut: ut.id_ut,
          id_curso: idCurso,
          orden: Number(temp.orden) || Number(ut.numero) || 1,
          nombre_alternativo: temp.nombre_alternativo || '',
          fecha_ini_prevista: temp.fecha_ini_prevista || null,
          fecha_fin_prevista: temp.fecha_fin_prevista || null,
          fecha_ini_real: temp.fecha_ini_real || null,
          fecha_fin_real: temp.fecha_fin_real || null,
          estado: temp.estado || 'Pendiente',
          observaciones: temp.observaciones || '',
          unidad_trabajo: ut
        };
      });

      // Se ordena la lista por el campo de orden de impartición.
      resultadoConsolidado.sort((a, b) => a.orden - b.orden);

      setTemporizaciones(resultadoConsolidado);
      return resultadoConsolidado;
    } catch (err) {
      console.error('Error al cargar la temporización:', err);
      const mensaje = err?.message || 'Error al obtener los datos de temporización.';
      setErrorOperacion(mensaje);
      return [];
    }
  }, [idCurso, idModulo, cargarUnidadesBase, obtenerTemporizacion, insertarTemporizacion]);

  // Recarga reactiva de datos al modificar los filtros de la clase.
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Actualización de los datos de un registro de temporización individual.
  const actualizarTemporizacion = useCallback(
    async (idTemporizacion, valoresActualizados) => {
      if (!idTemporizacion) {
        return { error: 'Identificador de temporización no válido.', status: 400 };
      }

      setGuardando(true);
      setErrorOperacion(null);
      try {
        const resultado = await actualizarTemporizacionEnHook(
          'id_temporizacion',
          idTemporizacion,
          valoresActualizados
        );

        if (!resultado) {
          throw new Error('No se pudo actualizar el registro en la base de datos.');
        }

        // Se actualiza el estado local optimísticamente para una respuesta inmediata.
        setTemporizaciones((prev) =>
          prev.map((item) =>
            item.id_temporizacion === idTemporizacion
              ? { ...item, ...valoresActualizados }
              : item
          )
        );

        return { data: resultado, error: null, status: 200 };
      } catch (err) {
        console.error('Error al actualizar la temporización:', err);
        const mensaje = err?.message || 'Error al actualizar el registro.';
        setErrorOperacion(mensaje);
        return { error: mensaje, status: 400 };
      } finally {
        setGuardando(false);
      }
    },
    [actualizarTemporizacionEnHook]
  );

  // Actualización rápida de un único campo editable en línea.
  const actualizarCampoEnLinea = useCallback(
    async (idTemporizacion, campo, valor) => {
      return await actualizarTemporizacion(idTemporizacion, { [campo]: valor });
    },
    [actualizarTemporizacion]
  );

  // Reordenación secuencial de las filas tras el arrastre nativo RowReorder.
  const reordenarTemporizaciones = useCallback(
    async (filasReordenadas) => {
      if (!Array.isArray(filasReordenadas) || filasReordenadas.length === 0) {
        return { error: 'Lista de elementos no válida para reordenación.', status: 400 };
      }

      setGuardando(true);
      setErrorOperacion(null);

      // Se recalcula el orden secuencial comenzando en 1.
      const filasConNuevoOrden = filasReordenadas.map((fila, index) => ({
        ...fila,
        orden: index + 1
      }));

      // Se actualiza de inmediato el estado en la interfaz para evitar parpadeos visuales.
      setTemporizaciones(filasConNuevoOrden);

      try {
        // Se detectan las filas cuyo número de orden haya variado.
        const filasAfectadas = filasConNuevoOrden.filter((fila) => {
          const original = temporizaciones.find(
            (t) => t.id_temporizacion === fila.id_temporizacion
          );
          return !original || original.orden !== fila.orden;
        });

        // Se ejecutan las actualizaciones de orden en Supabase a través de useDatos.
        const promesas = filasAfectadas.map((fila) =>
          actualizarTemporizacionEnHook('id_temporizacion', fila.id_temporizacion, {
            orden: fila.orden
          })
        );

        const resultados = await Promise.all(promesas);
        const hayFallos = resultados.some((r) => r === null);

        if (hayFallos) {
          throw new Error('No se pudieron persistir todas las posiciones de orden en la base de datos.');
        }

        return { data: filasConNuevoOrden, error: null, status: 200 };
      } catch (err) {
        console.error('Error al reordenar las temporizaciones:', err);
        const mensaje = err?.message || 'Error al reordenar las filas en la base de datos.';
        setErrorOperacion(mensaje);
        // Se revierte el estado local recargando los datos desde el servidor.
        await cargarDatos();
        return { error: mensaje, status: 400 };
      } finally {
        setGuardando(false);
      }
    },
    [temporizaciones, actualizarTemporizacionEnHook, cargarDatos]
  );

  // Restablece el orden de impartición secuencial según el número curricular de cada UT.
  const restablecerOrdenOriginal = useCallback(async () => {
    if (!temporizaciones || temporizaciones.length === 0) {
      return { error: 'No hay unidades para restablecer su orden.', status: 400 };
    }

    const ordenadasPorCurriculo = [...temporizaciones].sort(
      (a, b) => Number(a.unidad_trabajo?.numero || 0) - Number(b.unidad_trabajo?.numero || 0)
    );

    return await reordenarTemporizaciones(ordenadasPorCurriculo);
  }, [temporizaciones, reordenarTemporizaciones]);

  // Resumen estadístico reactivo sobre el progreso del módulo.
  const estadisticas = useMemo(() => {
    const total = temporizaciones.length;
    const pendientes = temporizaciones.filter((t) => t.estado === 'Pendiente').length;
    const enCurso = temporizaciones.filter((t) => t.estado === 'En Curso').length;
    const completadas = temporizaciones.filter((t) => t.estado === 'Completada').length;
    const porcentajeProgreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return {
      total,
      pendientes,
      enCurso,
      completadas,
      porcentajeProgreso
    };
  }, [temporizaciones]);

  // Aplica la propuesta de fechas estimadas actualizando todas las unidades de trabajo afectadas.
  const aplicarPropuestaFechas = useCallback(
    async (unidadesPropuestas = []) => {
      if (!Array.isArray(unidadesPropuestas) || unidadesPropuestas.length === 0) {
        return { error: 'No hay unidades en la propuesta para aplicar.', status: 400 };
      }

      setGuardando(true);
      setErrorOperacion(null);

      // Mapa de fechas propuestas por id_temporizacion.
      const mapaPropuestas = new Map();
      unidadesPropuestas.forEach((u) => {
        if (u.id_temporizacion) {
          mapaPropuestas.set(u.id_temporizacion, {
            fecha_ini_prevista: u.fecha_ini_prevista,
            fecha_fin_prevista: u.fecha_fin_prevista
          });
        }
      });

      // Se actualiza el estado local de forma optimista para una respuesta visual instantánea.
      setTemporizaciones((prev) =>
        prev.map((item) => {
          const nuevasFechas = mapaPropuestas.get(item.id_temporizacion);
          return nuevasFechas ? { ...item, ...nuevasFechas } : item;
        })
      );

      try {
        const promesas = unidadesPropuestas.map((u) => {
          if (!u.id_temporizacion) return Promise.resolve(null);
          return actualizarTemporizacionEnHook('id_temporizacion', u.id_temporizacion, {
            fecha_ini_prevista: u.fecha_ini_prevista,
            fecha_fin_prevista: u.fecha_fin_prevista
          });
        });

        await Promise.all(promesas);
        return { data: true, error: null, status: 200 };
      } catch (err) {
        console.error('Error al aplicar la propuesta de temporización:', err);
        const mensaje = err?.message || 'Error al guardar las fechas de la propuesta en la base de datos.';
        setErrorOperacion(mensaje);
        await cargarDatos();
        return { error: mensaje, status: 400 };
      } finally {
        setGuardando(false);
      }
    },
    [actualizarTemporizacionEnHook, cargarDatos]
  );

  // Borra por completo la temporización de la clase restableciendo fechas y estados.
  const borrarTemporizacionCompleta = useCallback(async () => {
    if (!temporizaciones || temporizaciones.length === 0) {
      return { error: 'No hay unidades de temporización para borrar en esta clase.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);

    // Se limpia de inmediato el estado local para una respuesta visual instantánea.
    setTemporizaciones((prev) =>
      prev.map((item) => ({
        ...item,
        fecha_ini_prevista: null,
        fecha_fin_prevista: null,
        fecha_ini_real: null,
        fecha_fin_real: null,
        estado: 'Pendiente'
      }))
    );

    try {
      const promesas = temporizaciones.map((t) =>
        actualizarTemporizacionEnHook('id_temporizacion', t.id_temporizacion, {
          fecha_ini_prevista: null,
          fecha_fin_prevista: null,
          fecha_ini_real: null,
          fecha_fin_real: null,
          estado: 'Pendiente'
        })
      );

      await Promise.all(promesas);
      return { data: true, error: null, status: 200 };
    } catch (err) {
      console.error('Error al borrar la temporización:', err);
      const mensaje = err?.message || 'Error al eliminar las fechas de temporización en la base de datos.';
      setErrorOperacion(mensaje);
      await cargarDatos();
      return { error: mensaje, status: 400 };
    } finally {
      setGuardando(false);
    }
  }, [temporizaciones, actualizarTemporizacionEnHook, cargarDatos]);

  return {
    temporizaciones,
    setTemporizaciones,
    estadisticas,
    cargando: cargandoTemporizacion || cargandoUTs,
    guardando,
    error: errorTemporizacion || errorUTs || errorOperacion,
    recargar: cargarDatos,
    actualizarTemporizacion,
    actualizarCampoEnLinea,
    reordenarTemporizaciones,
    restablecerOrdenOriginal,
    aplicarPropuestaFechas,
    borrarTemporizacionCompleta
  };
};

export default useTemporizacion;
