import { useState, useEffect, useCallback } from 'react';
import {
  iniciarSesionConPassword,
  cerrarSesion as cerrarSesionServicio,
  obtenerSesionActual,
  suscribirCambiosSesion
} from '../services/sesionService.js';

// Hook personalizado para gestionar el estado global y las operaciones de sesión del usuario
const useSesion = () => {
  const [sesion, setSesion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Se inicializa y sincroniza el estado de la sesión al montar el hook
  useEffect(() => {
    let montado = true;

    const inicializarSesion = async () => {
      try {
        const { sesion: sesionActual, error: errorSesion } = await obtenerSesionActual();

        if (montado) {
          if (errorSesion) {
            setError(errorSesion);
          }
          setSesion(sesionActual);
          setUsuario(sesionActual?.user || null);
          setCargando(false);
        }
      } catch (err) {
        console.error('Error al inicializar la sesión del usuario:', err);
        if (montado) {
          setError(err.message || 'Error al verificar la sesión.');
          setCargando(false);
        }
      }
    };

    inicializarSesion();

    // Se suscribe a los cambios del estado de autenticación (inicios y cierres de sesión)
    const suscripcion = suscribirCambiosSesion((_evento, sesionModificada) => {
      if (montado) {
        setSesion(sesionModificada);
        setUsuario(sesionModificada?.user || null);
        setCargando(false);
      }
    });

    return () => {
      montado = false;
      if (suscripcion && typeof suscripcion.unsubscribe === 'function') {
        suscripcion.unsubscribe();
      }
    };
  }, []);

  // Se inicia la sesión mediante credenciales de correo electrónico y contraseña
  const iniciarSesion = useCallback(async (correo, password) => {
    setCargando(true);
    setError(null);

    const resultado = await iniciarSesionConPassword(correo, password);

    if (resultado.error) {
      setError(resultado.error);
      setCargando(false);
      return { exito: false, error: resultado.error };
    }

    setSesion(resultado.data?.session || null);
    setUsuario(resultado.data?.user || null);
    setCargando(false);

    return {
      exito: true,
      error: null,
      usuario: resultado.data?.user || null
    };
  }, []);

  // Se cierra la sesión activa del usuario
  const cerrarSesion = useCallback(async () => {
    setCargando(true);
    setError(null);

    const resultado = await cerrarSesionServicio();

    if (resultado.error) {
      setError(resultado.error);
      setCargando(false);
      return { exito: false, error: resultado.error };
    }

    setSesion(null);
    setUsuario(null);
    setCargando(false);

    return { exito: true, error: null };
  }, []);

  return {
    sesion,
    usuario,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado: Boolean(sesion)
  };
};

export default useSesion;
