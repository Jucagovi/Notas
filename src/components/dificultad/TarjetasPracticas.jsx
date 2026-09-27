import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * TarjetasPracticas - Subcomponente presentacional para listar las actividades como tarjetas interactivas.
 *
 * Responsabilidad Única: Renderizar el catálogo de prácticas y versiones de la clase en formato
 * de tarjetas compactas, omitiendo estrictamente el enunciado de la actividad conforme a la especificación,
 * y permitiendo al usuario seleccionar una versión para calcular su histograma.
 *
 * @param {Object} props
 * @param {Array<Object>} props.versiones - Lista de actividades y versiones disponibles.
 * @param {string|null} props.versionSeleccionadaId - Identificador de la versión activa seleccionada.
 * @param {Function} props.onSeleccionarVersion - Manejador de evento al hacer clic en una tarjeta.
 */
export const TarjetasPracticas = ({
  versiones = [],
  versionSeleccionadaId = null,
  onSeleccionarVersion
}) => {
  if (versiones.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin actividades disponibles"
        descripcion="No se han encontrado prácticas o versiones asociadas a la clase seleccionada."
        icono="pi pi-folder-open"
        className="w-full my-4"
      />
    );
  }

  return (
    <div className="flex flex-column w-full mb-4">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-list text-primary text-xl" />
          <span className="font-bold text-lg text-color">
            Prácticas y Actividades de la Clase
          </span>
          <Tag
            value={`${versiones.length} ${versiones.length === 1 ? 'actividad' : 'actividades'}`}
            severity="secondary"
            rounded
          />
        </div>
        <span className="text-sm text-color-secondary">
          Selecciona una tarjeta para ver su análisis de dificultad
        </span>
      </div>

      <div className="grid">
        {versiones.map((v) => {
          const esSeleccionada = versionSeleccionadaId === v.id_version;

          return (
            <div key={v.id_version} className="col-12 sm:col-6 md:col-4 lg:col-3">
              <Card
                className={`h-full cursor-pointer transition-all transition-duration-200 border-2 ${
                  esSeleccionada
                    ? 'border-primary shadow-4 surface-card'
                    : 'border-transparent surface-card shadow-1 hover:shadow-3 hover:border-300'
                }`}
                onClick={() => onSeleccionarVersion(v.id_version)}
              >
                <div className="flex flex-column gap-2">
                  {/* Encabezado: en primer lugar el nombre de la práctica */}
                  <div className="flex justify-content-between align-items-start gap-2">
                    <div className="flex align-items-center gap-2 min-w-0 flex-1">
                      <div
                        className={`flex align-items-center justify-content-center border-round flex-shrink-0 ${
                          esSeleccionada ? 'bg-primary text-white' : 'bg-primary-50 text-primary'
                        }`}
                        style={{ width: '2rem', height: '2rem' }}
                      >
                        <i className="pi pi-file-edit text-base" />
                      </div>
                      <div
                        className="font-bold text-color text-base white-space-nowrap overflow-hidden text-overflow-ellipsis"
                        title={v.nombrePractica}
                      >
                        {v.nombrePractica}
                      </div>
                    </div>

                    {esSeleccionada && (
                      <i className="pi pi-check-circle text-primary text-lg flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Debajo: versión y evaluación asociada */}
                  <div className="flex align-items-center justify-content-between gap-2 mt-1">
                    <Tag
                      value={v.numeroVersion}
                      severity={esSeleccionada ? 'primary' : 'info'}
                      className="font-semibold text-xs"
                    />

                    {/* Evaluación o convocatoria asociada */}
                    <div className="flex align-items-center gap-1 text-color-secondary text-xs min-w-0">
                      <i className="pi pi-calendar text-xs flex-shrink-0" />
                      <span
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis"
                        title={v.evaluacionNombre}
                      >
                        {v.evaluacionNombre}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TarjetasPracticas;
