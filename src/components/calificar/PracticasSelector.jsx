import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';

// Componente para la selección horizontal de prácticas vinculadas a la evaluación actual
const PracticasSelector = ({
  practicas = [],
  practicaSeleccionadaId,
  alSeleccionarPractica = () => {},
  cargando = false
}) => {
  const navigate = useNavigate();
  const [practicaDetalle, setPracticaDetalle] = useState(null);
  const [dialogoDetalleVisible, setDialogoDetalleVisible] = useState(false);

  if (cargando) {
    return null;
  }

  // Estado vacío cuando la evaluación seleccionada no tiene prácticas asignadas en evaluan
  if (!practicas || practicas.length === 0) {
    return (
      <div className="surface-card p-4 border-round shadow-1 mb-4 text-center flex flex-column align-items-center justify-content-center">
        <i className="pi pi-exclamation-circle text-4xl text-warning mb-2" />
        <h4 className="text-lg font-bold m-0 mb-1">Sin prácticas asignadas</h4>
        <p className="text-muted text-sm m-0 max-w-28rem mb-3">
          Esta evaluación aún no tiene prácticas vinculadas. Diríjase a la sección de Asignación de Prácticas para incorporar ejercicios a esta convocatoria.
        </p>
        <Button
          type="button"
          label="Ir a Asignación de Prácticas"
          icon="pi pi-arrow-right"
          iconPos="right"
          size="small"
          severity="primary"
          onClick={() => navigate('/practicas')}
        />
      </div>
    );
  }

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4">
      <div className="flex align-items-center justify-content-between mb-2">
        <span className="text-xs uppercase font-bold text-muted tracking-wider">
          <i className="pi pi-list mr-1" /> Prácticas de la evaluación ({practicas.length}):
        </span>
        <span className="text-xs text-muted">
          Seleccione una práctica para asentar o modificar calificaciones
        </span>
      </div>

      {/* Contenedor flexible con tarjetas de prácticas seleccionables */}
      <div className="flex flex-wrap gap-2">
        {practicas.map((item) => {
          const practica = item.practica || {};
          const idPractica = item.id_practica;
          const esActiva =
            practicaSeleccionadaId &&
            String(practicaSeleccionadaId).toLowerCase() === String(idPractica).toLowerCase();

          const totalAlumnos = item.totalAlumnos || 0;
          const totalCalificados = item.totalCalificados || 0;
          const porcentaje = totalAlumnos > 0 ? Math.round((totalCalificados / totalAlumnos) * 100) : 0;
          const todosCalificados = totalAlumnos > 0 && totalCalificados === totalAlumnos;

          return (
            <div
              key={idPractica}
              onClick={() => alSeleccionarPractica(idPractica)}
              className={`p-2 px-3 border-round cursor-pointer transition-all transition-duration-150 flex align-items-center gap-3 border-1 flex-1 sm:flex-none ${
                esActiva
                  ? 'surface-card border-primary shadow-2 ring-2'
                  : 'surface-ground border-surface-border hover:surface-hover'
              }`}
              style={{
                minWidth: '220px',
                outline: esActiva ? '2px solid var(--primary-color)' : 'none'
              }}
            >
              {/* Número o icono */}
              <div className="flex align-items-center justify-content-center">
                <Tag
                  value={practica.numero ? `P${practica.numero}` : 'PR'}
                  severity={esActiva ? 'primary' : 'secondary'}
                  className="font-bold text-xs"
                />
              </div>

              {/* Información textual de la práctica */}
              <div className="flex flex-column flex-1 min-w-0">
                <span className={`text-sm font-semibold truncate ${esActiva ? 'text-primary' : 'text-color'}`}>
                  {practica.nombre || 'Práctica sin título'}
                </span>
                <div className="flex align-items-center gap-2 mt-1">
                  {practica.unidad && (
                    <span className="text-xs text-muted">UD {practica.unidad}</span>
                  )}
                  <span className="text-xs text-muted font-medium">
                    {totalAlumnos > 0 ? `${totalCalificados}/${totalAlumnos}` : 'Sin discentes'}
                  </span>
                  {todosCalificados && (
                    <i className="pi pi-check-circle text-xs text-green-500" title="Todos calificados" />
                  )}
                </div>

                {/* Barra de progreso de corrección */}
                {totalAlumnos > 0 && (
                  <ProgressBar
                    value={porcentaje}
                    showValue={false}
                    style={{ height: '4px', marginTop: '4px' }}
                    color={todosCalificados ? '#10b981' : 'var(--primary-color)'}
                  />
                )}
              </div>

              {/* Botón para consultar enunciado o detalle */}
              <Button
                type="button"
                icon="pi pi-info-circle"
                size="small"
                severity="secondary"
                text
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setPracticaDetalle(practica);
                  setDialogoDetalleVisible(true);
                }}
                tooltip="Ver enunciado de la práctica"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          );
        })}
      </div>

      {/* Modal de visualización de detalles del enunciado */}
      <Dialog
        visible={dialogoDetalleVisible}
        onHide={() => {
          setDialogoDetalleVisible(false);
          setPracticaDetalle(null);
        }}
        header={
          practicaDetalle
            ? `${practicaDetalle.numero ? `Práctica ${practicaDetalle.numero}: ` : ''}${practicaDetalle.nombre}`
            : 'Detalles de la Práctica'
        }
        modal
        style={{ width: '90vw', maxWidth: '560px' }}
        footer={
          <div className="flex justify-content-end">
            <Button
              label="Cerrar"
              icon="pi pi-times"
              severity="secondary"
              text
              onClick={() => setDialogoDetalleVisible(false)}
            />
          </div>
        }
      >
        {practicaDetalle && (
          <div className="flex flex-column gap-3 pt-2">
            <div className="flex flex-wrap gap-2 align-items-center">
              {practicaDetalle.unidad && (
                <Tag value={`Unidad ${practicaDetalle.unidad}`} severity="info" />
              )}
              {practicaDetalle.id_tipopractica && (
                <Tag value={`Tipo: ${practicaDetalle.id_tipopractica}`} severity="secondary" />
              )}
            </div>

            {practicaDetalle.enunciado && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Enunciado:</span>
                <p className="text-sm text-color m-0 surface-ground p-3 border-round border-1 surface-border">
                  {practicaDetalle.enunciado}
                </p>
              </div>
            )}

            {practicaDetalle.descripcion && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Descripción / Criterios:</span>
                <p className="text-sm text-muted m-0">{practicaDetalle.descripcion}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PracticasSelector;
