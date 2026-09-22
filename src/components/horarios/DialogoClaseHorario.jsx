import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import SelectorModulo from '../common/SelectorModulo.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearHoraParaMostrar } from './constantesHorarios.js';

/**
 * DialogoClaseHorario - Diálogo modal presentacional para asignar o editar una clase en el horario.
 *
 * Responsabilidad Única: Gestionar la captura de datos de la sesión lectiva en función de si es impartida
 * por el docente titular (módulo oficial) o por otro compañero (módulo alternativo y nombre del profesor).
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del diálogo modal.
 * @param {Function} props.onHide - Callback al cerrar el diálogo.
 * @param {Function} props.onGuardar - Callback al confirmar el guardado de la asignación.
 * @param {Function} props.onEliminar - Callback opcional para desasignar la hora lectiva.
 * @param {Object|null} props.celdaActiva - Información del día, sesión y clase existente en la celda.
 * @param {Array<Object>} props.modulos - Listado de módulos curriculares disponibles.
 * @param {string} props.grupo - Nombre del grupo al que pertenece la cuadrícula.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoClaseHorario = ({
  visible,
  onHide,
  onGuardar,
  onEliminar,
  celdaActiva,
  modulos = [],
  grupo = '',
  guardando = false
}) => {
  const [esMiClase, setEsMiClase] = useState(true);
  const [idModulo, setIdModulo] = useState(null);
  const [moduloAlt, setModuloAlt] = useState('');
  const [profesor, setProfesor] = useState('');
  const [aula, setAula] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Se inicializa el formulario con los datos de la celda activa al abrirse el diálogo.
  useEffect(() => {
    if (visible && celdaActiva) {
      const claseActual = celdaActiva.clase;
      if (claseActual) {
        const esPropia = Boolean(
          claseActual.id_modulo ||
          (claseActual.profesor && claseActual.profesor.toLowerCase().includes('docente'))
        );
        setEsMiClase(esPropia);
        setIdModulo(claseActual.id_modulo || (modulos.length > 0 ? modulos[0].id_modulo : null));
        setModuloAlt(claseActual.modulo_alt || '');
        setProfesor(claseActual.profesor || '');
        setAula(claseActual.aula || '');
      } else {
        // Valores predeterminados para una nueva asignación en celda vacía.
        setEsMiClase(true);
        setIdModulo(modulos.length > 0 ? modulos[0].id_modulo : null);
        setModuloAlt('');
        setProfesor('');
        setAula('');
      }
      setErrorValidacion('');
    }
  }, [visible, celdaActiva, modulos]);

  // Manejador del guardado con validación de campos obligatorios.
  const manejarGuardar = () => {
    if (esMiClase && !idModulo) {
      setErrorValidacion('Debes seleccionar un módulo curricular.');
      return;
    }
    if (!esMiClase && (!moduloAlt || moduloAlt.trim() === '')) {
      setErrorValidacion('Debes indicar el nombre de la asignatura o módulo alternativo.');
      return;
    }

    setErrorValidacion('');
    onGuardar({
      id_horario: celdaActiva?.clase?.id_horario || null,
      id_sesion: celdaActiva.sesion.id_sesion,
      dia_semana: celdaActiva.dia.dia,
      grupo,
      es_mi_clase: esMiClase,
      id_modulo: esMiClase ? idModulo : null,
      modulo_alt: esMiClase ? null : moduloAlt.trim(),
      profesor: esMiClase ? 'Docente titular' : profesor.trim(),
      aula: aula.trim()
    });
  };

  if (!celdaActiva) return null;

  const tieneClaseAsignada = Boolean(celdaActiva.clase);
  const nombreSesion = celdaActiva.sesion?.descripcion || `Tramo ${celdaActiva.sesion?.numero}`;
  const horarioSesion = `${formatearHoraParaMostrar(celdaActiva.sesion?.hora_inicio)} - ${formatearHoraParaMostrar(celdaActiva.sesion?.hora_fin)}`;

  const pieDialogo = (
    <div className="flex align-items-center justify-content-between w-full pt-2 flex-wrap gap-2">
      <div>
        {tieneClaseAsignada && onEliminar && (
          <BotonAccion
            tipo="eliminar"
            label="Eliminar Clase"
            onClick={() => onEliminar(celdaActiva.clase.id_horario)}
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
          label="Guardar Asignación"
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
      header="Configuración de Hora Lectiva"
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '520px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-1">
        {/* Bloque informativo de la posición espacio-temporal */}
        <div className="surface-100 p-3 border-round flex flex-column gap-1 border-left-3 border-primary">
          <div className="flex align-items-center justify-content-between text-sm">
            <span className="font-bold text-900">
              {celdaActiva.dia?.nombre} &bull; {nombreSesion}
            </span>
            <span className="text-color-secondary font-medium">
              {horarioSesion}
            </span>
          </div>
          <span className="text-xs text-primary font-semibold">
            Grupo: {grupo}
          </span>
        </div>

        {/* Checkbox para alternar entre clase propia o de un compañero */}
        <div className="field-checkbox m-0 p-2 surface-50 border-round">
          <Checkbox
            inputId="es-mi-clase"
            checked={esMiClase}
            onChange={(e) => {
              setEsMiClase(e.checked);
              setErrorValidacion('');
            }}
          />
          <label htmlFor="es-mi-clase" className="font-semibold text-900 cursor-pointer ml-2">
            Es mi clase (docente titular)
          </label>
        </div>

        {/* Formulario condicional según la titularidad de la clase */}
        {esMiClase ? (
          <div className="field flex flex-column gap-1 m-0">
            <label htmlFor="selector-modulo" className="font-semibold text-sm">
              Módulo curricular <span className="text-red-500">*</span>
            </label>
            <SelectorModulo
              id="selector-modulo"
              value={idModulo}
              options={modulos}
              onChange={(e) => setIdModulo(e.value)}
              placeholder="Seleccionar módulo impartido..."
            />
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            <div className="field flex flex-column gap-1 m-0">
              <label htmlFor="modulo-alt" className="font-semibold text-sm">
                Nombre de la Asignatura / Módulo <span className="text-red-500">*</span>
              </label>
              <InputText
                id="modulo-alt"
                value={moduloAlt}
                onChange={(e) => setModuloAlt(e.target.value)}
                placeholder="Ej: FOL, Inglés Técnico, Empresa e Iniciativa..."
              />
            </div>
            <div className="field flex flex-column gap-1 m-0">
              <label htmlFor="profesor-companero" className="font-semibold text-sm">
                Profesor / Compañero
              </label>
              <InputText
                id="profesor-companero"
                value={profesor}
                onChange={(e) => setProfesor(e.target.value)}
                placeholder="Ej: Laura Gómez, Carlos Ruiz..."
              />
            </div>
          </div>
        )}

        {/* Campo común para la ubicación o aula */}
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="aula-clase" className="font-semibold text-sm">
            Aula / Espacio lectivo
          </label>
          <InputText
            id="aula-clase"
            value={aula}
            onChange={(e) => setAula(e.target.value)}
            placeholder="Ej: Aula 102, Taller de Sistemas, Aula de Redes..."
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

export default DialogoClaseHorario;
