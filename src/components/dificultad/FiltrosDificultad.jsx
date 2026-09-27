import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import SelectorClase from '../common/SelectorClase.jsx';

/**
 * FiltrosDificultad - Componente presentacional para los filtros contextuales del análisis de dificultad.
 *
 * Responsabilidad Única: Renderizar los selectores de Año Académico y Clase (Curso/Módulo),
 * ordenando las clases del registro más reciente al más antiguo y habilitando la clase únicamente
 * tras seleccionar el año académico.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Catálogo de años escolares disponibles [{ label: '2026/2027', value: 2026 }].
 * @param {number|string|null} props.anioSeleccionado - Año escolar seleccionado por defecto.
 * @param {Function} props.onCambioAnio - Manejador del cambio de año escolar.
 * @param {boolean} [props.cargandoAnios=false] - Indicador de carga de años académicos.
 * @param {Array<Object>} props.clases - Catálogo de clases correspondientes al año académico.
 * @param {string|null} props.claseSeleccionadaId - Identificador único de la clase seleccionada.
 * @param {Function} props.onCambioClase - Manejador del cambio de clase.
 * @param {boolean} [props.cargandoClases=false] - Indicador de carga de clases.
 * @param {Function} [props.onRecargar] - Manejador de refresco de datos.
 */
export const FiltrosDificultad = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  cargandoAnios = false,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  cargandoClases = false,
  onRecargar
}) => {
  // Las opciones de clases se presentan ordenadas del registro más reciente al más antiguo
  const clasesOrdenadas = useMemo(() => {
    return [...clases].sort((a, b) => {
      const anioA = a.anioInicio || 0;
      const anioB = b.anioInicio || 0;
      if (anioB !== anioA) return anioB - anioA;
      return a.cursoNombre.localeCompare(b.cursoNombre, 'es');
    });
  }, [clases]);

  return (
    <div className="surface-card p-3 shadow-1 border-round mb-4 border-1 surface-border">
      <div className="grid align-items-center">
        {/* 1. Selector de Año Académico: selecciona el año más reciente por defecto */}
        <div className="col-12 md:col-4">
          <label
            htmlFor="filtro-anio-dificultad"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Año Académico
          </label>
          <Dropdown
            id="filtro-anio-dificultad"
            value={anioSeleccionado}
            options={anios}
            onChange={(e) => onCambioAnio(e.value)}
            loading={cargandoAnios}
            placeholder="Selecciona año académico..."
            className="w-full"
            aria-label="Seleccionar año académico"
          />
        </div>

        {/* 2. Selector de Clase (Curso / Módulo): habilitado solo al elegir año académico */}
        <div className="col-12 md:col-6 lg:col-7">
          <label
            htmlFor="filtro-clase-dificultad"
            className="block text-sm font-semibold text-700 mb-2"
          >
            Clase (Curso / Módulo)
          </label>
          <SelectorClase
            id="filtro-clase-dificultad"
            value={claseSeleccionadaId}
            options={clasesOrdenadas}
            onChange={(e) => onCambioClase(e.value)}
            loading={cargandoClases}
            disabled={!anioSeleccionado || cargandoAnios}
            placeholder={
              !anioSeleccionado
                ? 'Selecciona primero un año académico'
                : 'Selecciona una clase...'
            }
            filter
            className="w-full"
          />
        </div>

        {/* 3. Botón para recargar datos */}
        {onRecargar && (
          <div className="col-12 md:col-2 lg:col-1 flex justify-content-end md:justify-content-center mt-2 md:mt-4">
            <Button
              icon="pi pi-refresh"
              tooltip="Refrescar datos del informe"
              tooltipOptions={{ position: 'top' }}
              onClick={onRecargar}
              text
              rounded
              severity="secondary"
              aria-label="Refrescar informe"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosDificultad;
