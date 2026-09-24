import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import BotonAccion from '../common/BotonAccion.jsx';
import {
  calcularTramosPersonalizados,
  formatearHoraParaMostrar,
  esHoraValida,
  esSesionRecreo
} from './constantesHorarios.js';

/**
 * DialogoGenerarTramos - Diálogo modal para configurar y calcular tramos predeterminados por rango horario.
 *
 * Responsabilidad Única: Capturar el rango de horas de inicio y fin, la duración de las clases y
 * la configuración de hasta dos recreos independientes con sus respectivas duraciones y posiciones,
 * ofreciendo una previsualización dinámica en tiempo real antes de persistir los tramos en la base de datos.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Function} props.onHide - Callback al cancelar o cerrar el modal.
 * @param {Function} props.onConfirmar - Callback que recibe la lista de tramos calculados.
 * @param {boolean} [props.tieneTramosPrevios=false] - Indica si ya existen sesiones previas en el curso.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoGenerarTramos = ({
  visible,
  onHide,
  onConfirmar,
  tieneTramosPrevios = false,
  guardando = false
}) => {
  // El turno de mañana por defecto termina a las 15:00.
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('15:00');
  const [duracionSesion, setDuracionSesion] = useState(55);

  // Configuración individual del primer recreo (por defecto 20 minutos).
  const [recreo1Activo, setRecreo1Activo] = useState(true);
  const [recreo1Posicion, setRecreo1Posicion] = useState(3);
  const [recreo1Duracion, setRecreo1Duracion] = useState(20);

  // Configuración individual del segundo recreo (por defecto tras la 6ª hora, 20 minutos).
  const [recreo2Activo, setRecreo2Activo] = useState(false);
  const [recreo2Posicion, setRecreo2Posicion] = useState(6);
  const [recreo2Duracion, setRecreo2Duracion] = useState(20);

  const [errorValidacion, setErrorValidacion] = useState('');

  // Se restablecen los valores por defecto al abrir el diálogo modal.
  useEffect(() => {
    if (visible) {
      setHoraInicio('08:00');
      setHoraFin('15:00');
      setDuracionSesion(55);
      setRecreo1Activo(true);
      setRecreo1Posicion(3);
      setRecreo1Duracion(20);
      setRecreo2Activo(false);
      setRecreo2Posicion(6);
      setRecreo2Duracion(20);
      setErrorValidacion('');
    }
  }, [visible]);

  // Selección rápida de turnos escolares habituales.
  const aplicarTurno = (inicio, fin) => {
    setHoraInicio(inicio);
    setHoraFin(fin);
    setErrorValidacion('');
  };

  // Cálculo reactivo de la secuencia de tramos según los parámetros configurados.
  const tramosCalculados = useMemo(() => {
    if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
      return [];
    }

    return calcularTramosPersonalizados({
      horaInicio,
      horaFin,
      duracionSesionMinutos: duracionSesion,
      recreo1: {
        activo: recreo1Activo,
        posicion: recreo1Posicion,
        duracionMinutos: recreo1Duracion
      },
      recreo2: {
        activo: recreo2Activo,
        posicion: recreo2Posicion,
        duracionMinutos: recreo2Duracion
      }
    });
  }, [
    horaInicio,
    horaFin,
    duracionSesion,
    recreo1Activo,
    recreo1Posicion,
    recreo1Duracion,
    recreo2Activo,
    recreo2Posicion,
    recreo2Duracion
  ]);

  // Manejador de confirmación para persistir los tramos calculados.
  const manejarConfirmar = () => {
    if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
      setErrorValidacion('Las horas deben tener formato válido HH:mm (ej: 08:00).');
      return;
    }
    if (tramosCalculados.length === 0) {
      setErrorValidacion('La hora de fin debe ser posterior a la de inicio y permitir generar al menos un tramo.');
      return;
    }

    // Validación de coherencia si ambos recreos están activos: el 2º debe colocarse tras el 1º.
    if (recreo1Activo && recreo2Activo && Number(recreo2Posicion) <= Number(recreo1Posicion)) {
      setErrorValidacion('El 2º recreo debe ubicarse tras una sesión posterior a la del 1er recreo.');
      return;
    }

    setErrorValidacion('');
    onConfirmar(tramosCalculados);
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
        label={`Generar ${tramosCalculados.length} Tramos`}
        icon="pi pi-bolt"
        onClick={manejarConfirmar}
        loading={guardando}
        disabled={tramosCalculados.length === 0}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Calcular Tramos Horarios Predeterminados"
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '640px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-1">
        {/* Aviso de sustitución de tramos existentes si aplica */}
        {tieneTramosPrevios && (
          <div className="p-3 bg-orange-50 border-round border-left-3 border-orange-500 flex align-items-center gap-2 text-sm text-orange-900">
            <i className="pi pi-exclamation-triangle text-orange-600 text-lg" />
            <span>
              Esta clase ya cuenta con tramos configurados. Al generar la nueva plantilla, se reemplazarán los tramos actuales.
            </span>
          </div>
        )}

        {/* Acceso rápido a turnos estándar con finalización a las 15:00 para mañana */}
        <div className="flex flex-column gap-2">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Plantillas Rápidas de Turno
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              label="Turno Mañana (08:00 - 15:00)"
              icon="pi pi-sun"
              size="small"
              severity="secondary"
              outlined={horaInicio !== '08:00' || horaFin !== '15:00'}
              onClick={() => aplicarTurno('08:00', '15:00')}
              className="py-1 px-3 text-xs"
            />
            <Button
              type="button"
              label="Turno Tarde (15:00 - 22:00)"
              icon="pi pi-moon"
              size="small"
              severity="secondary"
              outlined={horaInicio !== '15:00' || horaFin !== '22:00'}
              onClick={() => aplicarTurno('15:00', '22:00')}
              className="py-1 px-3 text-xs"
            />
          </div>
        </div>

        {/* Rango de horas de inicio y fin */}
        <div className="grid formgrid m-0">
          <div className="col-12 sm:col-6 pl-0 pr-0 sm:pr-2">
            <label htmlFor="rango-hora-inicio" className="font-semibold text-sm">
              Hora de inicio de la jornada <span className="text-red-500">*</span>
            </label>
            <InputText
              id="rango-hora-inicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              placeholder="08:00"
            />
          </div>
          <div className="col-12 sm:col-6 pl-0 sm:pl-2 pr-0 mt-2 sm:mt-0">
            <label htmlFor="rango-hora-fin" className="font-semibold text-sm">
              Hora de fin de la jornada <span className="text-red-500">*</span>
            </label>
            <InputText
              id="rango-hora-fin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              placeholder="15:00"
            />
          </div>
        </div>

        {/* Duración de cada clase lectiva */}
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="duracion-sesion" className="font-semibold text-sm">
            Duración de cada clase lectiva (minutos)
          </label>
          <InputNumber
            id="duracion-sesion"
            value={duracionSesion}
            onValueChange={(e) => setDuracionSesion(e.value !== null && e.value !== undefined ? e.value : 0)}
            min={15}
            max={120}
            placeholder="55"
          />
        </div>

        {/* Configuración de Recreos con duración individualizada */}
        <div className="flex flex-column gap-2">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Configuración de Descansos / Recreos
          </span>

          {/* Bloque: Primer Recreo */}
          <div className="p-3 surface-50 border-round border-1 surface-border flex flex-column gap-2">
            <div className="field-checkbox m-0">
              <Checkbox
                inputId="chk-recreo-1"
                checked={recreo1Activo}
                onChange={(e) => setRecreo1Activo(e.checked)}
              />
              <label htmlFor="chk-recreo-1" className="font-semibold text-sm text-900 cursor-pointer ml-2">
                Activar 1er Recreo
              </label>
            </div>

            {recreo1Activo && (
              <div className="grid formgrid m-0 pt-2 border-top-1 surface-border">
                <div className="col-6 pl-0 pr-2">
                  <label htmlFor="posicion-recreo-1" className="text-xs font-semibold text-700">
                    Colocar tras la:
                  </label>
                  <InputNumber
                    id="posicion-recreo-1"
                    value={recreo1Posicion}
                    onValueChange={(e) => setRecreo1Posicion(e.value || 3)}
                    min={1}
                    max={7}
                    suffix="ª hora"
                    className="p-inputtext-sm"
                  />
                </div>
                <div className="col-6 pr-0 pl-2">
                  <label htmlFor="duracion-recreo-1" className="text-xs font-semibold text-700">
                    Duración (minutos):
                  </label>
                  <InputNumber
                    id="duracion-recreo-1"
                    value={recreo1Duracion}
                    onValueChange={(e) => setRecreo1Duracion(e.value !== null && e.value !== undefined ? e.value : 0)}
                    min={5}
                    max={60}
                    className="p-inputtext-sm"
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bloque: Segundo Recreo */}
          <div className="p-3 surface-50 border-round border-1 surface-border flex flex-column gap-2">
            <div className="field-checkbox m-0">
              <Checkbox
                inputId="chk-recreo-2"
                checked={recreo2Activo}
                onChange={(e) => setRecreo2Activo(e.checked)}
              />
              <label htmlFor="chk-recreo-2" className="font-semibold text-sm text-900 cursor-pointer ml-2">
                Activar 2º Recreo
              </label>
            </div>

            {recreo2Activo && (
              <div className="grid formgrid m-0 pt-2 border-top-1 surface-border">
                <div className="col-6 pl-0 pr-2">
                  <label htmlFor="posicion-recreo-2" className="text-xs font-semibold text-700">
                    Colocar tras la:
                  </label>
                  <InputNumber
                    id="posicion-recreo-2"
                    value={recreo2Posicion}
                    onValueChange={(e) => setRecreo2Posicion(e.value || 6)}
                    min={1}
                    max={8}
                    suffix="ª hora"
                    className="p-inputtext-sm"
                  />
                </div>
                <div className="col-6 pr-0 pl-2">
                  <label htmlFor="duracion-recreo-2" className="text-xs font-semibold text-700">
                    Duración (minutos):
                  </label>
                  <InputNumber
                    id="duracion-recreo-2"
                    value={recreo2Duracion}
                    onValueChange={(e) => setRecreo2Duracion(e.value !== null && e.value !== undefined ? e.value : 0)}
                    min={5}
                    max={60}
                    className="p-inputtext-sm"
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {errorValidacion && (
          <small className="text-red-500 font-medium">
            {errorValidacion}
          </small>
        )}

        {/* Previsualización dinámica de los tramos calculados */}
        <div className="flex flex-column gap-2 mt-1">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Previsualización de los Tramos Calculados ({tramosCalculados.length})
          </span>

          {tramosCalculados.length === 0 ? (
            <div className="p-3 text-center surface-100 border-round text-color-secondary text-sm">
              Indica un rango horario válido para calcular los tramos.
            </div>
          ) : (
            <div
              className="border-1 surface-border border-round overflow-y-auto"
              style={{ maxHeight: '180px' }}
            >
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="surface-100 text-600 font-semibold border-bottom-1 surface-border">
                    <th className="p-2 text-center" style={{ width: '60px' }}>Orden</th>
                    <th className="p-2 text-left">Descripción</th>
                    <th className="p-2 text-center">Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {tramosCalculados.map((t) => {
                    const esDescanso = esSesionRecreo(t.descripcion);
                    return (
                      <tr
                        key={t.numero}
                        className={`border-bottom-1 surface-border ${
                          esDescanso ? 'celda-recreo font-semibold' : ''
                        }`}
                      >
                        <td className="p-2 text-center text-700">{t.numero}</td>
                        <td className="p-2 text-900">
                          {t.descripcion}
                        </td>
                        <td className="p-2 text-center font-medium text-700">
                          {formatearHoraParaMostrar(t.hora_inicio)} - {formatearHoraParaMostrar(t.hora_fin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoGenerarTramos;
