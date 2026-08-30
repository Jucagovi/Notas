import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { getColorNota } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Se limpia y extrae únicamente la descripción del CE eliminando números o códigos redundantes
const obtenerDescripcionLimpiaCE = (ce) => {
  if (!ce) return '';
  const rawNombre = (ce.nombre || '').trim();
  const rawDesc = (ce.descripcion || '').trim();

  // Se eliminan prefijos redundantes como 'CE 1.1', 'CE1.1', 'CE 1.1 -', 'CE 1.1:', 'a)', '1.1.', etc.
  const limpiar = (str) =>
    str
      .replace(/^CE\s*[\d.]+[\s:.-]*/gi, '')
      .replace(/^[a-z\d.]+\s*[).-]\s*/gi, '')
      .replace(/^[\s:.-]+/, '')
      .trim();

  const nombreLimpio = limpiar(rawNombre);
  const descLimpia = limpiar(rawDesc);

  let cuerpo = '';
  if (descLimpia && nombreLimpio) {
    if (descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase())) {
      cuerpo = descLimpia;
    } else if (nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())) {
      cuerpo = nombreLimpio;
    } else {
      cuerpo = `${nombreLimpio}: ${descLimpia}`;
    }
  } else {
    cuerpo = descLimpia || nombreLimpio || '';
  }

  return cuerpo.replace(/^[\s:.-]+/, '').trim() || 'Sin descripción';
};

// Componente para la tabla de respaldo con el desglose numérico exacto de cada Resultado de Aprendizaje y sus CE
const InformeCompetenciaTabla = ({ listaRA = [], cargando = false }) => {
  const [filasExpandidas, setFilasExpandidas] = useState(null);

  // Plantilla para la columna del código de RA
  const plantillaCodigo = (rowData) => {
    return (
      <span className="font-bold text-primary text-sm">
        {rowData.codigo || `RA ${rowData.numero || ''}`}
      </span>
    );
  };

  // Plantilla para la columna de nombre y descripción
  const plantillaNombre = (rowData) => {
    return (
      <div className="flex flex-column">
        <span className="font-semibold text-color text-sm">
          {rowData.nombre || 'Resultado de Aprendizaje'}
        </span>
        {rowData.descripcion && rowData.descripcion !== rowData.nombre && (
          <span className="text-xs text-muted mt-1 line-height-2">
            {rowData.descripcion}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para la columna de Criterios de Evaluación vinculados
  const plantillaCriterios = (rowData) => {
    const total = rowData.totalCE || 0;
    const evaluados = rowData.ceEvaluados || 0;
    const completo = total > 0 && evaluados === total;

    return (
      <div className="flex align-items-center gap-2">
        <Badge
          value={`${evaluados} / ${total}`}
          severity={completo ? 'success' : evaluados > 0 ? 'warning' : 'danger'}
        />
        <span className="text-xs text-muted">CE evaluados</span>
      </div>
    );
  };

  // Plantilla para la columna de Calificación media
  const plantillaCalificacion = (rowData) => {
    const nota = rowData.nota;
    const infoColor = getColorNota(nota);

    if (nota === null || nota === undefined) {
      return (
        <Tag
          value="Sin calificar"
          severity="info"
          className="text-xs bg-gray-100 text-500 font-normal"
        />
      );
    }

    return (
      <div className="flex align-items-center gap-2">
        <span
          className="font-bold text-base px-2 py-1 border-round"
          style={{
            color: infoColor.hex,
            backgroundColor: `${infoColor.hex}18`,
            border: `1px solid ${infoColor.hex}40`,
            minWidth: '3.5rem',
            textAlign: 'center'
          }}
        >
          {formatNota(nota)}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de Nivel competencial
  const plantillaNivel = (rowData) => {
    const nota = rowData.nota;
    const infoColor = getColorNota(nota);

    if (nota === null || nota === undefined) {
      return <span className="text-xs text-muted italic">Pendiente</span>;
    }

    let severidad = 'info';
    if (nota >= 90) severidad = 'info';
    else if (nota >= 70) severidad = 'success';
    else if (nota >= 50) severidad = 'warning';
    else severidad = 'danger';

    return (
      <Tag
        value={infoColor.label}
        severity={severidad}
        className="text-xs font-semibold"
      />
    );
  };

  // Plantilla de fila expandida para visualizar el desglose de Criterios de Evaluación y Prácticas
  const plantillaExpansionFila = (data) => {
    const criterios = data.criterios || [];

    if (criterios.length === 0) {
      return (
        <div className="p-3 surface-50 border-round text-center text-muted text-xs">
          No hay Criterios de Evaluación vinculados a este Resultado de Aprendizaje.
        </div>
      );
    }

    return (
      <div className="p-3 surface-50 border-round">
        <div className="font-bold text-xs uppercase text-700 mb-2 flex align-items-center gap-2">
          <i className="pi pi-list-check text-primary" />
          <span>Desglose de Criterios de Evaluación ({criterios.length})</span>
        </div>

        <DataTable
          value={criterios}
          size="small"
          className="p-datatable-sm surface-card border-1 surface-border border-round overflow-hidden"
          responsiveLayout="scroll"
        >
          <Column
            field="numero"
            header="CE"
            style={{ width: '4.5rem' }}
            body={(ce) => (
              <span className="font-bold text-xs text-primary">
                CE {ce.numero || ''}
              </span>
            )}
          />
          <Column
            header="Descripción del Criterio"
            body={(ce) => (
              <div className="text-xs">
                <span className="font-medium text-color line-height-2">
                  {obtenerDescripcionLimpiaCE(ce)}
                </span>
              </div>
            )}
          />
          <Column
            header="Prácticas Vinculadas"
            style={{ minWidth: '14rem' }}
            body={(ce) => {
              const practicas = ce.practicas || [];
              if (practicas.length === 0) {
                return <span className="text-xs text-muted italic">Sin prácticas asignadas</span>;
              }
              return (
                <div className="flex flex-column gap-1">
                  {practicas.map((p, idx) => {
                    const notaP = p.nota !== null && p.nota !== undefined ? formatNota(p.nota) : 'Sin nota';
                    const colorP = getColorNota(p.nota);

                    return (
                      <div key={idx} className="flex align-items-center justify-content-between gap-2 text-xs">
                        <span className="text-color text-overflow-ellipsis overflow-hidden white-space-nowrap" style={{ maxWidth: '180px' }}>
                          {p.numeroPractica ? `P${p.numeroPractica}: ` : ''}{p.nombrePractica}
                        </span>
                        <div className="flex align-items-center gap-1 flex-shrink-0">
                          <span className="text-muted text-xs">({p.porcentaje}%)</span>
                          <span
                            className="font-bold px-1 border-round"
                            style={{ color: colorP.hex, backgroundColor: `${colorP.hex}18` }}
                          >
                            {notaP}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          <Column
            header="Nota CE"
            style={{ width: '6rem', textAlign: 'center' }}
            body={(ce) => {
              const nota = ce.nota;
              const info = getColorNota(nota);
              if (nota === null || nota === undefined) {
                return <span className="text-xs text-muted">-</span>;
              }
              return (
                <span
                  className="font-bold text-xs px-2 py-1 border-round"
                  style={{ color: info.hex, backgroundColor: `${info.hex}18` }}
                >
                  {formatNota(nota)}
                </span>
              );
            }}
          />
        </DataTable>
      </div>
    );
  };

  const tituloTabla = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-table text-primary text-xl" />
      <div>
        <span className="text-lg font-bold text-color">
          Tabla de Respaldo de Competencias
        </span>
        <span className="text-xs text-muted block mt-1 font-normal">
          Desglose numérico exacto de la nota ponderada de cada Resultado de Aprendizaje
        </span>
      </div>
    </div>
  );

  return (
    <Card title={tituloTabla} className="shadow-1 surface-card border-round">
      <DataTable
        value={listaRA}
        loading={cargando}
        expandedRows={filasExpandidas}
        onRowToggle={(e) => setFilasExpandidas(e.data)}
        rowExpansionTemplate={plantillaExpansionFila}
        dataKey="id_ra"
        responsiveLayout="stack"
        breakpoint="768px"
        className="p-datatable-sm"
        emptyMessage="No se encontraron Resultados de Aprendizaje para este módulo."
      >
        <Column expander style={{ width: '3rem' }} />
        <Column
          field="codigo"
          header="Código"
          body={plantillaCodigo}
          style={{ width: '6rem' }}
          sortable
        />
        <Column
          field="nombre"
          header="Resultado de Aprendizaje (RA)"
          body={plantillaNombre}
          sortable
        />
        <Column
          field="ceEvaluados"
          header="Criterios"
          body={plantillaCriterios}
          style={{ width: '11rem' }}
          sortable
        />
        <Column
          field="nota"
          header="Calificación"
          body={plantillaCalificacion}
          style={{ width: '8.5rem', textAlign: 'center' }}
          sortable
        />
        <Column
          header="Nivel"
          body={plantillaNivel}
          style={{ width: '9rem', textAlign: 'center' }}
        />
      </DataTable>
    </Card>
  );
};

export default InformeCompetenciaTabla;
