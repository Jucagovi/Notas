import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es.js';
import { useCalendario } from '../../hooks/useCalendario.js';
import useDatos from '../../hooks/useDatos.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import OverlayEditorEvento from '../calendario/OverlayEditorEvento.jsx';
import DialogoDetalleUnidad from './DialogoDetalleUnidad.jsx';
import CargadorSeccion from '../common/CargadorSeccion.jsx';
import {
  LISTA_TIPOS_EVENTO,
  obtenerConfiguracionTipoEvento,
  obtenerColorEvento,
  obtenerColorTextoEvento
} from '../../utils/coloreCalendario.js';
import {
  formatearFechaISO,
  parsearFechaISO,
  obtenerSegmentosLaborables
} from '../../utils/fechas.js';
import '../calendario/calendario.css';

/**
 * WidgetAgendaEscolar - Widget unificado de Agenda Escolar para el Panel de Control.
 *
 * Responsabilidad Única: Combinar y renderizar en una única vista interactiva de FullCalendar
 * tanto los eventos oficiales del Calendario Escolar (festivos, evaluaciones, exámenes)
 * como la programación curricular de las Unidades de Trabajo (UT) según su temporización,
 * permitiendo añadir/editar eventos del calendario escolar y gestionar el estado y fechas de las UTs.
 */
export const WidgetAgendaEscolar = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const overlayRef = useRef(null);
  const botonAnadirRef = useRef(null);
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Se determina el año de inicio del curso académico actual (septiembre a agosto).
  const anioActual = useMemo(() => {
    const hoy = new Date();
    return hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
  }, []);

  // 1. Hook oficial del Calendario Escolar para gestionar Calendario_Eventos.
  const {
    eventos: eventosCalendario,
    cargando: cargandoCalendario,
    guardando: guardandoCalendario,
    agregarEvento,
    actualizarEvento,
    eliminarEvento
  } = useCalendario(anioActual);

  // 2. Hook genérico para consultar y actualizar la tabla Temporizacion.
  const {
    obtenerDatos: obtenerTemporizacionDb,
    actualizar: actualizarTemporizacionDb
  } = useDatos('Temporizacion');

  const [temporizaciones, setTemporizaciones] = useState([]);
  const [cargandoUTs, setCargandoUTs] = useState(false);
  const [guardandoUT, setGuardandoUT] = useState(false);

  // Estado del evento activo para edición en el OverlayPanel flotante del Calendario Escolar.
  const [eventoParaOverlay, setEventoParaOverlay] = useState(null);

  // Estado de la unidad de trabajo activa para el modal de detalle de UT.
  const [unidadDetalle, setUnidadDetalle] = useState(null);
  const [dialogoUTVisible, setDialogoUTVisible] = useState(false);

  // Consulta de las Unidades de Trabajo temporizadas de todas las clases y módulos.
  const cargarTemporizaciones = useCallback(async () => {
    setCargandoUTs(true);
    const columnas = `
      id_temporizacion,
      id_curso,
      id_ut,
      fecha_ini_prevista,
      fecha_fin_prevista,
      fecha_ini_real,
      fecha_fin_real,
      estado,
      orden,
      observaciones,
      nombre_alternativo,
      Unidades_Trabajo (
        id_ut,
        numero,
        nombre,
        descripcion,
        id_modulo,
        Modulos (
          id_modulo,
          nombre,
          siglas
        )
      ),
      Cursos (
        id_curso,
        nombre,
        anyo,
        centro
      )
    `;

    try {
      const res = await obtenerTemporizacionDb(columnas, (consulta) =>
        consulta.not('fecha_ini_prevista', 'is', null).order('fecha_ini_prevista', { ascending: true })
      );
      setTemporizaciones(res || []);
    } catch (err) {
      console.error('Error al cargar temporizaciones en la agenda escolar:', err);
    } finally {
      setCargandoUTs(false);
    }
  }, [obtenerTemporizacionDb]);

  useEffect(() => {
    cargarTemporizaciones();
  }, [cargarTemporizaciones]);

  // Conversión unificada de eventos del Calendario Escolar y de Unidades de Trabajo a FullCalendar.
  const todosLosEventos = useMemo(() => {
    const lista = [];

    // 1. Eventos del Calendario Escolar (Festivos, Evaluaciones, Exámenes, Anotaciones).
    (eventosCalendario || []).forEach((ev) => {
      const config = obtenerConfiguracionTipoEvento(ev.tipo_evento);
      const colorFondo = config ? config.color : obtenerColorEvento(ev.tipo_evento);
      const colorTexto = config ? config.colorTexto : obtenerColorTextoEvento(ev.tipo_evento);
      const colorBorde = config ? config.colorBorde : colorFondo;

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

      lista.push({
        id: `cal_${ev.id_evento}`,
        title: titulo,
        start: ev.fecha_inicio,
        end: fechaFinAjustada || ev.fecha_inicio,
        allDay: true,
        backgroundColor: colorFondo,
        borderColor: colorBorde,
        textColor: colorTexto,
        extendedProps: {
          esEventoCalendario: true,
          eventoOriginal: ev,
          tipo_evento: ev.tipo_evento,
          descripcion: ev.descripcion,
          es_lectivo: ev.es_lectivo,
          fecha_inicio: ev.fecha_inicio,
          fecha_fin: ev.fecha_fin
        }
      });
    });

    // 2. Unidades de Trabajo según su Temporización didáctica.
    (temporizaciones || []).forEach((temp) => {
      if (!temp.fecha_ini_prevista) return;

      const ut = Array.isArray(temp.Unidades_Trabajo)
        ? temp.Unidades_Trabajo[0]
        : temp.Unidades_Trabajo;
      const curso = Array.isArray(temp.Cursos) ? temp.Cursos[0] : temp.Cursos;
      const modulo = ut?.Modulos
        ? (Array.isArray(ut.Modulos) ? ut.Modulos[0] : ut.Modulos)
        : null;

      const nombreCurso = curso?.nombre || '';
      const siglasModulo = modulo?.siglas || modulo?.nombre || '';
      const identificadorClase = [nombreCurso, siglasModulo].filter(Boolean).join(' · ');
      const prefijoClase = identificadorClase ? `[${identificadorClase}] ` : '';
      const numUT = ut?.numero ? `UT ${ut.numero}: ` : '';
      const nombreUT = temp.nombre_alternativo || ut?.nombre || 'Unidad de Trabajo';
      const titulo = `📚 ${prefijoClase}${numUT}${nombreUT}`;

      // Colores de avance didáctico:
      let colorFondo = '#64748b'; // Pendiente (Gris)
      let colorBorde = '#475569';
      if (temp.estado === 'En Curso') {
        colorFondo = '#2563eb'; // En Curso (Azul)
        colorBorde = '#1d4ed8';
      } else if (temp.estado === 'Completada') {
        colorFondo = '#16a34a'; // Completada (Verde)
        colorBorde = '#15803d';
      }

      // Se obtienen los tramos laborables (lunes a viernes) para no representar la temporización en fines de semana.
      const segmentosLaborables = obtenerSegmentosLaborables(
        temp.fecha_ini_prevista,
        temp.fecha_fin_prevista || temp.fecha_ini_prevista
      );

      segmentosLaborables.forEach((seg, idx) => {
        lista.push({
          id: `ut_${temp.id_temporizacion}_${idx}`,
          groupId: `ut_${temp.id_temporizacion}`,
          title: titulo,
          start: seg.start,
          end: seg.end,
          allDay: true,
          backgroundColor: colorFondo,
          borderColor: colorBorde,
          textColor: '#ffffff',
          extendedProps: {
            esUT: true,
            id_temporizacion: temp.id_temporizacion,
            id_ut: temp.id_ut,
            id_curso: temp.id_curso,
            cursoNombre: nombreCurso,
            cursoAnyo: curso?.anyo || '',
            cursoCentro: curso?.centro || '',
            moduloNombre: modulo?.nombre || '',
            moduloSiglas: modulo?.siglas || '',
            numero: ut?.numero || null,
            nombre: ut?.nombre || '',
            nombre_alternativo: temp.nombre_alternativo || '',
            descripcion: ut?.descripcion || '',
            estado: temp.estado || 'Pendiente',
            observaciones: temp.observaciones || '',
            fecha_ini_prevista: temp.fecha_ini_prevista,
            fecha_fin_prevista: temp.fecha_fin_prevista || temp.fecha_ini_prevista,
            fecha_ini_real: temp.fecha_ini_real || null,
            fecha_fin_real: temp.fecha_fin_real || null,
            orden: temp.orden || 1,
            unidad_trabajo: ut || null
          }
        });
      });
    });

    return lista;
  }, [eventosCalendario, temporizaciones]);

  // Manejador al seleccionar un día o arrastrar un rango de días en el calendario para crear un evento escolar.
  const manejarSeleccionRango = useCallback((selectionInfo) => {
    const fFin = new Date(selectionInfo.end.getTime());
    fFin.setDate(fFin.getDate() - 1);
    const fechaFinInclusivaISO = formatearFechaISO(fFin);
    const fechaInicioISO = selectionInfo.startStr;

    let celda =
      document.querySelector(`.fc-day[data-date="${fechaInicioISO}"]`) ||
      document.querySelector(`[data-date="${fechaInicioISO}"]`);

    if (!celda && selectionInfo.jsEvent?.target) {
      const target = selectionInfo.jsEvent.target;
      celda = target.closest ? (target.closest('[data-date]') || target.closest('td')) : target;
    }

    setEventoParaOverlay({
      id_evento: null,
      id_curso: null,
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

  // Manejador al hacer clic sobre un evento del calendario (diferencia entre UT y Evento Escolar).
  const manejarClickEvento = useCallback((eventClickInfo) => {
    if (eventClickInfo.jsEvent) {
      eventClickInfo.jsEvent.preventDefault();
      eventClickInfo.jsEvent.stopPropagation();
    }

    const props = eventClickInfo.event?.extendedProps;
    if (!props) return;

    // Caso 1: Unidad de Trabajo didáctica -> Abrir diálogo de detalle curricular
    if (props.esUT) {
      setUnidadDetalle(props);
      setDialogoUTVisible(true);
      return;
    }

    // Caso 2: Evento del Calendario Escolar -> Abrir OverlayEditorEvento
    const evOriginal = props.eventoOriginal;
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

  // Manejador del botón "+ Añadir Evento" en la cabecera.
  const manejarBotonNuevoEvento = useCallback((e) => {
    const hoyStr = formatearFechaISO(new Date());
    setEventoParaOverlay({
      id_evento: null,
      id_curso: null,
      fecha_inicio: hoyStr,
      fecha_fin: hoyStr,
      tipo_evento: 'Festivo Nacional',
      descripcion: '',
      es_lectivo: false
    });

    if (overlayRef.current && botonAnadirRef.current) {
      overlayRef.current.hide();
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.show(e, botonAnadirRef.current);
        }
      }, 50);
    }
  }, []);

  // Guardado de evento de Calendario Escolar desde OverlayEditorEvento.
  const manejarGuardarEvento = useCallback(
    async (datosEvento) => {
      if (datosEvento.id_evento) {
        await actualizarEvento(datosEvento.id_evento, { ...datosEvento, id_curso: null });
      } else {
        await agregarEvento({ ...datosEvento, id_curso: null });
      }

      const api = calendarRef.current?.getApi();
      if (api) api.unselect();
    },
    [actualizarEvento, agregarEvento]
  );

  // Eliminación de evento de Calendario Escolar.
  const manejarEliminarEvento = useCallback(
    async (idEvento) => {
      if (idEvento) {
        await eliminarEvento(idEvento);
      }
    },
    [eliminarEvento]
  );

  // Manejador de cambio de estado de una Unidad de Trabajo desde DialogoDetalleUnidad.
  const manejarCambiarEstadoUT = useCallback(
    async (idTemporizacion, nuevoEstado) => {
      if (!idTemporizacion || !nuevoEstado) return;
      setGuardandoUT(true);

      // Actualización optimista local
      setTemporizaciones((prev) =>
        prev.map((t) => (t.id_temporizacion === idTemporizacion ? { ...t, estado: nuevoEstado } : t))
      );
      setUnidadDetalle((prev) => (prev ? { ...prev, estado: nuevoEstado } : prev));

      try {
        const res = await actualizarTemporizacionDb('id_temporizacion', idTemporizacion, {
          estado: nuevoEstado
        });
        if (res) {
          mostrarExito(`Estado de la unidad actualizado a "${nuevoEstado}".`);
        } else {
          throw new Error('No se pudo actualizar en la base de datos.');
        }
      } catch (err) {
        console.error('Error al actualizar estado de la UT:', err);
        mostrarError('Error al actualizar el estado de la unidad.');
        cargarTemporizaciones();
      } finally {
        setGuardandoUT(false);
      }
    },
    [actualizarTemporizacionDb, mostrarExito, mostrarError, cargarTemporizaciones]
  );

  // Manejador de arrastre (eventDrop) para mover eventos o unidades de trabajo a otra fecha.
  const manejarEventDrop = useCallback(
    async (dropInfo) => {
      const props = dropInfo.event?.extendedProps;
      if (!props) return;

      const fechaInicioISO = dropInfo.event.startStr;
      let fechaFinInclusivaISO = fechaInicioISO;
      if (dropInfo.event.endStr) {
        const dFin = parsearFechaISO(dropInfo.event.endStr);
        if (dFin) {
          dFin.setDate(dFin.getDate() - 1);
          fechaFinInclusivaISO = formatearFechaISO(dFin);
        }
      }

      // Caso 1: Arrastre de Unidad de Trabajo (Temporizacion)
      if (props.esUT) {
        const idTemp = props.id_temporizacion;
        const msPorDia = 1000 * 60 * 60 * 24;
        const diasDelta = Math.round((dropInfo.event.start.getTime() - dropInfo.oldEvent.start.getTime()) / msPorDia);

        if (diasDelta === 0) return;

        const dIniActual = parsearFechaISO(props.fecha_ini_prevista);
        const dFinActual = parsearFechaISO(props.fecha_fin_prevista || props.fecha_ini_prevista);

        if (!dIniActual || !dFinActual) {
          dropInfo.revert();
          return;
        }

        dIniActual.setDate(dIniActual.getDate() + diasDelta);
        dFinActual.setDate(dFinActual.getDate() + diasDelta);

        const nuevaFechaIniISO = formatearFechaISO(dIniActual);
        const nuevaFechaFinISO = formatearFechaISO(dFinActual);

        try {
          const res = await actualizarTemporizacionDb('id_temporizacion', idTemp, {
            fecha_ini_prevista: nuevaFechaIniISO,
            fecha_fin_prevista: nuevaFechaFinISO
          });
          if (res) {
            mostrarExito('Fechas de la unidad curricular actualizadas.');
            setTemporizaciones((prev) =>
              prev.map((t) =>
                t.id_temporizacion === idTemp
                  ? { ...t, fecha_ini_prevista: nuevaFechaIniISO, fecha_fin_prevista: nuevaFechaFinISO }
                  : t
              )
            );
          } else {
            throw new Error();
          }
        } catch (err) {
          console.error('Error al actualizar fechas de UT:', err);
          mostrarError('Error al mover la unidad de trabajo.');
          dropInfo.revert();
        }
        return;
      }

      // Caso 2: Arrastre de Evento de Calendario Escolar
      const evOriginal = props.eventoOriginal;
      if (evOriginal) {
        const exito = await actualizarEvento(evOriginal.id_evento, {
          ...evOriginal,
          fecha_inicio: fechaInicioISO,
          fecha_fin: fechaFinInclusivaISO
        });
        if (!exito) dropInfo.revert();
      }
    },
    [actualizarTemporizacionDb, actualizarEvento, mostrarExito, mostrarError]
  );

  // Manejador de redimensionado (eventResize) para alargar o acortar fechas.
  const manejarEventResize = useCallback(
    async (resizeInfo) => {
      const props = resizeInfo.event?.extendedProps;
      if (!props) return;

      const fechaInicioISO = resizeInfo.event.startStr;
      let fechaFinInclusivaISO = fechaInicioISO;
      if (resizeInfo.event.endStr) {
        const dFin = parsearFechaISO(resizeInfo.event.endStr);
        if (dFin) {
          dFin.setDate(dFin.getDate() - 1);
          fechaFinInclusivaISO = formatearFechaISO(dFin);
        }
      }

      // Caso 1: Redimensionado de Unidad de Trabajo
      if (props.esUT) {
        const idTemp = props.id_temporizacion;
        const msPorDia = 1000 * 60 * 60 * 24;
        const diasDelta = Math.round((resizeInfo.event.end.getTime() - resizeInfo.oldEvent.end.getTime()) / msPorDia);

        if (diasDelta === 0) return;

        const dFinActual = parsearFechaISO(props.fecha_fin_prevista || props.fecha_ini_prevista);
        if (!dFinActual) {
          resizeInfo.revert();
          return;
        }

        dFinActual.setDate(dFinActual.getDate() + diasDelta);
        const nuevaFechaFinISO = formatearFechaISO(dFinActual);

        try {
          const res = await actualizarTemporizacionDb('id_temporizacion', idTemp, {
            fecha_fin_prevista: nuevaFechaFinISO
          });
          if (res) {
            mostrarExito('Duración de la unidad curricular actualizada.');
            setTemporizaciones((prev) =>
              prev.map((t) =>
                t.id_temporizacion === idTemp
                  ? { ...t, fecha_fin_prevista: nuevaFechaFinISO }
                  : t
              )
            );
          } else {
            throw new Error();
          }
        } catch (err) {
          console.error('Error al redimensionar fechas de UT:', err);
          mostrarError('Error al cambiar la duración de la unidad.');
          resizeInfo.revert();
        }
        return;
      }

      // Caso 2: Redimensionado de Evento de Calendario Escolar
      const evOriginal = props.eventoOriginal;
      if (evOriginal) {
        const exito = await actualizarEvento(evOriginal.id_evento, {
          ...evOriginal,
          fecha_inicio: fechaInicioISO,
          fecha_fin: fechaFinInclusivaISO
        });
        if (!exito) resizeInfo.revert();
      }
    },
    [actualizarTemporizacionDb, actualizarEvento, mostrarExito, mostrarError]
  );

  // Recarga unificada de ambas fuentes de datos.
  const manejarRecargar = async () => {
    await cargarTemporizaciones();
  };

  const estaCargando = (cargandoCalendario && eventosCalendario.length === 0) || (cargandoUTs && temporizaciones.length === 0);

  // Cabecera del Card con título, leyenda rápida combinada, botón de añadir evento y refresco.
  const renderHeader = () => (
    <div className="p-3 border-bottom-1 surface-border flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-calendar text-primary text-xl" />
        <div>
          <h2 className="text-lg font-bold text-900 m-0">Agenda Escolar</h2>
          <span className="text-xs text-color-secondary">
            Calendario oficial de eventos y temporización de unidades didácticas
          </span>
        </div>
      </div>

      <div className="flex align-items-center gap-2 flex-wrap">
        {/* Leyenda rápida combinada */}
        <div className="hidden lg:flex align-items-center gap-3 text-xs">
          <div className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round inline-block shadow-1" style={{ backgroundColor: '#2563eb' }} />
            <span className="text-color-secondary font-medium">UTs</span>
          </div>
          <div className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round inline-block shadow-1" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-color-secondary font-medium">Festivos</span>
          </div>
          <div className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round inline-block shadow-1" style={{ backgroundColor: '#f97316' }} />
            <span className="text-color-secondary font-medium">Exámenes</span>
          </div>
          <div className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round inline-block shadow-1" style={{ backgroundColor: '#86efac' }} />
            <span className="text-color-secondary font-medium">Evaluaciones</span>
          </div>
        </div>

        {/* Botón para añadir evento copiando el sistema del calendario escolar */}
        <Button
          ref={botonAnadirRef}
          label="Añadir Evento"
          icon="pi pi-plus"
          size="small"
          onClick={manejarBotonNuevoEvento}
          loading={guardandoCalendario}
        />

        <Button
          icon="pi pi-refresh"
          rounded
          text
          severity="secondary"
          size="small"
          onClick={manejarRecargar}
          loading={cargandoUTs || cargandoCalendario}
          tooltip="Refrescar agenda"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    </div>
  );

  // Pie del Card con accesos directos a ambas vistas completas.
  const renderFooter = () => (
    <div className="pt-2 border-top-1 surface-border flex flex-column sm:flex-row justify-content-between align-items-center gap-2 text-xs text-color-secondary">
      <span>
        Pulsa o arrastra sobre cualquier día para crear eventos o gestionar las unidades.
      </span>
      <div className="flex align-items-center gap-3">
        <Button
          label="Temporización"
          icon="pi pi-calendar-times"
          text
          size="small"
          onClick={() => navigate('/planificacion/temporizacion')}
          className="p-0 text-xs"
        />
        <Button
          label="Calendario Escolar Completo"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/planificacion/calendario-escolar')}
          className="p-0 text-xs font-semibold"
        />
      </div>
    </div>
  );

  return (
    <Card
      header={renderHeader()}
      footer={renderFooter()}
      className="surface-card border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between"
      pt={{
        body: { className: 'p-3 flex-1 flex flex-column justify-content-between' },
        content: { className: 'p-0 flex-1' }
      }}
    >
      {estaCargando ? (
        <div className="py-4">
          <CargadorSeccion cargando={true} tipo="tarjetas" filas={2} columnas={1} />
        </div>
      ) : (
        <div className="calendario-interactivo-contenedor w-full py-1">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana'
            }}
            locale={esLocale}
            firstDay={1}
            selectable={true}
            selectMirror={true}
            unselectAuto={false}
            select={manejarSeleccionRango}
            eventClick={manejarClickEvento}
            editable={true}
            eventDrop={manejarEventDrop}
            eventResize={manejarEventResize}
            events={todosLosEventos}
            height="auto"
            dayMaxEvents={3}
            displayEventTime={false}
            eventDidMount={(info) => {
              const props = info.event?.extendedProps;
              if (!props) return;
              if (props.esUT) {
                const estado = props.estado || 'Pendiente';
                info.el?.setAttribute(
                  'title',
                  `[${props.cursoNombre} · ${props.moduloSiglas}] UT ${props.numero || ''}: ${props.nombre} (${estado})`
                );
              } else {
                const desc = props.descripcion ? ` - ${props.descripcion}` : '';
                const lectivo = props.es_lectivo ? 'Lectivo' : 'No lectivo';
                info.el?.setAttribute(
                  'title',
                  `${props.tipo_evento || 'Evento'} (${lectivo})${desc}`
                );
              }
            }}
          />
        </div>
      )}

      {/* Popover flotante oficial de edición y creación de eventos del Calendario Escolar */}
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
        guardando={guardandoCalendario}
      />

      {/* Diálogo modal de detalle de la Unidad de Trabajo seleccionada */}
      <DialogoDetalleUnidad
        visible={dialogoUTVisible}
        onOcultar={() => setDialogoUTVisible(false)}
        unidad={unidadDetalle}
        onCambiarEstado={manejarCambiarEstadoUT}
        guardando={guardandoUT}
      />
    </Card>
  );
};

export default WidgetAgendaEscolar;
