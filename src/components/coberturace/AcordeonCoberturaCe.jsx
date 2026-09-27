import React, { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

/**
 * AcordeonCoberturaCe - Componente presentacional jerárquico de auditoría curricular mediante acordeón para RA.
 *
 * Responsabilidad Única: Renderizar el acordeón para los Resultados de Aprendizaje (RA) inicialmente colapsado,
 * garantizando que todos los RA dispongan del icono inicial de apertura/cierre. Dentro de cada RA, los Criterios
 * de Evaluación (CE) se presentan en formato apilado: una fila superior con el nombre del CE truncado y su Tag de cobertura
 * con código cromático estricto (verde si 100, naranja si 1-99, rojo si 0), y una fila inferior con las tarjetas de las
 * versiones que lo cubren mostrando la versión y su ponderación coloreada.
 *
 * @param {Object} props
 * @param {Array<Object>} props.ras - Colección jerárquica de RAs procesados con sus criterios y versiones.
 */
export const AcordeonCoberturaCe = ({ ras = [] }) => {
  // Estado local para los índices activos de los RAs (inicialmente colapsados: array vacío)
  const [indicesRaActivos, setIndicesRaActivos] = useState([]);

  // Función para expandir todos los RAs
  const expandirTodosLosRa = () => {
    setIndicesRaActivos(ras.map((_, idx) => idx));
  };

  // Función para colapsar todos los RAs
  const colapsarTodosLosRa = () => {
    setIndicesRaActivos([]);
  };

  // Helper para determinar el estilo cromático estricto de la ponderación
  // Verde si 100, naranja si 1-99 (incluidos), rojo si 0
  const obtenerEstiloCromatico = (porcentaje) => {
    const p = Number(porcentaje) || 0;
    if (p === 100) {
      return {
        color: '#15803d',
        backgroundColor: 'transparent',
        borderColor: '#86efac'
      };
    }
    if (p >= 1 && p <= 99) {
      return {
        color: '#c2410c',
        backgroundColor: 'transparent',
        borderColor: '#fdba74'
      };
    }
    return {
      color: '#b91c1c',
      backgroundColor: 'transparent',
      borderColor: '#fca5a5'
    };
  };

  // Helper para renderizar la etiqueta Tag de un Criterio de Evaluación con el código de color obligatorio
  const renderizarTagCe = (porcentajeTotal) => {
    const p = Number(porcentajeTotal) || 0;
    const estilo = obtenerEstiloCromatico(p);

    if (p === 100) {
      return (
        <Tag
          value="100%"
          icon="pi pi-check"
          title="Cobertura curricular completa (100%)"
          className="font-bold px-2 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    if (p === 0) {
      return (
        <Tag
          value="0%"
          icon="pi pi-times-circle"
          title="Criterio sin evaluar: ninguna actividad asignada"
          className="font-bold px-2 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    if (p > 100) {
      return (
        <Tag
          value={`${p}%`}
          icon="pi pi-exclamation-circle"
          title={`Error de diseño curricular: supera el 100% en un ${p - 100}%`}
          className="font-bold px-2 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    // Cobertura parcial entre 1 y 99%
    return (
      <Tag
        value={`${p}%`}
        icon="pi pi-exclamation-triangle"
        title={`Cobertura incompleta: falta un ${100 - p}% por cubrir`}
        className="font-bold px-2 py-1 border-1 bg-transparent"
        style={estilo}
      />
    );
  };

  // Helper para renderizar la etiqueta Tag de un Resultado de Aprendizaje con el mismo código de color
  const renderizarTagRa = (ra) => {
    const p = Number(ra.promedioPorcentaje) || 0;
    const estilo = obtenerEstiloCromatico(p);

    if (ra.esCompleto) {
      return (
        <Tag
          value="100%"
          icon="pi pi-check"
          title="Todos los criterios de evaluación de este RA están cubiertos al 100%"
          className="font-bold px-3 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    if (ra.esSinCubrir || p === 0) {
      return (
        <Tag
          value="0%"
          icon="pi pi-times-circle"
          title="Ningún criterio de evaluación de este RA tiene actividades asignadas"
          className="font-bold px-3 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    if (p > 100) {
      return (
        <Tag
          value={`${p}%`}
          icon="pi pi-exclamation-circle"
          title={`Ponderación desbalanceada en este RA: ${p}%`}
          className="font-bold px-3 py-1 border-1 bg-transparent"
          style={estilo}
        />
      );
    }

    // Cobertura parcial entre 1 y 99%
    return (
      <Tag
        value={`${p}%`}
        icon="pi pi-exclamation-triangle"
        title={`Cobertura parcial en este RA (${ra.criteriosCubiertos}/${ra.totalCE} CE completos)`}
        className="font-bold px-3 py-1 border-1 bg-transparent"
        style={estilo}
      />
    );
  };

  // Plantilla para la cabecera del Resultado de Aprendizaje garantizando la visibilidad del icono
  const plantillaCabeceraRa = (ra) => {
    return (
      <div className="flex align-items-center justify-content-between w-full pr-2 gap-3 min-w-0">
        <div className="flex align-items-center gap-2 overflow-hidden min-w-0 flex-1">
          <i className="pi pi-book text-primary text-base flex-shrink-0" />
          <span
            className="font-bold text-900 text-sm sm:text-base white-space-nowrap overflow-hidden text-overflow-ellipsis"
            title={ra.etiquetaVisual}
          >
            {ra.etiquetaVisual}
          </span>
        </div>
        <div className="flex align-items-center gap-2 flex-shrink-0">
          <span className="text-xs text-color-secondary font-normal hidden sm:inline-block">
            {ra.criteriosCubiertos} de {ra.totalCE} CE cubiertos
          </span>
          {renderizarTagRa(ra)}
        </div>
      </div>
    );
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 border-1 surface-border mb-4">
      {/* Barra superior de utilidades del acordeón */}
      <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border flex-wrap gap-2">
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
            onClick={expandirTodosLosRa}
            className="p-button-sm text-xs"
          />
          <Button
            type="button"
            icon="pi pi-minus"
            label="Colapsar todos"
            severity="secondary"
            text
            size="small"
            onClick={colapsarTodosLosRa}
            className="p-button-sm text-xs"
          />
        </div>
      </div>

      {/* Acordeón único para los Resultados de Aprendizaje con icono garantizado */}
      <Accordion
        multiple
        activeIndex={indicesRaActivos}
        onTabChange={(e) => setIndicesRaActivos(e.index)}
        expandIcon="pi pi-chevron-right"
        collapseIcon="pi pi-chevron-down"
        className="acordeon-cobertura w-full"
      >
        {ras.map((ra) => (
          <AccordionTab key={ra.id_ra} header={plantillaCabeceraRa(ra)}>
            {/* Listado de Criterios de Evaluación en formato apilado (fila CE + fila versiones) */}
            {ra.criterios && ra.criterios.length > 0 ? (
              <div className="flex flex-column gap-3 py-1">
                {ra.criterios.map((ce) => (
                  <div
                    key={ce.id_ce}
                    className="surface-card p-3 border-round border-1 surface-border shadow-1 hover:shadow-2 transition-shadow"
                  >
                    {/* Fila 1: Nombre del CE (truncado con title) + Porcentaje de cobertura con Tag cromático */}
                    <div className="flex align-items-center justify-content-between gap-3 mb-2 pb-2 border-bottom-1 surface-border min-w-0">
                      <div className="flex align-items-center gap-2 overflow-hidden min-w-0 flex-1">
                        <i className="pi pi-check-circle text-primary text-sm flex-shrink-0" />
                        <span
                          className="font-bold text-800 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis cursor-pointer"
                          title={ce.ceEtiqueta}
                        >
                          {ce.ceEtiqueta}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {renderizarTagCe(ce.porcentajeTotal)}
                      </div>
                    </div>

                    {/* Fila 2: Tarjetas de las versiones que cubren este CE */}
                    <div className="w-full pt-1">
                      {ce.actividades && ce.actividades.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {ce.actividades.map((act) => {
                            const p = Number(act.porcentaje) || 0;
                            const estiloPonderacion = obtenerEstiloCromatico(p);

                            return (
                              <div
                                key={act.id_version}
                                className="surface-section p-2 border-round border-1 surface-border shadow-1 flex-1 min-w-12rem max-w-20rem flex flex-column justify-content-between"
                              >
                                {/* Nombre de la versión sin enunciado y sin Tag junto al nombre */}
                                <div className="flex align-items-center gap-2 mb-2 overflow-hidden">
                                  <i className="pi pi-file-edit text-primary text-xs flex-shrink-0" />
                                  <span
                                    className="font-bold text-800 text-xs white-space-nowrap overflow-hidden text-overflow-ellipsis"
                                    title={act.nombre}
                                  >
                                    {act.nombre}
                                  </span>
                                </div>

                                {/* Fila inferior: Versión y ponderación con código de color estricto */}
                                <div className="flex align-items-center justify-content-between pt-1 border-top-1 surface-border text-xs">
                                  <span className="text-color-secondary">
                                    {act.numero ? `Versión ${act.numero}` : 'Versión'}
                                  </span>
                                  <span
                                    className="font-bold text-sm"
                                    style={{ color: estiloPonderacion.color }}
                                  >
                                    {p}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="surface-ground p-2 border-round border-1 surface-border text-xs text-color-secondary flex align-items-center justify-content-between">
                          <div className="flex align-items-center gap-1">
                            <i className="pi pi-info-circle text-xs text-red-500" />
                            <span>Sin versiones asociadas</span>
                          </div>
                          <span
                            className="font-bold text-sm"
                            style={{ color: '#b91c1c' }}
                          >
                            0%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-ground p-3 border-round text-color-secondary text-sm font-italic">
                Este Resultado de Aprendizaje no posee Criterios de Evaluación asignados.
              </div>
            )}
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
};

export default AcordeonCoberturaCe;
