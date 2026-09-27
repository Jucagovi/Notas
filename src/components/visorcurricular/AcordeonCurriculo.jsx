import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';

/**
 * AcordeonCurriculo - Componente presentacional basado en Accordion para visualizar RA y CE.
 *
 * Responsabilidad Única: Renderizar cada Resultado de Aprendizaje como una pestaña colapsable
 * mostrando su formato "nombre: descripción" en una sola línea truncada con tooltip en title,
 * y desplegando en su interior exclusivamente el conteo y la lista de Criterios de Evaluación asociados
 * sin cabeceras de columnas ni tarjetas redundantes.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.arbolNodos=[]] - Nodos jerárquicos estructurados con RAs y sus CEs asociados.
 */
export const AcordeonCurriculo = ({ arbolNodos = [] }) => {
  // Estado local para los índices de pestañas activas
  const [indicesActivos, setIndicesActivos] = useState([]);

  // Expande todas las pestañas de Resultados de Aprendizaje
  const expandirTodo = () => {
    setIndicesActivos(arbolNodos.map((_, i) => i));
  };

  // Colapsa todas las pestañas
  const colapsarTodo = () => {
    setIndicesActivos([]);
  };

  // Plantilla para la cabecera personalizada de cada Resultado de Aprendizaje en la barra del acordeón
  const plantillaCabeceraRa = (ra) => {
    const nombreRa = (ra.nombre || `RA${ra.numero}`).trim();
    const descripcionRa = (ra.descripcion || '').trim();
    const textoCompletoRa = descripcionRa
      ? `${nombreRa}: ${descripcionRa}`
      : nombreRa;

    return (
      <div className="flex align-items-center w-full pr-2 overflow-hidden min-w-0">
        <div className="flex align-items-center gap-2 overflow-hidden min-w-0 flex-1">
          <i className="pi pi-bookmark text-primary text-base flex-shrink-0" />
          <span
            className="font-bold text-900 text-sm sm:text-base white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 min-w-0"
            title={textoCompletoRa}
          >
            <span className="text-primary mr-1">{nombreRa}:</span>
            <span className="text-800 font-semibold">{descripcionRa}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-column w-full mb-4">
      {/* Barra de herramientas para expansión masiva con estilo estándar de la aplicación */}
      <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-3 px-1">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-sitemap text-primary text-lg" />
          <span className="font-bold text-900 text-base">
            Estructura Curricular por Resultados de Aprendizaje
          </span>
        </div>
        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            icon="pi pi-plus"
            label="Expandir todos"
            severity="secondary"
            text
            size="small"
            onClick={expandirTodo}
            disabled={!arbolNodos || arbolNodos.length === 0}
            className="p-button-sm text-xs"
          />
          <Button
            type="button"
            icon="pi pi-minus"
            label="Colapsar todos"
            severity="secondary"
            text
            size="small"
            onClick={colapsarTodo}
            disabled={!arbolNodos || arbolNodos.length === 0}
            className="p-button-sm text-xs"
          />
        </div>
      </div>

      {/* Acordeón adaptado con los iconos y estilos estándar del sistema */}
      <Accordion
        multiple
        activeIndex={indicesActivos}
        onTabChange={(e) => setIndicesActivos(e.index)}
        expandIcon="pi pi-chevron-right"
        collapseIcon="pi pi-chevron-down"
        className="acordeon-curriculo w-full"
      >
        {arbolNodos.map((nodoRa) => {
          const ra = nodoRa.data;
          const criterios = nodoRa.children || [];

          return (
            <AccordionTab
              key={nodoRa.key}
              header={plantillaCabeceraRa(ra)}
            >
              <div className="flex flex-column gap-2 py-1">
                {/* Texto indicativo con el número de CEs asociados */}
                <span className="text-xs text-500 font-semibold uppercase tracking-wider mb-1">
                  Criterios de evaluación asociados ({criterios.length})
                </span>

                {/* Listado de Criterios de Evaluación sin cabeceras de columnas */}
                {criterios.length === 0 ? (
                  <p className="text-xs text-color-secondary italic m-0 py-2">
                    No hay Criterios de Evaluación registrados para este Resultado de Aprendizaje.
                  </p>
                ) : (
                  <div className="flex flex-column gap-2">
                    {criterios.map((nodoCe) => {
                      const ce = nodoCe.data;
                      const nombreCe = (ce.nombre || `CE${ce.numero}`).trim();
                      const descripcionCe = (ce.descripcion || '').trim();
                      const textoCompletoCe = descripcionCe
                        ? `${nombreCe}: ${descripcionCe}`
                        : nombreCe;

                      return (
                        <div
                          key={nodoCe.key}
                          className="surface-card p-2 md:p-3 border-round border-1 surface-border flex align-items-center gap-2 hover:surface-50 transition-colors overflow-hidden min-w-0"
                        >
                          <i className="pi pi-check-circle text-green-600 text-sm flex-shrink-0" />
                          <span
                            className="text-800 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 min-w-0"
                            title={textoCompletoCe}
                          >
                            <strong className="text-900 mr-1">{nombreCe}:</strong>
                            <span className="text-700 font-normal">{descripcionCe}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionTab>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AcordeonCurriculo;
