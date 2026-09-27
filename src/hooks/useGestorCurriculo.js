import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';

/**
 * Custom Hook orquestador para la gestión del currículo de una clase y su módulo profesional.
 *
 * Responsabilidad Única: Centralizar la obtención y mutación de las Unidades de Trabajo
 * y de las Versiones de actividades asociadas, coordinando las asignaciones y desvinculaciones
 * necesarias para el espacio curricular en dos columnas.
 *
 * @param {string|null} idCurso - Identificador único del curso académico asociado a la clase.
 * @param {string|null} idModulo - Identificador único del módulo profesional asignado.
 */
const useGestorCurriculo = (idCurso = null, idModulo = null) => {
  // Se inicializa el hook genérico useDatos para la tabla Unidades_Trabajo.
  const {
    datos: unidadesTrabajo,
    cargando: cargandoUTs,
    error: errorUTs,
    obtenerDatos: obtenerUTs,
    insertar: insertarUT,
    actualizar: actualizarUT,
    eliminar: eliminarUT,
    setDatos: setUnidadesTrabajo
  } = useDatos('Unidades_Trabajo');

  // Se inicializa el hook genérico useDatos para la tabla Versiones.
  const {
    datos: versiones,
    cargando: cargandoVersiones,
    error: errorVersiones,
    obtenerDatos: obtenerVersiones,
    setDatos: setVersiones
  } = useDatos('Versiones');

  const { obtenerDatos: obtenerRAs } = useDatos('RA');
  const { obtenerDatos: obtenerDesarrollan } = useDatos('desarrollan');

  const [listaRAs, setListaRAs] = useState([]);
  const [relacionesDesarrollan, setRelacionesDesarrollan] = useState([]);
  const [cargandoOperacion, setCargandoOperacion] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Consulta de las Unidades de Trabajo pertenecientes al módulo seleccionado ordenadas por número.
  const cargarUnidadesTrabajo = useCallback(async () => {
    if (!idModulo) {
      setUnidadesTrabajo([]);
      return [];
    }
    return await obtenerUTs('*', (consulta) =>
      consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
    );
  }, [idModulo, obtenerUTs, setUnidadesTrabajo]);

  // Consulta de los Resultados de Aprendizaje del módulo y sus vínculos en desarrollan.
  const cargarRAsYDesarrollan = useCallback(async () => {
    if (!idModulo) {
      setListaRAs([]);
      setRelacionesDesarrollan([]);
      return;
    }
    try {
      const [rasData, desarrollanData] = await Promise.all([
        obtenerRAs('*', (consulta) =>
          consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
        ),
        obtenerDesarrollan('*')
      ]);
      setListaRAs(rasData || []);
      setRelacionesDesarrollan(desarrollanData || []);
    } catch (err) {
      console.error('Error al cargar RAs o relaciones desarrollan:', err);
    }
  }, [idModulo, obtenerRAs, obtenerDesarrollan]);

  // Consulta de las Versiones instanciadas para la clase y módulo indicados.
  const cargarVersiones = useCallback(async () => {
    if (!idCurso || !idModulo) {
      setVersiones([]);
      return [];
    }
    return await obtenerVersiones(
      '*, Practicas!inner(id_practica, nombre, descripcion, id_tipopractica, id_modulo)',
      (consulta) =>
        consulta
          .eq('id_curso', idCurso)
          .eq('Practicas.id_modulo', idModulo)
          .order('numero', { ascending: true })
    );
  }, [idCurso, idModulo, obtenerVersiones, setVersiones]);

  // Se recargan todos los datos curriculares vinculados a los parámetros seleccionados.
  const recargar = useCallback(async () => {
    const tareas = [];
    if (idModulo) {
      tareas.push(cargarUnidadesTrabajo());
      tareas.push(cargarRAsYDesarrollan());
    }
    if (idCurso && idModulo) {
      tareas.push(cargarVersiones());
    }
    await Promise.all(tareas);
  }, [idModulo, idCurso, cargarUnidadesTrabajo, cargarVersiones, cargarRAsYDesarrollan]);

  // Efecto para sincronizar las unidades de trabajo y RAs cuando cambia el módulo de la clase.
  useEffect(() => {
    cargarUnidadesTrabajo();
    cargarRAsYDesarrollan();
  }, [cargarUnidadesTrabajo, cargarRAsYDesarrollan]);

  // Efecto para sincronizar las actividades cuando cambian el curso o el módulo de la clase.
  useEffect(() => {
    cargarVersiones();
  }, [cargarVersiones]);

  // Creación de una nueva Unidad de Trabajo vinculada al módulo de la clase activa y a sus RAs en desarrollan.
  const crearUnidadTrabajo = useCallback(
    async ({ numero, nombre, descripcion, ras = [] }) => {
      if (!idModulo) {
        setErrorOperacion('Debe seleccionar una clase para crear la unidad de trabajo.');
        return null;
      }
      setCargandoOperacion(true);
      setErrorOperacion(null);
      try {
        const nuevoRegistro = {
          numero: Number(numero),
          nombre: nombre.trim(),
          descripcion: descripcion && descripcion.trim() ? descripcion.trim() : null,
          id_modulo: idModulo
        };

        const resultado = await insertarUT(nuevoRegistro);
        if (!resultado) {
          throw new Error('No se pudo insertar la unidad de trabajo.');
        }

        const nuevoIdUt = Array.isArray(resultado) ? resultado[0]?.id_ut : resultado?.id_ut;

        // Inserción de relaciones en desarrollan con sus porcentajes
        if (nuevoIdUt && Array.isArray(ras) && ras.length > 0) {
          const filasDesarrollan = ras
            .filter((r) => r.id_ra)
            .map((r) => ({
              id_ut: nuevoIdUt,
              id_ra: r.id_ra,
              porcentaje: Math.min(100, Math.max(0, Number(r.porcentaje) || 100))
            }));

          if (filasDesarrollan.length > 0) {
            const { error: errInsert } = await supabase.from('desarrollan').insert(filasDesarrollan);
            if (errInsert) {
              console.error('Error al insertar RAs en desarrollan:', errInsert);
            }
          }
        }

        // Se refresca el listado para preservar el orden curricular ascendente.
        await Promise.all([cargarUnidadesTrabajo(), cargarRAsYDesarrollan()]);
        return resultado;
      } catch (err) {
        console.error('Error al crear la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al crear la unidad de trabajo.');
        return null;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [idModulo, insertarUT, cargarUnidadesTrabajo, cargarRAsYDesarrollan]
  );

  // Modificación de los datos de una Unidad de Trabajo y de sus vínculos en desarrollan.
  const actualizarUnidadTrabajo = useCallback(
    async (idUt, { numero, nombre, descripcion, ras = [] }) => {
      if (!idUt) return false;
      setCargandoOperacion(true);
      setErrorOperacion(null);
      try {
        const valores = {
          numero: Number(numero),
          nombre: nombre.trim(),
          descripcion: descripcion && descripcion.trim() ? descripcion.trim() : null
        };

        const resultado = await actualizarUT('id_ut', idUt, valores);
        if (!resultado) {
          throw new Error('No se pudo actualizar la unidad de trabajo.');
        }

        // Sincronización de relaciones en desarrollan: primero eliminar las existentes de esta UT
        await supabase.from('desarrollan').delete().eq('id_ut', idUt);

        // Inserción de las nuevas asociaciones de RAs con sus porcentajes
        if (Array.isArray(ras) && ras.length > 0) {
          const filasDesarrollan = ras
            .filter((r) => r.id_ra)
            .map((r) => ({
              id_ut: idUt,
              id_ra: r.id_ra,
              porcentaje: Math.min(100, Math.max(0, Number(r.porcentaje) || 100))
            }));

          if (filasDesarrollan.length > 0) {
            const { error: errInsert } = await supabase.from('desarrollan').insert(filasDesarrollan);
            if (errInsert) {
              console.error('Error al actualizar RAs en desarrollan:', errInsert);
            }
          }
        }

        await Promise.all([cargarUnidadesTrabajo(), cargarRAsYDesarrollan()]);
        return true;
      } catch (err) {
        console.error('Error al actualizar la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al actualizar la unidad de trabajo.');
        return false;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [actualizarUT, cargarUnidadesTrabajo, cargarRAsYDesarrollan]
  );

  // Eliminación de una Unidad de Trabajo garantizando la desvinculación de actividades y relaciones desarrollan.
  const eliminarUnidadTrabajo = useCallback(
    async (idUt) => {
      if (!idUt) return false;
      setCargandoOperacion(true);
      setErrorOperacion(null);
      try {
        // Se eliminan los vínculos en desarrollan
        await supabase.from('desarrollan').delete().eq('id_ut', idUt);

        // Se desvinculan las versiones asociadas fijando id_ut en null para dejarlas huérfanas.
        const { error: errorDesvincular } = await supabase
          .from('Versiones')
          .update({ id_ut: null })
          .eq('id_ut', idUt);

        if (errorDesvincular) {
          console.warn('Advertencia al desvincular versiones de la unidad de trabajo:', errorDesvincular);
        }

        // Se elimina la unidad de trabajo de la base de datos.
        const exito = await eliminarUT('id_ut', idUt);
        if (!exito) {
          throw new Error('No se pudo eliminar la unidad de trabajo.');
        }

        // Se actualiza reactivamente el estado local de versiones marcándolas como huérfanas.
        setVersiones((prev) =>
          prev.map((v) => (v.id_ut === idUt ? { ...v, id_ut: null } : v))
        );

        await Promise.all([cargarUnidadesTrabajo(), cargarRAsYDesarrollan()]);
        return true;
      } catch (err) {
        console.error('Error al eliminar la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al eliminar la unidad de trabajo.');
        return false;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [eliminarUT, setVersiones, cargarUnidadesTrabajo, cargarRAsYDesarrollan]
  );

  // Asignación de una versión de práctica a una Unidad de Trabajo o desvinculación (id_ut = null).
  const asignarActividadUT = useCallback(
    async (idVersion, idUtDestino) => {
      if (!idVersion) return false;
      setCargandoOperacion(true);
      setErrorOperacion(null);
      try {
        const idNormalizado = idUtDestino || null;

        // Se ejecuta la actualización directa sobre el registro en Supabase.
        const { error } = await supabase
          .from('Versiones')
          .update({ id_ut: idNormalizado })
          .eq('id_version', idVersion);

        if (error) {
          throw error;
        }

        // Se refleja el cambio en el estado local de versiones para actualizar la interfaz.
        setVersiones((prev) =>
          prev.map((v) =>
            v.id_version === idVersion ? { ...v, id_ut: idNormalizado } : v
          )
        );

        return true;
      } catch (err) {
        console.error('Error al actualizar la unidad de trabajo de la versión:', err);
        setErrorOperacion(err.message || 'Error al actualizar la asignación de la actividad.');
        return false;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [setVersiones]
  );

  // Desvinculación ágil de una actividad para devolverla al estado huérfano.
  const desvincularActividad = useCallback(
    async (idVersion) => {
      return await asignarActividadUT(idVersion, null);
    },
    [asignarActividadUT]
  );

  // Mapa auxiliar para relacionar datos informativos de los RAs
  const mapaRAsPorId = useMemo(() => {
    const mapa = new Map();
    (listaRAs || []).forEach((ra) => mapa.set(ra.id_ra, ra));
    return mapa;
  }, [listaRAs]);

  // Agrupación reactiva de versiones y RAs asociados por cada Unidad de Trabajo.
  const unidadesConVersiones = useMemo(() => {
    return (unidadesTrabajo || []).map((ut) => {
      const rasDeEstaUt = (relacionesDesarrollan || [])
        .filter((d) => d.id_ut === ut.id_ut)
        .map((d) => {
          const info = mapaRAsPorId.get(d.id_ra);
          return {
            id_desarrollan: d.id_desarrollan,
            id_ra: d.id_ra,
            id_ut: d.id_ut,
            porcentaje: d.porcentaje !== null && d.porcentaje !== undefined ? Number(d.porcentaje) : 100,
            ra_numero: info?.numero,
            ra_nombre: info?.nombre
          };
        })
        .sort((a, b) => (a.ra_numero || 0) - (b.ra_numero || 0));

      return {
        ...ut,
        versiones: (versiones || []).filter((v) => v.id_ut === ut.id_ut),
        ras: rasDeEstaUt
      };
    });
  }, [unidadesTrabajo, versiones, relacionesDesarrollan, mapaRAsPorId]);

  // Identificación reactiva de las versiones no asignadas a ninguna Unidad de Trabajo.
  const actividadesHuerfanas = useMemo(() => {
    return (versiones || []).filter((v) => !v.id_ut);
  }, [versiones]);

  // Cálculo del siguiente número correlativo disponible para una nueva Unidad de Trabajo.
  const siguienteNumeroUT = useMemo(() => {
    if (!unidadesTrabajo || unidadesTrabajo.length === 0) return 1;
    const maximo = Math.max(...unidadesTrabajo.map((u) => Number(u.numero) || 0));
    return maximo + 1;
  }, [unidadesTrabajo]);

  return {
    unidades: unidadesConVersiones,
    unidadesBase: unidadesTrabajo || [],
    versiones: versiones || [],
    listaRAs,
    relacionesDesarrollan,
    actividadesHuerfanas,
    totalVersiones: (versiones || []).length,
    cargando: cargandoUTs || cargandoVersiones || cargandoOperacion,
    guardando: cargandoOperacion,
    error: errorUTs || errorVersiones || errorOperacion,
    siguienteNumeroUT,
    recargar,
    crearUnidadTrabajo,
    actualizarUnidadTrabajo,
    eliminarUnidadTrabajo,
    asignarActividadUT,
    desvincularActividad
  };
};

export default useGestorCurriculo;
