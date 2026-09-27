import React from 'react';
import { Message } from 'primereact/message';

/**
 * MensajeSinPendientes - Componente presentacional para el estado de éxito sin calificaciones pendientes.
 *
 * Responsabilidad Única: Renderizar el aviso de tamaño grande y color verde utilizando el
 * componente Message de PrimeReact cuando no se detecten notas pendientes para la evaluación.
 *
 * @param {Object} props
 * @param {string} [props.nombreEvaluacion] - Nombre de la evaluación consultada (opcional para contexto).
 */
export const MensajeSinPendientes = ({ nombreEvaluacion }) => {
  // Contenido personalizado para lograr un tamaño grande y visualmente destacado
  const contenidoMensaje = (
    <div className="flex align-items-center gap-3 p-2">
      <i className="pi pi-check-circle text-4xl text-green-600 flex-shrink-0" />
      <div className="flex flex-column gap-1">
        <span className="text-xl md:text-2xl font-bold text-green-900">
          ¡Todo al día!
        </span>
        <span className="text-base md:text-lg text-green-800">
          {nombreEvaluacion && nombreEvaluacion !== 'todas'
            ? `No hay calificaciones pendientes para la evaluación ${nombreEvaluacion}.`
            : 'No hay calificaciones pendientes para esta clase en ninguna evaluación.'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full my-4">
      <Message
        severity="success"
        className="w-full p-4 border-round surface-card border-1 border-green-300 shadow-1 justify-content-start"
        content={contenidoMensaje}
      />
    </div>
  );
};

export default MensajeSinPendientes;
