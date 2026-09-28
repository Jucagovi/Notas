import React from 'react';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { formatearFechaEspanol } from '../../../utils/fechas.js';

/**
 * TarjetaModuloAgenda - Componente presentacional interactivo de un módulo en la agenda semanal.
 *
 * Responsabilidad Única: Renderizar una tarjeta interactiva con la información del módulo
 * y sus Unidades de Trabajo planificadas durante la semana lectiva, respondiendo al clic
 * para la navegación hacia el gestor de temporización.
 *
 * @param {Object} props
 * @param {Object} props.modulo - Datos del módulo profesional y sus unidades de la semana.
 * @param {Function} props.onClick - Manejador del evento de clic sobre la tarjeta.
 */
const TarjetaModuloAgenda = ({ modulo, onClick }) => {
  // Determinación de la severidad del tag según el estado de la unidad de trabajo.
  const obtenerSeveridadEstado = (estado) => {
    switch (estado) {
      case 'Completada':
        return 'success';
      case 'En Curso':
        return 'info';
      case 'Pendiente':
      default:
        return 'warning';
    }
  };

  const idSeguro = `tarjeta-modulo-${modulo.id_modulo}`;

  return (
    <div
      role="button"
      tabIndex={0}
      id={idSeguro}
      onClick={() => onClick && onClick(modulo)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(modulo);
        }
      }}
      className="surface-card border-1 surface-border border-round p-3 mb-2 transition-all transition-duration-150 hover:surface-hover hover:border-primary cursor-pointer shadow-1 hover:shadow-2 w-full"
    >
      {/* Cabecera de la tarjeta: siglas, nombre completo y flecha indicadora */}
      <div className="flex align-items-center justify-content-between gap-2 border-bottom-1 surface-border pb-2 mb-2">
        <div className="flex align-items-center gap-2 overflow-hidden flex-1">
          {modulo.siglas && (
            <Tag
              value={modulo.siglas}
              severity="info"
              className="text-xs font-bold flex-shrink-0"
            />
          )}
          <span
            className="font-bold text-900 text-sm md:text-base white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1"
            title={modulo.nombre}
          >
            {modulo.nombre}
          </span>
        </div>
        <i className="pi pi-chevron-right text-400 text-sm flex-shrink-0" />
      </div>

      {/* Relación de Unidades de Trabajo que se imparten esta semana */}
      <div className="flex flex-column gap-2">
        {modulo.unidades.map((ut) => (
          <div
            key={ut.id_temporizacion}
            className="surface-ground border-round p-2 flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2"
          >
            {/* Título de la unidad con distintivo numérico y curso */}
            <div className="flex align-items-center gap-2 overflow-hidden flex-1">
              <span className="font-semibold text-primary text-xs flex-shrink-0">
                UT {ut.numero}:
              </span>
              <span
                className="text-xs md:text-sm text-800 white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1"
                title={ut.nombre_alternativo || ut.nombre}
              >
                {ut.nombre_alternativo || ut.nombre}
              </span>
              {ut.cursoNombre && (
                <Tag
                  value={ut.cursoNombre}
                  severity="secondary"
                  className="text-xs font-normal flex-shrink-0"
                />
              )}
            </div>

            {/* Metadatos de la unidad: fechas previstas/reales e indicador de estado */}
            <div className="flex align-items-center gap-2 flex-shrink-0">
              <span className="text-xs text-color-secondary flex align-items-center gap-1">
                <i className="pi pi-calendar text-xs" />
                <span>
                  {formatearFechaEspanol(ut.fechaInicioEfectiva)} - {formatearFechaEspanol(ut.fechaFinEfectiva)}
                </span>
              </span>
              <Tag
                value={ut.estado}
                severity={obtenerSeveridadEstado(ut.estado)}
                className="text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TarjetaModuloAgenda;
