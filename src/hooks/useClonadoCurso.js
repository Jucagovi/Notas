import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import {
  obtenerCursosDisponibles,
  obtenerModulosDeCurso,
  calcularSiguienteAnyo,
  sugerirNombreNuevoCurso,
  sugerirDescripcionNuevoCurso,
  clonarCurso,
  ordenarCursosPorReciente,
  EVALUACIONES_REGLAMENTARIAS
} from '../services/clonadoService.js';
import useToast from './useToast.js';
import { Contexto as CursosContexto } from '../context/CursosContexto.jsx';
import { Contexto as EvaluacionesContexto } from '../context/EvaluacionesContexto.jsx';

// Hook personalizado para gestionar el estado, validación y ejecución del proceso de clonado de cursos
const useClonadoCurso = () => {
  const { mostrarExito, mostrarError, mostrarInfo, mostrarAdvertencia } = useToast();

  // Se accede a los contextos globales de Cursos y Evaluaciones si están disponibles en el árbol de componentes
  const contextoCursos = useContext(CursosContexto);
  const contextoEvaluaciones = useContext(EvaluacionesContexto);

  // Estados locales de respaldo
  const [cursosLocales, setCursosLocales] = useState([]);
  const [cursoOrigenId, setCursoOrigenId] = useState(null);
  const [cursoOrigen, setCursoOrigen] = useState(null);
  const [modulosOrigen, setModulosOrigen] = useState([]);

  // Estados de carga y progreso
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [clonando, setClonando] = useState(false);

  // Estados del formulario para el nuevo curso
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '',
    centro: '',
    anyo: '',
    descripcion: ''
  });

  // Estado de errores de validación de los campos
  const [erroresValidacion, setErroresValidacion] = useState({});

  // Estado con el resultado del último clonado completado con éxito
  const [resultadoClonado, setResultadoClonado] = useState(null);

  // Lista activa de cursos ordenada de modo que el más reciente quede el primero
  const cursos = useMemo(() => {
    const lista = (contextoCursos?.datos && contextoCursos.datos.length > 0)
      ? contextoCursos.datos
      : cursosLocales;
    return ordenarCursosPorReciente(lista);
  }, [contextoCursos?.datos, cursosLocales]);

  // Se cargan los cursos directamente de Supabase para el estado local
  const cargarCursosLocales = useCallback(async () => {
    setCargandoCursos(true);
    try {
      const { data, error } = await obtenerCursosDisponibles();
      if (error) {
        mostrarError('Error al cargar cursos', error);
        setCursosLocales([]);
      } else {
        setCursosLocales(data || []);
      }
    } catch (err) {
      console.error('Error al obtener lista de cursos:', err);
      mostrarError('Error al consultar cursos', err.message);
    } finally {
      setCargandoCursos(false);
    }
  }, [mostrarError]);

  // Se ejecuta la carga inicial de cursos locales al montar
  useEffect(() => {
    cargarCursosLocales();
  }, [cargarCursosLocales]);

  // Se selecciona un curso de origen y se pre-rellenan de forma inteligente los campos del nuevo curso
  const seleccionarCursoOrigen = useCallback(
    async (idCurso) => {
      setCursoOrigenId(idCurso);
      setResultadoClonado(null);
      setErroresValidacion({});

      if (!idCurso) {
        setCursoOrigen(null);
        setModulosOrigen([]);
        setNuevoCurso({
          nombre: '',
          centro: '',
          anyo: '',
          descripcion: ''
        });
        return;
      }

      // Se localiza el objeto completo del curso origen seleccionado
      const cursoEncontrado = cursos.find((c) => c.id_curso === idCurso) || null;
      setCursoOrigen(cursoEncontrado);

      // Se calculan las sugerencias automáticas para el nuevo curso
      const anyoOriginal = cursoEncontrado?.anyo || '';
      const nombreOriginal = cursoEncontrado?.nombre || '';
      const centroOriginal = cursoEncontrado?.centro || '';
      const descripcionOriginal = cursoEncontrado?.descripcion || '';

      const nuevoAnyoCalculado = calcularSiguienteAnyo(anyoOriginal);
      const nuevoNombreSugerido = sugerirNombreNuevoCurso(nombreOriginal, anyoOriginal, nuevoAnyoCalculado);
      const nuevaDescripcionSugerida = sugerirDescripcionNuevoCurso(descripcionOriginal, anyoOriginal, nuevoAnyoCalculado);

      setNuevoCurso({
        nombre: nuevoNombreSugerido,
        centro: centroOriginal,
        anyo: nuevoAnyoCalculado,
        descripcion: nuevaDescripcionSugerida
      });

      // Se consultan los módulos asociados a este curso en imparte y Evaluaciones
      setCargandoModulos(true);
      try {
        const { data: modulos, error: errorModulos } = await obtenerModulosDeCurso(idCurso);
        if (errorModulos) {
          mostrarAdvertencia('Aviso sobre módulos', 'No se pudieron consultar los módulos del curso seleccionado.');
          setModulosOrigen([]);
        } else {
          setModulosOrigen(modulos || []);
          if ((modulos || []).length === 0) {
            mostrarInfo(
              'Curso sin módulos asociados',
              'El curso seleccionado no tiene módulos registrados en impartición ni evaluaciones previas.'
            );
          }
        }
      } catch (err) {
        console.error('Error al cargar módulos del curso origen:', err);
        setModulosOrigen([]);
      } finally {
        setCargandoModulos(false);
      }
    },
    [cursos, mostrarAdvertencia, mostrarInfo]
  );

  // Se actualiza un campo específico del formulario del nuevo curso y se limpia su error
  const actualizarCampoNuevoCurso = useCallback((campo, valor) => {
    setNuevoCurso((prev) => ({
      ...prev,
      [campo]: valor
    }));

    setErroresValidacion((prev) => {
      if (prev[campo]) {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      }
      return prev;
    });
  }, []);

  // Se validan los datos obligatorios del formulario antes de proceder con el clonado
  const validarFormulario = useCallback(() => {
    const errores = {};

    if (!cursoOrigenId) {
      errores.cursoOrigen = 'Debe seleccionar un curso de origen.';
    }

    if (!nuevoCurso.nombre || !nuevoCurso.nombre.trim()) {
      errores.nombre = 'El nombre del nuevo curso es obligatorio.';
    }

    if (!nuevoCurso.anyo || !nuevoCurso.anyo.trim()) {
      errores.anyo = 'El año académico es obligatorio (ej. 2026/2027).';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  }, [cursoOrigenId, nuevoCurso]);

  // Se ejecuta la transacción de clonación en Supabase y se actualizan los contextos globales
  const ejecutarClonado = useCallback(async () => {
    if (!validarFormulario()) {
      mostrarAdvertencia('Formulario incompleto', 'Por favor, revise los campos marcados en rojo.');
      return { exito: false, error: 'Formulario incompleto' };
    }

    setClonando(true);
    setResultadoClonado(null);

    try {
      const resultado = await clonarCurso(cursoOrigenId, nuevoCurso);

      if (!resultado.exito) {
        mostrarError('Error al clonar el curso', resultado.error);
        return resultado;
      }

      setResultadoClonado(resultado);
      mostrarExito(
        'Curso clonado con éxito',
        `Se ha creado "${resultado.cursoCreado.nombre}" con ${resultado.totalEvaluaciones} evaluaciones reglamentarias preparadas.`
      );

      // Se sincroniza el contexto global de Cursos para que aparezca de inmediato en todas las vistas de la app
      if (contextoCursos?.recargar) {
        await contextoCursos.recargar();
      }

      // Se sincroniza el contexto global de Evaluaciones
      if (contextoEvaluaciones?.recargar) {
        await contextoEvaluaciones.recargar();
      }

      // Se recarga la lista local de cursos
      await cargarCursosLocales();

      return resultado;
    } catch (err) {
      console.error('Error inesperado al ejecutar clonado:', err);
      mostrarError('Fallo en la operación', err.message || 'No se pudo completar la clonación.');
      return { exito: false, error: err.message };
    } finally {
      setClonando(false);
    }
  }, [
    validarFormulario,
    cursoOrigenId,
    nuevoCurso,
    mostrarAdvertencia,
    mostrarError,
    mostrarExito,
    contextoCursos,
    contextoEvaluaciones,
    cargarCursosLocales
  ]);

  // Se reinicia el formulario y la selección a su estado por defecto
  const reiniciarFormulario = useCallback(() => {
    setCursoOrigenId(null);
    setCursoOrigen(null);
    setModulosOrigen([]);
    setNuevoCurso({
      nombre: '',
      centro: '',
      anyo: '',
      descripcion: ''
    });
    setErroresValidacion({});
    setResultadoClonado(null);
  }, []);

  return {
    cursos,
    cursoOrigenId,
    cursoOrigen,
    modulosOrigen,
    cargandoCursos,
    cargandoModulos,
    clonando,
    nuevoCurso,
    erroresValidacion,
    resultadoClonado,
    evaluacionesReglamentarias: EVALUACIONES_REGLAMENTARIAS,
    cargarCursos: cargarCursosLocales,
    seleccionarCursoOrigen,
    actualizarCampoNuevoCurso,
    validarFormulario,
    ejecutarClonado,
    reiniciarFormulario
  };
};

export default useClonadoCurso;
