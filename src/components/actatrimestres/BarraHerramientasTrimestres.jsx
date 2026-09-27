import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

/**
 * BarraHerramientasTrimestres - Barra de herramientas con acciones de exportación del acta por trimestres.
 *
 * Responsabilidad Única: Renderizar una barra estilizada con los botones de acción para exportación a CSV
 * y a PDF situados a la derecha de la vista, gestionando sus estados de deshabilitación y carga.
 *
 * @param {Object} props
 * @param {Function} props.onExportarCsv - Callback disparado al hacer clic en Exportar CSV.
 * @param {Function} props.onExportarPdf - Callback disparado al hacer clic en Exportar PDF.
 * @param {boolean} [props.exportandoCsv=false] - Indicador de progreso de exportación a CSV.
 * @param {boolean} [props.exportandoPdf=false] - Indicador de progreso de exportación a PDF.
 * @param {boolean} [props.deshabilitado=false] - Deshabilita los botones si no hay datos disponibles.
 */
export const BarraHerramientasTrimestres = ({
  onExportarCsv,
  onExportarPdf,
  exportandoCsv = false,
  exportandoPdf = false,
  deshabilitado = false
}) => {
  // Contenido posicionado en el extremo derecho de la barra
  const contenidoDerecha = (
    <div className="flex align-items-center gap-2">
      <Button
        label="Exportar CSV"
        icon="pi pi-file-excel"
        severity="secondary"
        outlined
        onClick={onExportarCsv}
        loading={exportandoCsv}
        disabled={deshabilitado || exportandoCsv || exportandoPdf}
        tooltip="Descargar tabla en formato CSV delimitado por punto y coma"
        tooltipOptions={{ position: 'top' }}
        aria-label="Exportar a CSV"
      />
      <Button
        label="Exportar PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        onClick={onExportarPdf}
        loading={exportandoPdf}
        disabled={deshabilitado || exportandoPdf || exportandoCsv}
        tooltip="Descargar documento oficial en formato PDF para Jefatura de Estudios"
        tooltipOptions={{ position: 'top' }}
        aria-label="Exportar a PDF"
      />
    </div>
  );

  return (
    <Toolbar
      end={contenidoDerecha}
      className="mb-3 surface-card border-1 surface-border border-round shadow-1 p-2"
    />
  );
};

export default BarraHerramientasTrimestres;
