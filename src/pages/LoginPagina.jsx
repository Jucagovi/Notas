import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import TarjetaLogin from '../components/autenticacion/TarjetaLogin.jsx';

// Página orquestadora de inicio de sesión que gestiona la autenticación y notificaciones.
const LoginPagina = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, cargando: cargandoSesion, login } = useAuth();
  const { mostrarError, mostrarExito, mostrarAdvertencia } = useGlobalToast();

  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Si ya existe una sesión iniciada: se redirige automáticamente al usuario a la página principal.
  const rutaDestino = location.state?.from?.pathname || '/dashboard';
  if (!cargandoSesion && usuario) {
    return <Navigate to={rutaDestino} replace />;
  }

  // Manejador del evento de envío del formulario de credenciales.
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    // Se validan los campos antes de contactar con el servicio de autenticación.
    if (!correo.trim() || !clave.trim()) {
      mostrarAdvertencia('Por favor, introduzca el correo electrónico y la contraseña.', 'Campos requeridos');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await login(correo.trim(), clave);

      // Si la autenticación falla: se muestra notificación toast y se informa del motivo.
      if (!resultado.ok) {
        let mensajeError = 'No se ha podido iniciar sesión. Compruebe los datos ingresados.';
        const errorMsg = resultado.error?.message || '';

        if (errorMsg.includes('Invalid login credentials')) {
          mensajeError = 'Credenciales no válidas: revise el correo o la contraseña proporcionados.';
        } else if (errorMsg.includes('Email not confirmed')) {
          mensajeError = 'La cuenta de correo todavía no ha sido confirmada.';
        }

        mostrarError(mensajeError, 'Error de autenticación');
        return;
      }

      // Si la autenticación es satisfactoria: se notifica al usuario y se redirige a la ruta solicitada.
      mostrarExito('Bienvenido al sistema de administración docente.', 'Sesión iniciada');
      navigate(rutaDestino, { replace: true });
    } catch (err) {
      console.error('Error no controlado al iniciar sesión:', err);
      mostrarError('Se ha producido un error inesperado al procesar la solicitud.', 'Error del sistema');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-wrapper flex align-items-center justify-content-center min-h-screen p-3">
      <TarjetaLogin
        correo={correo}
        clave={clave}
        alCambiarCorreo={setCorreo}
        alCambiarClave={setClave}
        alEnviar={manejarEnvio}
        cargando={enviando || cargandoSesion}
      />
    </div>
  );
};

export default LoginPagina;
