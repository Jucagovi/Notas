import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente para la selección de práctica y filtros de curso y módulo profesional
const CriteriosFiltros = ({
  cursos = [],
  modulosDisponibles = [],
  practicasDisponibles = [],
  cursoSeleccionadoId,
  setCursoSeleccionadoId,
  moduloSeleccionadoId,
  setModuloSeleccionadoId,
  practicaSeleccionadaId,
  seleccionarPractica,
  practicaSeleccionada,
  totalCEs = 0,
  totalSeleccionados = 0,
  marcarTodosLosCriterios,
  desmarcarTodosLosCriterios,
  restablecerSelecciones,
  hayCambiosSinGuardar = false,
  cargando = false,
  cargandoPracticas = false,
  recargar
}) => {
  // Opciones para el desplegable de Cursos Académicos ordenados por fecha de creación descendente (más reciente primero)
  const opcionesCursos = useMemo(() => {
    const cursosOrdenados = [...(cursos || [])].sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });

    return cursosOrdenados.map((c) => ({
      label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones para el desplegable de Módulos Profesionales (sólo los que se imparten en el curso seleccionado)
  const opcionesModulos = useMemo(() => {
    return (modulosDisponibles || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo,
      siglas: m.siglas,
      nombre: m.nombre
    }));
  }, [modulosDisponibles]);

  // Opciones para el desplegable de Prácticas a Mapear (sólo las asignadas a alguna evaluación del módulo y curso)
  const opcionesPracticas = useMemo(() => {
    return (practicasDisponibles || []).map((p) => ({
      label: `${p.numero ? `${p.numero}. ` : ''}${p.nombre}`,
      value: p.id_practica,
      practica: p
    }));
  }, [practicasDisponibles]);

  // Plantilla para cada elemento de la lista desplegable de prácticas (sólo icono, número y nombre)
  const itemPracticaTemplate = (opcion) => {
    if (!opcion) return null;
    const { practica } = opcion;

    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-file-edit text-primary text-sm" />
        <span className="text-sm">
          {practica?.numero ? `${practica.numero}. ` : ''}{practica?.nombre}
        </span>
      </div>
    );
  };

  // Plantilla para el valor seleccionado en el desplegable de prácticas
  const valuePracticaTemplate = (opcion, props) => {
    if (!opcion) {
      return <span className="text-muted text-sm">{props.placeholder}</span>;
    }
    const practica = opcion.practica || opcion;

    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-file-edit text-primary text-sm" />
        <span className="font-semibold text-sm">
          {practica?.numero ? `${practica.numero}. ` : ''}{practica?.nombre}
        </span>
      </div>
    );
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
      {/* Fila de selectores en cascada: Curso -> Módulo -> Práctica */}
      <div className="grid align-items-center">
        {/* Desplegable de Curso Académico */}
        <div className="col-12 md:col-3">
          <label htmlFor="filtro-criterios-curso" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-calendar mr-1" /> Curso Académico:
          </label>
          <Dropdown
            id="filtro-criterios-curso"
            value={cursoSeleccionadoId}
            options={opcionesCursos}
            onChange={(e) => {
              setCursoSeleccionadoId(e.value || null);
              setModuloSeleccionadoId(null);
              seleccionarPractica(null);
            }}
            placeholder="Seleccione un curso..."
            showClear
            filter
            className="w-full text-sm"
          />
        </div>

        {/* Desplegable de Módulo Profesional (filtrado estrictamente por el curso) */}
        <div className="col-12 md:col-3">
          <label htmlFor="filtro-criterios-modulo" className="block text-sm font-semibold mb-1 text-muted">
            <i className="pi pi-book mr-1" /> Módulo Profesional:
          </label>
          <Dropdown
            id="filtro-criterios-modulo"
            value={moduloSeleccionadoId}
            options={opcionesModulos}
            itemTemplate={plantillaOpcionModulo}
            valueTemplate={plantillaValorModulo}
            filterBy="label,siglas,nombre"
            onChange={(e) => {
              setModuloSeleccionadoId(e.value || null);
              seleccionarPractica(null);
            }}
            placeholder={
              !cursoSeleccionadoId
                ? 'Seleccione primero un curso...'
                : opcionesModulos.length === 0
                ? 'No hay módulos en este curso'
                : 'Seleccione un módulo...'
            }
            disabled={!cursoSeleccionadoId || opcionesModulos.length === 0}
            showClear
            filter
            className="w-full text-sm"
          />
        </div>

        {/* Desplegable Principal de Prácticas a Mapear (filtrado por evaluaciones del curso y módulo) */}
        <div className="col-12 md:col-6">
          <label htmlFor="select-practica-criterios" className="block text-sm font-semibold mb-1 text-primary">
            <i className="pi pi-file-edit mr-1" /> Prácticas a mapear (*):
          </label>
          <Dropdown
            id="select-practica-criterios"
            value={practicaSeleccionadaId}
            options={opcionesPracticas}
            onChange={(e) => seleccionarPractica(e.value || null)}
            itemTemplate={itemPracticaTemplate}
            valueTemplate={valuePracticaTemplate}
            placeholder={
              !cursoSeleccionadoId
                ? 'Seleccione primero un curso...'
                : !moduloSeleccionadoId
                ? 'Seleccione primero un módulo...'
                : cargandoPracticas
                ? 'Cargando prácticas asignadas...'
                : opcionesPracticas.length === 0
                ? 'No hay prácticas asignadas a evaluaciones'
                : 'Seleccione una Práctica...'
            }
            disabled={!cursoSeleccionadoId || !moduloSeleccionadoId || opcionesPracticas.length === 0 || cargandoPracticas}
            showClear
            filter
            filterBy="label"
            className="w-full font-semibold"
          />
        </div>
      </div>

      {/* Fila de detalles y acciones rápidas cuando una práctica está seleccionada */}
      {practicaSeleccionada && (
        <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-2 border-top-1 surface-border">
          {/* Etiquetas informativas del estado de selección */}
          <div className="flex flex-wrap align-items-center gap-2">
            {practicaSeleccionada.unidad && (
              <Tag
                severity="secondary"
                icon="pi pi-folder"
                value={`Unidad ${practicaSeleccionada.unidad}`}
              />
            )}
            {practicaSeleccionada.id_tipopractica && (
              <Tag
                severity="warning"
                icon="pi pi-tag"
                value={practicaSeleccionada.id_tipopractica}
              />
            )}
            <Tag
              severity={totalSeleccionados > 0 ? 'success' : 'secondary'}
              icon="pi pi-check-circle"
              value={`${totalSeleccionados} de ${totalCEs} CE seleccionados`}
            />
            {hayCambiosSinGuardar && (
              <Tag
                severity="danger"
                icon="pi pi-exclamation-triangle"
                value="Cambios sin guardar"
              />
            )}
          </div>

          {/* Botones de acción masiva rápida */}
          <div className="flex align-items-center gap-2 justify-content-end">
            <Button
              type="button"
              label="Marcar todos (100%)"
              icon="pi pi-check-square"
              size="small"
              severity="success"
              text
              disabled={cargando || totalCEs === 0}
              onClick={marcarTodosLosCriterios}
            />
            <Button
              type="button"
              label="Desmarcar todos"
              icon="pi pi-stop"
              size="small"
              severity="danger"
              text
              disabled={cargando || totalSeleccionados === 0}
              onClick={desmarcarTodosLosCriterios}
            />
            {hayCambiosSinGuardar && (
              <Button
                type="button"
                label="Restablecer"
                icon="pi pi-undo"
                size="small"
                severity="secondary"
                text
                disabled={cargando}
                onClick={restablecerSelecciones}
              />
            )}
            <Button
              type="button"
              icon="pi pi-refresh"
              size="small"
              severity="secondary"
              text
              loading={cargando}
              onClick={recargar}
              tooltip="Recargar criterios y asignaciones"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriosFiltros;
