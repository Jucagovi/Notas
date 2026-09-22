import React from 'react';

// Componente presentacional para la cabecera visual de la tarjeta de inicio de sesión.
const CabeceraLogin = () => {
  return (
    <div className="text-center mb-4">
      <div
        className="inline-flex align-items-center justify-content-center bg-primary-reverse border-circle mb-3 shadow-2"
        style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary-color, #3b82f6)' }}
      >
        <i className="pi pi-graduation-cap text-3xl text-white" />
      </div>
      <h2 className="text-2xl font-bold text-900 m-0 mb-1">
        Administración Académica
      </h2>
      <p className="text-500 text-sm m-0">
        Control de Notas y Gestión Docente
      </p>
    </div>
  );
};

export default CabeceraLogin;
