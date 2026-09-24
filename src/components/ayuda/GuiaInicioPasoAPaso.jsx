import React from 'react';
import TarjetaPasoGuia from './TarjetaPasoGuia.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * GuiaInicioPasoAPaso - Componente presentacional del Onboarding en formato vertical.
 *
 * Responsabilidad Única: Renderizar el flujo completo de configuración mediante
 * una línea vertical conectora con bolas numeradas a la izquierda y el contenido
 * detallado (título, descripción y tareas) expandido a la derecha a pantalla completa.
 */
const GuiaInicioPasoAPaso = ({ pasos = [], onRestablecerFiltros }) => {
  // Si no existen pasos coincidentes con el filtro de búsqueda.
  if (pasos.length === 0) {
    return (
      <EstadoVacio
        icono="pi pi-search-minus"
        mensaje="No se encontraron pasos coincidentes"
        descripcion="No hay pasos en la guía de inicio que coincidan con los términos de búsqueda introducidos."
        botonLabel="Restablecer filtros"
        botonIcono="pi pi-filter-slash"
        onAccion={onRestablecerFiltros}
      />
    );
  }

  return (
    <div className="flex flex-column gap-4 w-full">
      {/* Barra de información del flujo formativo */}
      <div className="surface-ground p-3 md:p-4 border-round border-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-compass text-primary text-xl" />
          <span className="font-bold text-900 text-base">
            Flujo de Puesta en Marcha (Camino Feliz de Configuración Inicial)
          </span>
        </div>
        <span className="text-xs text-color-secondary font-semibold">
          {pasos.length} pasos secuenciales organizados en línea vertical
        </span>
      </div>

      {/* Carril vertical continuo con numeración a la izquierda y tarjeta a la derecha */}
      <div className="flex flex-column w-full pt-2">
        {pasos.map((paso, index) => {
          const esUltimo = index === pasos.length - 1;

          return (
            <div key={paso.numero} className="flex gap-3 md:gap-4 w-full">
              {/* Columna izquierda: Bola con numeración y línea vertical continua */}
              <div className="flex flex-column align-items-center flex-shrink-0" style={{ width: '2.8rem' }}>
                {/* Bola numerada idéntica al stepper de creación de clases */}
                <div
                  className="border-circle flex align-items-center justify-content-center font-bold text-base shadow-1 select-none flex-shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    minWidth: '2.5rem',
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff',
                    border: '2px solid var(--primary-color)',
                    boxShadow: '0 2px 8px rgba(17, 116, 192, 0.3)'
                  }}
                >
                  {paso.numero}
                </div>

                {/* Línea vertical conectora continua entre bolas */}
                {!esUltimo && (
                  <div
                    className="flex-1 my-2"
                    style={{
                      width: '3px',
                      backgroundColor: 'var(--border-color)',
                      minHeight: '2.5rem'
                    }}
                  />
                )}
              </div>

              {/* Columna derecha: Título, descripción y tarjeta a toda la anchura de la pantalla */}
              <div className={`flex-1 w-full ${!esUltimo ? 'pb-5' : 'pb-2'}`}>
                <TarjetaPasoGuia paso={paso} totalPasos={pasos.length} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuiaInicioPasoAPaso;
