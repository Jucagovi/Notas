import { useState, useCallback } from 'react';
import useDatos from './useDatos.js';

// Custom Hook para orquestar la configuración completa de cursos, clases y sus relaciones en la base de datos.
const useConfiguracionCurso = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Instancias aisladas del hook genérico useDatos para cada tabla afectada.
  const cursosHook = useDatos('Cursos');
  const imparteHook = useDatos('imparte');
  const evaluacionesHook = useDatos('Evaluaciones');
  const evaluanHook = useDatos('evaluan');
  const versionesHook = useDatos('Versiones');
  const temporizacionHook = useDatos('Temporizacion');
  const raCursoHook = useDatos('ra_curso');
  const ceCursoHook = useDatos('ce_curso');
  const trabajanHook = useDatos('trabajan');
  const festivosHook = useDatos('Calendario_Eventos');
  const horariosHook = useDatos('Horarios');
  const sesionesHook = useDatos('Sesiones');

  // Orquestación de la creación completa de un curso con módulo, evaluaciones, matrículas y clonado opcional.
  const generarCursoCompleto = useCallback(
    async ({
      cursoId = null,
      cursoNuevo = null,
      moduloId,
      discentesSeleccionados = [],
      clonarProgramacion = false,
      cursoOrigenId = null
    }) => {
      setCargando(true);
      setError(null);

      try {
        let idCursoFinal = cursoId;

        // 1. Si no existe identificador de curso previo, se inserta el nuevo curso en la base de datos.
        if (!idCursoFinal && cursoNuevo) {
          const resultadoCurso = await cursosHook.insertar(cursoNuevo);
          if (!resultadoCurso || resultadoCurso.length === 0) {
            throw new Error('No se ha podido crear el curso académico en la base de datos.');
          }
          idCursoFinal = resultadoCurso[0].id_curso;
        }

        if (!idCursoFinal) {
          throw new Error('Identificador de curso no válido para completar la operación.');
        }

        if (!moduloId) {
          throw new Error('Debe seleccionarse un módulo para configurar la clase.');
        }

        // 2. Creación silenciosa de las 5 evaluaciones reglamentarias para el módulo y curso.
        const nombresEvaluaciones = ['Primera', 'Segunda', 'Tercera', 'Final', 'Extraordinaria'];
        const evaluacionesExistentes = await evaluacionesHook.obtenerDatos(
          'id_evaluacion, nombre',
          (consulta) => consulta.eq('id_curso', idCursoFinal).eq('id_modulo', moduloId)
        );

        const nombresRegistrados = new Set((evaluacionesExistentes || []).map((ev) => ev.nombre));
        const evaluacionesAInsertar = nombresEvaluaciones
          .filter((nombre) => !nombresRegistrados.has(nombre))
          .map((nombre) => ({
            nombre,
            id_curso: idCursoFinal,
            id_modulo: moduloId,
            descripcion: `Evaluación ${nombre}`
          }));

        if (evaluacionesAInsertar.length > 0) {
          await evaluacionesHook.insertar(evaluacionesAInsertar);
        }

        // 3. Matricular discentes en la tabla imparte vinculando curso, módulo y alumno.
        if (discentesSeleccionados && discentesSeleccionados.length > 0) {
          const matriculasPrevias = await imparteHook.obtenerDatos(
            'id_discente',
            (consulta) => consulta.eq('id_curso', idCursoFinal).eq('id_modulo', moduloId)
          );

          const matriculadosSet = new Set((matriculasPrevias || []).map((m) => m.id_discente));
          const matriculasAInsertar = discentesSeleccionados
            .map((disc) => (typeof disc === 'object' ? disc.id_discente : disc))
            .filter((idDisc) => !matriculadosSet.has(idDisc))
            .map((idDiscente) => ({
              id_curso: idCursoFinal,
              id_modulo: moduloId,
              id_discente: idDiscente
            }));

          if (matriculasAInsertar.length > 0) {
            await imparteHook.insertar(matriculasAInsertar);
          }
        }

        // 4. Clonación de la programación histórica de un curso anterior si se ha solicitado.
        if (clonarProgramacion && cursoOrigenId) {
          // Se clonan los pesos de RA asociados al curso.
          const rasOrigen = await raCursoHook.obtenerDatos('*', (consulta) =>
            consulta.eq('id_curso', cursoOrigenId)
          );
          if (rasOrigen && rasOrigen.length > 0) {
            const rasClonados = rasOrigen.map((ra) => ({
              id_ra: ra.id_ra,
              peso: ra.peso,
              id_curso: idCursoFinal
            }));
            await raCursoHook.insertar(rasClonados);
          }

          // Se clonan los pesos de CE asociados al curso.
          const cesOrigen = await ceCursoHook.obtenerDatos('*', (consulta) =>
            consulta.eq('id_curso', cursoOrigenId)
          );
          if (cesOrigen && cesOrigen.length > 0) {
            const cesClonados = cesOrigen.map((ce) => ({
              id_ce: ce.id_ce,
              peso: ce.peso,
              id_curso: idCursoFinal
            }));
            await ceCursoHook.insertar(cesClonados);
          }

          // Se clona la temporización de unidades de trabajo.
          const temposOrigen = await temporizacionHook.obtenerDatos('*', (consulta) =>
            consulta.eq('id_curso', cursoOrigenId)
          );
          if (temposOrigen && temposOrigen.length > 0) {
            const temposClonadas = temposOrigen.map((tempo) => ({
              id_ut: tempo.id_ut,
              id_curso: idCursoFinal,
              orden: tempo.orden,
              nombre_alternativo: tempo.nombre_alternativo,
              estado: 'Pendiente',
              observaciones: tempo.observaciones,
              fecha_ini_prevista: tempo.fecha_ini_prevista,
              fecha_fin_prevista: tempo.fecha_fin_prevista
            }));
            await temporizacionHook.insertar(temposClonadas);
          }

          // Se clonan las versiones de prácticas y su cobertura de criterios.
          const versionesOrigen = await versionesHook.obtenerDatos('*', (consulta) =>
            consulta.eq('id_curso', cursoOrigenId)
          );
          if (versionesOrigen && versionesOrigen.length > 0) {
            for (const version of versionesOrigen) {
              const nuevaVersion = {
                enunciado: version.enunciado,
                numero: version.numero,
                id_practica: version.id_practica,
                id_curso: idCursoFinal,
                id_ut: version.id_ut,
                peso_evaluacion: version.peso_evaluacion || 0
              };
              const resNuevaVersion = await versionesHook.insertar(nuevaVersion);
              if (resNuevaVersion && resNuevaVersion.length > 0) {
                const idNuevaVersion = resNuevaVersion[0].id_version;
                const relacionesTrabajan = await trabajanHook.obtenerDatos('*', (consulta) =>
                  consulta.eq('id_version', version.id_version)
                );
                if (relacionesTrabajan && relacionesTrabajan.length > 0) {
                  const trabajanClonados = relacionesTrabajan.map((tr) => ({
                    porcentaje: tr.porcentaje,
                    id_ce: tr.id_ce,
                    id_version: idNuevaVersion
                  }));
                  await trabajanHook.insertar(trabajanClonados);
                }
              }
            }
          }
        }

        return { exito: true, cursoId: idCursoFinal };
      } catch (err) {
        console.error('Error al generar la configuración completa del curso:', err);
        setError(err.message || 'Error al generar el curso.');
        return { exito: false, error: err.message };
      } finally {
        setCargando(false);
      }
    },
    [
      cursosHook,
      evaluacionesHook,
      imparteHook,
      raCursoHook,
      ceCursoHook,
      temporizacionHook,
      versionesHook,
      trabajanHook
    ]
  );

  // Eliminación completa en cascada de un curso y de todos los registros dependientes.
  const eliminarCurso = useCallback(
    async (cursoId) => {
      setCargando(true);
      setError(null);

      try {
        if (!cursoId) {
          throw new Error('Identificador de curso obligatorio para proceder al borrado.');
        }

        // 1. Se eliminan las matrículas asociadas en la tabla imparte.
        await imparteHook.eliminar('id_curso', cursoId);

        // 2. Se eliminan las asignaciones de pesos de RA y CE.
        await raCursoHook.eliminar('id_curso', cursoId);
        await ceCursoHook.eliminar('id_curso', cursoId);

        // 3. Se elimina la temporización del curso.
        await temporizacionHook.eliminar('id_curso', cursoId);

        // 4. Se eliminan registros dependientes de versiones y evaluaciones.
        const evaluaciones = await evaluacionesHook.obtenerDatos('id_evaluacion', (consulta) =>
          consulta.eq('id_curso', cursoId)
        );
        if (evaluaciones && evaluaciones.length > 0) {
          for (const ev of evaluaciones) {
            await evaluanHook.eliminar('id_evaluacion', ev.id_evaluacion);
          }
        }

        const versiones = await versionesHook.obtenerDatos('id_version', (consulta) =>
          consulta.eq('id_curso', cursoId)
        );
        if (versiones && versiones.length > 0) {
          for (const v of versiones) {
            await evaluanHook.eliminar('id_version', v.id_version);
            await trabajanHook.eliminar('id_version', v.id_version);
          }
        }

        await versionesHook.eliminar('id_curso', cursoId);
        await evaluacionesHook.eliminar('id_curso', cursoId);

        // 5. Se eliminan registros en tablas de horarios, sesiones y festivos si existieran.
        await festivosHook.eliminar('id_curso', cursoId);
        await horariosHook.eliminar('id_curso', cursoId);
        await sesionesHook.eliminar('id_curso', cursoId);

        // 6. Se elimina el registro del curso principal.
        const cursoEliminado = await cursosHook.eliminar('id_curso', cursoId);
        if (!cursoEliminado) {
          throw new Error('No se pudo completar el borrado del registro principal del curso.');
        }

        return { exito: true };
      } catch (err) {
        console.error('Error al eliminar curso y tablas dependientes:', err);
        setError(err.message || 'Error al eliminar el curso.');
        return { exito: false, error: err.message };
      } finally {
        setCargando(false);
      }
    },
    [
      imparteHook,
      raCursoHook,
      ceCursoHook,
      temporizacionHook,
      evaluacionesHook,
      evaluanHook,
      versionesHook,
      trabajanHook,
      festivosHook,
      horariosHook,
      sesionesHook,
      cursosHook
    ]
  );

  // Actualización de los discentes matriculados en una clase concreta (binomio curso y módulo).
  const actualizarMatriculaClase = useCallback(
    async (cursoId, moduloId, nuevosDiscentesIds) => {
      setCargando(true);
      setError(null);

      try {
        if (!cursoId || !moduloId) {
          throw new Error('Se requiere curso y módulo para actualizar la matrícula.');
        }

        const matriculasActuales = await imparteHook.obtenerDatos(
          'id_imparte, id_discente',
          (consulta) => consulta.eq('id_curso', cursoId).eq('id_modulo', moduloId)
        );

        const mapaActual = new Map(
          (matriculasActuales || []).map((item) => [item.id_discente, item.id_imparte])
        );
        const conjuntoNuevos = new Set(nuevosDiscentesIds || []);

        // Discentes a matricular que no se encontraban previamente.
        const aInsertar = (nuevosDiscentesIds || [])
          .filter((id) => !mapaActual.has(id))
          .map((idDiscente) => ({
            id_curso: cursoId,
            id_modulo: moduloId,
            id_discente: idDiscente
          }));

        // Discentes a desmatricular que ya no están en la lista seleccionada.
        const aEliminarImparteIds = [];
        for (const [idDiscente, idImparte] of mapaActual.entries()) {
          if (!conjuntoNuevos.has(idDiscente)) {
            aEliminarImparteIds.push(idImparte);
          }
        }

        if (aInsertar.length > 0) {
          await imparteHook.insertar(aInsertar);
        }

        for (const idImparte of aEliminarImparteIds) {
          await imparteHook.eliminar('id_imparte', idImparte);
        }

        return { exito: true, insertados: aInsertar.length, eliminados: aEliminarImparteIds.length };
      } catch (err) {
        console.error('Error al actualizar las matrículas de la clase:', err);
        setError(err.message || 'Error al actualizar matrículas.');
        return { exito: false, error: err.message };
      } finally {
        setCargando(false);
      }
    },
    [imparteHook]
  );

  return {
    cargando,
    error,
    generarCursoCompleto,
    eliminarCurso,
    actualizarMatriculaClase
  };
};

export default useConfiguracionCurso;
