import React from 'react';
import { ProgressBar } from 'primereact/progressbar';

/**
 * ResumenTemporizacion - Panel de indicadores y porcentaje de avance temporal del módulo.
 *
 * Responsabilidad Única: Visualizar de forma sintética los totales de unidades según su estado,
 * la barra de completitud global y una sugerencia de ayuda para la reordenación.
 *
 * @param {Object} props
 * @param {Object} props.estadisticas - Objeto con métricas (total, pendientes, enCurso, completadas, porcentajeProgreso).
 */
export const ResumenTemporizacion = ({ estadisticas }) => {
  const {
    total = 0,
    pendientes = 0,
    enCurso = 0,
    completadas = 0,
    porcentajeProgreso = 0
  } = estadisticas || {};

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="grid align-items-center">
        {/* Tarjeta: Total Unidades */}
        <div className="col-12 sm:col-6 md:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border">
            <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-folder-open text-primary text-xl" />
            </div>
            <div className="flex flex-column">
              <span className="text-color-secondary text-xs uppercase font-semibold">Total Unidades</span>
              <span className="text-2xl font-bold text-900">{total}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Pendientes */}
        <div className="col-12 sm:col-6 md:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border">
            <div className="surface-100 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-clock text-500 text-xl" />
            </div>
            <div className="flex flex-column">
              <span className="text-color-secondary text-xs uppercase font-semibold">Pendientes</span>
              <span className="text-2xl font-bold text-700">{pendientes}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: En Curso */}
        <div className="col-12 sm:col-6 md:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border">
            <div className="surface-blue-50 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-spin pi-spinner text-blue-500 text-xl" />
            </div>
            <div className="flex flex-column">
              <span className="text-color-secondary text-xs uppercase font-semibold">En Curso</span>
              <span className="text-2xl font-bold text-blue-600">{enCurso}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Completadas */}
        <div className="col-12 sm:col-6 md:col-3">
          <div className="flex align-items-center gap-3 p-3 surface-50 border-round border-1 surface-border">
            <div className="surface-green-50 border-circle w-3rem h-3rem flex align-items-center justify-content-center flex-shrink-0">
              <i className="pi pi-check-circle text-green-500 text-xl" />
            </div>
            <div className="flex flex-column">
              <span className="text-color-secondary text-xs uppercase font-semibold">Completadas</span>
              <span className="text-2xl font-bold text-green-600">{completadas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso global y nota explicativa */}
      <div className="mt-4 pt-3 border-top-1 surface-border">
        <div className="flex justify-content-between align-items-center mb-2">
          <span className="text-sm font-semibold text-700">
            Progreso general de impartición del currículo
          </span>
          <span className="text-sm font-bold text-900">{porcentajeProgreso}%</span>
        </div>
        <ProgressBar value={porcentajeProgreso} showValue={false} style={{ height: '8px' }} />
        <p className="text-xs text-color-secondary mt-2 mb-0">
          <i className="pi pi-info-circle mr-1" />
          Arrastre las filas desde el icono de la izquierda para reordenar la secuencia de impartición de las unidades didácticas.
        </p>
      </div>
    </div>
  );
};

export default ResumenTemporizacion;
