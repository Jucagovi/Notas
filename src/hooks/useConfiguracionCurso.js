import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';
import useDatos from './useDatos.js';

// Formatea un año académico al formato estándar YYYY/YYYY+1 si se introduce un año de 4 dígitos.
export const formatearAnyoAcademico = (anyo) => {
  if (!anyo) return '';
  const str = String(anyo).trim();

  // Coincidencia para rango con 4 dígitos en ambos lados: ej: 2026/2027 o 2026-2027
  const matchCompleto = str.match(/^(\d{4})[\/\-](\d{4})$/);
  if (matchCompleto) {
    return `${matchCompleto[1]}/${matchCompleto[2]}`;
  }

  // Coincidencia para rango con sufijo de 2 dígitos: ej: 2026/27 o 2026-27
  const matchCorto = str.match(/^(\d{4})[\/\-](\d{2})$/);
  if (matchCorto) {
    const siglo = matchCorto[1].substring(0, 2);
    return `${matchCorto[1]}/${siglo}${matchCorto[2]}`;
  }

  // Coincidencia para año simple de 4 dígitos: ej: 2026 -> 2026/2027
  const matchSimple = str.match(/^(\d{4})$/);
  if (matchSimple) {
    const inicio = parseInt(matchSimple[1], 10);
    return `${inicio}/${inicio + 1}`;
  }

  return str;
};

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
  // Soporta la flexibilización de dos módulos mediante inserciones cruzadas bidireccionales.
  const generarCursoCompleto = useCallback(
    async ({
      cursoId = null,
      cursoNuevo = null,
      moduloId,
      discentesSeleccionados = [],
      clonarProgramacion = false,
      cursoOrigenId = null,
      esFlexibilizado = false,
      moduloFlexibleId = null,
      moduloFlexible = null
    }) => {
      setCargando(true);
      setError(null);

      // Variables de control para rollback en caso de fallo en operaciones compuestas.
      let idCursoPrincipal = cursoId;
      let idCursoSecundario = null;

      try {
        if (!moduloId) {
          throw new Error('Debe seleccionarse un módulo para configurar la clase.');
        }

        if (esFlexibilizado && !moduloFlexibleId) {
          throw new Error('Debe seleccionarse el módulo secundario para completar la flexibilización.');
        }

        if (esFlexibilizado && moduloId === moduloFlexibleId) {
          throw new Error('No es posible flexibilizar un módulo consigo mismo.');
        }

        const nombresEvaluaciones = ['Primera', 'Segunda', 'Tercera', 'Final', 'Extraordinaria'];

        // =========================================================================
        // ESCENARIO A: Creación de clase con flexibilización de dos módulos
        // =========================================================================
        if (esFlexibilizado && moduloFlexibleId) {
          if (!cursoNuevo) {
            throw new Error('Se requieren los datos del curso para crear la flexibilización.');
          }

          // 1. Inserción del curso del módulo principal con referencia al módulo flexible.
          const payloadPrincipal = {
            ...cursoNuevo,
            id_modulo_flexible: moduloFlexibleId
          };
          const resultadoPrincipal = await cursosHook.insertar(payloadPrincipal);
          if (!resultadoPrincipal || resultadoPrincipal.length === 0) {
            throw new Error('No se ha podido crear el curso académico principal en la base de datos.');
          }
          idCursoPrincipal = resultadoPrincipal[0].id_curso;

          // Obtención de siglas del módulo secundario flexibilizado para nombrar el curso secundario automático.
          let siglasModuloSecundario = '';
          if (moduloFlexible && (moduloFlexible.siglas || moduloFlexible.nombre)) {
            siglasModuloSecundario = moduloFlexible.siglas || moduloFlexible.nombre;
          } else {
            const { data: datosModulo } = await supabase
              .from('Modulos')
              .select('siglas, nombre')
              .eq('id_modulo', moduloFlexibleId)
              .maybeSingle();

            if (datosModulo) {
              siglasModuloSecundario = datosModulo.siglas || datosModulo.nombre || '';
            }
          }

          // Formateo del año académico (ej: si se introduce 2026, se convierte en 2026/2027).
          const anyoAcademico = formatearAnyoAcademico(cursoNuevo.anyo);
          const nombreCursoSecundario = siglasModuloSecundario
            ? `${siglasModuloSecundario} ${anyoAcademico}`.trim()
            : `${cursoNuevo.nombre} ${anyoAcademico}`.trim();

          // 2. Inserción del curso del módulo secundario con referencia al módulo principal y nombre automático distintivo.
          const payloadSecundario = {
            ...cursoNuevo,
            nombre: nombreCursoSecundario,
            id_modulo_flexible: moduloId
          };
          const resultadoSecundario = await cursosHook.insertar(payloadSecundario);
          if (!resultadoSecundario || resultadoSecundario.length === 0) {
            // Se realiza la limpieza del curso principal creado previamente.
            await cursosHook.eliminar('id_curso', idCursoPrincipal);
            throw new Error('No se ha podido crear el curso secundario para la flexibilización.');
          }
          idCursoSecundario = resultadoSecundario[0].id_curso;

          // 3. Generación secuencial de 5 evaluaciones independientes para el módulo principal.
          const evsPrincipal = nombresEvaluaciones.map((nombre) => ({
            nombre,
            id_curso: idCursoPrincipal,
            id_modulo: moduloId,
            descripcion: `Evaluación ${nombre}`
          }));
          const resEvsPrincipal = await evaluacionesHook.insertar(evsPrincipal);
          if (!resEvsPrincipal || resEvsPrincipal.length === 0) {
            await cursosHook.eliminar('id_curso', idCursoPrincipal);
            await cursosHook.eliminar('id_curso', idCursoSecundario);
            throw new Error('Error al registrar las evaluaciones del módulo principal.');
          }

          // 4. Generación secuencial de 5 evaluaciones independientes para el módulo secundario.
          const evsSecundario = nombresEvaluaciones.map((nombre) => ({
            nombre,
            id_curso: idCursoSecundario,
            id_modulo: moduloFlexibleId,
            descripcion: `Evaluación ${nombre}`
          }));
          const resEvsSecundario = await evaluacionesHook.insertar(evsSecundario);
          if (!resEvsSecundario || resEvsSecundario.length === 0) {
            await evaluacionesHook.eliminar('id_curso', idCursoPrincipal);
            await cursosHook.eliminar('id_curso', idCursoPrincipal);
            await cursosHook.eliminar('id_curso', idCursoSecundario);
            throw new Error('Error al registrar las evaluaciones del módulo secundario flexibilizado.');
          }

          // 5. Matriculación cruzada de discentes en ambos cursos en la tabla imparte.
          if (discentesSeleccionados && discentesSeleccionados.length > 0) {
            const idsDiscentes = discentesSeleccionados.map((disc) =>
              typeof disc === 'object' ? disc.id_discente : disc
            );

            const matriculasPrincipal = idsDiscentes.map((idDiscente) => ({
              id_curso: idCursoPrincipal,
              id_modulo: moduloId,
              id_discente: idDiscente
            }));

            const matriculasSecundario = idsDiscentes.map((idDiscente) => ({
              id_curso: idCursoSecundario,
              id_modulo: moduloFlexibleId,
              id_discente: idDiscente
            }));

            const resMatPrincipal = await imparteHook.insertar(matriculasPrincipal);
            const resMatSecundario = await imparteHook.insertar(matriculasSecundario);

            if (!resMatPrincipal || !resMatSecundario) {
              await imparteHook.eliminar('id_curso', idCursoPrincipal);
              await imparteHook.eliminar('id_curso', idCursoSecundario);
              await evaluacionesHook.eliminar('id_curso', idCursoPrincipal);
              await evaluacionesHook.eliminar('id_curso', idCursoSecundario);
              await cursosHook.eliminar('id_curso', idCursoPrincipal);
              await cursosHook.eliminar('id_curso', idCursoSecundario);
              throw new Error('Error al matricular discentes en los cursos flexibilizados.');
            }
          }
        } else {
          // =========================================================================
          // ESCENARIO B: Creación o configuración estándar de un único curso
          // =========================================================================
          if (!idCursoPrincipal && cursoNuevo) {
            const payload = {
              ...cursoNuevo,
              id_modulo_flexible: null
            };
            const resultadoCurso = await cursosHook.insertar(payload);
            if (!resultadoCurso || resultadoCurso.length === 0) {
              throw new Error('No se ha podido crear el curso académico en la base de datos.');
            }
            idCursoPrincipal = resultadoCurso[0].id_curso;
          }

          if (!idCursoPrincipal) {
            throw new Error('Identificador de curso no válido para completar la operación.');
          }

          // Creación de evaluaciones reglamentarias para el módulo principal.
          const evaluacionesExistentes = await evaluacionesHook.obtenerDatos(
            'id_evaluacion, nombre',
            (consulta) => consulta.eq('id_curso', idCursoPrincipal).eq('id_modulo', moduloId)
          );

          const nombresRegistrados = new Set((evaluacionesExistentes || []).map((ev) => ev.nombre));
          const evaluacionesAInsertar = nombresEvaluaciones
            .filter((nombre) => !nombresRegistrados.has(nombre))
            .map((nombre) => ({
              nombre,
              id_curso: idCursoPrincipal,
              id_modulo: moduloId,
              descripcion: `Evaluación ${nombre}`
            }));

          if (evaluacionesAInsertar.length > 0) {
            await evaluacionesHook.insertar(evaluacionesAInsertar);
          }

          // Matricular discentes en la tabla imparte vinculando curso, módulo y alumno.
          if (discentesSeleccionados && discentesSeleccionados.length > 0) {
            const matriculasPrevias = await imparteHook.obtenerDatos(
              'id_discente',
              (consulta) => consulta.eq('id_curso', idCursoPrincipal).eq('id_modulo', moduloId)
            );

            const matriculadosSet = new Set((matriculasPrevias || []).map((m) => m.id_discente));
            const matriculasAInsertar = discentesSeleccionados
              .map((disc) => (typeof disc === 'object' ? disc.id_discente : disc))
              .filter((idDisc) => !matriculadosSet.has(idDisc))
              .map((idDiscente) => ({
                id_curso: idCursoPrincipal,
                id_modulo: moduloId,
                id_discente: idDiscente
              }));

            if (matriculasAInsertar.length > 0) {
              await imparteHook.insertar(matriculasAInsertar);
            }
          }
        }

        // =========================================================================
        // Clonación de la programación histórica si se ha solicitado
        // =========================================================================
        if (clonarProgramacion && cursoOrigenId) {
          // Se clonan los pesos de RA asociados al curso.
          const rasOrigen = await raCursoHook.obtenerDatos('*', (consulta) =>
            consulta.eq('id_curso', cursoOrigenId)
          );
          if (rasOrigen && rasOrigen.length > 0) {
            const rasClonados = rasOrigen.map((ra) => ({
              id_ra: ra.id_ra,
              peso: ra.peso,
              id_curso: idCursoPrincipal
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
              id_curso: idCursoPrincipal
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
              id_curso: idCursoPrincipal,
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
                id_curso: idCursoPrincipal,
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

        return {
          exito: true,
          cursoId: idCursoPrincipal,
          cursoSecundarioId: idCursoSecundario,
          esFlexibilizado
        };
      } catch (err) {
        console.error('Error al generar la configuración completa del curso:', err);
        const errorEstructurado = {
          error: err.message || 'Error al generar la configuración del curso.',
          status: 400
        };
        setError(errorEstructurado.error);
        return { exito: false, ...errorEstructurado };
      } finally {
        setCargando(false);
      }
    },
    [
      cursosHook.insertar,
      evaluacionesHook.obtenerDatos,
      evaluacionesHook.insertar,
      imparteHook.insertar,
      raCursoHook.obtenerDatos,
      raCursoHook.insertar,
      ceCursoHook.obtenerDatos,
      ceCursoHook.insertar,
      temporizacionHook.obtenerDatos,
      temporizacionHook.insertar,
      versionesHook.obtenerDatos,
      versionesHook.insertar,
      trabajanHook.obtenerDatos,
      trabajanHook.insertar
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
      imparteHook.eliminar,
      raCursoHook.eliminar,
      ceCursoHook.eliminar,
      temporizacionHook.eliminar,
      evaluacionesHook.eliminar,
      evaluanHook.eliminar,
      versionesHook.eliminar,
      trabajanHook.eliminar,
      festivosHook.eliminar,
      horariosHook.eliminar,
      sesionesHook.eliminar,
      cursosHook.eliminar
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
    [imparteHook.obtenerDatos, imparteHook.insertar, imparteHook.eliminar]
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
