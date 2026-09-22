import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearFechaISO, parsearFechaISO } from '../../utils/fechas.js';

/**
 * DialogoRangoFestivos - Modal para añadir masivamente un intervalo de días no lectivos (vacaciones o puentes).
 *
 * Responsabilidad Única: Capturar los datos de un rango temporal con inputs nativos de tipo date
 * y delegar la adición masiva a la función contenedora.
 */
export const DialogoRangoFestivos = ({
  visible,
  onOcultar,
  onConfirmar,
  fechaMinima,
  fechaMaxima
}) => {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [soloLaborables, setSoloLaborables] = useState(true);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Limpieza del formulario al cerrar el diálogo modal.
  const reiniciarFormulario = () => {
    setDesde(null);
    setHasta(null);
    setDescripcion('');
    setSoloLaborables(true);
    setErrorValidacion('');
    onOcultar();
  };

  // Validación y confirmación del rango de fechas.
  const manejarConfirmar = () => {
    if (!desde || !hasta) {
      setErrorValidacion('Debe seleccionar tanto la fecha inicial como la fecha final del periodo.');
      return;
    }

    if (desde > hasta) {
      setErrorValidacion('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    onConfirmar(desde, hasta, descripcion.trim(), soloLaborables);
    reiniciarFormulario();
  };

  const pieDialogo = (
    <div className="flex align-items-center justify-content-end gap-2 pt-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={reiniciarFormulario}
      />
      <BotonAccion
        tipo="guardar"
        label="Añadir al Calendario"
        icon="pi pi-plus"
        onClick={manejarConfirmar}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={reiniciarFormulario}
      header="Añadir Periodo Vacacional / Festivo"
      footer={pieDialogo}
      modal
      className="p-fluid w-11 sm:w-8 md:w-6 lg:w-4"
    >
      <div className="flex flex-column gap-3 pt-2">
        <p className="text-secondary text-sm m-0">
          Seleccione un intervalo continuo de días para marcarlos como no lectivos (por ejemplo: vacaciones de Navidad, Semana Santa o puentes escolares).
        </p>

        {errorValidacion && (
          <div className="p-message p-message-error py-2 px-3 text-xs border-round">
            <span className="p-message-text">{errorValidacion}</span>
          </div>
        )}

        {/* Fecha desde con input nativo date */}
        <div>
          <label htmlFor="rango-fecha-desde" className="block text-900 font-semibold mb-1 text-sm">
            Fecha de Inicio del Periodo
          </label>
          <InputText
            id="rango-fecha-desde"
            type="date"
            value={formatearFechaISO(desde)}
            onChange={(e) => {
              setDesde(parsearFechaISO(e.target.value));
              setErrorValidacion('');
            }}
            min={formatearFechaISO(fechaMinima) || undefined}
            max={formatearFechaISO(fechaMaxima) || undefined}
            className="w-full"
          />
        </div>

        {/* Fecha hasta con input nativo date */}
        <div>
          <label htmlFor="rango-fecha-hasta" className="block text-900 font-semibold mb-1 text-sm">
            Fecha de Fin del Periodo
          </label>
          <InputText
            id="rango-fecha-hasta"
            type="date"
            value={formatearFechaISO(hasta)}
            onChange={(e) => {
              setHasta(parsearFechaISO(e.target.value));
              setErrorValidacion('');
            }}
            min={formatearFechaISO(desde || fechaMinima) || undefined}
            max={formatearFechaISO(fechaMaxima) || undefined}
            className="w-full"
          />
        </div>

        {/* Descripción o motivo */}
        <div>
          <label htmlFor="rango-descripcion" className="block text-900 font-semibold mb-1 text-sm">
            Motivo o Nombre del Periodo (Opcional)
          </label>
          <InputText
            id="rango-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Vacaciones de Navidad, Semana Santa, Carnavales"
            className="w-full"
          />
        </div>

        {/* Opción de excluir fines de semana */}
        <div className="flex align-items-center gap-2 pt-1">
          <Checkbox
            inputId="rango-solo-laborables"
            checked={soloLaborables}
            onChange={(e) => setSoloLaborables(e.checked)}
          />
          <label htmlFor="rango-solo-laborables" className="text-sm text-700 cursor-pointer">
            Marcar únicamente días laborables (omitir sábados y domingos)
          </label>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoRangoFestivos;
