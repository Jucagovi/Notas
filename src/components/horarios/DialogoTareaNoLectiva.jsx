import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearHoraParaMostrar, esSesionRecreo } from './constantesHorarios.js';

// Tareas frecuentes en la labor docente con predefinición de si computan como lectivas.
const TAREAS_FRECUENTES = [
  { nombre: 'Guardia de aula', lectiva: false },
  { nombre: 'Reunión de Departamento', lectiva: false },
  { nombre: 'Tutoría de alumnos', lectiva: true },
  { nombre: 'Atención a familias', lectiva: false },
  { nombre: 'Coordinación docente', lectiva: true },
  { nombre: 'Jefatura de Departamento', lectiva: true }
];

/**
 * DialogoTareaNoLectiva - Diálogo modal presentacional para añadir y gestionar actividades docentes personales.
 *
 * Responsabilidad Única: Capturar actividades del docente titular que no pertenecen a ningún curso
 * curricular directo (guardias, reuniones, tutorías, coordinaciones), permitiendo catalogarlas como
 * lectivas o no lectivas para el cómputo de la jornada semanal.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Function} props.onHide - Callback al cerrar el diálogo.
 * @param {Function} props.onGuardar - Callback al confirmar la tarea ({ id_horario, id_sesion, dia_semana, nombreTarea, aula, es_lectiva }).
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
  const [esLectiva, setEsLectiva] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Se inicializa el formulario con los datos de la celda activa al abrirse el modal.
  useEffect(() => {
    if (visible && celdaActiva) {
      const tareaExistente = celdaActiva.tarea;
      if (tareaExistente) {
        setNombreTarea(tareaExistente.modulo_alt || '');
        setAula(tareaExistente.aula || '');
        const esLectivaExistente = Boolean(
          tareaExistente.es_lectiva ||
          (tareaExistente.grupo && tareaExistente.grupo.toLowerCase().includes('lectiva'))
        );
        setEsLectiva(esLectivaExistente);
      } else {
        setNombreTarea('');
        setAula('');
        setEsLectiva(false);
      }
      setErrorValidacion('');
    }
  }, [visible, celdaActiva]);

  // Manejador del guardado tras validar el nombre de la actividad.
  const manejarGuardar = () => {
    if (celdaActiva?.sesion && esSesionRecreo(celdaActiva.sesion.descripcion)) {
      setErrorValidacion('No se pueden asignar actividades en períodos de recreo.');
      return;
    }

    if (!nombreTarea || nombreTarea.trim() === '') {
      setErrorValidacion('Debes indicar el nombre o tipo de la tarea.');
      return;
    }

    setErrorValidacion('');
    onGuardar({
      id_horario: celdaActiva?.tarea?.id_horario || null,
      id_sesion: celdaActiva.sesion.id_sesion,
      dia_semana: celdaActiva.dia.dia,
      nombreTarea: nombreTarea.trim(),
      aula: aula.trim(),
      es_lectiva: esLectiva
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
      header={tieneTareaAsignada ? 'Editar Tarea Docente' : 'Añadir Tarea Docente'}
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '520px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-1">
        {/* Bloque informativo de la posición temporal */}
        <div className={`surface-100 p-3 border-round flex flex-column gap-1 border-left-3 ${esLectiva ? 'border-blue-500' : 'border-orange-500'}`}>
          <div className="flex align-items-center justify-content-between text-sm">
            <span className="font-bold text-900">
              {celdaActiva.dia?.nombre} &bull; {nombreSesion}
            </span>
            <span className="text-color-secondary font-medium">
              {horarioSesion}
            </span>
          </div>
          <span className={`text-xs font-semibold ${esLectiva ? 'text-blue-700' : 'text-orange-700'}`}>
            {esLectiva ? 'Tarea docente lectiva (computa en cómputo lectivo semanal)' : 'Tarea docente complementaria / no lectiva'}
          </span>
        </div>

        {/* Sugerencias rápidas de actividades docentes */}
        <div className="flex flex-column gap-1">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Tareas Frecuentes
          </span>
          <div className="flex gap-2 flex-wrap">
            {TAREAS_FRECUENTES.map((sugerencia) => (
              <Button
                key={sugerencia.nombre}
                type="button"
                label={sugerencia.nombre}
                size="small"
                severity={sugerencia.lectiva ? 'info' : 'secondary'}
                outlined={nombreTarea !== sugerencia.nombre}
                onClick={() => {
                  setNombreTarea(sugerencia.nombre);
                  setEsLectiva(sugerencia.lectiva);
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
            placeholder="Ej: Guardia de biblioteca, Reunión de Departamento, Coordinación..."
          />
        </div>

        {/* Checkbox para indicar si la actividad computa como lectiva */}
        <div className="p-3 surface-50 border-round border-1 surface-border flex flex-column gap-1">
          <div className="flex align-items-center">
            <Checkbox
              inputId="tarea-es-lectiva"
              checked={esLectiva}
              onChange={(e) => setEsLectiva(Boolean(e.checked))}
            />
            <label htmlFor="tarea-es-lectiva" className="font-semibold text-900 text-sm cursor-pointer ml-2">
              Es hora lectiva (computa en el total de horas lectivas)
            </label>
          </div>
          <span className="text-xs text-color-secondary ml-4">
            Márcala si esta actividad cuenta como hora lectiva en tu horario (ej: tutoría lectiva, jefatura, coordinación) aunque no sea un módulo de alumnos.
          </span>
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
