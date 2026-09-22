import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import BotonAccion from '../common/BotonAccion.jsx';
import { esHoraValida, formatearHoraParaMostrar } from './constantesHorarios.js';

/**
 * DialogoNuevoTramo - Diálogo modal presentacional para dar de alta un nuevo tramo horario.
 *
 * Responsabilidad Única: Capturar y validar el número de orden, horas de inicio/fin y descripción
 * de una nueva sesión lectiva o descanso.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del diálogo.
 * @param {Function} props.onHide - Callback al cerrar el diálogo.
 * @param {Function} props.onGuardar - Callback al confirmar la creación del tramo.
 * @param {number} props.siguienteNumero - Número de orden sugerido por defecto.
 * @param {boolean} [props.guardando=false] - Indicador de estado de guardado.
 */
export const DialogoNuevoTramo = ({
  visible,
  onHide,
  onGuardar,
  siguienteNumero = 1,
  guardando = false
}) => {
  const [numero, setNumero] = useState(siguienteNumero);
  const [descripcion, setDescripcion] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('08:55');
  const [errorHora, setErrorHora] = useState('');

  // Se restablecen los valores iniciales cada vez que se abre el diálogo.
  useEffect(() => {
    if (visible) {
      setNumero(siguienteNumero);
      setDescripcion(`${siguienteNumero}ª Hora`);
      setHoraInicio('08:00');
      setHoraFin('08:55');
      setErrorHora('');
    }
  }, [visible, siguienteNumero]);

  // Manejador del envío del formulario tras validar formato de horas.
  const manejarGuardar = () => {
    if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
      setErrorHora('Formato de hora no válido. Utiliza HH:mm (ej: 08:30).');
      return;
    }
    setErrorHora('');
    onGuardar({
      numero: Number(numero),
      descripcion: descripcion.trim(),
      hora_inicio: horaInicio.trim(),
      hora_fin: horaFin.trim()
    });
  };

  const pieDialogo = (
    <div className="flex justify-content-end gap-2 pt-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={onHide}
        disabled={guardando}
      />
      <BotonAccion
        tipo="guardar"
        label="Guardar Tramo"
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Añadir Nuevo Tramo Horario"
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '480px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="numero-tramo" className="font-semibold text-sm">
            Número de orden <span className="text-red-500">*</span>
          </label>
          <InputNumber
            id="numero-tramo"
            value={numero}
            onValueChange={(e) => setNumero(e.value || 1)}
            min={1}
            max={30}
            showButtons
          />
        </div>

        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="desc-tramo" className="font-semibold text-sm">
            Descripción / Nombre <span className="text-red-500">*</span>
          </label>
          <InputText
            id="desc-tramo"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: 1ª Hora, Recreo, Guardia..."
          />
        </div>

        <div className="grid formgrid m-0">
          <div className="col-6 pl-0 pr-2">
            <label htmlFor="hora-inicio" className="font-semibold text-sm">
              Hora inicio <span className="text-red-500">*</span>
            </label>
            <InputText
              id="hora-inicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              placeholder="08:00"
            />
          </div>
          <div className="col-6 pr-0 pl-2">
            <label htmlFor="hora-fin" className="font-semibold text-sm">
              Hora fin <span className="text-red-500">*</span>
            </label>
            <InputText
              id="hora-fin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              placeholder="08:55"
            />
          </div>
        </div>

        {errorHora && (
          <small className="text-red-500 font-medium">
            {errorHora}
          </small>
        )}
      </div>
    </Dialog>
  );
};

export default DialogoNuevoTramo;
