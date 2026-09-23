import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import SelectorCurso from '../common/SelectorCurso.jsx';
import { supabase } from '../../services/supabaseClient.js';
import { extraerAnioInicioCurso, formatearFechaEspanol } from '../../utils/fechas.js';
import { obtenerConfiguracionTipoEvento } from '../../utils/coloreCalendario.js';

/**
 * DialogoCopiarEventos - Modal para replicar los eventos del calendario desde otro curso académico.
 *
 * Responsabilidad Única: Permitir al usuario seleccionar un curso de origen, consultar sus eventos
 * en Calendario_Eventos y trasladarlos adaptando opcionalmente el desfase de años lectivos.
 *
 * @param {Object} props
 * @param {boolean} [props.visible=false] - Control de visibilidad del modal.
 * @param {Function} props.onOcultar - Callback para cerrar el modal.
 * @param {Function} props.onConfirmar - Callback con (cursoOrigenId, opciones).
 * @param {Array<Object>} [props.cursos=[]] - Lista completa de cursos académicos.
 * @param {Object|null} [props.cursoActual=null] - Curso activo en el que se trabaja.
 * @param {boolean} [props.cargando=false] - Indicador de guardado en curso.
 */
export const DialogoCopiarEventos = ({
  visible = false,
  onOcultar,
  onConfirmar,
  cursos = [],
  cursoActual = null,
  cargando = false
}) => {
  const [cursoOrigenId, setCursoOrigenId] = useState(null);
  const [eventosOrigen, setEventosOrigen] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [reemplazar, setReemplazar] = useState(true);
  const [ajustarAnio, setAjustarAnio] = useState(true);
  const [copiarLimites, setCopiarLimites] = useState(false);

  // Se excluye el curso actual para no clonar sobre sí mismo.
  const cursosDisponibles = useMemo(() => {
    if (!cursoActual) return cursos;
    return cursos.filter((c) => c.id_curso !== cursoActual.id_curso);
  }, [cursos, cursoActual]);

  const cursoOrigenObj = useMemo(() => {
    return cursos.find((c) => c.id_curso === cursoOrigenId) || null;
  }, [cursos, cursoOrigenId]);

  const anioOrigen = useMemo(() => {
    return cursoOrigenObj ? extraerAnioInicioCurso(cursoOrigenObj) : null;
  }, [cursoOrigenObj]);

  const anioDestino = useMemo(() => {
    return cursoActual ? extraerAnioInicioCurso(cursoActual) : null;
  }, [cursoActual]);

  const aniosDifieren = Boolean(anioOrigen && anioDestino && anioOrigen !== anioDestino);

  useEffect(() => {
    if (visible) {
      setCursoOrigenId(null);
      setEventosOrigen([]);
      setReemplazar(true);
      setAjustarAnio(true);
      setCopiarLimites(false);
    }
  }, [visible]);

  // Consulta de eventos en la tabla Calendario_Eventos para el curso de origen seleccionado.
  useEffect(() => {
    if (!cursoOrigenId) {
      setEventosOrigen([]);
      return;
    }

    let cancelado = false;
    const cargarEventosCurso = async () => {
      setCargandoDetalle(true);
      try {
        const { data, error } = await supabase
          .from('Calendario_Eventos')
          .select('id_evento, fecha_inicio, fecha_fin, tipo_evento, descripcion, es_lectivo')
          .eq('id_curso', cursoOrigenId)
          .order('fecha_inicio', { ascending: true });

        if (!cancelado) {
          if (error) throw error;
          setEventosOrigen(data || []);
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error al consultar eventos del curso origen:', err);
          setEventosOrigen([]);
        }
      } finally {
        if (!cancelado) setCargandoDetalle(false);
      }
    };

    cargarEventosCurso();
    return () => {
      cancelado = true;
    };
  }, [cursoOrigenId]);

  const manejarConfirmar = () => {
    if (!cursoOrigenId) return;
    onConfirmar(cursoOrigenId, {
      reemplazar,
      ajustarAnio,
      copiarLimites
    });
  };

  const pieDialogo = (
    <div className="flex align-items-center justify-content-end gap-2 pt-2">
      <Button
        type="button"
        label="Cancelar"
        text
        severity="secondary"
        onClick={onOcultar}
        disabled={cargando}
      />
      <Button
        type="button"
        label="Copiar Eventos"
        icon="pi pi-copy"
        onClick={manejarConfirmar}
        disabled={!cursoOrigenId || cargando || cargandoDetalle || eventosOrigen.length === 0}
        loading={cargando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onOcultar}
      header="Copiar Eventos de Otro Curso"
      footer={pieDialogo}
      modal
      className="p-fluid w-11 sm:w-9 md:w-7 lg:w-5"
    >
      <div className="flex flex-column gap-3 pt-2">
        <p className="text-color-secondary text-sm m-0">
          Seleccione un curso de referencia para importar sus festivos, vacaciones y eventos programados.
        </p>

        {/* Selector del curso de origen */}
        <div>
          <label htmlFor="selector-curso-origen" className="block text-900 font-semibold mb-2 text-sm">
            Curso de Origen
          </label>
          <SelectorCurso
            id="selector-curso-origen"
            value={cursoOrigenId}
            options={cursosDisponibles}
            onChange={(e) => setCursoOrigenId(e.value)}
            disabled={cargando}
            placeholder="Seleccione el curso a replicar..."
          />
        </div>

        {/* Indicador de estado de carga */}
        {cargandoDetalle && (
          <div className="flex align-items-center gap-2 text-500 text-sm py-2">
            <i className="pi pi-spin pi-spinner" />
            <span>Consultando eventos del curso seleccionado...</span>
          </div>
        )}

        {/* Resumen del curso de origen */}
        {cursoOrigenId && !cargandoDetalle && (
          <div className="surface-50 border-round-lg p-3 border-1 surface-border flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between">
              <span className="font-bold text-sm text-900">Eventos disponibles:</span>
              <Tag
                severity={eventosOrigen.length > 0 ? 'info' : 'warning'}
                value={`${eventosOrigen.length} ${eventosOrigen.length === 1 ? 'evento' : 'eventos'}`}
              />
            </div>

            {eventosOrigen.length === 0 ? (
              <p className="text-orange-600 text-xs m-0">
                El curso seleccionado no cuenta con eventos registrados en su calendario.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1 max-h-8rem overflow-y-auto pt-1">
                {eventosOrigen.slice(0, 10).map((ev) => {
                  const config = obtenerConfiguracionTipoEvento(ev.tipo_evento);
                  return (
                    <span
                      key={ev.id_evento}
                      className="text-xs px-2 py-1 border-round font-medium"
                      style={{
                        backgroundColor: config.colorFondo,
                        color: config.esLectivo ? '#14532d' : '#991b1b',
                        border: `1px solid ${config.colorBorde}`
                      }}
                    >
                      {formatearFechaEspanol(ev.fecha_inicio)}: {ev.tipo_evento}
                    </span>
                  );
                })}
                {eventosOrigen.length > 10 && (
                  <span className="text-xs text-500 self-center pl-1">
                    (+{eventosOrigen.length - 10} más...)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aviso de desfase anual si difieren los años */}
        {aniosDifieren && (
          <Message
            severity="info"
            text={`El curso de origen es ${anioOrigen} y el destino es ${anioDestino}. Las fechas se adaptarán automáticamente al año lectivo destino.`}
            className="w-full text-xs"
          />
        )}

        {/* Opciones adicionales de copia */}
        {cursoOrigenId && eventosOrigen.length > 0 && (
          <div className="flex flex-column gap-2 pt-1 border-top-1 surface-border">
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="copiar-ajustar-anio"
                checked={ajustarAnio}
                onChange={(e) => setAjustarAnio(e.checked)}
                disabled={!aniosDifieren}
              />
              <label htmlFor="copiar-ajustar-anio" className="text-sm text-700 cursor-pointer">
                Ajustar año automáticamente ({anioOrigen} &rarr; {anioDestino})
              </label>
            </div>

            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="copiar-reemplazar"
                checked={reemplazar}
                onChange={(e) => setReemplazar(e.checked)}
              />
              <label htmlFor="copiar-reemplazar" className="text-sm text-700 cursor-pointer">
                Reemplazar los eventos actuales del curso de destino
              </label>
            </div>

            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="copiar-limites"
                checked={copiarLimites}
                onChange={(e) => setCopiarLimites(e.checked)}
              />
              <label htmlFor="copiar-limites" className="text-sm text-700 cursor-pointer">
                Copiar también las fechas oficiales de inicio y fin de clases
              </label>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DialogoCopiarEventos;
