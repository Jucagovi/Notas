import React from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

// Cabecera superior para las páginas de mantenimiento de tablas individuales.
const CabeceraMantenimiento = ({
  titulo,
  descripcion,
  icono = 'pi pi-table',
  esRelacion = false,
  nombreTabla
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-3 pb-3 border-bottom-1 surface-border mb-3">
      <div className="flex align-items-center gap-3">
        <div className="surface-100 p-3 border-round text-primary flex align-items-center justify-content-center">
          <i className={`${icono} text-2xl`} />
        </div>
        <div>
          <div className="flex align-items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold m-0 text-900">{titulo}</h1>
            <Tag
              value={esRelacion ? 'Tabla de Relación' : 'Tabla Maestra'}
              severity={esRelacion ? 'warning' : 'success'}
              icon={esRelacion ? 'pi pi-shield' : 'pi pi-check'}
            />
            {nombreTabla && (
              <span className="text-xs font-mono bg-surface-200 px-2 py-1 border-round text-600">
                {nombreTabla}
              </span>
            )}
          </div>
          <p className="text-secondary m-0 mt-1 text-sm">{descripcion}</p>
        </div>
      </div>

      <Button
        label="Volver a Herramientas"
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        onClick={() => navigate('/herramientas')}
        className="p-button-sm"
      />
    </div>
  );
};

export default CabeceraMantenimiento;
