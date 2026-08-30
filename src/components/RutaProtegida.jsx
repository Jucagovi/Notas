import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import useSesionContexto from '../hooks/useSesionContexto.js';

// Componente guardián que restringe el acceso a rutas protegidas solo a usuarios con sesión activa
const RutaProtegida = () => {
  const { estaAutenticado, cargando } = useSesionContexto();
  const location = useLocation();

  // Mientras se verifica el estado de la sesión, se muestra un indicador de carga
  if (cargando) {
    return (
      <div className="flex flex-column align-items-center justify-content-center min-h-screen gap-3">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
        <span className="text-muted text-sm font-medium">Verificando sesión...</span>
      </div>
    );
  }

  // Si no hay una sesión activa, se redirige a la página de inicio de sesión guardando la ruta previa
  if (!estaAutenticado) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado, se renderiza la jerarquía de rutas hijas
  return <Outlet />;
};

export default RutaProtegida;
