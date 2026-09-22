import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';

// Tarjeta presentacional para el panel de navegación y acceso a cada tabla en el panel central.
const TarjetaTablaHub = ({
  titulo,
  descripcion,
  icono = 'pi pi-table',
  ruta,
  esRelacion = false,
  nombreTabla
}) => {
  const navigate = useNavigate();

  const pie = (
    <div className="flex justify-content-end pt-2">
      <Button
        label={esRelacion ? 'Auditar' : 'Gestionar'}
        icon={esRelacion ? 'pi pi-shield' : 'pi pi-arrow-right'}
        iconPos="right"
        severity={esRelacion ? 'warning' : 'primary'}
        outlined
        onClick={() => navigate(ruta)}
        className="p-button-sm w-full"
      />
    </div>
  );

  return (
    <Card
      className="shadow-1 hover:shadow-3 transition-duration-200 border-1 surface-border h-full flex flex-column justify-content-between"
      footer={pie}
    >
      <div className="flex flex-column gap-2">
        <div className="flex align-items-center justify-content-between">
          <div className="flex align-items-center gap-2">
            <i className={`${icono} text-xl ${esRelacion ? 'text-orange-500' : 'text-primary'}`} />
            <span className="font-bold text-lg text-900">{titulo}</span>
          </div>
          {esRelacion && (
            <Tag value="Sensible" severity="warning" className="text-xs" />
          )}
        </div>
        <p className="text-secondary text-sm m-0 line-height-3" style={{ minHeight: '40px' }}>
          {descripcion}
        </p>
        <span className="text-xs font-mono text-500">
          Tabla: {nombreTabla}
        </span>
      </div>
    </Card>
  );
};

export default TarjetaTablaHub;
