import React from 'react';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';

/**
 * EditorCualitativoSeguimiento - Subcomponente presentacional para la redacción
 * cualitativa del docente y ajuste de la fecha límite de corte.
 *
 * Responsabilidad Única: Ofrecer los controles de entrada de PrimeReact (Calendar e InputTextarea)
 * para definir la fecha de corte y redactar tanto las observaciones e incidencias como el detalle
 * cualitativo de contenidos impartidos.
 *
 * @param {Object} props
 * @param {Date|null} props.fechaCorte - Fecha de corte seleccionada.
 * @param {Function} props.onCambioFechaCorte - Manejador de actualización de fecha de corte.
 * @param {string} props.observaciones - Texto de observaciones e incidencias.
 * @param {Function} props.onCambioObservaciones - Manejador de actualización de observaciones.
 * @param {string} props.contenidosImpartidosTexto - Redacción cualitativa de contenidos impartidos.
 * @param {Function} props.onCambioContenidosImpartidosTexto - Manejador de actualización de contenidos impartidos.
 * @param {boolean} [props.deshabilitado=false] - Indicador de estado deshabilitado.
 */
const EditorCualitativoSeguimiento = ({
  fechaCorte,
  onCambioFechaCorte,
  observaciones,
  onCambioObservaciones,
  contenidosImpartidosTexto,
  onCambioContenidosImpartidosTexto,
  deshabilitado = false
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 surface-border">
        <i className="pi pi-file-edit text-primary text-xl" />
        <h3 className="text-base md:text-lg font-bold text-900 m-0">
          Editor Cualitativo del Informe
        </h3>
      </div>

      <div className="grid formgrid p-fluid row-gap-3">
        {/* 1. Selector de Fecha de Corte con Calendar */}
        <div className="col-12 sm:col-6 md:col-4">
          <label htmlFor="fecha-corte" className="block text-xs font-bold text-700 uppercase mb-2">
            Fecha de Corte (Hasta)
          </label>
          <Calendar
            id="fecha-corte"
            value={fechaCorte}
            onChange={(e) => onCambioFechaCorte(e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Selecciona fecha..."
            disabled={deshabilitado}
            className="w-full"
          />
          <small className="text-color-secondary block mt-1">
            Determina el límite de las Unidades de Trabajo a contrastar.
          </small>
        </div>

        {/* 2. Resumen cualitativo de Contenidos Impartidos */}
        <div className="col-12 md:col-8">
          <label
            htmlFor="contenidos-impartidos-texto"
            className="block text-xs font-bold text-700 uppercase mb-2"
          >
            Redacción Cualitativa de Contenidos Impartidos
          </label>
          <InputTextarea
            id="contenidos-impartidos-texto"
            value={contenidosImpartidosTexto}
            onChange={(e) => onCambioContenidosImpartidosTexto(e.target.value)}
            rows={3}
            autoResize
            disabled={deshabilitado}
            placeholder="Describe la marcha y el cumplimiento de los contenidos impartidos..."
            className="w-full"
          />
          <small className="text-color-secondary block mt-1">
            Texto explicativo que se reflejará en la columna de Contenidos Impartidos del documento oficial.
          </small>
        </div>

        {/* 3. Componente InputTextarea grande para Observaciones e Incidencias */}
        <div className="col-12">
          <label
            htmlFor="observaciones-incidencias"
            className="block text-xs font-bold text-700 uppercase mb-2"
          >
            Observaciones e Incidencias
          </label>
          <InputTextarea
            id="observaciones-incidencias"
            value={observaciones}
            onChange={(e) => onCambioObservaciones(e.target.value)}
            rows={4}
            autoResize
            disabled={deshabilitado}
            placeholder="Redacta las observaciones generales, incidencias o propuestas de mejora..."
            className="w-full text-base"
          />
          <small className="text-color-secondary block mt-1">
            Texto formal que ocupará el bloque final a ancho completo del informe.
          </small>
        </div>
      </div>
    </div>
  );
};

export default EditorCualitativoSeguimiento;
