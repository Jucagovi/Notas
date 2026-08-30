import React, { createContext, useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';

// Contexto global para el sistema de notificaciones Toast
export const Contexto = createContext(null);

// Componente contenedor que provee el sistema de notificaciones accesible en toda la aplicación
const ToastContexto = ({ children }) => {
  const toastRef = useRef(null);

  // Se muestra una notificación con configuración personalizada
  const mostrarToast = useCallback(({ severity = 'info', summary = '', detail = '', life = 3000 }) => {
    if (toastRef.current) {
      toastRef.current.show({
        severity,
        summary,
        detail,
        life
      });
    }
  }, []);

  // Se muestra una notificación de éxito
  const mostrarExito = useCallback((summary = 'Operación exitosa', detail = '') => {
    mostrarToast({ severity: 'success', summary, detail, life: 3000 });
  }, [mostrarToast]);

  // Se muestra una notificación de error
  const mostrarError = useCallback((summary = 'Error en la operación', detail = '') => {
    mostrarToast({ severity: 'error', summary, detail, life: 4500 });
  }, [mostrarToast]);

  // Se muestra una notificación informativa
  const mostrarInfo = useCallback((summary = 'Información', detail = '') => {
    mostrarToast({ severity: 'info', summary, detail, life: 3000 });
  }, [mostrarToast]);

  // Se muestra una notificación de advertencia
  const mostrarAdvertencia = useCallback((summary = 'Advertencia', detail = '') => {
    mostrarToast({ severity: 'warn', summary, detail, life: 3500 });
  }, [mostrarToast]);

  const valorContexto = {
    mostrarToast,
    mostrarExito,
    mostrarError,
    mostrarInfo,
    mostrarAdvertencia
  };

  return (
    <Contexto.Provider value={valorContexto}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </Contexto.Provider>
  );
};

export default ToastContexto;
