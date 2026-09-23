import React from 'react';
import { LISTA_TIPOS_EVENTO } from '../../utils/coloreCalendario.js';

/**
 * LeyendaCalendario - Subcomponente presentacional que expone la paleta y significado de los colores.
 *
 * Responsabilidad Única: Informar al docente de forma visual e inmediata sobre los 6 tipos de eventos
 * estandarizados en el calendario escolar, distinguiendo entre jornadas lectivas y no lectivas.
 *
 * @param {Object} props
 * @param {string} [props.className=''] - Clases CSS adicionales.
 */
export const LeyendaCalendario = ({ className = '' }) => {
  return (
    <div className={`surface-card border-round-xl border-1 surface-border p-3 shadow-1 flex flex-column gap-2 text-sm ${className}`.trim()}>
      <div className="flex align-items-center gap-2 pb-1 border-bottom-1 surface-border">
        <i className="pi pi-palette text-primary text-base" />
        <span className="font-bold text-900 text-xs uppercase tracking-wider">
          Leyenda del Calendario Escolar
        </span>
      </div>

      <div className="flex flex-wrap align-items-center gap-3 pt-1">
        {/* Los 6 tipos de eventos oficiales de la especificación */}
        {LISTA_TIPOS_EVENTO.map((item) => (
          <div key={item.id} className="flex align-items-center gap-2">
            <span
              className="w-1rem h-1rem border-round inline-block flex-shrink-0"
              style={{
                backgroundColor: item.color,
                border: `1px solid ${item.colorBorde || item.color}`
              }}
            />
            <span className="text-800 text-xs font-medium">
              {item.tipo}{' '}
              <span className={item.esLectivo ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                ({item.esLectivo ? 'Lectivo' : 'No lectivo'})
              </span>
            </span>
          </div>
        ))}

        {/* Fin de semana */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block flex-shrink-0"
            style={{ backgroundColor: '#94a3b8', opacity: 0.6 }}
          />
          <span className="text-600 text-xs">
            Fin de semana <span className="text-500">(Inactivo)</span>
          </span>
        </div>

        {/* Mes de agosto (Vacaciones legales) */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block flex-shrink-0"
            style={{ backgroundColor: 'rgba(148, 163, 184, 0.25)', border: '1px dashed #94a3b8' }}
          />
          <span className="text-600 text-xs">
            Agosto <span className="text-500">(Vacaciones legales)</span>
          </span>
        </div>

        {/* Fuera del periodo oficial de clases */}
        <div className="flex align-items-center gap-2">
          <span
            className="w-1rem h-1rem border-round inline-block flex-shrink-0"
            style={{ backgroundColor: '#cbd5e1', opacity: 0.4 }}
          />
          <span className="text-600 text-xs">
            Fuera de clases
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeyendaCalendario;
