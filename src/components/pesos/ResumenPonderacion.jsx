import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';

/**
 * ResumenPonderacion - Panel visual de métricas, indicadores de coherencia y validación del módulo.
 *
 * Responsabilidad Única: Visualizar de forma sintética el balance global del módulo (suma de pesos de los RA),
 * el progreso de balanceo de los criterios hijos y las alertas correspondientes a ponderaciones incompletas o excesivas.
 *
 * @param {Object} props
 * @param {Object} props.estadisticas - Métricas calculadas por el hook usePesosCurriculares.
 * @param {boolean} [props.hayCambios=false] - Indica si existen modificaciones en memoria sin guardar.
 */
export const ResumenPonderacion = ({ estadisticas, hayCambios = false }) => {
  const {
    totalRA = 0,
    totalCE = 0,
    sumaPesosRA = 0,
    esModuloEquilibrado = false,
    rasEquilibrados = 0,
    rasIncompletos = 0,
    todoEquilibrado = false
  } = estadisticas || {};

  // Se determina el color representativo de la barra según el estado de la suma.
  const colorBarra = esModuloEquilibrado
    ? '#22c55e'
    : sumaPesosRA > 100
    ? '#ef4444'
    : '#f59e0b';

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="grid align-items-center">
        {/* Tarjeta: Suma Global de RA */}
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border h-full">
            <div
              className={`border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0 ${
                esModuloEquilibrado ? 'surface-green-50' : 'surface-red-50'
              }`}
            >
              <i
                className={`pi ${
                  esModuloEquilibrado ? 'pi-check-circle text-green-500' : 'pi-percentage text-red-500'
                } text-xl`}
              />
            </div>
            <div className="flex flex-column gap-1">
              <span className="text-color-secondary text-xs uppercase font-semibold">
                Suma Global RA (Clase)
              </span>
              <div className="flex align-items-center gap-2">
                <span className="text-2xl font-bold text-900">{sumaPesosRA}%</span>
                <Tag
                  value={esModuloEquilibrado ? '100% Correcto' : `${sumaPesosRA}%`}
                  severity={esModuloEquilibrado ? 'success' : 'danger'}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Resultados de Aprendizaje */}
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border h-full">
            <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-bookmark text-primary text-xl" />
            </div>
            <div className="flex flex-column gap-1">
              <span className="text-color-secondary text-xs uppercase font-semibold">
                Resultados (RA)
              </span>
              <div className="flex align-items-center gap-2">
                <span className="text-2xl font-bold text-900">{totalRA}</span>
                <span className="text-xs text-color-secondary">
                  ({rasEquilibrados} con CE al 100%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Criterios de Evaluación */}
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border h-full">
            <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-check-square text-500 text-xl" />
            </div>
            <div className="flex flex-column gap-1">
              <span className="text-color-secondary text-xs uppercase font-semibold">
                Criterios (CE)
              </span>
              <div className="flex align-items-center gap-2">
                <span className="text-2xl font-bold text-700">{totalCE}</span>
                <span className="text-xs text-color-secondary">en total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta: Estado General */}
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border h-full">
            <div
              className={`border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0 ${
                todoEquilibrado ? 'surface-green-50' : 'surface-orange-50'
              }`}
            >
              <i
                className={`pi ${
                  todoEquilibrado ? 'pi-verified text-green-500' : 'pi-info-circle text-orange-500'
                } text-xl`}
              />
            </div>
            <div className="flex flex-column gap-1">
              <span className="text-color-secondary text-xs uppercase font-semibold">
                Estado Evaluación
              </span>
              <div>
                <Tag
                  value={todoEquilibrado ? 'Válido para Evaluar' : 'Borrador en Edición'}
                  severity={todoEquilibrado ? 'success' : 'warning'}
                  icon={todoEquilibrado ? 'pi pi-check' : 'pi pi-pencil'}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso global de la clase y avisos contextuales */}
      <div className="mt-4 pt-3 border-top-1 surface-border">
        <div className="flex justify-content-between align-items-center mb-2">
          <span className="text-sm font-semibold text-700 flex align-items-center gap-2">
            <span>Ponderación acumulada de la Clase:</span>
            <strong className={esModuloEquilibrado ? 'text-green-600' : 'text-red-500'}>
              {sumaPesosRA}% / 100%
            </strong>
          </span>
          {hayCambios && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 border-round border-1 border-orange-200">
              <i className="pi pi-exclamation-circle mr-1" />
              Cambios pendientes de guardar
            </span>
          )}
        </div>

        <ProgressBar
          value={Math.min(sumaPesosRA, 100)}
          showValue={false}
          color={colorBarra}
          style={{ height: '8px' }}
        />

        {/* Mensaje de orientación según el estado del balance */}
        {!esModuloEquilibrado && (
          <p className="text-xs text-red-500 mt-2 mb-0 flex align-items-center gap-1 font-medium">
            <i className="pi pi-exclamation-triangle" />
            <span>
              {sumaPesosRA < 100
                ? `Falta un ${100 - sumaPesosRA}% para alcanzar el 100% en los Resultados de Aprendizaje. Se permite guardar el borrador en cualquier momento.`
                : `La suma de los RA supera el 100% en un ${sumaPesosRA - 100}%. Ajuste los valores para obtener una nota final normalizada.`}
            </span>
          </p>
        )}

        {esModuloEquilibrado && rasIncompletos > 0 && (
          <p className="text-xs text-orange-600 mt-2 mb-0 flex align-items-center gap-1 font-medium">
            <i className="pi pi-info-circle" />
            <span>
              La suma general de los RA es 100%, pero hay {rasIncompletos} RA con criterios de evaluación cuyos pesos no suman 100%. Revise las filas marcadas en rojo en la tabla.
            </span>
          </p>
        )}

        {todoEquilibrado && (
          <p className="text-xs text-green-600 mt-2 mb-0 flex align-items-center gap-1 font-medium">
            <i className="pi pi-check-circle" />
            <span>
              Ponderación perfectamente equilibrada. Todos los Resultados de Aprendizaje y sus correspondientes Criterios de Evaluación suman exactamente el 100%.
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumenPonderacion;
