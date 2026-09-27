import React, { useMemo } from 'react';
import { Card } from 'primereact/card';

/**
 * ResumenActaTrimestres - Panel informativo con métricas resumidas del grupo y convocatoria.
 *
 * Responsabilidad Única: Calcular e ilustrar los indicadores clave del rendimiento académico de la clase
 * (alumnos matriculados, evaluados, aprobados, suspensos y nota media) y recordar las normas de cálculo oficial.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes con calificaciones por evaluación.
 * @param {Array<Object>} props.evaluaciones - Lista de evaluaciones vinculadas al módulo formativo.
 * @param {Object} [props.claseInfo={}] - Metadatos de la clase activa (curso, centro, módulo).
 */
export const ResumenActaTrimestres = ({
  discentes = [],
  evaluaciones = [],
  claseInfo = {}
}) => {
  // Cálculo de estadísticas globales cuantitativas
  const estadisticas = useMemo(() => {
    let evaluados = 0;
    let aprobados = 0;
    let suspensos = 0;
    let sumaNotas = 0;

    discentes.forEach((alumno) => {
      // Se evalúa si el discente tiene al menos una calificación computable
      const notasValidas = Object.values(alumno.notas || {}).filter(
        (n) => n !== null && n !== undefined && !isNaN(n)
      );

      if (notasValidas.length > 0) {
        evaluados++;
        // Se toma el promedio personal o la última calificación registrada
        const ultimaNota = notasValidas[notasValidas.length - 1];
        sumaNotas += ultimaNota;

        if (ultimaNota >= 50) {
          aprobados++;
        } else {
          suspensos++;
        }
      }
    });

    const media = evaluados > 0 ? (sumaNotas / evaluados).toFixed(1) : '-';

    return {
      matriculados: discentes.length,
      evaluados,
      aprobados,
      suspensos,
      media
    };
  }, [discentes]);

  return (
    <div className="grid mb-4">
      {/* 1. Indicador: Total de Alumnos Matriculados */}
      <div className="col-12 sm:col-6 md:col-3">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-1">
            <span className="text-color-secondary font-medium text-sm">
              Matriculados
            </span>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: '2.25rem', height: '2.25rem' }}
            >
              <i className="pi pi-users text-blue-600 text-lg" />
            </div>
          </div>
          <div className="text-900 font-bold text-2xl">
            {estadisticas.matriculados}
          </div>
          <span className="text-xs text-color-secondary">
            Alumnos matriculados en imparte
          </span>
        </Card>
      </div>

      {/* 2. Indicador: Evaluaciones Vinculadas */}
      <div className="col-12 sm:col-6 md:col-3">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-1">
            <span className="text-color-secondary font-medium text-sm">
              Evaluaciones
            </span>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: '2.25rem', height: '2.25rem' }}
            >
              <i className="pi pi-calendar-plus text-purple-600 text-lg" />
            </div>
          </div>
          <div className="text-900 font-bold text-2xl">
            {evaluaciones.length}
          </div>
          <span className="text-xs text-color-secondary">
            Convocatorias oficiales registradas
          </span>
        </Card>
      </div>

      {/* 3. Indicador: Aprobados vs Suspensos */}
      <div className="col-12 sm:col-6 md:col-3">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-1">
            <span className="text-color-secondary font-medium text-sm">
              Progreso de Aprobados
            </span>
            <div
              className="flex align-items-center justify-content-center bg-green-100 border-round"
              style={{ width: '2.25rem', height: '2.25rem' }}
            >
              <i className="pi pi-check-circle text-green-600 text-lg" />
            </div>
          </div>
          <div className="flex align-items-baseline gap-2">
            <span className="text-green-600 font-bold text-2xl">
              {estadisticas.aprobados}
            </span>
            <span className="text-xs text-color-secondary">
              / {estadisticas.suspensos} suspensos
            </span>
          </div>
          <span className="text-xs text-color-secondary">
            Evaluados: {estadisticas.evaluados} alumnos
          </span>
        </Card>
      </div>

      {/* 4. Indicador: Calificación Media */}
      <div className="col-12 sm:col-6 md:col-3">
        <Card className="h-full border-1 surface-border shadow-1 p-2">
          <div className="flex justify-content-between align-items-center mb-1">
            <span className="text-color-secondary font-medium text-sm">
              Calificación Media
            </span>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: '2.25rem', height: '2.25rem' }}
            >
              <i className="pi pi-chart-line text-orange-600 text-lg" />
            </div>
          </div>
          <div className="text-900 font-bold text-2xl">
            {estadisticas.media} <span className="text-sm font-normal text-500">/ 100</span>
          </div>
          <span className="text-xs text-color-secondary">
            Promedio cuantitativo del grupo
          </span>
        </Card>
      </div>
    </div>
  );
};

export default ResumenActaTrimestres;
