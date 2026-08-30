import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import useToast from '../../hooks/useToast.js';

// Modal de diálogo para gestionar las prácticas asignadas a la evaluación seleccionada (tabla evaluan)
const DialogoGestionEvaluacion = ({
  visible = false,
  alOcultar = () => {}
}) => {
  const {
    evaluacionSeleccionada,
    practicas,
    practicasEvaluacion,
    vincularPracticaAEvaluacion,
    desvincularPracticaDeEvaluacion,
    guardando
  } = useEvaluacionGestionContexto();

  const { mostrarExito, mostrarError } = useToast();

  const [practicaAAgregarId, setPracticaAAgregarId] = useState(null);
  const [pesoPorDefecto, setPesoPorDefecto] = useState(100);

  // Prácticas disponibles para agregar que no estén ya en la evaluación
  const idsYaEnEvaluacion = new Set((practicasEvaluacion || []).map((p) => p.id_practica));
  const practicasParaAgregar = (practicas || []).filter((p) => !idsYaEnEvaluacion.has(p.id_practica));

  const opcionesPracticas = practicasParaAgregar.map((p) => ({
    label: `${p.numero ? `${p.numero}. ` : ''}${p.nombre} (UD ${p.unidad || '-'})`,
    value: p.id_practica
  }));

  // Agregar una práctica a la evaluación
  const manejarAgregarPractica = async () => {
    if (!practicaAAgregarId) return;

    const resp = await vincularPracticaAEvaluacion(practicaAAgregarId, pesoPorDefecto);
    if (resp.exito) {
      mostrarExito('Práctica agregada', 'La práctica ha sido asignada a la evaluación para los alumnos.');
      setPracticaAAgregarId(null);
    } else {
      mostrarError('Error', resp.error || 'No se pudo agregar la práctica.');
    }
  };

  // Quitar una práctica de la evaluación
  const manejarQuitarPractica = async (idPractica) => {
    const resp = await desvincularPracticaDeEvaluacion(idPractica);
    if (resp.exito) {
      mostrarExito('Práctica removida', 'Se ha desvinculado la práctica de esta evaluación.');
    } else {
      mostrarError('Error', resp.error || 'No se pudo remover la práctica.');
    }
  };

  const footerDialogo = (
    <div className="flex justify-content-end">
      <Button label="Cerrar" icon="pi pi-times" severity="secondary" text onClick={alOcultar} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={alOcultar}
      header={`Prácticas en ${evaluacionSeleccionada?.nombre || 'la Evaluación'}`}
      footer={footerDialogo}
      style={{ width: '92vw', maxWidth: '720px' }}
      modal
    >
      {evaluacionSeleccionada && (
        <div className="flex flex-column gap-3 pt-1">
          {/* Resumen de la evaluación */}
          <div className="surface-ground p-3 border-round surface-border border-1 flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
            <div>
              <span className="font-bold text-base text-color block">
                {evaluacionSeleccionada.nombre} Evaluación
              </span>
              <span className="text-xs text-muted">
                {evaluacionSeleccionada.Modulos?.nombre || 'Módulo'} - {evaluacionSeleccionada.Cursos?.nombre || 'Curso'}
              </span>
            </div>
            <Tag
              severity="info"
              value={`${practicasEvaluacion.length} prácticas registradas`}
              className="text-xs font-bold"
            />
          </div>

          {/* Formulario para agregar una nueva práctica a la evaluación */}
          <div className="surface-card p-3 border-round surface-border border-1 flex flex-column gap-2">
            <span className="text-xs font-bold text-muted uppercase">Vincular Práctica a esta Convocatoria:</span>
            <div className="grid align-items-center">
              <div className="col-12 sm:col-7">
                <Dropdown
                  value={practicaAAgregarId}
                  options={opcionesPracticas}
                  onChange={(e) => setPracticaAAgregarId(e.value)}
                  placeholder={
                    opcionesPracticas.length === 0
                      ? 'Todas las prácticas ya están vinculadas'
                      : 'Seleccione una práctica...'
                  }
                  disabled={opcionesPracticas.length === 0 || guardando}
                  className="w-full text-sm"
                  filter
                />
              </div>
              <div className="col-6 sm:col-3">
                <InputNumber
                  value={pesoPorDefecto}
                  onValueChange={(e) => setPesoPorDefecto(e.value)}
                  min={1}
                  max={100}
                  locale="es-ES"
                  suffix="%"
                  placeholder="Peso"
                  className="w-full text-sm"
                  disabled={guardando}
                />
              </div>
              <div className="col-6 sm:col-2">
                <Button
                  label="Añadir"
                  icon="pi pi-plus"
                  size="small"
                  className="w-full"
                  disabled={!practicaAAgregarId || guardando}
                  loading={guardando}
                  onClick={manejarAgregarPractica}
                />
              </div>
            </div>
          </div>

          {/* Tabla de prácticas actualmente asociadas a la evaluación */}
          <div>
            <span className="text-xs font-bold text-muted uppercase block mb-2">
              Prácticas que componen esta Evaluación ({practicasEvaluacion.length}):
            </span>
            <DataTable
              value={practicasEvaluacion}
              emptyMessage="No hay prácticas vinculadas a esta evaluación todavía."
              className="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <Column
                field="practica.nombre"
                header="Práctica"
                body={(rowData) => (
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-file text-primary" />
                    <span className="font-semibold text-sm">
                      {rowData.practica?.numero ? `${rowData.practica.numero}. ` : ''}
                      {rowData.practica?.nombre || 'Práctica'}
                    </span>
                  </div>
                )}
              />
              <Column
                field="practica.unidad"
                header="Unidad"
                style={{ width: '90px' }}
                body={(rowData) => (
                  <Tag value={`UD ${rowData.practica?.unidad || '-'}`} severity="secondary" className="text-xs" />
                )}
              />
              <Column
                field="registrosCount"
                header="Discentes"
                style={{ width: '100px' }}
                body={(rowData) => (
                  <Tag value={`${rowData.registrosCount || 0} alumnos`} severity="info" className="text-xs" />
                )}
              />
              <Column
                header="Acciones"
                style={{ width: '80px', textAlign: 'center' }}
                body={(rowData) => (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    disabled={guardando}
                    onClick={() => manejarQuitarPractica(rowData.id_practica)}
                    tooltip="Quitar de esta evaluación"
                    tooltipOptions={{ position: 'top' }}
                  />
                )}
              />
            </DataTable>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DialogoGestionEvaluacion;
