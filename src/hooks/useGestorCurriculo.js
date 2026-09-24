import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';

/**
 * Custom Hook orquestador para la gestión del currículo de un módulo y curso académico.
 *
 * Responsabilidad Única: Centralizar la obtención y mutación de las Unidades de Trabajo
 * y de las Versiones de actividades asociadas, coordinando las asignaciones y desvinculaciones
 * necesarias para el espacio interactivo de arrastrar y soltar (Drag & Drop).
 *
 * @param {string|null} idCurso - Identificador único del curso académico.
 * @param {string|null} idModulo - Identificador único del módulo profesional.
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
    actualizar: actualizarVersionEnHook,
    setDatos: setVersiones
  } = useDatos('Versiones');

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

  // Consulta de las Versiones instanciadas para el curso y módulo indicados.
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
    }
    if (idCurso && idModulo) {
      tareas.push(cargarVersiones());
    }
    await Promise.all(tareas);
  }, [idModulo, idCurso, cargarUnidadesTrabajo, cargarVersiones]);

  // Efecto para sincronizar las unidades de trabajo cuando cambia el módulo.
  useEffect(() => {
    cargarUnidadesTrabajo();
  }, [cargarUnidadesTrabajo]);

  // Efecto para sincronizar las actividades cuando cambian el curso o el módulo.
  useEffect(() => {
    cargarVersiones();
  }, [cargarVersiones]);

  // Creación de una nueva Unidad de Trabajo vinculada al módulo activo.
  const crearUnidadTrabajo = useCallback(
    async ({ numero, nombre, descripcion }) => {
      if (!idModulo) {
        setErrorOperacion('Debe seleccionar un módulo para crear la unidad de trabajo.');
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

        // Se refresca el listado para preservar el orden curricular ascendente.
        await cargarUnidadesTrabajo();
        return resultado;
      } catch (err) {
        console.error('Error al crear la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al crear la unidad de trabajo.');
        return null;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [idModulo, insertarUT, cargarUnidadesTrabajo]
  );

  // Modificación de los datos descriptivos o numéricos de una Unidad de Trabajo existente.
  const actualizarUnidadTrabajo = useCallback(
    async (idUt, { numero, nombre, descripcion }) => {
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

        await cargarUnidadesTrabajo();
        return true;
      } catch (err) {
        console.error('Error al actualizar la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al actualizar la unidad de trabajo.');
        return false;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [actualizarUT, cargarUnidadesTrabajo]
  );

  // Eliminación de una Unidad de Trabajo garantizando la desvinculación previa de sus actividades.
  const eliminarUnidadTrabajo = useCallback(
    async (idUt) => {
      if (!idUt) return false;
      setCargandoOperacion(true);
      setErrorOperacion(null);
      try {
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

        await cargarUnidadesTrabajo();
        return true;
      } catch (err) {
        console.error('Error al eliminar la unidad de trabajo:', err);
        setErrorOperacion(err.message || 'Error al eliminar la unidad de trabajo.');
        return false;
      } finally {
        setCargandoOperacion(false);
      }
    },
    [eliminarUT, setVersiones, cargarUnidadesTrabajo]
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

  // Desvinculación ágil de una actividad para devolverla al panel de huérfanas.
  const desvincularActividad = useCallback(
    async (idVersion) => {
      return await asignarActividadUT(idVersion, null);
    },
    [asignarActividadUT]
  );

  // Agrupación reactiva de versiones por cada Unidad de Trabajo.
  const unidadesConVersiones = useMemo(() => {
    return (unidadesTrabajo || []).map((ut) => ({
      ...ut,
      versiones: (versiones || []).filter((v) => v.id_ut === ut.id_ut)
    }));
  }, [unidadesTrabajo, versiones]);

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
