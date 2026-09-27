import React from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * WidgetAlertas - Componente presentacional para notificaciones de atención inmediata.
 *
 * Responsabilidad Única: Renderizar las anomalías críticas detectadas por el sistema
 * (prácticas pendientes de corregir, desfases en temporizaciones o discentes en riesgo)
 * ofreciendo un acceso directo de resolución a la pantalla correspondiente.
 *
 * @param {Object} props
 * @param {Array<Object>} props.alertas - Lista de alertas estructuradas.
 */
export const WidgetAlertas = ({ alertas = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-bell text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Atención Inmediata</h2>
              <span className="text-xs text-color-secondary">Avisos y anomalías prioritarias</span>
            </div>
          </div>
          {alertas.length > 0 && (
            <Tag
              value={`${alertas.length} ${alertas.length === 1 ? 'aviso' : 'avisos'}`}
              severity="danger"
              className="text-xs font-bold"
            />
          )}
        </div>

        {/* Lista de alertas o estado vacío */}
        {alertas.length === 0 ? (
          <EstadoVacio
            mensaje="Todo al día"
            descripcion="No se han detectado anomalías ni desfases curriculares pendientes en el sistema."
            icono="pi pi-verified"
            className="my-2 p-4"
          />
        ) : (
          <div className="flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '340px' }}>
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="p-3 border-round border-1 surface-border surface-50 flex flex-column gap-2"
              >
                <div className="flex align-items-start justify-content-between gap-2">
                  <div className="flex align-items-center gap-2">
                    <span className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 ${
                      alerta.severidad === 'danger' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                      <i className={`${alerta.icono} text-sm`} />
                    </span>
                    <span className="font-bold text-sm text-900">{alerta.titulo}</span>
                  </div>
                  <Tag
                    value={alerta.severidad === 'danger' ? 'Urgente' : 'Atención'}
                    severity={alerta.severidad}
                    className="text-xs"
                  />
                </div>

                <p className="text-xs text-color-secondary m-0 line-height-3 pl-5">
                  {alerta.descripcion}
                </p>

                {alerta.ruta && (
                  <div className="flex justify-content-end pt-1">
                    <Button
                      label={alerta.accionTexto || 'Resolver'}
                      icon="pi pi-external-link"
                      size="small"
                      text
                      onClick={() => navigate(alerta.ruta)}
                      className="p-0 text-xs font-semibold"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie del widget */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-between align-items-center">
        <span className="text-xs text-color-secondary">
          {alertas.filter((a) => a.severidad === 'danger').length} alertas críticas
        </span>
        <Button
          label="Ir al Calificador"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/calificar')}
        />
      </div>
    </div>
  );
};

export default WidgetAlertas;
