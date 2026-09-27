import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';

/**
 * VistaPorPracticas - Componente presentacional para el desglose agrupado por actividades prácticas.
 *
 * Responsabilidad Única: Renderizar el acordeón estilizado según el diseño general de la aplicación,
 * omitiendo enunciados extensos, mostrando etiquetas compactas con fondo transparente y proveyendo
 * el enlace de calificación o de asignación según si la práctica cuenta o no con evaluación.
 *
 * @param {Object} props
 * @param {Array<Object>} props.practicas - Lista de prácticas agrupadas con sus discentes pendientes.
 * @param {Function} props.onCalificar - Manejador para navegar al calificador de la práctica seleccionada.
 * @param {Function} props.onAsignarEvaluacion - Manejador para navegar a la sección de asignación de evaluación.
 */
export const VistaPorPracticas = ({
  practicas = [],
  onCalificar,
  onAsignarEvaluacion
}) => {
  // Acordeón inicialmente colapsado (ningún panel abierto por defecto)
  const [indicesActivos, setIndicesActivos] = useState([]);

  // Plantilla para la cabecera de cada pestaña de práctica
  const plantillaCabecera = (practica) => {
    const tieneEvaluacion = Boolean(practica.id_evaluacion);

    return (
      <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2 w-full pr-2">
        {/* Identificación de la práctica: nombre y versión (sin enunciado) */}
        <div className="flex align-items-center gap-2 overflow-hidden min-w-0">
          <i className="pi pi-bookmark text-primary flex-shrink-0" />
          <span className="font-bold text-900 text-sm md:text-base white-space-nowrap overflow-hidden text-overflow-ellipsis">
            {practica.practicaNombre}
          </span>
          {practica.versionNumero && (
            <span className="text-color-secondary text-xs flex-shrink-0">
              ({practica.versionNumero})
            </span>
          )}
        </div>

        {/* Etiquetas con fondo transparente y textos acortados */}
        <div className="flex align-items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {!tieneEvaluacion ? (
            <Tag
              value="Sin evaluación"
              severity="danger"
              className="tag-transparente text-xs font-semibold border-1 border-red-400 text-red-600 px-2 py-1"
            />
          ) : (
            <Tag
              value="Calificar"
              severity="warning"
              className="tag-transparente text-xs font-semibold border-1 border-orange-400 text-orange-600 px-2 py-1"
              title={practica.evaluacionNombre}
            />
          )}

          <Tag
            value={`${practica.totalDiscentesPendientes} Discentes`}
            severity="warning"
            className="tag-transparente text-xs font-semibold border-1 border-orange-400 text-orange-600 px-2 py-1"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-column w-full gap-2">
      <Tooltip target=".tooltip-discente-item" position="top" />

      {/* Controles rápidos para expandir o colapsar todos los paneles */}
      <div className="flex justify-content-end gap-2 mb-1">
        <Button
          label="Expandir todo"
          icon="pi pi-angle-double-down"
          text
          size="small"
          onClick={() => setIndicesActivos(practicas.map((_, i) => i))}
          className="p-button-sm text-xs p-1"
        />
        <Button
          label="Colapsar todo"
          icon="pi pi-angle-double-up"
          text
          size="small"
          onClick={() => setIndicesActivos([])}
          className="p-button-sm text-xs p-1"
        />
      </div>

      {/* Acordeón adaptado con la clase .acordeon-pendientes e iconos estándar */}
      <Accordion
        multiple
        activeIndex={indicesActivos}
        onTabChange={(e) => setIndicesActivos(e.index)}
        expandIcon="pi pi-chevron-right"
        collapseIcon="pi pi-chevron-down"
        className="acordeon-pendientes w-full"
      >
        {practicas.map((practica) => {
          const tieneEvaluacion = Boolean(practica.id_evaluacion);

          return (
            <AccordionTab
              key={practica.id_version}
              header={plantillaCabecera(practica)}
            >
              <div className="flex flex-column gap-2 py-1">
                <span className="text-xs text-500 font-semibold uppercase tracking-wider mb-1">
                  Discentes pendientes de calificación ({practica.discentes.length}):
                </span>

                {/* Listado de discentes sin calificar */}
                <div className="grid">
                  {practica.discentes.map((alumno, idx) => (
                    <div key={alumno.id_discente} className="col-12 md:col-6 lg:col-4">
                      <div
                        className="p-2 border-round surface-card border-1 surface-border flex align-items-center gap-2 tooltip-discente-item"
                        data-pr-tooltip={`NIA: ${alumno.discenteNia || 'Sin NIA'} | ${alumno.discenteCorreo || 'Sin correo'}`}
                      >
                        <span className="text-xs text-400 font-medium w-1rem text-right">
                          {idx + 1}.
                        </span>
                        <i className="pi pi-user text-primary text-sm flex-shrink-0" />
                        <span className="text-sm font-semibold text-800 white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1">
                          {alumno.discenteNombreCompleto}
                        </span>
                        {alumno.discenteNia && (
                          <span className="text-xs text-color-secondary flex-shrink-0">
                            ({alumno.discenteNia})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Al final del listado: enlace al calificador o a asignar evaluación */}
                <div className="flex flex-column sm:flex-row align-items-center justify-content-between gap-3 pt-3 mt-3 border-top-1 surface-border">
                  <span className="text-xs text-color-secondary">
                    {tieneEvaluacion ? (
                      <>
                        Evaluación asociada: <strong>{practica.evaluacionNombre}</strong>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Actividad sin evaluación asociada (no computará en promedios trimestrales).
                      </span>
                    )}
                  </span>

                  {/* Botones de acción: Calificar siempre disponible, y Asignar evaluación al lado si carece de ella */}
                  <div className="flex align-items-center gap-2">
                    {!tieneEvaluacion && (
                      <Button
                        label="Asignar evaluación"
                        icon="pi pi-briefcase"
                        size="small"
                        severity="warning"
                        outlined
                        onClick={() => onAsignarEvaluacion(practica)}
                        className="p-button-sm text-xs font-semibold"
                        tooltip="Ir al Taller de Prácticas para asociar una evaluación"
                        tooltipOptions={{ position: 'top' }}
                      />
                    )}
                    <Button
                      label="Calificar"
                      icon="pi pi-pencil"
                      size="small"
                      severity="primary"
                      onClick={() => onCalificar(practica)}
                      className="p-button-sm text-xs font-semibold"
                      tooltip="Abre el cuaderno de notas preseleccionando esta práctica"
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                </div>
              </div>
            </AccordionTab>
          );
        })}
      </Accordion>
    </div>
  );
};

export default VistaPorPracticas;
