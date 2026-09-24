import React from 'react';
import { Button } from 'primereact/button';
import ListaIndiceManual from './ListaIndiceManual.jsx';
import VisorTemaManual from './VisorTemaManual.jsx';
import CuadriculaTarjetasManual from './CuadriculaTarjetasManual.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';

/**
 * ManualModulosComplejos - Componente presentacional para el Manual de Módulos Complejos.
 *
 * Responsabilidad Única: Orquestar la visualización del manual técnico sin utilizar acordeones,
 * ofreciendo un diseño Maestro-Detalle tipo documentación oficial y un modo alternativo
 * de cuadrícula de tarjetas, con botones independientes y espaciado homogéneo.
 */
const ManualModulosComplejos = ({
  temas = [],
  temaSeleccionadoId,
  onSeleccionarTema,
  temaSeleccionado,
  modoVistaManual = 'maestroDetalle',
  onCambiarModoVista,
  onRestablecerFiltros
}) => {
  // En caso de no existir temas coincidentes con el filtro o categoría.
  if (temas.length === 0) {
    return (
      <EstadoVacio
        icono="pi pi-search-minus"
        mensaje="No se encontraron artículos del manual"
        descripcion="No hay preguntas ni conceptos técnicos que coincidan con los criterios de búsqueda o categoría seleccionada."
        botonLabel="Restablecer filtros"
        botonIcono="pi pi-filter-slash"
        onAccion={onRestablecerFiltros}
      />
    );
  }

  return (
    <div className="flex flex-column gap-4 w-full">
      {/* Barra de control superior con alternancia de vista en botones separados */}
      <div className="surface-ground p-3 md:p-4 border-round border-1 surface-border flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-book text-primary text-xl" />
          <span className="font-bold text-900 text-base">
            Manual de Referencia y Preguntas Frecuentes
          </span>
          <span className="text-xs text-color-secondary font-medium ml-2">
            ({temas.length} tema{temas.length > 1 ? 's' : ''})
          </span>
        </div>

        {/* Botones independientes para Maestro-Detalle y Cuadrícula con espaciado */}
        <div className="flex align-items-center gap-2">
          <span className="text-xs font-semibold text-color-secondary uppercase mr-1">
            Formato:
          </span>
          <div className="flex align-items-center gap-2">
            <Button
              label="Maestro-Detalle"
              icon="pi pi-list"
              size="small"
              severity={modoVistaManual === 'maestroDetalle' ? 'primary' : 'secondary'}
              outlined={modoVistaManual !== 'maestroDetalle'}
              onClick={() => onCambiarModoVista('maestroDetalle')}
              className="font-semibold text-xs px-3 py-2"
            />
            <Button
              label="Cuadrícula"
              icon="pi pi-th-large"
              size="small"
              severity={modoVistaManual === 'tarjetas' ? 'primary' : 'secondary'}
              outlined={modoVistaManual !== 'tarjetas'}
              onClick={() => onCambiarModoVista('tarjetas')}
              className="font-semibold text-xs px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Modo 1: Maestro-Detalle de dos columnas (Recomendada) */}
      {modoVistaManual === 'maestroDetalle' && (
        <div className="grid">
          {/* Columna lateral: Índice de artículos sin bordes blancos */}
          <div className="col-12 lg:col-4 xl:col-3">
            <div className="surface-card border-round shadow-1 p-3 md:p-4 border-1 surface-border">
              <ListaIndiceManual
                temas={temas}
                temaSeleccionadoId={temaSeleccionadoId}
                onSeleccionarTema={onSeleccionarTema}
              />
            </div>
          </div>

          {/* Columna principal: Visor de lectura a pantalla completa */}
          <div className="col-12 lg:col-8 xl:col-9">
            <VisorTemaManual tema={temaSeleccionado} />
          </div>
        </div>
      )}

      {/* Modo 2: Cuadrícula de tarjetas */}
      {modoVistaManual === 'tarjetas' && (
        <CuadriculaTarjetasManual
          temas={temas}
          onVerTema={(id) => {
            onSeleccionarTema(id);
            onCambiarModoVista('maestroDetalle');
          }}
        />
      )}
    </div>
  );
};

export default ManualModulosComplejos;
