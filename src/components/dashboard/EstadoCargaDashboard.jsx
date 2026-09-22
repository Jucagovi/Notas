import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

// Subcomponente para renderizar la interfaz de carga con esqueletos visuales (Skeleton) de PrimeReact.
const EstadoCargaDashboard = () => {
  return (
    <div className="w-full flex flex-column gap-4">
      {/* Esqueleto de tarjetas KPI */}
      <div className="grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 sm:col-6 lg:col-3">
            <Card className="shadow-1 border-round surface-card">
              <div className="flex justify-content-between align-items-start mb-2">
                <Skeleton width="60%" height="1rem" />
                <Skeleton shape="circle" size="2.5rem" />
              </div>
              <Skeleton width="40%" height="2rem" className="mb-2" />
              <Skeleton width="75%" height="0.8rem" />
            </Card>
          </div>
        ))}
      </div>

      {/* Esqueleto de gráficos */}
      <div className="grid">
        <div className="col-12 lg:col-7">
          <Card className="shadow-1 border-round surface-card">
            <Skeleton width="35%" height="1.5rem" className="mb-4" />
            <Skeleton width="100%" height="280px" />
          </Card>
        </div>
        <div className="col-12 lg:col-5">
          <Card className="shadow-1 border-round surface-card">
            <Skeleton width="45%" height="1.5rem" className="mb-4" />
            <Skeleton shape="circle" size="240px" className="mx-auto" />
          </Card>
        </div>
      </div>

      {/* Esqueleto de tabla de alertas */}
      <Card className="shadow-1 border-round surface-card">
        <div className="flex justify-content-between align-items-center mb-3">
          <Skeleton width="30%" height="1.5rem" />
          <Skeleton width="4rem" height="1.5rem" />
        </div>
        <Skeleton width="100%" height="2rem" className="mb-2" />
        <Skeleton width="100%" height="2rem" className="mb-2" />
        <Skeleton width="100%" height="2rem" />
      </Card>
    </div>
  );
};

export default EstadoCargaDashboard;
