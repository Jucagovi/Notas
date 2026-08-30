import React from 'react';
import { Navigate } from 'react-router-dom';
import IniciarSesion from '../components/IniciarSesion.jsx';
import useSesionContexto from '../hooks/useSesionContexto.js';

// Componente de página para el inicio de sesión de usuarios
const IniciarSesionPagina = () => {
  const { estaAutenticado, cargando } = useSesionContexto();

  // Si el usuario ya está autenticado y la sesión no está cargando, se redirige al inicio
  if (!cargando && estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return <IniciarSesion />;
};

export default IniciarSesionPagina;
