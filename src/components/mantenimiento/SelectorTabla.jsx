import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { TABLAS_MAESTRAS, TABLAS_RELACIONES } from './configuracionTablas.js';

// Selector interactivo para alternar ágilmente entre las tablas del catálogo de mantenimiento.
const SelectorTabla = ({ tablaActivaSlug, esRelacion = false }) => {
  const navigate = useNavigate();
  const catalogo = esRelacion ? TABLAS_RELACIONES : TABLAS_MAESTRAS;

  const opciones = Object.values(catalogo).map((t) => ({
    label: t.titulo,
    value: t.slug,
    icono: t.icono,
    ruta: t.rutaBase
  }));

  const manejarCambio = (slugSeleccionado) => {
    const item = opciones.find((op) => op.value === slugSeleccionado);
    if (item) {
      navigate(item.ruta);
    }
  };

  const plantillaOpcion = (opcion) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={`${opcion.icono} text-primary`} />
        <span>{opcion.label}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2 mb-3 surface-50 p-2 border-round">
      <div className="text-sm font-semibold text-700 flex align-items-center gap-2">
        <i className="pi pi-compass text-primary" />
        <span>Navegación Rápida de Tablas:</span>
      </div>
      <div className="w-full sm:w-20rem">
        <Dropdown
          value={tablaActivaSlug}
          options={opciones}
          onChange={(e) => manejarCambio(e.value)}
          itemTemplate={plantillaOpcion}
          valueTemplate={(opcion, props) => {
            if (!opcion) return <span>{props.placeholder}</span>;
            return plantillaOpcion(opcion);
          }}
          placeholder="Seleccionar tabla a gestionar"
          className="w-full p-inputtext-sm"
        />
      </div>
    </div>
  );
};

export default SelectorTabla;
