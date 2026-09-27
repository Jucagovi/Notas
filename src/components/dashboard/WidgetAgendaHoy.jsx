import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearFechaEspanol, obtenerNombreDiaSemana } from '../../utils/fechas.js';

/**
 * WidgetAgendaHoy - Componente presentacional para la operativa diaria del docente.
 *
 * Responsabilidad Única: Renderizar la línea temporal de las sesiones y eventos del día,
 * señalando exámenes con etiquetas de advertencia y cancelaciones visuales en caso de festivo.
 *
 * @param {Object} props
 * @param {Object} props.agenda - Datos de la agenda diaria (esFestivo, eventoEspecial, items).
 * @param {string} props.fechaHoy - Fecha actual en formato ISO.
 */
export const WidgetAgendaHoy = ({ agenda, fechaHoy }) => {
  const navigate = useNavigate();
  const { esFestivo = false, eventoEspecial = null, items = [] } = agenda || {};

  const nombreDia = obtenerNombreDiaSemana(fechaHoy);
  const fechaEspanol = formatearFechaEspanol(fechaHoy);

  // Plantilla para la hora en el lado opuesto de la línea temporal.
  const plantillaHora = (item) => (
    <div className="flex flex-column align-items-end mr-2">
      <span className="text-sm font-bold text-900">{item.horaInicio}</span>
      <span className="text-xs text-color-secondary">{item.horaFin}</span>
    </div>
  );

  // Plantilla para el marcador iconográfico del evento.
  const plantillaMarcador = (item) => {
    let colorFondo = 'bg-primary';
    if (item.cancelada) colorFondo = 'bg-gray-400';
    else if (item.esExamen) colorFondo = 'bg-orange-500';
    else if (!item.esClaseCurricular) colorFondo = 'bg-teal-500';

    return (
      <span className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1 ${colorFondo}`}>
        <i className={`${item.icono} text-sm`} />
      </span>
    );
  };

  // Plantilla del contenido informativo de cada sesión.
  const plantillaContenido = (item) => (
    <div className={`p-2 border-round surface-card border-1 surface-border mb-2 shadow-1 ${item.cancelada ? 'opacity-60' : ''}`}>
      <div className="flex align-items-center justify-content-between gap-2 flex-wrap">
        <span className={`font-semibold text-sm ${item.cancelada ? 'line-through text-color-secondary' : 'text-900'}`}>
          {item.titulo}
        </span>
        <div className="flex align-items-center gap-1">
          {item.esExamen && (
            <Tag value="Examen" severity="warning" className="text-xs" />
          )}
          {item.cancelada && (
            <Tag value="No lectivo" severity="secondary" className="text-xs" />
          )}
        </div>
      </div>

      <div className="flex align-items-center gap-3 mt-1 text-xs text-color-secondary">
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

        {/* Notificación de día festivo o evento especial */}
        {eventoEspecial && (
          <div className={`p-2 border-round text-xs font-semibold mb-3 flex align-items-center gap-2 ${
            esFestivo ? 'bg-orange-50 text-orange-700 border-1 border-orange-200' : 'bg-blue-50 text-blue-700 border-1 border-blue-200'
          }`}>
            <i className={esFestivo ? 'pi pi-sun' : 'pi pi-info-circle'} />
            <span>{eventoEspecial}</span>
          </div>
        )}

        {/* Listado temporal vertical de sesiones */}
        {items.length === 0 ? (
          <EstadoVacio
            mensaje="Sin sesiones programadas hoy"
            descripcion="No constan tramos lectivos asignados a tu horario en el día de hoy."
            icono="pi pi-check-circle"
            className="my-2 p-4"
          />
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
            <Timeline
              value={items}
              opposite={plantillaHora}
              marker={plantillaMarcador}
              content={plantillaContenido}
              className="customized-timeline text-sm"
            />
          </div>
        )}
      </div>

      {/* Pie con acceso rápido a Diario */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-content-between align-items-center">
        <span className="text-xs text-color-secondary">
          {items.length} {items.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
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
