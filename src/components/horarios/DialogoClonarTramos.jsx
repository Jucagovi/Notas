import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import SelectorCurso from '../common/SelectorCurso.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import useDatos from '../../hooks/useDatos.js';
import { formatearHoraParaMostrar, esSesionRecreo } from './constantesHorarios.js';

/**
 * DialogoClonarTramos - Diálogo modal presentacional para clonar tramos horarios desde otro curso.
 *
 * Responsabilidad Única: Permitir al usuario seleccionar un curso académico previo, previsualizar
 * sus tramos horarios existentes y confirmar la clonación hacia el curso actual.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Function} props.onHide - Callback al cerrar el modal.
 * @param {Function} props.onConfirmarClonado - Callback que recibe el id del curso origen seleccionado.
 * @param {Array<Object>} props.cursos - Lista de todos los cursos académicos disponibles.
 * @param {string|null} props.cursoDestinoId - Identificador del curso actual que recibirá los tramos.
 * @param {boolean} [props.tieneTramosActuales=false] - Indica si el curso actual ya tiene tramos que se reemplazarán.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoClonarTramos = ({
  visible,
  onHide,
  onConfirmarClonado,
  cursos = [],
  cursoDestinoId = null,
  tieneTramosActuales = false,
  guardando = false
}) => {
  const [cursoOrigenId, setCursoOrigenId] = useState(null);
  const [sesionesOrigen, setSesionesOrigen] = useState([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Se aísla la consulta de sesiones mediante el hook useDatos.
  const { obtenerDatos: obtenerSesionesDb } = useDatos('Sesiones');

  // Se filtran los cursos disponibles para excluir el curso actual de destino.
  const cursosDisponibles = cursos.filter((c) => c.id_curso !== cursoDestinoId);

  // Al abrirse el diálogo, se autoselecciona el primer curso de origen disponible si existe.
  useEffect(() => {
    if (visible) {
      if (cursosDisponibles.length > 0) {
        setCursoOrigenId(cursosDisponibles[0].id_curso);
      } else {
        setCursoOrigenId(null);
      }
      setSesionesOrigen([]);
      setErrorValidacion('');
    }
  }, [visible, cursoDestinoId]);

  // Cada vez que cambia el curso de origen seleccionado, se recuperan sus tramos para previsualizarlos.
  useEffect(() => {
    if (!cursoOrigenId) {
      setSesionesOrigen([]);
      return;
    }

    let cancelado = false;
    const cargarTramos = async () => {
      setCargandoSesiones(true);
      setErrorValidacion('');
      try {
        const datos = await obtenerSesionesDb('*', (consulta) =>
          consulta.eq('id_curso', cursoOrigenId).order('numero', { ascending: true })
        );
        if (!cancelado) {
          setSesionesOrigen(datos || []);
          if (!datos || datos.length === 0) {
            setErrorValidacion('El curso seleccionado no tiene tramos horarios configurados.');
          }
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error al previsualizar tramos del curso origen:', err);
          setErrorValidacion('No se pudieron consultar los tramos del curso seleccionado.');
        }
      } finally {
        if (!cancelado) {
          setCargandoSesiones(false);
        }
      }
    };

    cargarTramos();

    return () => {
      cancelado = true;
    };
  }, [cursoOrigenId, obtenerSesionesDb]);

  // Manejador de confirmación para disparar la clonación.
  const manejarConfirmar = () => {
    if (!cursoOrigenId) {
      setErrorValidacion('Debes seleccionar un curso de origen.');
      return;
    }
    if (sesionesOrigen.length === 0) {
      setErrorValidacion('El curso de origen no posee tramos para clonar.');
      return;
    }

    setErrorValidacion('');
    onConfirmarClonado(cursoOrigenId);
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
        label={`Clonar ${sesionesOrigen.length} Tramos`}
        icon="pi pi-copy"
        onClick={manejarConfirmar}
        loading={guardando}
        disabled={!cursoOrigenId || sesionesOrigen.length === 0}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Clonar Tramos de Curso Anterior"
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '580px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-1">
        {/* Aviso de reemplazo de tramos si el curso de destino ya tiene configuración */}
        {tieneTramosActuales && (
          <div className="p-3 bg-orange-50 border-round border-left-3 border-orange-500 flex align-items-center gap-2 text-sm text-orange-900">
            <i className="pi pi-exclamation-triangle text-orange-600 text-lg" />
            <span>
              Atención: Los tramos actuales del curso serán reemplazados por los del curso clonado.
            </span>
          </div>
        )}

        {/* Desplegable para seleccionar el curso académico de origen */}
        <div className="field flex flex-column gap-1 m-0">
          <label htmlFor="selector-curso-origen" className="font-semibold text-sm">
            Curso académico de origen <span className="text-red-500">*</span>
          </label>
          <SelectorCurso
            id="selector-curso-origen"
            value={cursoOrigenId}
            options={cursosDisponibles}
            onChange={(e) => setCursoOrigenId(e.value)}
            placeholder="Selecciona el curso a replicar..."
            disabled={guardando || cursosDisponibles.length === 0}
          />
        </div>

        {errorValidacion && (
          <small className="text-red-500 font-medium">
            {errorValidacion}
          </small>
        )}

        {/* Previsualización de los tramos que se clonarán */}
        <div className="flex flex-column gap-2 mt-1">
          <span className="text-xs text-color-secondary font-semibold uppercase">
            Tramos a importar ({sesionesOrigen.length})
          </span>

          {cargandoSesiones ? (
            <div className="p-3 text-center surface-100 border-round text-color-secondary text-sm flex align-items-center justify-content-center gap-2">
              <i className="pi pi-spin pi-spinner text-primary" />
              <span>Consultando tramos del curso...</span>
            </div>
          ) : sesionesOrigen.length === 0 ? (
            <div className="p-3 text-center surface-100 border-round text-color-secondary text-sm">
              {cursosDisponibles.length === 0
                ? 'No existen otros cursos académicos registrados en el sistema.'
                : 'El curso seleccionado no tiene tramos horarios definidos.'}
            </div>
          ) : (
            <div
              className="border-1 surface-border border-round overflow-y-auto"
              style={{ maxHeight: '200px' }}
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
                  {sesionesOrigen.map((s) => {
                    const esDescanso = esSesionRecreo(s.descripcion);
                    return (
                      <tr
                        key={s.id_sesion || s.numero}
                        className={`border-bottom-1 surface-border ${
                          esDescanso ? 'bg-orange-50 font-semibold' : ''
                        }`}
                      >
                        <td className="p-2 text-center text-700">{s.numero}</td>
                        <td className="p-2 text-900">
                          {esDescanso && (
                            <i className="pi pi-coffee text-orange-500 mr-2" />
                          )}
                          {s.descripcion || `${s.numero}ª Hora`}
                        </td>
                        <td className="p-2 text-center font-medium text-700">
                          {formatearHoraParaMostrar(s.hora_inicio)} - {formatearHoraParaMostrar(s.hora_fin)}
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

export default DialogoClonarTramos;
