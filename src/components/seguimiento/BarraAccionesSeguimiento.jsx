import React from 'react';
import { Button } from 'primereact/button';

/**
 * BarraAccionesSeguimiento - Subcomponente presentacional para los botones
 * de descarga y exportación en formatos oficiales.
 *
 * Responsabilidad Única: Renderizar los botones destacados para la exportación
 * del documento editable (.odt / .docx) mediante la librería docx y el informe
 * oficial en formato PDF, además del botón de recarga de datos.
 *
 * @param {Object} props
 * @param {Function} props.onExportarDocx - Manejador de descarga en formato editable (.odt/.docx).
 * @param {Function} props.onExportarPdf - Manejador de descarga en formato PDF.
 * @param {Function} props.onRecargar - Manejador de recarga de datos.
 * @param {boolean} [props.exportandoDocx=false] - Indicador de generación de archivo editable.
 * @param {boolean} [props.exportandoPdf=false] - Indicador de generación de archivo PDF.
 * @param {boolean} [props.deshabilitado=false] - Indicador de deshabilitación de acciones.
 */
const BarraAccionesSeguimiento = ({
  onExportarOdt,
  onExportarPdf,
  onRecargar,
  exportandoOdt = false,
  exportandoPdf = false,
  deshabilitado = false
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 flex flex-column sm:flex-row align-items-center justify-content-between gap-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-download text-primary text-xl" />
        <div>
          <span className="font-bold text-900 block text-sm md:text-base">
            Exportación Oficial del Informe
          </span>
          <span className="text-xs text-color-secondary block">
            Descarga directa en formatos editable ODT y PDF inmutable.
          </span>
        </div>
      </div>

      <div className="flex align-items-center gap-2 flex-wrap w-full sm:w-auto justify-content-end">
        {/* Botón de refresco manual */}
        {onRecargar && (
          <Button
            icon="pi pi-refresh"
            label="Actualizar"
            severity="secondary"
            outlined
            size="small"
            onClick={onRecargar}
            disabled={deshabilitado || exportandoOdt || exportandoPdf}
            tooltip="Volver a sincronizar datos con el servidor"
            tooltipOptions={{ position: 'bottom' }}
          />
        )}

        {/* Botón destacado: Descargar informe editable (.odt) */}
        <Button
          icon="pi pi-file-edit"
          label="Descargar informe editable (.odt)"
          severity="primary"
          size="small"
          onClick={onExportarOdt}
          loading={exportandoOdt}
          disabled={deshabilitado}
          tooltip="Genera documento editable oficial en estándar abierto OpenDocument Text (.odt)"
          tooltipOptions={{ position: 'bottom' }}
          className="font-bold"
        />

        {/* Botón destacado: Descargar informe en PDF */}
        <Button
          icon="pi pi-file-pdf"
          label="Descargar informe en PDF"
          severity="danger"
          size="small"
          onClick={onExportarPdf}
          loading={exportandoPdf}
          disabled={deshabilitado}
          tooltip="Genera el documento vectorial idéntico a seguimiento.pdf"
          tooltipOptions={{ position: 'bottom' }}
          className="font-bold"
        />
      </div>
    </div>
  );
};

export default BarraAccionesSeguimiento;
