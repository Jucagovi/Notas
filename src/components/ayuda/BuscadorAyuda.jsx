import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

/**
 * BuscadorAyuda - Componente presentacional para el filtrado rápido en el Centro de Ayuda.
 *
 * Responsabilidad Única: Capturar el término de búsqueda y proporcionar
 * botones independientes con espaciado uniforme para filtrar por categorías en el manual.
 */
const BuscadorAyuda = ({
  terminoBusqueda,
  onCambiarBusqueda,
  onLimpiarBusqueda,
  categoriaSeleccionada,
  onSeleccionarCategoria,
  categoriasDisponibles = [],
  mostrarCategorias = false,
  totalCoincidencias = 0
}) => {
  return (
    <div className="surface-card p-3 md:p-4 border-round shadow-1 border-1 surface-border mb-3 flex flex-column gap-3">
      <div className="flex flex-column md:flex-row align-items-stretch md:align-items-center justify-content-between gap-2">
        <div className="p-input-icon-left flex-1">
          <i className="pi pi-search text-color-secondary" />
          <InputText
            value={terminoBusqueda}
            onChange={(e) => onCambiarBusqueda(e.target.value)}
            placeholder="Buscar por concepto, tabla o módulo (ej. ITACA, temporización, RA, pesos)..."
            className="w-full"
          />
        </div>

        {terminoBusqueda && (
          <div className="flex align-items-center gap-2">
            <span className="text-xs text-color-secondary font-medium">
              {totalCoincidencias} resultado(s)
            </span>
            <Button
              icon="pi pi-times"
              label="Limpiar"
              size="small"
              text
              severity="secondary"
              onClick={onLimpiarBusqueda}
              className="px-3 py-2"
            />
          </div>
        )}
      </div>

      {mostrarCategorias && categoriasDisponibles.length > 0 && (
        <div className="flex flex-column sm:flex-row sm:align-items-center gap-2 pt-2 border-top-1 surface-border">
          <span className="text-xs font-semibold text-color-secondary uppercase mr-1 white-space-nowrap">
            Categorías:
          </span>
          <div className="flex align-items-center gap-2 flex-wrap">
            {categoriasDisponibles.map((categoria) => {
              const estaActiva = categoriaSeleccionada === categoria;
              return (
                <Button
                  key={categoria}
                  label={categoria}
                  size="small"
                  severity={estaActiva ? 'primary' : 'secondary'}
                  outlined={!estaActiva}
                  onClick={() => onSeleccionarCategoria(categoria)}
                  className="font-semibold text-xs px-3 py-2"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorAyuda;
