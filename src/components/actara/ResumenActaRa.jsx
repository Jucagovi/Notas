import React, { useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * ResumenActaRa - Panel informativo y descriptivo de la metodología de evaluación seleccionada.
 *
 * Responsabilidad Única: Explicar de forma transparente la fórmula matemática aplicada
 * (Evaluación Continua vs Evaluación Final) y mostrar las métricas agregadas del grupo discente.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes con calificaciones.
 * @param {Array<Object>} props.ras - Lista de Resultados de Aprendizaje del módulo.
 * @param {string} props.modoCalculo - Modo actual ('continua' o 'final').
 * @param {Object} [props.claseInfo] - Datos de la clase activa.
 */
export const ResumenActaRa = ({
  discentes = [],
  ras = [],
  modoCalculo = 'final',
  claseInfo = {}
}) => {
  // Cálculo de estadísticas globales del grupo en base al modo activo
  const metricas = useMemo(() => {
    let evaluados = 0;
    let aprobados = 0;
    let suspensos = 0;
    let suma = 0;

    discentes.forEach((d) => {
      const nota = modoCalculo === 'continua' ? d.notaContinua : d.notaFinal;
      if (nota !== null && nota !== undefined) {
        evaluados++;
        suma += nota;
        if (nota >= 50) {
          aprobados++;
        } else {
          suspensos++;
        }
      }
    });

    const media = evaluados > 0 ? Math.round(suma / evaluados) : null;
    const porcentajeAprobados = evaluados > 0 ? Math.round((aprobados / evaluados) * 100) : 0;

    return {
      total: discentes.length,
      evaluados,
      aprobados,
      suspensos,
      media,
      porcentajeAprobados
    };
  }, [discentes, modoCalculo]);

  const colorMedia = getColorNota(metricas.media);

  return (
    <div className="surface-card p-3 border-round border-1 surface-border shadow-1 mb-4">
      <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
        {/* Bloque explicativo de la metodología de cálculo */}
        <div className="flex align-items-start gap-3">
          <div
            className={`border-round p-3 flex align-items-center justify-content-center ${
              modoCalculo === 'continua'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <i
              className={`text-xl ${
                modoCalculo === 'continua'
                  ? 'pi pi-chart-line'
                  : 'pi pi-check-circle'
              }`}
            />
          </div>

          <div className="flex flex-column gap-1">
            <div className="flex align-items-center gap-2">
              <span className="font-bold text-900 text-base">
                {modoCalculo === 'continua'
                  ? 'Evaluación Continua (Boletín Periódico)'
                  : 'Evaluación Final Ordinaria (Acta Oficial)'}
              </span>
              <Tag
                value={modoCalculo === 'continua' ? 'Progresiva' : 'Oficial'}
                severity={modoCalculo === 'continua' ? 'info' : 'primary'}
                className="text-xs"
              />
            </div>

            <p className="text-color-secondary text-sm m-0 line-height-2">
              {modoCalculo === 'continua'
                ? 'Calcula la nota considerando exclusivamente los Resultados de Aprendizaje cuyos criterios han sido evaluados totalmente, reescalando su ponderación proporcional al 100%.'
                : 'Pondera estrictamente la calificación de cada Resultado de Aprendizaje según su peso definido en el currículo (100%). Los aspectos no evaluados computan con valor 0.'}
            </p>
          </div>
        </div>

        {/* Bloque de indicadores rápidos (KPIs) del grupo */}
        <div className="flex align-items-center gap-4 border-top-1 lg:border-top-none lg:border-left-1 surface-border pt-3 lg:pt-0 lg:pl-4 flex-wrap">
          <div className="flex flex-column text-center">
            <span className="text-xs text-color-secondary font-medium">
              Alumnos
            </span>
            <span className="text-xl font-bold text-900">
              {metricas.total}
            </span>
          </div>

          <div className="flex flex-column text-center">
            <span className="text-xs text-color-secondary font-medium">
              RAs del módulo
            </span>
            <span className="text-xl font-bold text-900">
              {ras.length}
            </span>
          </div>

          <div className="flex flex-column text-center">
            <span className="text-xs text-color-secondary font-medium">
              Aprobados
            </span>
            <span className="text-xl font-bold text-green-600">
              {metricas.aprobados}
              <span className="text-xs font-normal text-color-secondary ml-1">
                ({metricas.porcentajeAprobados}%)
              </span>
            </span>
          </div>

          <div className="flex flex-column text-center">
            <span className="text-xs text-color-secondary font-medium">
              Media de clase
            </span>
            {metricas.media !== null ? (
              <span
                className="text-xl font-bold"
                style={{ color: colorMedia.hex }}
              >
                {metricas.media}
              </span>
            ) : (
              <span className="text-xl font-bold text-color-secondary">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenActaRa;
