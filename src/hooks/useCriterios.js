import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import {
  getArbolCriterios,
  savePesoCriterios,
  obtenerAsignacionesPorPractica,
  obtenerPracticasAsignadasEvaluacion,
  obtenerAsignacionesPorModulo
} from '../services/criteriosService.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';

// Hook personalizado para gestionar la asignación masiva de prácticas a criterios de evaluación y resultados de aprendizaje
const useCriterios = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  // Contextos globales para el filtrado principal ordenados por fecha de creación (más reciente primero)
  const { datos: todosCursosContexto } = useCursosContexto();

  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  // Estados de filtros y selección
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [practicaSeleccionadaId, setPracticaSeleccionadaId] = useState(null);

  // Se selecciona automáticamente por defecto el curso más reciente al inicio
  useEffect(() => {
    if ((todosCursosContexto || []).length > 0 && !cursoSeleccionadoId) {
      const cursosOrdenadosLista = [...todosCursosContexto].sort((a, b) => {
        const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fechaB - fechaA;
      });

      if (cursosOrdenadosLista[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenadosLista[0].id_curso);
      }
    }
  }, [todosCursosContexto, cursoSeleccionadoId]);

  // Estados de datos
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [practicasDisponibles, setPracticasDisponibles] = useState([]);
  const [arbolCriterios, setArbolCriterios] = useState([]);
  const [todasAsignacionesModulo, setTodasAsignacionesModulo] = useState([]);
  const [asignacionesIniciales, setAsignacionesIniciales] = useState({});

  // Mapa reactivo de selecciones por id_ce: { [id_ce]: { seleccionado: boolean, porcentaje: number, id_ra: string } }
  const [seleccionesCE, setSeleccionesCE] = useState({});

  // Estados de control de carga y cambios pendientes
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);
  const [cargandoArbol, setCargandoArbol] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);
  const [hayCambiosSinGuardar, setHayCambiosSinGuardar] = useState(false);

  // Actualización de los módulos profesionales que se imparten estrictamente en el curso seleccionado
  useEffect(() => {
    let activo = true;

    const cargarModulosDelCurso = async () => {
      if (cursoSeleccionadoId) {
        setCargandoModulos(true);
        setErrorOperacion(null);
        try {
          const { data: mods, error } = await obtenerModulosPorCurso(cursoSeleccionadoId);
          if (error) throw new Error(error);

          if (activo) {
            const modulosObtenidos = mods || [];
            setModulosDisponibles(modulosObtenidos);

            // Si el módulo previamente seleccionado no pertenece a este curso, se reinicia a null para selección manual
            setModuloSeleccionadoId((prevModId) => {
              if (!prevModId) return null;
              const existe = modulosObtenidos.some(
                (m) => String(m.id_modulo).toLowerCase() === String(prevModId).toLowerCase()
              );
              return existe ? prevModId : null;
            });
          }
        } catch (err) {
          console.error('Error al obtener módulos del curso seleccionado:', err);
          if (activo) {
            setErrorOperacion(err.message || 'Error al obtener los módulos del curso.');
            setModulosDisponibles([]);
            setModuloSeleccionadoId(null);
          }
        } finally {
          if (activo) setCargandoModulos(false);
        }
      } else {
        if (activo) {
          setModulosDisponibles([]);
          setModuloSeleccionadoId(null);
        }
      }
    };

    cargarModulosDelCurso();

    return () => {
      activo = false;
    };
  }, [cursoSeleccionadoId]);

  // Carga exclusiva de las prácticas que han sido asignadas a alguna evaluación del módulo para el curso seleccionado
  useEffect(() => {
    let activo = true;

    const cargarPracticasAsignadas = async () => {
      if (cursoSeleccionadoId && moduloSeleccionadoId) {
        setCargandoPracticas(true);
        setErrorOperacion(null);
        try {
          const { data: practicasBD, error } = await obtenerPracticasAsignadasEvaluacion(
            cursoSeleccionadoId,
            moduloSeleccionadoId
          );

          if (error) throw new Error(error);

          if (activo) {
            const practicasFinales = practicasBD || [];
            setPracticasDisponibles(practicasFinales);

            // Si la práctica previamente seleccionada no está entre las asignadas de este módulo y curso, se reinicia a null
            setPracticaSeleccionadaId((prevPracId) => {
              if (!prevPracId) return null;
              const existe = practicasFinales.some(
                (p) => String(p.id_practica).toLowerCase() === String(prevPracId).toLowerCase()
              );
              return existe ? prevPracId : null;
            });
          }
        } catch (err) {
          console.error('Error al cargar prácticas vinculadas a evaluaciones:', err);
          if (activo) {
            setErrorOperacion(err.message || 'Error al consultar las prácticas asignadas.');
            setPracticasDisponibles([]);
            setPracticaSeleccionadaId(null);
          }
        } finally {
          if (activo) setCargandoPracticas(false);
        }
      } else {
        if (activo) {
          setPracticasDisponibles([]);
          setPracticaSeleccionadaId(null);
        }
      }
    };

    cargarPracticasAsignadas();

    return () => {
      activo = false;
    };
  }, [cursoSeleccionadoId, moduloSeleccionadoId]);

  // Objeto de la práctica seleccionada actualmente
  const practicaSeleccionada = useMemo(() => {
    if (!practicaSeleccionadaId) return null;
    return (practicasDisponibles || []).find(
      (p) => String(p.id_practica).toLowerCase() === String(practicaSeleccionadaId).toLowerCase()
    ) || null;
  }, [practicasDisponibles, practicaSeleccionadaId]);

  // Mapa de cobertura global por CE en otras prácticas del módulo:
  // { [id_ce]: { porcentajeEnOtras: number, asignadoEnOtras: boolean, asignacionesOtras: array } }
  const coberturaGlobalCE = useMemo(() => {
    const mapa = {};
    (todasAsignacionesModulo || []).forEach((asig) => {
      if (!asig.id_ce) return;
      if (!mapa[asig.id_ce]) {
        mapa[asig.id_ce] = {
          porcentajeEnOtras: 0,
          asignadoEnOtras: false,
          asignacionesOtras: []
        };
      }
      const porc = Number(asig.porcentaje) || 0;
      // Si la asignación pertenece a otra práctica distinta de la actual
      if (String(asig.id_practica).toLowerCase() !== String(practicaSeleccionadaId).toLowerCase()) {
        mapa[asig.id_ce].porcentajeEnOtras += porc;
        mapa[asig.id_ce].asignadoEnOtras = true;
        mapa[asig.id_ce].asignacionesOtras.push(asig);
      }
    });
    return mapa;
  }, [todasAsignacionesModulo, practicaSeleccionadaId]);

  // Carga del árbol jerárquico de RA y CE junto con las asignaciones previas de la práctica en trabajan y del módulo
  const cargarArbolYAsignaciones = useCallback(async (idPractica, idModulo) => {
    if (!idModulo || !idPractica) {
      setArbolCriterios([]);
      setSeleccionesCE({});
      setAsignacionesIniciales({});
      setTodasAsignacionesModulo([]);
      setHayCambiosSinGuardar(false);
      return;
    }

    setCargandoArbol(true);
    setErrorOperacion(null);

    try {
      // Se obtienen concurrentemente el árbol del módulo, las asignaciones de la práctica y todas las del módulo
      const [respArbol, respAsignaciones, respAsignacionesModulo] = await Promise.all([
        getArbolCriterios(idModulo),
        obtenerAsignacionesPorPractica(idPractica),
        obtenerAsignacionesPorModulo(idModulo)
      ]);

      if (respArbol.error) throw new Error(respArbol.error);
      if (respAsignaciones.error) throw new Error(respAsignaciones.error);
      if (respAsignacionesModulo.error) throw new Error(respAsignacionesModulo.error);

      const nodos = respArbol.data || [];
      const asignaciones = respAsignaciones.data || [];
      const asignacionesModulo = respAsignacionesModulo.data || [];

      // Se construye el mapa de asignaciones previas indexadas por id_ce
      const mapaPrevio = {};
      asignaciones.forEach((asig) => {
        if (asig.id_ce) {
          mapaPrevio[asig.id_ce] = {
            seleccionado: true,
            porcentaje: asig.porcentaje !== null && asig.porcentaje !== undefined ? Number(asig.porcentaje) : 100,
            id_trabajan: asig.id_trabajan
          };
        }
      });

      // Se inicializa el estado de selección para todos los CE encontrados en el árbol
      const mapaEstadoInicial = {};
      nodos.forEach((nodoRA) => {
        (nodoRA.children || []).forEach((nodoCE) => {
          const idCE = nodoCE.data.id_ce;
          const previo = mapaPrevio[idCE];

          if (previo) {
            mapaEstadoInicial[idCE] = {
              seleccionado: true,
              porcentaje: previo.porcentaje,
              id_ra: nodoRA.data.id_ra
            };
          } else {
            mapaEstadoInicial[idCE] = {
              seleccionado: false,
              porcentaje: 100,
              id_ra: nodoRA.data.id_ra
            };
          }
        });
      });

      setArbolCriterios(nodos);
      setTodasAsignacionesModulo(asignacionesModulo);
      setSeleccionesCE(mapaEstadoInicial);
      setAsignacionesIniciales(mapaEstadoInicial);
      setHayCambiosSinGuardar(false);
    } catch (err) {
      console.error('Error al cargar árbol de criterios y asignaciones:', err);
      setErrorOperacion(err.message || 'Error al cargar los criterios del módulo.');
    } finally {
      setCargandoArbol(false);
    }
  }, []);

  // Efecto para recargar la estructura jerárquica cuando se elige una práctica y su módulo
  useEffect(() => {
    if (practicaSeleccionadaId && moduloSeleccionadoId) {
      cargarArbolYAsignaciones(practicaSeleccionadaId, moduloSeleccionadoId);
    } else {
      setArbolCriterios([]);
      setSeleccionesCE({});
      setAsignacionesIniciales({});
      setTodasAsignacionesModulo([]);
      setHayCambiosSinGuardar(false);
    }
  }, [practicaSeleccionadaId, moduloSeleccionadoId, cargarArbolYAsignaciones]);

  // Selección de una práctica desde la interfaz
  const seleccionarPractica = useCallback((idPractica) => {
    setPracticaSeleccionadaId(idPractica);
  }, []);

  // Conmutación de la selección en cascada para todos los Criterios de Evaluación de un Resultado de Aprendizaje
  const alternarSeleccionRA = useCallback((idRA, forzarEstado = null) => {
    setSeleccionesCE((prev) => {
      const nodoRA = arbolCriterios.find((nodo) => nodo.data.id_ra === idRA);
      if (!nodoRA || !nodoRA.children) return prev;

      const hijos = nodoRA.children;
      const todosSeleccionados = hijos.every((hijo) => prev[hijo.data.id_ce]?.seleccionado);
      const nuevoEstado = forzarEstado !== null ? Boolean(forzarEstado) : !todosSeleccionados;

      const nuevoMapa = { ...prev };
      hijos.forEach((hijo) => {
        const idCE = hijo.data.id_ce;
        const actual = prev[idCE] || {};
        const coberturaCE = coberturaGlobalCE[idCE] || { porcentajeEnOtras: 0 };
        const porcentajeRestante = Math.max(0, 100 - (coberturaCE.porcentajeEnOtras || 0));

        let nuevoPorcentaje = actual.porcentaje;
        if (nuevoEstado && (!actual.porcentaje || actual.porcentaje === 0)) {
          nuevoPorcentaje = porcentajeRestante > 0 ? porcentajeRestante : 0;
        }

        nuevoMapa[idCE] = {
          ...actual,
          seleccionado: nuevoEstado,
          porcentaje: nuevoPorcentaje,
          id_ra: idRA
        };
      });

      return nuevoMapa;
    });

    setHayCambiosSinGuardar(true);
  }, [arbolCriterios, coberturaGlobalCE]);

  // Conmutación individual del estado de selección de un Criterio de Evaluación
  const alternarSeleccionCE = useCallback((idCE) => {
    setSeleccionesCE((prev) => {
      const actual = prev[idCE] || { seleccionado: false, porcentaje: 100 };
      const nuevoEstado = !actual.seleccionado;
      const coberturaCE = coberturaGlobalCE[idCE] || { porcentajeEnOtras: 0 };
      const porcentajeRestante = Math.max(0, 100 - (coberturaCE.porcentajeEnOtras || 0));

      let nuevoPorcentaje = actual.porcentaje;
      if (nuevoEstado && (!actual.porcentaje || actual.porcentaje === 0)) {
        nuevoPorcentaje = porcentajeRestante > 0 ? porcentajeRestante : 0;
      }

      return {
        ...prev,
        [idCE]: {
          ...actual,
          seleccionado: nuevoEstado,
          porcentaje: nuevoPorcentaje
        }
      };
    });

    setHayCambiosSinGuardar(true);
  }, [coberturaGlobalCE]);

  // Modificación del valor de porcentaje para un Criterio de Evaluación
  const actualizarPorcentajeCE = useCallback((idCE, nuevoPorcentaje) => {
    const valorNum = parseInt(nuevoPorcentaje, 10);
    const porcentajeFinal = isNaN(valorNum) ? 0 : Math.max(0, Math.min(100, valorNum));

    setSeleccionesCE((prev) => {
      const actual = prev[idCE] || { seleccionado: true, porcentaje: 100 };
      return {
        ...prev,
        [idCE]: {
          ...actual,
          porcentaje: porcentajeFinal,
          // Si el docente ajusta el porcentaje, se asegura que el criterio quede marcado
          seleccionado: true
        }
      };
    });

    setHayCambiosSinGuardar(true);
  }, []);

  // Marcado masivo de todos los criterios de evaluación del módulo respetando coberturas
  const marcarTodosLosCriterios = useCallback(() => {
    setSeleccionesCE((prev) => {
      const nuevoMapa = { ...prev };
      Object.keys(nuevoMapa).forEach((idCE) => {
        const coberturaCE = coberturaGlobalCE[idCE] || { porcentajeEnOtras: 0 };
        const porcentajeRestante = Math.max(0, 100 - (coberturaCE.porcentajeEnOtras || 0));
        const porcActual = nuevoMapa[idCE]?.porcentaje;

        nuevoMapa[idCE] = {
          ...nuevoMapa[idCE],
          seleccionado: true,
          porcentaje: porcActual > 0 ? porcActual : (porcentajeRestante > 0 ? porcentajeRestante : 100)
        };
      });
      return nuevoMapa;
    });
    setHayCambiosSinGuardar(true);
  }, [coberturaGlobalCE]);

  // Desmarcado masivo de todos los criterios de evaluación del módulo
  const desmarcarTodosLosCriterios = useCallback(() => {
    setSeleccionesCE((prev) => {
      const nuevoMapa = { ...prev };
      Object.keys(nuevoMapa).forEach((idCE) => {
        nuevoMapa[idCE] = {
          ...nuevoMapa[idCE],
          seleccionado: false
        };
      });
      return nuevoMapa;
    });
    setHayCambiosSinGuardar(true);
  }, []);

  // Restablecimiento de las selecciones a los valores almacenados en la base de datos
  const restablecerSelecciones = useCallback(() => {
    setSeleccionesCE({ ...asignacionesIniciales });
    setHayCambiosSinGuardar(false);
  }, [asignacionesIniciales]);

  // Persistencia de los criterios seleccionados y sus porcentajes en la tabla trabajan
  const guardarAsignaciones = useCallback(async () => {
    if (!practicaSeleccionadaId) {
      mostrarError('Error', 'Debe seleccionar una práctica antes de guardar.');
      return { exito: false };
    }

    // Se filtran exclusivamente los CE que se encuentren marcados por el usuario
    const seleccionesAEnviar = Object.entries(seleccionesCE)
      .filter(([, datosCE]) => datosCE.seleccionado)
      .map(([idCE, datosCE]) => ({
        id_ce: idCE,
        porcentaje: datosCE.porcentaje,
        descripcion: ''
      }));

    setGuardando(true);
    mostrarInfo('Guardando pesos', 'Actualizando asignación de criterios de evaluación...');

    try {
      const { exito, error, totalGuardados } = await savePesoCriterios(
        practicaSeleccionadaId,
        seleccionesAEnviar
      );

      if (!exito) {
        throw new Error(error || 'Error al persistir las asignaciones en la base de datos.');
      }

      setAsignacionesIniciales({ ...seleccionesCE });
      setHayCambiosSinGuardar(false);

      // Se recargan las asignaciones para refrescar coberturas globales del módulo
      if (practicaSeleccionadaId && moduloSeleccionadoId) {
        cargarArbolYAsignaciones(practicaSeleccionadaId, moduloSeleccionadoId);
      }

      mostrarExito(
        'Pesos guardados',
        `Se han asignado ${totalGuardados} criterios de evaluación a la práctica.`
      );

      return { exito: true };
    } catch (err) {
      console.error('Error al guardar asignaciones de criterios:', err);
      mostrarError('Error al guardar', err.message || 'No se pudieron guardar los pesos de los criterios.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [practicaSeleccionadaId, moduloSeleccionadoId, seleccionesCE, cargarArbolYAsignaciones, mostrarExito, mostrarError, mostrarInfo]);

  // Cálculo de estadísticas resumidas
  const estadisticas = useMemo(() => {
    const totalCEs = Object.keys(seleccionesCE).length;
    const seleccionados = Object.values(seleccionesCE).filter((item) => item.seleccionado);
    const totalSeleccionados = seleccionados.length;

    const sumaPorcentajes = seleccionados.reduce((acum, item) => acum + (item.porcentaje || 0), 0);
    const promedioCobertura = totalSeleccionados > 0 ? Math.round(sumaPorcentajes / totalSeleccionados) : 0;

    return {
      totalCEs,
      totalSeleccionados,
      promedioCobertura
    };
  }, [seleccionesCE]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    practicasDisponibles,
    practicaSeleccionada,
    practicaSeleccionadaId,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    seleccionarPractica,
    arbolCriterios,
    seleccionesCE,
    coberturaGlobalCE,
    cargando: cargandoModulos || cargandoPracticas || cargandoArbol,
    cargandoPracticas,
    guardando,
    error: errorOperacion,
    hayCambiosSinGuardar,
    estadisticas,
    alternarSeleccionRA,
    alternarSeleccionCE,
    actualizarPorcentajeCE,
    marcarTodosLosCriterios,
    desmarcarTodosLosCriterios,
    restablecerSelecciones,
    guardarAsignaciones,
    recargar: () => {
      if (cursoSeleccionadoId && moduloSeleccionadoId) {
        obtenerPracticasAsignadasEvaluacion(cursoSeleccionadoId, moduloSeleccionadoId).then((res) => {
          setPracticasDisponibles(res.data || []);
        });
      }
      if (practicaSeleccionadaId && moduloSeleccionadoId) {
        cargarArbolYAsignaciones(practicaSeleccionadaId, moduloSeleccionadoId);
      }
    }
  };
};

export default useCriterios;
