import { supabase } from './supabaseClient.js';

// Servicio encargado de la comunicación con Supabase Auth para la gestión de sesiones de usuario

// Se inicia sesión mediante correo electrónico y contraseña
export const iniciarSesionConPassword = async (correo, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password
    });

    if (error) {
      console.error('Error al iniciar sesión en Supabase:', error);
      return {
        data: null,
        error: error.message || 'Credenciales incorrectas o error en el inicio de sesión.'
      };
    }

    return {
      data,
      error: null
    };
  } catch (err) {
    console.error('Excepción inesperada al iniciar sesión:', err);
    return {
      data: null,
      error: err.message || 'Error inesperado al conectar con el servicio de autenticación.'
    };
  }
};

// Se cierra la sesión activa del usuario actual
export const cerrarSesion = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar la sesión en Supabase:', error);
      return {
        error: error.message || 'Error al cerrar sesión.'
      };
    }

    return {
      error: null
    };
  } catch (err) {
    console.error('Excepción inesperada al cerrar sesión:', err);
    return {
      error: err.message || 'Error inesperado al cerrar sesión.'
    };
  }
};

// Se recupera la sesión activa almacenada localmente
export const obtenerSesionActual = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error al obtener la sesión actual:', error);
      return {
        sesion: null,
        error: error.message
      };
    }

    return {
      sesion: data.session,
      error: null
    };
  } catch (err) {
    console.error('Excepción inesperada al obtener la sesión:', err);
    return {
      sesion: null,
      error: err.message
    };
  }
};

// Se obtiene la información del usuario autenticado actualmente
export const obtenerUsuarioActual = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error al obtener el usuario autenticado:', error);
      return {
        usuario: null,
        error: error.message
      };
    }

    return {
      usuario: data.user,
      error: null
    };
  } catch (err) {
    console.error('Excepción inesperada al obtener el usuario:', err);
    return {
      usuario: null,
      error: err.message
    };
  }
};

// Se suscribe un observador para escuchar cambios en el estado de autenticación (login, logout, refresh)
export const suscribirCambiosSesion = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, sesion) => {
    callback(evento, sesion);
  });

  return subscription;
};

export default {
  iniciarSesionConPassword,
  cerrarSesion,
  obtenerSesionActual,
  obtenerUsuarioActual,
  suscribirCambiosSesion
};
