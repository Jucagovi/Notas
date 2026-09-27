import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';

/**
 * BarraHerramientasActa - Barra de herramientas con conmutador de modo de cálculo y acciones de exportación.
 *
 * Responsabilidad Única: Permitir al docente alternar entre los modos de Evaluación Continua
 * y Evaluación Final, así como disparar las descargas del acta oficial en formatos PDF y CSV.
 *
 * @param {Object} props
 * @param {string} props.modoCalculo - Modo actual ('continua' o 'final').
 * @param {Function} props.onCambioModo - Manejador del cambio de modo de cálculo.
 * @param {Function} props.onExportarPdf - Manejador de exportación a PDF.
 * @param {Function} props.onExportarCsv - Manejador de exportación a CSV.
 * @param {boolean} [props.exportandoPdf=false] - Indicador de generación de PDF en curso.
 * @param {boolean} [props.exportandoCsv=false] - Indicador de generación de CSV en curso.
 * @param {boolean} [props.deshabilitado=false] - Deshabilita los botones de exportación si no hay datos.
 */
export const BarraHerramientasActa = ({
  modoCalculo = 'final',
  onCambioModo,
  onExportarPdf,
  onExportarCsv,
  exportandoPdf = false,
  exportandoCsv = false,
  deshabilitado = false
}) => {
  // Opciones de configuración para el selector de modos de evaluación
  const opcionesModo = [
    {
      label: 'Evaluación Continua',
      value: 'continua',
      icon: 'pi pi-chart-line'
    },
    {
      label: 'Evaluación Final',
      value: 'final',
      icon: 'pi pi-check-circle'
    }
  ];

  // Contenido del bloque izquierdo: Selector de modo de cálculo
  const contenidoIzquierdo = (
    <div className="flex align-items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-700 mr-1">
        Modo de cálculo:
      </span>
      <SelectButton
        value={modoCalculo}
        options={opcionesModo}
        onChange={(e) => {
          if (e.value) onCambioModo(e.value);
        }}
        optionLabel="label"
        optionValue="value"
        className="p-buttonset-sm"
        aria-label="Seleccionar modo de cálculo"
      />
    </div>
  );

  // Contenido del bloque derecho: Botones de exportación oficial
  const contenidoDerecho = (
    <div className="flex align-items-center gap-2 flex-wrap">
      <Button
        label="Exportar a PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        onClick={onExportarPdf}
        loading={exportandoPdf}
        disabled={deshabilitado}
        outlined
        size="small"
        tooltip="Descargar el acta oficial maquetada para imprimir"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        label="Exportar CSV"
        icon="pi pi-file-excel"
        severity="success"
        onClick={onExportarCsv}
        loading={exportandoCsv}
        disabled={deshabilitado}
        outlined
        size="small"
        tooltip="Exportar datos tabulares en formato CSV para hoja de cálculo"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  return (
    <Toolbar
      start={contenidoIzquierdo}
      end={contenidoDerecho}
      className="surface-card mb-3 py-2 px-3 border-round border-1 surface-border shadow-1"
    />
  );
};

export default BarraHerramientasActa;
