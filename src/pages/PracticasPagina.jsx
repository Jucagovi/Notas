import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import useAsignacionPracticas from '../hooks/useAsignacionPracticas.js';
import useToast from '../hooks/useToast.js';
import { ordenarEvaluaciones } from '../services/evaluacionService.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../utils/plantillasDropdown.jsx';

// Componente principal para la asignación de prácticas a periodos de evaluación
const PracticasPagina = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  const {
    cursos,
    modulosDisponibles,
    todasEvaluaciones,
    evaluacionesFiltradas,
    evaluacionSeleccionada,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    practicasDisponibles,
    practicasEvaluacion,
    idsPracticasAsignadas,
    cargando,
    guardandoLote,
    alternarPractica,
    vincularTodasPracticas,
    desvincularTodasPracticas,
    recargar
  } = useAsignacionPracticas();

  // Estados locales para filtrado y diálogo de detalle
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas' | 'asignadas' | 'no_asignadas'
  const [practicaDetalle, setPracticaDetalle] = useState(null);
  const [dialogoDetalleVisible, setDialogoDetalleVisible] = useState(false);

  // Opciones para el desplegable de Cursos
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones para el desplegable de Módulos
  const opcionesModulos = useMemo(() => {
    return (modulosDisponibles || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo,
      siglas: m.siglas,
      nombre: m.nombre
    }));
  }, [modulosDisponibles]);

  // Opciones para el desplegable de Evaluaciones ordenadas cronológicamente
  const opcionesEvaluaciones = useMemo(() => {
    const lista = (evaluacionesFiltradas && evaluacionesFiltradas.length > 0)
      ? evaluacionesFiltradas
      : todasEvaluaciones;

    return ordenarEvaluaciones(lista || []).map((ev) => {
      const nombreModulo = ev.Modulos?.siglas || ev.Modulos?.nombre || 'Módulo';
      const nombreCurso = ev.Cursos?.nombre ? ` - ${ev.Cursos.nombre}` : '';
      return {
        label: `${ev.nombre} Evaluación - ${nombreModulo}${nombreCurso}`,
        value: ev.id_evaluacion
      };
    });
  }, [evaluacionesFiltradas, todasEvaluaciones]);

  // Construcción de la lista de prácticas con la propiedad reactiva 'asignada'
  const practicasConEstado = useMemo(() => {
    return (practicasDisponibles || []).map((p) => ({
      ...p,
      asignada: idsPracticasAsignadas.has(String(p.id_practica).toLowerCase())
    }));
  }, [practicasDisponibles, idsPracticasAsignadas]);

  // Filtrado de prácticas según texto de búsqueda y estado de vinculación
  const practicasFiltradas = useMemo(() => {
    return practicasConEstado.filter((p) => {
      const coincideTexto =
        !filtroTexto.trim() ||
        (p.nombre && p.nombre.toLowerCase().includes(filtroTexto.toLowerCase())) ||
        (p.numero && p.numero.toString().includes(filtroTexto)) ||
        (p.unidad && p.unidad.toLowerCase().includes(filtroTexto.toLowerCase()));

      if (!coincideTexto) return false;

      if (filtroEstado === 'asignadas') return p.asignada;
      if (filtroEstado === 'no_asignadas') return !p.asignada;

      return true;
    });
  }, [practicasConEstado, filtroTexto, filtroEstado]);

  // Manejo de la conmutación de estado de una práctica en la evaluación
  const manejarCambioEstadoPractica = async (practica) => {
    const mensajeProceso = practica.asignada
      ? `Desvinculando "${practica.nombre}" de la evaluación...`
      : `Vinculando "${practica.nombre}" a la evaluación...`;

    mostrarInfo('Actualizando base de datos', mensajeProceso);

    const resultado = await alternarPractica(practica);
    if (resultado.exito) {
      mostrarExito('Operación exitosa', resultado.mensaje);
    } else {
      mostrarError('Error en la asignación', resultado.error || 'No se pudo actualizar el registro.');
    }
  };

  // Manejo de la vinculación masiva de todas las prácticas disponibles
  const manejarVincularTodas = async () => {
    mostrarInfo('Asignación masiva', 'Vinculando todas las prácticas a la evaluación...');
    const resultado = await vincularTodasPracticas();
    if (resultado.exito) {
      mostrarExito('Asignación masiva completada', resultado.mensaje);
    } else {
      mostrarError('Error', resultado.error || 'No se pudieron vincular todas las prácticas.');
    }
  };

  // Manejo de la desvinculación masiva de todas las prácticas
  const manejarDesvincularTodas = async () => {
    mostrarInfo('Desvinculación masiva', 'Desvinculando todas las prácticas de la evaluación...');
    const resultado = await desvincularTodasPracticas();
    if (resultado.exito) {
      mostrarExito('Desvinculación completada', resultado.mensaje);
    } else {
      mostrarError('Error', resultado.error || 'No se pudieron desvincular las prácticas.');
    }
  };

  // Renderizado del pie del modal de detalle de práctica
  const footerDialogoDetalle = (
    <div className="flex justify-content-end">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        severity="secondary"
        text
        onClick={() => setDialogoDetalleVisible(false)}
      />
    </div>
  );

  return (
    <div className="page-container">
      {/* Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Asignación de Prácticas</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Asigne las prácticas que formarán parte de cada convocatoria evaluativa como paso previo a la asignación de Criterios de Evaluación (CE).
          </p>
        </div>
        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            label="Ir a Asignación CE"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="small"
            severity="secondary"
            outlined
            onClick={() => navigate('/criterios')}
            tooltip="Continuar con el mapeo de Criterios de Evaluación y Resultados de Aprendizaje"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      <Divider />

      {/* Sección de Selección y Filtros Principales */}
      <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
        <div className="grid align-items-center">
          {/* Desplegable de Curso (Filtro auxiliar) */}
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-curso" className="block text-sm font-semibold mb-1 text-muted">
              <i className="pi pi-calendar mr-1" /> Curso Académico:
            </label>
            <Dropdown
              id="filtro-curso"
              value={cursoSeleccionadoId}
              options={opcionesCursos}
              onChange={(e) => {
                setCursoSeleccionadoId(e.value);
                if (evaluacionSeleccionada && evaluacionSeleccionada.id_curso !== e.value) {
                  seleccionarEvaluacion(null);
                }
              }}
              placeholder="Todos los cursos..."
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Desplegable de Módulo (Filtro auxiliar) */}
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-modulo" className="block text-sm font-semibold mb-1 text-muted">
              <i className="pi pi-book mr-1" /> Módulo Profesional:
            </label>
            <Dropdown
              id="filtro-modulo"
              value={moduloSeleccionadoId}
              options={opcionesModulos}
              itemTemplate={plantillaOpcionModulo}
              valueTemplate={plantillaValorModulo}
              filterBy="label,siglas,nombre"
              onChange={(e) => {
                setModuloSeleccionadoId(e.value);
                if (evaluacionSeleccionada && evaluacionSeleccionada.id_modulo !== e.value) {
                  seleccionarEvaluacion(null);
                }
              }}
              placeholder="Todos los módulos..."
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Desplegable Principal de Selección de Evaluación */}
          <div className="col-12 md:col-4">
            <label htmlFor="select-evaluacion-principal" className="block text-sm font-semibold mb-1 text-primary">
              <i className="pi pi-check-square mr-1" /> Periodo de Evaluación (*):
            </label>
            <Dropdown
              id="select-evaluacion-principal"
              value={evaluacionSeleccionadaId}
              options={opcionesEvaluaciones}
              onChange={(e) => seleccionarEvaluacion(e.value)}
              placeholder={
                opcionesEvaluaciones.length === 0
                  ? 'No hay evaluaciones disponibles'
                  : 'Seleccione una Evaluación...'
              }
              showClear
              filter
              className="w-full font-semibold"
            />
          </div>
        </div>

        {/* Resumen de estado cuando se selecciona una evaluación */}
        {evaluacionSeleccionada && (
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pt-2 border-top-1 surface-border">
            <div className="flex flex-wrap align-items-center gap-2">
              <Tag
                severity="info"
                icon="pi pi-bookmark"
                value={`${evaluacionSeleccionada.nombre} Evaluación`}
                className="font-bold"
              />
              <Tag
                severity="secondary"
                icon="pi pi-book"
                value={evaluacionSeleccionada.Modulos?.nombre || 'Módulo'}
              />
              <Tag
                severity="success"
                icon="pi pi-check-circle"
                value={`${practicasEvaluacion.length} de ${practicasDisponibles.length} Prácticas Asignadas`}
              />
            </div>

            <div className="flex align-items-center gap-2 justify-content-end">
              <Button
                type="button"
                label="Asignar todas"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                disabled={cargando || guardandoLote || practicasDisponibles.length === 0}
                loading={guardandoLote}
                onClick={manejarVincularTodas}
              />
              <Button
                type="button"
                label="Deseleccionar todas"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                disabled={cargando || guardandoLote || practicasEvaluacion.length === 0}
                loading={guardandoLote}
                onClick={manejarDesvincularTodas}
              />
              <Button
                type="button"
                icon="pi pi-refresh"
                size="small"
                severity="secondary"
                text
                loading={cargando}
                onClick={recargar}
                tooltip="Recargar listado"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal: Listado de Prácticas */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Cargando catálogo de prácticas de la evaluación...</span>
        </div>
      ) : !evaluacionSeleccionadaId ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <i className="pi pi-calendar-plus text-6xl text-primary mb-3" />
          <h3 className="text-xl font-bold m-0 mb-2">Seleccione una Evaluación</h3>
          <p className="text-muted text-sm m-0 max-w-28rem mb-4">
            Utilice el desplegable superior para elegir la evaluación correspondiente. Se mostrarán las prácticas del módulo para que pueda asignarlas de forma directa.
          </p>
        </div>
      ) : (
        <Card className="shadow-1">
          {/* Barra de herramientas para filtrar prácticas de la tabla */}
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 mb-3">
            <div className="p-input-icon-left w-full sm:w-20rem">
              <i className="pi pi-search" />
              <InputText
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por nombre, número o UD..."
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="flex align-items-center gap-1">
              <span className="text-xs font-semibold text-muted mr-1">Mostrar:</span>
              <Button
                label={`Todas (${practicasDisponibles.length})`}
                size="small"
                text={filtroEstado !== 'todas'}
                severity={filtroEstado === 'todas' ? 'primary' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('todas')}
              />
              <Button
                label={`Asignadas (${practicasEvaluacion.length})`}
                size="small"
                text={filtroEstado !== 'asignadas'}
                severity={filtroEstado === 'asignadas' ? 'success' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('asignadas')}
              />
              <Button
                label={`No asignadas (${practicasDisponibles.length - practicasEvaluacion.length})`}
                size="small"
                text={filtroEstado !== 'no_asignadas'}
                severity={filtroEstado === 'no_asignadas' ? 'warning' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('no_asignadas')}
              />
            </div>
          </div>

          {/* Tabla de Prácticas */}
          <DataTable
            value={practicasFiltradas}
            dataKey="id_practica"
            emptyMessage={
              practicasDisponibles.length === 0
                ? 'No hay prácticas registradas para el módulo de esta evaluación.'
                : 'No se encontraron prácticas con los filtros actuales.'
            }
            className="p-datatable-sm"
            responsiveLayout="scroll"
            stripedRows
          >
            {/* Columna de Asignación con InputSwitch */}
            <Column
              field="asignada"
              header="Incluir"
              style={{ width: '90px', textAlign: 'center' }}
              body={(rowData) => (
                <div className="flex align-items-center justify-content-center">
                  <InputSwitch
                    checked={Boolean(rowData.asignada)}
                    disabled={guardandoLote}
                    onChange={() => manejarCambioEstadoPractica(rowData)}
                    tooltip={rowData.asignada ? 'Quitar de esta evaluación' : 'Asignar a esta evaluación'}
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
              )}
            />

            {/* Columna de Número */}
            <Column
              field="numero"
              header="Nº"
              style={{ width: '80px' }}
              body={(rowData) => (
                <Tag
                  value={rowData.numero ? `${rowData.numero}` : '-'}
                  severity="secondary"
                  className="font-bold text-xs"
                />
              )}
            />

            {/* Columna de Nombre y Enunciado */}
            <Column
              field="nombre"
              header="Nombre de la Práctica"
              body={(rowData) => (
                <div className="flex flex-column gap-1">
                  <span className="font-semibold text-color text-sm">
                    {rowData.nombre}
                  </span>
                  {rowData.enunciado && (
                    <span className="text-xs text-muted line-clamp-1" title={rowData.enunciado}>
                      {rowData.enunciado}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Columna de Unidad Didáctica */}
            <Column
              field="unidad"
              header="Unidad"
              style={{ width: '100px' }}
              body={(rowData) => (
                <Tag
                  value={rowData.unidad ? `UD ${rowData.unidad}` : 'Sin UD'}
                  severity="info"
                  className="text-xs"
                />
              )}
            />

            {/* Columna de Tipo de Práctica */}
            <Column
              field="id_tipopractica"
              header="Tipo"
              style={{ width: '130px' }}
              body={(rowData) => (
                <span className="text-xs text-muted">
                  {rowData.id_tipopractica || '-'}
                </span>
              )}
            />

            {/* Columna de Estado */}
            <Column
              field="asignada"
              header="Estado"
              style={{ width: '130px', textAlign: 'center' }}
              body={(rowData) => (
                <Tag
                  severity={rowData.asignada ? 'success' : 'secondary'}
                  icon={rowData.asignada ? 'pi pi-check' : 'pi pi-minus'}
                  value={rowData.asignada ? 'Asignada' : 'No asignada'}
                  className="text-xs font-semibold"
                />
              )}
            />

            {/* Columna de Acciones */}
            <Column
              header="Detalle"
              style={{ width: '80px', textAlign: 'center' }}
              body={(rowData) => (
                <Button
                  type="button"
                  icon="pi pi-eye"
                  size="small"
                  severity="secondary"
                  text
                  onClick={() => {
                    setPracticaDetalle(rowData);
                    setDialogoDetalleVisible(true);
                  }}
                  tooltip="Ver detalles del enunciado"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
            />
          </DataTable>
        </Card>
      )}

      {/* Modal para ver detalles completos de la práctica */}
      <Dialog
        visible={dialogoDetalleVisible}
        onHide={() => {
          setDialogoDetalleVisible(false);
          setPracticaDetalle(null);
        }}
        header={
          practicaDetalle
            ? `${practicaDetalle.numero ? `${practicaDetalle.numero}. ` : ''}${practicaDetalle.nombre}`
            : 'Detalles de la Práctica'
        }
        footer={footerDialogoDetalle}
        style={{ width: '90vw', maxWidth: '580px' }}
        modal
      >
        {practicaDetalle && (
          <div className="flex flex-column gap-3 pt-1">
            <div className="flex flex-wrap gap-2 align-items-center">
              {practicaDetalle.unidad && (
                <Tag value={`Unidad ${practicaDetalle.unidad}`} severity="info" />
              )}
              {practicaDetalle.id_tipopractica && (
                <Tag value={`Tipo: ${practicaDetalle.id_tipopractica}`} severity="secondary" />
              )}
              <Tag
                severity={idsPracticasAsignadas.has(String(practicaDetalle.id_practica).toLowerCase()) ? 'success' : 'warning'}
                value={
                  idsPracticasAsignadas.has(String(practicaDetalle.id_practica).toLowerCase())
                    ? 'Asignada a esta Evaluación'
                    : 'Pendiente de Asignar'
                }
              />
            </div>

            {practicaDetalle.enunciado && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Enunciado:</span>
                <p className="text-sm text-color m-0 surface-ground p-3 border-round surface-border border-1">
                  {practicaDetalle.enunciado}
                </p>
              </div>
            )}

            {practicaDetalle.descripcion && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Descripción:</span>
                <p className="text-sm text-muted m-0">{practicaDetalle.descripcion}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PracticasPagina;
