import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';

// PrimeReact 10 Theme and Core Styles
import 'primereact/resources/themes/nano/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './index.css';
import App from './App.jsx';

// Application root is mounted with PrimeReactProvider configured with Nano theme
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
