import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import BotonAccion from '../common/BotonAccion.jsx';
import { parsearFechaISO, formatearFechaISO } from '../../utils/fechas.js';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

// Opciones estándar para el estado de impartición de la unidad de trabajo.
const OPCIONES_ESTADO = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Curso', value: 'En Curso' },
  { label: 'Completada', value: 'Completada' }
];

/**
 * DialogoTemporizacion - Modal para la edición detallada de una unidad temporizada.
 *
 * Responsabilidad Única: Permitir al docente editar todos los campos temporales y descriptivos
 * específicos de la clase, incluyendo fechas previstas y reales, nombre alternativo y notas.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Control de visibilidad del diálogo modal.
 * @param {Object|null} props.temporizacion - Registro de temporización seleccionado para edición.
 * @param {boolean} props.guardando - Indicador de guardado en proceso.
 * @param {Function} props.onGuardar - Callback al confirmar el formulario con los datos modificados.
 * @param {Function} props.onOcultar - Callback para cerrar el diálogo modal.
 */
export const DialogoTemporizacion = ({
  visible = false,
  temporizacion = null,
  guardando = false,
  onGuardar,
  onOcultar
}) => {
  // Estado local para los campos del formulario.
  const [nombreAlternativo, setNombreAlternativo] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [fechaIniPrevista, setFechaIniPrevista] = useState(null);
  const [fechaFinPrevista, setFechaFinPrevista] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Se inicializan los campos al abrir el modal con la unidad seleccionada.
  useEffect(() => {
    if (temporizacion) {
      setNombreAlternativo(temporizacion.nombre_alternativo || '');
      setEstado(temporizacion.estado || 'Pendiente');
      setFechaIniPrevista(temporizacion.fecha_ini_prevista ? parsearFechaISO(temporizacion.fecha_ini_prevista) : null);
      setFechaFinPrevista(temporizacion.fecha_fin_prevista ? parsearFechaISO(temporizacion.fecha_fin_prevista) : null);
      setObservaciones(temporizacion.observaciones || '');
      setErrorValidacion('');
    } else {
      setNombreAlternativo('');
      setEstado('Pendiente');
      setFechaIniPrevista(null);
      setFechaFinPrevista(null);
      setObservaciones('');
      setErrorValidacion('');
    }
  }, [temporizacion, visible]);

  // Manejador del guardado tras validar la consistencia temporal.
  const manejarGuardar = () => {
    setErrorValidacion('');

    // Validación de concordancia en el rango de fechas previstas.
    if (fechaIniPrevista && fechaFinPrevista && fechaIniPrevista > fechaFinPrevista) {
      setErrorValidacion('La fecha prevista de inicio no puede ser posterior a la fecha prevista de finalización.');
      return;
    }

    const payload = {
      nombre_alternativo: nombreAlternativo.trim() ? nombreAlternativo.trim() : null,
      estado,
      fecha_ini_prevista: fechaIniPrevista ? formatearFechaISO(fechaIniPrevista) : null,
      fecha_fin_prevista: fechaFinPrevista ? formatearFechaISO(fechaFinPrevista) : null,
      observaciones: observaciones.trim() ? observaciones.trim() : null
    };

    onGuardar(temporizacion.id_temporizacion, payload);
  };

  const ut = temporizacion?.unidad_trabajo;
  const numFormateado = formatearNumeroUT(ut?.numero || temporizacion?.orden);

  // Botones del pie del diálogo modal.
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
        label="Guardar Cambios"
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      header={`Temporización: ${numFormateado} - ${ut?.nombre || 'Unidad de Trabajo'}`}
      footer={pieDialogo}
      onHide={onOcultar}
      style={{ width: '90vw', maxWidth: '650px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Aviso de error de validación */}
        {errorValidacion && (
          <div className="p-3 surface-red-50 border-round border-1 border-red-200 text-red-700 text-sm flex align-items-center gap-2">
            <i className="pi pi-exclamation-triangle" />
            <span>{errorValidacion}</span>
          </div>
        )}

        {/* Nombre oficial base (solo lectura) */}
        <div className="flex flex-column gap-1">
          <label className="font-semibold text-xs uppercase text-color-secondary">
            Currículo Base Oficial
          </label>
          <div className="p-2 surface-100 border-round text-800 text-sm">
            <strong>{numFormateado}:</strong> {ut?.nombre}
          </div>
        </div>

        {/* Nombre alternativo para esta clase */}
        <div className="flex flex-column gap-1">
          <label htmlFor="temp-nombre-alt" className="font-semibold text-sm text-800">
            Nombre Alternativo en la Clase (Opcional)
          </label>
          <InputText
            id="temp-nombre-alt"
            value={nombreAlternativo}
            onChange={(e) => setNombreAlternativo(e.target.value)}
            placeholder="Ej: UT 1 ampliada con desarrollo web"
            maxLength={255}
          />
        </div>

        {/* Selector de Estado */}
        <div className="flex flex-column gap-1">
          <label htmlFor="temp-estado" className="font-semibold text-sm text-800">
            Estado de Impartición
          </label>
          <Dropdown
            id="temp-estado"
            value={estado}
            options={OPCIONES_ESTADO}
            onChange={(e) => setEstado(e.value)}
            placeholder="Selecciona el estado..."
          />
        </div>

        {/* Bloque de Fechas Previstas */}
        <div className="surface-50 p-3 border-round border-1 surface-border">
          <span className="font-semibold text-sm text-primary block mb-2">
            <i className="pi pi-calendar mr-2" />
            Planificación Prevista
          </span>
          <div className="grid">
            <div className="col-12 sm:col-6">
              <label htmlFor="temp-fecha-ini-prev" className="text-xs font-semibold text-700 mb-1 block">
                Fecha Inicio Prevista
              </label>
              <Calendar
                id="temp-fecha-ini-prev"
                value={fechaIniPrevista}
                onChange={(e) => setFechaIniPrevista(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                firstDayOfWeek={1}
                placeholder="dd/mm/aaaa"
                showButtonBar
              />
            </div>
            <div className="col-12 sm:col-6">
              <label htmlFor="temp-fecha-fin-prev" className="text-xs font-semibold text-700 mb-1 block">
                Fecha Fin Prevista
              </label>
              <Calendar
                id="temp-fecha-fin-prev"
                value={fechaFinPrevista}
                onChange={(e) => setFechaFinPrevista(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                firstDayOfWeek={1}
                placeholder="dd/mm/aaaa"
                showButtonBar
              />
            </div>
          </div>
        </div>

        {/* Observaciones o Incidencias */}
        <div className="flex flex-column gap-1">
          <label htmlFor="temp-observaciones" className="font-semibold text-sm text-800">
            Observaciones o Incidencias
          </label>
          <InputTextarea
            id="temp-observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            autoResize
            placeholder="Anotaciones sobre retrasos, ajustes de contenido o festivos sobrevenidos..."
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoTemporizacion;
