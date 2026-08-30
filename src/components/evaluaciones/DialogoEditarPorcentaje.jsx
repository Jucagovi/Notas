import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import useToast from '../../hooks/useToast.js';

// Modal de diálogo para editar el porcentaje de cobertura de una asignación existente en la tabla trabajan
const DialogoEditarPorcentaje = ({
  visible = false,
  alOcultar = () => {},
  asignacion = null
}) => {
  const { asignarPracticaACE, guardando } = useEvaluacionGestionContexto();
  const { mostrarExito, mostrarError } = useToast();

  const [porcentaje, setPorcentaje] = useState(100);
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (visible && asignacion) {
      setPorcentaje(asignacion.porcentaje || 100);
      setDescripcion(asignacion.descripcion || '');
    }
  }, [visible, asignacion]);

  const manejarGuardar = async () => {
    if (!asignacion) return;

    if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
      mostrarError('Porcentaje inválido', 'El porcentaje debe situarse entre 1% y 100%.');
      return;
    }

    const resp = await asignarPracticaACE({
      id_ce: asignacion.id_ce,
      id_practica: asignacion.id_practica,
      porcentaje,
      descripcion,
      vincularEvaluacion: false
    });

    if (resp.exito) {
      mostrarExito('Porcentaje actualizado', 'Se ha guardado la modificación del porcentaje.');
      alOcultar();
    } else {
      mostrarError('Error', resp.error || 'No se pudo actualizar la asignación.');
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
        label="Actualizar"
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
      header="Modificar Cobertura del Criterio"
      footer={footerDialogo}
      style={{ width: '90vw', maxWidth: '480px' }}
      modal
      className="p-fluid"
    >
      {asignacion && (
        <div className="flex flex-column gap-3 pt-1">
          <div className="surface-ground p-3 border-round surface-border border-1">
            <span className="text-xs text-muted block font-semibold">Práctica:</span>
            <span className="font-bold text-sm block mb-2">{asignacion.Practicas?.nombre || 'Práctica'}</span>

            <span className="text-xs text-muted block font-semibold">Criterio de Evaluación:</span>
            <span className="font-bold text-sm block">CE {asignacion.CE?.numero}: {asignacion.CE?.nombre || 'Criterio'}</span>
          </div>

          <div>
            <label htmlFor="edit-porcentaje" className="block text-sm font-semibold mb-1">
              Nuevo Porcentaje (%):
            </label>
            <InputNumber
              id="edit-porcentaje"
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
          </div>

          <div>
            <label htmlFor="edit-descripcion" className="block text-sm font-semibold mb-1">
              Observaciones:
            </label>
            <InputTextarea
              id="edit-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full text-sm"
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DialogoEditarPorcentaje;
