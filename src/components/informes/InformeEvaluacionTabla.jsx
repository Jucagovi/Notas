import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Avatar } from 'primereact/avatar';
import { getColorNota, getGradeColor } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Componente visual de tabla pivote para visualizar el acta oficial de calificaciones del módulo
const InformeEvaluacionTabla = ({
  filas = [],
  evaluaciones = [],
  estadisticas = null,
  cargando = false
}) => {
  // Plantilla visual para la primera columna fija con los datos del discente (Avatar y Apellidos, Nombre)
  const plantillaDiscente = (fila) => {
    const iniciales = `${fila.nombre?.[0] || ''}${fila.apellidos?.[0] || ''}`.toUpperCase() || 'AL';
    const nombreCompleto = fila.apellidos && fila.nombre
      ? `${fila.apellidos}, ${fila.nombre}`
      : fila.nombreCompleto || fila.nombre || 'Sin nombre';

    return (
      <div className="flex align-items-center gap-3 py-1">
        {fila.imagen ? (
          <Avatar image={fila.imagen} shape="circle" size="normal" className="flex-shrink-0" />
        ) : (
          <Avatar
            label={iniciales}
            shape="circle"
            size="normal"
            className="flex-shrink-0 bg-primary-100 text-primary font-bold text-xs"
          />
        )}
        <span className="font-bold text-sm text-color">
          {nombreCompleto}
        </span>
      </div>
    );
  };

  // Plantilla visual para las celdas de calificación ponderada por cada periodo de evaluación
  const plantillaNotaEvaluacion = (fila, ev) => {
    const nota = fila.notas?.[ev.id_evaluacion];
    const detalle = fila.notasDetalle?.[ev.id_evaluacion];

    // Si el alumno no tiene calificaciones registradas en la evaluación, se muestra el indicador '?'
    if (nota === null || nota === undefined) {
      return (
        <span
          className="inline-flex align-items-center justify-content-center border-round px-2 py-1 bg-gray-100 text-500 font-bold text-sm cursor-help"
          title="Sin calificaciones registradas en esta evaluación"
        >
          ?
        </span>
      );
    }

    // Se obtiene el estilo cromático normalizado mediante el helper centralizado
    const infoColor = getColorNota(nota);
    const textoTooltip = `${infoColor.label}: ${formatNota(nota)} / 100 (${detalle?.practicasCalificadas || 0} prácticas)`;

    return (
      <span
        className={`inline-flex align-items-center justify-content-center border-round px-3 py-1 font-bold text-sm shadow-1 ${infoColor.bg} ${infoColor.text} cursor-help`}
        title={textoTooltip}
      >
        {formatNota(nota)}
      </span>
    );
  };

  // Plantilla visual para la columna de calificación media global del discente en el módulo
  const plantillaNotaMedia = (fila) => {
    const media = fila.media;

    if (media === null || media === undefined) {
      return (
        <span className="text-muted text-xs font-semibold">
          -
        </span>
      );
    }

    const infoColor = getGradeColor(media);

    return (
      <div className="flex flex-column align-items-center justify-content-center">
        <span className={`font-bold text-sm ${infoColor.text}`}>
          {formatNota(media)}
        </span>
        <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>
          {infoColor.label}
        </span>
      </div>
    );
  };

  // Grupo de pie de tabla con las medias estadísticas y tasas de aprobación por periodo de evaluación
  const renderPieDeTabla = () => {
    if (!estadisticas || !estadisticas.porEvaluacion || evaluaciones.length === 0) {
      return null;
    }

    const estiloCeldaPie = {
      backgroundColor: 'var(--table-header-bg, #e2e8f0)',
      color: 'var(--text-color, #334155)',
      padding: '0.75rem 1rem',
      fontSize: '0.85rem'
    };

    return (
      <ColumnGroup>
        {/* Fila 1 del pie: Media del grupo por evaluación */}
        <Row className="fila-pie-media">
          <Column
            footer={
              <div className="flex align-items-center gap-2 font-bold text-color">
                <i className="pi pi-chart-bar text-primary text-xs" />
                <span>Media del Grupo</span>
              </div>
            }
            footerStyle={{
              ...estiloCeldaPie,
              textAlign: 'left',
              borderTop: '2px solid var(--border-color, #dee2e6)',
              borderBottom: '1px solid var(--border-color, #dee2e6)'
            }}
            frozen
          />
          {evaluaciones.map((ev) => {
            const stat = estadisticas.porEvaluacion[ev.id_evaluacion];
            const mediaEv = stat?.media;
            const colorMedia = getColorNota(mediaEv);

            return (
              <Column
                key={`footer-media-${ev.id_evaluacion}`}
                footer={
                  mediaEv !== null && mediaEv !== undefined ? (
                    <span
                      className={`inline-flex align-items-center justify-content-center border-round px-2 py-1 font-bold text-sm ${colorMedia.bg} ${colorMedia.text}`}
                    >
                      {formatNota(mediaEv)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs font-semibold">-</span>
                  )
                }
                footerStyle={{
                  ...estiloCeldaPie,
                  textAlign: 'center',
                  borderTop: '2px solid var(--border-color, #dee2e6)',
                  borderBottom: '1px solid var(--border-color, #dee2e6)'
                }}
              />
            );
          })}
          <Column
            footer={
              estadisticas.mediaGlobal !== null && estadisticas.mediaGlobal !== undefined ? (
                <span
                  className={`inline-flex align-items-center justify-content-center border-round px-2 py-1 font-bold text-sm ${getColorNota(estadisticas.mediaGlobal).bg} ${getColorNota(estadisticas.mediaGlobal).text}`}
                >
                  {formatNota(estadisticas.mediaGlobal)}
                </span>
              ) : (
                <span className="text-muted text-xs font-semibold">-</span>
              )
            }
            footerStyle={{
              ...estiloCeldaPie,
              textAlign: 'center',
              borderTop: '2px solid var(--border-color, #dee2e6)',
              borderBottom: '1px solid var(--border-color, #dee2e6)'
            }}
          />
        </Row>

        {/* Fila 2 del pie: Tasa de aprobados por evaluación */}
        <Row className="fila-pie-aprobados">
          <Column
            footer={
              <div className="flex align-items-center gap-2 font-bold text-color">
                <i className="pi pi-check-circle text-green-500 text-xs" />
                <span>Tasa de Aprobados (%)</span>
              </div>
            }
            footerStyle={{
              ...estiloCeldaPie,
              textAlign: 'left',
              borderBottom: '2px solid var(--border-color, #dee2e6)'
            }}
            frozen
          />
          {evaluaciones.map((ev) => {
            const stat = estadisticas.porEvaluacion[ev.id_evaluacion];
            const tasa = stat?.tasaAprobados;
            const esAprobado = (tasa || 0) >= 50;

            return (
              <Column
                key={`footer-tasa-${ev.id_evaluacion}`}
                footer={
                  stat?.totalEvaluados > 0 ? (
                    <div className="flex flex-column align-items-center justify-content-center">
                      <span className={`font-bold text-sm ${esAprobado ? 'text-green-500' : 'text-red-500'}`}>
                        {tasa}%
                      </span>
                      <span className="text-muted text-xs font-normal" style={{ fontSize: '0.7rem' }}>
                        ({stat.aprobados}/{stat.totalEvaluados})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted text-xs font-semibold">-</span>
                  )
                }
                footerStyle={{
                  ...estiloCeldaPie,
                  textAlign: 'center',
                  borderBottom: '2px solid var(--border-color, #dee2e6)'
                }}
              />
            );
          })}
          <Column
            footer={
              estadisticas.tasaAprobadosGlobal !== undefined ? (
                <div className="flex flex-column align-items-center justify-content-center">
                  <span className={`font-bold text-sm ${estadisticas.tasaAprobadosGlobal >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {estadisticas.tasaAprobadosGlobal}%
                  </span>
                  <span className="text-muted text-xs font-normal" style={{ fontSize: '0.7rem' }}>
                    ({estadisticas.totalAprobadosGlobal}/{estadisticas.totalDiscentes})
                  </span>
                </div>
              ) : (
                <span className="text-muted text-xs font-semibold">-</span>
              )
            }
            footerStyle={{
              ...estiloCeldaPie,
              textAlign: 'center',
              borderBottom: '2px solid var(--border-color, #dee2e6)'
            }}
          />
        </Row>
      </ColumnGroup>
    );


  };

  return (
    <div className="surface-card p-3 border-round shadow-1">
      <DataTable
        value={filas}
        loading={cargando}
        paginator
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[10, 15, 20, 50, 100]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} discentes"
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        scrollable
        footerColumnGroup={renderPieDeTabla()}
        emptyMessage="No se encontraron discentes matriculados en este módulo."
        className="p-datatable-sm"
      >
        {/* 1. Columna fija a la izquierda: Apellidos y Nombre del Discente */}
        <Column
          field="nombreCompleto"
          header="Discente (Apellidos y Nombre)"
          body={plantillaDiscente}
          sortable
          frozen
          style={{ minWidth: '260px', width: '280px' }}
          headerStyle={{ backgroundColor: 'var(--surface-50)' }}
        />

        {/* 2. Columnas dinámicas por cada periodo de evaluación registrado en el módulo */}
        {evaluaciones.map((ev) => (
          <Column
            key={ev.id_evaluacion}
            field={`notas.${ev.id_evaluacion}`}
            header={
              <div className="flex flex-column align-items-center justify-content-center text-center">
                <span className="font-bold text-sm">{ev.nombre || 'Evaluación'}</span>
                {ev.fecha_ini && (
                  <span className="text-muted text-xs font-normal" style={{ fontSize: '0.65rem' }}>
                    {new Date(ev.fecha_ini).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}
                  </span>
                )}
              </div>
            }
            body={(fila) => plantillaNotaEvaluacion(fila, ev)}
            sortable
            style={{ minWidth: '130px', textAlign: 'center' }}
            headerStyle={{ textAlign: 'center' }}
          />
        ))}

        {/* 3. Columna final: Calificación Media Global del Módulo */}
        <Column
          field="media"
          header={
            <div className="flex flex-column align-items-center justify-content-center text-center">
              <span className="font-bold text-sm">Nota Media</span>
              <span className="text-muted text-xs font-normal" style={{ fontSize: '0.65rem' }}>Global</span>
            </div>
          }
          body={plantillaNotaMedia}
          sortable
          style={{ minWidth: '110px', textAlign: 'center', width: '120px' }}
          headerStyle={{ textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default InformeEvaluacionTabla;
