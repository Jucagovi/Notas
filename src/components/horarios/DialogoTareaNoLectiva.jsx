import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearHoraParaMostrar } from './constantesHorarios.js';

// Tareas no lectivas frecuentes en la labor docente para asignación con un solo clic.
const TAREAS_FRECUENTES = [
  'Guardia de aula',
  'Guardia de recreo',
  'Reunión de Departamento',
  'Tutoría de alumnos',
  'Atención a familias',
  'Coordinación docente'
];

/**
 * DialogoTareaNoLectiva - Diálogo modal presentacional para añadir y gestionar horas no lectivas.
 *
 * Responsabilidad Única: Capturar actividades del docente titular que no pertenecen a ningún curso
 * curricular (guardias, reuniones, tutorías) para su persistencia con id_curso e id_modulo nulos.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Function} props.onHide - Callback al cerrar el diálogo.
 * @param {Function} props.onGuardar - Callback al confirmar la tarea ({ id_horario, id_sesion, dia_semana, nombreTarea, aula }).
 * @param {Function} [props.onEliminar] - Callback opcional para eliminar la tarea si ya existía.
 * @param {Object|null} props.celdaActiva - Información de la sesión, día y tarea existente en la celda.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoTareaNoLectiva = ({
  visible,
  onHide,
  onGuardar,
  onEliminar,
  celdaActiva,
  guardando = false
}) => {
  const [nombreTarea, setNombreTarea] = useState('');
  const [aula, setAula] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Se inicializa el formulario con los datos de la celda activa al abrirse el modal.
  useEffect(() => {
    if (visible && celdaActiva) {
      const tareaExistente = celdaActiva.tarea;
      if (tareaExistente) {
        setNombreTarea(tareaExistente.modulo_alt || '');
        setAula(tareaExistente.aula || '');
      } else {
        setNombreTarea('');
        setAula('');
      }
      setErrorValidacion('');
    }
  }, [visible, celdaActiva]);

  // Manejador del guardado tras validar el nombre de la actividad.
  const manejarGuardar = () => {
    if (!nombreTarea || nombreTarea.trim() === '') {
      setErrorValidacion('Debes indicar el nombre o tipo de la tarea no lectiva.');
      return;
    }

    setErrorValidacion('');
    onGuardar({
      id_horario: celdaActiva?.tarea?.id_horario || null,
      id_sesion: celdaActiva.sesion.id_sesion,
      dia_semana: celdaActiva.dia.dia,
      nombreTarea: nombreTarea.trim(),
      aula: aula.trim()
    });
  };

  if (!celdaActiva) return null;

  const tieneTareaAsignada = Boolean(celdaActiva.tarea);
  const nombreSesion = celdaActiva.sesion?.descripcion || `Tramo ${celdaActiva.sesion?.numero}`;
  const horarioSesion = `${formatearHoraParaMostrar(celdaActiva.sesion?.hora_inicio)} - ${formatearHoraParaMostrar(celdaActiva.sesion?.hora_fin)}`;

  const pieDialogo = (
    <div className="flex align-items-center justify-content-between w-full pt-2 flex-wrap gap-2">
      <div>
        {tieneTareaAsignada && onEliminar && (
          <BotonAccion
            tipo="eliminar"
            label="Eliminar Tarea"
            onClick={() => onEliminar(celdaActiva.tarea.id_horario)}
            disabled={guardando}
          />
        )}
      </div>
      <div className="flex align-items-center gap-2">
        <BotonAccion
          tipo="cancelar"
          label="Cancelar"
          onClick={onHide}
          disabled={guardando}
        />
        <BotonAccion
          tipo="guardar"
          label="Guardar Tarea"
          onClick={manejarGuardar}
          loading={guardando}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Añadir Tarea No Lectiva"
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '520px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-1">
        {/* Bloque informativo de la posición temporal */}
        <div className="surface-100 p-3 border-round flex flex-column gap-1 border-left-3 border-orange-500">
          <div className="flex align-items-center justify-content-between text-sm">
            <span className="font-bold text-900">
              {celdaActiva.dia?.nombre} &bull; {nombreSesion}
            </span>
            <span className="text-color-secondary font-medium">
              {horarioSesion}
            </span>
          </div>
          <span className="text-xs text-orange-700 font-semibold">
            Horario Docente Personal (Tarea no vinculada a un curso lectivo)
          </span>
        </div>

        {/* Sugerencias rápidas de actividades no lectivas */}
        <div className="flex flex-column gap-1">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Tareas Frecuentes
          </span>
          <div className="flex gap-2 flex-wrap">
            {TAREAS_FRECUENTES.map((sugerencia) => (
              <Button
                key={sugerencia}
                type="button"
                label={sugerencia}
                size="small"
                severity="secondary"
                outlined={nombreTarea !== sugerencia}
                onClick={() => {
                  setNombreTarea(sugerencia);
                  setErrorValidacion('');
                }}
                className="py-1 px-2 text-xs"
              />
            ))}
          </div>
        </div>

        {/* Nombre de la tarea */}
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="nombre-tarea-input" className="font-semibold text-sm">
            Actividad o Tarea <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nombre-tarea-input"
            value={nombreTarea}
            onChange={(e) => setNombreTarea(e.target.value)}
            placeholder="Ej: Guardia de biblioteca, Reunión de Departamento..."
          />
        </div>

        {/* Ubicación o espacio */}
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="aula-tarea-input" className="font-semibold text-sm">
            Ubicación / Espacio (opcional)
          </label>
          <InputText
            id="aula-tarea-input"
            value={aula}
            onChange={(e) => setAula(e.target.value)}
            placeholder="Ej: Sala de Profesores, Biblioteca, Despacho..."
          />
        </div>

        {errorValidacion && (
          <small className="text-red-500 font-medium">
            {errorValidacion}
          </small>
        )}
      </div>
    </Dialog>
  );
};

export default DialogoTareaNoLectiva;
