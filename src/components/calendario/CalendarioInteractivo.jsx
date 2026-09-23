import React, { useRef, useState, useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es.js';
import OverlayEditorEvento from './OverlayEditorEvento.jsx';
import {
  obtenerConfiguracionTipoEvento,
  obtenerColorEvento,
  obtenerColorTextoEvento
} from '../../utils/coloreCalendario.js';
import {
  formatearFechaISO,
  parsearFechaISO
} from '../../utils/fechas.js';
import './calendario.css';

/**
 * CalendarioInteractivo - Subcomponente de agenda visual y planificación interactiva anual.
 *
 * Responsabilidad Única: Renderizar el Master Planner global de doce meses (septiembre a agosto)
 * para el año académico seleccionado, anclando el OverlayPanel ágil sobre el día seleccionado sin dependencias de cursos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.eventos - Lista de eventos globales registrados en Calendario_Eventos.
 * @param {number} props.anioSeleccionado - Año de inicio del curso académico (ej. 2024).
 * @param {Function} props.onAgregarEvento - Manejador para insertar un nuevo evento global.
 * @param {Function} props.onActualizarEvento - Manejador para actualizar un evento existente.
 * @param {Function} props.onEliminarEvento - Manejador para eliminar un evento.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const CalendarioInteractivo = ({
  eventos = [],
  anioSeleccionado = new Date().getFullYear(),
  onAgregarEvento,
  onActualizarEvento,
  onEliminarEvento,
  guardando = false
}) => {
  const overlayRef = useRef(null);
  const calendarRef = useRef(null);
  const [eventoParaOverlay, setEventoParaOverlay] = useState(null);

  // Conversión de los eventos de Calendario_Eventos a la estructura requerida por FullCalendar.
  const eventosFullCalendar = useMemo(() => {
    return eventos.map((ev) => {
      const config = obtenerConfiguracionTipoEvento(ev.tipo_evento);
      const colorFondo = config ? config.color : obtenerColorEvento(ev.tipo_evento);
      const colorTexto = config ? config.colorTexto : obtenerColorTextoEvento(ev.tipo_evento);
      const colorBorde = config ? config.colorBorde : colorFondo;

      // FullCalendar maneja la propiedad 'end' de los eventos allDay como fecha exclusiva (+1 día).
      let fechaFinAjustada = ev.fecha_fin;
      if (ev.fecha_fin && ev.fecha_fin !== ev.fecha_inicio) {
        const dFin = parsearFechaISO(ev.fecha_fin);
        if (dFin) {
          dFin.setDate(dFin.getDate() + 1);
          fechaFinAjustada = formatearFechaISO(dFin);
        }
      }

      const titulo = ev.descripcion && ev.descripcion.trim()
        ? `${ev.tipo_evento}: ${ev.descripcion}`
        : ev.tipo_evento;

      return {
        id: ev.id_evento,
        title: titulo,
        start: ev.fecha_inicio,
        end: fechaFinAjustada || ev.fecha_inicio,
        allDay: true,
        backgroundColor: colorFondo,
        borderColor: colorBorde,
        textColor: colorTexto,
        extendedProps: {
          eventoOriginal: ev,
          tipo_evento: ev.tipo_evento,
          descripcion: ev.descripcion,
          es_lectivo: ev.es_lectivo,
          fecha_inicio: ev.fecha_inicio,
          fecha_fin: ev.fecha_fin
        }
      };
    });
  }, [eventos]);

  // Manejador al seleccionar un día o arrastrar un rango de días en FullCalendar.
  const manejarSeleccionRango = useCallback((selectionInfo) => {
    const fFin = new Date(selectionInfo.end.getTime());
    fFin.setDate(fFin.getDate() - 1);
    const fechaFinInclusivaISO = formatearFechaISO(fFin);
    const fechaInicioISO = selectionInfo.startStr;

    // Se busca en el DOM la celda correspondiente al día mediante el atributo data-date permanente.
    let celda =
      document.querySelector(`.fc-day[data-date="${fechaInicioISO}"]`) ||
      document.querySelector(`[data-date="${fechaInicioISO}"]`);

    if (!celda && selectionInfo.jsEvent?.target) {
      const target = selectionInfo.jsEvent.target;
      celda = target.closest ? (target.closest('[data-date]') || target.closest('td')) : target;
    }

    setEventoParaOverlay({
      id_evento: null,
      id_curso: null, // Eventos globales compartidos.
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinInclusivaISO,
      tipo_evento: 'Festivo Nacional',
      descripcion: '',
      es_lectivo: false
    });

    if (overlayRef.current && celda) {
      overlayRef.current.hide();
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.show(null, celda);
        }
      }, 50);
    }
  }, []);

  // Manejador al hacer clic sobre un evento existente en el calendario.
  const manejarClickEvento = useCallback((eventClickInfo) => {
    if (eventClickInfo.jsEvent) {
      eventClickInfo.jsEvent.preventDefault();
      eventClickInfo.jsEvent.stopPropagation();
    }

    const evOriginal = eventClickInfo.event?.extendedProps?.eventoOriginal;
    if (evOriginal) {
      setEventoParaOverlay({
        id_evento: evOriginal.id_evento,
        id_curso: null,
        fecha_inicio: evOriginal.fecha_inicio,
        fecha_fin: evOriginal.fecha_fin || evOriginal.fecha_inicio,
        tipo_evento: evOriginal.tipo_evento,
        descripcion: evOriginal.descripcion || '',
        es_lectivo: evOriginal.es_lectivo
      });

      const targetEl = eventClickInfo.el;
      if (overlayRef.current && targetEl) {
        overlayRef.current.hide();
        setTimeout(() => {
          if (overlayRef.current) {
            overlayRef.current.show(null, targetEl);
          }
        }, 50);
      }
    }
  }, []);

  // Manejador de confirmación desde el OverlayEditorEvento.
  const manejarGuardarEvento = useCallback((datosEvento) => {
    if (datosEvento.id_evento) {
      if (onActualizarEvento) {
        onActualizarEvento(datosEvento.id_evento, { ...datosEvento, id_curso: null });
      }
    } else {
      if (onAgregarEvento) {
        onAgregarEvento({ ...datosEvento, id_curso: null });
      }
    }

    const api = calendarRef.current?.getApi();
    if (api) {
      api.unselect();
    }
  }, [onActualizarEvento, onAgregarEvento]);

  // Manejador de eliminación de evento desde el OverlayEditorEvento.
  const manejarEliminarEvento = useCallback((idEvento) => {
    if (onEliminarEvento && idEvento) {
      onEliminarEvento(idEvento);
    }
  }, [onEliminarEvento]);

  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3 w-full calendario-interactivo-contenedor">
      {/* Calendario con vista anual de doce meses (septiembre a agosto) */}
      <div id="seccion-imprimible-calendario">
        <FullCalendar
          key={`calendario-fc-${anioSeleccionado}`}
          ref={calendarRef}
          plugins={[multiMonthPlugin, dayGridPlugin, interactionPlugin]}
          initialView="multiMonthCurso"
          views={{
            multiMonthCurso: {
              type: 'multiMonth',
              duration: { months: 12 },
              multiMonthMaxColumns: 3,
              buttonText: 'Curso Completo (12 Meses)',
              multiMonthTitleFormat: (arg) => {
                const meses = [
                  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const mes = meses[arg.date.month] || '';
                return `${mes} ${arg.date.year}`;
              }
            },
            dayGridMonth: {
              buttonText: 'Vista Mensual'
            }
          }}
          initialDate={`${anioSeleccionado}-09-01`}
          locales={[esLocale]}
          locale="es"
          firstDay={1}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'multiMonthCurso,dayGridMonth'
          }}
          buttonText={{
            today: 'Hoy'
          }}
          selectable={true}
          selectMirror={true}
          unselectAuto={false}
          select={manejarSeleccionRango}
          eventClick={manejarClickEvento}
          events={eventosFullCalendar}
          dayMaxEvents={3}
          height="auto"
          dayCellClassNames={(arg) => {
            const clases = [];
            // El mes 7 en JavaScript corresponde a agosto (periodo de vacaciones legales estivales).
            if (arg.date.getMonth() === 7) {
              clases.push('fc-dia-agosto-vacaciones');
            }
            return clases;
          }}
          eventDidMount={(info) => {
            const props = info.event?.extendedProps;
            if (!props) return;
            const desc = props.descripcion ? ` - ${props.descripcion}` : '';
            const lectivo = props.es_lectivo ? 'Lectivo' : 'No lectivo';
            info.el?.setAttribute('title', `${props.tipo_evento || 'Evento'} (${lectivo})${desc}`);
          }}
        />
      </div>

      {/* Popover ligero flotante para edición y asignación cromática */}
      <OverlayEditorEvento
        overlayRef={overlayRef}
        eventoSeleccionado={eventoParaOverlay}
        onGuardar={manejarGuardarEvento}
        onEliminar={manejarEliminarEvento}
        onCerrar={() => {
          setEventoParaOverlay(null);
          const api = calendarRef.current?.getApi();
          if (api) api.unselect();
        }}
        guardando={guardando}
      />
    </div>
  );
};

export default CalendarioInteractivo;
