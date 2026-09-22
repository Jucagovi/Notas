import React from 'react';
import { Message } from 'primereact/message';

// Componente presentacional para advertir visualmente en tablas de relación y estructuras sensibles.
const AlertaTablaSensible = ({ nombreTabla }) => {
  return (
    <div className="w-full mb-3">
      <Message
        severity="warn"
        className="w-full justify-content-start border-round"
        content={
          <div className="flex align-items-center gap-3 py-1">
            <i className="pi pi-exclamation-triangle text-2xl text-orange-500" />
            <div className="flex flex-column">
              <span className="font-bold text-900">
                Atención: Tabla de Relación Sensible ({nombreTabla})
              </span>
              <span className="text-sm text-700">
                Las modificaciones directas en esta tabla afectan a la integridad referencial y al cálculo global de calificaciones y temporizaciones del sistema. Realiza cambios únicamente para auditorías o correcciones técnicas justificadas.
              </span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default AlertaTablaSensible;
