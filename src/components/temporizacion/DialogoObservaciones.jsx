import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

/**
 * DialogoObservaciones - Modal para la visualización y edición rápida de observaciones de una UT.
 *
 * Responsabilidad Única: Permitir al docente registrar o modificar anotaciones, incidencias y notas
 * específicas de impartición para una unidad de trabajo mediante un campo de texto ampliable.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Control de visibilidad del diálogo modal.
 * @param {Object|null} props.temporizacion - Registro de temporización seleccionado.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia en proceso.
 * @param {Function} props.onGuardar - Callback disparado al confirmar las observaciones.
 * @param {Function} props.onOcultar - Callback disparado al cerrar el modal.
 */
export const DialogoObservaciones = ({
  visible = false,
  temporizacion = null,
  guardando = false,
  onGuardar,
  onOcultar
}) => {
  const [textoObservaciones, setTextoObservaciones] = useState('');

  // Sincronización del texto al abrir el modal con la unidad seleccionada.
  useEffect(() => {
    if (temporizacion) {
      setTextoObservaciones(temporizacion.observaciones || '');
    } else {
      setTextoObservaciones('');
    }
  }, [temporizacion, visible]);

  const ut = temporizacion?.unidad_trabajo;

  const manejarGuardar = () => {
    if (temporizacion?.id_temporizacion) {
      onGuardar(temporizacion.id_temporizacion, textoObservaciones.trim() || null);
    }
  };

  const pieDialogo = (
    <div className="flex justify-content-end gap-2 pt-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={onOcultar}
        disabled={guardando}
      />
      <BotonAccion
        tipo="guardar"
        label="Guardar Observaciones"
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  const numFormateado = formatearNumeroUT(ut?.numero || temporizacion?.orden);

  return (
    <Dialog
      visible={visible}
      header={`Observaciones: ${numFormateado} — ${ut?.nombre || 'Unidad de Trabajo'}`}
      footer={pieDialogo}
      onHide={onOcultar}
      style={{ width: '90vw', maxWidth: '550px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        <label htmlFor="input-observaciones-modal" className="font-semibold text-sm text-800">
          Anotaciones e Incidencias de la Unidad
        </label>
        <InputTextarea
          id="input-observaciones-modal"
          value={textoObservaciones}
          onChange={(e) => setTextoObservaciones(e.target.value)}
          rows={6}
          autoResize
          placeholder="Escriba aquí notas sobre ritmo de impartición, ajustes curriculares, festivos sobrevenidos o incidencias..."
          className="w-full"
          disabled={guardando}
        />
        <span className="text-xs text-color-secondary">
          Las observaciones se guardan de forma específica para esta unidad en la clase actual.
        </span>
      </div>
    </Dialog>
  );
};

export default DialogoObservaciones;
