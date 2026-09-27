import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * TablaActaTrimestres - Componente de visualización tabular (Pivot Table) del acta oficial por trimestres.
 *
 * Responsabilidad Única: Renderizar la matriz de discentes con su columna identificativa fijada (frozen)
 * y columnas dinámicas para cada evaluación oficial, aplicando estrictamente la escala cromática normativa
 * mediante el helper getColorNota y respetando las directrices de paginación superior y truncado textual.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes matriculados estructurada con notas por evaluación.
 * @param {Array<Object>} props.evaluaciones - Lista de evaluaciones normativas ordenadas.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga de datos.
 */
export const TablaActaTrimestres = ({
  discentes = [],
  evaluaciones = [],
  cargando = false
}) => {
  // Plantilla para la columna fija de identificación del discente
  const plantillaDiscente = (rowData) => {
    const textoNombre =
      rowData.nombreCompleto ||
      `${rowData.apellidos || ''}, ${rowData.nombre || ''}`.trim() ||
      'Sin nombre';
    const nia = rowData.nia || rowData.NIA;

    return (
      <div className="flex flex-column justify-content-center py-1">
        <span
          className="font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis cursor-pointer"
          title={textoNombre}
          style={{ maxWidth: '240px' }}
        >
          {textoNombre}
        </span>
        {nia && (
          <span
            className="text-xs text-color-secondary font-monospace"
            title={`Número de Identificación del Alumno: ${nia}`}
          >
            NIA: {nia}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el encabezado de cada evaluación oficial
  const plantillaEncabezadoEvaluacion = (ev) => {
    return (
      <div
        className="flex flex-column align-items-center justify-content-center text-center w-full py-1 cursor-default"
        title={ev.descripcion || ev.nombre}
      >
        <span className="font-bold text-800 text-sm">
          {ev.nombre}
        </span>
        {ev.fecha_fin && (
          <span className="text-xs text-color-secondary font-normal">
            Hasta {new Date(ev.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para las celdas de calificación de cada evaluación
  const plantillaCeldaEvaluacion = (rowData, ev) => {
    const nota = rowData.notas ? rowData.notas[ev.id_evaluacion] : null;

    // Si el discente no dispone de calificaciones computables, se muestra el carácter '?'
    if (nota === null || nota === undefined || isNaN(Number(nota))) {
      return (
        <div
          className="flex align-items-center justify-content-center mx-auto text-color-secondary font-bold text-base select-none"
          title="Sin calificación computable en esta convocatoria"
        >
          ?
        </div>
      );
    }

    // Se obtiene la información semántica y cromática centralizada
    const { hex, etiqueta } = getColorNota(nota);

    return (
      <div
        className="flex align-items-center justify-content-center mx-auto font-bold text-base cursor-help select-none"
        style={{ color: hex }}
        title={`${etiqueta} (${nota} / 100)`}
      >
        {nota}
      </div>
    );
  };

  return (
    <div className="surface-card border-round shadow-1 border-1 surface-border p-3">
      <DataTable
        value={discentes}
        loading={cargando}
        paginator
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No hay calificaciones registradas para la clase seleccionada."
        responsiveLayout="scroll"
        showGridlines
        stripedRows
        className="p-datatable-sm"
        tableStyle={{ minWidth: '45rem' }}
      >
        {/* Columna Nº de orden */}
        <Column
          header="Nº"
          body={(_, options) => (
            <span className="text-color-secondary font-medium text-xs">
              {options.rowIndex + 1}
            </span>
          )}
          style={{ width: '3.5rem', textAlign: 'center' }}
        />

        {/* Columna fija (frozen) con Nombre y Apellidos del discente */}
        <Column
          field="nombreCompleto"
          header="Discente"
          frozen
          sortable
          body={plantillaDiscente}
          style={{ minWidth: '16rem' }}
        />

        {/* Columnas dinámicas generadas a partir de las evaluaciones normativas vinculadas */}
        {evaluaciones.map((ev) => (
          <Column
            key={ev.id_evaluacion}
            field={ev.id_evaluacion}
            header={plantillaEncabezadoEvaluacion(ev)}
            sortable
            body={(rowData) => plantillaCeldaEvaluacion(rowData, ev)}
            style={{ minWidth: '8.5rem', textAlign: 'center' }}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default TablaActaTrimestres;
