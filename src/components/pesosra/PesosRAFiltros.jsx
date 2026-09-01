import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente de cabecera con selectores dependientes para Curso Académico y Módulo Profesional
const PesosRAFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  cursoSeleccionado,
  moduloSeleccionado,
  totalRA = 0,
  totalCE = 0,
  cargando = false,
  recargar = () => {}
}) => {
  // Opciones para el desplegable de Cursos Académicos
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones para el desplegable de Módulos Profesionales
  const opcionesModulos = useMemo(() => {
    return (modulosDisponibles || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo,
      siglas: m.siglas,
      nombre: m.nombre
    }));
  }, [modulosDisponibles]);

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
      {/* Selectores de filtrado principal */}
      <div className="grid align-items-center">
        {/* Selector de Curso */}
        <div className="col-12 md:col-6">
          <label htmlFor="filtro-curso-pesos-ra" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar mr-1" /> Curso Académico:
          </label>
          <Dropdown
            id="filtro-curso-pesos-ra"
            value={cursoSeleccionadoId}
            options={opcionesCursos}
            onChange={(e) => setCursoSeleccionadoId(e.value)}
            placeholder="Seleccione un Curso..."
            showClear
            filter
            className="w-full text-sm font-semibold"
          />
        </div>

        {/* Selector de Módulo */}
        <div className="col-12 md:col-6">
          <label htmlFor="filtro-modulo-pesos-ra" className="block text-sm font-semibold mb-1 text-primary">
            <i className="pi pi-book mr-1" /> Módulo Profesional (*):
          </label>
          <Dropdown
            id="filtro-modulo-pesos-ra"
            value={moduloSeleccionadoId}
            options={opcionesModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            filterBy="label,siglas,nombre"
            onChange={(e) => setModuloSeleccionadoId(e.value)}
            placeholder={
              !cursoSeleccionadoId
                ? 'Primero seleccione un curso'
                : opcionesModulos.length === 0
                ? 'No hay módulos disponibles'
                : 'Seleccione un Módulo...'
            }
            showClear
            filter
            disabled={!cursoSeleccionadoId}
            className="w-full text-sm font-semibold"
          />
        </div>
      </div>

      {/* Resumen contextual del módulo y curso seleccionados */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-2 border-top-1 surface-border">
        <div className="flex flex-wrap align-items-center gap-2">
          {cursoSeleccionado && (
            <Tag
              severity="secondary"
              icon="pi pi-calendar"
              value={`${cursoSeleccionado.nombre} (${cursoSeleccionado.anyo || 'Lectivo'})`}
            />
          )}

          {moduloSeleccionado ? (
            <>
              <Tag
                severity="info"
                icon="pi pi-book"
                value={`${moduloSeleccionado.siglas ? `[${moduloSeleccionado.siglas}] ` : ''}${moduloSeleccionado.nombre}`}
                className="font-bold"
              />
              <Tag
                severity="success"
                icon="pi pi-check-circle"
                value={`${totalRA} RA`}
              />
              <Tag
                severity="secondary"
                icon="pi pi-list-check"
                value={`${totalCE} CE`}
              />
            </>
          ) : (
            <span className="text-sm text-muted">
              Seleccione un módulo profesional para definir y ajustar la ponderación de sus RA y CE.
            </span>
          )}
        </div>

        <div className="flex align-items-center gap-2 justify-content-end">
          <Button
            type="button"
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            text
            loading={cargando}
            onClick={recargar}
            tooltip="Recargar ponderaciones actualizadas"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PesosRAFiltros;
