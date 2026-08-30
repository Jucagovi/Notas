import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

// Componente para la barra inferior de resumen estadístico y acción de guardado de pesos
const CriteriosResumen = ({
  practicaSeleccionada,
  estadisticas = {},
  hayCambiosSinGuardar = false,
  guardando = false,
  guardarAsignaciones
}) => {
  const { totalCEs = 0, totalSeleccionados = 0, promedioCobertura = 0 } = estadisticas;

  return (
    <Card className="shadow-2 border-1 surface-border mt-4">
      <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        {/* Métricas y resumen visual */}
        <div className="flex flex-wrap align-items-center gap-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-pie text-primary text-xl" />
            <div className="flex flex-column">
              <span className="text-xs text-muted font-bold uppercase">Criterios Seleccionados:</span>
              <span className="text-lg font-bold text-color">
                {totalSeleccionados} de {totalCEs} CE
              </span>
            </div>
          </div>

          <div className="border-left-1 surface-border pl-3 flex flex-column">
            <span className="text-xs text-muted font-bold uppercase">Cobertura Promedio:</span>
            <div className="flex align-items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {promedioCobertura}%
              </span>
              <Tag
                severity={totalSeleccionados === totalCEs ? 'success' : totalSeleccionados > 0 ? 'info' : 'secondary'}
                value={totalSeleccionados === totalCEs ? 'Módulo 100% Cubierto' : `${totalSeleccionados} Asignados`}
                className="text-xs"
              />
            </div>
          </div>

          {hayCambiosSinGuardar && (
            <div className="border-left-1 surface-border pl-3 flex align-items-center">
              <Tag
                severity="warning"
                icon="pi pi-exclamation-circle"
                value="Hay cambios pendientes de guardar"
                className="text-xs font-semibold"
              />
            </div>
          )}
        </div>

        {/* Botón principal de guardado */}
        <div className="flex align-items-center gap-2 justify-content-end">
          <Button
            type="button"
            label="Guardar peso"
            icon="pi pi-save"
            severity="primary"
            size="large"
            loading={guardando}
            disabled={!practicaSeleccionada || guardando}
            onClick={guardarAsignaciones}
            className="px-4 py-2 font-bold shadow-2"
            tooltip="Persistir en la base de datos solo los Criterios de Evaluación marcados"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </Card>
  );
};

export default CriteriosResumen;
