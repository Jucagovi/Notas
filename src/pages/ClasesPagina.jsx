import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ModalConfirmacion from '../components/common/ModalConfirmacion.jsx';
import useCursos from '../hooks/useCursos.js';
import useCiclos from '../hooks/useCiclos.js';
import useModulos from '../hooks/useModulos.js';
import useDiscentes from '../hooks/useDiscentes.js';
import useImparte from '../hooks/useImparte.js';
import useEvaluaciones from '../hooks/useEvaluaciones.js';
import useConfiguracionCurso from '../hooks/useConfiguracionCurso.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import CabeceraClases from '../components/clases/CabeceraClases.jsx';
import CrearClaseStepper from '../components/clases/CrearClaseStepper.jsx';
import ModificarClasePanel from '../components/clases/ModificarClasePanel.jsx';
import EliminarClasePanel from '../components/clases/EliminarClasePanel.jsx';

// Página orquestadora para la administración de clases (creación, modificación y borrado).
const ClasesPagina = () => {
  const [searchParams] = useSearchParams();
  const pestanyaActiva = searchParams.get('pestanya') || 'crear';

  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Custom Hooks para la carga de datos maestros y relacionales.
  const cursos = useCursos();
  const ciclos = useCiclos();
  const modulos = useModulos();
  const discentes = useDiscentes();
  const imparte = useImparte();
  const evaluaciones = useEvaluaciones();

  // Hook específico para orquestar la lógica de creación y borrado en cascada.
  const {
    cargando: procesandoConfiguracion,
    generarCursoCompleto,
    eliminarCurso,
    actualizarMatriculaClase
  } = useConfiguracionCurso();

  // Estados locales para la sección de modificación de matrículas.
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [discentesDisponibles, setDiscentesDisponibles] = useState([]);
  const [discentesMatriculados, setDiscentesMatriculados] = useState([]);

  // Estado local para la sección de eliminación de cursos.
  const [cursoEliminarId, setCursoEliminarId] = useState(null);

  // Listado consolidado de clases existentes formado por el binomio Curso y Módulo.
  const clasesDisponibles = useMemo(() => {
    const mapaClases = new Map();

    // Se identifican las clases a partir de matrículas existentes en imparte.
    (imparte.datos || []).forEach((imp) => {
      const clave = `${imp.id_curso}_${imp.id_modulo}`;
      if (!mapaClases.has(clave)) {
        const c = cursos.datos.find((item) => item.id_curso === imp.id_curso);
        const m = modulos.datos.find((item) => item.id_modulo === imp.id_modulo);
        if (c && m) {
          mapaClases.set(clave, {
            id: clave,
            id_curso: imp.id_curso,
            id_modulo: imp.id_modulo,
            cursoNombre: c.nombre,
            cursoAnyo: c.anyo,
            cursoCentro: c.centro,
            moduloNombre: m.nombre,
            moduloSiglas: m.siglas,
            etiqueta: `${c.nombre} (${c.anyo}) — ${m.siglas}: ${m.nombre}`
          });
        }
      }
    });

    // Se incorporan clases que tengan evaluaciones generadas aunque aún no tengan matrículas.
    (evaluaciones.datos || []).forEach((ev) => {
      const clave = `${ev.id_curso}_${ev.id_modulo}`;
      if (!mapaClases.has(clave)) {
        const c = cursos.datos.find((item) => item.id_curso === ev.id_curso);
        const m = modulos.datos.find((item) => item.id_modulo === ev.id_modulo);
        if (c && m) {
          mapaClases.set(clave, {
            id: clave,
            id_curso: ev.id_curso,
            id_modulo: ev.id_modulo,
            cursoNombre: c.nombre,
            cursoAnyo: c.anyo,
            cursoCentro: c.centro,
            moduloNombre: m.nombre,
            moduloSiglas: m.siglas,
            etiqueta: `${c.nombre} (${c.anyo}) — ${m.siglas}: ${m.nombre}`
          });
        }
      }
    });

    return Array.from(mapaClases.values());
  }, [imparte.datos, evaluaciones.datos, cursos.datos, modulos.datos]);

  // Actualización de las listas de alumnos matriculados y disponibles al seleccionar una clase.
  useEffect(() => {
    if (!claseSeleccionadaId) {
      setDiscentesDisponibles([]);
      setDiscentesMatriculados([]);
      return;
    }

    const claseActual = clasesDisponibles.find((c) => c.id === claseSeleccionadaId);
    if (!claseActual) return;

    // Obtener IDs de alumnos matriculados en esta clase específica.
    const idsMatriculados = new Set(
      (imparte.datos || [])
        .filter((imp) => imp.id_curso === claseActual.id_curso && imp.id_modulo === claseActual.id_modulo)
        .map((imp) => imp.id_discente)
    );

    const matriculados = [];
    const disponibles = [];

    (discentes.datos || []).forEach((disc) => {
      if (disc.activo !== false) {
        if (idsMatriculados.has(disc.id_discente)) {
          matriculados.push(disc);
        } else {
          disponibles.push(disc);
        }
      }
    });

    setDiscentesMatriculados(matriculados);
    setDiscentesDisponibles(disponibles);
  }, [claseSeleccionadaId, clasesDisponibles, imparte.datos, discentes.datos]);

  // Manejador para el movimiento de elementos en el PickList.
  const manejarCambioPickList = (evento) => {
    setDiscentesDisponibles(evento.source);
    setDiscentesMatriculados(evento.target);
  };

  // Creación de un nuevo curso académico desde el formulario.
  const manejarGuardarNuevoCurso = async (datosCurso) => {
    const res = await cursos.crear(datosCurso);
    if (res && res.length > 0) {
      mostrarExito(`Curso "${datosCurso.nombre}" registrado con éxito.`);
      await cursos.recargar();
      return res[0];
    } else {
      mostrarError('No se ha podido registrar el nuevo curso académico.');
      return null;
    }
  };

  // Guardado de la clase completa con orquestación de inserciones en cascada.
  const manejarGuardarClaseCompleta = async (datosConfiguracion) => {
    const res = await generarCursoCompleto(datosConfiguracion);
    if (res && res.exito) {
      mostrarExito('¡Clase configurada con éxito! Se han registrado las evaluaciones y matriculaciones.');
      await Promise.all([
        cursos.recargar(),
        imparte.recargar(),
        evaluaciones.recargar()
      ]);
      return true;
    } else {
      mostrarError(res?.error || 'Se ha producido un error al generar la clase.');
      return false;
    }
  };

  // Guardado de modificaciones de matrícula mediante el PickList.
  const manejarGuardarCambiosMatricula = async () => {
    if (!claseSeleccionadaId) return;
    const claseActual = clasesDisponibles.find((c) => c.id === claseSeleccionadaId);
    if (!claseActual) return;

    const idsMatriculadosFinales = discentesMatriculados.map((d) => d.id_discente);
    const res = await actualizarMatriculaClase(
      claseActual.id_curso,
      claseActual.id_modulo,
      idsMatriculadosFinales
    );

    if (res && res.exito) {
      mostrarExito(`Matrícula actualizada: ${res.insertados} altas y ${res.eliminados} bajas.`);
      await imparte.recargar();
    } else {
      mostrarError(res?.error || 'No se pudieron actualizar los registros de matrícula.');
    }
  };

  // Eliminación completa de un curso y purga en cascada de sus relaciones.
  const manejarEliminarCurso = async (idCurso) => {
    const res = await eliminarCurso(idCurso);
    if (res && res.exito) {
      mostrarExito('El curso y todos sus datos vinculados han sido eliminados correctamente.');
      setCursoEliminarId(null);
      await Promise.all([
        cursos.recargar(),
        imparte.recargar(),
        evaluaciones.recargar()
      ]);
    } else {
      mostrarError(res?.error || 'Error al eliminar el curso y sus tablas dependientes.');
    }
  };

  return (
    <div className="flex flex-column w-full pb-6">
      {/* 1. Cabecera informativa */}
      <CabeceraClases pestanyaActiva={pestanyaActiva} />

      {/* 2. Vista de Creación de Clase (Asistente Stepper de 6 pasos) */}
      {pestanyaActiva === 'crear' && (
        <CrearClaseStepper
          cursos={cursos.datos}
          ciclos={ciclos.datos}
          modulos={modulos.datos}
          discentes={discentes.datos}
          cargando={procesandoConfiguracion || cursos.cargando}
          onGuardarNuevoCurso={manejarGuardarNuevoCurso}
          onGuardarClaseCompleta={manejarGuardarClaseCompleta}
          mostrarAviso={mostrarAdvertencia}
        />
      )}

      {/* 3. Vista de Modificación de Clase (Gestión de matrículas con PickList) */}
      {pestanyaActiva === 'modificar' && (
        <ModificarClasePanel
          clases={clasesDisponibles}
          claseSeleccionadaId={claseSeleccionadaId}
          onSeleccionarClaseId={setClaseSeleccionadaId}
          discentesDisponibles={discentesDisponibles}
          discentesMatriculados={discentesMatriculados}
          onCambiarPickList={manejarCambioPickList}
          guardando={procesandoConfiguracion}
          onGuardarCambios={manejarGuardarCambiosMatricula}
        />
      )}

      {/* 4. Vista de Eliminación de Clase (Borrado seguro en cascada) */}
      {pestanyaActiva === 'eliminar' && (
        <EliminarClasePanel
          cursos={cursos.datos}
          cursoSeleccionadoId={cursoEliminarId}
          onSeleccionarCursoId={setCursoEliminarId}
          eliminando={procesandoConfiguracion}
          onEliminarCurso={manejarEliminarCurso}
        />
      )}

      {/* Componente global de confirmación modal estandarizado */}
      <ModalConfirmacion />
    </div>
  );
};

export default ClasesPagina;
