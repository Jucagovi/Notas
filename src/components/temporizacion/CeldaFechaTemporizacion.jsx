import React from 'react';
import { Calendar } from 'primereact/calendar';
import { parsearFechaISO, formatearFechaISO } from '../../utils/fechas.js';

/**
 * CeldaFechaTemporizacion - Componente para la edición en línea de fechas dentro de la tabla.
 *
 * Responsabilidad Única: Renderizar el control Calendar de PrimeReact adaptando las fechas
 * en formato ISO a objetos Date de JavaScript y emitiendo la cadena formateada resultante.
 *
 * @param {Object} props
 * @param {string|null} props.valor - Fecha en formato 'YYYY-MM-DD' o null.
 * @param {Function} props.onChange - Callback que recibe la nueva fecha en formato 'YYYY-MM-DD' o null.
 * @param {boolean} [props.disabled=false] - Indicador de campo deshabilitado.
 * @param {string} [props.placeholder='dd/mm/aaaa'] - Texto de marcador de posición.
 * @param {Date} [props.minDate] - Fecha mínima permitida.
 * @param {Date} [props.maxDate] - Fecha máxima permitida.
 */
export const CeldaFechaTemporizacion = ({
  valor,
  onChange,
  disabled = false,
  placeholder = 'dd/mm/aaaa',
  minDate = null,
  maxDate = null
}) => {
  // Se convierte la cadena ISO de la base de datos a objeto Date en hora local.
  const fechaObjeto = valor ? parsearFechaISO(valor) : null;

  // Manejo del cambio de fecha en el control Calendar.
  const manejarCambio = (e) => {
    const nuevaFecha = e.value;
    if (!nuevaFecha) {
      onChange(null);
      return;
    }
    const cadenaISO = formatearFechaISO(nuevaFecha);
    onChange(cadenaISO);
  };

  return (
    <div
      className="flex align-items-center gap-1 w-full"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Calendar
        value={fechaObjeto}
        onChange={manejarCambio}
        dateFormat="dd/mm/yy"
        showIcon
        firstDayOfWeek={1}
        placeholder={placeholder}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className="p-inputtext-sm w-full"
        inputClassName="text-xs p-1"
        panelClassName="text-sm"
      />
      {valor && !disabled && (
        <button
          type="button"
          className="p-link text-color-secondary hover:text-danger p-1 flex-shrink-0"
          onClick={() => onChange(null)}
          title="Borrar fecha"
        >
          <i className="pi pi-times text-xs" />
        </button>
      )}
    </div>
  );
};

export default CeldaFechaTemporizacion;
