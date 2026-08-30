import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';

// Componente central para la visualización del histograma de frecuencias por intervalos de calificación
const InformeDificultadGrafico = ({
  datosGrafico = {},
  opcionesGrafico = {},
  distribucionRangos = [],
  estadisticas = {},
  practica = null,
  chartRef = null
}) => {
  // Plantilla visual para el rango de notas en la tabla detallada
  const plantillaRango = (fila) => {
    return (
      <div className="flex align-items-center gap-2">
        <span
          className="border-round inline-block"
          style={{ width: '12px', height: '12px', backgroundColor: fila.colorHex }}
        />
        <span className="font-bold text-color">{fila.rango}</span>
      </div>
    );
  };

  // Plantilla visual para el nivel cualitativo de la calificación
  const plantillaNivel = (fila) => {
    let severidad = 'info';
    if (fila.etiquetaNivel === 'Suspenso') severidad = 'danger';
    else if (fila.etiquetaNivel === 'Suficiente') severidad = 'warning';
    else if (fila.etiquetaNivel === 'Bien') severidad = 'warning';
    else if (fila.etiquetaNivel === 'Notable') severidad = 'success';
    else if (fila.etiquetaNivel === 'Sobresaliente') severidad = 'info';

    return <Tag value={fila.etiquetaNivel} severity={severidad} className="text-xs" />;
  };

  // Plantilla visual para la barra de porcentaje de discentes
  const plantillaPorcentaje = (fila) => {
    return (
      <div className="flex align-items-center gap-2">
        <div style={{ width: '80px' }}>
          <ProgressBar
            value={Math.round(fila.porcentaje)}
            showValue={false}
            style={{ height: '8px' }}
            color={fila.colorHex}
          />
        </div>
        <span className="text-xs font-semibold text-color">{fila.porcentajeFormateado}</span>
      </div>
    );
  };

  // Plantilla visual para el número de alumnos
  const plantillaAlumnos = (fila) => {
    return (
      <span className="font-bold text-color">
        {fila.frecuencia} {fila.frecuencia === 1 ? 'discente' : 'discentes'}
      </span>
    );
  };

  return (
    <div className="flex flex-column gap-3">
      {/* 1. Tarjeta principal contenedora del Gráfico de Barras (Histograma) */}
      <Card className="surface-card shadow-1 border-1 surface-border">
        <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-color m-0">
              Histograma de Distribución de Frecuencias
            </h3>
            <p className="text-xs text-muted m-0 mt-1">
              Agrupación de calificaciones en 10 intervalos (0-10, 11-20, ..., 91-100) coloreados según la escala académica oficial.
            </p>
          </div>
          {practica && (
            <Tag
              value={`Práctica: ${practica.numero ? `P${practica.numero}` : practica.nombre || ''}`}
              severity="secondary"
              className="text-xs"
            />
          )}
        </div>

        {/* Componente Chart de PrimeReact tipo 'bar' */}
        <div style={{ height: '360px', position: 'relative' }}>
          <Chart ref={chartRef} type="bar" data={datosGrafico} options={opcionesGrafico} style={{ height: '100%' }} />
        </div>
      </Card>

      {/* 2. Tabla de desglose de frecuencias por intervalo */}
      <Card className="surface-card shadow-1 border-1 surface-border">
        <div className="mb-2">
          <h4 className="text-sm font-bold text-color m-0">
            Desglose de Frecuencias por Intervalo
          </h4>
          <span className="text-xs text-muted">
            Total de {estadisticas.totalEvaluados || 0} calificaciones registradas
          </span>
        </div>

        <DataTable
          value={distribucionRangos}
          size="small"
          stripedRows
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column
            header="Intervalo de Notas"
            body={plantillaRango}
            style={{ width: '25%' }}
          />
          <Column
            header="Nivel Cualitativo"
            body={plantillaNivel}
            style={{ width: '25%' }}
          />
          <Column
            header="Alumnos"
            body={plantillaAlumnos}
            style={{ width: '25%' }}
          />
          <Column
            header="Proporción"
            body={plantillaPorcentaje}
            style={{ width: '25%' }}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default InformeDificultadGrafico;
