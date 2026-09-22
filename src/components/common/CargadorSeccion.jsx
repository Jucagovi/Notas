import React from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * CargadorSeccion - Componente presentacional para animaciones de carga Skeleton unificadas.
 *
 * Responsabilidad Única: Renderizar esqueletos visuales durante peticiones HTTP asíncronas
 * para evitar saltos de diseño (CLS) y unificar la experiencia de carga en todo el ERP.
 *
 * @param {Object} props
 * @param {boolean} [props.cargando=true] - Si es false y se pasan children, renderiza los hijos directamente.
 * @param {'tabla'|'formulario'|'tarjetas'|'lista'} [props.tipo='tabla'] - Estructura visual de esqueletos.
 * @param {number} [props.filas=5] - Cantidad de filas a simular.
 * @param {number} [props.columnas=4] - Cantidad de columnas para el modo tabla o tarjetas.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 * @param {React.ReactNode} [props.children] - Contenido a mostrar cuando cargando sea false.
 */
export const CargadorSeccion = ({
  cargando = true,
  tipo = 'tabla',
  filas = 5,
  columnas = 4,
  className = '',
  children
}) => {
  // Si no está cargando y hay contenido hijo, mostramos directamente dicho contenido
  if (!cargando && children) {
    return <>{children}</>;
  }

  // Renderizado para tablas de datos
  if (tipo === 'tabla') {
    return (
      <div className={`surface-card border-round p-4 border-1 surface-border shadow-1 ${className}`.trim()}>
        {/* Cabecera y barra de búsqueda */}
        <div className="flex justify-content-between align-items-center mb-4">
          <Skeleton width="12rem" height="2rem" />
          <Skeleton width="15rem" height="2.5rem" borderRadius="6px" />
        </div>

        {/* Encabezado de columnas */}
        <div className="flex gap-3 mb-3 pb-2 border-bottom-1 surface-border">
          {Array.from({ length: columnas }).map((_, colIndex) => (
            <Skeleton key={`th-${colIndex}`} width={`${100 / columnas}%`} height="1.8rem" />
          ))}
        </div>

        {/* Filas de datos */}
        <div className="flex flex-column gap-3">
          {Array.from({ length: filas }).map((_, rowIndex) => (
            <div key={`tr-${rowIndex}`} className="flex gap-3 align-items-center py-1">
              {Array.from({ length: columnas }).map((_, colIndex) => (
                <Skeleton
                  key={`td-${rowIndex}-${colIndex}`}
                  width={`${100 / columnas}%`}
                  height="1.4rem"
                  borderRadius="4px"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderizado para formularios de edición
  if (tipo === 'formulario') {
    return (
      <div className={`surface-card border-round p-4 border-1 surface-border shadow-1 flex flex-column gap-4 ${className}`.trim()}>
        <Skeleton width="14rem" height="2rem" className="mb-2" />
        <div className="grid">
          {Array.from({ length: filas }).map((_, index) => (
            <div key={`form-field-${index}`} className="col-12 md:col-6 flex flex-column gap-2 mb-2">
              <Skeleton width="40%" height="1.2rem" />
              <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
            </div>
          ))}
        </div>
        <div className="flex justify-content-end gap-2 mt-3 pt-3 border-top-1 surface-border">
          <Skeleton width="6rem" height="2.5rem" borderRadius="6px" />
          <Skeleton width="8rem" height="2.5rem" borderRadius="6px" />
        </div>
      </div>
    );
  }

  // Renderizado para cuadrícula de tarjetas (KPIs o elementos modulares)
  if (tipo === 'tarjetas') {
    return (
      <div className={`grid ${className}`.trim()}>
        {Array.from({ length: columnas }).map((_, index) => (
          <div key={`card-skeleton-${index}`} className="col-12 sm:col-6 lg:col-3">
            <div className="surface-card border-round p-3 border-1 surface-border shadow-1 flex flex-column gap-3">
              <div className="flex justify-content-between align-items-center">
                <Skeleton width="50%" height="1.2rem" />
                <Skeleton shape="circle" size="2.5rem" />
              </div>
              <Skeleton width="70%" height="2rem" />
              <Skeleton width="40%" height="1rem" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Renderizado para listas de elementos (alumnos, notificaciones, etc.)
  return (
    <div className={`surface-card border-round p-4 border-1 surface-border shadow-1 flex flex-column gap-3 ${className}`.trim()}>
      {Array.from({ length: filas }).map((_, index) => (
        <div key={`list-item-${index}`} className="flex align-items-center gap-3 py-2 border-bottom-1 surface-border">
          <Skeleton shape="circle" size="2.8rem" className="flex-shrink-0" />
          <div className="flex flex-column gap-2 w-full">
            <Skeleton width="50%" height="1.2rem" />
            <Skeleton width="30%" height="0.9rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CargadorSeccion;
