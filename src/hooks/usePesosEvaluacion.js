import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import {
  obtenerArbolPesosModuloCurso,
  guardarPesosEvaluacion,
  calcularDistribucionEquitativa
} from '../services/pesosEvaluacionService.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';

// Hook personalizado para gestionar la ponderación de Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE) por curso
const usePesosEvaluacion = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  // Se obtienen los cursos académicos ordenados cronológicamente (más reciente primero)
  const { datos: todosCursosContexto, cargando: cargandoCursos } = useCursosContexto();

  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  // Estados de selección de filtros
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Se selecciona automáticamente por defecto el curso más actual al cargar los cursos
  useEffect(() => {
    if (cursosOrdenados.length > 0 && !cursoSeleccionadoId) {
      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Estados de datos
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [arbolPesos, setArbolPesos] = useState([]);
  const [listaRA, setListaRA] = useState([]);
  const [listaCE, setListaCE] = useState([]);

  // Mapas reactivos de pesos editables: { [id_ra]: number } y { [id_ce]: number }
  const [pesosRA, setPesosRA] = useState({});
  const [pesosCE, setPesosCE] = useState({});
  const [valoresIniciales, setValoresIniciales] = useState({ pesosRA: {}, pesosCE: {} });

  // Estados de control de carga y operaciones
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [cargandoArbol, setCargandoArbol] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Carga de los módulos profesionales correspondientes al curso seleccionado
  useEffect(() => {
    let activo = true;

    const cargarModulos = async () => {
      if (!cursoSeleccionadoId) {
        setModulosDisponibles([]);
        setModuloSeleccionadoId(null);
        return;
      }

      setCargandoModulos(true);
      setErrorOperacion(null);

      try {
        const { data: mods, error } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (error) throw new Error(error);

        if (activo) {
          const modulosObtenidos = mods || [];
          setModulosDisponibles(modulosObtenidos);

          // Si el módulo previamente seleccionado no pertenece al curso, se reinicia a null
          setModuloSeleccionadoId((prevModId) => {
            if (!prevModId) return null;
            const existe = modulosObtenidos.some(
              (m) => String(m.id_modulo).toLowerCase() === String(prevModId).toLowerCase()
            );
            return existe ? prevModId : null;
          });
        }
      } catch (err) {
        console.error('Error al cargar módulos del curso:', err);
        if (activo) {
          setErrorOperacion(err.message || 'Error al obtener los módulos del curso.');
          setModulosDisponibles([]);
          setModuloSeleccionadoId(null);
        }
      } finally {
        if (activo) setCargandoModulos(false);
      }
    };

    cargarModulos();

    return () => {
      activo = false;
    };
  }, [cursoSeleccionadoId]);

  // Carga del árbol de RA y CE junto con los pesos asignados para el curso y módulo
  const cargarArbolYPesos = useCallback(async (idCurso, idModulo) => {
    if (!idCurso || !idModulo) {
      setArbolPesos([]);
      setListaRA([]);
      setListaCE([]);
      setPesosRA({});
      setPesosCE({});
      setValoresIniciales({ pesosRA: {}, pesosCE: {} });
      return;
    }

    setCargandoArbol(true);
    setErrorOperacion(null);

    try {
      const { data, listaRA: ras, listaCE: ces, error } = await obtenerArbolPesosModuloCurso(
        idCurso,
        idModulo
      );

      if (error) throw new Error(error);

      const mapaInicialRA = {};
      const mapaInicialCE = {};

      (ras || []).forEach((ra) => {
        const nodoRA = (data || []).find((n) => n.data.id_ra === ra.id_ra);
        mapaInicialRA[ra.id_ra] = nodoRA?.data?.peso || 0;
      });

      (ces || []).forEach((ce) => {
        let pesoEncontrado = 0;
        (data || []).forEach((nodoRA) => {
          const nodoCE = (nodoRA.children || []).find((c) => c.data.id_ce === ce.id_ce);
          if (nodoCE) {
            pesoEncontrado = nodoCE.data.peso || 0;
          }
        });
        mapaInicialCE[ce.id_ce] = pesoEncontrado;
      });

      setArbolPesos(data || []);
      setListaRA(ras || []);
      setListaCE(ces || []);
      setPesosRA(mapaInicialRA);
      setPesosCE(mapaInicialCE);
      setValoresIniciales({ pesosRA: { ...mapaInicialRA }, pesosCE: { ...mapaInicialCE } });
    } catch (err) {
      console.error('Error al cargar árbol de pesos:', err);
      setErrorOperacion(err.message || 'Error al obtener la ponderación de RA y CE.');
      setArbolPesos([]);
      setListaRA([]);
      setListaCE([]);
      setPesosRA({});
      setPesosCE({});
      setValoresIniciales({ pesosRA: {}, pesosCE: {} });
    } finally {
      setCargandoArbol(false);
    }
  }, []);

  // Efecto reactivo al cambiar de curso o módulo seleccionado
  useEffect(() => {
    if (cursoSeleccionadoId && moduloSeleccionadoId) {
      cargarArbolYPesos(cursoSeleccionadoId, moduloSeleccionadoId);
    } else {
      setArbolPesos([]);
      setListaRA([]);
      setListaCE([]);
      setPesosRA({});
      setPesosCE({});
      setValoresIniciales({ pesosRA: {}, pesosCE: {} });
    }
  }, [cursoSeleccionadoId, moduloSeleccionadoId, cargarArbolYPesos]);

  // Se actualiza el peso porcentual de un Resultado de Aprendizaje (RA)
  const actualizarPesoRA = useCallback((idRA, nuevoValor) => {
    const valorNum = parseInt(nuevoValor, 10);
    const pesoFinal = isNaN(valorNum) ? 0 : Math.max(0, Math.min(100, valorNum));

    setPesosRA((prev) => ({
      ...prev,
      [idRA]: pesoFinal
    }));
  }, []);

  // Se actualiza el peso porcentual de un Criterio de Evaluación (CE)
  const actualizarPesoCE = useCallback((idCE, nuevoValor) => {
    const valorNum = parseInt(nuevoValor, 10);
    const pesoFinal = isNaN(valorNum) ? 0 : Math.max(0, Math.min(100, valorNum));

    setPesosCE((prev) => ({
      ...prev,
      [idCE]: pesoFinal
    }));
  }, []);

  // Se reparte el 100% equitativamente entre todos los RA del módulo seleccionado
  const repartirEquitativamenteRA = useCallback(() => {
    if (listaRA.length === 0) return;

    const distribucion = calcularDistribucionEquitativa(listaRA.length);
    const nuevoMapaRA = {};

    listaRA.forEach((ra, indice) => {
      nuevoMapaRA[ra.id_ra] = distribucion[indice] || 0;
    });

    setPesosRA(nuevoMapaRA);
  }, [listaRA]);

  // Se reparte el 100% equitativamente entre los CE hijos de un RA específico
  const repartirEquitativamenteCE = useCallback((idRA) => {
    const cesDelRA = listaCE.filter((ce) => ce.id_ra === idRA);
    if (cesDelRA.length === 0) return;

    const distribucion = calcularDistribucionEquitativa(cesDelRA.length);
    setPesosCE((prev) => {
      const nuevoMapaCE = { ...prev };
      cesDelRA.forEach((ce, indice) => {
        nuevoMapaCE[ce.id_ce] = distribucion[indice] || 0;
      });
      return nuevoMapaCE;
    });
  }, [listaCE]);

  // Se reparte el 100% equitativamente entre los CE hijos de cada uno de los RA del módulo
  const repartirEquitativamenteTodosCE = useCallback(() => {
    if (listaRA.length === 0) return;

    setPesosCE((prev) => {
      const nuevoMapaCE = { ...prev };
      listaRA.forEach((ra) => {
        const cesDelRA = listaCE.filter((ce) => ce.id_ra === ra.id_ra);
        if (cesDelRA.length > 0) {
          const distribucion = calcularDistribucionEquitativa(cesDelRA.length);
          cesDelRA.forEach((ce, indice) => {
            nuevoMapaCE[ce.id_ce] = distribucion[indice] || 0;
          });
        }
      });
      return nuevoMapaCE;
    });
  }, [listaRA, listaCE]);

  // Se restablecen los pesos a los valores iniciales guardados en la base de datos
  const restablecerValores = useCallback(() => {
    setPesosRA({ ...valoresIniciales.pesosRA });
    setPesosCE({ ...valoresIniciales.pesosCE });
  }, [valoresIniciales]);

  // Cálculo de la suma total de los pesos de los Resultados de Aprendizaje
  const sumaTotalPesosRA = useMemo(() => {
    return Object.values(pesosRA).reduce((acum, val) => acum + (Number(val) || 0), 0);
  }, [pesosRA]);

  // Se verifica si la suma de RA es exactamente el 100%
  const esSumaRABalanceada = sumaTotalPesosRA === 100;

  // Cálculo de la suma de pesos de CE hijos por cada RA
  const estadoPorRA = useMemo(() => {
    const mapa = {};

    listaRA.forEach((ra) => {
      const cesDelRA = listaCE.filter((ce) => ce.id_ra === ra.id_ra);
      const sumaCE = cesDelRA.reduce((acum, ce) => acum + (Number(pesosCE[ce.id_ce]) || 0), 0);
      const totalCE = cesDelRA.length;
      const esValido = totalCE === 0 ? true : sumaCE === 100;

      mapa[ra.id_ra] = {
        id_ra: ra.id_ra,
        numero: ra.numero,
        nombre: ra.nombre,
        descripcion: ra.descripcion || '',
        totalCE,
        sumaCE,
        esValido
      };
    });

    return mapa;
  }, [listaRA, listaCE, pesosCE]);

  // Listado de RA que tienen inconsistencias en la suma de sus CE hijos
  const rasConInconsistencias = useMemo(() => {
    return Object.values(estadoPorRA).filter((item) => !item.esValido);
  }, [estadoPorRA]);

  // Indicador de validez global de la configuración de ponderaciones
  const esValidoGlobal = useMemo(() => {
    return (
      listaRA.length > 0 &&
      esSumaRABalanceada &&
      rasConInconsistencias.length === 0
    );
  }, [listaRA, esSumaRABalanceada, rasConInconsistencias]);

  // Detección de cambios pendientes de guardar
  const hayCambiosSinGuardar = useMemo(() => {
    const cambioRA = Object.keys(pesosRA).some(
      (id_ra) => pesosRA[id_ra] !== (valoresIniciales.pesosRA[id_ra] || 0)
    );
    const cambioCE = Object.keys(pesosCE).some(
      (id_ce) => pesosCE[id_ce] !== (valoresIniciales.pesosCE[id_ce] || 0)
    );
    return cambioRA || cambioCE;
  }, [pesosRA, pesosCE, valoresIniciales]);

  // Se persisten las ponderaciones en la base de datos
  const guardarPonderacion = useCallback(async () => {
    if (!cursoSeleccionadoId || !moduloSeleccionadoId) {
      mostrarError('Error', 'Debe seleccionar un curso y un módulo antes de guardar.');
      return { exito: false };
    }

    setGuardando(true);
    mostrarInfo('Guardando', 'Persistiendo las ponderaciones de RA y CE...');

    try {
      const { exito, error, totalRA, totalCE } = await guardarPesosEvaluacion({
        idCurso: cursoSeleccionadoId,
        idModulo: moduloSeleccionadoId,
        pesosRA,
        pesosCE
      });

      if (!exito) {
        throw new Error(error || 'Error al persistir las ponderaciones.');
      }

      setValoresIniciales({
        pesosRA: { ...pesosRA },
        pesosCE: { ...pesosCE }
      });

      mostrarExito(
        'Ponderación guardada',
        `Se han actualizado las ponderaciones de ${totalRA} RA y ${totalCE} CE correctamente.`
      );

      return { exito: true };
    } catch (err) {
      console.error('Error al guardar ponderaciones:', err);
      mostrarError('Error al guardar', err.message || 'No se pudieron guardar las ponderaciones.');
      return { exito: false, error: err.message };
    } finally {
      setGuardando(false);
    }
  }, [cursoSeleccionadoId, moduloSeleccionadoId, pesosRA, pesosCE, mostrarExito, mostrarError, mostrarInfo]);

  // Se obtiene el módulo seleccionado actualmente
  const moduloSeleccionado = useMemo(() => {
    if (!moduloSeleccionadoId) return null;
    return modulosDisponibles.find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  }, [modulosDisponibles, moduloSeleccionadoId]);

  // Se obtiene el curso seleccionado actualmente
  const cursoSeleccionado = useMemo(() => {
    if (!cursoSeleccionadoId) return null;
    return cursosOrdenados.find((c) => c.id_curso === cursoSeleccionadoId) || null;
  }, [cursosOrdenados, cursoSeleccionadoId]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    cursoSeleccionado,
    moduloSeleccionado,
    arbolPesos,
    listaRA,
    listaCE,
    pesosRA,
    pesosCE,
    actualizarPesoRA,
    actualizarPesoCE,
    repartirEquitativamenteRA,
    repartirEquitativamenteCE,
    repartirEquitativamenteTodosCE,
    restablecerValores,
    guardarPonderacion,
    sumaTotalPesosRA,
    esSumaRABalanceada,
    estadoPorRA,
    rasConInconsistencias,
    esValidoGlobal,
    hayCambiosSinGuardar,
    cargando: cargandoCursos || cargandoModulos || cargandoArbol,
    cargandoModulos,
    cargandoArbol,
    guardando,
    error: errorOperacion,
    recargar: () => {
      if (cursoSeleccionadoId && moduloSeleccionadoId) {
        cargarArbolYPesos(cursoSeleccionadoId, moduloSeleccionadoId);
      }
    }
  };
};

export default usePesosEvaluacion;
