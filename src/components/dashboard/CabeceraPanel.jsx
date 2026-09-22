import React from 'react';
import { Button } from 'primereact/button';
import HeaderPagina from '../common/HeaderPagina.jsx';
import SelectorCurso from '../common/SelectorCurso.jsx';

// Cabecera del panel de control con título, selector de curso y botón de refresco de métricas.
const CabeceraPanel = ({
  cursos = [],
  cursoSeleccionadoId = null,
  onCambiarCurso = () => {},
  onActualizar = () => {},
  cargando = false
}) => {
  const acciones = (
    <div className="flex flex-wrap align-items-center gap-2">
      <div className="flex align-items-center gap-2">
        <label
          htmlFor="filtro-curso-dashboard"
          className="text-xs font-bold text-muted uppercase"
        >
          Curso:
        </label>
        <SelectorCurso
          id="filtro-curso-dashboard"
          value={cursoSeleccionadoId}
          options={cursos}
          onChange={(e) => onCambiarCurso(e.value)}
          placeholder="Todos los cursos"
          className="w-full sm:w-18rem p-inputtext-sm"
          showClear
          disabled={cargando}
          loading={cargando}
          aria-label="Filtrar estadísticas por curso académico"
        />
      </div>

      <Button
        type="button"
        icon="pi pi-refresh"
        label="Actualizar"
        size="small"
        outlined
        loading={cargando}
        onClick={onActualizar}
        aria-label="Actualizar datos del panel"
      />
    </div>
  );

  return (
    <HeaderPagina
      titulo="Panel de control"
      descripcion="Resumen estadístico del rendimiento académico, métricas globales y alertas de seguimiento."
      acciones={acciones}
      className="mb-3"
    />
  );
};

export default CabeceraPanel;
