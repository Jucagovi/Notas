import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';

// Modal de diálogo para ver información detallada de una práctica y sus criterios asignados
const DialogoDetallePractica = ({
  visible = false,
  alOcultar = () => {},
  practica = null
}) => {
  const { asignacionesTrabajan } = useEvaluacionGestionContexto();

  const asignacionesEstaPractica = (asignacionesTrabajan || []).filter(
    (a) => a.id_practica === practica?.id_practica
  );

  const sumaPorcentajes = asignacionesEstaPractica.reduce((acc, a) => acc + (a.porcentaje || 0), 0);

  const footerDialogo = (
    <div className="flex justify-content-end">
      <Button label="Cerrar" icon="pi pi-times" severity="secondary" text onClick={alOcultar} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={alOcultar}
      header="Detalles de la Práctica"
      footer={footerDialogo}
      style={{ width: '90vw', maxWidth: '580px' }}
      modal
    >
      {practica && (
        <div className="flex flex-column gap-3 pt-1">
          {/* Cabecera de la práctica */}
          <div className="surface-ground p-3 border-round surface-border border-1 flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between gap-2">
              <span className="font-bold text-base text-color">
                {practica.numero ? `${practica.numero}. ` : ''}{practica.nombre}
              </span>
              {practica.unidad && (
                <Tag value={`Unidad ${practica.unidad}`} severity="info" />
              )}
            </div>

            {practica.id_tipopractica && (
              <div>
                <Tag value={`Tipo: ${practica.id_tipopractica}`} severity="secondary" className="text-xs" />
              </div>
            )}

            {practica.enunciado && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Enunciado:</span>
                <p className="text-xs text-color m-0 bg-white p-2 border-round surface-border border-1">
                  {practica.enunciado}
                </p>
              </div>
            )}

            {practica.descripcion && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Descripción:</span>
                <p className="text-xs text-muted m-0">{practica.descripcion}</p>
              </div>
            )}
          </div>

          {/* Criterios de Evaluación asignados */}
          <div>
            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-sm font-bold text-color">
                Criterios de Evaluación Cubiertos ({asignacionesEstaPractica.length}):
              </span>
              <Tag
                severity="success"
                value={`${sumaPorcentajes}% total`}
                className="text-xs font-bold"
              />
            </div>

            {asignacionesEstaPractica.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted surface-ground border-round">
                Esta práctica aún no ha sido asignada a ningún Criterio de Evaluación.
              </div>
            ) : (
              <div className="flex flex-column gap-2">
                {asignacionesEstaPractica.map((asig) => (
                  <div
                    key={asig.id_trabajan}
                    className="p-2 border-round surface-ground surface-border border-1 text-xs flex flex-column gap-1"
                  >
                    <div className="flex align-items-center justify-content-between">
                      <span className="font-semibold text-color">
                        CE {asig.CE?.numero}: {asig.CE?.nombre}
                      </span>
                      <Tag value={`${asig.porcentaje}%`} severity="primary" className="text-xs" />
                    </div>
                    {asig.descripcion && (
                      <span className="text-muted italic">Nota: {asig.descripcion}</span>
                    )}
                    <ProgressBar
                      value={asig.porcentaje}
                      showValue={false}
                      style={{ height: '4px' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DialogoDetallePractica;
