import React, { createContext, useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';

export const ToastContext = createContext(null);

// Proveedor de estado global para notificaciones Toast de PrimeReact.
export const ToastProveedor = ({ children }) => {
  const toastRef = useRef(null);

  // Muestra una notificación genérica en la interfaz.
  const mostrarToast = useCallback(({ severity = 'info', summary = '', detail = '', life = 3000 }) => {
    if (toastRef.current) {
      toastRef.current.show({ severity, summary, detail, life });
    }
  }, []);

  // Notificación de operación exitosa.
  const mostrarExito = useCallback((mensaje, titulo = 'Éxito') => {
    mostrarToast({ severity: 'success', summary: titulo, detail: mensaje, life: 3000 });
  }, [mostrarToast]);

  // Notificación de error en la operación.
  const mostrarError = useCallback((mensaje, titulo = 'Error') => {
    mostrarToast({ severity: 'error', summary: titulo, detail: mensaje, life: 5000 });
  }, [mostrarToast]);

  // Notificación informativa para el usuario.
  const mostrarInfo = useCallback((mensaje, titulo = 'Información') => {
    mostrarToast({ severity: 'info', summary: titulo, detail: mensaje, life: 3000 });
  }, [mostrarToast]);

  // Notificación de advertencia o precaución.
  const mostrarAdvertencia = useCallback((mensaje, titulo = 'Atención') => {
    mostrarToast({ severity: 'warn', summary: titulo, detail: mensaje, life: 4000 });
  }, [mostrarToast]);

  const valor = {
    mostrarToast,
    mostrarExito,
    mostrarError,
    mostrarInfo,
    mostrarAdvertencia
  };

  return (
    <ToastContext.Provider value={valor}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProveedor;
