import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

/**
 * Obtiene la etiqueta y tooltip para cada botón de evaluación según los requisitos:
 * Primera, Segunda, Tercera, Final y Extra.
 *
 * @param {string} nombre - Denominación de la evaluación.
 * @returns {Object} - Objeto con { etiqueta, tooltip }.
 */
const obtenerConfigBotonEvaluacion = (nombre) => {
  const texto = String(nombre || '').toLowerCase();

  if (texto.includes('primer') || texto.startsWith('1')) {
    return { etiqueta: 'Primera', tooltip: 'Asignar a Primera evaluación' };
  }
  if (texto.includes('segund') || texto.startsWith('2')) {
    return { etiqueta: 'Segunda', tooltip: 'Asignar a Segunda evaluación' };
  }
  if (texto.includes('tercer') || texto.startsWith('3')) {
    return { etiqueta: 'Tercera', tooltip: 'Asignar a Tercera evaluación' };
  }
  if (texto.includes('extra')) {
    return { etiqueta: 'Extra', tooltip: 'Asignar a Evaluación Extraordinaria' };
  }
  if (texto.includes('final') || texto.includes('ordinari')) {
    return { etiqueta: 'Final', tooltip: 'Asignar a Evaluación Final / Ordinaria' };
  }

  return { etiqueta: nombre || 'Ev', tooltip: `Asignar a ${nombre}` };
};

/**
 * BandejaPendientesTarjetas - Área visual que muestra las prácticas huérfanas como tarjetas interactivas.
 *
 * Responsabilidad Única: Renderizar cada versión pendiente de evaluación y presentar
 * los botones directos para asignarla a cualquiera de las 5 evaluaciones del curso con un solo clic.
 *
 * @param {Object} props
 * @param {Array<Object>} props.versionesHuerfanas - Lista de actividades que no tienen evaluación.
 * @param {Array<Object>} props.evaluaciones - Catálogo de evaluaciones disponibles del curso.
 * @param {Function} props.onAsignar - Manejador invocado al pulsar un botón de evaluación en la tarjeta.
 * @param {boolean} props.guardando - Indicador de asignación en proceso.
 */
export const BandejaPendientesTarjetas = ({
  versionesHuerfanas = [],
  evaluaciones = [],
  onAsignar,
  guardando = false
}) => {
  if (versionesHuerfanas.length === 0) {
    return (
      <div className="surface-card p-3 border-round border-1 surface-border mb-3 flex align-items-center justify-content-between">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-check-circle text-green-500 text-lg" />
          <span className="text-sm font-semibold text-800">
            Bandeja de Pendientes vacía
          </span>
          <span className="text-secondary text-xs">
            Todas las prácticas de este curso ya se encuentran asignadas a una evaluación.
          </span>
        </div>
        <Tag value="0 pendientes" severity="success" className="text-xs" />
      </div>
    );
  }

  return (
    <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-3 flex flex-column gap-3">
      {/* Cabecera de la sección */}
      <div className="flex align-items-center justify-content-between pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-inbox text-orange-500 text-xl" />
          <div>
            <h3 className="m-0 text-base font-bold text-900">
              Bandeja de Pendientes (Prácticas sin Evaluación)
            </h3>
            <span className="text-secondary text-xs">
              Pulsa sobre la evaluación a la que deseas asignar cada práctica.
            </span>
          </div>
        </div>

        <Tag
          value={`${versionesHuerfanas.length} ${versionesHuerfanas.length === 1 ? 'práctica' : 'prácticas'}`}
          severity="warning"
          className="text-xs px-2 py-1 font-bold"
        />
      </div>

      {/* Cuadrícula de tarjetas de prácticas pendientes */}
      <div className="grid">
        {versionesHuerfanas.map((version) => {
          return (
            <div
              key={version.id_version}
              className="col-12 sm:col-6 lg:col-4"
            >
              <div className="surface-50 border-1 surface-border border-round p-3 h-full flex flex-column justify-content-between hover:shadow-2 transition-duration-200">
                {/* Cabecera y nombre de la práctica */}
                <div className="flex flex-column gap-1 mb-2">
                  <div className="flex align-items-center justify-content-between gap-2">
                    <span
                      className="font-bold text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis flex-grow-1"
                      title={version.nombrePractica}
                    >
                      {version.nombrePractica}
                    </span>
                    <Tag
                      value={version.numeroVersion || 'v1.0'}
                      severity="secondary"
                      className="text-xs px-2 py-0 flex-shrink-0"
                    />
                  </div>

                  {version.descripcionPractica && (
                    <span
                      className="text-secondary text-xs white-space-nowrap overflow-hidden text-overflow-ellipsis"
                      title={version.descripcionPractica}
                    >
                      {version.descripcionPractica}
                    </span>
                  )}
                </div>

                {/* Botones de asignación rápida a cada una de las evaluaciones en una sola fila */}
                <div className="pt-2 border-top-1 surface-border flex flex-column gap-1">
                  <span className="text-600 text-xs font-semibold uppercase">
                    Asignar a:
                  </span>

                  <div className="flex align-items-center justify-content-between gap-1 w-full flex-nowrap">
                    {evaluaciones.map((ev) => {
                      const config = obtenerConfigBotonEvaluacion(ev.nombre);

                      return (
                        <Button
                          key={ev.id_evaluacion}
                          type="button"
                          label={config.etiqueta}
                          tooltip={config.tooltip}
                          tooltipOptions={{ position: 'top' }}
                          onClick={() => onAsignar(version.id_version, ev.id_evaluacion)}
                          disabled={guardando}
                          text
                          severity="secondary"
                          className="p-button-xs text-xs font-semibold px-1 py-1 flex-1 border-none white-space-nowrap"
                          style={{ minWidth: 0, fontSize: '0.75rem' }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BandejaPendientesTarjetas;
