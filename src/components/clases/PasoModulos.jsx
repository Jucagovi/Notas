import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import SelectorCiclo from '../common/SelectorCiclo.jsx';
import SelectorModulo from '../common/SelectorModulo.jsx';

// Paso 2: Selección de Ciclo Formativo y Módulo Profesional con filtrado dependiente (sin componentes Tag).
const PasoModulos = ({
  ciclos = [],
  modulos = [],
  cicloSeleccionadoId,
  onSeleccionarCicloId,
  moduloSeleccionadoId,
  onSeleccionarModuloId
}) => {
  // Filtrado reactivo de módulos pertenecientes exclusivamente al ciclo seleccionado.
  const modulosFiltrados = useMemo(() => {
    if (!cicloSeleccionadoId) return [];
    return modulos.filter((m) => m.id_ciclo === cicloSeleccionadoId);
  }, [modulos, cicloSeleccionadoId]);

  const cicloActual = ciclos.find((c) => c.id_ciclo === cicloSeleccionadoId) || null;
  const moduloActual = modulos.find((m) => m.id_modulo === moduloSeleccionadoId) || null;

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Selección de Ciclo y Módulo</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Elige primero el ciclo formativo para filtrar los módulos profesionales disponibles.
        </p>
      </div>

      <div className="formgrid grid mt-2">
        {/* Selector 1: Ciclos formativos */}
        <div className="field col-12 md:col-6 mb-3">
          <label htmlFor="selectorCiclo" className="font-semibold text-sm mb-2 block">
            1. Ciclo Formativo <span className="text-red-500">*</span>
          </label>
          <SelectorCiclo
            id="selectorCiclo"
            value={cicloSeleccionadoId}
            options={ciclos}
            onChange={(e) => {
              onSeleccionarCicloId(e.value);
              onSeleccionarModuloId(null);
            }}
            placeholder="Selecciona un ciclo formativo..."
            className="w-full"
          />
        </div>

        {/* Selector 2: Módulos profesionales filtrados */}
        <div className="field col-12 md:col-6 mb-3">
          <label htmlFor="selectorModulo" className="font-semibold text-sm mb-2 block">
            2. Módulo Profesional <span className="text-red-500">*</span>
          </label>
          <SelectorModulo
            id="selectorModulo"
            value={moduloSeleccionadoId}
            options={modulosFiltrados}
            onChange={(e) => onSeleccionarModuloId(e.value)}
            placeholder={
              cicloSeleccionadoId
                ? 'Selecciona un módulo del ciclo...'
                : 'Selecciona primero un ciclo formativo'
            }
            disabled={!cicloSeleccionadoId || modulosFiltrados.length === 0}
            className="w-full"
          />
        </div>
      </div>

      {moduloActual && (
        <Card className="surface-50 border-1 surface-border shadow-none">
          <div className="flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-book text-primary text-xl" />
                <span className="text-xl font-bold text-900">{moduloActual.nombre}</span>
              </div>
              <span className="text-secondary font-bold text-base">({moduloActual.siglas})</span>
            </div>
            {cicloActual && (
              <div className="text-secondary text-sm">
                Ciclo: <strong>{cicloActual.nombre} ({cicloActual.siglas})</strong>
              </div>
            )}
            {moduloActual.descripcion && (
              <p className="text-700 text-sm m-0 mt-1 font-italic">
                {moduloActual.descripcion}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PasoModulos;
