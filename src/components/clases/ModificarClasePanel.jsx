import React, { useState, useEffect } from 'react';
import { PickList } from 'primereact/picklist';
import { Card } from 'primereact/card';
import SelectorClase from '../common/SelectorClase.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import ModificarFlexibilizacionSeccion from './ModificarFlexibilizacionSeccion.jsx';

// Panel para modificar las matrículas y la flexibilización de una clase existente.
const ModificarClasePanel = ({
  clases = [],
  claseSeleccionadaId,
  onSeleccionarClaseId,
  modulos = [],
  ciclos = [],
  discentesDisponibles = [],
  discentesMatriculados = [],
  onCambiarPickList,
  guardando = false,
  onGuardarCambios,
  mostrarAviso
}) => {
  const claseActual = clases.find((c) => c.id === claseSeleccionadaId) || null;

  // Estados locales para la gestión reactiva de la flexibilización de la clase.
  const [esFlexibilizado, setEsFlexibilizado] = useState(false);
  const [moduloFlexibleId, setModuloFlexibleId] = useState(null);

  // Sincronización del estado de flexibilización al cambiar de clase seleccionada.
  useEffect(() => {
    if (claseActual) {
      setEsFlexibilizado(Boolean(claseActual.id_modulo_flexible));
      setModuloFlexibleId(claseActual.id_modulo_flexible || null);
    } else {
      setEsFlexibilizado(false);
      setModuloFlexibleId(null);
    }
  }, [claseActual?.id, claseActual?.id_modulo_flexible]);

  // Manejador del guardado conjunto de matrícula y flexibilización.
  const manejarGuardar = () => {
    if (esFlexibilizado && !moduloFlexibleId) {
      if (mostrarAviso) {
        mostrarAviso('Debes seleccionar el módulo secundario para poder guardar la flexibilización.');
      }
      return;
    }

    if (onGuardarCambios) {
      onGuardarCambios({
        esFlexibilizado,
        moduloFlexibleId: esFlexibilizado ? moduloFlexibleId : null
      });
    }
  };

  // Plantilla visual para cada alumno con espaciado amplio y jerarquía tipográfica limpia.
  const plantillaDiscente = (discente) => {
    return (
      <div className="flex align-items-center justify-content-between w-full">
        <div className="flex flex-column gap-1">
          <span className="font-semibold text-900 text-sm line-height-2">
            {discente.apellidos}, {discente.nombre}
          </span>
          <div className="flex align-items-center gap-2 text-secondary text-xs">
            <span>
              NIA: <strong className="font-mono text-700">{discente.NIA || 'Sin NIA'}</strong>
            </span>
            {discente.correo && (
              <>
                <span className="text-400">•</span>
                <span className="text-500">{discente.correo}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex align-items-center ml-3">
          <i className="pi pi-user text-400 text-base" />
        </div>
      </div>
    );
  };

  return (
    <div className="surface-card border-round shadow-1 p-4 border-1 surface-border flex flex-column gap-3">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Modificar Clase y Matrícula</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Selecciona una clase para gestionar su flexibilización curricular y administrar las altas y bajas de alumnos.
        </p>
      </div>

      <div className="field mb-0">
        <label htmlFor="selectorClaseModificar" className="font-semibold text-sm mb-2 block">
          Seleccionar Clase (Curso / Módulo) <span className="text-red-500">*</span>
        </label>
        <SelectorClase
          id="selectorClaseModificar"
          value={claseSeleccionadaId}
          options={clases}
          onChange={(e) => onSeleccionarClaseId(e.value)}
          placeholder="Elige una clase existente..."
          className="w-full"
        />
      </div>

      {claseActual && (
        <>
          {/* Recuadro con el nombre del módulo y número de discentes matriculados */}
          <Card className="surface-50 border-1 surface-border shadow-none mt-1">
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
              <div>
                <span className="font-bold text-900 text-lg block">{claseActual.moduloNombre}</span>
                <span className="text-secondary text-sm mt-1 block">
                  Curso: <strong>{claseActual.cursoNombre} ({claseActual.cursoAnyo})</strong> • Centro: {claseActual.cursoCentro}
                </span>
              </div>
              <div className="flex align-items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-green-700 bg-green-50 border-1 border-green-200 border-round px-3 py-2 flex align-items-center gap-2">
                  <i className="pi pi-check" />
                  {discentesMatriculados.length} matriculados
                </span>
                <span className="font-semibold text-sm text-primary bg-blue-50 border-1 border-blue-200 border-round px-3 py-2 flex align-items-center gap-2">
                  <i className="pi pi-users" />
                  {discentesDisponibles.length} disponibles
                </span>
              </div>
            </div>
          </Card>

          {/* Subcomponente para consultar y modificar la flexibilización: justo debajo del recuadro del módulo y encima de discentes */}
          <ModificarFlexibilizacionSeccion
            claseActual={claseActual}
            modulos={modulos}
            ciclos={ciclos}
            esFlexibilizado={esFlexibilizado}
            onCambiarEsFlexibilizado={setEsFlexibilizado}
            moduloFlexibleId={moduloFlexibleId}
            onSeleccionarModuloFlexibleId={setModuloFlexibleId}
            deshabilitado={guardando}
          />

          {/* Listado de discentes con panel de transferencia PickList */}
          <div className="mt-3">
            <PickList
              source={discentesDisponibles}
              target={discentesMatriculados}
              onChange={onCambiarPickList}
              itemTemplate={plantillaDiscente}
              sourceItemTemplate={plantillaDiscente}
              targetItemTemplate={plantillaDiscente}
              sourceHeader="Discentes Disponibles"
              targetHeader="Discentes Matriculados"
              sourceStyle={{ height: '26rem' }}
              targetStyle={{ height: '26rem' }}
              showSourceControls={false}
              showTargetControls={false}
              filterBy="nombre,apellidos,NIA"
              sourceFilterPlaceholder="Buscar disponible por nombre o NIA..."
              targetFilterPlaceholder="Buscar matriculado por nombre o NIA..."
              className="picklist-matriculas w-full"
            />
          </div>

          <div className="flex justify-content-end gap-3 mt-3 pt-3 border-top-1 surface-border">
            <BotonAccion
              tipo="guardar"
              label="Guardar Cambios"
              onClick={manejarGuardar}
              loading={guardando}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ModificarClasePanel;
