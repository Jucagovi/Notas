import { useState, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useInformePendientes - Custom Hook para el Informe de Control de Calificaciones Pendientes (Caso de Uso 12.3).
 *
 * Responsabilidad Única: Orquestar las consultas relacionales mediante useDatos, cruzar la matrícula
 * de discentes (imparte) con las actividades curriculares (Versiones) de una clase en cualquier evaluación,
 * detectar qué registros carecen de calificación en evaluan y estructurar los datos agrupados tanto
 * por prácticas como por discentes.
 */
export const useInformePendientes = () => {
  // Instancias del hook genérico useDatos para cada tabla requerida
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');

  // Estados locales para el listado plano y los agrupamientos
  const [pendientes, setPendientes] = useState([]);
  const [practicasAgrupadas, setPracticasAgrupadas] = useState([]);
  const [discentesAgrupados, setDiscentesAgrupados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta el cruce relacional entre discentes matriculados (imparte) y actividades (Versiones)
   * de una clase en cualquier período de evaluación, detectando notas vacías o no registradas.
   *
   * @param {string} idCurso - Identificador del curso académico de la clase.
   * @param {string} idModulo - Identificador del módulo profesional.
   * @param {string|null} [idEvaluacionFiltro=null] - Identificador opcional para restringir a una evaluación.
   * @returns {Promise<Object>} Objeto con pendientes planos, agrupados por práctica y por discente.
   */
  const obtenerPendientesPorClase = useCallback(
    async (idCurso, idModulo, idEvaluacionFiltro = null) => {
      if (!idCurso || !idModulo) {
        setPendientes([]);
        setPracticasAgrupadas([]);
        setDiscentesAgrupados([]);
        return { pendientes: [], practicasAgrupadas: [], discentesAgrupados: [] };
      }

      setCargando(true);
      setError(null);

      try {
        // 1. Se obtienen los discentes matriculados en la clase mediante la tabla imparte
        const matriculas = await obtenerImparte(
          'id_imparte, id_discente, id_curso, id_modulo',
          (consulta) =>
            consulta
              .eq('id_curso', idCurso)
              .eq('id_modulo', idModulo)
        );

        const idsDiscentes = [
          ...new Set((matriculas || []).map((m) => m.id_discente).filter(Boolean))
        ];

        // Si no existen alumnos matriculados en la clase, no hay pendientes
        if (idsDiscentes.length === 0) {
          setPendientes([]);
          setPracticasAgrupadas([]);
          setDiscentesAgrupados([]);
          return { pendientes: [], practicasAgrupadas: [], discentesAgrupados: [] };
        }

        // 2. Se consultan concurrentemente los alumnos activos y todas las versiones de la clase
        const promesaAlumnos = obtenerDiscentes(
          'id_discente, nombre, apellidos, NIA, correo, imagen, activo',
          (q) => q.in('id_discente', idsDiscentes)
        );

        const filtroVersiones = (consulta) => {
          let q = consulta.eq('id_curso', idCurso);
          if (idEvaluacionFiltro && idEvaluacionFiltro !== 'todas') {
            q = q.eq('id_evaluacion', idEvaluacionFiltro);
          }
          return q.order('numero', { ascending: true });
        };

        const promesaVersiones = obtenerVersiones(
          'id_version, enunciado, numero, id_practica, id_curso, id_evaluacion, peso_evaluacion, Practicas(id_practica, nombre, descripcion, id_modulo), Evaluaciones(id_evaluacion, nombre)',
          filtroVersiones
        );

        const [alumnosData, versionesData] = await Promise.all([
          promesaAlumnos,
          promesaVersiones
        ]);

        const listaAlumnos = (alumnosData || []).filter((a) => a.activo !== false);

        // Se filtran las versiones para garantizar que pertenecen al módulo indicado
        const listaVersiones = (versionesData || []).filter((v) => {
          if (v.Practicas?.id_modulo) {
            return v.Practicas.id_modulo === idModulo;
          }
          return true;
        });

        // Si no hay actividades configuradas o no hay alumnos, no hay notas pendientes
        if (listaVersiones.length === 0 || listaAlumnos.length === 0) {
          setPendientes([]);
          setPracticasAgrupadas([]);
          setDiscentesAgrupados([]);
          return { pendientes: [], practicasAgrupadas: [], discentesAgrupados: [] };
        }

        const idsVersiones = listaVersiones.map((v) => v.id_version);

        // 3. Se consultan las calificaciones registradas en la tabla evaluan
        const calificaciones = await obtenerEvaluan(
          'id_evaluan, nota, id_version, id_evaluacion, id_discente',
          (q) => q.in('id_version', idsVersiones).in('id_discente', idsDiscentes)
        );

        // Mapa indexado en memoria para resolución inmediata de nota: id_discente_id_version
        const mapaCalificaciones = new Map();
        (calificaciones || []).forEach((c) => {
          mapaCalificaciones.set(`${c.id_discente}_${c.id_version}`, c.nota);
        });

        // 4. Se ejecuta el cruce relacional identificando notas vacías o no registradas
        const listaPendientes = [];
        const mapaPorPractica = new Map();
        const mapaPorDiscente = new Map();

        listaVersiones.forEach((version) => {
          const nombrePractica = version.Practicas?.nombre || 'Práctica';
          const numeroVersion = version.numero ? `(${version.numero})` : '';
          const enunciadoVersion = version.enunciado ? `: ${version.enunciado}` : '';
          const actividadTexto = `${nombrePractica} ${numeroVersion}${enunciadoVersion}`.trim();
          const evaluacionNombre = version.Evaluaciones?.nombre || 'Sin evaluación asignada';

          listaAlumnos.forEach((alumno) => {
            const claveBusqueda = `${alumno.id_discente}_${version.id_version}`;
            const tieneNota = mapaCalificaciones.has(claveBusqueda);
            const valorNota = mapaCalificaciones.get(claveBusqueda);

            // Se detecta como pendiente si el registro no existe o su nota es nula
            if (!tieneNota || valorNota === null || valorNota === undefined) {
              const apellidos = alumno.apellidos || '';
              const nombre = alumno.nombre || '';
              const discenteNombreCompleto = apellidos
                ? `${apellidos}, ${nombre}`.trim()
                : (nombre || 'Sin nombre');

              const registroPendiente = {
                id_pendiente: `${alumno.id_discente}_${version.id_version}`,
                id_discente: alumno.id_discente,
                discenteNombre: nombre,
                discenteApellidos: apellidos,
                discenteNombreCompleto,
                discenteNia: alumno.NIA || alumno.nia || '',
                discenteCorreo: alumno.correo || '',
                discenteImagen: alumno.imagen || null,
                id_version: version.id_version,
                versionNumero: version.numero || '',
                versionEnunciado: version.enunciado || '',
                practicaNombre: nombrePractica,
                actividadTexto,
                id_evaluacion: version.id_evaluacion || null,
                evaluacionNombre,
                id_curso: idCurso,
                id_modulo: idModulo
              };

              listaPendientes.push(registroPendiente);

              // Agrupación por práctica
              if (!mapaPorPractica.has(version.id_version)) {
                mapaPorPractica.set(version.id_version, {
                  id_version: version.id_version,
                  practicaNombre: nombrePractica,
                  versionNumero: version.numero || '',
                  versionEnunciado: version.enunciado || '',
                  actividadTexto,
                  id_evaluacion: version.id_evaluacion || null,
                  evaluacionNombre,
                  id_curso: idCurso,
                  id_modulo: idModulo,
                  discentes: []
                });
              }
              mapaPorPractica.get(version.id_version).discentes.push({
                id_discente: alumno.id_discente,
                discenteNombreCompleto,
                discenteNia: alumno.NIA || alumno.nia || '',
                discenteCorreo: alumno.correo || '',
                discenteImagen: alumno.imagen || null
              });

              // Agrupación por discente
              if (!mapaPorDiscente.has(alumno.id_discente)) {
                mapaPorDiscente.set(alumno.id_discente, {
                  id_discente: alumno.id_discente,
                  discenteNombre: nombre,
                  discenteApellidos: apellidos,
                  discenteNombreCompleto,
                  discenteNia: alumno.NIA || alumno.nia || '',
                  discenteCorreo: alumno.correo || '',
                  discenteImagen: alumno.imagen || null,
                  practicas: []
                });
              }
              mapaPorDiscente.get(alumno.id_discente).practicas.push({
                id_version: version.id_version,
                practicaNombre: nombrePractica,
                versionNumero: version.numero || '',
                versionEnunciado: version.enunciado || '',
                actividadTexto,
                id_evaluacion: version.id_evaluacion || null,
                evaluacionNombre,
                id_curso: idCurso,
                id_modulo: idModulo
              });
            }
          });
        });

        // Se preparan las listas ordenadas para los acordeones
        const listaPracticas = Array.from(mapaPorPractica.values()).map((p) => {
          p.discentes.sort((a, b) =>
            a.discenteNombreCompleto.localeCompare(b.discenteNombreCompleto, 'es')
          );
          return {
            ...p,
            totalDiscentesPendientes: p.discentes.length
          };
        });
        listaPracticas.sort((a, b) =>
          a.practicaNombre.localeCompare(b.practicaNombre, 'es') ||
          a.versionNumero.localeCompare(b.versionNumero, 'es')
        );

        const listaDiscentes = Array.from(mapaPorDiscente.values()).map((d) => {
          d.practicas.sort((a, b) =>
            a.actividadTexto.localeCompare(b.actividadTexto, 'es')
          );
          return {
            ...d,
            totalPracticasPendientes: d.practicas.length
          };
        });
        listaDiscentes.sort((a, b) =>
          a.discenteNombreCompleto.localeCompare(b.discenteNombreCompleto, 'es')
        );

        setPendientes(listaPendientes);
        setPracticasAgrupadas(listaPracticas);
        setDiscentesAgrupados(listaDiscentes);

        return {
          pendientes: listaPendientes,
          practicasAgrupadas: listaPracticas,
          discentesAgrupados: listaDiscentes
        };
      } catch (err) {
        console.error('Error al obtener calificaciones pendientes de la clase:', err);
        setError('No se han podido consultar las calificaciones pendientes.');
        setPendientes([]);
        setPracticasAgrupadas([]);
        setDiscentesAgrupados([]);
        return { pendientes: [], practicasAgrupadas: [], discentesAgrupados: [] };
      } finally {
        setCargando(false);
      }
    },
    [obtenerImparte, obtenerDiscentes, obtenerVersiones, obtenerEvaluan]
  );

  /**
   * Compatibilidad hacia atrás para consultas por evaluación.
   */
  const obtenerPendientesPorEvaluacion = useCallback(
    async (idEvaluacion, idModulo, idCurso = null) => {
      return await obtenerPendientesPorClase(idCurso, idModulo, idEvaluacion);
    },
    [obtenerPendientesPorClase]
  );

  /**
   * Limpia los estados de pendientes y agrupaciones.
   */
  const limpiarPendientes = useCallback(() => {
    setPendientes([]);
    setPracticasAgrupadas([]);
    setDiscentesAgrupados([]);
    setError(null);
  }, []);

  return {
    pendientes,
    practicasAgrupadas,
    discentesAgrupados,
    cargando,
    error,
    obtenerPendientesPorClase,
    obtenerPendientesPorEvaluacion,
    limpiarPendientes
  };
};

export default useInformePendientes;
