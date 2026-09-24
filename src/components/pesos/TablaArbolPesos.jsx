import React, { useState, useEffect, useMemo } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import EstadoVacio from '../common/EstadoVacio.jsx';
import './pesos.css';

/**
 * TablaArbolPesos - Editor jerárquico basado en TreeTable para ponderaciones de RA y CE.
 *
 * Responsabilidad Única: Renderizar la estructura curricular completa en forma de árbol,
 * unificando en una sola línea con tooltip el icono, nombre y descripción del elemento,
 * y facilitando la edición interactiva en línea de las ponderaciones sin cierres inesperados.
 *
 * @param {Object} props
 * @param {Array<Object>} props.arbolNodos - Estructura jerárquica de nodos (RA y CE).
 * @param {string|null} [props.claseId] - Identificador de la clase activa para controlar el reinicio de desplegables.
 * @param {Function} props.onActualizarPesoRA - Callback al modificar el peso de un RA.
 * @param {Function} props.onActualizarPesoCE - Callback al modificar el peso de un CE.
 * @param {Function} props.onDistribuirCE - Callback para repartir equitativamente los CE de un RA.
 * @param {boolean} [props.cargando=false] - Indicador de consulta de datos en progreso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia en progreso.
 * @param {number} [props.sumaPesosRA=0] - Suma actual de los pesos de todos los RA.
 */
export const TablaArbolPesos = ({
  arbolNodos = [],
  claseId = null,
  onActualizarPesoRA,
  onActualizarPesoCE,
  onDistribuirCE,
  cargando = false,
  guardando = false,
  sumaPesosRA = 0
}) => {
  // Estado local para los nodos expandidos. Se inicializa vacío para que aparezcan plegados por defecto.
  const [expandedKeys, setExpandedKeys] = useState({});

  // Los desplegables se pliegan únicamente al cambiar de clase, conservando la apertura durante la edición.
  useEffect(() => {
    setExpandedKeys({});
  }, [claseId]);

  // Expande de forma explícita todos los nodos del árbol.
  const expandirTodo = () => {
    const claves = {};
    (arbolNodos || []).forEach((nodo) => {
      claves[nodo.key] = true;
    });
    setExpandedKeys(claves);
  };

  // Colapsa todos los nodos del árbol curricular.
  const colapsarTodo = () => {
    setExpandedKeys({});
  };

  // Mapa auxiliar para obtener el peso de un RA padre al renderizar los criterios hijos.
  const mapaPesosRA = useMemo(() => {
    const mapa = new Map();
    (arbolNodos || []).forEach((nodo) => {
      mapa.set(nodo.data.id, Number(nodo.data.peso) || 0);
    });
    return mapa;
  }, [arbolNodos]);

  // Si no existen Resultados de Aprendizaje para este módulo, se muestra el estado vacío común.
  if (!cargando && (!arbolNodos || arbolNodos.length === 0)) {
    return (
      <EstadoVacio
        icono="pi pi-sliders-h"
        mensaje="No hay elementos curriculares registrados"
        descripcion="El módulo de la clase seleccionada no cuenta con Resultados de Aprendizaje ni Criterios de Evaluación asignados en el currículo."
      />
    );
  }

// Función auxiliar para eliminar prefijos duplicados en códigos y nombres curriculares.
const formatearNombreCurricular = (codigo, nombre = '') => {
  if (!nombre) return codigo || '';
  const textoLimpio = String(nombre).trim();
  // Se eliminan prefijos repetidos tipo "RA 1:", "RA1", "CE 1.1:", "CE1.1", etc.
  const regexPrefijo = /^((RA|CE)\s*[\w]+(\.[\w]+)?[:.\-\s]*)+/i;
  const textoSinPrefijo = textoLimpio
    .replace(regexPrefijo, '')
    .replace(/^[:.\-\s]+/, '')
    .trim();

  if (!textoSinPrefijo) {
    return codigo || textoLimpio;
  }

  return codigo ? `${codigo}: ${textoSinPrefijo}` : textoSinPrefijo;
};

  // Plantilla para la columna única que agrupa icono, nombre del RA/CE, espacio y descripción en una sola línea.
  const plantillaElementoCurricular = (nodo) => {
    const esRA = nodo.data.tipo === 'RA';
    const codigo = nodo.data.codigo || '';
    const nombre = nodo.data.nombre || '';
    const descripcion = nodo.data.descripcion || '';

    // Se determina el nombre formateado evitando prefijos redundantes ("RA 1:RA1 ...")
    const nombreFormateado = formatearNombreCurricular(codigo, nombre);

    // Se compone la línea completa en el orden solicitado: nombre, espacio y descripción
    const textoCompleto = descripcion
      ? `${nombreFormateado} ${descripcion}`
      : nombreFormateado;

    return (
      <span
        className="elemento-curricular-fila inline-flex align-items-center gap-2 py-1 overflow-hidden vertical-align-middle"
        style={{ minWidth: 0, maxWidth: 'calc(100% - 3.5rem)' }}
      >
        {/* Icono identificativo de RA (marcador) o CE (círculo de verificación) */}
        <i
          className={`pi ${
            esRA ? 'pi-bookmark text-primary font-bold' : 'pi-check-circle text-color-secondary'
          } flex-shrink-0 text-base vertical-align-middle`}
        />

        {/* Texto en una sola línea continua con truncamiento por elipsis y tooltip en caso de desbordamiento */}
        <span
          className="white-space-nowrap overflow-hidden text-overflow-ellipsis text-sm inline-block texto-truncado-curricular"
          data-pr-tooltip={textoCompleto}
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <strong className={esRA ? 'text-900 font-bold' : 'text-800 font-semibold'}>
            {nombreFormateado}
          </strong>
          {descripcion && (
            <span className="text-color-secondary text-sm ml-2 font-normal">
              {descripcion}
            </span>
          )}
        </span>
      </span>
    );
  };

  // Plantilla para la columna de entrada de datos interactiva del porcentaje de ponderación.
  const plantillaPonderacion = (nodo) => {
    const esRA = nodo.data.tipo === 'RA';

    return (
      <div className="flex align-items-center gap-2">
        <InputNumber
          value={nodo.data.peso}
          onValueChange={(e) => {
            const nuevoValor = e.value !== null && e.value !== undefined ? e.value : 0;
            // Se evita disparar actualizaciones si el valor introducido no varía.
            if (nuevoValor === Number(nodo.data.peso || 0)) return;
            if (esRA) {
              onActualizarPesoRA(nodo.data.id, nuevoValor);
            } else {
              onActualizarPesoCE(nodo.data.id_ra, nodo.data.id, nuevoValor);
            }
          }}
          min={0}
          max={100}
          suffix=" %"
          showButtons
          buttonLayout="horizontal"
          step={1}
          decrementButtonClassName="p-button-secondary p-button-outlined"
          incrementButtonClassName="p-button-secondary p-button-outlined"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
          className="input-ponderacion-pesos"
          disabled={guardando}
          aria-label={`Ponderación para ${nodo.data.codigo}`}
        />
        <span className="text-xs text-color-secondary hidden xl:inline">
          {esRA ? 'en clase' : 'en RA'}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de balance local (en RA) o impacto real en la clase (en CE).
  const plantillaBalance = (nodo) => {
    const esRA = nodo.data.tipo === 'RA';

    if (esRA) {
      const numHijos = nodo.data.numHijos || 0;
      const sumaCE = nodo.data.sumaCE || 0;

      if (numHijos === 0) {
        return (
          <Tag
            value="Sin Criterios"
            severity="secondary"
            className="text-xs"
            tooltip="Este RA no tiene criterios asignados"
            tooltipOptions={{ position: 'top' }}
          />
        );
      }

      const estaEquilibrado = sumaCE === 100;

      return (
        <div className="flex align-items-center gap-2">
          <Tag
            value={estaEquilibrado ? '100% CE' : `${sumaCE}% CE`}
            severity={estaEquilibrado ? 'success' : 'danger'}
            icon={estaEquilibrado ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
            className="text-xs"
            tooltip={
              estaEquilibrado
                ? 'Suma correcta de criterios respecto a este RA (100%)'
                : `Los criterios suman ${sumaCE}% (deben sumar exactamente 100%)`
            }
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            type="button"
            icon="pi pi-sliders-h"
            text
            rounded
            severity="secondary"
            onClick={() => onDistribuirCE(nodo.data.id)}
            disabled={guardando}
            tooltip="Repartir 100% equitativamente entre los CE de este RA"
            tooltipOptions={{ position: 'top' }}
            aria-label={`Repartir CE para ${nodo.data.codigo}`}
          />
        </div>
      );
    }

    // Para los Criterios de Evaluación se calcula su impacto porcentual en la clase.
    const pesoRaPadre = mapaPesosRA.get(nodo.data.id_ra) || 0;
    const impactoModulo = ((Number(nodo.data.peso || 0) * pesoRaPadre) / 100).toFixed(1);

    return (
      <div className="flex align-items-center gap-1 text-xs text-color-secondary font-mono">
        <span>Impacto en clase:</span>
        <strong className="text-800">{impactoModulo}%</strong>
      </div>
    );
  };

  // Cabecera superior del componente TreeTable.
  const cabeceraTabla = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2 p-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-sitemap text-primary text-xl" />
        <span className="text-lg font-bold text-900">
          Estructura Jerárquica de Ponderación
        </span>
      </div>
      <div className="flex align-items-center gap-2">
        <Button
          type="button"
          icon="pi pi-angle-double-down"
          label="Expandir Todo"
          className="p-button-sm p-button-text p-button-secondary"
          onClick={expandirTodo}
        />
        <Button
          type="button"
          icon="pi pi-angle-double-up"
          label="Colapsar Todo"
          className="p-button-sm p-button-text p-button-secondary"
          onClick={colapsarTodo}
        />
      </div>
    </div>
  );

  // Pie inferior de la tabla con el totalizador global de la clase.
  const pieTabla = (
    <div className="flex flex-wrap align-items-center justify-content-between p-3 font-semibold text-sm surface-50 border-top-1 surface-border">
      <div className="flex align-items-center gap-3">
        <span className="text-800">Suma Total de Ponderaciones (Resultados de Aprendizaje de la Clase):</span>
        <Tag
          value={`${sumaPesosRA}%`}
          severity={sumaPesosRA === 100 ? 'success' : 'danger'}
          icon={sumaPesosRA === 100 ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
          className="text-sm px-2 py-1"
        />
        <span className="text-xs text-color-secondary font-normal hidden md:inline">
          {sumaPesosRA === 100
            ? '(Ponderación global equilibrada para la evaluación de la clase)'
            : '(Debe sumar exactamente 100% para la nota final de la clase)'}
        </span>
      </div>
      <div className="text-xs text-color-secondary font-normal">
        * Cada criterio de evaluación se pondera respecto al 100% de su RA padre.
      </div>
    </div>
  );

  return (
    <div className="surface-card border-round border-1 surface-border shadow-1 mb-4 overflow-hidden">
      {/* Tooltip para textos curriculares truncados en una sola línea */}
      <Tooltip
        target=".texto-truncado-curricular"
        position="top"
        showDelay={400}
        className="max-w-30rem text-xs"
      />

      <TreeTable
        value={arbolNodos}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        loading={cargando}
        header={cabeceraTabla}
        footer={pieTabla}
        className="p-treetable-sm tabla-pesos-treetable"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column
          field="nombre"
          header="Enunciado y Descripción"
          expander
          body={plantillaElementoCurricular}
          style={{ width: '62%' }}
        />
        <Column
          field="peso"
          header="Ponderación (%)"
          body={plantillaPonderacion}
          style={{ width: '19%' }}
        />
        <Column
          field="balance"
          header="Balance Criterios / Impacto"
          body={plantillaBalance}
          style={{ width: '19%' }}
        />
      </TreeTable>
    </div>
  );
};

export default TablaArbolPesos;
