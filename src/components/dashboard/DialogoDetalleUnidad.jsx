import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient.js';
import { formatearFechaEspanol } from '../../utils/fechas.js';

// Opciones disponibles para la actualización de estado de la Unidad de Trabajo.
const OPCIONES_ESTADO = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Curso', value: 'En Curso' },
  { label: 'Completada', value: 'Completada' }
];

// Colores según estado didáctico.
const COLORES_ESTADO = {
  'Pendiente': { bg: '#64748b', text: '#ffffff' },
  'En Curso': { bg: '#2563eb', text: '#ffffff' },
  'Completada': { bg: '#16a34a', text: '#ffffff' }
};

/**
 * DialogoDetalleUnidad - Modal informativo y de gestión para una Unidad de Trabajo temporizada.
 *
 * Responsabilidad Única: Desplegar los datos didácticos de la unidad seleccionada en el widget
 * de agenda (clase, módulo, fechas, descripción, estado) y listar sus actividades prácticas
 * vinculadas con accesos directos al Taller de Prácticas y al Calificador.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Control de visibilidad del modal.
 * @param {Function} props.onOcultar - Callback para cerrar el diálogo.
 * @param {Object|null} props.unidad - Datos extendidos de la unidad didáctica.
 * @param {Function} props.onCambiarEstado - Callback al actualizar el estado de la unidad.
 * @param {boolean} [props.guardando=false] - Indicador de mutación en curso.
 */
export const DialogoDetalleUnidad = ({
  visible,
  onOcultar,
  unidad,
  onCambiarEstado,
  guardando = false
}) => {
  const navigate = useNavigate();
  const [practicas, setPracticas] = useState([]);
  const [cargandoPracticas, setCargandoPracticas] = useState(false);

  // Consulta de las actividades prácticas asociadas a la unidad en la clase actual.
  useEffect(() => {
    let cancelado = false;

    if (visible && unidad?.id_ut && unidad?.id_curso) {
      setCargandoPracticas(true);
      supabase
        .from('Versiones')
        .select('*, Practicas!inner(id_practica, nombre, descripcion, id_tipopractica)')
        .eq('id_curso', unidad.id_curso)
        .eq('id_ut', unidad.id_ut)
        .order('numero', { ascending: true })
        .then(({ data, error }) => {
          if (!cancelado) {
            if (error) {
              console.error('Error al consultar prácticas de la unidad:', error);
              setPracticas([]);
            } else {
              setPracticas(data || []);
            }
          }
        })
        .catch((err) => {
          console.error('Excepción al consultar prácticas:', err);
          if (!cancelado) setPracticas([]);
        })
        .finally(() => {
          if (!cancelado) setCargandoPracticas(false);
        });
    } else {
      setPracticas([]);
      setCargandoPracticas(false);
    }

    return () => {
      cancelado = true;
    };
  }, [visible, unidad?.id_ut, unidad?.id_curso]);

  if (!unidad) return null;

  const numUT = unidad.numero ? `UT ${unidad.numero}` : 'Unidad de Trabajo';
  const tituloCompleto = `${numUT}: ${unidad.nombre_alternativo || unidad.nombre || ''}`;
  const configColor = COLORES_ESTADO[unidad.estado] || COLORES_ESTADO['Pendiente'];

  // Cabecera estilizada del diálogo modal.
  const renderHeader = () => (
    <div className="flex align-items-center justify-content-between w-full pr-4">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-folder text-primary text-xl" />
        <span className="font-bold text-lg text-900">{numUT}</span>
      </div>
      <Tag
        value={unidad.estado || 'Pendiente'}
        style={{
          backgroundColor: configColor.bg,
          color: configColor.text
        }}
      />
    </div>
  );

  // Pie de diálogo con botón de cierre.
  const renderFooter = () => (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        outlined
        severity="secondary"
        onClick={onOcultar}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onOcultar}
      header={renderHeader}
      footer={renderFooter}
      style={{ width: '90vw', maxWidth: '640px' }}
      breakpoints={{ '960px': '75vw', '641px': '95vw' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Identificación de Clase y Módulo */}
        {(unidad.cursoNombre || unidad.moduloNombre || unidad.moduloSiglas) && (
          <div className="flex align-items-center gap-2 flex-wrap">
            {unidad.cursoNombre && (
              <Tag
                value={unidad.cursoNombre}
                icon="pi pi-building"
                severity="secondary"
              />
            )}
            {(unidad.moduloSiglas || unidad.moduloNombre) && (
              <Tag
                value={unidad.moduloSiglas ? `${unidad.moduloSiglas} - ${unidad.moduloNombre}` : unidad.moduloNombre}
                icon="pi pi-book"
                severity="info"
              />
            )}
          </div>
        )}

        {/* Título y nombre de la unidad */}
        <div>
          <h2 className="text-xl font-bold text-900 m-0 mb-1">
            {tituloCompleto}
          </h2>
          {unidad.descripcion && (
            <p className="text-color-secondary text-sm m-0 line-height-3">
              {unidad.descripcion}
            </p>
          )}
        </div>

        {/* Bloque de Fechas y Estado */}
        <div className="surface-50 p-3 border-round border-1 surface-border flex flex-column gap-3">
          <div className="grid">
            <div className="col-12 sm:col-6">
              <span className="text-xs uppercase font-semibold text-500 block mb-1">
                Fecha inicio prevista
              </span>
              <div className="flex align-items-center gap-2 text-900 font-medium">
                <i className="pi pi-calendar text-primary" />
                <span>{formatearFechaEspanol(unidad.fecha_ini_prevista) || 'Sin asignar'}</span>
              </div>
            </div>

            <div className="col-12 sm:col-6">
              <span className="text-xs uppercase font-semibold text-500 block mb-1">
                Fecha fin prevista
              </span>
              <div className="flex align-items-center gap-2 text-900 font-medium">
                <i className="pi pi-calendar text-primary" />
                <span>{formatearFechaEspanol(unidad.fecha_fin_prevista) || 'Sin asignar'}</span>
              </div>
            </div>
          </div>

          {/* Selector de cambio de estado */}
          <div className="pt-2 border-top-1 surface-border">
            <label
              htmlFor="selector-estado-unidad"
              className="text-xs uppercase font-semibold text-500 block mb-1"
            >
              Cambiar estado de avance:
            </label>
            <Dropdown
              id="selector-estado-unidad"
              value={unidad.estado || 'Pendiente'}
              options={OPCIONES_ESTADO}
              onChange={(e) => onCambiarEstado && onCambiarEstado(unidad.id_temporizacion, e.value)}
              disabled={guardando}
              className="w-full sm:w-16rem"
            />
          </div>

          {unidad.observaciones && (
            <div className="pt-2 border-top-1 surface-border">
              <span className="text-xs uppercase font-semibold text-500 block mb-1">
                Observaciones docentes:
              </span>
              <p className="text-sm text-700 m-0 font-italic">
                {unidad.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Sección de actividades prácticas asociadas */}
        <div className="flex flex-column gap-2 mt-2">
          <div className="flex align-items-center justify-content-between">
            <h3 className="text-base font-bold text-900 m-0 flex align-items-center gap-2">
              <i className="pi pi-briefcase text-primary" />
              <span>Prácticas y Actividades Vinculadas</span>
            </h3>
            <Button
              label="Taller de Prácticas"
              icon="pi pi-external-link"
              text
              size="small"
              onClick={() => {
                onOcultar();
                navigate('/taller-practicas');
              }}
            />
          </div>

          {cargandoPracticas ? (
            <div className="flex align-items-center justify-content-center p-4">
              <i className="pi pi-spin pi-spinner text-2xl text-primary" />
            </div>
          ) : practicas.length === 0 ? (
            <div className="surface-50 p-4 border-round text-center border-1 surface-border">
              <i className="pi pi-info-circle text-2xl text-400 mb-2" />
              <p className="text-sm text-color-secondary m-0 mb-2">
                Esta unidad de trabajo no tiene actividades prácticas asignadas en esta clase.
              </p>
              <Button
                label="Crear o asignar prácticas en el Taller"
                icon="pi pi-plus"
                size="small"
                outlined
                onClick={() => {
                  onOcultar();
                  navigate('/taller-practicas');
                }}
              />
            </div>
          ) : (
            <div className="flex flex-column gap-2 max-h-15rem overflow-y-auto pr-1">
              {practicas.map((v) => {
                const practicaObj = v.Practicas || {};
                return (
                  <div
                    key={v.id_version}
                    className="surface-card border-1 surface-border border-round p-3 flex align-items-center justify-content-between gap-3 shadow-1"
                  >
                    <div className="flex flex-column gap-1">
                      <div className="flex align-items-center gap-2">
                        <Tag
                          value={`Versión ${v.numero || '1'}`}
                          severity="info"
                          className="text-xs"
                        />
                        <span className="font-semibold text-900 text-sm">
                          {practicaObj.nombre || 'Práctica sin título'}
                        </span>
                      </div>
                      {practicaObj.descripcion && (
                        <p className="text-xs text-color-secondary m-0 line-clamp-1">
                          {practicaObj.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex align-items-center gap-2">
                      <Button
                        icon="pi pi-pencil"
                        tooltip="Calificar actividad"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                        severity="secondary"
                        text
                        onClick={() => {
                          onOcultar();
                          navigate('/calificar');
                        }}
                      />
                      <Button
                        icon="pi pi-arrow-right"
                        tooltip="Ver en Taller"
                        tooltipOptions={{ position: 'top' }}
                        size="small"
                        text
                        onClick={() => {
                          onOcultar();
                          navigate('/taller-practicas');
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoDetalleUnidad;
