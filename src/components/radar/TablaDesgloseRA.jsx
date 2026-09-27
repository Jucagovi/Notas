import React from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import TablaBase from '../common/TablaBase.jsx';
import useTema from '../../hooks/useTema.js';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * TablaDesgloseRA - Subcomponente presentacional para el desglose numérico de cada RA.
 *
 * Responsabilidad Única: Mostrar en formato tabular (utilizando TablaBase) el detalle exacto
 * de cada Resultado de Aprendizaje del módulo, aplicando obligatoriamente la escala cromática oficial
 * de getColorNota en las celdas de calificación y respetando las reglas de CONVENCIONES.md.
 *
 * @param {Object} props
 * @param {Array<Object>} props.ras - Lista de Resultados de Aprendizaje con calificaciones y pesos.
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 */
export const TablaDesgloseRA = ({ ras = [], cargando = false }) => {
  // Estado del tema para calibrar la escala cromática de notas en modo oscuro
  const { esOscuro } = useTema();
  // Plantilla para la columna de código o identificador corto del RA
  const plantillaCodigo = (rowData) => {
    return (
      <span className="font-bold text-900 white-space-nowrap">
        RA {rowData.numero}
      </span>
    );
  };

  // Plantilla para la denominación del Resultado de Aprendizaje
  const plantillaNombre = (rowData) => {
    return (
      <span
        className="block white-space-nowrap overflow-hidden text-overflow-ellipsis text-800"
        title={rowData.nombre}
      >
        {rowData.nombre || `Resultado de Aprendizaje ${rowData.numero}`}
      </span>
    );
  };

  // Plantilla para la descripción oficial con truncado y tooltip nativo
  const plantillaDescripcion = (rowData) => {
    return (
      <span
        className="block white-space-nowrap overflow-hidden text-overflow-ellipsis text-color-secondary text-sm"
        title={rowData.descripcion || 'Sin descripción curricular'}
      >
        {rowData.descripcion || '-'}
      </span>
    );
  };

  // Plantilla para el peso curricular asignado en la clase
  const plantillaPeso = (rowData) => {
    const valor = Number(rowData.peso);
    return (
      <span className="font-semibold text-700 white-space-nowrap">
        {!Number.isNaN(valor) && valor > 0 ? `${valor}%` : '-'}
      </span>
    );
  };

  // Plantilla para el estado de cobertura curricular evaluada
  const plantillaEstado = (rowData) => {
    if (rowData.completo) {
      return (
        <Tag
          value="Completo"
          severity="success"
          icon="pi pi-check"
          className="text-xs font-semibold"
        />
      );
    }
    return (
      <Tag
        value="En evaluación"
        severity="warning"
        icon="pi pi-clock"
        className="text-xs font-semibold"
      />
    );
  };

  // Plantilla obligatoria para la calificación coloreada mediante getColorNota
  const plantillaNota = (rowData) => {
    const nota = rowData.nota;

    if (nota === null || nota === undefined) {
      return (
        <span className="text-color-secondary italic text-sm white-space-nowrap">
          Sin calificar
        </span>
      );
    }

    const { hex, etiqueta } = getColorNota(nota, esOscuro);

    return (
      <div
        className="px-3 py-1 border-round font-bold text-center inline-flex align-items-center justify-content-center gap-2 white-space-nowrap"
        style={{
          backgroundColor: `${hex}20`,
          color: hex,
          border: `1px solid ${hex}60`,
          minWidth: '6.5rem'
        }}
        title={`${etiqueta}: ${nota}/100`}
      >
        <span>{nota} / 100</span>
        <span className="text-xs font-normal opacity-90">({etiqueta})</span>
      </div>
    );
  };

  return (
    <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1 mt-4">
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-table text-primary text-xl" />
          <div>
            <h3 className="text-base md:text-lg font-bold text-900 m-0">
              Desglose Numérico de Competencias
            </h3>
            <span className="text-xs text-color-secondary">
              Detalle cuantitativo de cada Resultado de Aprendizaje
            </span>
          </div>
        </div>
      </div>

      <TablaBase
        data={ras}
        loading={cargando}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginatorPosition="top"
        emptyMessage="No hay Resultados de Aprendizaje registrados para esta clase."
        stripedRows
        responsiveLayout="scroll"
        className="p-datatable-sm"
      >
        <Column
          field="numero"
          header="RA"
          body={plantillaCodigo}
          sortable
          style={{ width: '6rem' }}
        />
        <Column
          field="nombre"
          header="Denominación"
          body={plantillaNombre}
          sortable
          style={{ minWidth: '14rem' }}
        />
        <Column
          field="descripcion"
          header="Descripción Curricular"
          body={plantillaDescripcion}
          style={{ minWidth: '16rem' }}
        />
        <Column
          field="peso"
          header="Peso en la Clase"
          body={plantillaPeso}
          sortable
          className="text-center"
          headerClassName="justify-content-center"
          style={{ width: '8.5rem' }}
        />
        <Column
          field="completo"
          header="Cobertura"
          body={plantillaEstado}
          sortable
          className="text-center"
          headerClassName="justify-content-center"
          style={{ width: '9rem' }}
        />
        <Column
          field="nota"
          header="Calificación"
          body={plantillaNota}
          sortable
          className="text-center"
          headerClassName="justify-content-center"
          style={{ width: '11rem' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaDesgloseRA;
