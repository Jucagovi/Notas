import React from 'react';
import { Tag } from 'primereact/tag';

/**
 * PanelResumenCurricular - Visualizador de cobertura curricular para las prácticas seleccionadas.
 *
 * Responsabilidad Única: Renderizar el mensaje descriptivo en tiempo real y las etiquetas
 * de porcentaje de cobertura para cada Resultado de Aprendizaje cubierto por la evaluación.
 *
 * @param {Object} props
 * @param {Object} props.resumen - Objeto con { coberturasRA, textoResumen, totalVersiones, totalCEsCubiertos }.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 */
export const PanelResumenCurricular = ({ resumen, className = '' }) => {
  if (!resumen) return null;

  const { coberturasRA = [], textoResumen = '', totalVersiones = 0 } = resumen;

  // Asignación de severidad semántica según el porcentaje de cobertura del RA.
  const obtenerSeveridadPorcentaje = (porcentaje) => {
    if (porcentaje >= 80) return 'success';
    if (porcentaje >= 50) return 'info';
    if (porcentaje > 0) return 'warning';
    return 'secondary';
  };

  return (
    <div
      className={`surface-50 p-3 border-round border-1 surface-border flex flex-column gap-2 ${className}`}
    >
      <div className="flex align-items-center justify-content-between gap-2 flex-wrap">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-pie text-primary text-sm" />
          <span className="text-xs font-bold text-700 uppercase">
            Resumen Curricular Estimado
          </span>
        </div>

        <span className="text-xs text-secondary">
          {totalVersiones} {totalVersiones === 1 ? 'práctica seleccionada' : 'prácticas seleccionadas'}
        </span>
      </div>

      {/* Frase reglamentaria en tiempo real (ej: "Esta evaluación cubrirá el RA1 (100%), RA2 (45%) y RA3 (20%)") */}
      <p className="m-0 text-sm font-semibold text-900 line-height-2">
        {textoResumen}
      </p>

      {/* Badges detallados con porcentaje por cada RA */}
      {coberturasRA.length > 0 && (
        <div className="flex align-items-center gap-2 flex-wrap mt-1">
          {coberturasRA.map((item) => (
            <Tag
              key={item.id_ra || item.codigo}
              value={`${item.codigo}: ${item.porcentaje}%`}
              severity={obtenerSeveridadPorcentaje(item.porcentaje)}
              className="text-xs font-bold px-2 py-1"
              title={`${item.nombre || item.codigo} (${item.cesCubiertos} de ${item.totalCEs} criterios cubiertos)`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PanelResumenCurricular;
