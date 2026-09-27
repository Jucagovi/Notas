import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { getColorNota } from '../../utils/coloresNota.js';
import useTema from '../../hooks/useTema.js';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * GraficoDonutNiveles - Subcomponente presentacional para el gráfico circular/donut de categorías oficiales.
 *
 * Responsabilidad Única: Agrupar las calificaciones de los discentes en los cinco niveles normativos
 * oficiales (Suspenso, Suficiente, Bien, Notable y Sobresaliente), asociar los colores oficiales
 * de getColorNota respetando el modo claro/oscuro y renderizar la leyenda con texto de alto contraste.
 *
 * @param {Object} props
 * @param {Array<number>} props.notas - Array numérico de calificaciones de la actividad seleccionada.
 * @param {string} [props.nombreActividad=''] - Denominación de la actividad activa.
 */
export const GraficoDonutNiveles = ({
  notas = [],
  nombreActividad = ''
}) => {
  // Se obtiene el estado del tema claro u oscuro para adaptar colores y tipografía
  const { esOscuro } = useTema();

  // Cálculo de frecuencias por tramo normativo oficial
  const distribucionNiveles = useMemo(() => {
    let suspensos = 0;
    let suficientes = 0;
    let bien = 0;
    let notables = 0;
    let sobresalientes = 0;

    notas.forEach((nota) => {
      if (nota < 50) {
        suspensos++;
      } else if (nota < 60) {
        suficientes++;
      } else if (nota < 70) {
        bien++;
      } else if (nota < 90) {
        notables++;
      } else {
        sobresalientes++;
      }
    });

    return {
      suspensos,
      suficientes,
      bien,
      notables,
      sobresalientes
    };
  }, [notas]);

  // Configuración de los datos del gráfico doughnut con colores adaptados al tema
  const datosDoughnut = useMemo(() => {
    const {
      suspensos,
      suficientes,
      bien,
      notables,
      sobresalientes
    } = distribucionNiveles;

    // Se extraen los colores normalizados de la escala cromática adaptados al modo oscuro
    const colorSuspenso = getColorNota(40, esOscuro).hex;
    const colorSuficiente = getColorNota(55, esOscuro).hex;
    const colorBien = getColorNota(65, esOscuro).hex;
    const colorNotable = getColorNota(75, esOscuro).hex;
    const colorSobresaliente = getColorNota(95, esOscuro).hex;

    return {
      labels: [
        'Suspenso (<50)',
        'Suficiente (50-59)',
        'Bien (60-69)',
        'Notable (70-89)',
        'Sobresaliente (90-100)'
      ],
      datasets: [
        {
          data: [suspensos, suficientes, bien, notables, sobresalientes],
          backgroundColor: [
            colorSuspenso,
            colorSuficiente,
            colorBien,
            colorNotable,
            colorSobresaliente
          ],
          hoverBackgroundColor: [
            colorSuspenso,
            colorSuficiente,
            colorBien,
            colorNotable,
            colorSobresaliente
          ],
          borderColor: esOscuro ? '#1e293b' : '#ffffff',
          borderWidth: 2
        }
      ]
    };
  }, [distribucionNiveles, esOscuro]);

  // Opciones de configuración para el gráfico doughnut con contraste visual óptimo
  const opcionesDoughnut = useMemo(() => {
    const total = notas.length;
    const colorTextoLeyenda = esOscuro ? '#f1f5f9' : '#374151';

    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            padding: 14,
            font: {
              size: 11,
              weight: '500'
            },
            color: colorTextoLeyenda
          }
        },
        tooltip: {
          titleColor: esOscuro ? '#f1f5f9' : '#ffffff',
          bodyColor: esOscuro ? '#f1f5f9' : '#ffffff',
          backgroundColor: esOscuro ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)',
          borderColor: esOscuro ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: (contexto) => {
              const valor = contexto.raw || 0;
              const porcentaje =
                total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
              const etiqueta = contexto.label || '';
              return ` ${etiqueta}: ${valor} discentes (${porcentaje}%)`;
            }
          }
        }
      }
    };
  }, [notas, esOscuro]);

  if (notas.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin datos para el gráfico circular"
        descripcion="No hay calificaciones registradas para computar la distribución por niveles."
        icono="pi pi-chart-pie"
        className="w-full my-4"
      />
    );
  }

  return (
    <Card className="surface-card border-1 surface-border shadow-1 p-3 mb-4 h-full flex flex-column justify-content-between">
      <div className="flex flex-column gap-2 mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-pie text-primary text-xl" />
          <h3 className="m-0 text-color font-bold text-xl">
            Niveles Oficiales
          </h3>
        </div>
        {nombreActividad && (
          <span className="text-color-secondary text-sm">
            Proporción de alumnos por tramo normativo
          </span>
        )}
      </div>

      <div style={{ height: '380px' }} className="w-full flex align-items-center justify-content-center">
        <Chart
          type="doughnut"
          data={datosDoughnut}
          options={opcionesDoughnut}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </Card>
  );
};

export default GraficoDonutNiveles;
