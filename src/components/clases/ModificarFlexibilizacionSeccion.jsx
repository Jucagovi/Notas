import React, { useMemo } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import SelectorModulo from '../common/SelectorModulo.jsx';

/**
 * ModificarFlexibilizacionSeccion - Subcomponente para consultar y modificar la flexibilización de una clase existente.
 *
 * Responsabilidad Única: Renderizar el estado actual de flexibilización, el control para activar/desactivar
 * y el selector del módulo secundario perteneciente al mismo ciclo formativo.
 *
 * @param {Object} props
 * @param {Object} props.claseActual - Datos de la clase seleccionada actualmente.
 * @param {Array<Object>} props.modulos - Catálogo completo de módulos.
 * @param {Array<Object>} [props.ciclos=[]] - Catálogo completo de ciclos.
 * @param {boolean} props.esFlexibilizado - Estado local de activación de flexibilización.
 * @param {Function} props.onCambiarEsFlexibilizado - Manejador para cambiar el estado de activación.
 * @param {string|null} props.moduloFlexibleId - Identificador del módulo secundario seleccionado.
 * @param {Function} props.onSeleccionarModuloFlexibleId - Manejador para seleccionar el módulo secundario.
 * @param {boolean} [props.deshabilitado=false] - Indicador para deshabilitar los controles interactivos.
 */
const ModificarFlexibilizacionSeccion = ({
  claseActual,
  modulos = [],
  ciclos = [],
  esFlexibilizado = false,
  onCambiarEsFlexibilizado,
  moduloFlexibleId = null,
  onSeleccionarModuloFlexibleId,
  deshabilitado = false
}) => {
  // Determinación resiliente del ciclo formativo al que pertenece el módulo principal.
  const cicloId = useMemo(() => {
    if (!claseActual) return null;
    if (claseActual.id_ciclo) return claseActual.id_ciclo;
    if (claseActual.moduloObj && claseActual.moduloObj.id_ciclo) return claseActual.moduloObj.id_ciclo;
    const encontrado = modulos.find((m) => m.id_modulo === claseActual.id_modulo);
    return encontrado ? encontrado.id_ciclo : null;
  }, [claseActual, modulos]);

  // Ciclo formativo actual para mostrar su denominación de contexto.
  const cicloActual = useMemo(() => {
    if (!cicloId) return null;
    return ciclos.find((c) => c.id_ciclo === cicloId) || null;
  }, [cicloId, ciclos]);

  // Filtrado de módulos secundarios disponibles: mismo ciclo formativo y excluyendo el módulo principal de la clase.
  const modulosSecundariosDisponibles = useMemo(() => {
    if (!cicloId || !claseActual?.id_modulo) return [];
    return modulos.filter(
      (m) => m.id_ciclo === cicloId && m.id_modulo !== claseActual.id_modulo
    );
  }, [modulos, cicloId, claseActual?.id_modulo]);

  // Módulo secundario flexibilizado seleccionado actualmente.
  const moduloFlexibleActual = useMemo(() => {
    if (!moduloFlexibleId) return null;
    return modulos.find((m) => m.id_modulo === moduloFlexibleId) || null;
  }, [modulos, moduloFlexibleId]);

  // Detección de cambios respecto al estado original persistido en la base de datos.
  const flexibilizacionModificada = useMemo(() => {
    if (!claseActual) return false;
    const estadoOriginalEsFlex = Boolean(claseActual.id_modulo_flexible);
    const estadoOriginalId = claseActual.id_modulo_flexible || null;
    return esFlexibilizado !== estadoOriginalEsFlex || moduloFlexibleId !== estadoOriginalId;
  }, [claseActual, esFlexibilizado, moduloFlexibleId]);

  // Manejador del cambio de activación del switch de flexibilización.
  const manejarCambioSwitch = (evento) => {
    const nuevoValor = Boolean(evento.value);
    onCambiarEsFlexibilizado(nuevoValor);
    if (!nuevoValor) {
      onSeleccionarModuloFlexibleId(null);
    }
  };

  if (!claseActual) return null;

  return (
    <div className="surface-card border-round p-3 border-1 surface-border mt-3 flex flex-column gap-3">
      {/* Cabecera informativa con estado actual */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div className="flex flex-column">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-sliders-h text-primary text-base" />
            <span className="font-bold text-900 text-sm">Flexibilización Curricular del Módulo</span>
          </div>
          <span className="text-secondary text-xs mt-1">
            Indica si este módulo comparte bolsa de horas lectivas con otro módulo del ciclo formativo.
            {cicloActual && (
              <> (Ciclo: <strong>{cicloActual.siglas || cicloActual.nombre}</strong>)</>
            )}
          </span>
        </div>

        <div className="flex align-items-center">
          {esFlexibilizado && moduloFlexibleActual ? (
            <Tag
              severity="info"
              icon="pi pi-link mr-1"
              value={`Flexibilizado con ${moduloFlexibleActual.siglas || moduloFlexibleActual.nombre}`}
              className="text-xs font-semibold px-2 py-1"
            />
          ) : (
            <Tag
              severity="secondary"
              icon="pi pi-minus-circle mr-1"
              value="Sin flexibilizar"
              className="text-xs font-semibold px-2 py-1"
            />
          )}
        </div>
      </div>

      {/* Control interactivo para activar o desactivar la flexibilización */}
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top-1 surface-border">
        <div className="flex align-items-center gap-2">
          <InputSwitch
            inputId="switchModificarFlex"
            checked={esFlexibilizado}
            onChange={manejarCambioSwitch}
            disabled={deshabilitado}
          />
          <label
            htmlFor="switchModificarFlex"
            className="font-semibold cursor-pointer text-sm text-800"
          >
            ¿Flexibilizar con otro módulo?
          </label>
        </div>

        {esFlexibilizado && (
          <span className="text-xs text-primary font-medium flex align-items-center gap-1">
            <i className="pi pi-info-circle" />
            Ambos módulos compartirán bolsa de horas lectivas en la Temporización
          </span>
        )}
      </div>

      {/* Desplegable dinámico para seleccionar o modificar el módulo flexibilizado */}
      {esFlexibilizado && (
        <div className="flex flex-column gap-2 pt-2 border-top-1 surface-border">
          <label htmlFor="selectorModuloModificarFlex" className="font-semibold text-sm block">
            Módulo Secundario Flexibilizado <span className="text-red-500">*</span>
          </label>

          <SelectorModulo
            id="selectorModuloModificarFlex"
            value={moduloFlexibleId}
            options={modulosSecundariosDisponibles}
            onChange={(e) => onSeleccionarModuloFlexibleId(e.value)}
            placeholder={
              modulosSecundariosDisponibles.length > 0
                ? 'Selecciona el módulo secundario para flexibilizar...'
                : 'No existen otros módulos en este ciclo formativo para flexibilizar'
            }
            disabled={deshabilitado || modulosSecundariosDisponibles.length === 0}
            className="w-full"
          />

          {modulosSecundariosDisponibles.length === 0 && (
            <Message
              severity="warn"
              text="No se han encontrado otros módulos en este ciclo formativo para realizar la flexibilización."
              className="w-full justify-content-start text-xs"
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
                  {moduloFlexibleActual.siglas && (
                    <span className="text-secondary font-bold">
                      ({moduloFlexibleActual.siglas})
                    </span>
                  )}
                </div>
                {moduloFlexibleActual.descripcion && (
                  <p className="text-600 text-xs m-0 font-italic">
                    {moduloFlexibleActual.descripcion}
                  </p>
                )}
                <div className="text-xs text-primary mt-1">
                  Al guardar, se actualizará el vínculo bidireccional entre ambos módulos en el calendario lectivo.
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Notificación si hay cambios pendientes de guardar */}
      {flexibilizacionModificada && (
        <div className="flex align-items-center gap-2 p-2 bg-yellow-50 border-1 border-yellow-200 border-round text-yellow-900 text-xs mt-1">
          <i className="pi pi-info-circle text-yellow-700" />
          <span>
            Has modificado la configuración de flexibilización. Pulsa en <strong>Guardar Cambios</strong> para persistir las modificaciones en la base de datos.
          </span>
        </div>
      )}
    </div>
  );
};

export default ModificarFlexibilizacionSeccion;
