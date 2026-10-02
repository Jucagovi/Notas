import React, { useMemo } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { Message } from 'primereact/message';
import { Card } from 'primereact/card';
import SelectorModulo from '../common/SelectorModulo.jsx';

/**
 * SeccionFlexibilizacionModulo - Subcomponente para la configuración de flexibilización de módulos.
 *
 * Responsabilidad Única: Renderizar el control de activación de flexibilización y el selector
 * dependiente para el módulo secundario perteneciente al mismo ciclo formativo.
 *
 * @param {Object} props
 * @param {boolean} props.esFlexibilizado - Indicador de activación de la flexibilización.
 * @param {Function} props.onCambiarEsFlexibilizado - Manejador de cambio para activar/desactivar.
 * @param {string|null} props.moduloPrincipalId - Identificador del módulo principal seleccionado.
 * @param {string|null} props.moduloFlexibleId - Identificador del módulo secundario a flexibilizar.
 * @param {Function} props.onSeleccionarModuloFlexibleId - Manejador de selección del módulo secundario.
 * @param {Array<Object>} props.modulos - Catálogo completo de módulos.
 * @param {string|null} props.cicloSeleccionadoId - Identificador del ciclo formativo seleccionado.
 * @param {boolean} [props.deshabilitado=false] - Indicador de deshabilitación global del bloque.
 */
const SeccionFlexibilizacionModulo = ({
  esFlexibilizado = false,
  onCambiarEsFlexibilizado,
  moduloPrincipalId = null,
  moduloFlexibleId = null,
  onSeleccionarModuloFlexibleId,
  modulos = [],
  cicloSeleccionadoId = null,
  deshabilitado = false
}) => {
  // Filtrado de módulos secundarios disponibles: mismo ciclo y excluyendo el módulo principal seleccionado.
  const modulosSecundariosDisponibles = useMemo(() => {
    if (!cicloSeleccionadoId || !moduloPrincipalId) return [];
    return modulos.filter(
      (m) => m.id_ciclo === cicloSeleccionadoId && m.id_modulo !== moduloPrincipalId
    );
  }, [modulos, cicloSeleccionadoId, moduloPrincipalId]);

  const moduloFlexibleActual = useMemo(() => {
    if (!moduloFlexibleId) return null;
    return modulos.find((m) => m.id_modulo === moduloFlexibleId) || null;
  }, [modulos, moduloFlexibleId]);

  // Manejador del cambio de activación de la flexibilización.
  const manejarCambioSwitch = (evento) => {
    const nuevoValor = Boolean(evento.value);
    onCambiarEsFlexibilizado(nuevoValor);
    if (!nuevoValor) {
      onSeleccionarModuloFlexibleId(null);
    }
  };

  return (
    <div className="surface-card border-round p-3 border-1 surface-border mt-3 flex flex-column gap-3">
      {/* Control de activación de flexibilización */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="flex align-items-center gap-2">
          <InputSwitch
            inputId="switchFlexibilizar"
            checked={esFlexibilizado}
            onChange={manejarCambioSwitch}
            disabled={deshabilitado || !moduloPrincipalId}
          />
          <label
            htmlFor="switchFlexibilizar"
            className={`font-semibold cursor-pointer text-sm ${
              !moduloPrincipalId ? 'text-400' : 'text-800'
            }`}
          >
            ¿Flexibilizar con otro módulo?
          </label>
        </div>

        {esFlexibilizado && (
          <span className="text-xs text-primary font-medium">
            <i className="pi pi-info-circle mr-1" />
            Ambos módulos compartirán bolsa de horas lectivas
          </span>
        )}
      </div>

      {/* Desplegable dinámico del módulo secundario flexibilizado */}
      {esFlexibilizado && (
        <div className="flex flex-column gap-2 pt-2 border-top-1 surface-border">
          <label htmlFor="selectorModuloSecundario" className="font-semibold text-sm block">
            Módulo Secundario Flexibilizado <span className="text-red-500">*</span>
          </label>

          <SelectorModulo
            id="selectorModuloSecundario"
            value={moduloFlexibleId}
            options={modulosSecundariosDisponibles}
            onChange={(e) => onSeleccionarModuloFlexibleId(e.value)}
            placeholder={
              modulosSecundariosDisponibles.length > 0
                ? 'Selecciona el módulo a flexibilizar...'
                : 'No existen otros módulos en este ciclo para flexibilizar'
            }
            disabled={deshabilitado || modulosSecundariosDisponibles.length === 0}
            className="w-full"
          />

          {modulosSecundariosDisponibles.length === 0 && (
            <Message
              severity="warn"
              text="No hay más módulos disponibles en este ciclo formativo para realizar la flexibilización."
              className="w-full justify-content-start"
            />
          )}

          {moduloFlexibleActual && (
            <Card className="surface-50 border-1 surface-border shadow-none mt-1 p-0">
              <div className="flex flex-column gap-1 text-sm">
                <div className="flex align-items-center justify-content-between">
                  <span className="font-bold text-900 flex align-items-center gap-2">
                    <i className="pi pi-link text-primary" />
                    {moduloFlexibleActual.nombre}
                  </span>
                  <span className="text-secondary font-bold">
                    ({moduloFlexibleActual.siglas})
                  </span>
                </div>
                {moduloFlexibleActual.descripcion && (
                  <p className="text-600 text-xs m-0 font-italic">
                    {moduloFlexibleActual.descripcion}
                  </p>
                )}
                <div className="text-xs text-primary mt-1">
                  Se generarán 2 cursos vinculados bidireccionalmente, con 5 evaluaciones independientes y matriculación idéntica.
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SeccionFlexibilizacionModulo;
