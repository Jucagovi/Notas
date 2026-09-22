import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import useAuth from '../../hooks/useAuth.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';

// Componente Cabecera (Header / Topbar) de la aplicación.
const Cabecera = ({ onAbrirMenuMovil }) => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { mostrarInfo } = useGlobalToast();

  // Se extraen los datos del usuario autenticado o valores predeterminados.
  const correoUsuario = usuario?.email || 'Docente';
  const nombreUsuario = usuario?.user_metadata?.nombre || correoUsuario;
  const rolUsuario = usuario?.user_metadata?.rol || 'Docente / Administrador';

  // Se calculan las dos primeras letras como iniciales del avatar.
  const inicialesUsuario = (usuario?.user_metadata?.nombre
    ? usuario.user_metadata.nombre.substring(0, 2)
    : correoUsuario.substring(0, 2)
  ).toUpperCase();

  // Se gestiona el cierre de la sesión activa en Supabase.
  const manejarCierreSesion = async () => {
    try {
      await logout();
      mostrarInfo('Ha cerrado la sesión correctamente.', 'Sesión finalizada');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión desde la cabecera:', err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-start">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={onAbrirMenuMovil}
          aria-label="Abrir menú de navegación"
        >
          <i className="pi pi-bars"></i>
        </button>
        <div className="app-branding">
          <i className="pi pi-graduation-cap brand-icon"></i>
          <span className="brand-title">Administración Académica</span>
        </div>
      </div>

      <div className="header-end">
        <div className="user-profile">
          <Avatar
            label={inicialesUsuario}
            shape="circle"
            className="user-avatar font-bold"
          />
          <div className="user-info">
            <span className="user-name">{nombreUsuario}</span>
            <span className="user-role">{rolUsuario}</span>
          </div>
        </div>
        <Button
          type="button"
          icon="pi pi-sign-out"
          label="Salir"
          size="small"
          severity="secondary"
          text
          className="logout-btn"
          onClick={manejarCierreSesion}
        />
      </div>
    </header>
  );
};

export default Cabecera;
