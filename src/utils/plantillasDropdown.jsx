import React from 'react';

// Plantilla visual para las opciones de la lista desplegable de módulos con badge de siglas
export const plantillaOpcionModulo = (opcion) => {
  if (!opcion) return null;
  const siglas = opcion.siglas || (opcion.label && opcion.label.match(/^\[(.*?)\]/)?.[1]);
  const nombre = opcion.nombre || (opcion.label ? opcion.label.replace(/^\[.*?\]\s*/, '') : '') || opcion.label;

  return (
    <div className="flex align-items-center gap-2 py-1">
      {siglas && (
        <span className="font-bold text-xs bg-primary-100 text-primary border-round px-2 py-1 flex-shrink-0">
          {siglas}
        </span>
      )}
      <span className="font-semibold text-sm">{nombre}</span>
    </div>
  );
};

// Plantilla visual para el valor seleccionado de módulo en el input cerrado del Dropdown
export const plantillaValorModulo = (opcion, props) => {
  if (opcion) {
    const siglas = opcion.siglas || (opcion.label && opcion.label.match(/^\[(.*?)\]/)?.[1]);
    const nombre = opcion.nombre || (opcion.label ? opcion.label.replace(/^\[.*?\]\s*/, '') : '') || opcion.label;

    return (
      <div className="flex align-items-center gap-2">
        {siglas && (
          <span className="font-bold text-xs bg-primary-100 text-primary border-round px-1 py-0 flex-shrink-0">
            {siglas}
          </span>
        )}
        <span className="text-sm font-semibold text-color">{nombre}</span>
      </div>
    );
  }
  return <span>{props?.placeholder || ''}</span>;
};
