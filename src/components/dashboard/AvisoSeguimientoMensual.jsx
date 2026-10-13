import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

/**
 * AvisoSeguimientoMensual - Componente presentacional para el recordatorio
 * de entrega del informe de seguimiento curricular a inicio de mes en el Dashboard.
 *
 * Responsabilidad Única: Detectar si la fecha del sistema se sitúa a primeros de mes
 * (días 1 al 10) y mostrar una tarjeta destacada con acceso directo para generar
 * el Informe de Seguimiento de Programaciones.
 *
 * @param {Object} props
 * @param {boolean} [props.forzarMostrar=false] - Opción para visualizar el aviso independientemente del día.
 */
const AvisoSeguimientoMensual = ({ forzarMostrar = false }) => {
  const navigate = useNavigate();
  const [descartado, setDescartado] = useState(false);

  // Se evalúa si la fecha del sistema corresponde a los primeros 10 días naturales del mes.
  const fechaHoy = new Date();
  const diaMes = fechaHoy.getDate();
  const esInicioDeMes = diaMes <= 10;

  if (descartado || (!esInicioDeMes && !forzarMostrar)) {
    return null;
  }

  // Nombre del mes en curso en castellano.
  const nombreMes = fechaHoy.toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 border-blue-200 bg-blue-50 flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 shadow-1 mb-2">
      <div className="flex align-items-center gap-3">
        <span className="flex w-3rem h-3rem align-items-center justify-content-center bg-blue-500 text-white border-circle flex-shrink-0">
          <i className="pi pi-bell text-xl" />
        </span>
        <div className="flex flex-column">
          <div className="flex align-items-center gap-2">
            <span className="font-bold text-blue-900 text-sm md:text-base">
              Recordatorio Mensual de Cumplimiento Curricular
            </span>
            <span className="text-xs bg-blue-200 text-blue-800 font-bold px-2 py-1 border-round">
              Inicio de mes ({nombreMes})
            </span>
          </div>
          <span className="text-xs md:text-sm text-blue-800 line-height-2 mt-1">
            Recuerda que corresponde confeccionar y entregar el <strong>Informe de Seguimiento de Programación</strong> de este período contrastando las unidades previstas frente a las impartidas.
          </span>
        </div>
      </div>

      <div className="flex align-items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-content-end">
        <Button
          label="Generar Informe"
          icon="pi pi-arrow-right"
          iconPos="right"
          size="small"
          severity="info"
          className="font-bold p-button-sm"
          onClick={() => navigate('/informes/seguimiento')}
        />
        <Button
          icon="pi pi-times"
          text
          rounded
          size="small"
          severity="secondary"
          tooltip="Descartar aviso temporalmente"
          tooltipOptions={{ position: 'bottom' }}
          onClick={() => setDescartado(true)}
          aria-label="Cerrar recordatorio"
        />
      </div>
    </div>
  );
};

export default AvisoSeguimientoMensual;
