import React from 'react';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';

// Componente de página para la sección Acerca de
const AcercaDePagina = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Acerca de</h1>
      <Divider />
      <div className="page-content">
        <Card title="Control de Notas">
          <p className="m-0 text-muted">Versión 1.0.0 — Sistema integral para gestión académica docente.</p>
        </Card>
      </div>
    </div>
  );
};

export default AcercaDePagina;
