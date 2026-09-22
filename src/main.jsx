import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import TemaProveedor from './context/TemaContexto.jsx';
import ToastProveedor from './context/ToastContext.jsx';
import AuthProveedor from './context/AuthContext.jsx';
import { configurarLocaleEspanol } from './utils/configuracionCalendario.js';

// Inicialización de la configuración regional española para calendarios y fechas.
configurarLocaleEspanol();

// Hojas de estilo de PrimeReact core, PrimeIcons y utilidades de PrimeFlex
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './index.css';

import App from './App.jsx';

// Configuración global del proveedor de PrimeReact con efecto ripple activado y localización en castellano.
const configuracionPrimeReact = {
  ripple: true,
  locale: 'es'
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TemaProveedor>
      <PrimeReactProvider value={configuracionPrimeReact}>
        <ToastProveedor>
          <AuthProveedor>
            <App />
          </AuthProveedor>
        </ToastProveedor>
      </PrimeReactProvider>
    </TemaProveedor>
  </React.StrictMode>
);
