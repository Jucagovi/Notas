import React, { useMemo } from 'react';

/**
 * ResumenPendientes - Componente presentacional con tarjetas métricas del informe de pendientes.
 *
 * Responsabilidad Única: Calcular y presentar los totales agregados (total de notas pendientes,
 * número de discentes afectados y cantidad de actividades involucradas).
 *
 * @param {Object} props
 * @param {Array<Object>} props.pendientes - Colección de calificaciones pendientes.
 * @param {Object|null} [props.claseInfo] - Información descriptiva de la clase activa.
 */
export const ResumenPendientes = ({ pendientes = [], claseInfo = null }) => {
  // Conteo de discentes únicos afectados
  const totalDiscentesAfectados = useMemo(() => {
    const ids = new Set(pendientes.map((p) => p.id_discente).filter(Boolean));
    return ids.size;
  }, [pendientes]);

  // Conteo de actividades únicas involucradas
  const totalActividadesAfectadas = useMemo(() => {
    const ids = new Set(pendientes.map((p) => p.id_version).filter(Boolean));
    return ids.size;
  }, [pendientes]);

  const totalNotasPendientes = pendientes.length;

  return (
    <div className="grid mb-4">
      {/* Tarjeta 1: Total de calificaciones pendientes */}
      <div className="col-12 sm:col-4">
        <div className="surface-card p-3 shadow-1 border-round border-1 surface-border flex align-items-center justify-content-between">
          <div>
            <span className="block text-500 font-medium mb-1 text-sm">
              Calificaciones pendientes
            </span>
            <div className="text-900 font-bold text-2xl text-orange-600">
              {totalNotasPendientes}
            </div>
            <span className="text-xs text-color-secondary">
              Entregas por registrar en el cuaderno
            </span>
          </div>
          <div className="w-3rem h-3rem border-circle bg-orange-100 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-pencil text-orange-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Discentes con notas pendientes */}
      <div className="col-12 sm:col-4">
        <div className="surface-card p-3 shadow-1 border-round border-1 surface-border flex align-items-center justify-content-between">
          <div>
            <span className="block text-500 font-medium mb-1 text-sm">
              Discentes afectados
            </span>
            <div className="text-900 font-bold text-2xl text-blue-600">
              {totalDiscentesAfectados}
            </div>
            <span className="text-xs text-color-secondary">
              Alumnos con notas pendientes
            </span>
          </div>
          <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-users text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Actividades con evaluaciones pendientes */}
      <div className="col-12 sm:col-4">
        <div className="surface-card p-3 shadow-1 border-round border-1 surface-border flex align-items-center justify-content-between">
          <div>
            <span className="block text-500 font-medium mb-1 text-sm">
              Actividades implicadas
            </span>
            <div className="text-900 font-bold text-2xl text-teal-600">
              {totalActividadesAfectadas}
            </div>
            <span className="text-xs text-color-secondary">
              Prácticas de la evaluación
            </span>
          </div>
          <div className="w-3rem h-3rem border-circle bg-teal-100 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-bookmark text-teal-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenPendientes;
