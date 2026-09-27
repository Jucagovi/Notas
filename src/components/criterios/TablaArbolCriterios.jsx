import React, { useState } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import BotonAccion from '../common/BotonAccion.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import ControlSliderInput from './ControlSliderInput.jsx';

/**
 * TablaArbolCriterios - Componente presentacional para la vinculación jerárquica de RA y CE mediante TreeTable.
 *
 * Responsabilidad Única: Renderizar el árbol de Resultados de Aprendizaje y Criterios de Evaluación,
 * colapsado por defecto, con iconos y texto en una sola línea estricta, Slider e InputNumber conectados
 * en two-way binding en pasos de 5, desactivación de RA completos y código de colores en texto y borde.
 *
 * @param {Object} props
 * @param {Array<Object>} props.arbolNodos - Estructura jerárquica para TreeTable (key, data, children).
 * @param {Object|null} [props.versionActiva=null] - Versión de práctica actualmente seleccionada para el mapeo.
 * @param {Object|null} [props.practicaActiva=null] - Alias compatible para la actividad seleccionada.
 * @param {Function} props.onSeleccionarNodo - Manejador de evento al cambiar el checkbox de un nodo.
 * @param {Function} props.onActualizarPorcentaje - Manejador al variar el porcentaje con Slider o InputNumber.
 * @param {Function} props.onGuardar - Callback para persistir los cambios en la tabla trabajan.
 * @param {Function} props.onRestablecer - Callback para descartar modificaciones locales.
 * @param {boolean} [props.hayCambios=false] - Indica si existen modificaciones pendientes de guardar.
 * @param {boolean} [props.guardando=false] - Indica si la transacción de guardado está en curso.
 * @param {boolean} [props.cargando=false] - Indicador de carga de datos curriculares.
 */
export const TablaArbolCriterios = ({
  arbolNodos = [],
  versionActiva = null,
  practicaActiva = null,
  onSeleccionarNodo,
  onActualizarPorcentaje,
  onGuardar,
  onRestablecer,
  hayCambios = false,
  guardando = false,
  cargando = false
}) => {
  // Se consolida el objeto de actividad activa admitiendo versionActiva o practicaActiva
  const actividadActiva = versionActiva || practicaActiva;

  // Estado local para controlar qué nodos padres se encuentran desplegados.
  // Por defecto se inicia vacío ({}) para que los acordeones comiencen colapsados desde el inicio.
  const [clavesExpandidas, setClavesExpandidas] = useState({});

  // Manejador para expandir todos los nodos padres
  const expandirTodos = () => {
    const mapa = {};
    arbolNodos.forEach((nodo) => {
      mapa[nodo.key] = true;
    });
    setClavesExpandidas(mapa);
  };

  // Manejador para colapsar todos los nodos
  const colapsarTodos = () => {
    setClavesExpandidas({});
  };

  // Si no hay ninguna actividad o versión seleccionada, se muestra el estado indicativo
  if (!actividadActiva) {
    return (
      <div className="surface-card p-4 border-round border-1 surface-border shadow-1">
        <EstadoVacio
          icono="pi pi-mouse"
          mensaje="Selecciona una actividad de la clase"
          descripcion="Haz clic en una de las tarjetas de arriba para activar su mapeo y configurar los Criterios de Evaluación que cubre."
        />
      </div>
    );
  }

  // Si el módulo no tiene Resultados de Aprendizaje registrados
  if (!arbolNodos || arbolNodos.length === 0) {
    return (
      <div className="surface-card p-4 border-round border-1 surface-border shadow-1">
        <EstadoVacio
          icono="pi pi-folder-open"
          mensaje="No hay criterios configurados en este módulo"
          descripcion="El módulo curricular asociado a esta clase no dispone de Resultados de Aprendizaje o Criterios de Evaluación."
        />
      </div>
    );
  }

  /**
   * Plantilla para la columna de nombre y descripción.
   * Garantiza que el icono, el checkbox y el texto se muestren estrictamente en una sola línea horizontal.
   */
  const plantillaNombre = (nodo) => {
    const { data } = nodo;
    const esPadre = data.esPadre;
    const estaBloqueado = Boolean(data.bloqueadoPorOtras);
    const esPadreBloqueado = esPadre && Boolean(data.todosAsignados);

    // Texto compuesto íntegro (Nombre + Descripción limpio sin guiones)
    const textoMostrar = data.textoCompleto || data.etiqueta || data.nombre;

    return (
      <span
        className="inline-flex align-items-center gap-2 flex-nowrap overflow-hidden vertical-align-middle"
        style={{
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100% - 2.5rem)',
          minWidth: 0,
          lineHeight: '1.5'
        }}
        title={textoMostrar}
      >
        {/* Checkbox de selección: se desactiva si el CE o todos los CE del RA ya están asignados */}
        <Checkbox
          checked={data.seleccionado || esPadreBloqueado}
          onChange={(e) => onSeleccionarNodo(nodo.key, e.checked)}
          disabled={guardando || cargando || estaBloqueado || esPadreBloqueado}
          className="flex-shrink-0"
          title={
            estaBloqueado
              ? 'Este criterio ya tiene el 100% de cobertura cubierto por otras versiones de la clase.'
              : esPadreBloqueado
              ? 'Todos los criterios de este Resultado de Aprendizaje ya están asignados.'
              : esPadre
              ? data.seleccionado
                ? 'Desmarcar todos los criterios del RA'
                : 'Marcar los criterios disponibles del RA al 100%'
              : data.seleccionado
              ? 'Desvincular criterio de la versión'
              : 'Vincular criterio a la versión'
          }
        />

        {/* Icono identificativo en la misma línea */}
        {esPadre && (
          <i className="pi pi-bookmark text-primary flex-shrink-0" />
        )}

        {/* Texto continuo truncado en una sola línea */}
        <span
          className={esPadre ? 'font-bold text-900 text-sm' : 'text-800 text-sm'}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block'
          }}
        >
          {textoMostrar}
        </span>

        {/* Indicadores complementarios de estado bloqueado */}
        {estaBloqueado && (
          <i className="pi pi-lock text-xs text-orange-500 flex-shrink-0" title="Criterio completo en otras versiones" />
        )}
        {esPadreBloqueado && (
          <i className="pi pi-check text-xs text-green-600 flex-shrink-0 font-bold" title="Todos los criterios asignados" />
        )}
      </span>
    );
  };

  /**
   * Plantilla para la columna de porcentaje en esta versión.
   * Renderiza el control unificado ControlSliderInput con dos vías de sincronización y pasos de 5.
   */
  const plantillaPorcentaje = (nodo) => {
    const { data } = nodo;

    // Los nodos padre (RA) no admiten campos de porcentaje
    if (data.esPadre) {
      return (
        <div className="text-500 text-xs font-medium text-right pr-2">
          {data.hijosSeleccionados > 0
            ? `${data.hijosSeleccionados} de ${data.totalHijos} criterios vinculados`
            : `${data.totalHijos} criterios disponibles`}
        </div>
      );
    }

    // Si el criterio ya tiene el 100% cubierto en otras versiones se bloquea para evitar sobrecobertura
    if (data.bloqueadoPorOtras) {
      return (
        <div
          className="flex align-items-center justify-content-end gap-1 text-xs text-500 italic py-1 pr-2"
          title="Este criterio ya ha alcanzado el 100% de asignación acumulada en otras versiones de la clase."
        >
          <i className="pi pi-lock text-xs text-orange-500" />
          <span>Cubierto al 100% en otras versiones</span>
        </div>
      );
    }

    const estaHabilitado = data.seleccionado && !guardando && !cargando;
    const porcentajeActual = Number(data.porcentaje) || 0;

    return (
      <div className="flex justify-content-end align-items-center w-full py-1">
        <ControlSliderInput
          value={porcentajeActual}
          onChange={(nuevoValor) => onActualizarPorcentaje(nodo.key, nuevoValor)}
          min={0}
          max={100}
          step={5}
          disabled={!estaHabilitado}
          ariaLabel={`Porcentaje para ${data.codigo || data.nombre}`}
          width="130px"
        />
      </div>
    );
  };

  /**
   * Plantilla para la columna de Cobertura Global CE.
   * Aplica código de colores estricto al borde y al texto con fondo transparente:
   * - 0%: borde gris, texto gris, fondo transparente
   * - 1 a 99%: borde naranja, texto naranja, fondo transparente
   * - 100%: borde verde, texto verde, fondo transparente
   * - > 100%: borde rojo, texto rojo, fondo transparente
   */
  const plantillaCoberturaGlobal = (nodo) => {
    const { data } = nodo;

    if (data.esPadre) {
      return null;
    }

    const totalGlobal = Number(data.porcentajeGlobal) || 0;
    const aporteEstaVersion = Number(data.porcentaje) || 0;
    const aporteOtras = Number(data.porcentajeOtrasVersiones) || 0;

    let colorBorde = 'var(--surface-border, #cbd5e1)';
    let colorTexto = 'var(--text-color-secondary, #64748b)';
    let textoBadge = '0%';
    let icono = 'pi pi-circle';

    if (totalGlobal === 0) {
      colorBorde = 'var(--surface-border, #cbd5e1)';
      colorTexto = 'var(--text-color-secondary, #64748b)';
      textoBadge = '0%';
      icono = 'pi pi-circle';
    } else if (totalGlobal >= 1 && totalGlobal <= 99) {
      colorBorde = '#f97316';
      colorTexto = '#f97316';
      textoBadge = `${totalGlobal}%`;
      icono = 'pi pi-clock';
    } else if (totalGlobal === 100) {
      colorBorde = '#22c55e';
      colorTexto = '#22c55e';
      textoBadge = '100%';
      icono = 'pi pi-check-circle';
    } else {
      colorBorde = '#ef4444';
      colorTexto = '#ef4444';
      textoBadge = `${totalGlobal}%`;
      icono = 'pi pi-exclamation-circle';
    }

    const explicacionTooltip = `Cobertura total del criterio: ${totalGlobal}% (${aporteEstaVersion}% en esta versión + ${aporteOtras}% en otras versiones de la clase).`;

    return (
      <div className="flex align-items-center justify-content-end py-1">
        <span
          className="border-round text-xs font-bold inline-flex align-items-center gap-1 cursor-help justify-content-center px-2 py-1"
          style={{
            backgroundColor: 'transparent',
            borderColor: colorBorde,
            borderWidth: '1.5px',
            borderStyle: 'solid',
            color: colorTexto,
            minWidth: '4.5rem'
          }}
          title={explicacionTooltip}
        >
          <i className={`${icono} text-xs`} style={{ color: colorTexto }} />
          <span style={{ color: colorTexto }}>{textoBadge}</span>
        </span>
      </div>
    );
  };

  const nombreActividad = actividadActiva.nombrePractica || actividadActiva.nombre || 'Actividad';
  const etiquetaVersion = actividadActiva.numero ? ` (v${actividadActiva.numero})` : '';

  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1">
      {/* Encabezado destacado de la tabla con acciones y botón Guardar Mapeo */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3 pb-3 mb-3 border-bottom-1 surface-border">
        <div>
          <div className="flex align-items-center gap-2">
            <i className="pi pi-sitemap text-primary text-xl" />
            <h3 className="m-0 text-900 font-bold text-base">
              Mapeo de Criterios: <span className="text-primary">{nombreActividad}{etiquetaVersion}</span>
            </h3>
          </div>
          <p className="m-0 mt-1 text-color-secondary text-xs">
            Marca los Resultados de Aprendizaje para seleccionar sus criterios o ajusta el porcentaje de cobertura con el deslizador.
          </p>
        </div>

        {/* Controles de expansión y botón de acción principal Guardar Mapeo */}
        <div className="flex align-items-center gap-2 flex-wrap">
          <Button
            type="button"
            icon="pi pi-angle-double-down"
            label="Expandir"
            severity="secondary"
            outlined
            size="small"
            onClick={expandirTodos}
            title="Expandir todos los Resultados de Aprendizaje"
          />
          <Button
            type="button"
            icon="pi pi-angle-double-up"
            label="Colapsar"
            severity="secondary"
            outlined
            size="small"
            onClick={colapsarTodos}
            title="Colapsar todos los Resultados de Aprendizaje"
          />

          {hayCambios && (
            <Button
              type="button"
              icon="pi pi-undo"
              label="Descartar"
              severity="secondary"
              outlined
              size="small"
              onClick={onRestablecer}
              disabled={guardando}
              title="Deshacer los cambios locales y volver a los valores guardados"
            />
          )}

          {/* Botón destacado "Guardar Mapeo" en la parte superior de la tabla */}
          <BotonAccion
            tipo="guardar"
            label={guardando ? 'Guardando...' : 'Guardar Mapeo'}
            icon={guardando ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            onClick={onGuardar}
            disabled={guardando || cargando}
            className="p-button-sm shadow-2"
          />
        </div>
      </div>

      {/* Indicador de modificaciones pendientes de persistencia */}
      {hayCambios && (
        <div className="flex align-items-center gap-2 p-2 mb-3 border-round bg-yellow-50 text-yellow-800 text-xs border-1 border-yellow-200">
          <i className="pi pi-info-circle" />
          <span>
            Tienes modificaciones no guardadas en esta versión. Pulsa en <strong>Guardar Mapeo</strong> para confirmar los cambios.
          </span>
        </div>
      )}

      {/* Tabla Jerárquica TreeTable de PrimeReact colapsada por defecto */}
      <TreeTable
        value={arbolNodos}
        expandedKeys={clavesExpandidas}
        onToggle={(e) => setClavesExpandidas(e.value)}
        loading={cargando || guardando}
        emptyMessage="No se han encontrado criterios en el módulo."
        className="w-full text-sm"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column
          field="nombre"
          header="Resultado de Aprendizaje / Criterio de Evaluación"
          expander
          body={plantillaNombre}
          style={{ width: '52%', whiteSpace: 'nowrap' }}
        />
        <Column
          field="porcentaje"
          header="Porcentaje en esta versión"
          body={plantillaPorcentaje}
          headerClassName="text-right"
          style={{ width: '28%' }}
        />
        <Column
          field="coberturaGlobal"
          header="Cobertura Global CE"
          body={plantillaCoberturaGlobal}
          headerClassName="text-right"
          style={{ width: '20%' }}
        />
      </TreeTable>
    </div>
  );
};

export default TablaArbolCriterios;
