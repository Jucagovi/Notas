import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.js';
import useCursos from './useCursos.js';
import useGlobalToast from './useGlobalToast.js';

// Calcula inteligentemente el siguiente año lectivo a partir de un curso previo (ej. 2024/2025 -> 2025/2026)
const calcularSiguienteAnyo = (anyoActual) => {
  if (!anyoActual) return '';
  const coincidencias = anyoActual.match(/(\d{4})\s*[/ -]\s*(\d{4})/);
  if (coincidencias) {
    const inicio = parseInt(coincidencias[1], 10) + 1;
    const fin = parseInt(coincidencias[2], 10) + 1;
    return `${inicio}/${fin}`;
  }
  return anyoActual;
};

// Hook para gestionar la replicación de cursos académicos y su estructura curricular base
const useClonadoCurso = () => {
  const { datos: cursos, cargando: cargandoCursos } = useCursos();
  const [cursoOrigenId, setCursoOrigenId] = useState(null);
  const [modulosOrigen, setModulosOrigen] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);
  const [clonando, setClonando] = useState(false);

  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '',
    centro: '',
    anyo: '',
    descripcion: ''
  });

  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Al seleccionar el curso de origen, se consultan sus módulos vinculados y se sugiere el nuevo año
  useEffect(() => {
    if (!cursoOrigenId) {
      setModulosOrigen([]);
      return;
    }

    const cargarModulosOrigen = async () => {
      setCargandoModulos(true);
      try {
        const cursoSeleccionado = cursos.find((c) => c.id_curso === cursoOrigenId);
        if (cursoSeleccionado) {
          const siguienteAnyo = calcularSiguienteAnyo(cursoSeleccionado.anyo);
          setNuevoCurso({
            nombre: `${cursoSeleccionado.nombre} (${siguienteAnyo})`,
            centro: cursoSeleccionado.centro || '',
            anyo: siguienteAnyo,
            descripcion: `Clonado a partir de ${cursoSeleccionado.nombre}`
          });
        }

        // Se obtienen los módulos asociados a través de las evaluaciones o imparte del curso
        const { data: evaluaciones, error } = await supabase
          .from('Evaluaciones')
          .select('id_modulo, Modulos ( id_modulo, nombre, siglas )')
          .eq('id_curso', cursoOrigenId);

        if (error) throw error;

        // Se deduplican los módulos encontrados
        const mapaModulos = new Map();
        (evaluaciones || []).forEach((ev) => {
          if (ev.Modulos && !mapaModulos.has(ev.Modulos.id_modulo)) {
            mapaModulos.set(ev.Modulos.id_modulo, ev.Modulos);
          }
        });

        // Si no hubiera evaluaciones registradas, se buscan en imparte
        if (mapaModulos.size === 0) {
          const { data: imparten } = await supabase
            .from('imparte')
            .select('id_modulo, Modulos ( id_modulo, nombre, siglas )')
            .eq('id_curso', cursoOrigenId);

          (imparten || []).forEach((imp) => {
            if (imp.Modulos && !mapaModulos.has(imp.Modulos.id_modulo)) {
              mapaModulos.set(imp.Modulos.id_modulo, imp.Modulos);
            }
          });
        }

        setModulosOrigen(Array.from(mapaModulos.values()));
      } catch (err) {
        console.error('Error al cargar la estructura del curso origen:', err);
        mostrarError('No se pudo obtener la estructura de módulos del curso origen.');
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulosOrigen();
  }, [cursoOrigenId, cursos, mostrarError]);

  // Actualiza un campo del formulario de nuevo curso
  const actualizarCampoNuevoCurso = (campo, valor) => {
    setNuevoCurso((prev) => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Ejecuta el procedimiento completo de clonación del curso y su estructura
  const ejecutarClonado = useCallback(async () => {
    if (!cursoOrigenId) {
      mostrarAdvertencia('Debe seleccionar un curso de origen para clonar.', 'Atención');
      return false;
    }

    if (!nuevoCurso.nombre.trim() || !nuevoCurso.centro.trim() || !nuevoCurso.anyo.trim()) {
      mostrarAdvertencia('Los campos Nombre, Centro y Año son obligatorios.', 'Formulario incompleto');
      return false;
    }

    setClonando(true);
    try {
      // Paso 1: Creación del nuevo registro en la tabla Cursos
      const { data: cursoCreado, error: errorCurso } = await supabase
        .from('Cursos')
        .insert({
          nombre: nuevoCurso.nombre.trim(),
          centro: nuevoCurso.centro.trim(),
          anyo: nuevoCurso.anyo.trim(),
          descripcion: nuevoCurso.descripcion?.trim() || null
        })
        .select()
        .single();

      if (errorCurso) throw errorCurso;

      const nuevoCursoId = cursoCreado.id_curso;

      // Paso 2: Replicación de evaluaciones estándar para cada módulo asociado
      const convocatorias = ['Primera', 'Segunda', 'Final', 'Extraordinaria'];
      const nuevasEvaluaciones = [];

      modulosOrigen.forEach((mod) => {
        convocatorias.forEach((convocatoria) => {
          nuevasEvaluaciones.push({
            id_curso: nuevoCursoId,
            id_modulo: mod.id_modulo,
            nombre: convocatoria,
            descripcion: `Evaluación ${convocatoria} - ${mod.siglas || mod.nombre}`
          });
        });
      });

      if (nuevasEvaluaciones.length > 0) {
        const { error: errorEvaluaciones } = await supabase
          .from('Evaluaciones')
          .insert(nuevasEvaluaciones);

        if (errorEvaluaciones) {
          console.warn('Advertencia al crear evaluaciones:', errorEvaluaciones);
        }
      }

      // Paso 3: Replicación de ponderaciones ra_curso
      const { data: raPesos } = await supabase
        .from('ra_curso')
        .select('id_ra, peso')
        .eq('id_curso', cursoOrigenId);

      if (raPesos && raPesos.length > 0) {
        const nuevosRaPesos = raPesos.map((r) => ({
          id_curso: nuevoCursoId,
          id_ra: r.id_ra,
          peso: r.peso
        }));
        await supabase.from('ra_curso').insert(nuevosRaPesos);
      }

      // Paso 4: Replicación de ponderaciones ce_curso
      const { data: cePesos } = await supabase
        .from('ce_curso')
        .select('id_ce, peso')
        .eq('id_curso', cursoOrigenId);

      if (cePesos && cePesos.length > 0) {
        const nuevosCePesos = cePesos.map((c) => ({
          id_curso: nuevoCursoId,
          id_ce: c.id_ce,
          peso: c.peso
        }));
        await supabase.from('ce_curso').insert(nuevosCePesos);
      }

      mostrarExito(
        `Se ha clonado el curso "${nuevoCurso.nombre}" y se han generado sus evaluaciones base.`,
        'Clonación exitosa'
      );

      // Limpieza del formulario
      setCursoOrigenId(null);
      setNuevoCurso({ nombre: '', centro: '', anyo: '', descripcion: '' });
      return true;
    } catch (err) {
      console.error('Error al clonar el curso:', err);
      mostrarError('Ocurrió un error al persistir el nuevo curso en la base de datos.', 'Error de clonación');
      return false;
    } finally {
      setClonando(false);
    }
  }, [cursoOrigenId, nuevoCurso, modulosOrigen, mostrarExito, mostrarError, mostrarAdvertencia]);

  return {
    cursos,
    cargandoCursos,
    cursoOrigenId,
    setCursoOrigenId,
    modulosOrigen,
    cargandoModulos,
    clonando,
    nuevoCurso,
    actualizarCampoNuevoCurso,
    ejecutarClonado
  };
};

export default useClonadoCurso;
