import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';

export const AuthContext = createContext(null);

// Proveedor de estado global para la autenticación de usuarios mediante Supabase.
export const AuthProveedor = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Se inicializa la sesión y se suscribe a los cambios del estado de autenticación.
  useEffect(() => {
    let activo = true;

    // Se obtiene la sesión almacenada en el cliente al cargar la aplicación.
    const obtenerSesionInicial = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error al recuperar sesión inicial:', error);
        }
        if (activo) {
          setSesion(data?.session ?? null);
          setUsuario(data?.session?.user ?? null);
        }
      } catch (err) {
        console.error('Error inesperado al comprobar la sesión inicial:', err);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    obtenerSesionInicial();

    // Se escucha cualquier cambio de estado en la sesión: inicio, cierre o renovación del token.
    const { data: authListener } = supabase.auth.onAuthStateChange((_evento, sesionActual) => {
      if (activo) {
        setSesion(sesionActual);
        setUsuario(sesionActual?.user ?? null);
        setCargando(false);
      }
    });

    return () => {
      activo = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Función para autenticar al usuario mediante correo y contraseña.
  const login = useCallback(async (email, password) => {
    setCargando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error durante la autenticación de usuario:', error);
        return { ok: false, error };
      }

      setSesion(data.session);
      setUsuario(data.user);
      return { ok: true, data };
    } catch (err) {
      console.error('Excepción no controlada durante el inicio de sesión:', err);
      return { ok: false, error: err };
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para finalizar la sesión activa del usuario.
  const logout = useCallback(async () => {
    setCargando(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error durante el cierre de sesión en Supabase:', error);
        return { ok: false, error };
      }

      setSesion(null);
      setUsuario(null);
      return { ok: true };
    } catch (err) {
      console.error('Excepción no controlada durante el cierre de sesión:', err);
      return { ok: false, error: err };
    } finally {
      setCargando(false);
    }
  }, []);

  // Objeto con las propiedades y métodos expuestos a través del contexto.
  const valor = {
    usuario,
    user: usuario,
    sesion,
    session: sesion,
    cargando,
    loading: cargando,
    login,
    iniciarSesion: login,
    logout,
    cerrarSesion: logout
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProveedor;
