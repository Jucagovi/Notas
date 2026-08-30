import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';

// Componente para la representación gráfica del mapa competencial en forma de radar
const InformeCompetenciaGrafico = ({
  datosGraficoRadar,
  opcionesGraficoRadar,
  listaRA = [],
  estadisticas = null,
  discente = null,
  modulo = null,
  chartRef = null
}) => {
  const tieneDatosValidos = (listaRA || []).some(
    (ra) => ra.nota !== null && ra.nota !== undefined
  );

  if (!tieneDatosValidos) {
    return (
      <div className="surface-card p-5 border-round border-1 surface-border shadow-1 text-center">
        <div className="flex flex-column align-items-center justify-content-center">
          <i className="pi pi-compass text-5xl text-400 mb-3" />
          <h3 className="text-lg font-bold m-0 mb-2 text-color">
            Sin calificaciones suficientes para generar el gráfico de radar
          </h3>
          <p className="text-muted text-sm m-0 max-w-28rem">
            El discente no cuenta con notas registradas en las prácticas vinculadas a los Resultados de Aprendizaje de este módulo.
          </p>
        </div>
      </div>
    );
  }

  const tituloCabecera = (
    <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-compass text-primary text-xl" />
        <div>
          <span className="text-lg font-bold text-color">
            Mapa de Competencias (Radar)
          </span>
          <span className="text-xs text-muted block mt-1 font-normal">
            Ponderación del discente en los Resultados de Aprendizaje de {modulo?.siglas || modulo?.nombre || 'este módulo'}
          </span>
        </div>
      </div>
      <div className="flex align-items-center gap-2">
        <Tag
          value={`${estadisticas?.raEvaluados || 0} de ${listaRA.length} RAs Evaluados`}
          severity="info"
          className="text-xs"
        />
      </div>
    </div>
  );

  return (
    <Card title={tituloCabecera} className="shadow-1 surface-card border-round">
      <div className="flex align-items-center justify-content-center gap-2 mb-2 p-2 border-round surface-50 text-xs text-muted">
        <i className="pi pi-info-circle text-primary" />
        <span>
          Pase el cursor sobre los vértices del radar para consultar la descripción detallada, criterios y calificación de cada Resultado de Aprendizaje.
        </span>
      </div>

      <div className="w-full flex justify-content-center" style={{ minHeight: '380px', maxHeight: '460px' }}>
        <div className="w-full" style={{ maxWidth: '650px', height: '400px' }}>
          <Chart
            ref={chartRef}
            type="radar"
            data={datosGraficoRadar}
            options={opcionesGraficoRadar}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </Card>
  );
};

export default InformeCompetenciaGrafico;
