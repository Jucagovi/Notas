import React from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import TablaBase from '../common/TablaBase.jsx';
import useTema from '../../hooks/useTema.js';
import { getColorNota } from '../../utils/coloresNota.js';
import './mapaCalor.css';

/**
 * Calcula dinámicamente un color de tipografía en blanco o negro según la luminancia
 * de la celda de fondo para asegurar un contraste óptimo.
 *
 * @param {string} hexColor - Color hexadecimal (#RRGGBB).
 * @returns {string} Código hexadecimal de alto contraste (#ffffff o #0f172a).
 */
const obtenerColorTextoContraste = (hexColor) => {
  if (!hexColor || hexColor === 'transparent') return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminancia = (r * 299 + g * 587 + b * 114) / 1000;
  return luminancia >= 150 ? '#0f172a' : '#ffffff';
};

/**
 * TablaMapaCalor - Componente presentacional para la matriz visual de alta densidad.
 *
 * Responsabilidad Única: Renderizar el DataTable de PrimeReact mediante TablaBase configurado con
 * densidad alta (size="small"), discente fijado a la izquierda (frozen), columnas dinámicas con
 * códigos cortos de RA o CE, y celdas completamente coloreadas mediante getColorNota.
 *
 * @param {Object} props
 * @param {Array<Object>} props.filas - Lista de filas correspondientes a los discentes.
 * @param {Array<Object>} props.columnas - Lista de columnas dinámicas (RA o CE).
 * @param {Object} props.resumenColumnas - Estadísticas agregadas por columna.
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 */
export const TablaMapaCalor = ({
  filas = [],
  columnas = [],
  resumenColumnas = {},
  cargando = false
}) => {
  const { esOscuro } = useTema();

  // Plantilla para la columna congelada de discente.
  const plantillaDiscente = (fila) => {
    return (
      <div className="flex align-items-center gap-2 overflow-hidden py-1">
        <i className="pi pi-user text-primary flex-shrink-0" />
        <div className="overflow-hidden">
          <div
            className="font-semibold text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis"
            title={fila.nombreCompleto}
          >
            {fila.nombreCompleto}
          </div>
          {fila.nia && (
            <span
              className="text-xs text-color-secondary white-space-nowrap block overflow-hidden text-overflow-ellipsis"
              title={`NIA: ${fila.nia}`}
            >
              NIA: {fila.nia}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Pie de la columna de discentes con la etiqueta de resumen pedagógico.
  const pieDiscente = () => {
    return (
      <div className="flex align-items-center gap-2 font-bold text-xs py-1">
        <i className="pi pi-chart-line text-primary" />
        <span>Media del grupo / Puntos Ciegos</span>
      </div>
    );
  };

  // Plantilla para los encabezados de las columnas dinámicas de criterios.
  const plantillaCabeceraColumna = (col) => {
    return (
      <div
        className="cabecera-criterio"
        title={`${col.nombreCompleto}${col.descripcion ? ` — ${col.descripcion}` : ''}`}
      >
        <span className="font-bold text-xs">{col.codigo}</span>
        {col.peso > 0 && (
          <span
            className="text-color-secondary font-normal"
            style={{ fontSize: '0.65rem' }}
          >
            {col.peso}%
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el pie de cada columna dinámica (Lectura Vertical / Análisis Pedagógico).
  const plantillaPieColumna = (col) => {
    const res = resumenColumnas[col.id];
    if (!res || res.totalEvaluados === 0 || res.media === null) {
      return (
        <div className="pie-criterio" title="Sin datos evaluados en este criterio">
          <span className="text-xs text-color-secondary font-normal">-</span>
        </div>
      );
    }

    const { hex } = getColorNota(res.media, esOscuro);
    const esPuntoCiego = res.esPuntoCiego;

    return (
      <div
        className="pie-criterio"
        style={{
          backgroundColor: `${hex}25`,
          borderTop: `2px solid ${hex}`
        }}
        title={`${col.codigo}: Media ${res.media}/100 (${res.porcentajeSuspensos}% suspensos)${
          esPuntoCiego ? ' — ¡PUNTO CIEGO PEDAGÓGICO!' : ''
        }`}
      >
        <span className="font-bold text-xs" style={{ color: hex }}>
          {res.media}
        </span>
        {esPuntoCiego && (
          <i
            className="pi pi-exclamation-triangle text-red-500 text-xs mt-1 indicador-punto-ciego"
            title="Punto ciego: la clase suspende o promedia por debajo de 50"
          />
        )}
      </div>
    );
  };

  // Plantilla obligatoria para la celda de calificación de alta densidad.
  const plantillaCeldaCalor = (fila, col) => {
    const calif = fila.calificaciones ? fila.calificaciones[col.id] : null;
    const nota = calif && calif.nota !== null && calif.nota !== undefined
      ? Number(calif.nota)
      : null;

    if (nota === null || Number.isNaN(nota)) {
      return (
        <div
          className="celda-calor-contenedor"
          style={{
            backgroundColor: esOscuro ? '#1e293b' : '#f8fafc',
            color: esOscuro ? '#64748b' : '#94a3b8'
          }}
          title={`${fila.nombreCompleto} | ${col.codigo}: Sin datos evaluados`}
        >
          <span className="text-xs font-normal">-</span>
        </div>
      );
    }

    const { hex, etiqueta } = getColorNota(nota, esOscuro);
    const colorTexto = obtenerColorTextoContraste(hex);

    return (
      <div
        className="celda-calor-contenedor"
        style={{
          backgroundColor: hex,
          color: colorTexto
        }}
        title={`${fila.nombreCompleto} | ${col.codigo} (${col.nombre || ''}): ${nota}/100 [${etiqueta}]`}
      >
        <span>{nota}</span>
      </div>
    );
  };

  // Plantilla para la columna final de media individual del discente (Lectura Horizontal).
  const plantillaMediaDiscente = (fila) => {
    if (fila.mediaDiscente === null) {
      return <span className="text-xs text-color-secondary italic">-</span>;
    }

    const { hex, etiqueta } = getColorNota(fila.mediaDiscente, esOscuro);

    return (
      <div className="flex align-items-center justify-content-center gap-2 py-1">
        <div
          className="px-2 py-1 border-round font-bold text-xs"
          style={{
            backgroundColor: `${hex}25`,
            color: hex,
            border: `1px solid ${hex}60`,
            minWidth: '3.2rem',
            textAlign: 'center'
          }}
          title={`${fila.nombreCompleto}: Media individual ${fila.mediaDiscente}/100 [${etiqueta}]`}
        >
          {fila.mediaDiscente}
        </div>
        {fila.enRiesgo && (
          <Tag
            severity="danger"
            value="Riesgo"
            icon="pi pi-exclamation-circle"
            className="text-xs"
            title="Discente en riesgo crítico: suspensos generalizados"
          />
        )}
      </div>
    );
  };

  return (
    <div className="surface-card p-3 md:p-4 border-round-xl border-1 surface-border shadow-1">
      {/* Cabecera informativa de la tabla */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-table text-primary text-xl" />
          <div>
            <h3 className="text-base md:text-lg font-bold text-900 m-0">
              Matriz del Mapa de Calor (Resultados de Aprendizaje)
            </h3>
            <span className="text-xs text-color-secondary">
              Alta densidad visual de calificaciones cruzadas (0 - 100)
            </span>
          </div>
        </div>
      </div>

      {/* Tabla base con paginación en parte superior y opciones 5, 10, 15, 20, 25 según CONVENCIONES.md */}
      <TablaBase
        data={filas}
        loading={cargando}
        paginator
        rows={15}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginatorPosition="top"
        emptyMessage="No hay calificaciones registradas para la clase seleccionada."
        stripedRows
        scrollable
        scrollDirection="both"
        size="small"
        className="p-datatable-sm tabla-mapa-calor"
      >
        {/* Columna congelada fijada a la izquierda para los discentes */}
        <Column
          field="nombreCompleto"
          header="Discente"
          body={plantillaDiscente}
          footer={pieDiscente}
          frozen
          sortable
          className="columna-discente-fija"
          headerClassName="columna-discente-fija"
          footerClassName="columna-discente-fija"
          style={{ minWidth: '15rem', width: '15rem' }}
        />

        {/* Columnas dinámicas generadas a partir del catálogo de criterios */}
        {columnas.map((col) => (
          <Column
            key={col.id}
            field={`calificaciones.${col.id}.nota`}
            header={plantillaCabeceraColumna(col)}
            body={(fila) => plantillaCeldaCalor(fila, col)}
            footer={() => plantillaPieColumna(col)}
            sortable
            bodyClassName="celda-calor"
            className="text-center"
            headerClassName="text-center justify-content-center"
            footerClassName="text-center justify-content-center p-1"
            style={{ minWidth: '4.8rem', width: '4.8rem' }}
          />
        ))}

        {/* Columna final de media y alerta individual */}
        <Column
          field="mediaDiscente"
          header="Media"
          body={plantillaMediaDiscente}
          sortable
          className="text-center"
          headerClassName="text-center justify-content-center"
          style={{ minWidth: '8rem', width: '8rem' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaMapaCalor;
