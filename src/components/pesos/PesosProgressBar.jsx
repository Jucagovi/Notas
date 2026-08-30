import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';

// Componente visual grueso para representar en tiempo real el porcentaje total acumulado de pesos
const PesosProgressBar = ({
  sumaTotalPesos = 0,
  pesoRestante = 100,
  estadoBalanceo = 'incompleto',
  totalPracticas = 0
}) => {
  // Configuración dinámica del color y estilos según el estado de balanceo
  let colorBarra = '#f97316'; // Naranja por defecto (< 100)
  let severidadTag = 'warning';
  let iconoEstado = 'pi pi-exclamation-triangle';
  let tituloEstado = 'Balanceo incompleto';
  let mensajeDetalle = `Falta un ${pesoRestante}% por distribuir para alcanzar el 100% requerido.`;

  if (estadoBalanceo === 'valido') {
    colorBarra = '#22c55e'; // Verde (=== 100)
    severidadTag = 'success';
    iconoEstado = 'pi pi-check-circle';
    tituloEstado = 'Balanceo correcto (100%)';
    mensajeDetalle = 'La suma de las prácticas es exactamente 100%. Los pesos están listos para ser guardados.';
  } else if (estadoBalanceo === 'excedido') {
    colorBarra = '#ef4444'; // Rojo (> 100)
    severidadTag = 'danger';
    iconoEstado = 'pi pi-times-circle';
    tituloEstado = `Límite superado (${sumaTotalPesos}%)`;
    mensajeDetalle = `Hay un exceso de ${Math.abs(pesoRestante)}%. Debe reducir los pesos hasta sumar exactamente el 100% para poder guardar.`;
  } else if (estadoBalanceo === 'vacio') {
    colorBarra = '#94a3b8'; // Gris
    severidadTag = 'info';
    iconoEstado = 'pi pi-info-circle';
    tituloEstado = 'Sin prácticas';
    mensajeDetalle = 'No hay prácticas vinculadas a esta evaluación para balancear.';
  }

  // Plantilla personalizada para el texto central de la barra de progreso
  const plantillaValor = () => {
    return (
      <span className="font-bold text-base text-white px-2 shadow-1">
        {sumaTotalPesos}% / 100%
      </span>
    );
  };

  return (
    <div className="surface-card p-3 sm:p-4 border-round shadow-2 mb-4 border-1 surface-border">
      {/* Cabecera del indicador con etiquetas de estado */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-chart-pie text-xl text-primary" />
          <span className="text-lg font-bold text-color">Balanceo Total de la Evaluación</span>
        </div>

        <div className="flex align-items-center gap-2 flex-wrap">
          <Tag
            severity={severidadTag}
            icon={iconoEstado}
            value={tituloEstado}
            className="text-sm px-3 py-1 font-bold"
          />
          <Tag
            severity="secondary"
            value={`${totalPracticas} Práctica${totalPracticas === 1 ? '' : 's'}`}
            className="text-sm px-2 py-1"
          />
        </div>
      </div>

      {/* Componente ProgressBar grueso de PrimeReact con color dinámico */}
      <div className="mb-2">
        <ProgressBar
          value={Math.min(sumaTotalPesos, 100)}
          color={colorBarra}
          displayValueTemplate={plantillaValor}
          style={{ height: '28px', borderRadius: '14px', overflow: 'hidden' }}
        />
      </div>

      {/* Mensaje descriptivo inferior en función del estado de la suma */}
      <div className="flex align-items-center gap-2 text-sm text-muted pt-1">
        <i className={`${iconoEstado} text-${severidadTag}`} />
        <span>{mensajeDetalle}</span>
      </div>
    </div>
  );
};

export default PesosProgressBar;
