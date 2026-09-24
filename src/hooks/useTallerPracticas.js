import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import { supabase } from '../services/supabaseClient.js';

/**
 * useTallerPracticas - Custom Hook para la gestión del taller de prácticas y su historial de versiones.
 *
 * Responsabilidad Única: Encapsular la lógica de obtención y operaciones CRUD para el repositorio maestro
 * de prácticas (tabla Practicas) y el panel esclavo de versiones (tabla Versiones), consumiendo useDatos
 * y abstrayendo la persistencia en Supabase.
 *
 * @param {string|null} idModuloActivo - Identificador del módulo seleccionado para filtrar prácticas.
 */
export const useTallerPracticas = (idModuloActivo = null) => {
  // Se inicializa el hook genérico para la tabla maestra Practicas.
  const {
    datos: practicas,
    cargando: cargandoPracticas,
    obtenerDatos: obtenerPracticas,
    insertar: insertarPracticaHook,
    actualizar: actualizarPracticaHook,
    eliminar: eliminarPracticaHook,
    setDatos: setPracticas
  } = useDatos('Practicas');

  // Se inicializa el hook genérico para la tabla esclava Versiones.
  const {
    datos: versiones,
    cargando: cargandoVersiones,
    obtenerDatos: obtenerVersiones,
    insertar: insertarVersionHook,
    actualizar: actualizarVersionHook,
    eliminar: eliminarVersionHook,
    setDatos: setVersiones
  } = useDatos('Versiones');

  // Estados locales para la selección activa, unidades de trabajo del módulo y estado de guardado.
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [unidadesTrabajo, setUnidadesTrabajo] = useState([]);
  const [cargandoUTs, setCargandoUTs] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Consulta de las prácticas pertenecientes al módulo seleccionado o la totalidad del catálogo.
  const cargarPracticas = useCallback(async () => {
    setErrorOperacion(null);
    try {
      const selectConsulta = '*, Modulos(id_modulo, nombre, siglas)';
      const modificador = (consulta) => {
        let q = consulta.order('nombre', { ascending: true });
        if (idModuloActivo) {
          q = q.eq('id_modulo', idModuloActivo);
        }
        return q;
      };

      const resultado = await obtenerPracticas(selectConsulta, modificador);
      return resultado;
    } catch (err) {
      console.error('Error al cargar el catálogo de prácticas:', err);
      setErrorOperacion({ error: 'No se ha podido cargar el catálogo de prácticas.', status: 400 });
      return [];
    }
  }, [idModuloActivo, obtenerPracticas]);

  // Consulta de las Unidades de Trabajo del módulo para alimentarlas en el editor de versiones.
  const cargarUnidadesTrabajo = useCallback(async () => {
    if (!idModuloActivo) {
      setUnidadesTrabajo([]);
      return [];
    }
    setCargandoUTs(true);
    try {
      const { data, error } = await supabase
        .from('Unidades_Trabajo')
        .select('id_ut, numero, nombre, descripcion')
        .eq('id_modulo', idModuloActivo)
        .order('numero', { ascending: true });

      if (error) throw error;
      const registros = data || [];
      setUnidadesTrabajo(registros);
      return registros;
    } catch (err) {
      console.error('Error al cargar las unidades de trabajo del módulo:', err);
      setUnidadesTrabajo([]);
      return [];
    } finally {
      setCargandoUTs(false);
    }
  }, [idModuloActivo]);

  // Consulta de las Versiones vinculadas estrictamente a la práctica activa en el estado.
  const cargarVersionesDePractica = useCallback(async (idPractica) => {
    if (!idPractica) {
      setVersiones([]);
      return [];
    }
    setErrorOperacion(null);
    try {
      const selectConsulta = `
        *,
        Cursos(id_curso, nombre, anyo, centro),
        Unidades_Trabajo(id_ut, numero, nombre),
        Evaluaciones(id_evaluacion, nombre)
      `;
      const modificador = (consulta) =>
        consulta
          .eq('id_practica', idPractica)
          .order('numero', { ascending: true });

      const resultado = await obtenerVersiones(selectConsulta, modificador);
      return resultado;
    } catch (err) {
      console.error(`Error al cargar las versiones de la práctica ${idPractica}:`, err);
      setErrorOperacion({ error: 'No se han podido cargar las versiones de la práctica.', status: 400 });
      return [];
    }
  }, [obtenerVersiones, setVersiones]);

  // Efecto para sincronizar las prácticas y las unidades de trabajo al cambiar el módulo activo.
  useEffect(() => {
    cargarPracticas();
    cargarUnidadesTrabajo();
    // Se reinicia la práctica seleccionada para evitar inconsistencias de módulo.
    setPracticaSeleccionada(null);
    setVersiones([]);
  }, [cargarPracticas, cargarUnidadesTrabajo]);

  // Manejador para seleccionar una práctica y cargar dinámicamente su historial de versiones.
  const seleccionarPractica = useCallback(async (practica) => {
    setPracticaSeleccionada(practica);
    if (practica && practica.id_practica) {
      await cargarVersionesDePractica(practica.id_practica);
    } else {
      setVersiones([]);
    }
  }, [cargarVersionesDePractica, setVersiones]);

  // Creación de una nueva práctica base en el repositorio maestro.
  const crearPractica = useCallback(async ({ nombre, descripcion, id_tipopractica, id_modulo }) => {
    if (!nombre || !nombre.trim()) {
      return { error: 'El nombre de la práctica es obligatorio.', status: 400 };
    }
    if (!id_modulo) {
      return { error: 'Debe seleccionar un módulo para asociar la práctica.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);
    try {
      const nuevoRegistro = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        id_tipopractica: id_tipopractica || 'Individual',
        id_modulo: id_modulo
      };

      const respuesta = await insertarPracticaHook(nuevoRegistro);
      if (!respuesta || respuesta.length === 0) {
        throw new Error('No se pudo insertar el registro en la base de datos.');
      }

      const creada = respuesta[0];
      await cargarPracticas();
      // Se selecciona automáticamente la práctica recién creada.
      await seleccionarPractica(creada);

      return { data: creada, error: null };
    } catch (err) {
      console.error('Error al crear nueva práctica base:', err);
      const objError = { error: err.message || 'Error al guardar la práctica.', status: 400 };
      setErrorOperacion(objError);
      return { data: null, error: objError };
    } finally {
      setGuardando(false);
    }
  }, [insertarPracticaHook, cargarPracticas, seleccionarPractica]);

  // Actualización de los datos maestros de una práctica existente.
  const actualizarPractica = useCallback(async (idPractica, { nombre, descripcion, id_tipopractica, id_modulo }) => {
    if (!idPractica) {
      return { error: 'Identificador de práctica no especificado.', status: 400 };
    }
    if (!nombre || !nombre.trim()) {
      return { error: 'El nombre de la práctica es obligatorio.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);
    try {
      const valoresActualizados = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        id_tipopractica: id_tipopractica || 'Individual'
      };
      if (id_modulo) {
        valoresActualizados.id_modulo = id_modulo;
      }

      const respuesta = await actualizarPracticaHook('id_practica', idPractica, valoresActualizados);
      if (!respuesta) {
        throw new Error('No se pudo actualizar el registro en la base de datos.');
      }

      await cargarPracticas();
      // Se actualiza el objeto seleccionado en memoria.
      setPracticaSeleccionada((prev) =>
        prev && prev.id_practica === idPractica
          ? { ...prev, ...valoresActualizados }
          : prev
      );

      return { data: respuesta, error: null };
    } catch (err) {
      console.error(`Error al actualizar la práctica ${idPractica}:`, err);
      const objError = { error: err.message || 'Error al actualizar la práctica.', status: 400 };
      setErrorOperacion(objError);
      return { data: null, error: objError };
    } finally {
      setGuardando(false);
    }
  }, [actualizarPracticaHook, cargarPracticas]);

  // Eliminación de una práctica y sus versiones en cascada.
  const eliminarPractica = useCallback(async (idPractica) => {
    if (!idPractica) return false;
    setGuardando(true);
    setErrorOperacion(null);
    try {
      // Se eliminan primero las versiones asociadas para garantizar integridad referencial.
      const { error: errorVersionesHijas } = await supabase
        .from('Versiones')
        .delete()
        .eq('id_practica', idPractica);

      if (errorVersionesHijas) throw errorVersionesHijas;

      const exito = await eliminarPracticaHook('id_practica', idPractica);
      if (!exito) {
        throw new Error('No se pudo eliminar la práctica base.');
      }

      if (practicaSeleccionada && practicaSeleccionada.id_practica === idPractica) {
        setPracticaSeleccionada(null);
        setVersiones([]);
      }
      await cargarPracticas();

      return true;
    } catch (err) {
      console.error(`Error al eliminar la práctica ${idPractica}:`, err);
      setErrorOperacion({ error: err.message || 'Error al eliminar la práctica.', status: 400 });
      return false;
    } finally {
      setGuardando(false);
    }
  }, [eliminarPracticaHook, practicaSeleccionada, cargarPracticas, setVersiones]);

  // Creación de una nueva versión asociada a la práctica activa.
  const crearVersion = useCallback(async ({
    id_practica,
    id_curso,
    id_ut = null,
    id_evaluacion = null,
    numero,
    enunciado = '',
    peso_evaluacion = 0
  }) => {
    const idPracticaEfectivo = id_practica || (practicaSeleccionada ? practicaSeleccionada.id_practica : null);
    if (!idPracticaEfectivo) {
      return { error: 'Debe seleccionar una práctica para crear la versión.', status: 400 };
    }
    if (!id_curso) {
      return { error: 'Debe seleccionar un curso académico.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);
    try {
      const nuevoRegistro = {
        id_practica: idPracticaEfectivo,
        id_curso: id_curso,
        id_ut: id_ut && id_ut.trim ? (id_ut.trim() ? id_ut.trim() : null) : id_ut || null,
        id_evaluacion: id_evaluacion && id_evaluacion.trim ? (id_evaluacion.trim() ? id_evaluacion.trim() : null) : id_evaluacion || null,
        numero: numero && String(numero).trim() ? String(numero).trim() : 'v1.0',
        enunciado: enunciado || '',
        peso_evaluacion: peso_evaluacion !== undefined && peso_evaluacion !== null && peso_evaluacion !== ''
          ? parseInt(peso_evaluacion, 10)
          : 0
      };

      const respuesta = await insertarVersionHook(nuevoRegistro);
      if (!respuesta || respuesta.length === 0) {
        throw new Error('No se pudo insertar la nueva versión en la base de datos.');
      }

      await cargarVersionesDePractica(idPracticaEfectivo);
      return { data: respuesta[0], error: null };
    } catch (err) {
      console.error('Error al crear versión de práctica:', err);
      const objError = { error: err.message || 'Error al guardar la versión.', status: 400 };
      setErrorOperacion(objError);
      return { data: null, error: objError };
    } finally {
      setGuardando(false);
    }
  }, [practicaSeleccionada, insertarVersionHook, cargarVersionesDePractica]);

  // Actualización de los datos o enunciado de una versión existente.
  const actualizarVersion = useCallback(async (idVersion, {
    id_curso,
    id_ut = null,
    id_evaluacion = null,
    numero,
    enunciado = '',
    peso_evaluacion = 0
  }) => {
    if (!idVersion) {
      return { error: 'Identificador de versión no especificado.', status: 400 };
    }
    if (!id_curso) {
      return { error: 'Debe seleccionar un curso académico.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);
    try {
      const valoresActualizados = {
        id_curso: id_curso,
        id_ut: id_ut && id_ut.trim ? (id_ut.trim() ? id_ut.trim() : null) : id_ut || null,
        id_evaluacion: id_evaluacion && id_evaluacion.trim ? (id_evaluacion.trim() ? id_evaluacion.trim() : null) : id_evaluacion || null,
        numero: numero && String(numero).trim() ? String(numero).trim() : 'v1.0',
        enunciado: enunciado || '',
        peso_evaluacion: peso_evaluacion !== undefined && peso_evaluacion !== null && peso_evaluacion !== ''
          ? parseInt(peso_evaluacion, 10)
          : 0
      };

      const respuesta = await actualizarVersionHook('id_version', idVersion, valoresActualizados);
      if (!respuesta) {
        throw new Error('No se pudo actualizar la versión en la base de datos.');
      }

      if (practicaSeleccionada) {
        await cargarVersionesDePractica(practicaSeleccionada.id_practica);
      }

      return { data: respuesta, error: null };
    } catch (err) {
      console.error(`Error al actualizar la versión ${idVersion}:`, err);
      const objError = { error: err.message || 'Error al actualizar la versión.', status: 400 };
      setErrorOperacion(objError);
      return { data: null, error: objError };
    } finally {
      setGuardando(false);
    }
  }, [practicaSeleccionada, actualizarVersionHook, cargarVersionesDePractica]);

  // Clonación instantánea de una versión copiando enunciado y metadatos con sufijo identificativo.
  const clonarVersion = useCallback(async (versionOriginal) => {
    if (!versionOriginal || !versionOriginal.id_practica) {
      return { error: 'Se requieren los datos originales de la versión a clonar.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);
    try {
      // Se genera un nombre de versión derivado para diferenciar la copia.
      const numeroOriginal = versionOriginal.numero ? String(versionOriginal.numero).trim() : 'v1.0';
      const numeroCopia = `${numeroOriginal} (Copia)`;

      const registroClonado = {
        id_practica: versionOriginal.id_practica,
        id_curso: versionOriginal.id_curso,
        id_ut: versionOriginal.id_ut || null,
        id_evaluacion: versionOriginal.id_evaluacion || null,
        numero: numeroCopia,
        enunciado: versionOriginal.enunciado || '',
        peso_evaluacion: versionOriginal.peso_evaluacion || 0
      };

      const respuesta = await insertarVersionHook(registroClonado);
      if (!respuesta || respuesta.length === 0) {
        throw new Error('No se pudo registrar la versión clonada.');
      }

      await cargarVersionesDePractica(versionOriginal.id_practica);
      return { data: respuesta[0], error: null };
    } catch (err) {
      console.error('Error al clonar la versión de la práctica:', err);
      const objError = { error: err.message || 'Error al clonar la versión.', status: 400 };
      setErrorOperacion(objError);
      return { data: null, error: objError };
    } finally {
      setGuardando(false);
    }
  }, [insertarVersionHook, cargarVersionesDePractica]);

  // Eliminación de una versión concreta de la práctica.
  const eliminarVersion = useCallback(async (idVersion) => {
    if (!idVersion) return false;
    setGuardando(true);
    setErrorOperacion(null);
    try {
      const exito = await eliminarVersionHook('id_version', idVersion);
      if (!exito) {
        throw new Error('No se pudo eliminar la versión seleccionada.');
      }

      if (practicaSeleccionada) {
        await cargarVersionesDePractica(practicaSeleccionada.id_practica);
      }
      return true;
    } catch (err) {
      console.error(`Error al eliminar la versión ${idVersion}:`, err);
      setErrorOperacion({ error: err.message || 'Error al eliminar la versión.', status: 400 });
      return false;
    } finally {
      setGuardando(false);
    }
  }, [eliminarVersionHook, practicaSeleccionada, cargarVersionesDePractica]);

  return {
    practicas,
    cargandoPracticas,
    practicaSeleccionada,
    seleccionarPractica,
    versiones,
    cargandoVersiones,
    unidadesTrabajo,
    cargandoUTs,
    guardando,
    errorOperacion,
    recargarPracticas: cargarPracticas,
    recargarVersiones: () => practicaSeleccionada && cargarVersionesDePractica(practicaSeleccionada.id_practica),
    crearPractica,
    actualizarPractica,
    eliminarPractica,
    crearVersion,
    actualizarVersion,
    clonarVersion,
    eliminarVersion
  };
};

export default useTallerPracticas;
