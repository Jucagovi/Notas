import React from 'react';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * ResumenCalificaciones - Barra informativa y de indicadores clave (KPI) de la versión activa.
 *
 * Responsabilidad Única: Mostrar el contexto de la práctica/versión que se está evaluando
 * y calcular las métricas estadísticas globales (total, evaluados, pendientes y nota media)
 * aplicando el coloreado cromático oficial.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes con calificaciones.
 * @param {Object} props.version - Objeto con los datos de la versión activa.
 * @param {Object} [props.practica=null] - Objeto opcional de la práctica.
 */
const ResumenCalificaciones = ({
  discentes = [],
  version = null,
  practica = null,
  onMostrarAviso = () => {}
}) => {
  if (!version) {
    return null;
  }

  // Nombre de la práctica extraído tolerante desde la versión o el objeto práctica
  const nombrePractica =
    practica?.nombre ||
    version.nombrePractica ||
    version.Practicas?.nombre ||
    'Actividad';

  const numeroVersion = version.numeroVersion || version.numero || 'v1.0';
  const nombreEvaluacion = version.evaluacionNombre || version.Evaluaciones?.nombre || null;

  // Cálculo de métricas estadísticas sobre las calificaciones
  const total = discentes.length;
  const evaluados = discentes.filter(
    (d) => d.nota !== null && d.nota !== undefined && d.nota !== ''
  );
  const totalCalificados = evaluados.length;
  const totalPendientes = total - totalCalificados;

  const sumaNotas = evaluados.reduce((acc, d) => acc + Number(d.nota || 0), 0);
  const notaMedia = totalCalificados > 0 ? (sumaNotas / totalCalificados).toFixed(1) : null;
  const notaMediaEntera = notaMedia !== null ? Math.round(Number(notaMedia)) : null;
  const infoColorMedia = notaMediaEntera !== null ? getColorNota(notaMediaEntera) : null;

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
        {/* Identificación de la actividad */}
        <div className="flex align-items-center gap-3">
          <div className="bg-primary-50 border-circle w-3rem h-3rem flex align-items-center justify-content-center text-primary flex-shrink-0">
            <i className="pi pi-pencil text-xl" />
          </div>
          <div>
            <div className="flex align-items-center gap-2">
              <span className="font-bold text-900 text-lg">
                {nombrePractica}
              </span>
              <span className="surface-200 text-700 text-xs px-2 py-1 border-round font-semibold">
                {numeroVersion}
              </span>
            </div>
            {nombreEvaluacion ? (
              <span className="text-color-secondary text-xs block mt-1">
                <i className="pi pi-calendar mr-1" />
                {nombreEvaluacion}
              </span>
            ) : (
              <span
                className="text-orange-700 bg-orange-50 border-1 border-orange-300 text-xs px-2 py-1 border-round font-medium inline-flex align-items-center gap-1 mt-1 cursor-pointer select-none hover:bg-orange-100 transition-colors"
                title="Esta actividad no tiene evaluación oficial asignada. Haz clic para ver información."
                onClick={onMostrarAviso}
              >
                <i className="pi pi-exclamation-triangle text-xs" />
                Sin evaluación asignada
              </span>
            )}
          </div>
        </div>

        {/* Indicadores estadísticos (KPIs) */}
        <div className="flex align-items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Total discentes */}
          <div className="surface-100 border-round p-2 px-3 text-center flex-1 sm:flex-initial">
            <span className="block text-xs text-color-secondary font-medium">
              Matriculados
            </span>
            <span className="font-bold text-900 text-base">
              {total}
            </span>
          </div>

          {/* Calificados */}
          <div className="bg-green-50 border-round p-2 px-3 text-center flex-1 sm:flex-initial border-1 border-green-200">
            <span className="block text-xs text-green-700 font-medium">
              Calificados
            </span>
            <span className="font-bold text-green-700 text-base">
              {totalCalificados}
            </span>
          </div>

          {/* Pendientes */}
          <div className="bg-orange-50 border-round p-2 px-3 text-center flex-1 sm:flex-initial border-1 border-orange-200">
            <span className="block text-xs text-orange-700 font-medium">
              Pendientes
            </span>
            <span className="font-bold text-orange-700 text-base">
              {totalPendientes}
            </span>
          </div>

          {/* Nota media */}
          <div className="surface-100 border-round p-2 px-3 text-center flex-1 sm:flex-initial border-1 surface-border">
            <span className="block text-xs text-color-secondary font-medium">
              Nota Media
            </span>
            <span className={`font-bold text-base ${infoColorMedia ? infoColorMedia.clase : 'text-color-secondary'}`}>
              {notaMedia !== null ? notaMedia : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenCalificaciones;
