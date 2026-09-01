import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

// Componente jerárquico con TreeTable para la asignación y edición de pesos de RA y CE con texto en blanco
const PesosRATreeTabla = ({
  arbolPesos = [],
  pesosRA = {},
  pesosCE = {},
  estadoPorRA = {},
  actualizarPesoRA = () => {},
  actualizarPesoCE = () => {},
  repartirEquitativamenteCE = () => {}
}) => {
  // Estado para controlar qué nodos del árbol se encuentran expandidos
  const [expandedKeys, setExpandedKeys] = useState({});

  // Al cargar o cambiar el árbol de pesos, aparecen todas las filas contraídas al inicio por defecto
  useEffect(() => {
    setExpandedKeys({});
  }, [arbolPesos]);

  // Se expanden todos los nodos del árbol
  const expandirTodos = () => {
    const todos = {};
    (arbolPesos || []).forEach((nodoRA) => {
      todos[nodoRA.key] = true;
    });
    setExpandedKeys(todos);
  };

  // Se contraen todos los nodos del árbol
  const contraerTodos = () => {
    setExpandedKeys({});
  };

  // Función auxiliar para obtener el texto descriptivo completo del Resultado de Aprendizaje
  const obtenerTextoRA = (data) => {
    if (!data) return '';
    const numStr = data.numero ? `RA ${data.numero}` : 'RA';
    const nombreLimpio = (data.nombre || '').trim();
    const descLimpia = (data.descripcion || '').trim();

    let texto = '';
    if (
      descLimpia &&
      (!nombreLimpio ||
        nombreLimpio === String(data.numero) ||
        nombreLimpio.toLowerCase() === `ra ${data.numero}`.toLowerCase() ||
        nombreLimpio.toLowerCase() === `ra${data.numero}`.toLowerCase() ||
        nombreLimpio.length <= 4)
    ) {
      texto = descLimpia;
    } else if (
      nombreLimpio &&
      descLimpia &&
      !descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase()) &&
      !nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())
    ) {
      texto = `${nombreLimpio} - ${descLimpia}`;
    } else {
      texto = nombreLimpio || descLimpia || '';
    }

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
    if (
      descLimpia &&
      (!nombreLimpio ||
        nombreLimpio === String(data.numero) ||
        nombreLimpio.toLowerCase() === `ce ${data.numero}`.toLowerCase() ||
        nombreLimpio.toLowerCase() === `ce${data.numero}`.toLowerCase() ||
        nombreLimpio.length <= 4)
    ) {
      texto = descLimpia;
    } else if (
      nombreLimpio &&
      descLimpia &&
      !descLimpia.toLowerCase().includes(nombreLimpio.toLowerCase()) &&
      !nombreLimpio.toLowerCase().includes(descLimpia.toLowerCase())
    ) {
      texto = `${nombreLimpio} - ${descLimpia}`;
    } else {
      texto = nombreLimpio || descLimpia || '';
    }

    if (texto.toLowerCase().startsWith('ce ') || texto.toLowerCase().startsWith('ce.')) {
      return texto;
    }

    return texto ? `${numStr}: ${texto}` : numStr;
  };

  // Plantilla de renderizado para la columna principal con código y nombre en texto blanco
  const renderColumnaPrincipal = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const textoRA = obtenerTextoRA(node.data);
      return (
        <div
          className="inline-flex align-items-center gap-2 py-1"
          style={{ verticalAlign: 'middle', maxWidth: 'calc(100% - 2.5rem)', overflow: 'hidden' }}
        >
          <span
            className="font-bold text-xs bg-primary text-white border-round px-2 py-1 flex-shrink-0"
            style={{ color: '#ffffff' }}
          >
            RA {node.data.numero}
          </span>
          <span
            className="font-bold text-sm text-white cursor-help"
            style={{
              color: '#ffffff',
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

    // Renderizado para Criterio de Evaluación (CE)
    const textoCE = obtenerTextoCE(node.data);
    return (
      <div
        className="inline-flex align-items-center gap-2 pl-3 py-1"
        style={{ verticalAlign: 'middle', maxWidth: 'calc(100% - 2.5rem)', overflow: 'hidden' }}
      >
        <span
          className="font-semibold text-xs surface-300 text-white border-round px-2 py-1 flex-shrink-0"
          style={{ color: '#ffffff' }}
        >
          CE {node.data.numero}
        </span>
        <span
          className="text-sm text-white cursor-help"
          style={{
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block'
          }}
          title={textoCE}
        >
          {textoCE}
        </span>
      </div>
    );
  };

  // Plantilla de renderizado para la columna de Peso Porcentual con InputNumber
  const renderColumnaPeso = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const idRA = node.data.id_ra;
      const valorPeso = pesosRA[idRA] !== undefined ? pesosRA[idRA] : (node.data.peso || 0);

      return (
        <div className="flex align-items-center justify-content-center py-1">
          <InputNumber
            value={valorPeso}
            onValueChange={(e) => actualizarPesoRA(idRA, e.value)}
            min={0}
            max={100}
            suffix=" %"
            showButtons
            buttonLayout="horizontal"
            decrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
            incrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            className="w-full max-w-10rem text-center"
            inputClassName="text-center font-bold text-sm text-primary"
            tooltip="Peso porcentual de este RA en la nota final del módulo (0-100%)"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      );
    }

    // Renderizado para Criterio de Evaluación (CE)
    const idCE = node.data.id_ce;
    const valorPeso = pesosCE[idCE] !== undefined ? pesosCE[idCE] : (node.data.peso || 0);

    return (
      <div className="flex align-items-center justify-content-center py-1">
        <InputNumber
          value={valorPeso}
          onValueChange={(e) => actualizarPesoCE(idCE, e.value)}
          min={0}
          max={100}
          suffix=" %"
          showButtons
          buttonLayout="horizontal"
          decrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
          incrementButtonClassName="p-button-secondary p-button-text p-button-sm px-2"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
          className="w-full max-w-10rem text-center"
          inputClassName="text-center font-semibold text-sm"
          tooltip="Peso porcentual de este CE dentro de su RA padre (0-100%)"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Plantilla de renderizado para la columna de Validación / Suma de CEs / Aportación al módulo sin usar Tag
  const renderColumnaValidacion = (node) => {
    const esRA = node.data.tipo === 'RA';

    if (esRA) {
      const idRA = node.data.id_ra;
      const estado = estadoPorRA[idRA] || {
        totalCE: node.data.totalCE || 0,
        sumaCE: 0,
        esValido: true
      };

      if (estado.totalCE === 0) {
        return (
          <div className="flex align-items-center justify-content-center">
            <span className="text-xs text-white" style={{ color: '#ffffff' }}>
              Sin Criterios
            </span>
          </div>
        );
      }

      const esValido = estado.esValido;
      const icono = esValido ? 'pi-check' : 'pi-exclamation-triangle';
      const colorIcono = esValido ? 'text-green-400' : 'text-red-400';

      return (
        <div className="flex align-items-center justify-content-center gap-2">
          {/* Indicador por RA en texto blanco con icono de estado */}
          <span
            className="text-xs font-bold text-white flex align-items-center gap-1"
            style={{ color: '#ffffff' }}
            title={
              esValido
                ? 'Los criterios de este RA suman exactamente el 100%'
                : `Los criterios de este RA suman ${estado.sumaCE}% (deben sumar 100%)`
            }
          >
            <i className={`pi ${icono} ${colorIcono}`} />
            Suma CEs: {estado.sumaCE}%
          </span>

          {/* Botón rápido para repartir equitativamente los CE de este RA */}
          <Button
            type="button"
            icon="pi pi-sliders-h"
            size="small"
            severity="secondary"
            text
            className="p-1 text-xs text-white"
            onClick={() => repartirEquitativamenteCE(idRA)}
            tooltip="Repartir 100% equitativamente entre los CE de este RA"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      );
    }

    // Renderizado para CE: Cálculo de la aportación efectiva al módulo (peso RA * peso CE / 100) en texto blanco
    const idRA = node.data.id_ra;
    const idCE = node.data.id_ce;
    const pesoRA = pesosRA[idRA] !== undefined ? pesosRA[idRA] : 0;
    const pesoCE = pesosCE[idCE] !== undefined ? pesosCE[idCE] : (node.data.peso || 0);
    const aportacionModulo = ((pesoRA * pesoCE) / 100).toFixed(1);

    return (
      <div className="flex align-items-center justify-content-center">
        <span
          className="text-xs text-white font-medium"
          style={{ color: '#ffffff' }}
          title={`Cálculo: (${pesoRA}% RA × ${pesoCE}% CE) / 100 = ${aportacionModulo}% sobre la nota final`}
        >
          Aporta {aportacionModulo}% al módulo
        </span>
      </div>
    );
  };

  // Cabecera superior de la tabla con controles de expansión
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-sitemap text-primary text-lg" />
        <span className="font-bold text-color">
          Editor Jerárquico de Ponderación (Resultados y Criterios)
        </span>
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
        value={arbolPesos}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        header={cabeceraTabla}
        className="p-treetable-sm"
        emptyMessage="No se encontraron Resultados de Aprendizaje ni Criterios de Evaluación para este módulo."
        tableStyle={{ minWidth: '50rem' }}
      >
        {/* Columna 1: Estructura jerárquica de RA y CE con Expander */}
        <Column
          field="nombre"
          header="Resultado de Aprendizaje / Criterio de Evaluación"
          expander
          body={renderColumnaPrincipal}
          style={{ width: '50%' }}
        />

        {/* Columna 2: Peso Porcentual con InputNumber */}
        <Column
          field="peso"
          header="Peso Ponderado (%)"
          body={renderColumnaPeso}
          style={{ width: '25%', textAlign: 'center' }}
        />

        {/* Columna 3: Validación por RA (suma CEs) y aportación al módulo */}
        <Column
          header="Validación / Aportación"
          body={renderColumnaValidacion}
          style={{ width: '25%', textAlign: 'center' }}
        />
      </TreeTable>
    </Card>
  );
};

export default PesosRATreeTabla;
