import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import useSesionContexto from '../hooks/useSesionContexto.js';
import useToast from '../hooks/useToast.js';

// Componente visual que contiene el formulario para el inicio de sesión del docente
const IniciarSesion = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  const { iniciarSesion } = useSesionContexto();
  const { mostrarExito, mostrarError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Ruta a la que se redirigirá tras iniciar sesión con éxito
  const rutaDestino = location.state?.from?.pathname || '/';

  // Se procesa el envío del formulario de autenticación
  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorValidacion('');

    // Validación básica de campos requeridos
    if (!correo.trim()) {
      setErrorValidacion('Por favor, introduzca su correo electrónico.');
      return;
    }

    if (!password) {
      setErrorValidacion('Por favor, introduzca su contraseña.');
      return;
    }

    setEnviando(true);

    try {
      const resultado = await iniciarSesion(correo.trim(), password);

      if (!resultado.exito) {
        const mensajeError = resultado.error || 'No se ha podido iniciar sesión. Compruebe sus credenciales.';
        setErrorValidacion(mensajeError);
        mostrarError('Error de autenticación', mensajeError);
        setEnviando(false);
        return;
      }

      mostrarExito('Bienvenido', 'Sesión iniciada correctamente.');
      navigate(rutaDestino, { replace: true });
    } catch (err) {
      console.error('Error durante el proceso de autenticación:', err);
      const mensajeExcepcion = 'Ha ocurrido un error inesperado al conectar con el servidor.';
      setErrorValidacion(mensajeExcepcion);
      mostrarError('Error del sistema', mensajeExcepcion);
      setEnviando(false);
    }
  };

  // Encabezado decorativo de la tarjeta de inicio de sesión
  const headerCard = (
    <div className="flex flex-column align-items-center justify-content-center pt-5 px-4 pb-2">
      <div className="surface-100 border-circle p-3 mb-3 flex align-items-center justify-content-center shadow-1">
        <i className="pi pi-lock text-primary text-3xl"></i>
      </div>
      <h2 className="text-2xl font-bold text-900 m-0 mb-1">Acceso Docente</h2>
      <p className="text-muted text-sm m-0 text-center">
        Introduzca sus credenciales de Supabase para acceder al sistema
      </p>
    </div>
  );

  return (
    <div className="login-wrapper flex align-items-center justify-content-center min-h-screen px-3 py-5">
      <Card
        header={headerCard}
        className="w-full shadow-4 border-round-xl"
        style={{ maxWidth: '440px' }}
      >
        {/* Mensaje de alerta en caso de error en la validación o credenciales incorrectas */}
        {errorValidacion && (
          <div className="mb-4">
            <Message
              severity="error"
              text={errorValidacion}
              className="w-full justify-content-start"
            />
          </div>
        )}

        <form onSubmit={manejarEnvio} className="flex flex-column gap-4">
          {/* Campo de Correo Electrónico */}
          <div className="flex flex-column gap-2">
            <label htmlFor="correo" className="text-sm font-semibold text-700">
              Correo Electrónico
            </label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope text-muted" />
              <InputText
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="docente@centroeducativo.es"
                className="w-full"
                autoComplete="email"
                disabled={enviando}
                autoFocus
              />
            </span>
          </div>

          {/* Campo de Contraseña */}
          <div className="flex flex-column gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-700">
              Contraseña
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              toggleMask
              feedback={false}
              className="w-full"
              inputClassName="w-full"
              autoComplete="current-password"
              disabled={enviando}
            />
          </div>

          <Divider className="my-2" />

          {/* Botón de Iniciar Sesión */}
          <Button
            type="submit"
            label={enviando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            icon={enviando ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            loading={enviando}
            className="w-full p-button-primary font-bold py-3 border-round-lg shadow-2"
          />
        </form>

        <div className="mt-4 pt-2 text-center">
          <span className="text-xs text-muted">
            Control de Notas • Sistema de Gestión Académica
          </span>
        </div>
      </Card>
    </div>
  );
};

export default IniciarSesion;
