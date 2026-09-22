import React from 'react';
import { Card } from 'primereact/card';
import CabeceraLogin from './CabeceraLogin.jsx';
import FormularioLogin from './FormularioLogin.jsx';

// Componente estructurado en tarjeta Card de PrimeReact para albergar la interfaz de acceso.
const TarjetaLogin = ({
  correo,
  clave,
  alCambiarCorreo,
  alCambiarClave,
  alEnviar,
  cargando
}) => {
  // Pie informativo de la tarjeta con aviso de seguridad institucional.
  const pieTarjeta = (
    <div className="text-center pt-3 border-top-1 surface-border">
      <div className="flex align-items-center justify-content-center gap-2 text-500 text-xs">
        <i className="pi pi-shield text-primary" />
        <span>Acceso restringido para personal docente y administrativo.</span>
      </div>
    </div>
  );

  return (
    <Card
      className="shadow-3 w-full border-round-xl"
      style={{ maxWidth: '400px' }}
      footer={pieTarjeta}
    >
      <CabeceraLogin />
      <FormularioLogin
        correo={correo}
        clave={clave}
        alCambiarCorreo={alCambiarCorreo}
        alCambiarClave={alCambiarClave}
        alEnviar={alEnviar}
        cargando={cargando}
      />
    </Card>
  );
};

export default TarjetaLogin;
