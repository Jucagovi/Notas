import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

/**
 * CabeceraCalendario - Subcomponente presentacional superior del Calendario Escolar.
 *
 * Responsabilidad Única: Renderizar el selector de año académico (Dropdown con los años de Cursos),
 * los botones de acción principales (Imprimir en PDF y Añadir Periodo) y las métricas resumen del periodo escolar.
 *
 * @param {Object} props
 * @param {number} props.anioSeleccionado - Año de inicio seleccionado (ej. 2024).
 * @param {Array<Object>} [props.opcionesAnios=[]] - Lista de años disponibles ({ label, value }).
 * @param {Function} props.onCambiarAnio - Callback al seleccionar otro año académico.
 * @param {Function} props.onImprimirPDF - Callback para generar la descarga en PDF.
 * @param {Function} props.onAbrirDialogoRango - Callback para abrir diálogo de periodo.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 * @param {boolean} [props.imprimiendo=false] - Indicador de generación de PDF.
 * @param {Object} [props.resumenLectivo={}] - Estadísticas calculadas del año escolar.
 * @param {boolean} [props.cargando=false] - Indicador de carga.
 */
export const CabeceraCalendario = ({
  anioSeleccionado,
  opcionesAnios = [],
  onCambiarAnio,
  onImprimirPDF,
  onAbrirDialogoRango,
  guardando = false,
  imprimiendo = false,
  resumenLectivo = {},
  cargando = false
}) => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3">
      {/* Fila superior: Selector de año académico con su etiqueta en línea y botones de acción en la misma fila */}
      <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
        {/* Selector de Año Académico y su etiqueta horizontal */}
        <div className="flex align-items-center gap-2">
          <label htmlFor="selector-anio-calendario" className="text-900 font-semibold text-sm white-space-nowrap">
            Año académico:
          </label>
          <Dropdown
            id="selector-anio-calendario"
            value={anioSeleccionado}
            options={opcionesAnios}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => onCambiarAnio(e.value)}
            disabled={cargando || guardando}
            placeholder="Seleccione un año..."
            className="w-11rem sm:w-12rem"
          />
        </div>

        {/* Botones de acción estrictamente permitidos: Añadir Periodo e Imprimir en PDF */}
        <div className="flex align-items-center justify-content-end gap-2 flex-wrap">
          <Button
            type="button"
            icon="pi pi-calendar-plus"
            label="Añadir Periodo"
            outlined
            severity="secondary"
            size="small"
            onClick={onAbrirDialogoRango}
            disabled={cargando || guardando}
            tooltip="Añadir un intervalo temporal continuo (vacaciones, evaluaciones, exámenes)"
            tooltipOptions={{ position: 'top' }}
          />

          {onImprimirPDF && (
            <Button
              type="button"
              icon="pi pi-file-pdf"
              label="Imprimir en PDF"
              severity="secondary"
              outlined
              size="small"
              onClick={onImprimirPDF}
              disabled={cargando || imprimiendo}
              loading={imprimiendo}
              tooltip="Imprimir en PDF el calendario de 12 meses en una sola página con su leyenda"
              tooltipOptions={{ position: 'top' }}
            />
          )}
        </div>
      </div>

      {/* Fila inferior: Indicadores y métricas cuantitativas del año escolar seleccionado */}
      <div className="flex flex-wrap align-items-center justify-content-between pt-2 border-top-1 surface-border gap-2">
        <div className="flex align-items-center gap-2 flex-wrap">
          <Tag
            severity="info"
            value={`${resumenLectivo.diasLectivos || 0} Días lectivos`}
            icon="pi pi-check-circle"
          />
          <Tag
            severity="danger"
            value={`${resumenLectivo.diasFestivosLaborables || 0} Festivos/No lectivos`}
            icon="pi pi-sun"
          />
          <Tag
            severity="secondary"
            value={`${String(resumenLectivo.semanasLectivas || '0,0').replace('.', ',')} Semanas estimadas`}
            icon="pi pi-clock"
          />
          {resumenLectivo.totalExamenes > 0 && (
            <Tag
              severity="warning"
              value={`${resumenLectivo.totalExamenes} Exámenes`}
              icon="pi pi-pencil"
            />
          )}
          {resumenLectivo.totalEvaluaciones > 0 && (
            <Tag
              severity="success"
              value={`${resumenLectivo.totalEvaluaciones} Evaluaciones`}
              icon="pi pi-star"
            />
          )}
          {resumenLectivo.diasNaturales > 0 && (
            <span className="text-xs text-500 font-medium">
              ({resumenLectivo.diasNaturales} días naturales: 1 sept - 31 ago)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CabeceraCalendario;
