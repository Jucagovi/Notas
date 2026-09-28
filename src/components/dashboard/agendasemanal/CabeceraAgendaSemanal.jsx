import React from 'react';
import { Button } from 'primereact/button';

/**
 * CabeceraAgendaSemanal - Componente presentacional para la cabecera del widget de la agenda semanal.
 *
 * Responsabilidad Única: Renderizar el título, el rango de fechas de la semana lectiva
 * y los controles de navegación temporal (semana anterior, siguiente y semana actual).
 *
 * @param {Object} props
 * @param {string} props.fechaInicio - Fecha formateada de inicio de la semana (lunes).
 * @param {string} props.fechaFin - Fecha formateada de fin de la semana (domingo).
 * @param {boolean} props.esSemanaActual - Indicador de si se visualiza la semana actual del calendario.
 * @param {Function} props.onSemanaAnterior - Manejador para retroceder una semana.
 * @param {Function} props.onSemanaSiguiente - Manejador para avanzar una semana.
 * @param {Function} props.onSemanaActual - Manejador para retornar a la semana actual.
 * @param {Function} [props.onIrTemporizacion] - Manejador opcional para acceder a la vista completa de temporización.
 */
const CabeceraAgendaSemanal = ({
  fechaInicio,
  fechaFin,
  esSemanaActual,
  onSemanaAnterior,
  onSemanaSiguiente,
  onSemanaActual,
  onIrTemporizacion
}) => {
  return (
    <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2 p-3 border-bottom-1 surface-border">
      {/* Título e identificación del intervalo semanal */}
      <div className="flex align-items-center gap-2">
        <i className="pi pi-calendar-plus text-primary text-xl" />
        <div>
          <h2 className="text-lg font-bold text-900 m-0">Agenda Semanal</h2>
          <span className="text-xs text-color-secondary">
            {fechaInicio && fechaFin
              ? `Semana del ${fechaInicio} al ${fechaFin}`
              : 'Semana en curso'}
          </span>
        </div>
      </div>

      {/* Controles de navegación temporal y acceso al gestor */}
      <div className="flex align-items-center gap-1 self-end sm:self-auto">
        <Button
          icon="pi pi-chevron-left"
          rounded
          text
          size="small"
          severity="secondary"
          onClick={onSemanaAnterior}
          tooltip="Semana anterior"
          tooltipOptions={{ position: 'top' }}
          aria-label="Semana anterior"
        />

        {!esSemanaActual && (
          <Button
            label="Hoy"
            size="small"
            outlined
            severity="secondary"
            onClick={onSemanaActual}
            tooltip="Volver a la semana actual"
            tooltipOptions={{ position: 'top' }}
            className="py-1 px-2 text-xs"
          />
        )}

        <Button
          icon="pi pi-chevron-right"
          rounded
          text
          size="small"
          severity="secondary"
          onClick={onSemanaSiguiente}
          tooltip="Semana siguiente"
          tooltipOptions={{ position: 'top' }}
          aria-label="Semana siguiente"
        />

        {onIrTemporizacion && (
          <Button
            icon="pi pi-external-link"
            rounded
            text
            size="small"
            severity="primary"
            onClick={onIrTemporizacion}
            tooltip="Abrir gestión de Temporización"
            tooltipOptions={{ position: 'top' }}
            aria-label="Abrir temporización"
            className="ml-1"
          />
        )}
      </div>
    </div>
  );
};

export default CabeceraAgendaSemanal;
