import React, { useState, useEffect, useMemo } from 'react';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearFechaEspanol, obtenerNombreDiaSemana } from '../../utils/fechas.js';

/**
 * WidgetAgendaHoy - Componente presentacional para la operativa diaria del docente.
 *
 * Responsabilidad Única: Renderizar la línea temporal de las sesiones del día alineadas
 * a la izquierda, identificando de manera visual e inequívoca aquellas clases que ya han
 * finalizado o que se encuentran en curso sin retirarlas de la vista.
 *
 * @param {Object} props
 * @param {Object} props.agenda - Datos de la agenda diaria (esFestivo, eventoEspecial, items).
 * @param {string} props.fechaHoy - Fecha actual en formato ISO.
 */
export const WidgetAgendaHoy = ({ agenda, fechaHoy }) => {
  const navigate = useNavigate();
  const { items = [] } = agenda || {};

  const nombreDia = obtenerNombreDiaSemana(fechaHoy);
  const fechaEspanol = formatearFechaEspanol(fechaHoy);

  // Minuto actual del día (0 a 1439) actualizado periódicamente cada 30 segundos.
  const [minutosActuales, setMinutosActuales] = useState(() => {
    const ahora = new Date();
    return ahora.getHours() * 60 + ahora.getMinutes();
  });

  useEffect(() => {
    const temporizador = setInterval(() => {
      const ahora = new Date();
      setMinutosActuales(ahora.getHours() * 60 + ahora.getMinutes());
    }, 30000);

    return () => clearInterval(temporizador);
  }, []);

  // Comprueba si una sesión ha concluido en función de su hora de finalización.
  const esSesionPasada = (horaFin) => {
    if (!horaFin || horaFin === '--:--') return false;
    const partes = horaFin.split(':').map(Number);
    if (partes.length < 2 || isNaN(partes[0]) || isNaN(partes[1])) return false;
    return minutosActuales >= partes[0] * 60 + partes[1];
  };

  // Comprueba si una sesión se está impartiendo en el momento presente.
  const esSesionEnCurso = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin || horaInicio === '--:--' || horaFin === '--:--') return false;
    const pIni = horaInicio.split(':').map(Number);
    const pFin = horaFin.split(':').map(Number);
    if (pIni.length < 2 || pFin.length < 2 || isNaN(pIni[0]) || isNaN(pFin[0])) return false;
    const minIni = pIni[0] * 60 + pIni[1];
    const minFin = pFin[0] * 60 + pFin[1];
    return minutosActuales >= minIni && minutosActuales < minFin;
  };

  // Plantilla para el marcador iconográfico del evento en la línea temporal.
  const plantillaMarcador = (item) => {
    const haPasado = esSesionPasada(item.horaFin);
    const estaEnCurso = esSesionEnCurso(item.horaInicio, item.horaFin);

    let colorFondo = 'bg-primary';
    let icono = item.icono || 'pi pi-book';

    if (haPasado) {
      colorFondo = 'bg-green-600';
      icono = 'pi pi-check';
    } else if (estaEnCurso) {
      colorFondo = 'bg-blue-600';
      icono = 'pi pi-spin pi-spinner';
    } else if (!item.esClaseCurricular) {
      colorFondo = 'bg-teal-500';
      icono = 'pi pi-clock';
    }

    return (
      <span
        className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1 ${colorFondo}`}
        title={haPasado ? 'Clase impartida' : estaEnCurso ? 'Clase en curso' : 'Clase programada'}
      >
        <i className={`${icono} text-sm`} />
      </span>
    );
  };

  // Plantilla del contenido informativo de cada sesión alineado a la izquierda.
  const plantillaContenido = (item) => {
    const haPasado = esSesionPasada(item.horaFin);
    const estaEnCurso = esSesionEnCurso(item.horaInicio, item.horaFin);

    return (
      <div
        className={`p-3 border-round border-1 mb-3 transition-all transition-duration-150 ${
          haPasado
            ? 'surface-50 border-300 opacity-75 shadow-none'
            : estaEnCurso
            ? 'surface-card border-primary border-2 shadow-2'
            : 'surface-card surface-border shadow-1 hover:surface-hover'
        }`}
      >
        {/* Intervalo de horas y etiquetas de estado: impartida o en curso */}
        <div className="flex align-items-center justify-content-between gap-2 mb-1 flex-wrap">
          <span
            className={`text-xs font-bold flex align-items-center gap-1 ${
              haPasado
                ? 'text-color-secondary line-through'
                : estaEnCurso
                ? 'text-primary font-bold'
                : 'text-900'
            }`}
          >
            <i className="pi pi-clock text-xs" />
            {item.horaInicio} - {item.horaFin}
          </span>
          <div className="flex align-items-center gap-1">
            {haPasado && (
              <Tag
                value="Impartida"
                severity="secondary"
                icon="pi pi-check"
                className="text-xs py-0 px-2"
              />
            )}
            {estaEnCurso && (
              <Tag
                value="En curso"
                severity="info"
                icon="pi pi-spin pi-spinner"
                className="text-xs py-0 px-2"
              />
            )}
          </div>
        </div>

        {/* Denominación de la asignatura o módulo profesional */}
        <div className="font-semibold text-sm text-900 mb-1">
          <span>{item.titulo}</span>
        </div>

        {/* Detalles de localización: aula y grupo de discentes */}
        <div className="flex align-items-center gap-3 text-xs text-color-secondary">
          {item.aula && (
            <span className="flex align-items-center gap-1">
              <i className="pi pi-map-marker text-xs" />
              Aula {item.aula}
            </span>
          )}
          {item.grupo && (
            <span className="flex align-items-center gap-1">
              <i className="pi pi-users text-xs" />
              {item.grupo}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Conteo de clases finalizadas en el día.
  const sesionesImpartidas = useMemo(() => {
    return items.filter((it) => esSesionPasada(it.horaFin)).length;
  }, [items, minutosActuales]);

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Agenda de Hoy</h2>
              <span className="text-xs text-color-secondary">
                {nombreDia ? `${nombreDia}, ` : ''}{fechaEspanol}
              </span>
            </div>
          </div>
          <Button
            label="Diario"
            icon="pi pi-book"
            size="small"
            outlined
            onClick={() => navigate('/evaluacion/diario')}
            tooltip="Abrir Diario de Aula"
            tooltipOptions={{ position: 'top' }}
          />
        </div>

        {/* Listado temporal vertical de sesiones alineadas a la izquierda */}
        {items.length === 0 ? (
          <EstadoVacio
            mensaje="Sin sesiones programadas hoy"
            descripcion="No constan tramos lectivos asignados a tu horario en el día de hoy."
            icono="pi pi-clock"
            className="my-2 p-4"
          />
        ) : (
          <div className="w-full">
            <Timeline
              value={items}
              marker={plantillaMarcador}
              content={plantillaContenido}
              pt={{
                opposite: { className: 'hidden' }
              }}
              className="w-full text-sm"
            />
          </div>
        )}
      </div>

      {/* Pie con síntesis del avance diario y acceso rápido a Diario */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-content-between align-items-center">
        <span className="text-xs text-color-secondary">
          {sesionesImpartidas > 0
            ? `${sesionesImpartidas} de ${items.length} ${items.length === 1 ? 'clase impartida' : 'clases impartidas'}`
            : `${items.length} ${items.length === 1 ? 'clase registrada' : 'clases registradas'}`}
        </span>
        <Button
          label="Ir al Diario de Aula"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/evaluacion/diario')}
        />
      </div>
    </div>
  );
};

export default WidgetAgendaHoy;
