import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

// Hook personalizado para calcular y obtener los alumnos en situación de riesgo académico.
const useAlertasTempranas = (cursoSeleccionadoId = null) => {
  const { obtenerDatos: obtenerTemporizacion } = useDatos('Temporizacion');
  const { obtenerDatos: obtenerUT } = useDatos('Unidades_Trabajo');
  const { obtenerDatos: obtenerVersiones } = useDatos('Versiones');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');
  const { obtenerDatos: obtenerModulos } = useDatos('Modulos');

  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Se calculan las alertas cruzando unidades finalizadas con calificaciones y entregas de los discentes.
  const obtenerAlertasPorCurso = useCallback(
    async (idCurso = null) => {
      setCargando(true);
      setError(null);

      try {
        const fechaActual = new Date().toISOString().slice(0, 10);

        // Se obtienen las unidades de temporización finalizadas o cuya fecha límite ya ha vencido.
        const filtroTemporizacion = (q) => {
          let query = q;
          if (idCurso) {
            query = query.eq('id_curso', idCurso);
          }
          return query;
        };

        const listaTemporizacion = await obtenerTemporizacion(
          'id_temporizacion, id_ut, id_curso, fecha_fin_prevista, fecha_fin_real, estado',
          filtroTemporizacion
        );

        // Se filtran las unidades cuya fecha límite de entrega haya concluido o figuren como finalizadas.
        const unidadesVencidas = (listaTemporizacion || []).filter((temp) => {
          const fechaLimite = temp.fecha_fin_real || temp.fecha_fin_prevista;
          const haFinalizadoPorFecha = fechaLimite && fechaLimite <= fechaActual;
          const haFinalizadoPorEstado = temp.estado?.toLowerCase() === 'finalizada';
          return haFinalizadoPorFecha || haFinalizadoPorEstado;
        });

        // Si no existen unidades vencidas, no se generan alertas automáticas.
        if (unidadesVencidas.length === 0) {
          setAlertas([]);
          setCargando(false);
          return [];
        }

        const idsUTVencidas = unidadesVencidas.map((t) => t.id_ut);

        // Se obtienen las unidades de trabajo y los módulos asociados.
        const listaUT = await obtenerUT('id_ut, numero, nombre, id_modulo', (q) =>
          q.in('id_ut', idsUTVencidas)
        );
        const idsModulos = [...new Set((listaUT || []).map((u) => u.id_modulo))];

        const listaModulos = await obtenerModulos('id_modulo, nombre, siglas', (q) =>
          q.in('id_modulo', idsModulos)
        );

        // Se obtienen las versiones de actividades correspondientes a las unidades finalizadas.
        const listaVersiones = await obtenerVersiones(
          'id_version, enunciado, numero, id_ut, id_curso',
          (q) => {
            let query = q.in('id_ut', idsUTVencidas);
            if (idCurso) {
              query = query.eq('id_curso', idCurso);
            }
            return query;
          }
        );

        // Se obtienen los discentes matriculados en el curso o activos en el centro.
        const filtroImparte = idCurso ? (q) => q.eq('id_curso', idCurso) : null;
        const listaImparte = await obtenerImparte('id_curso, id_modulo, id_discente', filtroImparte);

        const idsDiscentesMatriculados = [
          ...new Set((listaImparte || []).map((i) => i.id_discente))
        ];

        let listaDiscentes = [];
        if (idsDiscentesMatriculados.length > 0) {
          listaDiscentes = await obtenerDiscentes(
            'id_discente, nombre, apellidos, NIA, activo, imagen',
            (q) => q.in('id_discente', idsDiscentesMatriculados).eq('activo', true)
          );
        } else if (!idCurso) {
          listaDiscentes = await obtenerDiscentes(
            'id_discente, nombre, apellidos, NIA, activo, imagen',
            (q) => q.eq('activo', true)
          );
        }

        // Se obtienen las notas de las versiones en cuestión.
        const idsVersiones = (listaVersiones || []).map((v) => v.id_version);
        let listaCalificaciones = [];
        if (idsVersiones.length > 0) {
          listaCalificaciones = await obtenerEvaluan(
            'id_evaluan, nota, id_version, id_discente',
            (q) => q.in('id_version', idsVersiones)
          );
        }

        const mapaModulos = new Map((listaModulos || []).map((m) => [m.id_modulo, m]));
        const mapaUT = new Map((listaUT || []).map((u) => [u.id_ut, u]));

        const alertasDetectadas = [];

        // Se analiza a cada discente respecto a las unidades de trabajo finalizadas.
        (listaDiscentes || []).forEach((discente) => {
          unidadesVencidas.forEach((temporizacion) => {
            const ut = mapaUT.get(temporizacion.id_ut);
            if (!ut) return;

            const modulo = mapaModulos.get(ut.id_modulo);
            const versionesUT = (listaVersiones || []).filter((v) => v.id_ut === ut.id_ut);

            if (versionesUT.length === 0) return;

            // Se revisan las calificaciones obtenidas en las actividades de esta unidad.
            const detalleActividades = [];
            let sumaNotas = 0;
            let actividadesSinEntregar = 0;
            let actividadesSuspensas = 0;

            versionesUT.forEach((version) => {
              const calificacion = (listaCalificaciones || []).find(
                (c) => c.id_discente === discente.id_discente && c.id_version === version.id_version
              );

              if (calificacion && calificacion.nota !== null && calificacion.nota !== undefined) {
                const notaNum = Number(calificacion.nota);
                sumaNotas += notaNum;
                if (notaNum < 50) {
                  actividadesSuspensas += 1;
                }
                detalleActividades.push({
                  id_version: version.id_version,
                  actividad: version.numero || version.enunciado || 'Actividad sin título',
                  nota: notaNum,
                  estado: notaNum < 50 ? 'Suspenso' : 'Aprobado'
                });
              } else {
                // Si la unidad ha concluido y no se ha entregado, se computa un cero automático.
                actividadesSinEntregar += 1;
                detalleActividades.push({
                  id_version: version.id_version,
                  actividad: version.numero || version.enunciado || 'Actividad sin título',
                  nota: 0,
                  estado: 'Falta de entrega'
                });
              }
            });

            const notaMediaUT = Number((sumaNotas / versionesUT.length).toFixed(2));

            // Si la nota media en la unidad finalizada es inferior a 50, se dispara la alerta temprana.
            if (notaMediaUT < 50) {
              let nivelRiesgo = 'Moderado';
              if (notaMediaUT < 35 || actividadesSinEntregar > 0) {
                nivelRiesgo = 'Crítico';
              }

              alertasDetectadas.push({
                id: `${discente.id_discente}-${ut.id_ut}`,
                id_discente: discente.id_discente,
                nombreCompleto: `${discente.apellidos}, ${discente.nombre}`,
                nombre: discente.nombre,
                apellidos: discente.apellidos,
                nia: discente.NIA || 'Sin NIA',
                imagen: discente.imagen,
                modulo: modulo ? (modulo.siglas || modulo.nombre) : 'Módulo general',
                unidadTrabajo: `UT ${ut.numero}: ${ut.nombre}`,
                media: notaMediaUT,
                nivelRiesgo,
                suspensos: actividadesSuspensas + actividadesSinEntregar,
                actividadesSinEntregar,
                detalles: detalleActividades
              });
            }
          });
        });

        setAlertas(alertasDetectadas);
        return alertasDetectadas;
      } catch (err) {
        console.error('Error al calcular alertas tempranas:', err);
        const errorEstructurado = {
          error: err.message || 'Error al obtener alertas tempranas',
          status: 400
        };
        setError(errorEstructurado);
        setAlertas([]);
        return [];
      } finally {
        setCargando(false);
      }
    },
    [
      obtenerTemporizacion,
      obtenerUT,
      obtenerVersiones,
      obtenerDiscentes,
      obtenerImparte,
      obtenerEvaluan,
      obtenerModulos
    ]
  );

  useEffect(() => {
    obtenerAlertasPorCurso(cursoSeleccionadoId);
  }, [cursoSeleccionadoId, obtenerAlertasPorCurso]);

  return {
    alertas,
    totalAlertas: alertas.length,
    cargando,
    error,
    obtenerAlertasPorCurso,
    recargar: () => obtenerAlertasPorCurso(cursoSeleccionadoId)
  };
};

export default useAlertasTempranas;
