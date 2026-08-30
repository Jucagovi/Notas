import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { formatearTextoRA, formatearTextoCE } from '../../services/informesService.js';

// Componente de tabla jerárquica y agrupada por RA para la auditoría de cobertura curricular
const InformeCoberturaTabla = ({
  filas = [],
  todasLasFilas = [],
  cargando = false
}) => {
  // Plantilla de cabecera para la agrupación de filas por Resultado de Aprendizaje (RA)
  const plantillaCabeceraRA = (data) => {
    // Se calculan las estadísticas específicas del RA agrupado
    const filasDelRA = (todasLasFilas || []).filter((f) => f.id_ra === data.id_ra);
    const totalCEDelRA = filasDelRA.length;
    const completosDelRA = filasDelRA.filter((f) => f.estado_cobertura === 'completo').length;
    const porcentajeRAGlobal = totalCEDelRA > 0 ? Math.round((completosDelRA / totalCEDelRA) * 100) : 0;
    const raEsValido = totalCEDelRA > 0 && completosDelRA === totalCEDelRA;

    // Se obtiene el texto limpio formateado sin numeración duplicada
    const textoCabeceraRA = data.ra_texto || formatearTextoRA({
      numero: data.ra_numero,
      nombre: data.ra_nombre,
      descripcion: data.ra_descripcion
    });

    return (
      <div
        className="flex align-items-center justify-content-between gap-3 py-2 px-3 surface-ground border-round w-full"
        style={{ maxWidth: '100%', overflow: 'hidden' }}
      >
        {/* Nombre y descripción del RA en una sola línea blanca truncada con tooltip completo */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <span
            className="font-bold text-sm text-white block cursor-help cobertura-tooltip"
            style={{
              color: '#ffffff',
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
            data-pr-tooltip={textoCabeceraRA}
            title={textoCabeceraRA}
          >
            {textoCabeceraRA}
          </span>
        </div>

        {/* Indicador de cobertura específico del RA */}
        <div className="flex align-items-center gap-2 flex-shrink-0">
          <span className="text-xs text-white white-space-nowrap opacity-80">
            {completosDelRA} de {totalCEDelRA} CE al 100%
          </span>
          <Tag
            value={`${porcentajeRAGlobal}% cubierto`}
            severity={raEsValido ? 'success' : porcentajeRAGlobal > 0 ? 'warning' : 'secondary'}
            className="text-xs font-semibold"
          />
        </div>
      </div>
    );
  };

  // Plantilla para la columna de Criterio de Evaluación (Número y Descripción limpios en una sola línea blanca con tooltip)
  const plantillaCE = (row) => {
    const textoCE = row.ce_texto || formatearTextoCE({
      numero: row.ce_numero,
      nombre: row.ce_nombre,
      descripcion: row.ce_descripcion
    });

    return (
      <div className="py-1 min-w-0 overflow-hidden w-full">
        <span
          className="font-semibold text-sm text-white block cursor-help cobertura-tooltip"
          style={{
            color: '#ffffff',
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}
          data-pr-tooltip={textoCE}
          title={textoCE}
        >
          {textoCE}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de Prácticas Asociadas mostradas una encima de otra con tooltip si el texto es truncado
  const plantillaPracticas = (row) => {
    if (!row.practicas || row.practicas.length === 0) {
      return (
        <span className="text-muted text-xs font-italic">
          Sin prácticas asignadas
        </span>
      );
    }

    return (
      <div className="flex flex-column gap-1 py-1 min-w-0 w-full">
        {row.practicas.map((p, idx) => {
          const textoItem = `${p.etiqueta} (${p.porcentaje}%)`;
          const textoTooltip = p.enunciado ? `${textoItem} - ${p.enunciado}` : textoItem;

          return (
            <div
              key={p.id_trabajan || idx}
              className="min-w-0 overflow-hidden w-full"
            >
              <span
                className="text-sm line-height-2 text-color-secondary block cursor-help cobertura-tooltip"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
                data-pr-tooltip={textoTooltip}
                title={textoTooltip}
              >
                <span className="font-medium text-color">{p.etiqueta}</span>{' '}
                <span className="text-primary font-semibold">({p.porcentaje}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Plantilla para la columna de Porcentaje Total con alertas cromáticas según las reglas del caso de uso
  const plantillaPorcentajeTotal = (row) => {
    const total = row.porcentaje_total || 0;

    // Regla de color y etiqueta según el caso de uso
    // 1. Si la suma es exactamente 100%: verde (éxito)
    // 2. Si la suma es 0% o nula: gris ("Sin cubrir")
    // 3. Si la suma es < 100% o > 100%: rojo (peligro / error de diseño)
    if (total === 100) {
      return (
        <Tag
          value="100% (Correcto)"
          severity="success"
          icon="pi pi-check-circle"
          className="text-xs font-bold px-2 py-1 shadow-1"
        />
      );
    }

    if (total === 0 || !row.practicas || row.practicas.length === 0) {
      return (
        <Tag
          value="Sin cubrir (0%)"
          severity="secondary"
          icon="pi pi-minus-circle"
          className="text-xs font-bold px-2 py-1"
        />
      );
    }

    if (total < 100) {
      return (
        <Tag
          value={`${total}% (Incompleto)`}
          severity="danger"
          icon="pi pi-exclamation-triangle"
          className="text-xs font-bold px-2 py-1 shadow-1"
        />
      );
    }

    // Excedido (> 100%)
    return (
      <Tag
        value={`${total}% (Sobrecobertura)`}
        severity="danger"
        icon="pi pi-times-circle"
        className="text-xs font-bold px-2 py-1 shadow-1"
      />
    );
  };

  return (
    <div className="surface-card border-round shadow-1 overflow-hidden w-full">
      <Tooltip target=".cobertura-tooltip" position="top" />

      <DataTable
        value={filas}
        rowGroupMode="subheader"
        groupRowsBy="ra_codigo_nombre"
        sortField="ra_numero"
        sortOrder={1}
        rowGroupHeaderTemplate={plantillaCabeceraRA}
        tableStyle={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }}
        className="p-datatable-sm w-full"
        emptyMessage="No se encontraron criterios de evaluación que coincidan con los filtros aplicados."
        loading={cargando}
        stripedRows
      >
        {/* Columna Criterio de Evaluación con ancho fijado y texto truncado */}
        <Column
          field="ce_numero"
          header="Criterio de Evaluación (CE)"
          body={plantillaCE}
          style={{ width: '45%' }}
        />

        {/* Columna Prácticas Asociadas */}
        <Column
          header="Prácticas Asociadas (% cobertura)"
          body={plantillaPracticas}
          style={{ width: '38%' }}
        />

        {/* Columna Porcentaje Total */}
        <Column
          field="porcentaje_total"
          header="Porcentaje Total"
          body={plantillaPorcentajeTotal}
          style={{ width: '17%', textAlign: 'center' }}
          alignHeader="center"
        />
      </DataTable>
    </div>
  );
};

export default InformeCoberturaTabla;
