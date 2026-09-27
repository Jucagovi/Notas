import React from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

/**
 * TarjetaKpiPendientes - Componente presentacional KPI para el conteo de notas pendientes en el Dashboard.
 *
 * Responsabilidad Única: Renderizar una tarjeta analítica destacada con el recuento total de
 * calificaciones pendientes y ofrecer un acceso directo al informe de control de calificaciones pendientes.
 *
 * @param {Object} props
 * @param {number} [props.conteo=0] - Número total de calificaciones pendientes en el curso activo.
 * @param {boolean} [props.cargando=false] - Indicador de carga.
 */
export const TarjetaKpiPendientes = ({ conteo = 0, cargando = false }) => {
  const navigate = useNavigate();

  const hayPendientes = conteo > 0;

  return (
    <div className="surface-card p-3 border-round border-1 surface-border shadow-1 flex align-items-center justify-content-between">
      <div className="flex align-items-center gap-3">
        <div
          className={`w-3rem h-3rem border-circle flex align-items-center justify-content-center flex-shrink-0 ${
            hayPendientes ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
          }`}
        >
          <i
            className={`text-xl ${
              hayPendientes ? 'pi pi-clock' : 'pi pi-check-circle'
            }`}
          />
        </div>

        <div>
          <div className="flex align-items-center gap-2">
            <span className="text-sm font-semibold text-700">
              Calificaciones pendientes
            </span>
            <Tag
              value={hayPendientes ? `${conteo} pendientes` : 'Al día'}
              severity={hayPendientes ? 'warning' : 'success'}
              className="text-xs bg-transparent border-1 font-semibold"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
          <p className="text-xs text-color-secondary m-0 mt-1">
            {hayPendientes
              ? 'Existen entregas o actividades pendientes de calificar.'
              : 'Todas las actividades evaluables tienen calificación.'}
          </p>
        </div>
      </div>

      <Button
        label="Ver informe"
        icon="pi pi-arrow-right"
        iconPos="right"
        size="small"
        text
        onClick={() => navigate('/informes/pendientes')}
        className="p-button-sm text-xs font-semibold flex-shrink-0 ml-2"
        aria-label="Abrir informe de calificaciones pendientes"
      />
    </div>
  );
};

export default TarjetaKpiPendientes;
