import { useState, useEffect, useCallback, useMemo } from 'react';
import useCursosContexto from './useCursosContexto.js';
import useToast from './useToast.js';
import { obtenerModulosPorCurso } from '../services/evaluacionService.js';
import {
  getActaPorRA,
  transformarDatosActaPorRA,
  actualizarPesoRA,
  exportarActaRACSV,
  exportarActaRAPDF
} from '../services/informesService.js';

// Hook personalizado para gestionar los datos y la lógica del acta de evaluación por Resultados de Aprendizaje (RA)
const useInformeEvaluacionRa = () => {
  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();

  // Se obtienen los cursos desde el contexto global de la aplicación
  const { datos: todosCursosContexto } = useCursosContexto();

  // Estados de selección para los desplegables de Curso y Módulo
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Módulos disponibles según el curso seleccionado
  const [modulosDisponibles, setModulosDisponibles] = useState([]);

  // Estados de datos del acta por RA
  const [datosCrudos, setDatosCrudos] = useState(null);
  const [filasActa, setFilasActa] = useState([]);
  const [listaRA, setListaRA] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Modo de evaluación: false = Ponderación Anual Oficial, true = Evaluación Continua (sólo RA completos totalizada a 100)
  const [soloCompletos, setSoloCompletos] = useState(false);

  // Estados de carga y exportación
  const [cargando, setCargando] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [guardandoPeso, setGuardandoPeso] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [exportandoCSV, setExportandoCSV] = useState(false);
  const [error, setError] = useState(null);

  // Término de búsqueda para filtrar discentes en la tabla
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Criterios de ordenación de los discentes (nombre vs apellidos y asc vs desc)
  const [campoOrden, setCampoOrden] = useState('apellidos');
  const [direccionOrden, setDireccionOrden] = useState('asc');

  // Estado para el diálogo de detalle de un discente y RA específico
  const [detalleModal, setDetalleModal] = useState({
    visible: false,
    discente: null,
    ra: null,
    detalle: null,
    criterios: []
  });

  // Se ordenan los cursos de más reciente a más antiguo según su fecha de creación
  const cursosOrdenados = useMemo(() => {
    return [...(todosCursosContexto || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });
  }, [todosCursosContexto]);

  // Se selecciona automáticamente por defecto el curso más reciente si no existe uno previo
  useEffect(() => {
    if (cursosOrdenados.length > 0 && !cursoSeleccionadoId) {
      if (cursosOrdenados[0]?.id_curso) {
        setCursoSeleccionadoId(cursosOrdenados[0].id_curso);
      }
    }
  }, [cursosOrdenados, cursoSeleccionadoId]);

  // Manejador para el cambio manual de curso académico
  const handleCambiarCurso = useCallback((nuevoCursoId) => {
    setCursoSeleccionadoId(nuevoCursoId || null);
    setModuloSeleccionadoId(null);
    setDatosCrudos(null);
    setFilasActa([]);
    setListaRA([]);
    setEstadisticas(null);
    setError(null);
  }, []);

  // Manejador para el cambio manual de módulo profesional
  const handleCambiarModulo = useCallback((nuevoModuloId) => {
    setModuloSeleccionadoId(nuevoModuloId || null);
    if (!nuevoModuloId) {
      setDatosCrudos(null);
      setFilasActa([]);
      setListaRA([]);
      setEstadisticas(null);
      setError(null);
    }
  }, []);

  // Se cargan los módulos profesionales cuando cambia el curso seleccionado
  useEffect(() => {
    const cargarModulosDelCurso = async () => {
      if (!cursoSeleccionadoId) {
        setModulosDisponibles([]);
        return;
      }

      setCargandoModulos(true);
      try {
        const { data: mods, error: errMods } = await obtenerModulosPorCurso(cursoSeleccionadoId);
        if (errMods) {
          console.error('Error al consultar módulos del curso para el acta por RA:', errMods);
          setModulosDisponibles([]);
        } else {
          setModulosDisponibles(mods || []);
        }
      } catch (err) {
        console.error('Error inesperado al cargar módulos del curso:', err);
        setModulosDisponibles([]);
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulosDelCurso();
  }, [cursoSeleccionadoId]);

  // Se obtienen los datos completos del acta por RA cuando se selecciona un módulo
  const cargarDatosActaRA = useCallback(async () => {
    if (!moduloSeleccionadoId) {
      setDatosCrudos(null);
      setFilasActa([]);
      setListaRA([]);
      setEstadisticas(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const respuesta = await getActaPorRA(cursoSeleccionadoId, moduloSeleccionadoId);

      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      const datos = respuesta.data;
      setDatosCrudos(datos);

      // Se realiza la transformación inicial de calificaciones ponderadas por RA
      const transformado = transformarDatosActaPorRA(datos, soloCompletos);
      setFilasActa(transformado.filas || []);
      setListaRA(transformado.listaRA || []);
      setEstadisticas(transformado.estadisticas || null);
    } catch (err) {
      console.error('Error al cargar datos del acta por RA:', err);
      setError(err.message || 'No se pudieron obtener las calificaciones de los Resultados de Aprendizaje.');
      mostrarError('Error de consulta', 'No se pudieron obtener las calificaciones por RA del módulo.');
      setDatosCrudos(null);
      setFilasActa([]);
      setListaRA([]);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  }, [cursoSeleccionadoId, moduloSeleccionadoId, soloCompletos, mostrarError]);

  useEffect(() => {
    if (moduloSeleccionadoId) {
      cargarDatosActaRA();
    } else {
      setDatosCrudos(null);
      setFilasActa([]);
      setListaRA([]);
      setEstadisticas(null);
    }
  }, [moduloSeleccionadoId, cargarDatosActaRA]);

  // Se recalcula la tabla cuando cambia el modo de evaluación (anual vs continua)
  const conmutarModoEvaluacion = useCallback(() => {
    setSoloCompletos((prev) => {
      const nuevoModo = !prev;
      if (datosCrudos) {
        const transformado = transformarDatosActaPorRA(datosCrudos, nuevoModo);
        setFilasActa(transformado.filas || []);
        setEstadisticas(transformado.estadisticas || null);
      }
      if (nuevoModo) {
        mostrarInfo(
          'Evaluación Continua activada',
          'Se calcula la nota temporal computando exclusivamente los RA completos y totalizada al 100%.'
        );
      } else {
        mostrarInfo(
          'Ponderación Anual Oficial',
          'Se calcula la nota final aplicando la ponderación completa de todos los RA del curso.'
        );
      }
      return nuevoModo;
    });
  }, [datosCrudos, mostrarInfo]);

  // Se alterna la ordenación entre ascendente y descendente para un campo (nombre o apellidos)
  const alternarOrdenacion = useCallback((campo) => {
    if (campoOrden === campo) {
      setDireccionOrden((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  }, [campoOrden]);

  // Se actualiza el peso de un RA en la tabla ra_curso y se recalculan las notas de los discentes
  const cambiarPesoRA = useCallback(async (idRa, nuevoPeso) => {
    if (!cursoSeleccionadoId || !idRa) return false;

    setGuardandoPeso(true);
    try {
      const respuesta = await actualizarPesoRA(cursoSeleccionadoId, idRa, nuevoPeso);
      if (!respuesta.exito) {
        mostrarError('Error al guardar peso', respuesta.error || 'No se pudo actualizar el peso en la base de datos.');
        return false;
      }

      // Se actualiza el estado local de datosCrudos con el nuevo peso de ra_curso
      setDatosCrudos((prev) => {
        if (!prev) return prev;
        const nuevaListaRaCurso = [...(prev.listaRaCurso || [])];
        const idx = nuevaListaRaCurso.findIndex((item) => item.id_ra === idRa);
        if (idx >= 0) {
          nuevaListaRaCurso[idx] = { ...nuevaListaRaCurso[idx], peso: respuesta.peso };
        } else {
          nuevaListaRaCurso.push({ id_curso: cursoSeleccionadoId, id_ra: idRa, peso: respuesta.peso });
        }

        const nuevosDatos = { ...prev, listaRaCurso: nuevaListaRaCurso };
        const transformado = transformarDatosActaPorRA(nuevosDatos, soloCompletos);
        setFilasActa(transformado.filas || []);
        setListaRA(transformado.listaRA || []);
        setEstadisticas(transformado.estadisticas || null);

        return nuevosDatos;
      });

      mostrarExito('Ponderación actualizada', `El peso del RA se ha guardado en ${respuesta.peso}%.`);
      return true;
    } catch (err) {
      console.error('Error al cambiar peso de RA:', err);
      mostrarError('Error al actualizar', err.message || 'Error al persistir el peso del RA.');
      return false;
    } finally {
      setGuardandoPeso(false);
    }
  }, [cursoSeleccionadoId, soloCompletos, mostrarExito, mostrarError]);

  // Se filtran y ordenan los discentes mostrados según el término de búsqueda y los botones de ordenación
  const filasFiltradas = useMemo(() => {
    let lista = filasActa;
    if (terminoBusqueda && terminoBusqueda.trim()) {
      const termino = terminoBusqueda.trim().toLowerCase();
      lista = lista.filter((fila) => {
        const coincideNombre =
          (fila.nombre && fila.nombre.toLowerCase().includes(termino)) ||
          (fila.apellidos && fila.apellidos.toLowerCase().includes(termino)) ||
          (fila.nombreCompleto && fila.nombreCompleto.toLowerCase().includes(termino)) ||
          (fila.nombreCompletoDirecto && fila.nombreCompletoDirecto.toLowerCase().includes(termino));

        return coincideNombre;
      });
    }

    return [...lista].sort((a, b) => {
      let comparacion = 0;
      if (campoOrden === 'nombre') {
        const nomA = (a.nombre || '').toLowerCase();
        const nomB = (b.nombre || '').toLowerCase();
        comparacion = nomA.localeCompare(nomB);
        if (comparacion === 0) {
          comparacion = (a.apellidos || '').toLowerCase().localeCompare((b.apellidos || '').toLowerCase());
        }
      } else {
        const apeA = (a.apellidos || '').toLowerCase();
        const apeB = (b.apellidos || '').toLowerCase();
        comparacion = apeA.localeCompare(apeB);
        if (comparacion === 0) {
          comparacion = (a.nombre || '').toLowerCase().localeCompare((b.nombre || '').toLowerCase());
        }
      }
      return direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }, [filasActa, terminoBusqueda, campoOrden, direccionOrden]);

  // Modelos completos de curso y módulo seleccionados
  const cursoSeleccionado = useMemo(() => {
    if (!cursoSeleccionadoId) return null;
    return (todosCursosContexto || []).find(
      (c) => String(c.id_curso).toLowerCase() === String(cursoSeleccionadoId).toLowerCase()
    ) || null;
  }, [todosCursosContexto, cursoSeleccionadoId]);

  const moduloSeleccionado = useMemo(() => {
    if (!moduloSeleccionadoId) return null;
    return (modulosDisponibles || []).find(
      (m) => String(m.id_modulo).toLowerCase() === String(moduloSeleccionadoId).toLowerCase()
    ) || null;
  }, [modulosDisponibles, moduloSeleccionadoId]);

  // Apertura y cierre del modal de inspección detallada de un RA para un discente
  const abrirDetalleDiscenteRA = useCallback((filaDiscente, ra) => {
    const detalleRA = filaDiscente?.detalleRA?.[ra.id_ra];
    setDetalleModal({
      visible: true,
      discente: filaDiscente,
      ra,
      detalle: detalleRA,
      criterios: detalleRA?.criterios || []
    });
  }, []);

  const cerrarDetalleDiscenteRA = useCallback(() => {
    setDetalleModal({
      visible: false,
      discente: null,
      ra: null,
      detalle: null,
      criterios: []
    });
  }, []);

  // Se descarga el archivo CSV con las calificaciones por RA
  const descargarCSV = useCallback(() => {
    if (!moduloSeleccionado) {
      mostrarAdvertencia('Módulo requerido', 'Debe seleccionar un módulo para exportar el acta por RA.');
      return;
    }

    if (filasActa.length === 0) {
      mostrarAdvertencia('Sin registros', 'No hay datos de discentes para exportar a CSV.');
      return;
    }

    setExportandoCSV(true);
    try {
      const resultado = exportarActaRACSV({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        listaRA,
        filas: filasFiltradas,
        soloCompletos
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('CSV exportado', 'El archivo CSV del acta por RA ha sido generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al exportar CSV del acta por RA:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el archivo CSV.');
    } finally {
      setExportandoCSV(false);
    }
  }, [moduloSeleccionado, cursoSeleccionado, listaRA, filasFiltradas, soloCompletos, filasActa.length, mostrarExito, mostrarError, mostrarAdvertencia]);

  // Se genera y descarga el documento PDF oficial del acta por RA
  const descargarPDF = useCallback(() => {
    if (!moduloSeleccionado) {
      mostrarAdvertencia('Módulo requerido', 'Debe seleccionar un módulo para exportar el acta por RA.');
      return;
    }

    if (filasActa.length === 0) {
      mostrarAdvertencia('Sin registros', 'No hay datos de discentes para exportar a PDF.');
      return;
    }

    setExportandoPDF(true);
    try {
      const resultado = exportarActaRAPDF({
        modulo: moduloSeleccionado,
        curso: cursoSeleccionado,
        listaRA,
        filas: filasFiltradas,
        estadisticas,
        soloCompletos
      });

      if (!resultado.exito) {
        throw new Error(resultado.error);
      }

      mostrarExito('PDF exportado', 'El documento PDF del acta de evaluación por RA ha sido generado.');
    } catch (err) {
      console.error('Error al exportar PDF del acta por RA:', err);
      mostrarError('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  }, [moduloSeleccionado, cursoSeleccionado, listaRA, filasFiltradas, estadisticas, soloCompletos, filasActa.length, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos: cursosOrdenados,
    modulosDisponibles,
    cursoSeleccionadoId,
    setCursoSeleccionadoId: handleCambiarCurso,
    cursoSeleccionado,
    moduloSeleccionadoId,
    setModuloSeleccionadoId: handleCambiarModulo,
    moduloSeleccionado,
    datosCrudos,
    filasActa,
    filasFiltradas,
    listaRA,
    estadisticas,
    soloCompletos,
    conmutarModoEvaluacion,
    terminoBusqueda,
    setTerminoBusqueda,
    campoOrden,
    direccionOrden,
    alternarOrdenacion,
    cambiarPesoRA,
    guardandoPeso,
    cargando,
    cargandoModulos,
    exportandoPDF,
    exportandoCSV,
    error,
    detalleModal,
    abrirDetalleDiscenteRA,
    cerrarDetalleDiscenteRA,
    recargar: cargarDatosActaRA,
    descargarCSV,
    descargarPDF
  };
};

export default useInformeEvaluacionRa;
