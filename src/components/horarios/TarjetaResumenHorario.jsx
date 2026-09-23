import React from 'react';

/**
 * TarjetaResumenHorario - Componente presentacional para métricas clave de la carga lectiva semanal.
 *
 * Responsabilidad Única: Mostrar tarjetas sintéticas con el total de horas lectivas, grupos
 * atendidos y módulos asignados al docente titular.
 *
 * @param {Object} props
 * @param {Object} props.resumen - Métricas calculadas ({ horasSemanales, gruposDistintos, modulosDistintos }).
 */
export const TarjetaResumenHorario = ({ resumen }) => {
  const {
    horasLectivas = 0,
    horasNoLectivas = 0,
    horasTotales = 0,
    gruposDistintos = 0
  } = resumen || {};

  return (
    <div className="grid formgrid m-0 mb-2">
      {/* 1. Horas Lectivas Semanales */}
      <div className="col-12 sm:col-6 lg:col-3 p-2">
        <div className="surface-card p-3 border-round shadow-1 border-left-3 border-blue-500 flex align-items-center justify-content-between h-full">
          <div className="flex flex-column gap-1">
            <span className="text-xs text-color-secondary font-semibold uppercase">
              Horas Lectivas
            </span>
            <span className="text-2xl font-bold text-900">
              {horasLectivas}
            </span>
            <span className="text-xs text-500">
              Clases y tareas lectivas
            </span>
          </div>
          <div className="w-3rem h-3rem border-round bg-blue-50 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-book text-blue-500 text-xl" />
          </div>
        </div>
      </div>

      {/* 2. Horas No Lectivas (Guardias, Reuniones, Tutorías) */}
      <div className="col-12 sm:col-6 lg:col-3 p-2">
        <div className="surface-card p-3 border-round shadow-1 border-left-3 border-orange-500 flex align-items-center justify-content-between h-full">
          <div className="flex flex-column gap-1">
            <span className="text-xs text-color-secondary font-semibold uppercase">
              Horas No Lectivas
            </span>
            <span className="text-2xl font-bold text-900">
              {horasNoLectivas}
            </span>
            <span className="text-xs text-500">
              Guardias, reuniones, tutorías
            </span>
          </div>
          <div className="w-3rem h-3rem border-round bg-orange-50 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-briefcase text-orange-500 text-xl" />
          </div>
        </div>
      </div>

      {/* 3. Total Horas Semanales */}
      <div className="col-12 sm:col-6 lg:col-3 p-2">
        <div className="surface-card p-3 border-round shadow-1 border-left-3 border-green-500 flex align-items-center justify-content-between h-full">
          <div className="flex flex-column gap-1">
            <span className="text-xs text-color-secondary font-semibold uppercase">
              Total Horas Semanal
            </span>
            <span className="text-2xl font-bold text-900">
              {horasTotales}
            </span>
            <span className="text-xs text-500">
              Jornada semanal computada
            </span>
          </div>
          <div className="w-3rem h-3rem border-round bg-green-50 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-clock text-green-500 text-xl" />
          </div>
        </div>
      </div>

      {/* 4. Cursos / Grupos Atendidos */}
      <div className="col-12 sm:col-6 lg:col-3 p-2">
        <div className="surface-card p-3 border-round shadow-1 border-left-3 border-purple-500 flex align-items-center justify-content-between h-full">
          <div className="flex flex-column gap-1">
            <span className="text-xs text-color-secondary font-semibold uppercase">
              Cursos Atendidos
            </span>
            <span className="text-2xl font-bold text-900">
              {gruposDistintos}
            </span>
            <span className="text-xs text-500">
              Grupos lectivos diferentes
            </span>
          </div>
          <div className="w-3rem h-3rem border-round bg-purple-50 flex align-items-center justify-content-center flex-shrink-0">
            <i className="pi pi-users text-purple-500 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaResumenHorario;
