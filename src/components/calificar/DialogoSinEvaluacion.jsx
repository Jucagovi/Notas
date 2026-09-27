import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

/**
 * DialogoSinEvaluacion - Modal informativo de advertencia cuando se califica una actividad sin evaluación.
 *
 * Responsabilidad Única: Informar al docente de que la versión actual no pertenece a ninguna
 * evaluación oficial, explicar el impacto en las medias trimestrales y recomendar su vinculación
 * con acceso directo al Taller de Prácticas.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del diálogo.
 * @param {Function} props.onHide - Manejador para cerrar el diálogo.
 * @param {Object|null} props.version - Objeto de la versión activa.
 */
const DialogoSinEvaluacion = ({
  visible,
  onHide,
  version = null
}) => {
  const navigate = useNavigate();

  const nombrePractica = version?.nombrePractica || version?.Practicas?.nombre || 'esta práctica';
  const numeroVersion = version?.numeroVersion || version?.numero || 'v1.0';

  const cabecera = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-exclamation-triangle text-orange-500 text-xl" />
      <span className="font-bold text-lg text-900">
        Actividad sin evaluación asignada
      </span>
    </div>
  );

  const pieDialogo = (
    <div className="flex justify-content-between align-items-center w-full gap-2 pt-2">
      <Button
        label="Ir al Taller de Prácticas"
        icon="pi pi-briefcase"
        severity="secondary"
        outlined
        onClick={() => {
          onHide();
          navigate('/taller-practicas');
        }}
        tooltip="Abrir el taller para asignar evaluación a la práctica"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        label="Entendido, calificar"
        icon="pi pi-check"
        severity="warning"
        onClick={onHide}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={cabecera}
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '520px' }}
      modal
      draggable={false}
      resizable={false}
      className="p-dialog-sm"
    >
      <div className="flex flex-column gap-3 py-2">
        <div className="surface-100 p-3 border-round border-left-3 border-orange-500">
          <p className="m-0 text-800 line-height-3 text-sm">
            La actividad <strong>{nombrePractica} ({numeroVersion})</strong> no está asociada a ningún periodo de evaluación trimestral (ej. 1ª Evaluación, 2ª Evaluación, etc.).
          </p>
        </div>

        <div className="flex flex-column gap-2 text-sm text-700">
          <div className="flex align-items-start gap-2">
            <i className="pi pi-info-circle text-primary mt-1" />
            <span>
              Las calificaciones introducidas se guardarán de forma segura en la base de datos para cada alumno.
            </span>
          </div>

          <div className="flex align-items-start gap-2">
            <i className="pi pi-exclamation-circle text-orange-500 mt-1" />
            <span>
              <strong>Aviso:</strong> Al no tener evaluación asignada, estas notas <strong>no computarán en los promedios trimestrales</strong> ni se reflejarán en las actas de notas del centro.
            </span>
          </div>
        </div>

        <p className="m-0 text-xs text-color-secondary">
          Recomendación: vincula esta versión a una evaluación desde el <strong>Taller de Prácticas</strong> o desde el <strong>Gestor de Unidades de Trabajo</strong> para integrarla plenamente en el cálculo de notas.
        </p>
      </div>
    </Dialog>
  );
};

export default DialogoSinEvaluacion;
