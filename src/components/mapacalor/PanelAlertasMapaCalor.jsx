import React from 'react';
import useTema from '../../hooks/useTema.js';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * PanelAlertasMapaCalor - Subcomponente presentacional para las alertas analíticas del mapa de calor.
 *
 * Responsabilidad Única: Renderizar las tarjetas de diagnóstico pedagógico rápido
 * (Puntos Ciegos en columnas y Discentes en riesgo crítico en filas) junto a la media global de la clase.
 *
 * @param {Object} props
 * @param {Object} props.metricas - Indicadores cuantitativos globales calculados.
 * @param {Object} props.resumenColumnas - Diccionario analítico por columna.
 * @param {Array<Object>} props.filas - Lista procesada de discentes.
 */
export const PanelAlertasMapaCalor = ({
  metricas = {},
  resumenColumnas = {},
  filas = []
}) => {
  const { esOscuro } = useTema();

  const {
    totalDiscentes = 0,
    totalCriterios = 0,
    mediaGlobal = null,
    puntosCiegosCount = 0,
    discentesEnRiesgoCount = 0
  } = metricas;

  // Lista de códigos de criterios catalogados como punto ciego.
  const columnasCiegas = Object.values(resumenColumnas)
    .filter((col) => col.esPuntoCiego)
    .map((col) => col.codigo);

  // Lista de discentes clasificados en situación de riesgo crítico.
  const discentesEnRiesgo = filas
    .filter((f) => f.enRiesgo)
    .map((f) => f.nombreCompleto);

  const infoNotaGlobal = mediaGlobal !== null ? getColorNota(mediaGlobal, esOscuro) : null;

  return (
    <div className="grid mb-4">
      {/* Tarjeta 1: Puntos Ciegos Pedagógicos (Lectura Vertical) */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div
          className="surface-card p-3 border-round-xl border-1 shadow-1 h-full flex flex-column justify-content-between"
          style={{
            borderColor: puntosCiegosCount > 0 ? '#ef4444' : 'var(--surface-border)'
          }}
        >
          <div>
            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-xs font-semibold uppercase text-color-secondary">
                Puntos Ciegos Pedagógicos
              </span>
              <div
                className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                style={{
                  backgroundColor: puntosCiegosCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  color: puntosCiegosCount > 0 ? '#ef4444' : '#22c55e'
                }}
              >
                <i className={`pi ${puntosCiegosCount > 0 ? 'pi-exclamation-triangle' : 'pi-check'}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-900 mb-1">
              {puntosCiegosCount}{' '}
              <span className="text-sm font-normal text-color-secondary">
                RAs
              </span>
            </div>
            <p className="text-xs text-color-secondary m-0 line-height-2">
              {puntosCiegosCount > 0
                ? `Columnas con media < 50 o más del 50% de suspensos: ${columnasCiegas.slice(0, 4).join(', ')}${columnasCiegas.length > 4 ? '...' : ''}.`
                : 'No se detectan anomalías colectivas en los Resultados de Aprendizaje evaluados.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Discentes en Riesgo Crítico (Lectura Horizontal) */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div
          className="surface-card p-3 border-round-xl border-1 shadow-1 h-full flex flex-column justify-content-between"
          style={{
            borderColor: discentesEnRiesgoCount > 0 ? '#f97316' : 'var(--surface-border)'
          }}
        >
          <div>
            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-xs font-semibold uppercase text-color-secondary">
                Discentes en Riesgo
              </span>
              <div
                className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                style={{
                  backgroundColor: discentesEnRiesgoCount > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  color: discentesEnRiesgoCount > 0 ? '#f97316' : '#22c55e'
                }}
              >
                <i className="pi pi-users" />
              </div>
            </div>
            <div className="text-2xl font-bold text-900 mb-1">
              {discentesEnRiesgoCount}{' '}
              <span className="text-sm font-normal text-color-secondary">
                de {totalDiscentes}
              </span>
            </div>
            <p className="text-xs text-color-secondary m-0 line-height-2">
              {discentesEnRiesgoCount > 0
                ? `Filas que tienden al rojo o naranja generalizado: ${discentesEnRiesgo.slice(0, 2).join('; ')}${discentesEnRiesgo.length > 2 ? '...' : ''}.`
                : 'Ningún discente presenta fracaso generalizado en sus calificaciones.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Media Global de la Clase */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div>
            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-xs font-semibold uppercase text-color-secondary">
                Media Global de la Clase
              </span>
              <div
                className="w-2rem h-2rem border-round flex align-items-center justify-content-center bg-primary-50 text-primary"
              >
                <i className="pi pi-chart-bar" />
              </div>
            </div>
            <div className="flex align-items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-900">
                {mediaGlobal !== null ? `${mediaGlobal}` : '-'}
              </span>
              {infoNotaGlobal && (
                <span
                  className="text-xs font-semibold px-2 py-1 border-round"
                  style={{
                    backgroundColor: `${infoNotaGlobal.hex}25`,
                    color: infoNotaGlobal.hex
                  }}
                >
                  {infoNotaGlobal.etiqueta}
                </span>
              )}
            </div>
            <p className="text-xs text-color-secondary m-0 line-height-2">
              Rendimiento promedio consolidado de todas las actividades evaluadas.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta 4: Criterios Curriculares en la Matriz */}
      <div className="col-12 sm:col-6 lg:col-3">
        <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
          <div>
            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-xs font-semibold uppercase text-color-secondary">
                Dimensión de la Matriz
              </span>
              <div
                className="w-2rem h-2rem border-round flex align-items-center justify-content-center bg-teal-50 text-teal-600"
              >
                <i className="pi pi-th-large" />
              </div>
            </div>
            <div className="text-2xl font-bold text-900 mb-1">
              {totalDiscentes} × {totalCriterios}
            </div>
            <p className="text-xs text-color-secondary m-0 line-height-2">
              {totalDiscentes} discentes cruzados con {totalCriterios} Resultados de Aprendizaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAlertasMapaCalor;
