import React from 'react';

/**
 * LeyendaCalendario - Subcomponente presentacional que describe el significado de los colores del calendario.
 *
 * Responsabilidad Única: Ofrecer una guía visual rápida al docente para interpretar el estado
 * de los días lectivos, fines de semana, festivos y rangos fuera del curso.
 */
export const LeyendaCalendario = () => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 shadow-1 flex flex-wrap align-items-center justify-content-between gap-3 text-sm">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-info-circle text-primary text-base" />
        <span className="font-bold text-900 text-xs uppercase tracking-wider">
          Leyenda del Calendario
        </span>
      </div>

      <div className="flex flex-wrap align-items-center gap-3">
        {/* Día lectivo ordinario */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round border-1 surface-border inline-block"
            style={{ backgroundColor: 'var(--surface-0, #ffffff)' }}
          />
          <span className="text-700 text-xs">Lectivo Ordinario</span>
        </div>

        {/* Fines de semana inactivos */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block"
            style={{ backgroundColor: '#94a3b8', opacity: 0.5 }}
          />
          <span className="text-700 text-xs">Fin de Semana (Inactivo)</span>
        </div>

        {/* Festivo / Día no lectivo marcado */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block"
            style={{ backgroundColor: '#ef4444' }}
          />
          <span className="text-700 text-xs">Festivo / No Lectivo</span>
        </div>

        {/* Festivo con motivo asignado */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block relative"
            style={{ backgroundColor: '#ef4444' }}
          >
            <span
              className="w-4px h-4px border-circle inline-block absolute"
              style={{
                backgroundColor: '#ffffff',
                bottom: '2px',
                left: 'calc(50% - 2px)'
              }}
            />
          </span>
          <span className="text-700 text-xs">Con Motivo Anotado</span>
        </div>

        {/* Fuera del periodo de clases */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block"
            style={{ backgroundColor: 'var(--surface-300, #cbd5e1)', opacity: 0.4 }}
          />
          <span className="text-700 text-xs">Fuera del Curso</span>
        </div>
      </div>
    </div>
  );
};

export default LeyendaCalendario;
