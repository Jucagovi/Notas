import React, { useState, useEffect, useMemo } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import ModalConfirmacion from '../components/common/ModalConfirmacion.jsx';
import FiltrosTaller from '../components/taller/FiltrosTaller.jsx';
import CatalogoPracticas from '../components/taller/CatalogoPracticas.jsx';
import PanelVersiones from '../components/taller/PanelVersiones.jsx';
import DialogoPractica from '../components/taller/DialogoPractica.jsx';
import DialogoVersion from '../components/taller/DialogoVersion.jsx';
import useTallerPracticas from '../hooks/useTallerPracticas.js';
import useModulos from '../hooks/useModulos.js';
import useCursos from '../hooks/useCursos.js';
import useEvaluaciones from '../hooks/useEvaluaciones.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import exportarPracticaPDF from '../utils/exportadorPracticaPdf.js';
import '../components/taller/taller.css';

/**
 * TallerPracticas - Página orquestadora del caso de uso 14 (Taller de Prácticas: Catálogo y Versiones).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y vistas para gestionar el catálogo
 * maestro de prácticas y el historial de versiones con editor enriquecido y exportación a PDF.
 */
export const TallerPracticas = () => {
  const { mostrarExito, mostrarError, mostrarInfo } = useGlobalToast();

  // Estados locales para filtros y búsquedas
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Estados locales para el control de modales
  const [modalPracticaVisible, setModalPracticaVisible] = useState(false);
  const [practicaEdicion, setPracticaEdicion] = useState(null);

  const [modalVersionVisible, setModalVersionVisible] = useState(false);
  const [versionEdicion, setVersionEdicion] = useState(null);

  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [elementoABorrar, setElementoABorrar] = useState(null); // { tipo: 'practica'|'version', id, titulo }

  const [exportandoPdf, setExportandoPdf] = useState(false);

  // Consulta de entidades complementarias de referencia
  const { datos: modulos, cargando: cargandoModulos } = useModulos();
  const { datos: cursos } = useCursos();
  const { datos: evaluaciones } = useEvaluaciones();

  // Se preselecciona el primer módulo disponible cuando se completa la carga inicial.
  useEffect(() => {
    if (!moduloSeleccionadoId && modulos && modulos.length > 0) {
      setModuloSeleccionadoId(modulos[0].id_modulo);
    }
  }, [modulos, moduloSeleccionadoId]);

  // Hook orquestador de la lógica de datos del taller de prácticas
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
      );
      const cursoAsociado = version.Cursos || cursos.find((c) => c.id_curso === version.id_curso);
      const utAsociada = version.Unidades_Trabajo || unidadesTrabajo.find((u) => u.id_ut === version.id_ut);
      const evaluacionAsociada = version.Evaluaciones || evaluaciones.find((e) => e.id_evaluacion === version.id_evaluacion);

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

      {/* Barra superior de filtrado por módulo y buscador */}
      <FiltrosTaller
        modulos={modulos}
        moduloSeleccionadoId={moduloSeleccionadoId}
        onCambioModulo={setModuloSeleccionadoId}
        cargandoModulos={cargandoModulos}
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

      {/* Modal para crear o editar práctica base */}
      <DialogoPractica
        visible={modalPracticaVisible}
        onHide={() => setModalPracticaVisible(false)}
        practica={practicaEdicion}
        idModuloPorDefecto={moduloSeleccionadoId}
        modulos={modulos}
        onGuardar={manejarGuardarPractica}
        guardando={guardando}
      />

      {/* Modal para crear o editar versión con editor enriquecido */}
      <DialogoVersion
        visible={modalVersionVisible}
        onHide={() => setModalVersionVisible(false)}
        version={versionEdicion}
        practica={practicaSeleccionada}
        cursos={cursos}
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
