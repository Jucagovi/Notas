import React, { useState, useEffect } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import {
  LISTA_TIPOS_EVENTO,
  obtenerConfiguracionTipoEvento
} from '../../utils/coloreCalendario.js';
import {
  formatearFechaEspanol,
  parsearFechaISO
} from '../../utils/fechas.js';

/**
 * OverlayEditorEvento - Popover ligero (OverlayPanel) para interacción ágil en el calendario.
 *
 * Responsabilidad Única: Renderizar una paleta circular de colores estandarizados, previsualización
 * del rango de fechas y campo de texto opcional para detalles, posicionado directamente sobre el día.
 *
 * @param {Object} props
 * @param {React.RefObject} props.overlayRef - Referencia al componente OverlayPanel de PrimeReact.
 * @param {Object} [props.eventoSeleccionado] - Datos del evento o rango seleccionado.
 * @param {Function} props.onGuardar - Callback al confirmar la creación o modificación del evento.
 * @param {Function} props.onEliminar - Callback al solicitar el borrado de un evento existente.
 * @param {Function} props.onCerrar - Callback al descartar el panel.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const OverlayEditorEvento = ({
  overlayRef,
  eventoSeleccionado = null,
  onGuardar,
  onEliminar,
  onCerrar,
  guardando = false
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Festivo Nacional');
  const [descripcion, setDescripcion] = useState('');

  // Sincronización de los campos cuando cambia el evento o rango recibido.
  useEffect(() => {
    if (eventoSeleccionado) {
      setTipoSeleccionado(eventoSeleccionado.tipo_evento || 'Festivo Nacional');
      setDescripcion(eventoSeleccionado.descripcion || '');
    } else {
      setTipoSeleccionado('Festivo Nacional');
      setDescripcion('');
    }
  }, [eventoSeleccionado]);

  if (!eventoSeleccionado) return null;

  const esEdicion = Boolean(eventoSeleccionado.id_evento);
  const configActual = obtenerConfiguracionTipoEvento(tipoSeleccionado);

  // Formateo del rango de fechas para la cabecera del popover.
  const fechaIniStr = formatearFechaEspanol(eventoSeleccionado.fecha_inicio);
  const fechaFinStr = formatearFechaEspanol(eventoSeleccionado.fecha_fin || eventoSeleccionado.fecha_inicio);
  const esMismoDia = !eventoSeleccionado.fecha_fin || eventoSeleccionado.fecha_inicio === eventoSeleccionado.fecha_fin;

  // Cálculo de la duración en días naturales.
  let textoDuracion = '1 día';
  if (!esMismoDia && eventoSeleccionado.fecha_inicio && eventoSeleccionado.fecha_fin) {
    const fIni = parsearFechaISO(eventoSeleccionado.fecha_inicio);
    const fFin = parsearFechaISO(eventoSeleccionado.fecha_fin);
    if (fIni && fFin) {
      const dias = Math.round((fFin.getTime() - fIni.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      textoDuracion = `${dias} días`;
    }
  }

  // Manejador para confirmar la acción de guardado.
  const manejarConfirmar = () => {
    if (!onGuardar) return;
    onGuardar({
      ...eventoSeleccionado,
      tipo_evento: tipoSeleccionado,
      descripcion: descripcion.trim(),
      es_lectivo: configActual.esLectivo
    });
    if (overlayRef?.current) {
      overlayRef.current.hide();
    }
  };

  // Manejador para eliminar el evento activo.
  const manejarEliminar = () => {
    if (onEliminar && eventoSeleccionado.id_evento) {
      onEliminar(eventoSeleccionado.id_evento);
    }
    if (overlayRef?.current) {
      overlayRef.current.hide();
    }
  };

  return (
    <OverlayPanel
      ref={overlayRef}
      dismissable
      showCloseIcon
      closeOnEscape
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
      onHide={() => {
        if (onCerrar) onCerrar();
      }}
      className="p-3 shadow-4 border-round-xl border-1 surface-border"
      style={{ width: '320px', maxWidth: '92vw', zIndex: 1200 }}
    >
      <div className="flex flex-column gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera con indicación de fechas seleccionadas */}
        <div className="flex flex-column gap-1 border-bottom-1 surface-border pb-2">
          <div className="flex align-items-center justify-content-between">
            <span className="text-xs uppercase font-bold text-500 tracking-wider">
              {esEdicion ? 'Editar Evento' : 'Nuevo Evento'}
            </span>
            <Tag
              severity={configActual.esLectivo ? 'success' : 'danger'}
              value={configActual.esLectivo ? 'Lectivo' : 'No Lectivo'}
              className="text-xs"
            />
          </div>
          <div className="flex align-items-center gap-2 text-900 font-semibold text-sm">
            <i className="pi pi-calendar text-primary" />
            <span>
              {esMismoDia ? fechaIniStr : `${fechaIniStr} - ${fechaFinStr}`}
            </span>
            {!esMismoDia && (
              <span className="text-xs text-500 font-normal">
                ({textoDuracion})
              </span>
            )}
          </div>
        </div>

        {/* Paleta circular de selección cromática de tipos de evento */}
        <div className="flex flex-column gap-2">
          <label className="text-xs font-semibold text-700">
            Tipo de Evento y Color:
          </label>
          <div className="flex align-items-center justify-content-between gap-1">
            {LISTA_TIPOS_EVENTO.map((item) => {
              const estaSeleccionado = tipoSeleccionado === item.tipo;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.tipo} (${item.esLectivo ? 'Lectivo' : 'No lectivo'})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTipoSeleccionado(item.tipo);
                  }}
                  className={`boton-color-circular ${estaSeleccionado ? 'seleccionado' : ''}`}
                  style={{
                    backgroundColor: item.color,
                    boxShadow: estaSeleccionado ? `0 0 0 3px #ffffff, 0 0 0 5px ${item.color}` : 'none'
                  }}
                >
                  {estaSeleccionado && (
                    <i
                      className="pi pi-check text-xs font-bold"
                      style={{ color: item.colorTexto }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Etiqueta descriptiva del tipo seleccionado actualmente */}
          <div
            className="text-xs font-semibold px-2 py-1 border-round text-center"
            style={{
              backgroundColor: configActual.colorFondo,
              color: configActual.esLectivo ? '#166534' : '#991b1b',
              border: `1px solid ${configActual.colorBorde}`
            }}
          >
            {configActual.tipo}
          </div>
        </div>

        {/* Campo de texto opcional para detalles o motivo */}
        <div className="flex flex-column gap-1">
          <label htmlFor="input-descripcion-evento" className="text-xs font-semibold text-700">
            Detalles o Motivo (Opcional):
          </label>
          <InputText
            id="input-descripcion-evento"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Día de la Hispanidad, Examen UT1..."
            size="small"
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                manejarConfirmar();
              }
            }}
          />
        </div>

        {/* Botones de acción del OverlayPanel */}
        <div className="flex align-items-center justify-content-between gap-2 pt-2 border-top-1 surface-border">
          {esEdicion ? (
            <Button
              type="button"
              icon="pi pi-trash"
              severity="danger"
              text
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                manejarEliminar();
              }}
              disabled={guardando}
              tooltip="Eliminar este evento"
              tooltipOptions={{ position: 'top' }}
            />
          ) : (
            <Button
              type="button"
              label="Cancelar"
              text
              severity="secondary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                overlayRef?.current?.hide();
              }}
              disabled={guardando}
            />
          )}

          <div className="flex align-items-center gap-2">
            <Button
              type="button"
              label="Aplicar"
              icon="pi pi-check"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                manejarConfirmar();
              }}
              loading={guardando}
            />
          </div>
        </div>
      </div>
    </OverlayPanel>
  );
};

export default OverlayEditorEvento;
