import React from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * WidgetMapaTactico - Componente presentacional para orientar el siguiente paso en el aula.
 *
 * Responsabilidad Única: Renderizar una lista compacta de los módulos formativos activos
 * señalando la Unidad de Trabajo en curso, sesiones restantes y la unidad planificada inmediata.
 *
 * @param {Object} props
 * @param {Array<Object>} props.modulosTacticos - Colección de módulos con sus UTs actuales y siguientes.
 */
export const WidgetMapaTactico = ({ modulosTacticos = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-compass text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Mapa Táctico</h2>
              <span className="text-xs text-color-secondary">Posición actual y siguiente paso formativo</span>
            </div>
          </div>
          <Button
            label="Temporización"
            icon="pi pi-calendar-times"
            size="small"
            outlined
            onClick={() => navigate('/temporizacion')}
            tooltip="Ver programación completa"
            tooltipOptions={{ position: 'top' }}
          />
        </div>

        {/* Lista de módulos activos */}
        {modulosTacticos.length === 0 ? (
          <EstadoVacio
            mensaje="Sin módulos activos"
            descripcion="No se han encontrado Unidades de Trabajo temporizadas para este curso."
            icono="pi pi-folder-open"
            className="my-2 p-4"
          />
        ) : (
          <div className="flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '340px' }}>
            {modulosTacticos.map((item) => {
              const { utActual, utProxima } = item;
              const tieneFinPrevisto = Boolean(utActual?.fechaFinPrevista);

              return (
                <div
                  key={item.id_modulo}
                  className="surface-50 p-3 border-round border-1 surface-border flex flex-column gap-2"
                >
                  {/* Encabezado del módulo */}
                  <div className="flex align-items-center justify-content-between">
                    <div className="flex align-items-center gap-2">
                      <span className="font-bold text-sm text-900">{item.siglas}</span>
                      {item.cicloSiglas && (
                        <span className="text-xs text-color-secondary font-medium">
                          ({item.cicloSiglas})
                        </span>
                      )}
                    </div>
                    <Tag
                      value={utActual ? utActual.estado : 'Sin datos'}
                      severity={utActual?.estado === 'En Curso' ? 'info' : (utActual?.estado === 'Completada' ? 'success' : 'warning')}
                      className="text-xs"
                    />
                  </div>

                  {/* Unidad de Trabajo en curso */}
                  {utActual ? (
                    <div className="flex flex-column gap-1 text-xs">
                      <div className="flex align-items-center gap-2 flex-wrap">
                        <span className="font-semibold text-primary">
                          UT {utActual.numero}: {utActual.nombre}
                        </span>
                        <span className="surface-200 text-700 px-2 py-1 border-round font-medium">
                          Quedan {utActual.sesionesRestantes} {utActual.sesionesRestantes === 1 ? 'sesión' : 'sesiones'}
                        </span>
                      </div>

                      {tieneFinPrevisto && (
                        <span className="text-color-secondary text-xs">
                          Límite previsto: {utActual.fechaFinPrevista}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-color-secondary italic">
                      Sin unidades planificadas.
                    </span>
                  )}

                  {/* Siguiente paso en el aula */}
                  <div className="pt-2 border-top-1 surface-border flex align-items-center gap-2 text-xs">
                    <i className="pi pi-arrow-right text-primary text-xs" />
                    <span className="text-color-secondary font-medium">Próxima:</span>
                    {utProxima ? (
                      <span className="text-800 font-semibold truncate" title={`UT ${utProxima.numero}: ${utProxima.nombre}`}>
                        UT {utProxima.numero} ({utProxima.nombre})
                      </span>
                    ) : (
                      <span className="text-color-secondary italic">
                        Última unidad curricular programada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie del widget con enlace */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-between align-items-center">
        <span className="text-xs text-color-secondary">
          {modulosTacticos.length} {modulosTacticos.length === 1 ? 'módulo supervisado' : 'módulos supervisados'}
        </span>
        <Button
          label="Gestionar Unidades"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={() => navigate('/unidades')}
        />
      </div>
    </div>
  );
};

export default WidgetMapaTactico;
