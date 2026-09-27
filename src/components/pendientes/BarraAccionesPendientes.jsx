import React from 'react';
import { Button } from 'primereact/button';

/**
 * BarraAccionesPendientes - Componente presentacional para alternar entre las dos modalidades de visualización.
 *
 * Responsabilidad Única: Mostrar el indicador de total de calificaciones pendientes en texto destacado
 * (sin componente Tag) y renderizar a la derecha los dos botones para alternar entre la vista agrupada por prácticas
 * y la vista agrupada por discentes.
 *
 * @param {Object} props
 * @param {'practicas'|'discentes'} props.modoVista - Modalidad activa de visualización.
 * @param {Function} props.onCambioModo - Manejador para cambiar la modalidad activa.
 * @param {number} props.totalPendientes - Recuento total de notas pendientes.
 * @param {number} props.totalGrupos - Recuento de elementos en la agrupación activa.
 */
export const BarraAccionesPendientes = ({
  modoVista = 'practicas',
  onCambioModo,
  totalPendientes = 0,
  totalGrupos = 0
}) => {
  return (
    <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 mb-3 p-2 surface-card border-round border-1 surface-border shadow-1">
      {/* Indicador informativo a la izquierda en texto destacado (sin Tag) */}
      <div className="flex align-items-center gap-2">
        <i className="pi pi-list text-primary font-bold text-lg" />
        <span className="font-semibold text-700 text-sm md:text-base">
          Desglose de pendientes:
        </span>
        <span className="font-bold text-orange-600 text-base md:text-lg">
          {totalPendientes} {totalPendientes === 1 ? 'nota' : 'notas'}
        </span>
        <span className="text-xs text-color-secondary hidden md:inline">
          ({totalGrupos} {modoVista === 'practicas' ? 'prácticas' : 'discentes'})
        </span>
      </div>

      {/* Botones de selección de modo situados a la derecha */}
      <div className="flex align-items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-content-end">
        <Button
          label="Por prácticas"
          icon="pi pi-bookmark"
          size="small"
          severity={modoVista === 'practicas' ? 'primary' : 'secondary'}
          outlined={modoVista !== 'practicas'}
          onClick={() => onCambioModo('practicas')}
          className="p-button-sm text-xs font-semibold"
          aria-label="Agrupar listado por prácticas"
        />
        <Button
          label="Por discentes"
          icon="pi pi-users"
          size="small"
          severity={modoVista === 'discentes' ? 'primary' : 'secondary'}
          outlined={modoVista !== 'discentes'}
          onClick={() => onCambioModo('discentes')}
          className="p-button-sm text-xs font-semibold"
          aria-label="Agrupar listado por discentes"
        />
      </div>
    </div>
  );
};

export default BarraAccionesPendientes;
