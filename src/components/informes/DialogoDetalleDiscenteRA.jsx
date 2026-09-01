import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { getColorNota } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Componente modal para inspeccionar el desglose curricular de criterios y prácticas de un RA para un discente
const DialogoDetalleDiscenteRA = ({
  visible = false,
  onHide = () => {},
  discente = null,
  ra = null,
  detalle = null
}) => {
  if (!discente || !ra) return null;

  const criterios = detalle?.criterios || [];
  const notaRA = detalle?.nota;
  const infoColorRA = getColorNota(notaRA);
  const esCompleto = detalle?.completo;

  const encabezadoModal = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-sliders-h text-primary text-xl" />
      <div>
        <div className="font-bold text-base text-color">
          Desglose de {ra.codigo || `RA ${ra.numero}`} ({ra.peso || 0}%)
        </div>
        <div className="text-xs text-muted">
          {discente.nombreCompleto || `${discente.nombre} ${discente.apellidos}`} {discente.NIA ? `(NIA: ${discente.NIA})` : ''}
        </div>
      </div>
    </div>
  );

  const pieModal = (
    <div className="flex justify-content-end">
      <Button
        label="Cerrar"
        icon="pi pi-check"
        size="small"
        onClick={onHide}
      />
    </div>
  );

  return (
    <Dialog
      header={encabezadoModal}
      footer={pieModal}
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '750px' }}
      breakpoints={{ '960px': '85vw', '641px': '98vw' }}
      className="p-fluid"
      modal
    >
      {/* 1. Resumen superior del Resultado de Aprendizaje */}
      <div className="surface-50 p-3 border-round border-1 surface-border mb-3">
        <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 mb-2">
          <div className="font-bold text-sm text-color">
            {ra.nombre || 'Resultado de Aprendizaje'}
          </div>
          <div className="flex align-items-center gap-2 flex-shrink-0">
            <Tag
              value={esCompleto ? 'RA Completo (100% Criterios)' : `RA Parcial (${detalle?.cesCompletos || 0}/${detalle?.totalCE || 0} CE)`}
              severity={esCompleto ? 'success' : 'warning'}
              icon={esCompleto ? 'pi pi-check' : 'pi pi-exclamation-circle'}
              className="text-xs"
            />
            <span
              className={`inline-flex align-items-center justify-content-center border-round px-2 py-1 font-bold text-sm shadow-1 ${infoColorRA.bg} ${infoColorRA.text}`}
            >
              {notaRA !== null && notaRA !== undefined ? formatNota(notaRA) : '?'} / 100
            </span>
          </div>
        </div>
        {ra.descripcion && (
          <p className="text-muted text-xs m-0 line-height-3">
            {ra.descripcion}
          </p>
        )}
      </div>

      <Divider align="left" className="my-2">
        <span className="text-xs font-bold text-muted uppercase">
          Criterios de Evaluación y Prácticas Asociadas
        </span>
      </Divider>

      {/* 2. Listado de Criterios de Evaluación (CE) */}
      {criterios.length === 0 ? (
        <div className="text-center py-4 text-muted text-sm">
          No hay criterios de evaluación registrados para este Resultado de Aprendizaje.
        </div>
      ) : (
        <div className="flex flex-column gap-3">
          {criterios.map((ce) => {
            const infoColorCE = getColorNota(ce.nota);
            const practicas = ce.practicas || [];

            return (
              <div
                key={ce.id_ce}
                className="surface-card p-3 border-round border-1 surface-border shadow-1"
              >
                {/* Cabecera del Criterio */}
                <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 mb-2">
                  <div className="flex align-items-center gap-2">
                    <span className="font-bold text-xs bg-primary-100 text-primary border-round px-2 py-1">
                      {ce.numero ? `CE ${ce.numero}` : 'CE'}
                    </span>
                    <span className="font-bold text-sm text-color">
                      {ce.nombre || 'Criterio de Evaluación'}
                    </span>
                    <Tag
                      value={`Peso: ${ce.peso || 0}%`}
                      severity="info"
                      className="text-xs px-2 py-0"
                    />
                  </div>

                  <div className="flex align-items-center gap-2 flex-shrink-0">
                    <Tag
                      value={ce.completo ? 'Completo' : 'Parcial'}
                      severity={ce.completo ? 'success' : 'warning'}
                      className="text-xs"
                    />
                    <span
                      className={`inline-flex align-items-center justify-content-center border-round px-2 py-1 font-bold text-xs ${infoColorCE.bg} ${infoColorCE.text}`}
                    >
                      {ce.nota !== null && ce.nota !== undefined ? formatNota(ce.nota) : '?'}
                    </span>
                  </div>
                </div>

                {ce.descripcion && (
                  <p className="text-muted text-xs mb-2 line-height-3">
                    {ce.descripcion}
                  </p>
                )}

                {/* Prácticas asociadas al Criterio */}
                <div className="surface-50 p-2 border-round border-1 surface-border">
                  <div className="text-xs font-bold text-500 mb-1">
                    Prácticas evaluadas ({ce.practicasCalificadas || 0} de {ce.totalPracticas || 0} calificadas):
                  </div>

                  {practicas.length === 0 ? (
                    <div className="text-xs text-muted italic">
                      No hay prácticas asignadas a este criterio en la tabla trabajan.
                    </div>
                  ) : (
                    <div className="grid">
                      {practicas.map((p, idx) => {
                        const colorPractica = getColorNota(p.nota);
                        return (
                          <div key={idx} className="col-12 sm:col-6">
                            <div className="flex align-items-center justify-content-between p-2 surface-card border-round border-1 surface-border text-xs">
                              <div className="flex align-items-center gap-1 overflow-hidden text-overflow-ellipsis white-space-nowrap">
                                <i className="pi pi-file-edit text-primary text-xs" />
                                <span className="font-semibold" title={p.nombrePractica}>
                                  {p.numeroPractica ? `${p.numeroPractica}. ` : ''}{p.nombrePractica}
                                </span>
                                <span className="text-muted">({p.porcentaje}%)</span>
                              </div>
                              <span
                                className={`font-bold border-round px-1 py-0 ${colorPractica.bg} ${colorPractica.text}`}
                              >
                                {p.nota !== null && p.nota !== undefined ? formatNota(p.nota) : '?'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
};

export default DialogoDetalleDiscenteRA;
