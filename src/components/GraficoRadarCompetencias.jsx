import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { getColorNota } from '../utils/coloresNota.js';
import useTema from '../hooks/useTema.js';
import EstadoVacio from './common/EstadoVacio.jsx';
import CargadorSeccion from './common/CargadorSeccion.jsx';

/**
 * Helper para formatear el nombre y descripción del Resultado de Aprendizaje.
 * Genera el formato canónico: "RA1: <Descripción o denominación>", evitando repeticiones como "RA1: RA1".
 *
 * @param {Object} r - Registro del Resultado de Aprendizaje.
 * @returns {string} Texto descriptivo formateado.
 */
export const formatearNombreRA = (r) => {
  if (!r) return '';
  const codigo = `RA${r.numero}`;
  const regexPrefijo = new RegExp(`^ra\\s*${r.numero}\\s*[:.-]?\\s*`, 'i');

  const descripcion = (r.descripcion || '').trim();
  const nombre = (r.nombre || '').trim();

  // Si cuenta con descripción curricular, se compone como "RA1: <descripción>"
  if (descripcion) {
    const descLimpia = descripcion.replace(regexPrefijo, '').trim();
    return descLimpia ? `${codigo}: ${descLimpia}` : `${codigo}: ${descripcion}`;
  }

  // Si no dispone de descripción, se evalúa si el nombre aporta información adicional
  if (nombre) {
    const nombreLimpio = nombre.replace(regexPrefijo, '').trim();
    if (nombreLimpio) {
      return `${codigo}: ${nombreLimpio}`;
    }
  }

  return `${codigo}: Resultado de Aprendizaje ${r.numero}`;
};

/**
 * GraficoRadarCompetencias - Componente visual reutilizable para el mapa competencial en radar.
 *
 * Responsabilidad Única: Renderizar el gráfico radial (Chart tipo radar) del rendimiento
 * de un discente en los Resultados de Aprendizaje de una clase formativa. Diseñado de forma
 * aislada para incrustarse en InformeCompetencia (CU 12.5) y Ficha Completa del Discente (CU 07),
 * adaptándose automáticamente al modo claro y oscuro.
 *
 * @param {Object} props
 * @param {Array<Object>} props.ras - Lista de Resultados de Aprendizaje con calificaciones calculadas.
 * @param {Object|null} [props.discente] - Datos del discente para contextualizar el gráfico.
 * @param {Object|null} [props.clase] - Datos de la clase formativa para el encabezado.
 * @param {Object|null} [props.modulo] - Datos del módulo formativo (compatibilidad).
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 * @param {string} [props.altura='380px'] - Altura del contenedor del gráfico.
 * @param {boolean} [props.mostrarCabecera=true] - Si se debe incluir la cabecera del panel.
 * @param {string} [props.className=''] - Clases CSS adicionales.
 */
export const GraficoRadarCompetencias = ({
  ras = [],
  discente = null,
  clase = null,
  modulo = null,
  cargando = false,
  altura = '380px',
  mostrarCabecera = true,
  className = ''
}) => {
  // Estado del tema para adaptar tipografías, rejillas y contrastes al modo oscuro
  const { esOscuro } = useTema();

  // Colores calculados según el modo claro u oscuro con alto contraste
  const colorTextoPrincipal = esOscuro ? '#ffffff' : '#0f172a';
  const colorTextoSecundario = esOscuro ? '#e2e8f0' : '#475569';
  const colorGrid = esOscuro ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)';
  const colorAngleLines = esOscuro ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.10)';
  const colorTooltipFondo = esOscuro ? 'rgba(15, 23, 42, 0.96)' : 'rgba(17, 24, 39, 0.94)';
  const colorTooltipBorde = esOscuro ? '#475569' : '#cbd5e1';

  // Cálculo de la nota media global entre los RAs evaluados
  const estadisticas = useMemo(() => {
    if (!ras || ras.length === 0) {
      return { media: null, evaluados: 0, total: 0 };
    }

    const conNota = ras.filter((r) => r.nota !== null && r.nota !== undefined);
    if (conNota.length === 0) {
      return { media: null, evaluados: 0, total: ras.length };
    }

    let suma = 0;
    let sumaPesos = 0;

    conNota.forEach((r) => {
      const peso = r.peso > 0 ? r.peso : 1;
      suma += r.nota * peso;
      sumaPesos += peso;
    });

    const media = sumaPesos > 0 ? Math.round(suma / sumaPesos) : Math.round(suma / conNota.length);

    return {
      media,
      evaluados: conNota.length,
      total: ras.length
    };
  }, [ras]);

  // Configuración de los datos del gráfico tipo Radar de Chart.js
  const datosRadar = useMemo(() => {
    if (!ras || ras.length === 0) return null;

    const etiquetas = ras.map((r) => `RA${r.numero}`);
    const valores = ras.map((r) => (r.nota !== null && r.nota !== undefined ? r.nota : 0));

    // El color dominante del polígono responde a la nota media del discente adaptada al tema
    const colorMedia = getColorNota(estadisticas.media !== null ? estadisticas.media : 50, esOscuro);

    const coloresPuntos = ras.map((r) => {
      if (r.nota === null || r.nota === undefined) return esOscuro ? '#64748b' : '#94a3b8';
      return getColorNota(r.nota, esOscuro).hex;
    });

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Calificación (0-100)',
          data: valores,
          backgroundColor: `${colorMedia.hex}33`,
          borderColor: colorMedia.hex,
          pointBackgroundColor: coloresPuntos,
          pointBorderColor: esOscuro ? '#1e293b' : '#ffffff',
          pointHoverBackgroundColor: esOscuro ? '#0f172a' : '#ffffff',
          pointHoverBorderColor: colorMedia.hex,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2
        }
      ]
    };
  }, [ras, estadisticas.media, esOscuro]);

  // Opciones de configuración para el gráfico tipo Radar con alta legibilidad en modo oscuro
  const opcionesRadar = useMemo(() => {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: colorTextoPrincipal,
            font: { size: 12, weight: '600' }
          }
        },
        tooltip: {
          titleColor: '#ffffff',
          bodyColor: '#f1f5f9',
          backgroundColor: colorTooltipFondo,
          borderColor: colorTooltipBorde,
          borderWidth: 1,
          callbacks: {
            title: (contexto) => {
              const idx = contexto[0]?.dataIndex;
              const r = ras[idx];
              if (!r) return '';
              return formatearNombreRA(r);
            },
            label: (contexto) => {
              const idx = contexto.dataIndex;
              const r = ras[idx];
              const valor = r?.nota;

              if (valor === null || valor === undefined) {
                return ' Calificación: Sin calificar';
              }

              const { etiqueta } = getColorNota(valor, esOscuro);
              const estado = r.completo ? 'Completo' : 'En evaluación';
              return ` Calificación: ${valor}/100 (${etiqueta}) — ${estado}`;
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            showLabelBackdrop: false,
            backdropColor: 'transparent',
            color: esOscuro ? '#cbd5e1' : '#64748b',
            font: { size: 10, weight: '600' }
          },
          grid: {
            color: colorGrid
          },
          angleLines: {
            color: colorAngleLines
          },
          pointLabels: {
            color: colorTextoPrincipal,
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }, [
    ras,
    esOscuro,
    colorTextoPrincipal,
    colorTextoSecundario,
    colorGrid,
    colorAngleLines,
    colorTooltipFondo,
    colorTooltipBorde
  ]);

  if (cargando) {
    return (
      <div className={`surface-card p-4 border-round-xl border-1 surface-border shadow-1 ${className}`.trim()}>
        <CargadorSeccion texto="Generando mapa competencial en radar..." />
      </div>
    );
  }

  if (!ras || ras.length === 0) {
    return (
      <div className={`surface-card p-4 border-round-xl border-1 surface-border shadow-1 ${className}`.trim()}>
        <EstadoVacio
          mensaje="Sin Resultados de Aprendizaje"
          descripcion="La clase seleccionada no cuenta con Resultados de Aprendizaje registrados en la base de datos."
          icono="pi pi-compass"
          className="my-2"
        />
      </div>
    );
  }

  const nombreDiscente = discente
    ? `${discente.nombre || ''} ${discente.apellidos || ''}`.trim()
    : '';

  const tituloClase = clase
    ? (clase.etiqueta || `${clase.cursoNombre || ''} — ${clase.moduloSiglas ? `${clase.moduloSiglas}: ` : ''}${clase.moduloNombre || ''}`)
    : modulo
    ? `${modulo.siglas ? `${modulo.siglas} - ` : ''}${modulo.nombre || ''}`
    : '';

  return (
    <div className={`surface-card p-4 border-round-xl border-1 surface-border shadow-1 ${className}`.trim()}>
      {mostrarCabecera && (
        <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-compass text-primary text-xl" />
            <div>
              <h3 className="text-base md:text-lg font-bold m-0" style={{ color: colorTextoPrincipal }}>
                Mapa de Competencias Individual
              </h3>
              {(nombreDiscente || tituloClase) && (
                <span className="text-xs" style={{ color: esOscuro ? '#94a3b8' : '#64748b' }}>
                  {nombreDiscente && <span>{nombreDiscente}</span>}
                  {nombreDiscente && tituloClase && <span> &bull; </span>}
                  {tituloClase && <span>{tituloClase}</span>}
                </span>
              )}
            </div>
          </div>

          {estadisticas.media !== null && (
            <div className="flex align-items-center gap-2">
              <span className="text-xs font-medium" style={{ color: esOscuro ? '#94a3b8' : '#64748b' }}>
                Nota media del perfil:
              </span>
              <div
                className="px-2 py-1 border-round font-bold text-xs"
                style={{
                  backgroundColor: `${getColorNota(estadisticas.media, esOscuro).hex}20`,
                  color: getColorNota(estadisticas.media, esOscuro).hex,
                  border: `1px solid ${getColorNota(estadisticas.media, esOscuro).hex}40`
                }}
              >
                {estadisticas.media} / 100
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenedor del gráfico tipo Radar */}
      <div className="w-full flex justify-content-center align-items-center" style={{ height: altura }}>
        <Chart
          key={esOscuro ? 'radar-dark' : 'radar-light'}
          type="radar"
          data={datosRadar}
          options={opcionesRadar}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Leyenda perimetral con los descriptores completos de cada RA */}
      <div className="mt-3 pt-3 border-top-1 surface-border">
        <div className="grid text-xs">
          {ras.map((r) => {
            const colorPunto =
              r.nota !== null && r.nota !== undefined
                ? getColorNota(r.nota, esOscuro).hex
                : (esOscuro ? '#64748b' : '#94a3b8');
            const textoCompleto = formatearNombreRA(r);
            const esAmarillo = r.nota !== null && r.nota >= 60 && r.nota < 70;

            return (
              <div key={r.id_ra} className="col-12 sm:col-6 lg:col-4 flex align-items-center gap-2 py-1">
                <span
                  className="w-2.5rem text-center font-bold px-1 border-round flex-shrink-0 text-xs"
                  style={{
                    backgroundColor: colorPunto,
                    color: esAmarillo ? '#0f172a' : '#ffffff'
                  }}
                >
                  RA{r.numero}
                </span>
                <span
                  className="text-overflow-ellipsis overflow-hidden white-space-nowrap flex-1 text-xs"
                  style={{ color: colorTextoSecundario }}
                  title={textoCompleto}
                >
                  {textoCompleto}
                </span>
                <span
                  className="font-bold flex-shrink-0 text-xs"
                  style={{ color: colorTextoPrincipal }}
                >
                  {r.nota !== null && r.nota !== undefined ? `${r.nota} / 100` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GraficoRadarCompetencias;
