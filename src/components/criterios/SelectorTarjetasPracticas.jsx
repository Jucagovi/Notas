import React from 'react';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * SelectorTarjetasPracticas - Componente presentacional para la selección de actividades en formato de tarjetas compactas.
 *
 * Responsabilidad Única: Renderizar el catálogo de versiones de prácticas asociadas a la clase
 * de forma limpia y sintetizada (sin enunciados), permitiendo alternar la versión activa mediante id_version.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.versiones=[]] - Lista de versiones de prácticas instanciadas en la clase.
 * @param {Array<Object>} [props.practicas=[]] - Alias compatible para la lista de versiones.
 * @param {string|null} [props.idVersionActiva=null] - Identificador de la versión actualmente seleccionada.
 * @param {string|null} [props.idPracticaActiva=null] - Alias compatible para el identificador seleccionado.
 * @param {Function} props.onSeleccionarVersion - Callback invocado al hacer clic en una tarjeta de versión.
 * @param {Function} [props.onSeleccionarPractica] - Alias compatible para el callback de selección.
 * @param {boolean} [props.disabled=false] - Indicador de bloqueo de interacción.
 * @param {Function} [props.onNuevaPractica] - Callback para navegar al Taller de Prácticas si no hay registros.
 */
export const SelectorTarjetasPracticas = ({
  versiones = [],
  practicas = [],
  idVersionActiva = null,
  idPracticaActiva = null,
  onSeleccionarVersion,
  onSeleccionarPractica,
  disabled = false,
  onNuevaPractica
}) => {
  // Se consolida la lista de elementos admitiendo tanto versiones como el alias practicas
  const listaActividades = versiones && versiones.length > 0 ? versiones : practicas;
  const idSeleccionado = idVersionActiva || idPracticaActiva;
  const manejadorSeleccion = onSeleccionarVersion || onSeleccionarPractica;

  if (!listaActividades || listaActividades.length === 0) {
    return (
      <div className="surface-card p-4 border-round border-1 surface-border shadow-1 mb-4">
        <EstadoVacio
          icono="pi pi-briefcase"
          mensaje="No hay actividades programadas en esta clase"
          descripcion="Esta clase no tiene ninguna versión de práctica programada. Accede al Taller de Prácticas para crear o asociar versiones evaluables a la clase."
          botonTexto="Ir al Taller de Prácticas"
          onAccion={onNuevaPractica}
        />
      </div>
    );
  }

  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      {/* Título de la sección de actividades */}
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-th-large text-primary text-lg" />
          <h3 className="m-0 text-900 font-bold text-base">
            Prácticas de la Clase
          </h3>
          <span className="text-color-secondary text-sm">
            ({listaActividades.length} actividades programadas — selecciona una para gestionar su cobertura)
          </span>
        </div>
      </div>

      {/* Cuadrícula de tarjetas de actividades sin mostrar enunciados */}
      <div className="grid">
        {listaActividades.map((actividad) => {
          const idActual = actividad.id_version || actividad.id_practica;
          const esActiva = idSeleccionado === idActual;
          const criteriosCount = actividad.criteriosAsignados || 0;
          const tituloPrincipal = actividad.nombrePractica || actividad.nombre || 'Práctica';
          const subtituloVersion = actividad.numero ? `Versión ${actividad.numero}` : null;

          return (
            <div
              key={idActual}
              className="col-12 sm:col-6 md:col-4 lg:col-3"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => !disabled && manejadorSeleccion && manejadorSeleccion(idActual)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !disabled && manejadorSeleccion) {
                    manejadorSeleccion(idActual);
                  }
                }}
                className={`p-3 border-round cursor-pointer transition-all transition-duration-200 flex flex-column justify-content-between ${
                  esActiva
                    ? 'border-2 border-primary surface-card shadow-3'
                    : 'border-1 surface-border surface-card hover:surface-100 shadow-1'
                } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
                style={{
                  minHeight: '85px',
                  backgroundColor: esActiva ? 'var(--primary-50, #f0fdf4)' : undefined
                }}
              >
                {/* Encabezado de la tarjeta con nombre de práctica y distintivo de estado */}
                <div className="flex align-items-start justify-content-between gap-2">
                  <div className="flex align-items-center gap-2 overflow-hidden flex-1">
                    <i
                      className={`pi ${
                        esActiva ? 'pi-check-circle text-primary' : 'pi-file text-500'
                      } text-base flex-shrink-0`}
                    />
                    <div className="overflow-hidden flex-1">
                      <span
                        className="font-bold text-900 text-sm text-overflow-ellipsis white-space-nowrap block overflow-hidden"
                        title={tituloPrincipal}
                      >
                        {tituloPrincipal}
                      </span>
                      {subtituloVersion && (
                        <span className="text-primary text-xs font-semibold block mt-1">
                          {subtituloVersion}
                        </span>
                      )}
                    </div>
                  </div>

                  {esActiva && (
                    <span className="px-2 py-1 text-xs border-round bg-primary text-white font-semibold flex-shrink-0">
                      Activa
                    </span>
                  )}
                </div>

                {/* Pie de tarjeta con cómputo de criterios asignados */}
                <div className="flex align-items-center justify-content-between pt-2 mt-2 border-top-1 surface-border text-xs">
                  <span className="text-600 font-medium">
                    {criteriosCount > 0
                      ? `${criteriosCount} CE vinculados`
                      : 'Sin criterios aún'}
                  </span>
                  {criteriosCount > 0 && (
                    <span className="text-primary font-bold">
                      <i className="pi pi-check text-xs mr-1" />
                      Asignada
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectorTarjetasPracticas;
