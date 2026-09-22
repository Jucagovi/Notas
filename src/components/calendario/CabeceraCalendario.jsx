import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import SelectorCurso from '../common/SelectorCurso.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearFechaISO, parsearFechaISO } from '../../utils/fechas.js';

/**
 * CabeceraCalendario - Subcomponente presentacional para la configuración del curso y fechas oficiales.
 *
 * Responsabilidad Única: Renderizar los selectores de curso, fechas oficiales de inicio y fin
 * mediante inputs nativos de tipo date, métricas resumen y botones de acción.
 */
export const CabeceraCalendario = ({
  cursos = [],
  cursoId,
  onCambiarCurso,
  fechaInicio,
  fechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  onGuardar,
  onAbrirDialogoRango,
  onAbrirDialogoCopiar,
  guardando = false,
  haCambiado = false,
  resumenLectivo = {},
  cargando = false
}) => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3">
      {/* Fila superior: Selector de curso, selectores de fecha nativos y tres acciones principales */}
      <div className="grid align-items-end">
        {/* Selector de curso académico */}
        <div className="col-12 md:col-6 lg:col-3">
          <label htmlFor="selector-curso-calendario" className="block text-900 font-semibold mb-2 text-sm">
            Curso Académico
          </label>
          <SelectorCurso
            id="selector-curso-calendario"
            value={cursoId}
            options={cursos}
            onChange={(e) => onCambiarCurso(e.value)}
            disabled={cargando || guardando}
            placeholder="Seleccione un curso..."
          />
        </div>

        {/* Fecha de inicio oficial del curso con input tipo date */}
        <div className="col-12 sm:col-6 md:col-3 lg:col-2">
          <label htmlFor="fecha-inicio-curso" className="block text-900 font-semibold mb-2 text-sm">
            Inicio de Clases
          </label>
          <InputText
            id="fecha-inicio-curso"
            type="date"
            value={formatearFechaISO(fechaInicio)}
            onChange={(e) => onChangeFechaInicio(parsearFechaISO(e.target.value))}
            disabled={!cursoId || cargando || guardando}
            className="w-full"
            max={formatearFechaISO(fechaFin) || undefined}
          />
        </div>

        {/* Fecha de fin oficial del curso con input tipo date */}
        <div className="col-12 sm:col-6 md:col-3 lg:col-2">
          <label htmlFor="fecha-fin-curso" className="block text-900 font-semibold mb-2 text-sm">
            Fin de Clases
          </label>
          <InputText
            id="fecha-fin-curso"
            type="date"
            value={formatearFechaISO(fechaFin)}
            onChange={(e) => onChangeFechaFin(parsearFechaISO(e.target.value))}
            disabled={!cursoId || cargando || guardando}
            className="w-full"
            min={formatearFechaISO(fechaInicio) || undefined}
          />
        </div>

        {/* Botones de acción: Añadir periodo, Copiar festivos y Guardar calendario */}
        <div className="col-12 lg:col-5 flex align-items-center justify-content-end gap-2 flex-wrap">
          <Button
            type="button"
            icon="pi pi-calendar-plus"
            label="Añadir Periodo"
            outlined
            severity="secondary"
            size="small"
            onClick={onAbrirDialogoRango}
            disabled={!cursoId || cargando || guardando}
            tooltip="Añadir un periodo vacacional continuo (ej. Navidad o Semana Santa)"
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            type="button"
            icon="pi pi-copy"
            label="Copiar Festivos"
            outlined
            severity="secondary"
            size="small"
            onClick={onAbrirDialogoCopiar}
            disabled={!cursoId || cargando || guardando || cursos.length <= 1}
            tooltip={cursos.length <= 1 ? 'No hay otros cursos disponibles para copiar festivos' : 'Copiar festivos registrados desde otro curso escolar'}
            tooltipOptions={{ position: 'top' }}
          />

          <BotonAccion
            tipo="guardar"
            label="Guardar Calendario"
            icon="pi pi-save"
            onClick={onGuardar}
            loading={guardando}
            disabled={!cursoId || cargando}
            tooltip={haCambiado ? 'Hay cambios pendientes de guardar' : 'Calendario sincronizado'}
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Fila inferior: Indicadores cuantitativos calculados */}
      {cursoId && (
        <div className="flex flex-wrap align-items-center justify-content-between pt-2 border-top-1 surface-border gap-2">
          <div className="flex align-items-center gap-2 flex-wrap">
            <Tag
              severity="info"
              value={`${resumenLectivo.diasLectivos || 0} Días lectivos`}
              icon="pi pi-check-circle"
            />
            <Tag
              severity="danger"
              value={`${resumenLectivo.diasFestivosLaborables || 0} Festivos laborables`}
              icon="pi pi-sun"
            />
            <Tag
              severity="secondary"
              value={`${String(resumenLectivo.semanasLectivas || '0,0').replace('.', ',')} Semanas estimadas`}
              icon="pi pi-clock"
            />
            {resumenLectivo.diasNaturales > 0 && (
              <span className="text-xs text-500 font-medium">
                ({resumenLectivo.diasNaturales} días naturales totales)
              </span>
            )}
          </div>

          {haCambiado && (
            <div className="flex align-items-center gap-1 text-orange-600 font-medium text-xs">
              <i className="pi pi-exclamation-circle" />
              <span>Modificaciones sin guardar</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CabeceraCalendario;
