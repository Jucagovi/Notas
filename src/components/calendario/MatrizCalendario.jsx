import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'primereact/calendar';
import {
  formatearFechaISO
} from '../../utils/fechas.js';
import './calendario.css';

/**
 * Calcula la fecha de inicio del calendario anual (1 de septiembre) según el año que marca el curso.
 */
const calcularFechaInicioCurso = (curso, fechaInicio) => {
  // 1. Se prioriza el año que marca el registro del curso escolar (ej. "2024/2025" -> 2024).
  if (curso && curso.anyo) {
    const match = String(curso.anyo).match(/\b(20\d{2})\b/);
    if (match) {
      return new Date(parseInt(match[1], 10), 8, 1);
    }
  }

  // 2. Si no se dispone de año en el nombre del curso, se deduce de la fecha oficial de inicio de clases.
  if (fechaInicio instanceof Date && !isNaN(fechaInicio.getTime())) {
    const anio = fechaInicio.getFullYear();
    const mes = fechaInicio.getMonth(); // 0 = Enero ... 8 = Septiembre
    const anioBase = mes < 8 ? anio - 1 : anio;
    return new Date(anioBase, 8, 1);
  }

  // 3. Respaldo según el año académico de la fecha actual.
  const hoy = new Date();
  const anioActual = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
  return new Date(anioActual, 8, 1);
};

/**
 * MatrizCalendario - Componente interactivo para la visualización y marcaje de días festivos.
 *
 * Responsabilidad Única: Renderizar siempre los 12 meses del curso académico (de septiembre a agosto)
 * con 3 meses fijos por fila y resaltado en rojo garantizado para días no lectivos.
 */
export const MatrizCalendario = ({
  fechasSeleccionadas = [],
  onActualizarFechas,
  onConmutarFestivo,
  onEliminarFestivo,
  onAgregarFestivo,
  festivos = [],
  fechaInicio = null,
  fechaFin = null,
  cursoActual = null,
  disabled = false
}) => {
  // La fecha base se calcula siempre a partir del 1 de septiembre del año que marca el curso académico.
  const fechaSeptiembre = useMemo(() => {
    return calcularFechaInicioCurso(cursoActual, fechaInicio);
  }, [cursoActual?.id_curso, cursoActual?.anyo, fechaInicio]);

  // Se indexan los días festivos para comprobación inmediata en el renderizado de celdas.
  const conjuntoFestivos = useMemo(() => {
    return new Set(festivos.map((f) => f.fecha));
  }, [festivos]);

  // Se crea un mapa indexado de descripciones para consulta en cada celda del calendario.
  const mapaDescripciones = useMemo(() => {
    const mapa = new Map();
    festivos.forEach((f) => {
      if (f.descripcion) {
        mapa.set(f.fecha, f.descripcion);
      }
    });
    return mapa;
  }, [festivos]);

  // Alterna el estado festivo de un día concreto sin desplazar los meses del calendario.
  const manejarAlternarFestivo = (fechaDate) => {
    if (disabled || !fechaDate || !(fechaDate instanceof Date) || isNaN(fechaDate.getTime())) return;
    const cadenaISO = formatearFechaISO(fechaDate);

    if (onConmutarFestivo) {
      onConmutarFestivo(fechaDate);
    } else if (onEliminarFestivo && onAgregarFestivo) {
      if (conjuntoFestivos.has(cadenaISO)) {
        onEliminarFestivo(cadenaISO);
      } else {
        onAgregarFestivo(fechaDate);
      }
    } else if (onActualizarFechas) {
      if (conjuntoFestivos.has(cadenaISO)) {
        const nuevoArray = fechasSeleccionadas.filter((d) => formatearFechaISO(d) !== cadenaISO);
        onActualizarFechas(nuevoArray);
      } else {
        const nuevoArray = [...fechasSeleccionadas, fechaDate];
        onActualizarFechas(nuevoArray);
      }
    }
  };

  // Plantilla personalizada para el contenido interior de cada celda de fecha.
  const plantillaFecha = (dateMeta) => {
    const fechaCelda = new Date(dateMeta.year, dateMeta.month, dateMeta.day, 0, 0, 0);
    const cadenaISO = formatearFechaISO(fechaCelda);
    const esFestivo = conjuntoFestivos.has(cadenaISO);
    const tieneDescripcion = mapaDescripciones.has(cadenaISO);
    const descripcion = mapaDescripciones.get(cadenaISO);

    // Se determina si la fecha se encuentra fuera del rango oficial del curso lectivo.
    const fueraDeRango =
      (fechaInicio && fechaCelda < new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate())) ||
      (fechaFin && fechaCelda > new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate()));

    const clasesCelda = [
      'calendario-dia-celda',
      esFestivo ? 'dia-es-festivo' : '',
      fueraDeRango ? 'calendario-dia-fuera-rango' : ''
    ]
      .filter(Boolean)
      .join(' ');

    const textoTooltip = tieneDescripcion
      ? descripcion
      : esFestivo
      ? 'Día no lectivo / Festivo (haga clic para desmarcar)'
      : fueraDeRango
      ? 'Fuera del periodo lectivo oficial (haga clic para marcar)'
      : 'Día lectivo (haga clic para marcar festivo)';

    return (
      <div
        className={clasesCelda}
        title={textoTooltip}
        onClick={(e) => {
          e.stopPropagation();
          manejarAlternarFestivo(fechaCelda);
        }}
      >
        <span>{dateMeta.day}</span>
        {tieneDescripcion && <span className="calendario-dia-punto-motivo" />}
      </div>
    );
  };

  const anioInicioActual = fechaSeptiembre.getFullYear();
  const anioFinActual = anioInicioActual + 1;
  const claveCalendario = `cal-curso-${cursoActual?.id_curso || 'def'}-${anioInicioActual}`;

  return (
    <div className="surface-card border-round-xl border-1 surface-border p-3 md:p-4 shadow-1 flex flex-column gap-3 w-full">
      {/* Cabecera del calendario anual */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary text-xl" />
          <h2 className="text-lg font-bold text-900 m-0">
            Cuadrícula de Calendario Escolar ({anioInicioActual}/{anioFinActual})
          </h2>
          <span className="text-xs text-500 font-medium">
            (Septiembre {anioInicioActual} a Agosto {anioFinActual} — 12 meses lectivos)
          </span>
        </div>
      </div>

      {/* Contenedor desplazable con 3 meses por fila fijos y selección interactiva permanente */}
      <div className="calendario-escolar-contenedor">
        <div className="calendario-escolar">
          <Calendar
            key={claveCalendario}
            value={null}
            onSelect={(e) => {
              if (e?.value) {
                manejarAlternarFestivo(e.value);
              }
            }}
            onChange={() => {}}
            inline
            numberOfMonths={12}
            viewDate={fechaSeptiembre}
            onViewDateChange={() => {}}
            locale="es"
            dateTemplate={plantillaFecha}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default MatrizCalendario;
