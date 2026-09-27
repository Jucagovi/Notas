import React from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * WidgetDetectorSobrecarga - Componente presentacional para el equilibrio de carga de trabajo lectiva.
 *
 * Responsabilidad Única: Renderizar el escáner predictivo a 15 días vista, alertando ante
 * acumulaciones críticas de pruebas o entregas para permitir la reprogramación preventiva.
 *
 * @param {Object} props
 * @param {Object} props.detector - Diagnóstico calculado (nivelAlerta, mensajeAlerta, totalHitos, hitosProximos, resumenSemanas).
 */
export const WidgetDetectorSobrecarga = ({ detector }) => {
  const navigate = useNavigate();
  const {
    nivelAlerta = 'baja',
    mensajeAlerta = '',
    hitosProximos = [],
    resumenSemanas = []
  } = detector || {};

  // Configuración visual según el nivel de riesgo detectado.
  const estiloNivel = {
    critica: {
      contenedor: 'bg-red-50 border-red-200 text-red-900',
      icono: 'pi pi-exclamation-triangle text-red-600',
      badge: 'danger',
      textoBadge: 'Riesgo Crítico'
    },
    moderada: {
      contenedor: 'bg-orange-50 border-orange-200 text-orange-900',
      icono: 'pi pi-info-circle text-orange-600',
      badge: 'warning',
      textoBadge: 'Carga Media'
    },
    baja: {
      contenedor: 'bg-green-50 border-green-200 text-green-900',
      icono: 'pi pi-check-circle text-green-600',
      badge: 'success',
      textoBadge: 'Carga Equilibrada'
    }
  }[nivelAlerta] || {
    contenedor: 'bg-green-50 border-green-200 text-green-900',
    icono: 'pi pi-check-circle text-green-600',
    badge: 'success',
    textoBadge: 'Carga Equilibrada'
  };

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-sliders-v text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Detector de Sobrecarga</h2>
              <span className="text-xs text-color-secondary">Balance predictivo de pruebas y entregas (15 días)</span>
            </div>
          </div>
          <Tag value={estiloNivel.textoBadge} severity={estiloNivel.badge} className="text-xs font-semibold" />
        </div>

        {/* Tarjeta de diagnóstico y mensaje preventivo */}
        <div className={`p-3 border-round border-1 mb-3 flex align-items-start gap-3 ${estiloNivel.contenedor}`}>
          <i className={`${estiloNivel.icono} text-xl mt-1 flex-shrink-0`} />
          <div className="flex flex-column gap-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Diagnóstico del Balanceador
            </span>
            <p className="text-xs m-0 line-height-3">
              {mensajeAlerta}
            </p>
          </div>
        </div>

        {/* Resumen por bloques semanales */}
        <div className="grid mb-3">
          {resumenSemanas.map((sem, idx) => (
            <div key={idx} className="col-6">
              <div className="surface-50 p-2 border-round border-1 surface-border flex flex-column gap-1">
                <span className="text-xs text-color-secondary">{sem.etiqueta}</span>
                <span className="text-base font-bold text-900">
                  {sem.total} {sem.total === 1 ? 'hito previsto' : 'hitos previstos'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de hitos inmediatos programados */}
        {hitosProximos.length === 0 ? (
          <EstadoVacio
            mensaje="Ventana despejada"
            descripcion="No constan exámenes ni cierres de evaluación en los próximos 15 días naturales."
            icono="pi pi-calendar"
            className="my-1 p-3"
          />
        ) : (
          <div className="flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
            {hitosProximos.map((hito) => (
              <div
                key={hito.id}
                className="flex align-items-center justify-content-between p-2 border-round surface-50 border-1 surface-border text-xs"
              >
                <div className="flex align-items-center gap-2">
                  <i className={`${hito.icono} text-sm text-primary`} />
                  <div className="flex flex-column">
                    <span className="font-semibold text-900">{hito.titulo}</span>
                    <span className="text-color-secondary">{hito.fechaFormateada}</span>
                  </div>
                </div>
                <Tag value={hito.tipo} severity={hito.severidad} className="text-xs" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie del widget con reprogramación rápida */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-content-between align-items-center">
        <span className="text-xs text-color-secondary">
          {hitosProximos.length} {hitosProximos.length === 1 ? 'evento escaneado' : 'eventos escaneados'}
        </span>
        <Button
          label="Reprogramar en Calendario"
          icon="pi pi-calendar-plus"
          size="small"
          text
          onClick={() => navigate('/planificacion/calendario-escolar')}
        />
      </div>
    </div>
  );
};

export default WidgetDetectorSobrecarga;
