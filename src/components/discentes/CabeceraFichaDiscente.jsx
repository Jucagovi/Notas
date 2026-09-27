import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

/**
 * CabeceraFichaDiscente - Subcomponente presentacional para la ficha de cabecera del estudiante.
 *
 * Responsabilidad Única: Renderizar la tarjeta superior con avatar, datos identificativos
 * y un botón por cada año académico (obtenido de la tabla Cursos) formateado como YYYY/YYYY+1.
 *
 * @param {Object} props
 * @param {Object} props.discente - Datos personales del estudiante.
 * @param {Array<Object>} [props.aniosAcademicos=[]] - Lista de años académicos disponibles ({ value, label }).
 * @param {number|string|null} props.anioSeleccionado - Año académico actualmente activo.
 * @param {Function} props.onSeleccionarAnio - Manejador al pulsar sobre un botón de año escolar.
 * @param {Function} props.onVolver - Manejador para regresar al directorio general de discentes.
 */
export const CabeceraFichaDiscente = ({
  discente,
  aniosAcademicos = [],
  anioSeleccionado,
  onSeleccionarAnio,
  onVolver
}) => {
  if (!discente) return null;

  const iniciales = `${(discente.nombre || '')[0] || ''}${(discente.apellidos || '')[0] || ''}`.toUpperCase() || 'D';
  const esActivo = discente.activo !== false;

  return (
    <Card className="shadow-1 border-1 surface-border border-round-xl mb-4">
      <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-4">
        {/* Bloque izquierdo: Identidad del discente */}
        <div className="flex align-items-center gap-3 md:gap-4">
          {discente.imagen ? (
            <Avatar
              image={discente.imagen}
              shape="circle"
              size="xlarge"
              className="shadow-2 flex-shrink-0 surface-200"
            />
          ) : (
            <Avatar
              label={iniciales}
              shape="circle"
              size="xlarge"
              className="bg-primary text-white font-bold text-xl flex-shrink-0 shadow-2"
            />
          )}

          <div className="flex flex-column gap-1">
            <div className="flex align-items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-900 m-0">
                {discente.apellidos}, {discente.nombre}
              </h2>
              <Tag
                value={esActivo ? 'Activo' : 'Inactivo'}
                severity={esActivo ? 'success' : 'danger'}
                className="text-xs font-semibold"
              />
            </div>

            <div className="flex align-items-center gap-3 flex-wrap text-sm text-color-secondary mt-1">
              <span className="flex align-items-center gap-1 font-mono">
                <i className="pi pi-id-card text-primary" />
                <strong>NIA:</strong> {discente.NIA || 'Sin NIA'}
              </span>

              {discente.correo && (
                <span className="flex align-items-center gap-1">
                  <i className="pi pi-envelope text-primary" />
                  <a
                    href={`mailto:${discente.correo}`}
                    className="text-color-secondary hover:text-primary no-underline"
                  >
                    {discente.correo}
                  </a>
                </span>
              )}

              {discente.localidad && (
                <span className="flex align-items-center gap-1">
                  <i className="pi pi-map-marker text-primary" />
                  {discente.localidad}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bloque derecho: Botón por cada Año Académico y botón de retorno */}
        <div className="flex flex-column sm:flex-row sm:align-items-center gap-3 border-top-1 lg:border-top-none pt-3 lg:pt-0 surface-border">
          <div className="flex flex-column gap-1">
            <span className="text-xs font-semibold text-700 flex align-items-center gap-1">
              <i className="pi pi-calendar text-primary" />
              Año Académico:
            </span>
            <div className="flex align-items-center gap-2 flex-wrap">
              {aniosAcademicos.map((item) => {
                const esActivo = anioSeleccionado === item.value;
                return (
                  <Button
                    key={item.value}
                    label={item.label}
                    size="small"
                    severity={esActivo ? 'primary' : 'secondary'}
                    outlined={!esActivo}
                    onClick={() => onSeleccionarAnio && onSeleccionarAnio(item.value)}
                    className="font-bold text-xs px-3 py-2"
                  />
                );
              })}
            </div>
          </div>

          <div className="flex align-items-end pt-0 sm:pt-4">
            <Button
              icon="pi pi-arrow-left"
              label="Volver al listado"
              outlined
              severity="secondary"
              size="small"
              onClick={onVolver}
              className="w-full sm:w-auto white-space-nowrap"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CabeceraFichaDiscente;
