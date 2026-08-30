import React, { useState, useMemo } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import useToast from '../../hooks/useToast.js';

// Componente para el área derecha que muestra la estructura jerárquica de RA y CE con zonas de soltado
const RACEAcordeon = ({
  alSoltarPracticaEnCE = () => {},
  alEditarAsignacion = () => {},
  alAsignarManual = () => {}
}) => {
  const {
    estructuraRA,
    asignacionesTrabajan,
    desvincularPracticaDeCE,
    guardando
  } = useEvaluacionGestionContexto();

  const { mostrarExito, mostrarError } = useToast();

  // Estado para resaltar visualmente el CE sobre el que se está arrastrando
  const [ceArrastreActivo, setCeArrastreActivo] = useState(null);

  // Mapa que agrupa las asignaciones de trabajan por id_ce
  const asignacionesPorCE = useMemo(() => {
    const mapa = new Map();
    (asignacionesTrabajan || []).forEach((asig) => {
      const lista = mapa.get(asig.id_ce) || [];
      lista.push(asig);
      mapa.set(asig.id_ce, lista);
    });
    return mapa;
  }, [asignacionesTrabajan]);

  // Manejo del evento dragover en HTML5
  const manejarDragOver = (e, idCE) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (ceArrastreActivo !== idCE) {
      setCeArrastreActivo(idCE);
    }
  };

  // Manejo del evento dragleave en HTML5
  const manejarDragLeave = (e, idCE) => {
    e.preventDefault();
    if (ceArrastreActivo === idCE) {
      setCeArrastreActivo(null);
    }
  };

  // Manejo del evento drop en HTML5
  const manejarDrop = (e, ce) => {
    e.preventDefault();
    setCeArrastreActivo(null);
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (rawData) {
        const datosPractica = JSON.parse(rawData);
        if (datosPractica && datosPractica.id_practica) {
          alSoltarPracticaEnCE({ practica: datosPractica, ce });
        }
      }
    } catch (err) {
      console.error('Error al procesar el soltado de la práctica:', err);
    }
  };

  // Confirmación y desvinculación de una práctica de un CE
  const confirmarEliminarAsignacion = (asig) => {
    const nombrePractica = asig.Practicas?.nombre || 'la práctica';
    const nombreCE = asig.CE?.nombre || 'el criterio';

    confirmDialog({
      message: `¿Desea desvincular ${nombrePractica} de ${nombreCE}?`,
      header: 'Confirmar desvinculación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desvincular',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger p-button-sm',
      rejectClassName: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        const resp = await desvincularPracticaDeCE(asig.id_trabajan);
        if (resp.exito) {
          mostrarExito('Práctica desvinculada', 'Se ha eliminado la asignación del criterio.');
        } else {
          mostrarError('Error', resp.error || 'No se pudo eliminar la asignación.');
        }
      }
    });
  };

  if (estructuraRA.length === 0) {
    return (
      <div className="surface-card p-4 border-round shadow-1 h-full flex flex-column align-items-center justify-content-center text-center">
        <i className="pi pi-book text-5xl text-muted mb-3" />
        <h4 className="m-0 font-bold mb-1">Sin Resultados de Aprendizaje</h4>
        <p className="text-sm text-muted m-0 max-w-28rem">
          No hay Resultados de Aprendizaje (RA) ni Criterios de Evaluación (CE) configurados para el módulo seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card p-3 border-round shadow-1 h-full flex flex-column">
      <ConfirmDialog />

      {/* Cabecera del panel de Resultados de Aprendizaje */}
      <div className="flex align-items-center justify-content-between mb-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-check-square text-success text-xl" />
          <h3 className="m-0 text-lg font-bold">Resultados de Aprendizaje y Criterios</h3>
        </div>
        <Tag severity="info" value={`${estructuraRA.length} RAs`} />
      </div>

      <p className="text-xs text-muted m-0 mb-3">
        Suelte las prácticas en los Criterios de Evaluación para asignarles porcentaje de contribución a la calificación.
      </p>

      {/* Acordeón de RA con apertura múltiple */}
      <div
        className="flex-1 overflow-y-auto pr-1"
        style={{ maxHeight: 'calc(100vh - 360px)', minHeight: '380px' }}
      >
        <Accordion multiple activeIndex={[0]}>
          {estructuraRA.map((ra) => {
            const criterios = ra.criterios || [];
            // Cálculo del porcentaje medio de cobertura de los CE de este RA
            let sumaPorcentajes = 0;
            criterios.forEach((ce) => {
              const asignaciones = asignacionesPorCE.get(ce.id_ce) || [];
              const totalCE = asignaciones.reduce((acc, a) => acc + (a.porcentaje || 0), 0);
              sumaPorcentajes += Math.min(totalCE, 100);
            });
            const promedioCobertura = criterios.length > 0 ? Math.round(sumaPorcentajes / criterios.length) : 0;

            const headerRA = (
              <div className="flex align-items-center justify-content-between w-full pr-3 gap-2">
                <div className="flex align-items-center gap-2">
                  <span className="font-bold text-sm">
                    RA {ra.numero}: {ra.nombre}
                  </span>
                </div>
                <div className="flex align-items-center gap-2">
                  <Tag
                    value={`${promedioCobertura}% cubierto`}
                    severity={
                      promedioCobertura >= 100 ? 'success' : promedioCobertura > 0 ? 'info' : 'warning'
                    }
                    className="text-xs"
                  />
                  <Tag
                    value={`${criterios.length} CE`}
                    severity="secondary"
                    className="text-xs"
                  />
                </div>
              </div>
            );

            return (
              <AccordionTab key={ra.id_ra} header={headerRA}>
                {criterios.length === 0 ? (
                  <div className="text-center p-3 text-muted text-sm border-round surface-ground">
                    No hay Criterios de Evaluación definidos para este RA.
                  </div>
                ) : (
                  <div className="flex flex-column gap-3">
                    {criterios.map((ce) => {
                      const asignaciones = asignacionesPorCE.get(ce.id_ce) || [];
                      const porcentajeTotalCE = asignaciones.reduce(
                        (acc, a) => acc + (a.porcentaje || 0),
                        0
                      );
                      const esArrastreSobre = ceArrastreActivo === ce.id_ce;

                      return (
                        <div
                          key={ce.id_ce}
                          data-swapy-slot={`slot-ce-${ce.id_ce}`}
                          onDragOver={(e) => manejarDragOver(e, ce.id_ce)}
                          onDragLeave={(e) => manejarDragLeave(e, ce.id_ce)}
                          onDrop={(e) => manejarDrop(e, ce)}
                          className={`p-3 border-round transition-all surface-card ${
                            esArrastreSobre
                              ? 'border-2 border-primary surface-hover shadow-2'
                              : 'border-1 surface-border'
                          }`}
                          style={{ minHeight: '90px' }}
                        >
                          {/* Cabecera del Criterio de Evaluación */}
                          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-1 mb-2">
                            <div className="flex align-items-start gap-2">
                              <span className="font-bold text-sm text-color">
                                CE {ce.numero}: {ce.nombre}
                              </span>
                              {ce.descripcion && (
                                <i
                                  className="pi pi-info-circle text-xs text-muted cursor-pointer"
                                  title={ce.descripcion}
                                />
                              )}
                            </div>

                            <div className="flex align-items-center gap-2">
                              <Tag
                                value={`${porcentajeTotalCE}%`}
                                severity={
                                  porcentajeTotalCE >= 100
                                    ? 'success'
                                    : porcentajeTotalCE > 0
                                    ? 'info'
                                    : 'warning'
                                }
                                className="text-xs font-bold"
                              />
                              <Button
                                type="button"
                                icon="pi pi-plus"
                                size="small"
                                label="Asignar"
                                severity="secondary"
                                text
                                onClick={() => alAsignarManual(ce)}
                                tooltip="Asignar una práctica manualmente a este criterio"
                                tooltipOptions={{ position: 'top' }}
                                className="p-1 text-xs"
                              />
                            </div>
                          </div>

                          {/* Barra de progreso de cobertura del CE */}
                          <div className="mb-2">
                            <ProgressBar
                              value={Math.min(porcentajeTotalCE, 100)}
                              showValue={false}
                              style={{ height: '6px' }}
                              color={
                                porcentajeTotalCE >= 100
                                  ? 'var(--green-500, #22c55e)'
                                  : porcentajeTotalCE > 0
                                  ? 'var(--primary-color, #1174c0)'
                                  : 'var(--orange-500, #f97316)'
                              }
                            />
                          </div>

                          {/* Zona de soltado y lista de prácticas asignadas */}
                          {asignaciones.length === 0 ? (
                            <div
                              className={`flex align-items-center justify-content-center p-2 border-round border-dashed text-xs text-muted ${
                                esArrastreSobre
                                  ? 'border-primary surface-hover font-bold text-primary'
                                  : 'surface-ground surface-border'
                              }`}
                            >
                              <i className="pi pi-arrow-down-right mr-1" />
                              Arrastre y suelte una práctica aquí para asignarla a este criterio
                            </div>
                          ) : (
                            <div className="flex flex-column gap-1">
                              {asignaciones.map((asig) => (
                                <div
                                  key={asig.id_trabajan}
                                  className="flex align-items-center justify-content-between p-2 border-round surface-ground surface-border border-1 text-xs gap-2"
                                >
                                  <div className="flex align-items-center gap-2 flex-1 min-w-0">
                                    <i className="pi pi-file text-primary" />
                                    <span className="font-semibold text-color truncate">
                                      {asig.Practicas?.numero ? `${asig.Practicas.numero}. ` : ''}
                                      {asig.Practicas?.nombre || 'Práctica'}
                                    </span>
                                    {asig.descripcion && (
                                      <span className="text-muted italic text-xs truncate max-w-12rem">
                                        ({asig.descripcion})
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex align-items-center gap-1">
                                    <Tag
                                      value={`${asig.porcentaje}%`}
                                      severity="primary"
                                      className="text-xs"
                                    />
                                    <Button
                                      type="button"
                                      icon="pi pi-pencil"
                                      size="small"
                                      severity="secondary"
                                      text
                                      disabled={guardando}
                                      onClick={() => alEditarAsignacion(asig)}
                                      tooltip="Editar porcentaje de cobertura"
                                      tooltipOptions={{ position: 'top' }}
                                      className="p-1 text-xs"
                                    />
                                    <Button
                                      type="button"
                                      icon="pi pi-trash"
                                      size="small"
                                      severity="danger"
                                      text
                                      disabled={guardando}
                                      onClick={() => confirmarEliminarAsignacion(asig)}
                                      tooltip="Desvincular práctica"
                                      tooltipOptions={{ position: 'top' }}
                                      className="p-1 text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionTab>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default RACEAcordeon;
