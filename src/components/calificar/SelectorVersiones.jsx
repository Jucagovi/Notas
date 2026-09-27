import React from 'react';
import { Tag } from 'primereact/tag';

/**
 * SelectorVersiones - Componente para la visualización y selección interactiva de versiones de una práctica.
 *
 * Responsabilidad Única: Renderizar las versiones disponibles para la práctica y clase activas,
 * permitiendo al docente hacer clic para activar la calificación de la versión deseada.
 *
 * @param {Object} props
 * @param {Array<Object>} props.versiones - Lista de versiones registradas.
 * @param {string|null} props.versionSeleccionadaId - Identificador de la versión activa.
 * @param {Function} props.onSeleccionarVersion - Callback al hacer clic en una versión.
 * @param {boolean} props.cargando - Indicador de estado de carga.
 * @param {Object|null} props.practicaSeleccionada - Objeto de la práctica activa.
 */
const SelectorVersiones = ({
  versiones = [],
  versionSeleccionadaId,
  onSeleccionarVersion,
  cargando = false,
  practicaSeleccionada = null
}) => {
  if (!practicaSeleccionada) {
    return null;
  }

  if (cargando) {
    return (
      <div className="surface-card p-3 border-round shadow-1 mb-3 flex align-items-center gap-2 text-color-secondary">
        <i className="pi pi-spin pi-spinner text-primary" />
        <span className="text-sm">Cargando versiones de la práctica...</span>
      </div>
    );
  }

  if (versiones.length === 0) {
    return (
      <div className="surface-card p-4 border-round shadow-1 mb-3 text-center border-1 surface-border">
        <i className="pi pi-info-circle text-2xl text-blue-500 mb-2" />
        <h4 className="text-900 font-bold m-0 mb-1">
          No hay versiones disponibles para esta clase
        </h4>
        <p className="text-color-secondary text-sm m-0">
          La práctica &quot;{practicaSeleccionada.nombre}&quot; no tiene versiones asignadas para este curso escolar.
          Puedes añadir una versión desde el Taller de Prácticas.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="flex align-items-center justify-content-between mb-2">
        <span className="text-sm font-semibold text-700">
          Versiones de &quot;{practicaSeleccionada.nombre}&quot; disponibles para calificar:
        </span>
        <span className="text-xs text-color-secondary">
          Haz clic en una versión para ver y editar sus notas
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {versiones.map((v) => {
          const esActiva = v.id_version === versionSeleccionadaId;
          const evaluacionNombre = v.Evaluaciones?.nombre || (v.id_evaluacion ? 'Evaluación asociada' : null);
          const peso = Number(v.peso_evaluacion);

          return (
            <div
              key={v.id_version}
              onClick={() => onSeleccionarVersion(v)}
              className={`p-2 px-3 border-round cursor-pointer transition-all flex align-items-center gap-2 border-1 select-none ${
                esActiva
                  ? 'bg-primary-50 border-primary text-primary-700 shadow-1 font-bold'
                  : 'surface-card border-300 text-700 hover:surface-100 hover:border-400'
              }`}
            >
              <i className={`pi ${esActiva ? 'pi-check-circle text-primary' : 'pi-bookmark text-400'}`} />
              <span className="text-sm font-bold">
                {v.numero || 'v1.0'}
              </span>

              {evaluacionNombre && (
                <Tag
                  value={evaluacionNombre}
                  severity={esActiva ? 'info' : 'secondary'}
                  className="text-xs"
                />
              )}

              {peso > 0 && (
                <span className="text-xs font-medium text-color-secondary bg-surface-100 px-2 py-1 border-round">
                  {peso}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorVersiones;
