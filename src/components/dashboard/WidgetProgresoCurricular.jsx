import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * WidgetProgresoCurricular - Componente presentacional para la visión global del temario.
 *
 * Responsabilidad Única: Renderizar barras de progreso comparando el avance real
 * (Unidades de Trabajo terminadas) frente al progreso teórico estimado por temporización.
 *
 * @param {Object} props
 * @param {Array<Object>} props.progresoModulos - Lista de progresos curriculares por módulo.
 */
export const WidgetProgresoCurricular = ({ progresoModulos = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-bar text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Progreso Curricular</h2>
              <span className="text-xs text-color-secondary">Avance real frente al marco teórico planificado</span>
            </div>
          </div>
          <Button
            label="Temporización"
            icon="pi pi-sliders-h"
            size="small"
            outlined
            onClick={() => navigate('/temporizacion')}
            tooltip="Ajustar temporización"
            tooltipOptions={{ position: 'top' }}
          />
        </div>

        {/* Lista de módulos con barras comparativas */}
        {progresoModulos.length === 0 ? (
          <EstadoVacio
            mensaje="Sin datos curriculares"
            descripcion="No constan Unidades de Trabajo temporizadas en los módulos del curso."
            icono="pi pi-folder-open"
            className="my-2 p-4"
          />
        ) : (
          <div className="flex flex-column gap-3 overflow-y-auto" style={{ maxHeight: '340px' }}>
            {progresoModulos.map((modulo) => (
              <div
                key={modulo.id_modulo}
                className="p-3 border-round surface-50 border-1 surface-border flex flex-column gap-2"
              >
                {/* Cabecera del módulo */}
                <div className="flex align-items-center justify-content-between">
                  <div className="flex align-items-center gap-2">
                    <span className="font-bold text-sm text-900">{modulo.siglas}</span>
                    <span className="text-xs text-color-secondary hidden sm:inline">
                      {modulo.nombre}
                    </span>
                  </div>
                  <Tag
                    value={modulo.estadoTexto}
                    severity={modulo.estadoColor}
                    className="text-xs font-semibold"
                  />
                </div>

                {/* Barra de progreso real */}
                <div className="flex flex-column gap-1">
                  <div className="flex justify-content-between text-xs">
                    <span className="text-700 font-medium">
                      Avance real ({modulo.completadas}/{modulo.totalUTs} UT terminadas)
                    </span>
                    <span className="font-bold text-900">{modulo.avanceReal}%</span>
                  </div>
                  <ProgressBar
                    value={modulo.avanceReal}
                    showValue={false}
                    style={{ height: '8px' }}
                    color="#2563eb"
                  />
                </div>

                {/* Barra de progreso teórico */}
                <div className="flex flex-column gap-1">
                  <div className="flex justify-content-between text-xs text-color-secondary">
                    <span>Progreso teórico según calendario</span>
                    <span>{modulo.avanceTeorico}%</span>
                  </div>
                  <ProgressBar
                    value={modulo.avanceTeorico}
                    showValue={false}
                    style={{ height: '5px' }}
                    color="#9ca3af"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie del widget */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-between align-items-center">
        <span className="text-xs text-color-secondary">
          {progresoModulos.length} módulos evaluados
        </span>
        <Button
          label="Ver Programación"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/planificacion/programacion')}
        />
      </div>
    </div>
  );
};

export default WidgetProgresoCurricular;
