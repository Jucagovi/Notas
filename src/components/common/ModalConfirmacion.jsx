import React from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

/**
 * Función imperativa para abrir rápidamente el diálogo modal de confirmación
 * de borrado crítico estandarizado en toda la aplicación.
 *
 * @param {Object} opciones
 * @param {string} [opciones.message] - Mensaje de confirmación detallado.
 * @param {string} [opciones.header='Confirmar Eliminación'] - Título de la cabecera.
 * @param {Function} opciones.onAceptar - Callback al pulsar el botón de confirmación roja.
 * @param {Function} [opciones.onCancelar] - Callback al cancelar o cerrar el diálogo.
 * @param {string} [opciones.acceptLabel='Eliminar'] - Texto del botón de confirmación.
 * @param {string} [opciones.rejectLabel='Cancelar'] - Texto del botón de rechazo.
 * @param {string} [opciones.icon='pi pi-exclamation-triangle'] - Icono de advertencia.
 */
export const confirmarBorrado = ({
  message = '¿Estás seguro de que deseas eliminar este registro? Esta acción es irreversible.',
  header = 'Confirmar Eliminación',
  onAceptar,
  onCancelar,
  acceptLabel = 'Eliminar',
  rejectLabel = 'Cancelar',
  icon = 'pi pi-exclamation-triangle',
  ...restoOpciones
} = {}) => {
  confirmDialog({
    message,
    header,
    icon,
    acceptClassName: 'p-button-danger',
    acceptLabel,
    rejectLabel,
    accept: onAceptar,
    reject: onCancelar,
    ...restoOpciones
  });
};

/**
 * ModalConfirmacion - Componente presentacional declarativo para borrados y acciones críticas.
 *
 * Responsabilidad Única: Estandarizar la presentación de ConfirmDialog asegurando que
 * el botón de confirmación sea siempre de peligro (rojo/danger) y el icono sea de advertencia.
 *
 * @param {Object} props
 * @param {boolean} [props.visible] - Controla la visibilidad del diálogo en modo declarativo.
 * @param {Function} [props.onHide] - Manejador para ocultar el diálogo.
 * @param {Function} [props.onAceptar] - Callback al confirmar la acción crítica.
 * @param {Function} [props.onCancelar] - Callback al rechazar la acción crítica.
 * @param {string} [props.header='Confirmar Eliminación'] - Título de la cabecera.
 * @param {string|React.ReactNode} [props.message='¿Estás seguro de que deseas eliminar este registro?'] - Mensaje descriptivo.
 * @param {string} [props.acceptLabel='Eliminar'] - Texto del botón de confirmación.
 * @param {string} [props.rejectLabel='Cancelar'] - Texto del botón de cancelación.
 * @param {string} [props.icon='pi pi-exclamation-triangle'] - Icono del diálogo.
 * @param {string} [props.acceptClassName='p-button-danger'] - Clase del botón de confirmación.
 */
export const ModalConfirmacion = ({
  visible,
  onHide,
  onAceptar,
  onCancelar,
  header = 'Confirmar Eliminación',
  message = '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
  acceptLabel = 'Eliminar',
  rejectLabel = 'Cancelar',
  icon = 'pi pi-exclamation-triangle',
  acceptClassName = 'p-button-danger',
  ...restoProps
}) => {
  return (
    <ConfirmDialog
      visible={visible}
      onHide={onHide}
      header={header}
      message={message}
      icon={icon}
      acceptClassName={acceptClassName}
      acceptLabel={acceptLabel}
      rejectLabel={rejectLabel}
      accept={onAceptar}
      reject={onCancelar}
      {...restoProps}
    />
  );
};

export default ModalConfirmacion;
