import React from 'react';
import useTema from '../../hooks/useTema.js';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * Escala estándar de calificaciones según CONVENCIONES.md.
 */
const TRAMOS_NOTAS = [
  { valor: 30, etiqueta: 'Suspenso (< 50)' },
  { valor: 55, etiqueta: 'Suficiente (50 - 59)' },
  { valor: 65, etiqueta: 'Bien (60 - 69)' },
  { valor: 80, etiqueta: 'Notable (70 - 89)' },
  { valor: 95, etiqueta: 'Sobresaliente (90 - 100)' }
];

/**
 * LeyendaMapaCalor - Componente presentacional para la escala cromática y la guía de lectura analítica.
 *
 * Responsabilidad Única: Explicar visualmente la escala cromática oficial estandarizada
 * y detallar las pautas de lectura horizontal (alerta individual) y vertical (alerta pedagógica).
 */
export const LeyendaMapaCalor = () => {
  const { esOscuro } = useTema();

  return (
    <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1 mb-4">
      <div className="flex flex-column lg:flex-row lg:align-items-center justify-content-between gap-3">
        {/* Escala cromática */}
        <div className="flex flex-column gap-2">
          <span className="text-xs font-bold text-900 uppercase">
            Escala Cromática Oficial
          </span>
          <div className="flex flex-wrap gap-2 align-items-center">
            {TRAMOS_NOTAS.map((tramo) => {
              const { hex } = getColorNota(tramo.valor, esOscuro);
              return (
                <div
                  key={tramo.valor}
                  className="flex align-items-center gap-2 px-2 py-1 border-round text-xs font-semibold"
                  style={{
                    backgroundColor: `${hex}25`,
                    border: `1px solid ${hex}`,
                    color: hex
                  }}
                >
                  <span
                    className="w-1rem h-1rem border-round flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{tramo.etiqueta}</span>
                </div>
              );
            })}
            <div
              className="flex align-items-center gap-2 px-2 py-1 border-round text-xs font-semibold text-color-secondary"
              style={{
                backgroundColor: esOscuro ? '#1e293b' : '#f1f5f9',
                border: `1px solid ${esOscuro ? '#334155' : '#cbd5e1'}`
              }}
            >
              <span
                className="w-1rem h-1rem border-round flex-shrink-0"
                style={{ backgroundColor: esOscuro ? '#334155' : '#e2e8f0' }}
              />
              <span>Sin calificar / Sin datos</span>
            </div>
          </div>
        </div>

        {/* Guía de interpretación visual */}
        <div className="flex flex-column sm:flex-row gap-3 pt-2 lg:pt-0 border-top-1 lg:border-top-none lg:border-left-1 surface-border lg:pl-3">
          <div className="flex align-items-start gap-2 max-w-20rem">
            <i className="pi pi-arrows-h text-orange-500 text-lg mt-1" />
            <div>
              <span className="font-bold text-xs text-900 block">
                Lectura Horizontal (Alerta Individual)
              </span>
              <span className="text-xs text-color-secondary">
                Una fila completa en rojo o naranja evidencia un discente en riesgo crítico generalizado.
              </span>
            </div>
          </div>
          <div className="flex align-items-start gap-2 max-w-20rem">
            <i className="pi pi-arrows-v text-red-500 text-lg mt-1" />
            <div>
              <span className="font-bold text-xs text-900 block">
                Lectura Vertical (Alerta Pedagógica)
              </span>
              <span className="text-xs text-color-secondary">
                Una columna completa en rojo evidencia un punto ciego pedagógico que requiere repaso o ajuste.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeyendaMapaCalor;
