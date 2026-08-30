import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { obtenerResumenCalificacionesPendientes } from '../../services/informesService.js';

// Componente para la tarjeta de resumen del informe de pendientes ubicada en el Dashboard
const InformePendientesTarjetaDashboard = () => {
  const navigate = useNavigate();

  const [resumen, setResumen] = useState({
    totalPendientes: 0,
    evaluacionesAfectadas: 0,
    desglose: []
  });
  const [cargando, setCargando] = useState(true);

  // Carga de los datos agregados de calificaciones pendientes
  useEffect(() => {
    let activo = true;

    const cargarResumen = async () => {
      try {
        const datos = await obtenerResumenCalificacionesPendientes();
        if (activo) {
          setResumen(datos);
        }
      } catch (err) {
        console.error('Error al cargar resumen de pendientes para el Dashboard:', err);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarResumen();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="mb-4">
        <Skeleton width="100%" height="110px" borderRadius="8px" />
      </div>
    );
  }

  const tienePendientes = resumen.totalPendientes > 0;

  return (
    <div className="mb-4">
      <Card
        className="shadow-1 border-round surface-card"
        title={
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
            <div className="flex align-items-center gap-2">
              <div
                className="flex align-items-center justify-content-center border-round"
                style={{
                  width: '2.4rem',
                  height: '2.4rem',
                  backgroundColor: tienePendientes ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)'
                }}
              >
                <i
                  className={`pi ${tienePendientes ? 'pi-clock text-orange-500' : 'pi-check-circle text-green-500'} text-lg font-bold`}
                />
              </div>
              <div>
                <span className="font-bold text-base text-color">Control de Calificaciones Pendientes</span>
                <p className="text-muted text-xs m-0 mt-1 font-normal">
                  Supervisión de prácticas sin evaluar antes del cierre oficial de convocatorias.
                </p>
              </div>
            </div>

            <div className="flex align-items-center gap-2">
              <Badge
                value={resumen.totalPendientes}
                severity={tienePendientes ? 'warning' : 'success'}
              />
              <Tag
                value={tienePendientes ? 'Actas Incompletas' : 'Actas al Día'}
                severity={tienePendientes ? 'warning' : 'success'}
                className="text-xs"
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 pt-2">
          {/* Mensaje descriptivo y desglose */}
          <div className="flex-1">
            {tienePendientes ? (
              <div>
                <p className="m-0 text-sm text-color">
                  Se han detectado{' '}
                  <span className="font-bold text-orange-600">{resumen.totalPendientes}</span>{' '}
                  calificaciones sin registrar en{' '}
                  <span className="font-bold">{resumen.evaluacionesAfectadas}</span>{' '}
                  {resumen.evaluacionesAfectadas === 1 ? 'convocatoria evaluativa' : 'convocatorias evaluativas'}.
                </p>
                {resumen.desglose && resumen.desglose.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resumen.desglose.slice(0, 3).map((item) => (
                      <Tag
                        key={item.id_evaluacion}
                        value={`${item.modulo || 'Módulo'}: ${item.pendientes} pendientes`}
                        severity="secondary"
                        className="text-xs"
                      />
                    ))}
                    {resumen.desglose.length > 3 && (
                      <span className="text-xs text-muted self-center">
                        +{resumen.desglose.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex align-items-center gap-2 text-green-600 font-medium text-sm">
                <i className="pi pi-check" />
                <span>¡Todo al día! Todas las prácticas asignadas a las evaluaciones cuentan con calificación registrada.</span>
              </div>
            )}
          </div>

          {/* Botones de acción rápida */}
          <div className="flex align-items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              label="Ver Informe Completo"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="small"
              severity="secondary"
              outlined
              onClick={() => navigate('/informes/calificaciones-pendientes')}
              aria-label="Ir al informe completo de calificaciones pendientes"
            />
            {tienePendientes && (
              <Button
                type="button"
                label="Calificar"
                icon="pi pi-pencil"
                size="small"
                severity="primary"
                onClick={() => navigate('/calificar')}
                aria-label="Ir a calificar prácticas"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InformePendientesTarjetaDashboard;
