import React, { useState, useEffect, useMemo } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import ModalConfirmacion from '../components/common/ModalConfirmacion.jsx';
import FiltrosTaller from '../components/taller/FiltrosTaller.jsx';
import CatalogoPracticas from '../components/taller/CatalogoPracticas.jsx';
import PanelVersiones from '../components/taller/PanelVersiones.jsx';
import DialogoPractica from '../components/taller/DialogoPractica.jsx';
import DialogoVersion from '../components/taller/DialogoVersion.jsx';
import ManualUsoTaller from '../components/taller/ManualUsoTaller.jsx';
import useTallerPracticas from '../hooks/useTallerPracticas.js';
import useModulos from '../hooks/useModulos.js';
import useCursos from '../hooks/useCursos.js';
import useEvaluaciones from '../hooks/useEvaluaciones.js';
import useImparte from '../hooks/useImparte.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import exportarPracticaPDF from '../utils/exportadorPracticaPdf.js';
import { extraerAnioInicioCurso } from '../utils/fechas.js';
import '../components/taller/taller.css';

/**
 * TallerPracticas - Página orquestadora del caso de uso 14 (Taller de Prácticas: Catálogo y Versiones).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y vistas para gestionar el catálogo
 * maestro de prácticas y el historial de versiones con editor enriquecido y exportación a PDF,
 * contextualizado por año académico y clase (donde cada clase encapsula su módulo profesional correspondiente).
 */
export const TallerPracticas = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useGlobalToast();

  // Estados locales para filtros por año lectivo, clase y buscador
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Estados locales para el control de modales
  const [modalPracticaVisible, setModalPracticaVisible] = useState(false);
  const [practicaEdicion, setPracticaEdicion] = useState(null);

  const [modalVersionVisible, setModalVersionVisible] = useState(false);
  const [versionEdicion, setVersionEdicion] = useState(null);

  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [elementoABorrar, setElementoABorrar] = useState(null); // { tipo: 'practica'|'version', id, titulo }

  const [exportandoPdf, setExportandoPdf] = useState(false);

  // Consulta de entidades maestras y relacionales para construir las clases y contextualizar el módulo
  const { datos: modulos, cargando: cargandoModulos } = useModulos();
  const { datos: cursos, cargando: cargandoCursos } = useCursos();
  const { datos: evaluaciones } = useEvaluaciones();
  const { datos: imparte } = useImparte();

  // Se calculan los años académicos únicos con formato completo visual YYYY/YYYY+1 (ej. 2026 -> "2026/2027").
  const opcionesAnios = useMemo(() => {
    const aniosRegistrados = new Set();
    const lista = [];

    (cursos || []).forEach((c) => {
      const anioInicio = extraerAnioInicioCurso(c);
      if (anioInicio && !aniosRegistrados.has(anioInicio)) {
        aniosRegistrados.add(anioInicio);
        lista.push({
          label: `${anioInicio}/${anioInicio + 1}`,
          value: anioInicio
        });
      }
    });

    lista.sort((a, b) => b.value - a.value);

    // En caso de que no existan cursos dados de alta todavía, se provee el año escolar actual como respaldo.
    if (lista.length === 0) {
      const hoy = new Date();
      const anioBase = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
      lista.push(
        { label: `${anioBase}/${anioBase + 1}`, value: anioBase },
        { label: `${anioBase + 1}/${anioBase + 2}`, value: anioBase + 1 }
      );
    }

    return lista;
  }, [cursos]);

  // Se preselecciona el primer año académico disponible si no hay ninguno activo.
  useEffect(() => {
    if (!anioSeleccionado && opcionesAnios.length > 0) {
      setAnioSeleccionado(opcionesAnios[0].value);
    }
  }, [opcionesAnios, anioSeleccionado]);

  // Mapa asociativo id_curso -> id_modulo derivado de las tablas Evaluaciones e imparte
  const mapaCursosModulos = useMemo(() => {
    const mapa = new Map();
    (evaluaciones || []).forEach((ev) => {
      if (ev.id_curso && ev.id_modulo && !mapa.has(ev.id_curso)) {
        mapa.set(ev.id_curso, ev.id_modulo);
      }
    });
    (imparte || []).forEach((imp) => {
      if (imp.id_curso && imp.id_modulo && !mapa.has(imp.id_curso)) {
        mapa.set(imp.id_curso, imp.id_modulo);
      }
    });
    return mapa;
  }, [evaluaciones, imparte]);

  // Lista de clases filtradas que pertenecen estrictamente al año académico seleccionado
  const clasesDelAnio = useMemo(() => {
    if (!cursos || cursos.length === 0) return [];

    return (cursos || [])
      .filter((c) => {
        if (!anioSeleccionado) return true;
        return extraerAnioInicioCurso(c) === anioSeleccionado;
      })
      .map((c) => {
        const idModulo = mapaCursosModulos.get(c.id_curso) || null;
        const moduloObj = (modulos || []).find((m) => m.id_modulo === idModulo) || null;
        const siglaModulo = moduloObj?.siglas || '';
        const nombreModulo = moduloObj?.nombre || '';

        return {
          id: c.id_curso,
          id_curso: c.id_curso,
          id_modulo: idModulo,
          moduloObj: moduloObj,
          cursoNombre: c.nombre,
          cursoAnyo: c.anyo,
          cursoCentro: c.centro,
          moduloSiglas: siglaModulo,
          moduloNombre: nombreModulo,
          etiqueta: `${c.nombre} (${c.anyo || ''})${siglaModulo ? ` — ${siglaModulo}: ` : ' — '}${nombreModulo || 'Sin módulo'}`
        };
      });
  }, [cursos, anioSeleccionado, mapaCursosModulos, modulos]);

  // Sincronización automática de la clase activa al cambiar de año escolar o actualizar clases.
  useEffect(() => {
    if (clasesDelAnio.length > 0) {
      const existe = clasesDelAnio.some((c) => c.id_curso === claseSeleccionadaId);
      if (!existe) {
        setClaseSeleccionadaId(clasesDelAnio[0].id_curso);
      }
    } else {
      setClaseSeleccionadaId(null);
    }
  }, [clasesDelAnio, claseSeleccionadaId]);

  // Detección de la clase activa y su módulo curricular correspondiente
  const claseActiva = useMemo(() => {
    if (!claseSeleccionadaId) return null;
    return clasesDelAnio.find((c) => c.id_curso === claseSeleccionadaId) || null;
  }, [clasesDelAnio, claseSeleccionadaId]);

  const moduloSeleccionadoId = claseActiva?.id_modulo || null;
  const moduloActivo = claseActiva?.moduloObj || (modulos || []).find((m) => m.id_modulo === moduloSeleccionadoId) || null;

  // Hook orquestador de la lógica de datos del taller de prácticas conectado al módulo de la clase activa
  const {
    practicas,
    cargandoPracticas,
    practicaSeleccionada,
    seleccionarPractica,
    versiones,
    cargandoVersiones,
    unidadesTrabajo,
    guardando,
    crearPractica,
    actualizarPractica,
    eliminarPractica,
    crearVersion,
    actualizarVersion,
    clonarVersion,
    eliminarVersion
  } = useTallerPracticas(moduloSeleccionadoId);

  // Filtrado en memoria de las prácticas según el término de búsqueda introducido
  const practicasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return practicas;
    const busqueda = terminoBusqueda.toLowerCase();
    return practicas.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(busqueda)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(busqueda)) ||
        (p.id_tipopractica && p.id_tipopractica.toLowerCase().includes(busqueda))
    );
  }, [practicas, terminoBusqueda]);

  // Manejadores para el diálogo de práctica maestra
  const manejarAbrirNuevaPractica = () => {
    setPracticaEdicion(null);
    setModalPracticaVisible(true);
  };

  const manejarAbrirEditarPractica = (practica) => {
    setPracticaEdicion(practica);
    setModalPracticaVisible(true);
  };

  const manejarGuardarPractica = async (datos) => {
    if (practicaEdicion) {
      const { error } = await actualizarPractica(practicaEdicion.id_practica, datos);
      if (error) {
        mostrarError(error.error || 'No se pudo actualizar la práctica.');
        return false;
      }
      mostrarExito('Práctica actualizada correctamente.');
      return true;
    } else {
      const { error } = await crearPractica(datos);
      if (error) {
        mostrarError(error.error || 'No se pudo crear la nueva práctica.');
        return false;
      }
      mostrarExito('Nueva práctica registrada en el catálogo.');
      return true;
    }
  };

  // Manejadores para el diálogo de versiones
  const manejarAbrirNuevaVersion = () => {
    if (!practicaSeleccionada) {
      mostrarInfo('Seleccione previamente una práctica para crearle una versión.');
      return;
    }
    setVersionEdicion(null);
    setModalVersionVisible(true);
  };

  const manejarAbrirEditarVersion = (version) => {
    setVersionEdicion(version);
    setModalVersionVisible(true);
  };

  const manejarGuardarVersion = async (datos) => {
    if (versionEdicion) {
      const { error } = await actualizarVersion(versionEdicion.id_version, datos);
      if (error) {
        mostrarError(error.error || 'No se pudo actualizar la versión.');
        return false;
      }
      mostrarExito('Versión de práctica actualizada correctamente.');
      return true;
    } else {
      const { error } = await crearVersion(datos);
      if (error) {
        mostrarError(error.error || 'No se pudo crear la nueva versión.');
        return false;
      }
      mostrarExito('Nueva versión registrada con éxito.');
      return true;
    }
  };

  // Clonación instantánea de una versión
  const manejarClonarVersion = async (version) => {
    const { error } = await clonarVersion(version);
    if (error) {
      mostrarError(error.error || 'No se ha podido clonar la versión.');
    } else {
      mostrarExito(`Versión ${version.numero || ''} clonada satisfactoriamente.`);
    }
  };

  // Exportación del enunciado maquetado a formato PDF
  const manejarExportarPdf = async (version) => {
    if (!practicaSeleccionada || !version) return;

    setExportandoPdf(true);
    try {
      const moduloAsociado = modulos.find(
        (m) => m.id_modulo === practicaSeleccionada.id_modulo
      ) || moduloActivo;
      const cursoAsociado = version.Cursos || (cursos || []).find((c) => c.id_curso === version.id_curso) || claseActiva;
      const utAsociada = version.Unidades_Trabajo || unidadesTrabajo.find((u) => u.id_ut === version.id_ut);
      const evaluacionAsociada = version.Evaluaciones || (evaluaciones || []).find((e) => e.id_evaluacion === version.id_evaluacion);

      await exportarPracticaPDF({
        practica: practicaSeleccionada,
        version: version,
        modulo: moduloAsociado,
        curso: cursoAsociado,
        unidadTrabajo: utAsociada,
        evaluacion: evaluacionAsociada
      });

      mostrarExito('El documento PDF se ha generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al exportar versión a PDF:', err);
      mostrarError('Ocurrió un error al generar el documento PDF.');
    } finally {
      setExportandoPdf(false);
    }
  };

  // Solicitud de confirmación de borrado
  const manejarPedirBorrarPractica = (practica) => {
    setElementoABorrar({
      tipo: 'practica',
      id: practica.id_practica,
      titulo: practica.nombre
    });
    setModalConfirmacionVisible(true);
  };

  const manejarPedirBorrarVersion = (version) => {
    setElementoABorrar({
      tipo: 'version',
      id: version.id_version,
      titulo: version.numero || 'versión'
    });
    setModalConfirmacionVisible(true);
  };

  // Confirmación efectiva de la eliminación
  const manejarConfirmarBorrado = async () => {
    if (!elementoABorrar) return;

    if (elementoABorrar.tipo === 'practica') {
      const exito = await eliminarPractica(elementoABorrar.id);
      if (exito) {
        mostrarExito(`Práctica "${elementoABorrar.titulo}" eliminada.`);
      } else {
        mostrarError('No se pudo eliminar la práctica.');
      }
    } else if (elementoABorrar.tipo === 'version') {
      const exito = await eliminarVersion(elementoABorrar.id);
      if (exito) {
        mostrarExito(`Versión "${elementoABorrar.titulo}" eliminada.`);
      } else {
        mostrarError('No se pudo eliminar la versión.');
      }
    }

    setModalConfirmacionVisible(false);
    setElementoABorrar(null);
  };

  return (
    <div className="flex flex-column w-full pb-4">
      {/* Cabecera estándar de la página */}
      <HeaderPagina
        titulo="Taller de Prácticas"
        descripcion="Repositorio histórico de prácticas y banco de enunciados con control de versiones y exportación a PDF."
      />

      {/* Barra superior de filtrado por año académico, clase y buscador */}
      <FiltrosTaller
        anios={opcionesAnios}
        anioSeleccionado={anioSeleccionado}
        onCambioAnio={setAnioSeleccionado}
        clases={clasesDelAnio}
        claseSeleccionadaId={claseSeleccionadaId}
        onCambioClase={setClaseSeleccionadaId}
        cargandoClases={cargandoCursos || cargandoModulos}
        terminoBusqueda={terminoBusqueda}
        onCambioBusqueda={setTerminoBusqueda}
        totalPracticas={practicasFiltradas.length}
        totalVersiones={versiones.length}
      />

      {/* Diseño de dos columnas maestro-detalle */}
      <div className="grid">
        {/* Columna Izquierda: Catálogo Maestro de Prácticas */}
        <div className="col-12 lg:col-5">
          <CatalogoPracticas
            practicas={practicasFiltradas}
            practicaSeleccionada={practicaSeleccionada}
            onSeleccionarPractica={seleccionarPractica}
            onNuevaPractica={manejarAbrirNuevaPractica}
            onEditarPractica={manejarAbrirEditarPractica}
            onEliminarPractica={manejarPedirBorrarPractica}
            cargando={cargandoPracticas}
          />
        </div>

        {/* Columna Derecha: Panel de Versiones y Detalle */}
        <div className="col-12 lg:col-7">
          <PanelVersiones
            practicaSeleccionada={practicaSeleccionada}
            versiones={versiones}
            onCrearVersion={manejarAbrirNuevaVersion}
            onEditarVersion={manejarAbrirEditarVersion}
            onClonarVersion={manejarClonarVersion}
            onExportarPdf={manejarExportarPdf}
            onEliminarVersion={manejarPedirBorrarVersion}
            cargando={cargandoVersiones}
            exportandoPdf={exportandoPdf}
          />
        </div>
      </div>

      {/* Manual explicativo sobre el uso del Taller de Prácticas que ocupa todo el ancho de la página */}
      <ManualUsoTaller />

      {/* Modal para crear o editar práctica base (el módulo se conoce automáticamente a partir de la clase) */}
      <DialogoPractica
        visible={modalPracticaVisible}
        onHide={() => setModalPracticaVisible(false)}
        practica={practicaEdicion}
        idModuloPorDefecto={moduloSeleccionadoId}
        moduloActual={moduloActivo}
        modulos={modulos}
        onGuardar={manejarGuardarPractica}
        guardando={guardando}
      />

      {/* Modal para crear o editar versión con editor enriquecido y datos contextuales de la clase */}
      <DialogoVersion
        visible={modalVersionVisible}
        onHide={() => setModalVersionVisible(false)}
        version={versionEdicion}
        practica={practicaSeleccionada}
        claseActiva={claseActiva}
        moduloActivo={moduloActivo}
        anioAcademicoNombre={anioSeleccionado ? `${anioSeleccionado}/${anioSeleccionado + 1}` : ''}
        unidadesTrabajo={unidadesTrabajo}
        evaluaciones={evaluaciones}
        onGuardar={manejarGuardarVersion}
        guardando={guardando}
      />

      {/* Modal de confirmación para eliminaciones críticas */}
      <ModalConfirmacion
        visible={modalConfirmacionVisible}
        onHide={() => {
          setModalConfirmacionVisible(false);
          setElementoABorrar(null);
        }}
        onAceptar={manejarConfirmarBorrado}
        header="Confirmar Eliminación"
        message={
          elementoABorrar?.tipo === 'practica'
            ? `¿Estás seguro de que deseas eliminar la práctica "${elementoABorrar?.titulo}" y todo su historial de versiones? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que deseas eliminar la versión "${elementoABorrar?.titulo}"? Esta acción es irreversible.`
        }
      />
    </div>
  );
};

export default TallerPracticas;

