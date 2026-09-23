import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearFechaISO, parsearFechaISO } from '../../utils/fechas.js';
import { LISTA_TIPOS_EVENTO } from '../../utils/coloreCalendario.js';

/**
 * DialogoRangoEventos - Diálogo modal para incorporar un intervalo de días continuos al calendario.
 *
 * Responsabilidad Única: Capturar el tipo de evento, fechas límite, motivo opcional y preferencia de días laborables,
 * delegando la persistencia en Calendario_Eventos a la función contenedora.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Control de visibilidad del modal.
 * @param {Function} props.onOcultar - Callback para cerrar el modal.
 * @param {Function} props.onConfirmar - Callback con (desde, hasta, tipoEvento, descripcion, soloLaborables).
 * @param {Date|null} [props.fechaMinima] - Límite inferior de selección.
 * @param {Date|null} [props.fechaMaxima] - Límite superior de selección.
 * @param {boolean} [props.cargando=false] - Indicador de guardado en curso.
 */
export const DialogoRangoEventos = ({
  visible,
  onOcultar,
  onConfirmar,
  fechaMinima,
  fechaMaxima,
  cargando = false
}) => {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [tipoEvento, setTipoEvento] = useState('Vacaciones');
  const [descripcion, setDescripcion] = useState('');
  const [soloLaborables, setSoloLaborables] = useState(true);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Limpieza del estado al descartar el formulario.
  const reiniciarFormulario = () => {
    setDesde(null);
    setHasta(null);
    setTipoEvento('Vacaciones');
    setDescripcion('');
    setSoloLaborables(true);
    setErrorValidacion('');
    onOcultar();
  };

  // Validación y delegación de la creación del rango.
  const manejarConfirmar = () => {
    if (!desde || !hasta) {
      setErrorValidacion('Debe seleccionar tanto la fecha inicial como la fecha final del periodo.');
      return;
    }

    if (desde > hasta) {
      setErrorValidacion('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    onConfirmar(desde, hasta, tipoEvento, descripcion.trim(), soloLaborables);
    reiniciarFormulario();
  };

  // Plantilla visual para las opciones del desplegable con chip de color.
  const plantillaOpcionTipo = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center gap-2 py-1">
        <span
          className="w-1rem h-1rem border-round inline-block flex-shrink-0"
          style={{ backgroundColor: opcion.color }}
        />
        <span className="font-semibold text-900 text-sm">{opcion.tipo}</span>
        <span className={`text-xs ${opcion.esLectivo ? 'text-green-600' : 'text-red-500'}`}>
          ({opcion.esLectivo ? 'Lectivo' : 'No lectivo'})
        </span>
      </div>
    );
  };

  const pieDialogo = (
    <div className="flex align-items-center justify-content-end gap-2 pt-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={reiniciarFormulario}
        disabled={cargando}
      />
      <BotonAccion
        tipo="guardar"
        label="Añadir al Calendario"
        icon="pi pi-plus"
        onClick={manejarConfirmar}
        loading={cargando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={reiniciarFormulario}
      header="Añadir Periodo al Calendario Escolar"
      footer={pieDialogo}
      modal
      className="p-fluid w-11 sm:w-8 md:w-6 lg:w-4"
    >
      <div className="flex flex-column gap-3 pt-2">
        <p className="text-color-secondary text-sm m-0">
          Seleccione un intervalo temporal continuo para registrar vacaciones, evaluaciones, periodos de exámenes o festividades.
        </p>

        {errorValidacion && (
          <div className="p-message p-message-error py-2 px-3 text-xs border-round">
            <span className="p-message-text">{errorValidacion}</span>
          </div>
        )}

        {/* Selector del tipo de evento */}
        <div>
          <label htmlFor="rango-tipo-evento" className="block text-900 font-semibold mb-1 text-sm">
            Tipo de Evento
          </label>
          <Dropdown
            id="rango-tipo-evento"
            value={tipoEvento}
            options={LISTA_TIPOS_EVENTO}
            optionLabel="tipo"
            optionValue="tipo"
            itemTemplate={plantillaOpcionTipo}
            onChange={(e) => setTipoEvento(e.value)}
            className="w-full"
          />
        </div>

        {/* Fecha desde */}
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

        {/* Fecha hasta */}
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
            Descripción o Motivo (Opcional)
          </label>
          <InputText
            id="rango-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Vacaciones de Navidad, 1ª Evaluación, Exámenes Trimestrales"
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
            Omitir fines de semana (sábados y domingos)
          </label>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoRangoEventos;
