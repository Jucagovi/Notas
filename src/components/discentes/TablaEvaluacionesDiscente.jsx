import React from 'react';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * TablaEvaluacionesDiscente - Subcomponente presentacional para el desglose de evaluaciones del alumno.
 *
 * Responsabilidad Única: Renderizar la tabla de actividades agrupada por evaluaciones
 * con coloreado dinámico según la escala cromática oficial y edición de calificaciones en celda.
 *
 * @param {Object} props
 * @param {Array<Object>} props.actividades - Actividades y versiones con sus calificaciones.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia de nota activa.
 * @param {Function} props.onGuardarNota - Manejador para actualizar la nota (idVersion, idEvaluacion, nuevaNota).
 * @param {Function} [props.onError] - Manejador de notificación de errores.
 */
export const TablaEvaluacionesDiscente = ({
  actividades = [],
  cargando = false,
  guardando = false,
  onGuardarNota,
  onError
}) => {
  // Plantilla visual para el agrupador de evaluación (Row Group Header)
  const plantillaCabeceraEvaluacion = (fila) => {
    return (
      <div className="flex align-items-center justify-content-between py-2 px-3 bg-surface-100 font-bold border-round text-800 text-sm w-full my-1">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary" />
          <span>{fila.nombre_evaluacion}</span>
        </div>
        {fila.fecha_evaluacion && (
          <span className="text-xs text-color-secondary font-normal flex align-items-center gap-1">
            <i className="pi pi-clock text-xs" />
            {fila.fecha_evaluacion}
          </span>
        )}
      </div>
    );
  };

  // Plantilla visual para la actividad práctica y enunciado
  const plantillaActividad = (fila) => {
    return (
      <div className="flex flex-column gap-1 py-1">
        <div className="flex align-items-center gap-2">
          <span
            className="font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
            data-pr-tooltip={fila.nombre_practica}
          >
            {fila.nombre_practica}
          </span>
          <Tag
            value={fila.numero_version || 'v1.0'}
            severity="secondary"
            className="text-xs font-mono"
          />
        </div>
        {fila.enunciado && (
          <span
            className="text-xs text-color-secondary white-space-nowrap overflow-hidden text-overflow-ellipsis block"
            data-pr-tooltip={fila.enunciado}
          >
            {fila.enunciado}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para la columna de peso en la evaluación
  const plantillaPeso = (fila) => {
    if (fila.peso_evaluacion === null || fila.peso_evaluacion === undefined) {
      return <span className="text-color-secondary text-xs">-</span>;
    }
    return (
      <span className="font-semibold text-xs text-700">
        {fila.peso_evaluacion}%
      </span>
    );
  };

  // Plantilla visual para la celda de calificación (modo lectura)
  // Regla estricta: si no hay nota, signo ? centrado sin color. Con nota, coloreado con getColorNota.
  const plantillaNota = (fila) => {
    const tieneNota =
      fila.nota !== null &&
      fila.nota !== undefined &&
      fila.nota !== '' &&
      !isNaN(Number(fila.nota));

    if (!tieneNota) {
      return (
        <div className="flex align-items-center justify-content-center">
          <span
            className="font-bold text-base text-color-secondary border-round px-3 py-1 surface-100 hover:surface-200 transition-colors cursor-pointer select-none"
            data-pr-tooltip="Sin calificar. Haz clic para asignar una nota."
          >
            ?
          </span>
        </div>
      );
    }

    const { clase, etiqueta } = getColorNota(fila.nota);

    return (
      <div className="flex align-items-center justify-content-center">
        <span
          className={`font-bold text-base border-round px-3 py-1 surface-100 hover:surface-200 transition-colors cursor-pointer select-none ${clase}`}
          data-pr-tooltip={`Calificación: ${fila.nota} (${etiqueta}). Haz clic para editar.`}
        >
          {fila.nota}
        </span>
      </div>
    );
  };

  // Editor numérico en celda (In-cell Editing)
  const editorNota = (opciones) => {
    return (
      <div className="flex justify-content-center w-full">
        <InputNumber
          value={opciones.value}
          onValueChange={(e) => opciones.editorCallback(e.value)}
          min={0}
          max={100}
          step={1}
          showButtons={false}
          className="w-full max-w-7rem"
          inputClassName="text-center font-bold text-base"
          autoFocus
          placeholder="?"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              opciones.closeEditorCallback(e);
            }
          }}
        />
      </div>
    );
  };

  // Manejador al finalizar la edición de la celda de calificación
  const alCompletarEdicionCelda = async (e) => {
    const { rowData, newValue, field, originalEvent } = e;

    // Si el valor numérico no varía, no se procesa ninguna actualización
    if (rowData[field] === newValue) {
      return;
    }

    // Validación numérica estricta entre 0 y 100
    if (newValue !== null && newValue !== undefined && String(newValue).trim() !== '') {
      const valorNumerico = Number(newValue);
      if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 100) {
        if (originalEvent) {
          originalEvent.preventDefault();
        }
        if (onError) {
          onError('La calificación debe estar comprendida estrictamente entre 0 y 100.');
        }
        return;
      }
    }

    await onGuardarNota(rowData.id_version, rowData.id_evaluacion, newValue);
  };

  return (
    <div className="surface-card p-3 border-round-xl border-1 surface-border shadow-1 mb-4">
      <Tooltip target="[data-pr-tooltip]" />

      <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-list-check text-primary" />
          <h3 className="text-base font-bold text-900 m-0">
            Calificaciones por Evaluación
          </h3>
        </div>

        <div className="flex align-items-center gap-2 text-xs text-color-secondary">
          <i className="pi pi-info-circle text-primary" />
          <span>
            Haz clic en la celda de <strong>Nota</strong> para editar al vuelo.
          </span>
          {guardando && (
            <span className="text-primary font-bold flex align-items-center gap-1 ml-2">
              <i className="pi pi-spin pi-spinner text-xs" />
              Guardando...
            </span>
          )}
        </div>
      </div>

      <TablaBase
        value={actividades}
        loading={cargando}
        rowGroupMode="subheader"
        groupRowsBy="nombre_evaluacion"
        sortMode="single"
        sortField="nombre_evaluacion"
        sortOrder={1}
        rowGroupHeaderTemplate={plantillaCabeceraEvaluacion}
        editMode="cell"
        paginator={actividades.length > 15}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se han registrado actividades prácticas para este módulo."
        className="p-datatable-sm w-full"
      >
        <Column
          field="nombre_practica"
          header="Actividad / Práctica"
          body={plantillaActividad}
          style={{ minWidth: '260px' }}
        />
        <Column
          field="peso_evaluacion"
          header="Peso"
          body={plantillaPeso}
          style={{ width: '90px', textAlign: 'center' }}
          bodyClassName="text-center"
        />
        <Column
          field="nota"
          header="Nota"
          body={plantillaNota}
          editor={editorNota}
          onCellEditComplete={alCompletarEdicionCelda}
          style={{ width: '120px', textAlign: 'center' }}
          bodyClassName="text-center"
        />
      </TablaBase>
    </div>
  );
};

export default TablaEvaluacionesDiscente;
