import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import useToast from '../../hooks/useToast.js';

// Modal de diálogo para definir el porcentaje de cobertura al asignar una práctica a un criterio de evaluación
const DialogoPorcentajeCobertura = ({
  visible = false,
  alOcultar = () => {},
  datosSeleccion = null // { practica, ce }
}) => {
  const {
    asignarPracticaACE,
    asignacionesTrabajan,
    evaluacionSeleccionada,
    guardando
  } = useEvaluacionGestionContexto();

  const { mostrarExito, mostrarError } = useToast();

  const [porcentaje, setPorcentaje] = useState(100);
  const [descripcion, setDescripcion] = useState('');
  const [vincularAEvaluacion, setVincularAEvaluacion] = useState(true);

  const practica = datosSeleccion?.practica || null;
  const ce = datosSeleccion?.ce || null;

  // Cálculo de la cobertura previa del CE y asignación previa si existe
  const asignacionesCE = (asignacionesTrabajan || []).filter((a) => a.id_ce === ce?.id_ce);
  const asignacionPrevia = asignacionesCE.find((a) => a.id_practica === practica?.id_practica);
  const porcentajePrevioSinEsta = asignacionesCE
    .filter((a) => a.id_practica !== practica?.id_practica)
    .reduce((acc, a) => acc + (a.porcentaje || 0), 0);

  const restantePara100 = Math.max(0, 100 - porcentajePrevioSinEsta);

  // Inicialización del porcentaje por defecto al abrir el diálogo
  useEffect(() => {
    if (visible && datosSeleccion) {
      if (asignacionPrevia) {
        setPorcentaje(asignacionPrevia.porcentaje || 100);
        setDescripcion(asignacionPrevia.descripcion || '');
      } else {
        setPorcentaje(restantePara100 > 0 ? restantePara100 : 100);
        setDescripcion('');
      }
      setVincularAEvaluacion(Boolean(evaluacionSeleccionada));
    }
  }, [visible, datosSeleccion, asignacionPrevia, restantePara100, evaluacionSeleccionada]);

  // Manejo del guardado de la asignación
  const manejarGuardar = async () => {
    if (!practica || !ce) return;

    if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
      mostrarError('Porcentaje inválido', 'El porcentaje debe situarse entre 1% y 100%.');
      return;
    }

    const resp = await asignarPracticaACE({
      id_ce: ce.id_ce,
      id_practica: practica.id_practica,
      porcentaje,
      descripcion,
      vincularEvaluacion: vincularAEvaluacion
    });

    if (resp.exito) {
      mostrarExito(
        'Asignación completada',
        `Práctica "${practica.nombre}" asignada con ${porcentaje}% de cobertura a "${ce.nombre}".`
      );
      alOcultar();
    } else {
      mostrarError('Error al asignar', resp.error || 'No se pudo guardar la asignación.');
    }
  };

  const footerDialogo = (
    <div className="flex align-items-center justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        text
        disabled={guardando}
        onClick={alOcultar}
      />
      <Button
        label="Guardar Asignación"
        icon="pi pi-check"
        severity="primary"
        loading={guardando}
        onClick={manejarGuardar}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={alOcultar}
      header="Asignar Práctica a Criterio de Evaluación"
      footer={footerDialogo}
      style={{ width: '92vw', maxWidth: '560px' }}
      modal
      className="p-fluid"
    >
      {practica && ce && (
        <div className="flex flex-column gap-3 pt-1">
          {/* Tarjeta resumen de la práctica y el CE */}
          <div className="surface-ground p-3 border-round surface-border border-1 flex flex-column gap-2">
            <div>
              <span className="text-xs text-muted block font-semibold uppercase">Práctica Seleccionada:</span>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-file text-primary" />
                <span className="font-bold text-sm text-color">
                  {practica.numero ? `${practica.numero}. ` : ''}{practica.nombre}
                </span>
                {practica.unidad && (
                  <Tag value={`UD ${practica.unidad}`} severity="secondary" className="text-xs" />
                )}
              </div>
            </div>

            <div className="border-top-1 surface-border pt-2">
              <span className="text-xs text-muted block font-semibold uppercase">Criterio de Evaluación (CE):</span>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-check-circle text-success" />
                <span className="font-bold text-sm text-color">
                  CE {ce.numero}: {ce.nombre}
                </span>
              </div>
              {ce.descripcion && (
                <p className="text-xs text-muted m-0 mt-1">{ce.descripcion}</p>
              )}
            </div>
          </div>

          {/* Indicador de cobertura previa del CE */}
          <div>
            <div className="flex align-items-center justify-content-between text-xs mb-1">
              <span className="text-muted">Cobertura actual del criterio (sin esta práctica):</span>
              <span className="font-bold">{porcentajePrevioSinEsta}%</span>
            </div>
            <ProgressBar
              value={Math.min(porcentajePrevioSinEsta, 100)}
              showValue={false}
              style={{ height: '6px' }}
            />
          </div>

          {/* Campo de porcentaje de cobertura */}
          <div>
            <label htmlFor="input-porcentaje" className="block text-sm font-semibold mb-1 text-color">
              Porcentaje de Cobertura (%):
            </label>
            <InputNumber
              id="input-porcentaje"
              value={porcentaje}
              onValueChange={(e) => setPorcentaje(e.value)}
              min={1}
              max={100}
              locale="es-ES"
              suffix="%"
              showButtons
              step={5}
              className="w-full"
              autoFocus
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {restantePara100 > 0 && restantePara100 < 100 && (
                <Button
                  type="button"
                  label={`Restante (${restantePara100}%)`}
                  size="small"
                  outlined
                  severity="info"
                  className="p-1 text-xs"
                  onClick={() => setPorcentaje(restantePara100)}
                />
              )}
              <Button
                type="button"
                label="100%"
                size="small"
                outlined
                severity="secondary"
                className="p-1 text-xs"
                onClick={() => setPorcentaje(100)}
              />
              <Button
                type="button"
                label="50%"
                size="small"
                outlined
                severity="secondary"
                className="p-1 text-xs"
                onClick={() => setPorcentaje(50)}
              />
              <Button
                type="button"
                label="25%"
                size="small"
                outlined
                severity="secondary"
                className="p-1 text-xs"
                onClick={() => setPorcentaje(25)}
              />
            </div>
          </div>

          {/* Observaciones o descripción opcional */}
          <div>
            <label htmlFor="input-descripcion" className="block text-sm font-semibold mb-1 text-color">
              Observaciones (opcional):
            </label>
            <InputTextarea
              id="input-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Ej: Ejercicio 2 de la entrega..."
              className="w-full text-sm"
            />
          </div>

          {/* Opción para vincular a la evaluación reglamentaria actual */}
          {evaluacionSeleccionada && (
            <div className="flex align-items-center gap-2 p-2 border-round surface-ground surface-border border-1">
              <Checkbox
                inputId="check-vincular-eval"
                checked={vincularAEvaluacion}
                onChange={(e) => setVincularAEvaluacion(e.checked)}
              />
              <label htmlFor="check-vincular-eval" className="text-xs cursor-pointer select-none">
                Vincular también a la <strong>{evaluacionSeleccionada.nombre} Evaluación</strong> para todos los discentes matriculados
              </label>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default DialogoPorcentajeCobertura;
