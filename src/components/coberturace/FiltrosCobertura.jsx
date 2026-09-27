import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

/**
 * FiltrosCobertura - Componente presentacional para la selección de Año Académico y Clases mediante botones.
 *
 * Responsabilidad Única: Renderizar el selector de Año Académico (obtenido de Cursos en formato YYYY/YYYY+1)
 * y exponer las clases disponibles como botones interactivos en lugar de un dropdown de módulos,
 * preservando el botón de recarga manual de datos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.anios - Lista de años académicos formateados (ej. { label: '2026/2027', value: 2026 }).
 * @param {number|string|null} props.anioSeleccionado - Año académico actualmente activo.
 * @param {Function} props.onCambioAnio - Manejador del evento de cambio de año académico.
 * @param {Array<Object>} props.clases - Lista de clases configuradas para el año académico seleccionado.
 * @param {string|null} props.claseSeleccionadaId - Identificador de la clase actualmente seleccionada.
 * @param {Function} props.onCambioClase - Manejador del evento de selección de clase.
 * @param {boolean} [props.cargando=false] - Indicador global de carga.
 * @param {Function} props.onRecargar - Manejador para refrescar los datos.
 */
export const FiltrosCobertura = ({
  anios = [],
  anioSeleccionado = null,
  onCambioAnio,
  clases = [],
  claseSeleccionadaId = null,
  onCambioClase,
  cargando = false,
  onRecargar
}) => {
  return (
    <div className="surface-card p-3 border-round shadow-1 border-1 surface-border mb-4">
      {/* Fila superior: Selector de Año Académico y Botón Actualizar */}
      <div className="flex flex-column sm:flex-row align-items-stretch sm:align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center gap-2">
          <label className="text-xs font-semibold text-color-secondary uppercase tracking-wider white-space-nowrap">
            Año Académico:
          </label>
          <div className="w-full sm:w-16rem">
            <Dropdown
              value={anioSeleccionado}
              options={anios}
              onChange={(e) => onCambioAnio && onCambioAnio(e.value)}
              placeholder="Seleccionar año académico..."
              className="w-full p-inputtext-sm"
              disabled={cargando}
            />
          </div>
        </div>

        <Button
          type="button"
          icon="pi pi-refresh"
          label="Actualizar"
          severity="secondary"
          outlined
          loading={cargando}
          onClick={onRecargar}
          tooltip="Volver a consultar los datos y recalcular la cobertura"
          tooltipOptions={{ position: 'bottom' }}
          className="p-button-sm white-space-nowrap align-self-end sm:align-self-center"
        />
      </div>

      {/* Fila inferior: Listado de Cursos / Clases como Botones */}
      <div className="flex flex-column gap-2">
        <label className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
          Curso / Clase:
        </label>

        {clases && clases.length > 0 ? (
          <div className="flex align-items-center gap-2 flex-wrap">
            {clases.map((clase) => {
              const esActiva = clase.id === claseSeleccionadaId;
              const etiquetaBoton = `${clase.cursoNombre} — ${clase.moduloSiglas || clase.moduloNombre}`;
              const tooltipClase = `${clase.cursoNombre}${clase.cursoCentro ? ` (${clase.cursoCentro})` : ''} · ${clase.moduloNombre}`;

              return (
                <Button
                  key={clase.id}
                  type="button"
                  label={etiquetaBoton}
                  icon={esActiva ? 'pi pi-check' : 'pi pi-building'}
                  severity={esActiva ? 'primary' : 'secondary'}
                  outlined={!esActiva}
                  onClick={() => onCambioClase && onCambioClase(clase.id)}
                  disabled={cargando}
                  tooltip={tooltipClase}
                  tooltipOptions={{ position: 'top' }}
                  className={`p-button-sm transition-all transition-duration-150 ${
                    esActiva ? 'shadow-2 font-bold' : ''
                  }`}
                />
              );
            })}
          </div>
        ) : (
          <div className="surface-ground p-2 border-round text-color-secondary text-sm font-italic">
            No se encontraron clases configuradas para el año académico seleccionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosCobertura;
