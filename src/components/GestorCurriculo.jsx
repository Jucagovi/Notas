import React from 'react';
import { confirmarBorrado } from './common/ModalConfirmacion.jsx';
import useGlobalToast from '../hooks/useGlobalToast.js';
import TablaUnidadesTrabajo from './unidades/TablaUnidadesTrabajo.jsx';
import TablaVersiones from './unidades/TablaVersiones.jsx';
import DialogoUnidadTrabajo from './unidades/DialogoUnidadTrabajo.jsx';
import { formatearNumeroUT } from '../utils/formatoUT.js';
import './unidades/unidades.css';

/**
 * GestorCurriculo - Componente orquestador visual para el gestor de Unidades de Trabajo y Versiones.
 *
 * Responsabilidad Única: Coordinar la vista de dos columnas simultáneas (listado tabular de UTs
 * y listado tabular de Versiones con asignación directa mediante clic en números de UT),
 * gestionando las confirmaciones de borrado y los diálogos modales.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades didácticas con sus actividades.
 * @param {Array<Object>} props.versiones - Lista completa de versiones para la clase.
 * @param {number} props.siguienteNumeroUT - Siguiente número sugerido para nuevas unidades.
 * @param {boolean} [props.cargando=false] - Indicador de carga general.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 * @param {Function} props.onCrearUT - Callback para crear una unidad didáctica.
 * @param {Function} props.onActualizarUT - Callback para actualizar una unidad didáctica.
 * @param {Function} props.onEliminarUT - Callback para eliminar una unidad didáctica.
 * @param {Function} props.onAsignarActividad - Callback para cambiar la asignación de una actividad.
 * @param {Function} props.onDesvincularActividad - Callback para desvincular una actividad.
 * @param {boolean} props.dialogoVisible - Estado de apertura del diálogo de formulario.
 * @param {Object|null} props.unidadEdicion - Unidad didáctica seleccionada para edición.
 * @param {Function} props.onAbrirCrear - Callback para abrir el diálogo en modo creación.
 * @param {Function} props.onAbrirEditar - Callback para abrir el diálogo en modo edición.
 * @param {Function} props.onCerrarDialogo - Callback para cerrar el diálogo.
 */
const GestorCurriculo = ({
  unidades = [],
  versiones = [],
  siguienteNumeroUT = 1,
  cargando = false,
  guardando = false,
  onCrearUT,
  onActualizarUT,
  onEliminarUT,
  onAsignarActividad,
  onDesvincularActividad,
  dialogoVisible = false,
  unidadEdicion = null,
  onAbrirCrear,
  onAbrirEditar,
  onCerrarDialogo
}) => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Manejador para solicitar confirmación de borrado con ModalConfirmacion.
  const manejarConfirmarBorrado = (unidad) => {
    const etiquetaUT = formatearNumeroUT(unidad.numero);
    confirmarBorrado({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar la unidad "${etiquetaUT}: ${unidad.nombre}"? Las actividades asociadas quedarán sin asignar sin perderse.`,
      acceptLabel: 'Eliminar Unidad',
      rejectLabel: 'Cancelar',
      onAceptar: async () => {
        const exito = await onEliminarUT(unidad.id_ut);
        if (exito) {
          mostrarExito(`Unidad "${etiquetaUT}" eliminada correctamente.`);
        } else {
          mostrarError('No se pudo eliminar la unidad de trabajo.');
        }
      }
    });
  };

  // Manejador del guardado del formulario modal.
  const manejarGuardarDialogo = async (datosFormulario) => {
    if (unidadEdicion) {
      const exito = await onActualizarUT(unidadEdicion.id_ut, datosFormulario);
      if (exito) {
        mostrarExito(`Unidad "${datosFormulario.nombre}" actualizada con éxito.`);
        onCerrarDialogo();
      } else {
        mostrarError('Error al actualizar la unidad de trabajo.');
      }
    } else {
      const resultado = await onCrearUT(datosFormulario);
      if (resultado) {
        mostrarExito(`Unidad "${datosFormulario.nombre}" creada con éxito.`);
        onCerrarDialogo();
      } else {
        mostrarError('Error al crear la unidad de trabajo.');
      }
    }
  };

  return (
    <div className="w-full">
      {/* Contenedor de dos columnas fijas y responsivas sin uso de Swapy */}
      <div className="curriculo-dos-columnas">
        {/* Columna Izquierda: Listado tabular de Unidades de Trabajo */}
        <section className="curriculo-columna">
          <TablaUnidadesTrabajo
            unidades={unidades}
            cargando={cargando}
            onEditar={onAbrirEditar}
            onEliminar={manejarConfirmarBorrado}
            onNuevaUT={onAbrirCrear}
            onDesvincularPractica={onDesvincularActividad}
          />
        </section>

        {/* Columna Derecha: Listado tabular de Versiones con adición directa por número de UT */}
        <section className="curriculo-columna">
          <TablaVersiones
            versiones={versiones}
            unidades={unidades}
            cargando={cargando}
            onAsignarUT={onAsignarActividad}
            onDesvincular={onDesvincularActividad}
          />
        </section>
      </div>

      {/* Diálogo modal para la creación y edición de Unidades de Trabajo */}
      <DialogoUnidadTrabajo
        visible={dialogoVisible}
        unidad={unidadEdicion}
        siguienteNumero={siguienteNumeroUT}
        guardando={guardando}
        onGuardar={manejarGuardarDialogo}
        onOcultar={onCerrarDialogo}
      />
    </div>
  );
};

export default GestorCurriculo;
