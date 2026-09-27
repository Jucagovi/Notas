import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { getColorNota } from '../../utils/coloresNota.js';
import useTema from '../../hooks/useTema.js';
import EstadoVacio from '../common/EstadoVacio.jsx';

// Definición canónica de los diez deciles de calificación sobre la escala 0-100
const INTERVALOS_DECILES = [
  { clave: '0-10', etiqueta: '0-10', min: 0, max: 10, notaRef: 5 },
  { clave: '11-20', etiqueta: '11-20', min: 11, max: 20, notaRef: 15 },
  { clave: '21-30', etiqueta: '21-30', min: 21, max: 30, notaRef: 25 },
  { clave: '31-40', etiqueta: '31-40', min: 31, max: 40, notaRef: 35 },
  { clave: '41-50', etiqueta: '41-50', min: 41, max: 50, notaRef: 45 },
  { clave: '51-60', etiqueta: '51-60', min: 51, max: 60, notaRef: 55 },
  { clave: '61-70', etiqueta: '61-70', min: 61, max: 70, notaRef: 65 },
  { clave: '71-80', etiqueta: '71-80', min: 71, max: 80, notaRef: 75 },
  { clave: '81-90', etiqueta: '81-90', min: 81, max: 90, notaRef: 85 },
  { clave: '91-100', etiqueta: '91-100', min: 91, max: 100, notaRef: 95 }
];

/**
 * HistogramaDificultad - Subcomponente presentacional para el gráfico histograma de frecuencias.
 *
 * Responsabilidad Única: Agrupar las calificaciones por deciles (0-10 hasta 91-100),
 * asignar a cada barra el color oficial procedente de getColorNota (adaptado a modo claro/oscuro)
 * y renderizar el Chart de PrimeReact con tipografía y ejes de alto contraste.
 *
 * @param {Object} props
 * @param {Array<number>} props.notas - Array de calificaciones numéricas obtenidas para la versión.
 * @param {string} [props.nombreActividad=''] - Nombre identificativo de la actividad para el encabezado.
 */
export const HistogramaDificultad = ({
  notas = [],
  nombreActividad = ''
}) => {
  // Se obtiene el estado del tema claro u oscuro para adaptar colores y tipografía
  const { esOscuro } = useTema();

  // Configuración de los datos del histograma agrupados en deciles con colores adaptativos
  const datosGrafico = useMemo(() => {
    const etiquetas = INTERVALOS_DECILES.map((d) => d.etiqueta);

    // Conteo de frecuencias absolutas por cada decil
    const frecuencias = INTERVALOS_DECILES.map((d) => {
      return notas.filter((n) => n >= d.min && n <= d.max).length;
    });

    // Colores extraídos estrictamente de getColorNota respetando el modo oscuro
    const colores = INTERVALOS_DECILES.map((d) => getColorNota(d.notaRef, esOscuro).hex);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Número de discentes',
          data: frecuencias,
          backgroundColor: colores,
          borderColor: colores,
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  }, [notas, esOscuro]);

  // Configuración de opciones visuales y ejes del gráfico con contraste adaptativo
  const opcionesGrafico = useMemo(() => {
    const totalNotas = notas.length;

    // Colores calculados según el modo de visualización para máxima legibilidad
    const colorTextoTitulo = esOscuro ? '#f1f5f9' : '#374151';
    const colorTextoTicks = esOscuro ? '#cbd5e1' : '#495057';
    const colorGrid = esOscuro ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          titleColor: esOscuro ? '#f1f5f9' : '#ffffff',
          bodyColor: esOscuro ? '#f1f5f9' : '#ffffff',
          backgroundColor: esOscuro ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)',
          borderColor: esOscuro ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              return `Calificaciones: ${items[0].label}`;
            },
            label: (contexto) => {
              const valor = contexto.raw || 0;
              const porcentaje =
                totalNotas > 0 ? ((valor / totalNotas) * 100).toFixed(1) : 0;
              return ` Discentes: ${valor} (${porcentaje}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Rangos de Calificación (Deciles)',
            font: { weight: 'bold', size: 12 },
            color: colorTextoTitulo
          },
          grid: {
            display: false
          },
          ticks: {
            color: colorTextoTicks,
            font: { size: 11, weight: '500' }
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Número Absoluto de Discentes',
            font: { weight: 'bold', size: 12 },
            color: colorTextoTitulo
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: colorTextoTicks,
            font: { size: 11, weight: '500' }
          },
          grid: {
            color: colorGrid
          }
        }
      }
    };
  }, [notas, esOscuro]);

  if (notas.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin calificaciones registradas"
        descripcion="No se han introducido calificaciones para esta práctica todavía. Califica a los discentes para generar el histograma."
        icono="pi pi-chart-bar"
        className="w-full my-4"
      />
    );
  }

  return (
    <Card className="surface-card border-1 surface-border shadow-1 p-3 mb-4 h-full">
      <div className="flex flex-column gap-2 mb-4">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-bar text-primary text-xl" />
          <h3 className="m-0 text-color font-bold text-xl">
            Histograma de Frecuencias de Calificaciones
          </h3>
        </div>
        {nombreActividad && (
          <span className="text-color-secondary text-sm">
            Distribución cuantitativa de notas para: <strong className="text-color font-semibold">{nombreActividad}</strong>
          </span>
        )}
      </div>

      <div style={{ height: '380px' }} className="w-full">
        <Chart
          type="bar"
          data={datosGrafico}
          options={opcionesGrafico}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Leyenda cromática al pie del gráfico según convención oficial */}
      <div className="flex flex-wrap align-items-center justify-content-center gap-3 mt-4 pt-3 border-top-1 surface-border">
        <div className="flex align-items-center gap-2 text-xs">
          <span
            className="border-circle"
            style={{ width: '10px', height: '10px', backgroundColor: getColorNota(40, esOscuro).hex }}
          />
          <span className="text-color font-medium">Suspenso (&lt;50)</span>
        </div>
        <div className="flex align-items-center gap-2 text-xs">
          <span
            className="border-circle"
            style={{ width: '10px', height: '10px', backgroundColor: getColorNota(55, esOscuro).hex }}
          />
          <span className="text-color font-medium">Suficiente (50-59)</span>
        </div>
        <div className="flex align-items-center gap-2 text-xs">
          <span
            className="border-circle"
            style={{ width: '10px', height: '10px', backgroundColor: getColorNota(65, esOscuro).hex }}
          />
          <span className="text-color font-medium">Bien (60-69)</span>
        </div>
        <div className="flex align-items-center gap-2 text-xs">
          <span
            className="border-circle"
            style={{ width: '10px', height: '10px', backgroundColor: getColorNota(75, esOscuro).hex }}
          />
          <span className="text-color font-medium">Notable (70-89)</span>
        </div>
        <div className="flex align-items-center gap-2 text-xs">
          <span
            className="border-circle"
            style={{ width: '10px', height: '10px', backgroundColor: getColorNota(95, esOscuro).hex }}
          />
          <span className="text-color font-medium">Sobresaliente (90-100)</span>
        </div>
      </div>
    </Card>
  );
};

export default HistogramaDificultad;
