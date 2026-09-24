import React, { useRef, useEffect, useMemo, useState } from 'react';
import { createSwapy } from 'swapy';
import { confirmarBorrado } from './common/ModalConfirmacion.jsx';
import useGlobalToast from '../hooks/useGlobalToast.js';
import ZonaCurricularUTs from './unidades/ZonaCurricularUTs.jsx';
import PanelActividadesHuerfanas from './unidades/PanelActividadesHuerfanas.jsx';
import TablaUnidadesTrabajo from './unidades/TablaUnidadesTrabajo.jsx';
import DialogoUnidadTrabajo from './unidades/DialogoUnidadTrabajo.jsx';
import './unidades/unidades.css';

/**
 * GestorCurriculo - Componente principal para la gestión curricular y asignación interactiva (Drag & Drop).
 *
 * Responsabilidad Única: Coordinar las zonas interactivas Swapy entre las Unidades de Trabajo
 * y el panel de actividades huérfanas, así como la vista tabular y los diálogos modales de edición.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades didácticas con sus actividades.
 * @param {Array<Object>} props.actividadesHuerfanas - Lista de actividades sin unidad asignada.
 * @param {number} props.siguienteNumeroUT - Siguiente número sugerido para nuevas unidades.
 * @param {boolean} [props.cargando=false] - Indicador de carga general.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 * @param {string} [props.vista='visual'] - Modo de vista activo ('visual' o 'tabla').
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
  actividadesHuerfanas = [],
  siguienteNumeroUT = 1,
  cargando = false,
  guardando = false,
  vista = 'visual',
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
  const contenedorSwapyRef = useRef(null);
  const instanciaSwapyRef = useRef(null);

  // Se recopila la totalidad de versiones para realizar búsquedas rápidas en el callback de Swapy.
  const todasLasVersiones = useMemo(() => {
    const asignadas = unidades.flatMap((u) => u.versiones || []);
    return [...asignadas, ...actividadesHuerfanas];
  }, [unidades, actividadesHuerfanas]);

  // Se inicializa y sincroniza la instancia de Swapy sobre el contenedor visual.
  useEffect(() => {
    if (vista !== 'visual' || !contenedorSwapyRef.current) {
      if (instanciaSwapyRef.current) {
        instanciaSwapyRef.current.destroy();
        instanciaSwapyRef.current = null;
      }
      return;
    }

    // Se destruye cualquier instancia previa antes de montar la nueva.
    if (instanciaSwapyRef.current) {
      instanciaSwapyRef.current.destroy();
    }

    try {
      const swapy = createSwapy(contenedorSwapyRef.current, {
        animation: 'dynamic',
        swapMode: 'drop',
        dragOnHold: false,
        autoScrollOnDrag: true
      });

      instanciaSwapyRef.current = swapy;

      // Se suscribe al evento de fin de soltado interactivo.
      swapy.onSwapEnd((event) => {
        if (!event || !event.hasChanged) return;

        const arraySlots = event.slotItemMap?.asArray || [];

        // Se procesa cada elemento para determinar su nueva ranura destino.
        arraySlots.forEach(({ slot, item }) => {
          if (!slot || !item) return;

          const idVersion = item.replace('version_', '');

          let destinoIdUt = null;
          if (slot.startsWith('slot-ut-dropzone_')) {
            destinoIdUt = slot.replace('slot-ut-dropzone_', '');
          } else if (slot.startsWith('slot-ut_')) {
            const partes = slot.split('_');
            destinoIdUt = partes[1] || null;
          } else if (slot.startsWith('slot-huerfanas-dropzone') || slot.startsWith('slot-huerfana_')) {
            destinoIdUt = null;
          }

          // Se comprueba si la actividad cambió de asignación con respecto a su estado previo.
          const actual = todasLasVersiones.find((v) => v.id_version === idVersion);
          if (actual && (actual.id_ut || null) !== destinoIdUt) {
            // Se actualiza el identificador de la unidad de trabajo.
            onAsignarActividad(idVersion, destinoIdUt);
          }
        });
      });
    } catch (err) {
      console.error('Error al inicializar Swapy:', err);
    }

    return () => {
      if (instanciaSwapyRef.current) {
        instanciaSwapyRef.current.destroy();
        instanciaSwapyRef.current = null;
      }
    };
  }, [vista, unidades, actividadesHuerfanas, todasLasVersiones, onAsignarActividad]);

  // Manejador para solicitar confirmación de borrado crítico con ModalConfirmacion.
  const manejarConfirmarBorrado = (unidad) => {
    confirmarBorrado({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar la unidad "${unidad.nombre}"? Las actividades asociadas pasarán al panel de huérfanas sin perderse.`,
      acceptLabel: 'Eliminar Unidad',
      rejectLabel: 'Cancelar',
      onAceptar: async () => {
        const exito = await onEliminarUT(unidad.id_ut);
        if (exito) {
          mostrarExito(`Unidad "${unidad.nombre}" eliminada correctamente.`);
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
      {/* Vista interactiva Drag & Drop con zonas Swapy */}
      {vista === 'visual' ? (
        <div ref={contenedorSwapyRef} className="contenedor-curriculo">
          {/* Columna principal con la cuadrícula de Unidades de Trabajo */}
          <section className="zona-curricular-columna">
            <ZonaCurricularUTs
              unidades={unidades}
              cargando={cargando}
              onNuevaUT={onAbrirCrear}
              onEditarUT={onAbrirEditar}
              onEliminarUT={manejarConfirmarBorrado}
              onDesvincularActividad={onDesvincularActividad}
              onAsignarUT={onAsignarActividad}
            />
          </section>

          {/* Panel lateral con las actividades huérfanas */}
          <PanelActividadesHuerfanas
            actividades={actividadesHuerfanas}
            unidadesDisponibles={unidades}
            onAsignarUT={onAsignarActividad}
            onDesvincularActividad={onDesvincularActividad}
          />
        </div>
      ) : (
        /* Vista alternativa tabular con DataTable estandarizado */
        <TablaUnidadesTrabajo
          unidades={unidades}
          cargando={cargando}
          onEditar={onAbrirEditar}
          onEliminar={manejarConfirmarBorrado}
          onNuevaUT={onAbrirCrear}
        />
      )}

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
