import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

/**
 * VistaPorDiscentes - Componente presentacional para el desglose agrupado por discentes.
 *
 * Responsabilidad Única: Renderizar el acordeón estilizado según el diseño general de la aplicación,
 * omitir enunciados de prácticas, presentar etiquetas abreviadas con fondo transparente y permitir
 * tanto calificar como reorientar a la asignación de evaluación cuando falte dicha vinculación.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de alumnos agrupados con sus prácticas pendientes.
 * @param {Function} props.onCalificar - Manejador para navegar al calificador de la práctica correspondiente.
 * @param {Function} props.onAsignarEvaluacion - Manejador para navegar a la sección de asignación de evaluación.
 */
export const VistaPorDiscentes = ({
  discentes = [],
  onCalificar,
  onAsignarEvaluacion
}) => {
  // Acordeón inicialmente colapsado (ningún panel abierto por defecto)
  const [indicesActivos, setIndicesActivos] = useState([]);

  // Plantilla para la cabecera de cada pestaña de discente
  const plantillaCabecera = (alumno) => {
    return (
      <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2 w-full pr-2">
        <div className="flex align-items-center gap-2 overflow-hidden min-w-0">
          <i className="pi pi-user text-primary flex-shrink-0" />
          <span className="font-bold text-900 text-sm md:text-base white-space-nowrap overflow-hidden text-overflow-ellipsis">
            {alumno.discenteNombreCompleto}
          </span>
          {alumno.discenteNia && (
            <span className="text-color-secondary text-xs flex-shrink-0">
              (NIA: {alumno.discenteNia})
            </span>
          )}
        </div>

        <div className="flex align-items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {/* Tag con texto acortado 'Prácticas' y fondo transparente */}
          <Tag
            value={`${alumno.totalPracticasPendientes} Prácticas`}
            severity="warning"
            className="tag-transparente text-xs font-semibold border-1 border-orange-400 text-orange-600 px-2 py-1"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-column w-full gap-2">
      {/* Controles rápidos para expandir o colapsar todos los paneles */}
      <div className="flex justify-content-end gap-2 mb-1">
        <Button
          label="Expandir todo"
          icon="pi pi-angle-double-down"
          text
          size="small"
          onClick={() => setIndicesActivos(discentes.map((_, i) => i))}
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
        {discentes.map((alumno) => (
          <AccordionTab
            key={alumno.id_discente}
            header={plantillaCabecera(alumno)}
          >
            <div className="flex flex-column gap-2 py-1">
              <span className="text-xs text-500 font-semibold uppercase tracking-wider mb-1">
                Prácticas pendientes para {alumno.discenteNombreCompleto} ({alumno.practicas.length}):
              </span>

              {/* Listado de prácticas pendientes del alumno */}
              <div className="flex flex-column gap-2">
                {alumno.practicas.map((practica, idx) => {
                  const tieneEvaluacion = Boolean(practica.id_evaluacion);

                  return (
                    <div
                      key={practica.id_version}
                      className="p-3 border-round surface-card border-1 surface-border flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 hover:surface-50 transition-colors"
                    >
                      <div className="flex align-items-center gap-2 overflow-hidden min-w-0">
                        <span className="text-xs text-400 font-medium w-1rem text-right flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <i className="pi pi-bookmark text-primary text-sm flex-shrink-0" />
                        <div className="flex align-items-center gap-2 flex-wrap overflow-hidden min-w-0">
                          {/* Nombre de la práctica y versión (sin enunciado) */}
                          <span className="font-semibold text-sm text-900">
                            {practica.practicaNombre}
                          </span>
                          {practica.versionNumero && (
                            <span className="text-color-secondary text-xs">
                              ({practica.versionNumero})
                            </span>
                          )}

                          {/* Etiquetas acortadas con fondo transparente */}
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
                        </div>
                      </div>

                      {/* Botones de acción: Calificar siempre disponible, y Asignar evaluación al lado si carece de ella */}
                      <div className="flex align-items-center gap-2 flex-shrink-0 self-end sm:self-center">
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
                            tooltipOptions={{ position: 'left' }}
                          />
                        )}
                        <Button
                          label="Calificar"
                          icon="pi pi-pencil"
                          size="small"
                          severity="primary"
                          onClick={() => onCalificar(practica)}
                          className="p-button-sm text-xs font-semibold"
                          tooltip="Ir al cuaderno de notas para calificar esta actividad"
                          tooltipOptions={{ position: 'left' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
};

export default VistaPorDiscentes;
