import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

// Componente jerárquico con TreeTable para el mapeo de Prácticas a RA y CE con colores condicionales y estado de cobertura
const CriteriosTreeTabla = ({
  arbolCriterios = [],
  seleccionesCE = {},
  coberturaGlobalCE = {},
  alternarSeleccionRA,
  alternarSeleccionCE,
  actualizarPorcentajeCE
}) => {
  // Estado para controlar qué nodos del árbol se encuentran expandidos (contraído por defecto)
  const [expandedKeys, setExpandedKeys] = useState({});

  // Al cargar o cambiar el árbol de criterios, aparece siempre contraído por defecto
  useEffect(() => {
    setExpandedKeys({});
  }, [arbolCriterios]);

  // Se expanden todos los nodos del árbol
  const expandirTodos = () => {
    const todos = {};
    arbolCriterios.forEach((nodoRA) => {
      todos[nodoRA.key] = true;
    });
    setExpandedKeys(todos);
  };

  // Se contraen todos los nodos del árbol
  const contraerTodos = () => {
    setExpandedKeys({});
  };

  // Cálculo del estado de selección local de un nodo padre (Resultado de Aprendizaje) en la práctica actual
  const obtenerEstadoNodoRA = (nodoRA) => {
    const hijos = nodoRA.children || [];
    if (hijos.length === 0) {
      return { todos: false, alguno: false, total: 0, seleccionados: 0, media: 0 };
    }

    const seleccionados = hijos.filter((hijo) => Boolean(seleccionesCE[hijo.data.id_ce]?.seleccionado));
    const todos = seleccionados.length === hijos.length;
    const alguno = seleccionados.length > 0 && !todos;

    const sumaPorcentajes = seleccionados.reduce(
      (acum, hijo) => acum + (seleccionesCE[hijo.data.id_ce]?.porcentaje || 0),
      0
    );
    const media = seleccionados.length > 0 ? Math.round(sumaPorcentajes / seleccionados.length) : 0;

    return {
      todos,
      alguno,
      total: hijos.length,
      seleccionados: seleccionados.length,
      media
    };
  };

  // Cálculo del estado de asignación y color para un Criterio de Evaluación
  // Gris: ya ha sido asignado a una práctica (en otra práctica o en la actual)
  // Blanco: no asignado a ninguna práctica
  const obtenerEstadoCE = (idCE) => {
    const coberturaCE = coberturaGlobalCE[idCE] || { porcentajeEnOtras: 0, asignadoEnOtras: false };
    const datosCE = seleccionesCE[idCE] || { seleccionado: false, porcentaje: 100 };
    const porcEnOtras = coberturaCE.porcentajeEnOtras || 0;
    const porcEsta = datosCE.seleccionado ? (Number(datosCE.porcentaje) || 0) : 0;
    const estaAsignado = porcEnOtras > 0 || Boolean(datosCE.seleccionado);
    const porcTotal = porcEnOtras + porcEsta;
    const restante = Math.max(0, 100 - porcEnOtras);

    return {
      estaAsignado,
      color: estaAsignado ? '#9ca3af' : '#ffffff',
      porcEnOtras,
      porcEsta,
      porcTotal,
      restante,
      totalmenteAsignadoEnOtras: porcEnOtras >= 100
    };
  };

  // Función auxiliar para obtener el texto descriptivo completo del Resultado de Aprendizaje
  const obtenerTextoRA = (data) => {
    if (!data) return '';
    const numStr = data.numero ? `RA ${data.numero}` : 'RA';
    const nombreLimpio = (data.nombre || '').trim();
    const descLimpia = (data.descripcion || '').trim();

    let texto = '';
    // Si la descripción contiene el texto pedagógico y el nombre es sólo el número o código
    if (descLimpia && (!nombreLimpio || nombreLimpio === String(data.numero) || nombreLimpio.toLowerCase() === `ra ${data.numero}`.toLowerCase() || nombreLimpio.toLowerCase() === `ra${data.numero}`.toLowerCase() || nombreLimpio.length <= 4)) {
      texto = descLimpia;
    } else if (nombreLimpio && descLimpia && !descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase()) && !nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())) {
      texto = `${nombreLimpio} - ${descLimpia}`;
    } else {
      texto = nombreLimpio || descLimpia || '';
    }

    // Si el texto ya empieza con "RA", se devuelve directamente
    if (texto.toLowerCase().startsWith('ra ') || texto.toLowerCase().startsWith('ra.')) {
      return texto;
    }

    return texto ? `${numStr}: ${texto}` : numStr;
  };

  // Función auxiliar para obtener el texto descriptivo completo del Criterio de Evaluación
  const obtenerTextoCE = (data) => {
    if (!data) return '';
    const numStr = data.numero ? `CE ${data.numero}` : 'CE';
    const nombreLimpio = (data.nombre || '').trim();
    const descLimpia = (data.descripcion || '').trim();

    let texto = '';
    // Si la descripción contiene el texto del criterio y el nombre es sólo la letra o número
    if (descLimpia && (!nombreLimpio || nombreLimpio === String(data.numero) || nombreLimpio.toLowerCase() === `ce ${data.numero}`.toLowerCase() || nombreLimpio.toLowerCase() === `ce${data.numero}`.toLowerCase() || nombreLimpio.length <= 4)) {
      texto = descLimpia;
    } else if (nombreLimpio && descLimpia && !descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase()) && !nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())) {
      texto = `${nombreLimpio} - ${descLimpia}`;
    } else {
      texto = nombreLimpio || descLimpia || '';
    }

    // Si el texto ya empieza con "CE", se devuelve directamente
    if (texto.toLowerCase().startsWith('ce ') || texto.toLowerCase().startsWith('ce.')) {
      return texto;
    }

    return texto ? `${numStr}: ${texto}` : numStr;
  };

  // Plantilla de renderizado para la columna principal con Checkbox y Nombre
  const renderColumnaPrincipal = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const estadoRA = obtenerEstadoNodoRA(node);
      const textoRA = obtenerTextoRA(node.data);
      // El color del RA es blanco, variando a azul claro (#38bdf8) si la práctica seleccionada contiene algún CE del RA
      const colorRA = estadoRA.seleccionados > 0 ? '#38bdf8' : '#ffffff';

      return (
        <div
          className="inline-flex align-items-center gap-2"
          style={{ verticalAlign: 'middle', maxWidth: 'calc(100% - 2.5rem)', overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Checkbox del Resultado de Aprendizaje con selección en cascada */}
          <Checkbox
            checked={estadoRA.todos}
            onChange={(e) => {
              e.originalEvent?.stopPropagation();
              alternarSeleccionRA(node.data.id_ra, e.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 mr-1"
            tooltip={
              estadoRA.todos
                ? 'Deseleccionar todos los CE de este RA'
                : 'Seleccionar todos los CE de este RA'
            }
            tooltipOptions={{ position: 'top' }}
          />

          {/* Nombre y texto completo del Resultado de Aprendizaje: blanco por defecto, o azul si tiene CE seleccionados */}
          <span
            className="font-bold cursor-help"
            style={{
              color: colorRA,
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}
            title={textoRA}
          >
            {textoRA}
          </span>
        </div>
      );
    }

    // Renderizado para nodo hijo: Criterio de Evaluación (CE)
    const idCE = node.data.id_ce;
    const datosCE = seleccionesCE[idCE] || { seleccionado: false, porcentaje: 100 };
    const estadoCE = obtenerEstadoCE(idCE);
    const textoCE = obtenerTextoCE(node.data);

    return (
      <div
        className="inline-flex align-items-center gap-2 pl-2"
        style={{ verticalAlign: 'middle', maxWidth: 'calc(100% - 2.5rem)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Checkbox individual del Criterio de Evaluación */}
        <Checkbox
          checked={Boolean(datosCE.seleccionado)}
          onChange={(e) => {
            e.originalEvent?.stopPropagation();
            alternarSeleccionCE(idCE);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 mr-1"
          tooltip={
            datosCE.seleccionado
              ? 'Quitar criterio de la práctica'
              : 'Asignar criterio a la práctica'
          }
          tooltipOptions={{ position: 'top' }}
        />

        {/* Nombre y texto completo del Criterio de Evaluación: gris si ya está asignado o blanco si no está asignado */}
        <span
          className="cursor-help"
          style={{
            color: estadoCE.color,
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            fontWeight: datosCE.seleccionado ? '600' : 'normal'
          }}
          title={textoCE}
        >
          {textoCE}
        </span>
      </div>
    );
  };

  // Plantilla de renderizado para la columna de Cobertura / Porcentaje con InputNumber y placeholder informativo
  const renderColumnaPorcentaje = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const estadoRA = obtenerEstadoNodoRA(node);

      if (estadoRA.seleccionados === 0) {
        return <span className="text-xs text-muted font-normal">-</span>;
      }

      return (
        <div className="flex align-items-center justify-content-center gap-1">
          <Tag
            severity={estadoRA.todos ? 'success' : 'warning'}
            value={`${estadoRA.media}% Media`}
            className="text-xs font-bold"
          />
        </div>
      );
    }

    // Renderizado del InputNumber para Criterios de Evaluación (CE)
    const idCE = node.data.id_ce;
    const datosCE = seleccionesCE[idCE] || { seleccionado: false, porcentaje: 100 };
    const estadoCE = obtenerEstadoCE(idCE);
    const valorPorcentaje = datosCE.porcentaje !== null && datosCE.porcentaje !== undefined ? Number(datosCE.porcentaje) : 100;

    // Placeholder numérico e indicativo de si está totalmente asignado en otras prácticas o no
    const placeholderInput = estadoCE.totalmenteAsignadoEnOtras
      ? '0'
      : estadoCE.porcEnOtras > 0
      ? String(estadoCE.restante)
      : '100';

    const tooltipInput = estadoCE.totalmenteAsignadoEnOtras
      ? 'Totalmente asignado (100%) en otras prácticas'
      : estadoCE.porcEnOtras > 0
      ? `Asignado un ${estadoCE.porcEnOtras}% en otras prácticas (Queda un ${estadoCE.restante}% por cubrir)`
      : 'Porcentaje de cobertura de este CE (0-100%)';

    return (
      <div className="flex align-items-center justify-content-center py-1">
        <InputNumber
          value={datosCE.seleccionado ? valorPorcentaje : null}
          placeholder={placeholderInput}
          onValueChange={(e) => actualizarPorcentajeCE(idCE, e.value)}
          min={0}
          max={100}
          suffix=" %"
          showButtons
          buttonLayout="horizontal"
          decrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
          incrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
          disabled={!datosCE.seleccionado}
          className={`w-full max-w-10rem text-center ${
            !datosCE.seleccionado ? 'opacity-40' : ''
          }`}
          inputClassName={`text-center font-bold text-sm ${
            !datosCE.seleccionado ? 'text-muted' : 'text-primary'
          }`}
          tooltip={tooltipInput}
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla de renderizado para la columna de Estado descriptivo
  const renderColumnaEstado = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const estadoRA = obtenerEstadoNodoRA(node);
      return (
        <div className="flex align-items-center justify-content-center">
          <Tag
            severity={estadoRA.todos ? 'success' : estadoRA.alguno ? 'warning' : 'secondary'}
            icon={estadoRA.todos ? 'pi pi-check' : estadoRA.alguno ? 'pi pi-info-circle' : 'pi pi-minus'}
            value={
              estadoRA.todos
                ? 'Todos seleccionados'
                : estadoRA.alguno
                ? `Seleccionados (${estadoRA.seleccionados}/${estadoRA.total})`
                : 'Sin seleccionar'
            }
            className="text-xs font-semibold"
          />
        </div>
      );
    }

    const idCE = node.data.id_ce;
    const datosCE = seleccionesCE[idCE] || { seleccionado: false, porcentaje: 100 };
    const estadoCE = obtenerEstadoCE(idCE);

    return (
      <div className="flex align-items-center justify-content-center">
        <Tag
          severity={
            datosCE.seleccionado
              ? 'success'
              : estadoCE.porcEnOtras > 0
              ? 'warning'
              : 'secondary'
          }
          icon={
            datosCE.seleccionado
              ? 'pi pi-check'
              : estadoCE.porcEnOtras > 0
              ? 'pi pi-info-circle'
              : 'pi pi-minus'
          }
          value={
            datosCE.seleccionado
              ? `Asignado (${datosCE.porcentaje}%)`
              : estadoCE.porcEnOtras > 0
              ? `En otras (${estadoCE.porcEnOtras}%)`
              : 'No asignado'
          }
          className="text-xs font-semibold"
        />
      </div>
    );
  };

  // Cabecera superior de la tabla con controles de expansión
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-sitemap text-primary text-lg" />
        <span className="font-bold text-color">Estructura Jerárquica de Criterios (RA y CE)</span>
      </div>
      <div className="flex align-items-center gap-1">
        <Button
          type="button"
          icon="pi pi-angle-double-down"
          label="Expandir todos"
          size="small"
          text
          severity="secondary"
          className="p-1 px-2 text-xs"
          onClick={expandirTodos}
        />
        <Button
          type="button"
          icon="pi pi-angle-double-up"
          label="Contraer todos"
          size="small"
          text
          severity="secondary"
          className="p-1 px-2 text-xs"
          onClick={contraerTodos}
        />
      </div>
    </div>
  );

  return (
    <Card className="shadow-1 p-0 overflow-hidden">
      <TreeTable
        value={arbolCriterios}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        header={cabeceraTabla}
        className="p-treetable-sm"
        emptyMessage="No se encontraron Resultados de Aprendizaje ni Criterios de Evaluación para el módulo de esta práctica."
        tableStyle={{ minWidth: '50rem' }}
      >
        {/* Columna 1: Nombre / Descripción con Expander y Checkbox a la izquierda en la misma línea */}
        <Column
          field="nombre"
          header="Resultado de Aprendizaje / Criterio de Evaluación"
          expander
          body={renderColumnaPrincipal}
          style={{ width: '55%' }}
        />

        {/* Columna 2: Porcentaje (0-100) con InputNumber */}
        <Column
          field="porcentaje"
          header="Porcentaje Cobertura (%)"
          body={renderColumnaPorcentaje}
          style={{ width: '25%', textAlign: 'center' }}
        />

        {/* Columna 3: Estado de asignación */}
        <Column
          header="Estado"
          body={renderColumnaEstado}
          style={{ width: '20%', textAlign: 'center' }}
        />
      </TreeTable>
    </Card>
  );
};

export default CriteriosTreeTabla;
