import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { getColorNota, getGradeColor } from '../../utils/coloresNota.js';
import { formatNota } from '../../utils/formatters.js';

// Subcomponente de cabecera para cada columna de Resultado de Aprendizaje con Input editable para su peso en ra_curso
const CabeceraColumnaRA = ({ ra, onGuardarPeso, guardandoPeso }) => {
  const [valorDraft, setValorDraft] = useState(String(ra.peso ?? 0));

  // Sincronización del valor del input cuando cambia la ponderación desde el estado global
  useEffect(() => {
    setValorDraft(String(ra.peso ?? 0));
  }, [ra.peso]);

  // Se persiste la nueva ponderación al pulsar Enter o perder el foco
  const manejarGuardado = () => {
    const num = parseInt(valorDraft, 10);
    const valorValido = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    if (valorValido !== ra.peso) {
      onGuardarPeso(ra.id_ra, valorValido);
    } else {
      setValorDraft(String(ra.peso ?? 0));
    }
  };

  const manejarKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const manejarCambio = (e) => {
    // Se filtran los caracteres para admitir únicamente números enteros entre 0 y 100
    const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
    if (soloDigitos === '') {
      setValorDraft('');
    } else {
      const num = parseInt(soloDigitos, 10);
      if (num <= 100) {
        setValorDraft(String(num));
      }
    }
  };

  return (
    <div
      className="flex flex-column align-items-center gap-1 py-1"
      onClick={(e) => e.stopPropagation()}
      title={ra.textoCompleto || ra.nombre || ''}
    >
      <span className="font-bold text-xs text-color white-space-nowrap">
        {ra.codigo || `RA ${ra.numero}`}
      </span>
      <div
        className="flex align-items-center justify-content-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={valorDraft}
          disabled={guardandoPeso}
          onChange={manejarCambio}
          onKeyDown={manejarKeyDown}
          onBlur={manejarGuardado}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.stopPropagation()}
          className="font-bold text-center border-1 surface-border border-round shadow-none"
          style={{
            width: '2.9rem',
            height: '1.5rem',
            fontSize: '0.72rem',
            padding: '0.1rem 0.2rem',
            boxSizing: 'border-box',
            backgroundColor: 'var(--surface-card, #ffffff)',
            color: 'var(--text-color, #334155)',
            appearance: 'none',
            MozAppearance: 'textfield'
          }}
          title="Editar peso del RA en el curso (pulse Return o salga del campo para guardar)"
        />
        <span className="text-xs text-muted font-bold">%</span>
      </div>
    </div>
  );
};

// Componente de tabla pivote ajustada para visualizar el acta de calificaciones por Resultados de Aprendizaje
const InformeEvaluacionRaTabla = ({
  filas = [],
  listaRA = [],
  estadisticas = null,
  soloCompletos = false,
  cargando = false,
  guardandoPeso = false,
  onVerDetalleRA = () => {},
  onGuardarPesoRA = () => {}
}) => {
  // Plantilla visual para la primera columna fija con los datos del discente (Avatar y Apellidos, Nombre)
  const plantillaDiscente = (fila) => {
    const iniciales = `${fila.nombre?.[0] || ''}${fila.apellidos?.[0] || ''}`.toUpperCase() || 'AL';
    const nombreCompleto = fila.apellidos && fila.nombre
      ? `${fila.apellidos}, ${fila.nombre}`
      : fila.nombreCompleto || fila.nombre || 'Sin nombre';

    return (
      <div className="flex align-items-center gap-2 py-1">
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
        <span
          className="font-bold text-xs text-color overflow-hidden text-overflow-ellipsis white-space-nowrap"
          title={nombreCompleto}
        >
          {nombreCompleto}
        </span>
      </div>
    );
  };

  // Plantilla visual para las celdas de cada Resultado de Aprendizaje
  const plantillaNotaRA = (fila, ra) => {
    const nota = fila.notasRA?.[ra.id_ra];
    const detalle = fila.detalleRA?.[ra.id_ra];
    const esCompleto = detalle?.completo;

    // Si no existen calificaciones registradas para este RA
    if (nota === null || nota === undefined) {
      return (
        <div
          className="flex flex-column align-items-center justify-content-center cursor-pointer p-1 border-round hover:surface-100 transition-colors"
          onClick={() => onVerDetalleRA(fila, ra)}
          title="Sin calificaciones. Haga clic para ver los criterios de evaluación"
        >
          <span className="inline-flex align-items-center justify-content-center border-round px-1 py-0 bg-gray-100 text-500 font-bold text-xs">
            ?
          </span>
          <span className="text-xs text-400 font-semibold" style={{ fontSize: '0.6rem' }}>
            0/{detalle?.totalCE || 0}
          </span>
        </div>
      );
    }

    const infoColor = getColorNota(nota);
    const textoTooltip = `${ra.codigo || 'RA'}: ${formatNota(nota)} (${detalle?.cesCompletos || 0}/${detalle?.totalCE || 0} CE). Haga clic para ver el desglose.`;

    return (
      <div
        className="flex flex-column align-items-center justify-content-center cursor-pointer p-1 border-round hover:surface-200 transition-colors"
        onClick={() => onVerDetalleRA(fila, ra)}
        title={textoTooltip}
      >
        <div className="flex align-items-center gap-1">
          <span
            className={`inline-flex align-items-center justify-content-center border-round px-1 py-0 font-bold text-xs shadow-1 ${infoColor.bg} ${infoColor.text}`}
          >
            {formatNota(nota)}
          </span>
          {esCompleto ? (
            <i className="pi pi-check-circle text-green-500 text-xs" style={{ fontSize: '0.65rem' }} />
          ) : (
            <i className="pi pi-exclamation-circle text-orange-400 text-xs" style={{ fontSize: '0.65rem' }} />
          )}
        </div>

        <span className="text-xs text-muted font-semibold" style={{ fontSize: '0.6rem' }}>
          {detalle?.cesCompletos || 0}/{detalle?.totalCE || 0} CE
        </span>
      </div>
    );
  };

  // Plantilla visual para la columna de calificación final del módulo
  const plantillaNotaFinal = (fila) => {
    const nota = fila.notaFinal;

    if (nota === null || nota === undefined) {
      return (
        <span className="text-muted text-xs font-semibold">-</span>
      );
    }

    const infoColor = getGradeColor(nota);

    return (
      <div className="flex flex-column align-items-center justify-content-center">
        <span
          className={`inline-flex align-items-center justify-content-center border-round px-2 py-0 font-bold text-sm shadow-1 ${infoColor.bg} ${infoColor.text}`}
        >
          {formatNota(nota)}
        </span>
        <span className="text-xs text-muted font-semibold" style={{ fontSize: '0.65rem' }}>
          {infoColor.label}
        </span>
      </div>
    );
  };

  // Grupo de pie de tabla con las medias estadísticas y tasas de aprobación por Resultado de Aprendizaje
  const renderPieDeTabla = () => {
    if (!estadisticas || !estadisticas.porRA || listaRA.length === 0) {
      return null;
    }

    const estiloCeldaPie = {
      backgroundColor: 'var(--table-header-bg, #e2e8f0)',
      color: 'var(--text-color, #334155)',
      padding: '0.5rem 0.6rem',
      fontSize: '0.75rem'
    };

    return (
      <ColumnGroup>
        {/* Fila 1 del pie: Media del grupo por RA */}
        <Row>
          <Column
            footer={
              <div className="flex align-items-center gap-1 font-bold text-color">
                <i className="pi pi-chart-bar text-primary text-xs" />
                <span>Media Grupo</span>
              </div>
            }
            footerStyle={{
              ...estiloCeldaPie,
              textAlign: 'left',
              borderTop: '2px solid var(--border-color, #dee2e6)'
            }}
            frozen
          />
          {listaRA.map((ra) => {
            const stat = estadisticas.porRA[ra.id_ra];
            const mediaRA = stat?.media;
            const colorMedia = getColorNota(mediaRA);

            return (
              <Column
                key={`footer-media-${ra.id_ra}`}
                footer={
                  mediaRA !== null && mediaRA !== undefined ? (
                    <span
                      className={`inline-flex align-items-center justify-content-center border-round px-1 py-0 font-bold text-xs ${colorMedia.bg} ${colorMedia.text}`}
                    >
                      {formatNota(mediaRA)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs font-semibold">-</span>
                  )
                }
                footerStyle={{ ...estiloCeldaPie, textAlign: 'center' }}
              />
            );
          })}
          <Column
            footer={
              estadisticas.mediaGlobal !== null && estadisticas.mediaGlobal !== undefined ? (
                <span
                  className={`inline-flex align-items-center justify-content-center border-round px-2 py-0 font-bold text-xs ${getColorNota(estadisticas.mediaGlobal).bg} ${getColorNota(estadisticas.mediaGlobal).text}`}
                >
                  {formatNota(estadisticas.mediaGlobal)}
                </span>
              ) : (
                <span className="text-muted text-xs font-semibold">-</span>
              )
            }
            footerStyle={{ ...estiloCeldaPie, textAlign: 'center' }}
          />
        </Row>

        {/* Fila 2 del pie: Tasa de aprobados por RA */}
        <Row>
          <Column
            footer={
              <div className="flex align-items-center gap-1 font-semibold text-muted">
                <i className="pi pi-percentage text-green-500 text-xs" />
                <span>% Aprobados</span>
              </div>
            }
            footerStyle={{ ...estiloCeldaPie, textAlign: 'left' }}
            frozen
          />
          {listaRA.map((ra) => {
            const stat = estadisticas.porRA[ra.id_ra];
            const tasa = stat?.tasaAprobados;
            const tieneDatos = stat?.totalEvaluados > 0;

            return (
              <Column
                key={`footer-tasa-${ra.id_ra}`}
                footer={
                  tieneDatos ? (
                    <span
                      className={`font-bold text-xs ${tasa >= 50 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {tasa}%
                    </span>
                  ) : (
                    <span className="text-muted text-xs">-</span>
                  )
                }
                footerStyle={{ ...estiloCeldaPie, textAlign: 'center' }}
              />
            );
          })}
          <Column
            footer={
              <span
                className={`font-bold text-xs ${estadisticas.tasaAprobadosGlobal >= 50 ? 'text-green-600' : 'text-red-600'}`}
              >
                {estadisticas.tasaAprobadosGlobal}%
              </span>
            }
            footerStyle={{ ...estiloCeldaPie, textAlign: 'center' }}
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
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        emptyMessage="No se encontraron discentes matriculados en el módulo."
        footerColumnGroup={renderPieDeTabla()}
        paginator={filas.length > 20}
        rows={20}
        rowsPerPageOptions={[20, 40, 60, 100]}
        className="p-datatable-sm tabla-acta-ra"
      >
        {/* Columna fija: Discente (Avatar y Apellidos, Nombre) */}
        <Column
          header="Discente"
          body={plantillaDiscente}
          frozen
          style={{ minWidth: '12rem', width: '14rem' }}
          headerClassName="font-bold text-xs bg-primary-50 text-color text-left pl-3"
        />

        {/* Columnas dinámicas generadas para cada Resultado de Aprendizaje (RA) con input de peso editable */}
        {listaRA.map((ra) => (
          <Column
            key={ra.id_ra}
            header={() => (
              <CabeceraColumnaRA
                ra={ra}
                onGuardarPeso={onGuardarPesoRA}
                guardandoPeso={guardandoPeso}
              />
            )}
            body={(fila) => plantillaNotaRA(fila, ra)}
            style={{ minWidth: '5.2rem', width: '5.6rem', textAlign: 'center' }}
            headerClassName="text-center p-1"
          />
        ))}

        {/* Columna final: Nota Final del Módulo / Nota de Evaluación Continua */}
        <Column
          header={
            <div className="flex flex-column align-items-center gap-1 py-1">
              <span className="font-bold text-xs text-color white-space-nowrap">
                {soloCompletos ? 'Nota Eval' : 'Nota Final'}
              </span>
              <Tag
                value={soloCompletos ? 'Continua' : '100%'}
                severity={soloCompletos ? 'help' : 'success'}
                className="text-xs px-1 py-0"
                style={{ fontSize: '0.6rem' }}
              />
            </div>
          }
          body={plantillaNotaFinal}
          style={{ minWidth: '6.5rem', width: '7.5rem', textAlign: 'center' }}
          headerClassName="font-bold text-xs bg-primary-50 text-color text-center p-1"
        />
      </DataTable>
    </div>
  );
};

export default InformeEvaluacionRaTabla;
