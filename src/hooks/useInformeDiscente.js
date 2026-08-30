import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  obtenerListaDiscentes,
  getHistorialDiscente,
  guardarNotaDiscente,
  actualizarEstadoDiscente
} from '../services/discenteService.js';
import useToast from './useToast.js';

// Hook personalizado para la gestión reactiva del informe integral 360º del discente
const useInformeDiscente = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mostrarExito, mostrarError } = useToast();

  // Estados reactivos principales
  const [listaDiscentes, setListaDiscentes] = useState([]);
  const [discenteSeleccionadoId, setDiscenteSeleccionadoId] = useState(() => searchParams.get('id') || null);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [guardandoNotaId, setGuardandoNotaId] = useState(null);
  const [error, setError] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  // Se carga la lista general de discentes con soporte para filtrado
  const cargarLista = useCallback(async (termino = '') => {
    setCargandoLista(true);
    setError(null);
    try {
      const resp = await obtenerListaDiscentes(termino);
      if (resp.error) {
        console.error('Error al cargar lista de discentes:', resp.error);
        setError(resp.error);
      }
      setListaDiscentes(resp.data || []);
    } catch (err) {
      console.error('Error inesperado al cargar lista:', err);
      setError(err.message || 'Error al obtener listado de discentes.');
    } finally {
      setCargandoLista(false);
    }
  }, []);

  // Se carga el historial completo del discente seleccionado para el curso especificado
  const cargarHistorial = useCallback(async (discenteId, cursoId = null) => {
    if (!discenteId) {
      setHistorial(null);
      return;
    }

    setCargandoHistorial(true);
    setError(null);
    try {
      const resp = await getHistorialDiscente(discenteId, cursoId);
      if (resp.error) {
        console.error(`Error al cargar historial para el discente ${discenteId}:`, resp.error);
        setError(resp.error);
        mostrarError('Error al consultar historial', resp.error);
      } else {
        setHistorial(resp.data);
        if (resp.data?.curso?.id_curso) {
          setCursoSeleccionadoId(resp.data.curso.id_curso);
        }
      }
    } catch (err) {
      console.error('Error inesperado en cargarHistorial:', err);
      setError(err.message || 'Error al compilar la ficha del discente.');
      mostrarError('Error de comunicación', err.message);
    } finally {
      setCargandoHistorial(false);
    }
  }, [mostrarError]);

  // Se inicializa la lista de discentes al montar el hook o cambiar el filtro
  useEffect(() => {
    cargarLista(filtroTexto);
  }, [cargarLista, filtroTexto]);

  // Sincronización con el parámetro de URL (?id=...)
  useEffect(() => {
    const idUrl = searchParams.get('id');
    if (idUrl && idUrl !== discenteSeleccionadoId) {
      setDiscenteSeleccionadoId(idUrl);
    } else if (!idUrl && discenteSeleccionadoId) {
      setDiscenteSeleccionadoId(null);
      setHistorial(null);
    }
  }, [searchParams, discenteSeleccionadoId]);

  // Se carga el historial cuando cambia el discente seleccionado o el curso escolar
  useEffect(() => {
    if (discenteSeleccionadoId) {
      cargarHistorial(discenteSeleccionadoId, cursoSeleccionadoId);
    }
  }, [discenteSeleccionadoId, cursoSeleccionadoId, cargarHistorial]);

  // Se selecciona un discente navegando a su ficha de detalle
  const seleccionarDiscente = useCallback((discenteId) => {
    setDiscenteSeleccionadoId(discenteId);
    setSearchParams({ id: discenteId });
  }, [setSearchParams]);

  // Se restablece la vista al listado principal de discentes
  const limpiarSeleccion = useCallback(() => {
    setDiscenteSeleccionadoId(null);
    setHistorial(null);
    setSearchParams({});
  }, [setSearchParams]);

  // Se cambia el curso escolar de contexto y se recargan los módulos correspondientes
  const cambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId);
  }, []);

  // Se recalcula el estado del historial tras la edición en línea de una nota
  const recalcularEstadoHistorial = (historialPrevio, idFilaUnica, nuevaNota, idEvaluan) => {
    if (!historialPrevio || !historialPrevio.modulos) return historialPrevio;

    let totalPracticasGlobal = 0;
    let totalCalificadasGlobal = 0;
    let totalPendientesGlobal = 0;
    let sumaNotasGlobal = 0;
    let suspensosGlobal = 0;
    let aprobadosGlobal = 0;
    let notablesGlobal = 0;
    let sobresalientesGlobal = 0;
    const evolucionTemporal = [];

    const modulosActualizados = historialPrevio.modulos.map((modulo) => {
      let sumaModulo = 0;
      let calificadasModulo = 0;
      let suspensosModulo = 0;
      let aprobadosTramosModulo = 0;
      let notablesModulo = 0;
      let sobresalientesModulo = 0;
      let totalAprobadosModulo = 0;
      const evolucionTemporalModulo = [];

      const practicasActualizadas = (modulo.todasPracticas || []).map((p) => {
        let practicaModificada = p;
        if (p.id_fila_unica === idFilaUnica) {
          practicaModificada = {
            ...p,
            nota: nuevaNota,
            id_evaluan: idEvaluan || p.id_evaluan
          };
        }

        totalPracticasGlobal += 1;

        if (practicaModificada.nota !== null && practicaModificada.nota !== undefined) {
          const notaNum = Number(practicaModificada.nota);
          calificadasModulo += 1;
          sumaModulo += notaNum;
          totalCalificadasGlobal += 1;
          sumaNotasGlobal += notaNum;

          if (notaNum < 50) {
            suspensosModulo += 1;
            suspensosGlobal += 1;
          } else if (notaNum < 70) {
            aprobadosTramosModulo += 1;
            totalAprobadosModulo += 1;
            aprobadosGlobal += 1;
          } else if (notaNum < 90) {
            notablesModulo += 1;
            totalAprobadosModulo += 1;
            notablesGlobal += 1;
          } else {
            sobresalientesModulo += 1;
            totalAprobadosModulo += 1;
            sobresalientesGlobal += 1;
          }

          const puntoModulo = {
            id: practicaModificada.id_fila_unica,
            etiqueta: `${practicaModificada.numeroPractica || practicaModificada.nombrePractica}`,
            nota: notaNum,
            moduloSiglas: modulo.siglas || modulo.nombre,
            nombrePractica: practicaModificada.nombrePractica,
            evaluacion: practicaModificada.evaluacionNombre,
            fecha: practicaModificada.created_at || practicaModificada.evaluacionFechaIni || '2025-01-01'
          };

          evolucionTemporalModulo.push(puntoModulo);

          evolucionTemporal.push({
            ...puntoModulo,
            etiqueta: `${modulo.siglas || modulo.nombre} - ${practicaModificada.numeroPractica || practicaModificada.nombrePractica}`
          });
        } else {
          totalPendientesGlobal += 1;
        }

        return practicaModificada;
      });

      evolucionTemporalModulo.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));

      const mediaModulo = calificadasModulo > 0
        ? Number((sumaModulo / calificadasModulo).toFixed(1))
        : null;

      const tasaAprobadosModulo = calificadasModulo > 0
        ? Number(((totalAprobadosModulo / calificadasModulo) * 100).toFixed(1))
        : 0;

      const porcentajeProgresoModulo = practicasActualizadas.length > 0
        ? Math.round((calificadasModulo / practicasActualizadas.length) * 100)
        : 0;

      return {
        ...modulo,
        todasPracticas: practicasActualizadas,
        estadisticas: {
          totalPracticas: practicasActualizadas.length,
          calificadas: calificadasModulo,
          pendientes: practicasActualizadas.length - calificadasModulo,
          porcentajeProgreso: porcentajeProgresoModulo,
          media: mediaModulo,
          suspensos: suspensosModulo,
          aprobados: totalAprobadosModulo,
          tasaAprobados: tasaAprobadosModulo,
          distribucion: {
            suspensos: suspensosModulo,
            aprobados: aprobadosTramosModulo,
            notables: notablesModulo,
            sobresalientes: sobresalientesModulo
          },
          evolucionTemporal: evolucionTemporalModulo
        }
      };
    });

    evolucionTemporal.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));

    const mediaGlobal = totalCalificadasGlobal > 0
      ? Number((sumaNotasGlobal / totalCalificadasGlobal).toFixed(1))
      : null;

    const tasaAprobadosGlobal = totalCalificadasGlobal > 0
      ? Number((((aprobadosGlobal + notablesGlobal + sobresalientesGlobal) / totalCalificadasGlobal) * 100).toFixed(1))
      : 0;

    return {
      ...historialPrevio,
      modulos: modulosActualizados,
      estadisticasGlobales: {
        totalPracticas: totalPracticasGlobal,
        calificadas: totalCalificadasGlobal,
        pendientes: totalPendientesGlobal,
        mediaGlobal,
        tasaAprobados: tasaAprobadosGlobal,
        distribucion: {
          suspensos: suspensosGlobal,
          aprobados: aprobadosGlobal,
          notables: notablesGlobal,
          sobresalientes: sobresalientesGlobal
        },
        evolucionTemporal
      }
    };
  };

  // Se guarda o actualiza la nota de una práctica en la base de datos con actualización optimista de los gráficos
  const guardarNota = useCallback(async ({
    idEvaluacion,
    idPractica,
    idDiscente,
    nota,
    idEvaluan = null,
    peso = 100,
    idFilaUnica = null
  }) => {
    const filaKey = idFilaUnica || `${idEvaluacion}_${idPractica}`;
    setGuardandoNotaId(filaKey);

    // Se normaliza la calificación a entero entre 0 y 100 o null
    let notaNormalizada = null;
    if (nota !== null && nota !== undefined && nota !== '') {
      const num = parseInt(nota, 10);
      if (isNaN(num) || num < 0 || num > 100) {
        mostrarError('Nota fuera de rango', 'La nota debe ser un número entero de 0 a 100.');
        setGuardandoNotaId(null);
        return { exito: false };
      }
      notaNormalizada = num;
    }

    try {
      const resp = await guardarNotaDiscente({
        idEvaluacion,
        idPractica,
        idDiscente: idDiscente || discenteSeleccionadoId,
        nota: notaNormalizada,
        idEvaluan,
        peso
      });

      if (!resp.exito) {
        mostrarError('Error al guardar nota', resp.error || 'No se pudo registrar la nota.');
        return { exito: false };
      }

      // Se actualiza el estado local de forma reactiva sin requerir recargar toda la vista
      setHistorial((prev) =>
        recalcularEstadoHistorial(prev, filaKey, notaNormalizada, resp.idEvaluan)
      );

      mostrarExito(
        'Calificación actualizada',
        notaNormalizada !== null ? `Nota registrada: ${notaNormalizada}` : 'Calificación vaciada con éxito.'
      );

      return { exito: true, idEvaluan: resp.idEvaluan };
    } catch (err) {
      console.error('Error al guardar calificación del discente:', err);
      mostrarError('Error de comunicación', err.message || 'Error inesperado.');
      return { exito: false };
    } finally {
      setGuardandoNotaId(null);
    }
  }, [discenteSeleccionadoId, mostrarExito, mostrarError]);

  // Se actualiza el estado de actividad (activo) de un discente con guardado automático y notificación Toast
  const cambiarEstadoDiscente = useCallback(async (idDiscente, nuevoEstado) => {
    // Actualización optimista de la lista
    setListaDiscentes((prev) =>
      prev.map((d) => (d.id_discente === idDiscente ? { ...d, activo: nuevoEstado } : d))
    );

    // Si el discente seleccionado coincide, se actualiza también en su historial
    setHistorial((prev) => {
      if (!prev || !prev.discente || prev.discente.id_discente !== idDiscente) return prev;
      return {
        ...prev,
        discente: {
          ...prev.discente,
          activo: nuevoEstado
        }
      };
    });

    try {
      const resp = await actualizarEstadoDiscente(idDiscente, nuevoEstado);
      if (!resp.exito) {
        mostrarError('Error al actualizar estado', resp.error || 'No se pudo guardar el cambio.');
        // Se revierte la actualización en caso de error
        setListaDiscentes((prev) =>
          prev.map((d) => (d.id_discente === idDiscente ? { ...d, activo: !nuevoEstado } : d))
        );
        return false;
      }

      mostrarExito(
        'Estado actualizado',
        `El discente ha sido marcado como ${nuevoEstado ? 'Activo' : 'Inactivo'}.`
      );
      return true;
    } catch (err) {
      console.error('Error inesperado al cambiar estado del discente:', err);
      mostrarError('Error de comunicación', err.message || 'Error inesperado.');
      setListaDiscentes((prev) =>
        prev.map((d) => (d.id_discente === idDiscente ? { ...d, activo: !nuevoEstado } : d))
      );
      return false;
    }
  }, [mostrarExito, mostrarError]);

  return {
    listaDiscentes,
    discenteSeleccionadoId,
    cursoSeleccionadoId,
    historial,
    cargandoLista,
    cargandoHistorial,
    guardandoNotaId,
    error,
    filtroTexto,
    setFiltroTexto,
    seleccionarDiscente,
    limpiarSeleccion,
    cambiarCurso,
    guardarNota,
    cambiarEstadoDiscente,
    recargarLista: () => cargarLista(filtroTexto),
    recargarHistorial: () => cargarHistorial(discenteSeleccionadoId, cursoSeleccionadoId)
  };
};

export default useInformeDiscente;
