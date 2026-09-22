import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import useAuth from '../../hooks/useAuth.js';

// Componente envoltorio de rutas privadas para restringir el acceso a usuarios autenticados.
const RutaPrivada = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // Si la sesión está en proceso de verificación: se presenta una pantalla de espera con indicador visual.
  if (cargando) {
    return (
      <div className="min-h-screen flex flex-column align-items-center justify-content-center surface-ground gap-3">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
        <span className="text-600 text-sm font-medium">Comprobando autenticación...</span>
      </div>
    );
  }

  // Si no existe un usuario con sesión activa: se redirige al formulario de inicio de sesión.
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado: se renderizan los componentes hijos o el Outlet de la ruta.
  return children ? children : <Outlet />;
};

export default RutaPrivada;
